"use client";
import React, { useEffect, useMemo, useState } from "react";
import { ContactContent, normalizeImageUrl } from "@/lib/api";
import Image from "next/image";

interface ContactPageProps {
  content: ContactContent;
}

export default function ContactPage({ content }: ContactPageProps) {
  const [animateTitle, setAnimateTitle] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  // Title'ı kelimelere böl
  const titleWords = useMemo(() => {
    if (!content.title) return [];
    return content.title
      .split(/\s+/)
      .map((word) => word.trim())
      .filter(Boolean);
  }, [content.title]);

  const joinedTitle = useMemo(() => titleWords.join(" "), [titleWords]);

  useEffect(() => {
    setAnimateTitle(false);
    const timeout = window.setTimeout(() => setAnimateTitle(true), 60);
    return () => window.clearTimeout(timeout);
  }, [joinedTitle]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submit işlemi burada yapılacak
    console.log("Form submitted:", formData);
    // TODO: API'ye form gönder
  };

  return (
    <div className=" min-h-screen">
      {/* Banner Section */}
      {content.image_path && (
        <section className="relative w-full overflow-hidden" style={{ height: "75vh" }}>
          <Image
            src={normalizeImageUrl(content.image_path)}
            alt="Contact"
            fill
            quality={95}
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0) 100%)" }} />
          
          {/* Title Overlay */}
          <div className="absolute inset-0 flex items-end justify-center p-6">
            {!!titleWords.length && (
              <h1 className="max-w-3xl text-3xl font-medium uppercase leading-tight text-white md:text-7xl text-center" style={{ lineHeight: ".9" }}>
                {titleWords.map((word, idx) => (
                  <span key={`title-${word}-${idx}`} className="inline-block" style={{ lineHeight: ".9" }}>
                    <span
                      className="inline-block transition-all duration-500 will-change-transform"
                      style={{
                        transitionDelay: `${idx * 120}ms`,
                        transitionProperty: "opacity, transform, filter",
                        opacity: animateTitle ? 1 : 0,
                        transform: animateTitle ? "translateY(0)" : "translateY(0.6em)",
                        filter: animateTitle ? "blur(0px)" : "blur(6px)",
                      }}
                    >
                      {word}
                    </span>
                    {idx !== titleWords.length - 1 && <span>&nbsp;</span>}
                  </span>
                ))}
              </h1>
            )}
          </div>
        </section>
      )}

      {/* Content Section - Two Columns */}
      <div className="px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Form */}
          <div className="max-w-md">
            <h2 className="text-sm font-medium mb-5 opacity-40 uppercase">Message</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  placeholder="Name"
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 text-sm border border-[#161616] rounded-md focus:outline-none focus:border-[#ffffff1a]"
                  style={{ backgroundColor: "#161616" }}
                  required
                />
              </div>

              <div>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  placeholder="Email Address"
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-3 text-sm border border-[#161616] rounded-md focus:outline-none focus:border-[#ffffff1a]"
                  style={{ backgroundColor: "#161616" }}
                  required
                />
              </div>

              <div>
                <textarea
                  id="message"
                  value={formData.message}
                  placeholder="Message"
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={6}
                  className="w-full p-3 text-sm border border-[#161616] rounded-md focus:outline-none focus:border-[#ffffff1a] resize-none"
                  style={{ backgroundColor: "#161616" }}
                  required
                />
              </div>

              <button
                type="submit"
                className="bg-[#ffffff0d] w-[120px] font-medium text-white text-sm py-2 rounded-xl hover:bg-[#ffffff1a] transition-colors font-medium"
              >
                Submit
              </button>
            </form>
          </div>

          {/* Right Column - Contact Info */}
          <div className="space-y-10">
            {/* Office */}
            {content.address && (
              <div>
                <h3 className="text-sm font-medium uppercase tracking-wider mb-2 opacity-40">Office</h3>
                {content.address_link ? (
                  <a
                    href={content.address_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xl md:text-3xl font-medium max-w-md hover:opacity-70 transition-opacity block"
                  >
                    {content.address}
                  </a>
                ) : (
                  <p className="text-xl md:text-3xl font-medium max-w-md">{content.address}</p>
                )}
              </div>
            )}

            {/* Request */}
            {content.email && (
              <div>
                <h3 className="text-sm font-medium uppercase tracking-wider mb-2 opacity-40">Request</h3>
                <a
                  href={`mailto:${content.email}`}
                  className="text-xl md:text-3xl font-medium hover:opacity-70 transition-opacity"
                >
                  {content.email}
                </a>
              </div>
            )}

            {/* Phone */}
            {content.phone && (
              <div>
                <h3 className="text-sm font-medium uppercase tracking-wider mb-2 opacity-40">Phone</h3>
                <a
                  href={`tel:${content.phone.replace(/\s+/g, '')}`}
                  className="text-xl md:text-3xl font-medium hover:opacity-70 transition-opacity"
                >
                  {content.phone}
                </a>
              </div>
            )}

            {/* Socials */}
            {content.social_items && content.social_items.length > 0 && (
              <div>
                <h3 className="text-sm font-medium uppercase tracking-wider mb-2 opacity-40">Socials</h3>
                <div className="space-y-2">
                  {content.social_items.map((item, index) => (
                    <a
                      key={index}
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xl md:text-3xl font-medium hover:opacity-70 transition-opacity"
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
