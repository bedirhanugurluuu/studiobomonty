"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { useHeaderSettings } from "../hooks/useHeaderSettings";
import Image from "next/image";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [istanbulTime, setIstanbulTime] = useState("");
  const { settings: headerSettings } = useHeaderSettings();
  const pathname = usePathname();
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownContentRef = useRef<HTMLDivElement | null>(null);
  const [menuHeight, setMenuHeight] = useState(0);
  const CLOSE_DELAY = 220;
  const BASE_CONTAINER_HEIGHT = 112;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Istanbul",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const updateTime = () => {
      const formatted = formatter.format(new Date());
      setIstanbulTime(`${formatted} İST`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const forceBlackTextPages = ["/about", "/blog", "/careers", "/projects", "/contact"];
  const isDarkText = pathname ?
    forceBlackTextPages.includes(pathname) || pathname.startsWith("/blog/") :
    false;

  // Varsayılan menü öğeleri (fallback)
  const defaultNavItems = [
    { href: "/projects", label: "PROJECTS" },
    { href: "/about", label: "ABOUT" },
    { href: "/blog", label: "JOURNAL" },
    { href: "/contact", label: "CONTACT" },
  ];

  // Her zaman menü öğelerini göster - loading olsa bile varsayılan öğeleri kullan
  const navItems = useMemo(() => {
    if (headerSettings?.menu_items && headerSettings.menu_items.length > 0) {
      return [...headerSettings.menu_items].sort((a: any, b: any) => a.order - b.order);
    }
    return defaultNavItems;
  }, [headerSettings?.menu_items]);

  const primaryNavItems = navItems.slice(0, 3);
  const activeBackground = scrolled || menuOpen || isDarkText;

  const openMenu = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setMenuOpen(true);
  };

  const keepMenuOpen = () => {
    if (menuOpen) {
      openMenu();
    }
  };

  const scheduleClose = (delay = CLOSE_DELAY) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      setMenuOpen(false);
      closeTimeoutRef.current = null;
    }, delay);
  };

  useEffect(() => {
    const updateMenuHeight = () => {
      if (dropdownContentRef.current) {
        setMenuHeight(dropdownContentRef.current.scrollHeight);
      }
    };

    updateMenuHeight();
    window.addEventListener("resize", updateMenuHeight);

    return () => {
      window.removeEventListener("resize", updateMenuHeight);
    };
  }, [navItems]);

  useEffect(() => {
    if (dropdownContentRef.current) {
      setMenuHeight(dropdownContentRef.current.scrollHeight);
    }
  }, [menuOpen]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <header
      className={clsx(
        "fixed left-1/2 top-4 md:top-6 z-[80] px-4 md:p-0 w-full max-w-[680px] -translate-x-1/2 transition-all duration-500",
        menuOpen && "pb-6"
      )}
    >
        <div
          className={clsx(
            "header-container relative mx-auto overflow-hidden rounded-[10px] px-4 ring-1 ring-black/5 transition-[max-height,background-color] duration-500 ease-out backdrop-blur"
          )}
          style={{
            maxHeight: `${menuOpen ? BASE_CONTAINER_HEIGHT + menuHeight : BASE_CONTAINER_HEIGHT}px`,
            backgroundColor: 'rgba(61, 61, 61, 0.4)',
            backdropFilter: 'blur(30px)',
          }}
          onMouseLeave={() => scheduleClose()}
          onMouseEnter={keepMenuOpen}
        >
        <div className="flex items-center justify-between gap-6 py-4">
          <Link
            href="/"
            className="flex items-center"
            onClick={() => setMenuOpen(false)}
          >
            {headerSettings?.logo_image_url ? (
              <div className="relative h-6 w-20">
                <Image
                  src={headerSettings.logo_image_url}
                  alt="Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            ) : headerSettings?.logo_text ? (
              <span className="text-sm font-semibold uppercase tracking-[0.3em]">
                {headerSettings.logo_text}
              </span>
            ) : (
              <span className="text-sm font-semibold uppercase tracking-[0.3em]">
                StudioBomonty
              </span>
            )}
          </Link>

          {primaryNavItems.length > 0 && (
            <nav
              className={clsx(
                "hidden md:flex items-center gap-6 text-xs font-medium uppercase transition-opacity duration-300",
                menuOpen && "opacity-0 pointer-events-none"
              )}
            >
              {primaryNavItems.map((item: any) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group relative block"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="relative inline-block text-white transition-transform duration-300 uppercase">
                    {item.label.toLowerCase()}
                    <span className="absolute left-0 bottom-0 h-[1px] w-full origin-left scale-x-0 bg-white transition-transform duration-300 ease-out group-hover:scale-x-100" />
                  </span>
                </Link>
              ))}
            </nav>
          )}

          <div className="relative flex items-center cursor-pointer">
            <button
              className="relative flex h-6 w-6 items-center justify-center cursor-pointer"
              onMouseEnter={openMenu}
              onFocus={openMenu}
              onBlur={() => scheduleClose()}
              onClick={() => openMenu()}
              aria-expanded={menuOpen}
              aria-label="Toggle navigation"
            >
              <div
                className={clsx(
                  "grid h-3 w-3 grid-cols-2 grid-rows-2 gap-[4px] transition-transform duration-300",
                  menuOpen ? "rotate-[-90deg] scale-90" : "rotate-0 scale-100"
                )}
              >
                {[0, 1, 2, 3].map((dot) => (
                  <span
                    key={dot}
                    className={clsx(
                      "block h-[4px] w-[4px] bg-white transition-colors duration-300",
                      activeBackground || menuOpen ? "opacity-60" : "opactiy-100"
                    )}
                  />
                ))}
              </div>
            </button>
          </div>
        </div>

        <div
          className={clsx(
            "menu-open overflow-hidden text-xs uppercase transition-[max-height] duration-500 ease-out",
            menuOpen ? "pointer-events-auto" : "pointer-events-none"
          )}
          style={{ maxHeight: `${menuOpen ? menuHeight : 0}px` }}
          onMouseEnter={openMenu}
          onMouseLeave={() => scheduleClose()}
        >
          <div
            ref={dropdownContentRef}
            className="grid gap-6 md:gap-12 pt-4 pb-4 text-xs uppercase md:grid-cols-2"
          >
            {navItems.length > 0 && (
              <nav className="flex flex-col gap-1 text-sm font-medium md:col-span-2">
                {navItems.map((item: any, index: number) => (
                  <div key={item.href} className="overflow-hidden">
                    <Link
                      href={item.href}
                      className="group inline-block"
                      onClick={() => setMenuOpen(false)}
                    >
                      <span
                        className="relative inline-block text-3xl text-white lowercase"
                        style={{
                          transform: menuOpen ? "translateY(0%)" : "translateY(100%)",
                          opacity: menuOpen ? 1 : 0,
                          transition: "transform 0.8s ease-out, opacity 0.8s ease-out",
                          transitionDelay: menuOpen ? `${0.05 * index}s` : "0s",
                        }}
                      >
                        {item.label.toLowerCase()}
                        <span
                          className="absolute left-0 bottom-0 h-[1px] w-full origin-left scale-x-0 bg-white transition-transform duration-300 ease-out group-hover:scale-x-100"
                        />
                      </span>
                    </Link>
                  </div>
                ))}
              </nav>
            )}

            {headerSettings?.social_items && headerSettings.social_items.length > 0 && (
              <div className="flex gap-2 text-white items-end">
                {headerSettings.social_items
                  .sort((a: any, b: any) => a.order - b.order)
                  .map((social: any, index: number) => (
                    <div key={social.id} className="overflow-hidden">
                      <a
                        href={social.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block tracking-[0.3em] hover:opacity-100 transition-opacity"
                        style={{
                          transform: menuOpen ? "translateY(0%)" : "translateY(100%)",
                          opacity: menuOpen ? .4 : 0,
                          transition: "transform 0.8s ease-out, opacity 0.8s ease-out",
                          transitionDelay: menuOpen ? `${0.08 * (index + 1)}s` : "0s",
                        }}
                      >
                        {social.name}
                      </a>
                    </div>
                  ))}
              </div>
            )}
            <div className="flex flex-col items-start justify-end gap-1 md:items-end">
              <div className="overflow-hidden">
                <span
                  className="block text-sm font-medium tracking-[0.35em] text-white"
                  style={{
                    transform: menuOpen ? "translateY(0%)" : "translateY(100%)",
                    opacity: menuOpen ? .4 : 0,
                    transition: "transform 0.8s ease-out, opacity 0.8s ease-out",
                    transitionDelay: menuOpen ? "0.35s" : "0s",
                  }}
                >
                  {istanbulTime}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}