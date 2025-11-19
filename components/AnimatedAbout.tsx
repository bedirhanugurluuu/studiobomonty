"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import AnimatedText from "@/components/AnimatedText";
import gsap from "gsap";
import { AboutContent, Project, Service, Recognition, RecognitionItem, ClientsSettings, Client, LatestProjectsBanner, fetchProjects, fetchServices, fetchRecognitionWithItems, fetchClientsWithSettings, fetchLatestProjectsBanner, normalizeImageUrl } from "@/lib/api";
import FromTheJournal from "@/components/FromTheJournal";

interface AnimatedAboutProps {
  initialContent?: AboutContent;
  initialProjects?: Project[];
  initialServices?: Service[];
  initialRecognition?: Recognition | null;
  initialRecognitionItems?: RecognitionItem[];
  initialClientsSettings?: ClientsSettings | null;
  initialClients?: Client[];
  initialLatestProjectsBanner?: LatestProjectsBanner | null;
}

export default function AnimatedAbout({ initialContent, initialProjects = [], initialServices = [], initialRecognition = null, initialRecognitionItems = [], initialClientsSettings = null, initialClients = [], initialLatestProjectsBanner = null }: AnimatedAboutProps) {
  const [content, setContent] = useState<AboutContent>(initialContent || {
    id: "1",
    title: "About Us",
    subtitle: "A collective of visionaries shaping tomorrow",
    content: "A collective of visionaries shaping tomorrow, where creativity and innovation intersect.",
    description: "A collective of visionaries shaping tomorrow, where creativity and innovation intersect.",
    main_text: "A collective of visionaries shaping tomorrow, where creativity and innovation intersect. Our studio is built on the belief that bold ideas and meticulous execution drive meaningful design.",
    image_path: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const containerRef = useRef<HTMLDivElement>(null);
  const heroImageRef = useRef<HTMLDivElement>(null);
  const heroWords = useMemo(() => {
    return (content.main_text || "")
      .split(/\s+/)
      .map((word) => word.trim())
      .filter(Boolean);
  }, [content.main_text]);
  const joinedHeroWords = heroWords.join(" ");
  const [animateWords, setAnimateWords] = useState(false);
  const [heroPaddingActive, setHeroPaddingActive] = useState(false);

  // Smooth entrance animation
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, 
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          ease: "power2.out",
          delay: 0.2
        }
      );
    }
  }, []);

  useEffect(() => {
    if (!heroImageRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setHeroPaddingActive(entry.intersectionRatio >= 0.5 && entry.isIntersecting);
        });
      },
      {
        threshold: [0, 0.5, 1],
      }
    );

    observer.observe(heroImageRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!heroWords.length) {
      setAnimateWords(false);
      return;
    }

    setAnimateWords(false);
    const timeout = window.setTimeout(() => setAnimateWords(true), 60);
    return () => window.clearTimeout(timeout);
  }, [joinedHeroWords, heroWords.length]);

  // Projects'i fetch et (sadece initialProjects boşsa)
  useEffect(() => {
    if (initialProjects.length === 0) {
      fetchProjects()
        .then((projectsData) => {
          setProjects(projectsData);
        })
        .catch(err => {
          console.error('Error fetching projects:', err);
        });
    }
  }, [initialProjects.length]);

  return (
    <div ref={containerRef} className="w-full">
      {/* Hero Section */}
      <section className="flex items-end h-[50vh] px-4">
        <div className="max-w-4xl text-left">
          <AnimatedText
            as="div"
            className="text-3xl font-medium uppercase leading-tight text-white md:text-6xl"
            delay={0}
          >
            <div className="overflow-hidden">
              <h1 className="max-w-4xl text-3xl font-medium uppercase leading-tight md:text-7xl" style={{ lineHeight: ".9" }}>
                {heroWords.map((word, idx) => (
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
                    {idx !== heroWords.length - 1 && <span>&nbsp;</span>}
                  </span>
                ))}
              </h1>
            </div>
          </AnimatedText>
        </div>
      </section>

      {/* Hero Image */}
      <div className="w-full">
        <div
          ref={heroImageRef}
          className="relative w-full overflow-hidden transition-[padding] duration-500 ease-out"
          style={{ height: "120vh", padding: heroPaddingActive ? "0px" : "15px" }}
        >
          <img
            src={normalizeImageUrl(content.image_path || '')}
            alt="About Visual"
            className="h-full w-full object-cover rounded-[10px]"
          />
        </div>
      </div>

      {/* Offices Section */}
      <div className="w-full">
        <div
          className="relative w-full overflow-hidden px-4 pt-25 pb-55"
        >
          <h2 className="text-xl font-medium mb-15">
            OFFICES
          </h2>
          <div className="flex flex-col gap-2">
            <span className="text-[160px] font-medium" style={{ lineHeight: "160px" }}>IST</span>
            <p className="opacity-50 text-sm font-medium" style={{ lineHeight: "16px" }}>125 W 26th Street, 9th Floor <br /> New York, NY 10001</p>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <ServicesSection initialServices={initialServices} />

      {/* Recognition Section */}
      <RecognitionSection initialRecognition={initialRecognition} initialRecognitionItems={initialRecognitionItems} />

      {/* Clients Section */}
      <ClientsSection initialClientsSettings={initialClientsSettings} initialClients={initialClients} />

      {/* From The Journal Section */}
      <FromTheJournal />

      {/* Latest Projects Banner Section */}
      <LatestProjectsBannerSection initialBanner={initialLatestProjectsBanner} />
    </div>
  );
}

interface RecognitionSectionProps {
  initialRecognition?: Recognition | null;
  initialRecognitionItems?: RecognitionItem[];
}

const RecognitionSection = ({ initialRecognition = null, initialRecognitionItems = [] }: RecognitionSectionProps) => {
  const [recognition, setRecognition] = useState<Recognition | null>(initialRecognition);
  const [items, setItems] = useState<RecognitionItem[]>(initialRecognitionItems);
  const borderRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!initialRecognition && initialRecognitionItems.length === 0) {
      fetchRecognitionWithItems()
        .then(({ recognition: rec, items: its }) => {
          setRecognition(rec);
          setItems(its);
        })
        .catch((err) => {
          console.error("Error fetching recognition:", err);
        });
    }
  }, [initialRecognition, initialRecognitionItems.length]);

  useEffect(() => {
    // Border animasyonları için observer
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-border-index'));
            if (!Number.isNaN(index) && index >= 0) {
              const borderElement = borderRefs.current[index];
              if (borderElement) {
                gsap.to(borderElement, {
                  width: '100%',
                  duration: 0.8,
                  delay: index * 0.1,
                  ease: 'power2.out',
                });
                observer.unobserve(entry.target);
              }
            }
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    borderRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      borderRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [items.length]);

  if (!recognition || items.length === 0) return null;

  return (
    <section className="px-4 py-24">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)]">
        {/* Left: Recognition Title */}
        <div className="flex items-start">
          <h2 className="text-xl uppercase font-medium">{recognition.title}</h2>
        </div>

        {/* Right: Recognition Items */}
        <div className="flex flex-col">
          {items.map((item, index) => (
            <div key={item.id} className="flex flex-col">
              <div className="grid grid-cols-3 gap-8">
                {/* Organization Name */}
                <div className="flex items-start">
                  <h3 className="text-lg font-medium text-white">{item.organization_name}</h3>
                </div>

                {/* Awards */}
                <div className="flex flex-col">
                  {item.awards.map((award, awardIndex) => (
                    <div key={awardIndex} className="flex items-center">
                      <span className="text-sm uppercase text-white">{award}</span>
                    </div>
                  ))}
                </div>

                {/* Counts - Sağa yaslı */}
                <div className="flex flex-col items-end">
                  {item.counts.map((count, countIndex) => (
                    <span key={countIndex} className="text-sm uppercase text-white">{count}</span>
                  ))}
                </div>
              </div>

              {/* Border */}
              {index < items.length - 1 && (
                <div className="relative py-5 overflow-hidden">
                  <div
                    ref={(el) => {
                      borderRefs.current[index] = el;
                    }}
                    data-border-index={index}
                    className="h-px bg-white/20"
                    style={{ width: '0%' }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

interface ClientsSectionProps {
  initialClientsSettings?: ClientsSettings | null;
  initialClients?: Client[];
}

const ClientsSection = ({ initialClientsSettings = null, initialClients = [] }: ClientsSectionProps) => {
  const [settings, setSettings] = useState<ClientsSettings | null>(initialClientsSettings);
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const clientRowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imageContainerRef = useRef<HTMLDivElement | null>(null);
  const orderContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!initialClientsSettings && initialClients.length === 0) {
      fetchClientsWithSettings()
        .then(({ settings: s, clients: c }) => {
          setSettings(s);
          setClients(c);
        })
        .catch((err) => {
          console.error("Error fetching clients:", err);
        });
    }
  }, [initialClientsSettings, initialClients.length]);

  useEffect(() => {
    if (hoveredIndex !== null && clientRowRefs.current[hoveredIndex]) {
      const hoveredRow = clientRowRefs.current[hoveredIndex];
      const imageContainer = imageContainerRef.current;
      const orderContainer = orderContainerRef.current;

      if (hoveredRow && imageContainer && orderContainer) {
        const rowTop = hoveredRow.offsetTop;
        const containerTop = hoveredRow.parentElement?.offsetTop || 0;
        const translateY = rowTop - containerTop;

        // Image: -20px (yazıdan 20px yukarıda)
        gsap.to(imageContainer, {
          y: translateY - 20,
          duration: 0.5,
          ease: 'power2.out',
        });

        // Order: +20px (yazıdan 20px aşağıda)
        gsap.to(orderContainer, {
          y: translateY + 20,
          duration: 0.5,
          ease: 'power2.out',
        });

        // Opacity animasyonları
        const imageElement = imageContainer.querySelector('img');
        const orderElement = orderContainer.querySelector('span');
        
        if (imageElement) {
          gsap.to(imageElement, {
            opacity: 1,
            duration: 0.3,
            ease: 'power2.out',
          });
        }
        
        if (orderElement) {
          gsap.to(orderElement, {
            opacity: 1,
            duration: 0.3,
            ease: 'power2.out',
          });
        }
      }
    } else {
      // Hover yoksa başlangıç pozisyonuna dön
      if (imageContainerRef.current && orderContainerRef.current) {
        // Image: -20px başlangıç pozisyonu
        gsap.to(imageContainerRef.current, {
          y: -20,
          duration: 0.5,
          ease: 'power2.out',
        });

        // Order: +20px başlangıç pozisyonu
        gsap.to(orderContainerRef.current, {
          y: 20,
          duration: 0.5,
          ease: 'power2.out',
        });

        // Opacity animasyonları
        const imageElement = imageContainerRef.current.querySelector('img');
        const orderElement = orderContainerRef.current.querySelector('span');
        
        if (imageElement) {
          gsap.to(imageElement, {
            opacity: 0,
            duration: 0.3,
            ease: 'power2.out',
          });
        }
        
        if (orderElement) {
          gsap.to(orderElement, {
            opacity: 0,
            duration: 0.3,
            ease: 'power2.out',
          });
        }
      }
    }
  }, [hoveredIndex]);

  if (!settings || clients.length === 0) return null;

  const activeClient = hoveredIndex !== null ? clients[hoveredIndex] : null;

  return (
    <section className="px-4 py-24">
      <div className="mb-10">
        <h2 className="text-xl uppercase font-medium">{settings.title}</h2>
      </div>
      
      <div className="relative py-5 px-4">
        {/* Sol: Tek görsel alanı - absolute */}
        <div
          ref={imageContainerRef}
          className="absolute left-0 flex items-center"
          style={{ transform: 'translateY(-20px)' }}
        >
          {activeClient?.image_path && (
            <img
              src={normalizeImageUrl(activeClient.image_path)}
              alt={activeClient.name}
              className="w-38 h-25 object-cover opacity-0"
              style={{ borderRadius: '4px' }}
            />
          )}
        </div>

        {/* Sağ: Tek order alanı - absolute */}
        <div
          ref={orderContainerRef}
          className="absolute right-0 flex items-center"
          style={{ transform: 'translateY(20px)' }}
        >
          <span className="text-sm uppercase text-white opacity-0">
            {activeClient?.order_index || ''}
          </span>
        </div>

        {/* Orta: Client isimleri - tam genişlikte */}
        <div className="flex flex-col">
          {clients.map((client, index) => (
            <div
              key={client.id}
              ref={(el) => {
                clientRowRefs.current[index] = el;
              }}
              className="group relative w-full flex items-center justify-center text-center hover:cursor-pointer"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <span className="text-6xl font-medium uppercase opacity-10 group-hover:opacity-100 transition-opacity duration-300">
                {client.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

interface LatestProjectsBannerSectionProps {
  initialBanner?: LatestProjectsBanner | null;
}

const LatestProjectsBannerSection = ({ initialBanner = null }: LatestProjectsBannerSectionProps) => {
  const [banner, setBanner] = useState<LatestProjectsBanner | null>(initialBanner);

  useEffect(() => {
    if (!initialBanner) {
      fetchLatestProjectsBanner()
        .then((data) => {
          setBanner(data);
        })
        .catch((err) => {
          console.error("Error fetching latest projects banner:", err);
        });
    }
  }, [initialBanner]);

  if (!banner) return null;

  return (
    <section className="px-4 py-24">
      <div className="relative w-full">
        {banner.image_path && (
          <div className="w-full">
            <Image
              src={normalizeImageUrl(banner.image_path)}
              alt={banner.title}
              width={1200}
              height={590}
              className="w-full h-auto object-cover rounded-lg max-h-[590px]"
            />
          </div>
        )}
        <div className="absolute bottom-0 left-0 p-6 md:p-8 flex flex-col gap-2">
          <h2 className="text-2xl lg:text-3xl uppercase font-medium text-white">{banner.title}</h2>
          <p className="text-md text-white/50 max-w-xs" style={{ lineHeight: "1" }}>{banner.subtitle}</p>
          <Link
            href="/projects"
            className="group relative inline-flex items-center mt-3 text-sm uppercase tracking-wider text-white"
          >
            <span className="relative inline-block">
              view work
              <span className="absolute left-0 bottom-0 block h-px w-full origin-left scale-x-0 bg-white transition-transform duration-300 ease-out group-hover:scale-x-100" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};

interface AnimatedIntroWordsProps {
  text?: string;
}

interface ServicesSectionProps {
  initialServices?: Service[];
}

const ServicesSection = ({ initialServices = [] }: ServicesSectionProps) => {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [intersectionRatios, setIntersectionRatios] = useState<Map<number, number>>(new Map());
  const sectionRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (initialServices.length === 0) {
      fetchServices()
        .then((data) => {
          setServices(data);
        })
        .catch((err) => {
          console.error("Error fetching services:", err);
        });
    }
  }, [initialServices.length]);

  // IntersectionObserver to track which service is currently in view
  useEffect(() => {
    if (services.length === 0) return;

    const ratios = new Map<number, number>();

    // Section'ın görünürlüğünü kontrol et
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const sectionEntry = entries[0];
        if (!sectionEntry.isIntersecting) {
          // Section görünür değilse hiçbir servisi aktif yapma
          setActiveIndex(null);
          return;
        }
      },
      {
        root: null,
        threshold: 0.1,
      }
    );

    // Her servisin görünürlüğünü kontrol et
    const serviceObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number(entry.target.getAttribute("data-index"));
          if (!Number.isNaN(index)) {
            ratios.set(index, entry.intersectionRatio);
          }
        });

        setIntersectionRatios(new Map(ratios));

        // En yüksek intersection ratio'ya sahip servisi bul
        let maxRatio = 0;
        let maxIndex: number | null = null;

        ratios.forEach((ratio, index) => {
          if (ratio > maxRatio && ratio > 0.1) {
            maxRatio = ratio;
            maxIndex = index;
          }
        });

        setActiveIndex(maxIndex);
      },
      {
        root: null,
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
        rootMargin: "-30% 0px -30% 0px",
      }
    );

    // Section'ı gözle
    if (sectionRef.current) {
      sectionObserver.observe(sectionRef.current);
    }

    // Servisleri gözle
    itemRefs.current.forEach((el) => {
      if (el) serviceObserver.observe(el);
    });

    return () => {
      if (sectionRef.current) {
        sectionObserver.unobserve(sectionRef.current);
      }
      itemRefs.current.forEach((el) => {
        if (el) serviceObserver.unobserve(el);
      });
    };
  }, [services.length]);

  const activeService = useMemo(() => {
    if (services.length === 0 || activeIndex === null) return null;
    return services[activeIndex];
  }, [activeIndex, services]);

  const activeMediaUrl = activeService?.image_path ? normalizeImageUrl(activeService.image_path) : null;
  const activeIsVideo =
    activeMediaUrl &&
    (activeMediaUrl.toLowerCase().endsWith(".mp4") ||
      activeMediaUrl.toLowerCase().endsWith(".webm") ||
      activeMediaUrl.toLowerCase().endsWith(".mov"));

  return (
    <section ref={sectionRef} className="px-4 py-24">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,2.9fr)_minmax(0,0.9fr)]">
        {/* Left: Services Title */}
        <div className="flex items-start">
          <h2 className="text-xl uppercase font-medium">Services</h2>
        </div>

        {/* Middle: Services List */}
        <div className="relative">
          <div className="flex flex-col">
            {services.map((service, index) => (
              <div
                key={service.id}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                data-index={index}
                className="group flex flex-col text-white transition-opacity duration-300 py-2"
              >
                <span
                  className={`text-4xl font-medium uppercase leading-[0.9] transition-[opacity,transform] duration-500 ease-out md:text-6xl ${
                    activeIndex === index ? "opacity-100" : "opacity-10"
                  }`}
                >
                  {service.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Sticky Media Preview */}
        <div className="relative">
          <div className="sticky top-[100px] flex w-full items-center justify-center">
            <div className="relative w-full overflow-hidden rounded-[10px] bg-black/20">
              {activeIndex !== null && activeMediaUrl ? (
                activeIsVideo ? (
                  <video
                    key={activeMediaUrl}
                    src={activeMediaUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Image
                    key={activeMediaUrl}
                    src={activeMediaUrl}
                    alt={activeService?.name || "Service"}
                    width={1200}
                    height={800}
                    className="h-full w-full object-cover"
                    priority
                  />
                )
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-white/10 text-white/60">
                  {activeIndex === null ? "" : "No image"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
