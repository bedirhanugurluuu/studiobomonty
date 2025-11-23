"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchFooter } from "@/lib/api";
import type { Footer } from "@/lib/api";
import { useHeaderSettings } from "@/hooks/useHeaderSettings";

export default function Footer() {
    const [footer, setFooter] = useState<Footer | null>(null);
    const [loading, setLoading] = useState(true);
    const { settings: headerSettings } = useHeaderSettings();

    useEffect(() => {
        fetchFooter()
          .then((data) => {
            if (data) {
              setFooter(data);
            }
          })
          .catch((error) => {
            console.error('Footer yükleme hatası:', error);
          })
          .finally(() => {
            setLoading(false);
          });
    }, []);

    // Loading durumunda hiçbir şey gösterme
    if (loading || !footer) {
        return null;
    }

    return (
        <footer className="bg-black text-white relative bottom-0 px-4 pt-25 pb-8" style={{ zIndex: '1' }}>
            <div className="mx-auto">
                {/* Line */}
                <div className="border-t border-white opacity-25" />

                {/* Grid */}
                <div className="grid grid-cols-1 gap-10 pt-10 pb-30 text-sm md:grid-cols-3">
                    {/* Logo */}
                    <div className="flex flex-col items-start gap-4">
                        <Link href="/" className="inline-flex items-center">
                            {headerSettings?.logo_image_url_light || headerSettings?.logo_image_url ? (
                                <div className="relative h-8 w-28 md:h-10 md:w-32">
                                    <Image
                                        src={headerSettings?.logo_image_url_light || headerSettings?.logo_image_url || ""}
                                        alt={headerSettings?.logo_text || "Studio logo"}
                                        fill
                                        className="object-contain"
                                        sizes="(max-width: 768px) 120px, 160px"
                                    />
                                </div>
                            ) : (
                                <span className="text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
                                    {headerSettings?.logo_text || "STUDIO"}
                                </span>
                            )}
                        </Link>
                    </div>

                    {/* Sitemap */}
                    <div className="flex flex-col gap-4">
                        <ul className="space-y-2">
                            {footer.sitemap_items.map((item, i) => (
                                <li key={i} className="mb-0">
                                    <a
                                        href={item.link}
                                        className="group uppercase relative inline-block text-white text-md font-medium"
                                    >
                                        <span className="relative inline-block">
                                            {item.name}
                                        </span>
                                        <span className="pointer-events-none absolute left-0 bottom-0 block h-[1px] w-full origin-left scale-x-0 bg-white transition-transform duration-300 ease-out group-hover:scale-x-100" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Socials */}
                    <div className="flex flex-col gap-4">
                        <ul className="space-y-2">
                            {footer.social_items.map((item, i) => (
                                <li key={i} className="mb-0">
                                    <a
                                        href={item.link}
                                        className="group relative uppercase inline-block text-white text-md font-medium"
                                    >
                                        <span className="relative inline-block">
                                            {item.name}
                                        </span>
                                        <span className="pointer-events-none absolute left-0 bottom-0 block h-[1px] w-full origin-left scale-x-0 bg-white transition-transform duration-300 ease-out group-hover:scale-x-100" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Text */}
                <div className="mt-8 text-center text-xs font-medium text-white opacity-40" style={{ letterSpacing: 0 }}>
                    {footer.copyright_text}
                </div>
            </div>
        </footer>
    );
}
