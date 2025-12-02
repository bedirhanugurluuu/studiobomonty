"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { fetchIntroBanner, IntroBanner as IntroBannerType, normalizeImageUrl } from "@/lib/api";

interface IntroBannerProps {
  initialBanner?: IntroBannerType | null;
}

const isVideoUrl = (url: string) => /\.(mp4|webm|ogg|mov)$/i.test(url);

export default function IntroBanner({ initialBanner = null }: IntroBannerProps) {
  const [banner, setBanner] = useState<IntroBannerType | null>(initialBanner ?? null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (initialBanner) {
      setBanner(initialBanner);
    }
  }, [initialBanner]);

  useEffect(() => {
    if (!banner) {
      fetchIntroBanner()
        .then((data) => setBanner(data))
        .catch(() => setBanner(null));
    }
  }, [banner]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const mediaUrl = useMemo(() => {
    if (isMobile && banner?.mobile_image_url) {
      return normalizeImageUrl(banner.mobile_image_url);
    }
    if (banner?.image) {
      return normalizeImageUrl(banner.image);
    }
    return null;
  }, [banner?.image, banner?.mobile_image_url, isMobile]);

  const isVideo = useMemo(() => {
    if (!mediaUrl) return false;
    return isVideoUrl(mediaUrl);
  }, [mediaUrl]);

  const words = useMemo(() => {
    if (!banner?.title_line1) return [];
    return banner.title_line1
      .split(/\s+/)
      .map((word) => word.trim())
      .filter(Boolean);
  }, [banner?.title_line1]);

  const [animateWords, setAnimateWords] = useState(false);
  const joinedWords = useMemo(() => words.join(" "), [words]);

  useEffect(() => {
    if (!words.length) {
      setAnimateWords(false);
      return;
    }

    setAnimateWords(false);
    const timeout = window.setTimeout(() => setAnimateWords(true), 60);
    return () => window.clearTimeout(timeout);
  }, [joinedWords, words.length]);

  if (!banner || !mediaUrl) {
    return (
      <section className="relative flex min-h-[70vh] w-full items-center justify-center bg-neutral-900 text-white">
        <div className="text-center space-y-4 px-6">
          <h1 className="text-3xl font-semibold">Intro banner henüz hazırlanmadı.</h1>
          <p className="text-sm opacity-60">
            Admin panelden bir intro banner eklediğinizde burada görüntülenecek.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative w-full overflow-hidden transition-[padding] duration-500 ease-out"
      style={{ padding: animateWords ? "15px" : "0px" }}
    >
      <div className="relative w-full overflow-hidden rounded-[10px]" style={{ height: "calc(100vh - 30px)" }}>
        {isVideo ? (
          <video
            src={mediaUrl}
            className="w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            style={{ minHeight: "calc(100vh - 30px)" }}
            preload="auto"
          />
        ) : (
          <Image
            src={mediaUrl}
            alt={banner.title_line1 || "Intro banner"}
            fill
            priority
            quality={95}
            sizes="100vw"
            style={{ minHeight: "calc(100vh - 30px)" }}
            className="object-cover"
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/10" />

        <div className="absolute inset-0 flex flex-col items-center justify-end px-6 py-8 text-center text-white md:px-10">
          {!!words.length && (
            <h1 className="max-w-3xl text-3xl font-medium uppercase leading-tight md:text-7xl" style={{ lineHeight: ".9" }}>
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
