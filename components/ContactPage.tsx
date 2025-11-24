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
    verificationCode: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  
  // Basit matematik sorusu için state
  const [verificationQuestion, setVerificationQuestion] = useState({ num1: 0, num2: 0, answer: 0 });
  
  // Verification question oluştur
  useEffect(() => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setVerificationQuestion({ num1, num2, answer: num1 + num2 });
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    // Verification code kontrolü
    const userAnswer = parseInt(formData.verificationCode);
    if (userAnswer !== verificationQuestion.answer) {
      setSubmitStatus({ 
        type: 'error', 
        message: 'Verification code is incorrect. Please try again.' 
      });
      setIsSubmitting(false);
      // Yeni soru oluştur
      const num1 = Math.floor(Math.random() * 10) + 1;
      const num2 = Math.floor(Math.random() * 10) + 1;
      setVerificationQuestion({ num1, num2, answer: num1 + num2 });
      setFormData({ ...formData, verificationCode: '' });
      return;
    }

    try {
      const response = await fetch('/api/contact-submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to send message');
      }

      setSubmitStatus({ 
        type: 'success', 
        message: data.message || 'Your message has been sent successfully!' 
      });
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        message: "",
        verificationCode: "",
      });
      
      // Yeni verification question oluştur
      const num1 = Math.floor(Math.random() * 10) + 1;
      const num2 = Math.floor(Math.random() * 10) + 1;
      setVerificationQuestion({ num1, num2, answer: num1 + num2 });

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus({ type: null, message: '' });
      }, 5000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Failed to send message. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
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
            
            {/* Status Message */}
            {submitStatus.type && (
              <div className={`mb-5 p-3 rounded-md text-sm ${
                submitStatus.type === 'success' 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {submitStatus.message}
              </div>
            )}

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

              {/* Verification Code */}
              <div>
                <label className="block text-xs mb-2 opacity-60">
                  Verification: {verificationQuestion.num1} + {verificationQuestion.num2} = ?
                </label>
                <input
                  type="number"
                  id="verificationCode"
                  value={formData.verificationCode}
                  placeholder="Enter the answer"
                  onChange={(e) => setFormData({ ...formData, verificationCode: e.target.value })}
                  className="w-full p-3 text-sm border border-[#161616] rounded-md focus:outline-none focus:border-[#ffffff1a]"
                  style={{ backgroundColor: "#161616" }}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#ffffff0d] w-[120px] font-medium text-white text-sm py-2 rounded-xl hover:bg-[#ffffff1a] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : 'Submit'}
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
