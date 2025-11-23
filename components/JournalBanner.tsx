"use client";

import { useEffect, useMemo, useState, memo } from "react";
import Image from "next/image";
import { fetchJournalBanner, JournalBanner as JournalBannerType, normalizeImageUrl } from "@/lib/api";

interface JournalBannerProps {
  initialBanner?: JournalBannerType | null;
  onAnimationNearComplete?: () => void;
}

const isVideoUrl = (url: string) => /\.(mp4|webm|ogg|mov)$/i.test(url);

function JournalBanner({ initialBanner = null, onAnimationNearComplete }: JournalBannerProps) {
  const [banner, setBanner] = useState<JournalBannerType | null>(initialBanner ?? null);
  const [animateWords, setAnimateWords] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (initialBanner) {
      setBanner(initialBanner);
    } else {
      fetchJournalBanner()
        .then((data) => setBanner(data))
        .catch(() => setBanner(null));
    }
  }, [initialBanner]);

  const mediaUrl = useMemo(() => {
    if (!banner?.image) return null;
    return normalizeImageUrl(banner.image);
  }, [banner?.image]);

  const isVideo = useMemo(() => {
    if (!mediaUrl) return false;
    return isVideoUrl(mediaUrl);
  }, [mediaUrl]);

  const words = useMemo(() => {
    // Banner'dan gelen title_line1'i kullan, yoksa "Journal" varsayılanı
    if (!banner?.title_line1) return ["Journal"];
    return banner.title_line1
      .split(/\s+/)
      .map((word) => word.trim())
      .filter(Boolean);
  }, [banner?.title_line1]);

  const joinedWords = useMemo(() => words.join(" "), [words]);

  // Set isMobile on client-side only
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!words.length) {
      setAnimateWords(false);
      return;
    }

    setAnimateWords(false);
    const timeout = window.setTimeout(() => setAnimateWords(true), 60);
    
    // Animasyonun sonuna yakın journal kartlarını göster (hem mobilde hem desktop'ta)
    if (onAnimationNearComplete) {
      // Son kelime için delay: (words.length - 1) * 120ms
      // Duration: 500ms
      // Journal kartları animasyonun %80'inde başlasın, yazı animasyonu devam etsin
      // Daha erken başlat ki yazı animasyonu tamamlanmadan journal kartları gelsin
      const totalAnimationTime = (words.length - 1) * 120 + 500;
      const triggerTime = totalAnimationTime * 0.8; // %80'inde tetikle (daha erken)
      const journalTimeout = window.setTimeout(() => {
        onAnimationNearComplete();
      }, 60 + triggerTime);
      
      return () => {
        window.clearTimeout(timeout);
        window.clearTimeout(journalTimeout);
      };
    }
    
    return () => window.clearTimeout(timeout);
  }, [joinedWords, words.length, onAnimationNearComplete]);

  if (!banner || !mediaUrl) {
    return null;
  }

  return (
    <section
      className={`relative w-full overflow-hidden ${!isMobile ? 'transition-[padding] duration-500 ease-out' : ''}`}
      style={{ 
        padding: isMobile 
          ? "0px" 
          : (animateWords ? "15px" : "0px")
      }}
    >
      <div className="relative w-full overflow-hidden md:rounded-[10px]" style={{ height: "75vh" }}>
        {isVideo ? (
          <video
            src={mediaUrl}
            className="w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            style={{ height: "120%" }}
            preload="auto"
          />
        ) : (
          <Image
            src={mediaUrl}
            alt="Journal Banner"
            priority
            width={1920}
            height={1080}
            quality={95}
            sizes="100vw"
            style={{ height: "120%", width: "100%" }}
            className="object-cover"
          />
        )}

        <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(rgba(0, 0, 0, 0.11) 0%, rgba(0, 0, 0, 0.12) 100%)" }} />

        <div className="absolute inset-0 flex flex-col items-center justify-end px-6 py-8 text-center text-white md:px-10">
          {!!words.length && (
            <h1 className="max-w-4xl text-3xl font-medium uppercase leading-tight md:text-[68px]" style={{ lineHeight: ".9" }}>
              {words.map((word, idx) => (
                <span key={`${word}-${idx}`} className="inline-block" style={{ lineHeight: ".9" }}>
                  <span
                    className="inline-block transition-all duration-500 will-change-transform"
                    style={{
                      transitionDelay: `${idx * 120}ms`,
                      transitionProperty: "opacity, transform, filter",
                      opacity: animateWords ? 1 : 0,
                      transform: animateWords ? "translateY(0)" : "translateY(0.6em)",
                      filter: animateWords ? "blur(0px)" : "blur(6px)",
                    }}
                  >
                    {word}
                  </span>
                  {idx !== words.length - 1 && <span>&nbsp;</span>}
                </span>
              ))}
            </h1>
          )}
        </div>
      </div>
    </section>
  );
}

export default memo(JournalBanner);
