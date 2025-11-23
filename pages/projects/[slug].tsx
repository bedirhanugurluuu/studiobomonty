import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import AnimatedText from "@/components/AnimatedText";
import ButtonWithHoverArrow from "@/components/ButtonWithHoverArrow";
import Link from "next/link";
import { GetStaticProps, GetStaticPaths } from "next";
import { fetchProjectBySlugSSR, fetchProjectsSSR, fetchProjectGallery, fetchProjectTeamMembers, normalizeImageUrl, Project, ProjectTeamMember } from "@/lib/api";
import SEO from "@/components/SEO";
import FeaturedProjects from "@/components/FeaturedProjects";

interface ProjectDetailProps {
  project: Project | null;
  moreProjects: Project[];
  galleryImages: string[];
  teamMembers: ProjectTeamMember[];
  featuredProjects: Project[];
}

export default function ProjectDetail({ project, moreProjects, galleryImages, teamMembers, featuredProjects }: ProjectDetailProps) {
  if (!project) return <p>Project not found.</p>;

  // Animation state
  const [animateContent, setAnimateContent] = useState(false);
  const [animateBottomContent, setAnimateBottomContent] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Split title and subtitle into words for animation
  const titleWords = useMemo(() => {
    if (!project.title) return [];
    return project.title
      .split(/\s+/)
      .map((word) => word.trim())
      .filter(Boolean);
  }, [project.title]);

  const subtitleWords = useMemo(() => {
    if (!project.subtitle) return [];
    return project.subtitle
      .split(/\s+/)
      .map((word) => word.trim())
      .filter(Boolean);
  }, [project.subtitle]);

  const joinedTitle = useMemo(() => titleWords.join(" "), [titleWords]);
  const joinedSubtitle = useMemo(() => subtitleWords.join(" "), [subtitleWords]);

  // Set isMobile on client-side only
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Trigger animations on mount
  useEffect(() => {
    setAnimateContent(false);
    setAnimateBottomContent(false);
    const timeout1 = window.setTimeout(() => setAnimateContent(true), 60);
    const timeout2 = window.setTimeout(() => setAnimateBottomContent(true), 800);
    return () => {
      window.clearTimeout(timeout1);
      window.clearTimeout(timeout2);
    };
  }, [joinedTitle, joinedSubtitle]);

  // Schema for project detail page
  const schema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": project.title,
    "description": project.subtitle,
    "image": project.banner_media ? normalizeImageUrl(project.banner_media) : null,
    "creator": {
      "@type": "Organization",
      "name": "StudioBomonty"
    },
    "dateCreated": project.created_at,
    "dateModified": project.updated_at,
    "url": `https://studiobomonty.vercel.app/projects/${project.slug}`,
    "mainEntity": {
      "@type": "Project",
      "name": project.title,
      "description": project.description || project.subtitle,
      "client": project.client_name,
      "url": project.external_link
    }
  };

  return (
    <>
      <SEO 
        title={`${project.title} - StudioBomonty`}
        description={project.subtitle}
        image={project.banner_media ? normalizeImageUrl(project.banner_media) : "https://studiobomonty.vercel.app/images/project-og.jpg"}
        schema={schema}
      />
      <div className="w-full">
      {/* Banner or Video Section */}
      <section 
        className={`relative w-full overflow-hidden ${!isMobile ? 'transition-[padding] duration-500 ease-out' : ''}`}
        style={{ 
          padding: isMobile 
            ? "0px" 
            : (animateContent ? "15px" : "0px")
        }}
      >
        <div className="relative w-full overflow-hidden md:rounded-[10px]" style={{ height: "calc(100vh - 30px)" }}>
          {project.banner_media && (
            <Image
              src={normalizeImageUrl(project.banner_media)}
              alt="Banner"
              fill
              quality={95}
              sizes="100vw"
              style={{ objectFit: "cover", minHeight: "calc(100vh - 30px)" }}
              priority
              className="object-cover"
            />
          )}

          {/* Gradient Overlay */}
          <div
            style={{
              background: "linear-gradient(rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.4) 100%)",
              transform: "none",
              transformOrigin: "50% 50% 0px",
              flex: "none",
              height: "100%",
              left: 0,
              overflow: "hidden",
              position: "absolute",
              top: 0,
              width: "100%",
              zIndex: 1
            }}
          />

          {/* Content Container - Bottom aligned */}
          <div className="absolute inset-0 flex flex-col items-end justify-end py-6 px-4 z-10">
            <div className="w-full max-w-full">
              {/* Title and Subtitle - Same h1 */}
              <h1 className="text-white text-3xl lg:text-5xl font-medium leading-tight mb-9" style={{ lineHeight: ".9" }}>
                {/* Title words */}
                {titleWords.map((word, idx) => (
                  <span key={`title-${word}-${idx}`} className="inline-block" style={{ lineHeight: ".9" }}>
                    <span
                      className="inline-block transition-all duration-500 will-change-transform"
                      style={{
                        transitionDelay: `${idx * 120}ms`,
                        transitionProperty: "opacity, transform, filter",
                        opacity: animateContent ? 1 : 0,
                        transform: animateContent ? "translateY(0)" : "translateY(0.6em)",
                        filter: animateContent ? "blur(0px)" : "blur(6px)",
                      }}
                    >
                      {word}
                    </span>
                    {idx !== titleWords.length - 1 && <span>&nbsp;</span>}
                  </span>
                ))}

                {/* Separator */}
                {titleWords.length > 0 && subtitleWords.length > 0 && (
                  <span className="inline-block mx-2" style={{ lineHeight: ".9" }}>
                    <span
                      className="inline-block transition-all duration-500 will-change-transform"
                      style={{
                        transitionDelay: `${titleWords.length * 120}ms`,
                        transitionProperty: "opacity, transform, filter",
                        opacity: animateContent ? 1 : 0,
                        transform: animateContent ? "translateY(0)" : "translateY(0.6em)",
                        filter: animateContent ? "blur(0px)" : "blur(6px)",
                      }}
                    >
                      —
                    </span>
                  </span>
                )}

                {/* Subtitle words */}
                {subtitleWords.map((word, idx) => (
                  <span key={`subtitle-${word}-${idx}`} className="inline-block" style={{ lineHeight: ".9" }}>
                    <span
                      className="inline-block transition-all duration-500 will-change-transform"
                      style={{
                        transitionDelay: `${(titleWords.length + 1 + idx) * 120}ms`,
                        transitionProperty: "opacity, transform, filter",
                        opacity: animateContent ? 1 : 0,
                        transform: animateContent ? "translateY(0)" : "translateY(0.6em)",
                        filter: animateContent ? "blur(0px)" : "blur(6px)",
                      }}
                    >
                      {word}
                    </span>
                    {idx !== subtitleWords.length - 1 && <span>&nbsp;</span>}
                  </span>
                ))}
              </h1>

              {/* Bottom Content - Client, View Live Site, Tabs */}
              <div className="flex">
                <div
                  className="text-white text-sm flex flex-col flex-1 md:flex-row md:items-center md:justify-between gap-4 md:gap-8"
                  style={{
                    letterSpacing: 0,
                    opacity: animateBottomContent ? 1 : 0,
                    transition: "opacity 0.8s ease-out"
                  }}
                >
                  {/* Left: Client Name */}
                  <div className="font-semibold flex-1">
                    {project.client_name && (
                      <span>
                        <span className="pr-1 opacity-25">Client: </span> {project.client_name}
                      </span>
                    )}
                  </div>

                   {/* Center: View Live Site */}
                   {project.external_link && (
                     <div className="font-semibold flex-1">
                       <Link
                         href={project.external_link}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="group relative inline-flex items-center gap-2 hover:opacity-80 transition-opacity"
                       >
                         VIEW LIVE SITE
                         <ButtonWithHoverArrow />
                         <span className="absolute bottom-0 left-0 h-[1px] bg-white w-full origin-left transition-transform duration-300 ease-out group-hover:scale-x-0" />
                       </Link>
                     </div>
                   )}

                  {/* Right: Tabs */}
                  <div className="font-semibold flex gap-1 flex-1 justify-start md:justify-end">
                    {project.tab1 && (
                      <div className="text-white px-3 py-2 rounded-sm" style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}>
                        <span>
                          {project.tab1}
                        </span>
                      </div>
                    )}
                    {project.tab2 && (
                      <div className="text-white px-3 py-2 rounded-sm" style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}>
                        <span>
                          {project.tab2}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery and Description Section */}
      <section className="px-4 py-4 md:py-0">
        <div className="flex flex-col gap-4">
          {/* First 2 images side by side */}
          {galleryImages.length >= 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {galleryImages.slice(0, 2).map((image, idx) => {
                const isVideo = image.toLowerCase().endsWith('.mp4') || image.toLowerCase().endsWith('.webm');
                return (
                  <div key={idx} className="relative aspect-[3/4]">
                    {isVideo ? (
                      <video
                        src={normalizeImageUrl(image)}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full object-cover h-full rounded-[10px]"
                      />
                    ) : (
                      <Image
                        src={normalizeImageUrl(image)}
                        alt={`Gallery image ${idx + 1}`}
                        fill
                        quality={90}
                        className="object-cover rounded-[10px]"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Description */}
          {project.description && (
            <div className="flex gap-10 pb-15 pt-4">
              <div className="hidden md:block flex-1"></div>
              <div className="flex-1">
                <h2 className="opacity-40 text-sm mb-2 uppercase font-medium">About the project</h2>
                <div className="text-xl lg:text-3xl font-medium" style={{ lineHeight: "1.2" }}>
                  {project.description
                    .split(/\n{3,}/)
                    .map((paragraph, idx) => (
                      <p key={idx}>
                        {paragraph.split("\n").map((line, i) => (
                          <React.Fragment key={i}>
                            {line}
                            <br />
                          </React.Fragment>
                        ))}
                      </p>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Remaining gallery images with pattern: single, pair, single, pair... */}
          {galleryImages.length > 2 && (() => {
            const remainingImages = galleryImages.slice(2);
            const rows = [];
            let i = 0;
            
            while (i < remainingImages.length) {
              // Single image (full width)
              if (i < remainingImages.length) {
                const image = remainingImages[i];
                const isVideo = image.toLowerCase().endsWith('.mp4') || image.toLowerCase().endsWith('.webm');
                
                rows.push(
                  <div key={`single-${i}`} className="w-full relative aspect-[16/9]">
                    {isVideo ? (
                      <video
                        src={normalizeImageUrl(image)}
                        autoPlay
                        loop
                        muted
                        playsInline
                        controls={false}
                        className="w-full object-cover h-full rounded-[10px]"
                      />
                    ) : (
                      <Image
                        src={normalizeImageUrl(image)}
                        alt={`Gallery image ${i + 3}`}
                        fill
                        quality={90}
                        className="object-cover rounded-[10px]"
                        sizes="100vw"
                      />
                    )}
                  </div>
                );
                i++;
              }
              
              // Pair of images (side by side)
              if (i < remainingImages.length && i + 1 < remainingImages.length) {
                const firstImage = remainingImages[i];
                const secondImage = remainingImages[i + 1];
                const isFirstVideo = firstImage.toLowerCase().endsWith('.mp4') || firstImage.toLowerCase().endsWith('.webm');
                const isSecondVideo = secondImage.toLowerCase().endsWith('.mp4') || secondImage.toLowerCase().endsWith('.webm');
                
                rows.push(
                  <div key={`pair-${i}`} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative aspect-[3/4]">
                      {isFirstVideo ? (
                        <video
                          src={normalizeImageUrl(firstImage)}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full object-cover h-full rounded-[10px]"
                        />
                      ) : (
                        <Image
                          src={normalizeImageUrl(firstImage)}
                          alt={`Gallery image ${i + 3}`}
                          fill
                          quality={90}
                          className="object-cover rounded-[10px]"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      )}
                    </div>
                    <div className="relative aspect-[3/4]">
                      {isSecondVideo ? (
                        <video
                          src={normalizeImageUrl(secondImage)}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full object-cover h-full rounded-[10px]"
                        />
                      ) : (
                        <Image
                          src={normalizeImageUrl(secondImage)}
                          alt={`Gallery image ${i + 4}`}
                          fill
                          quality={90}
                          className="object-cover rounded-[10px]"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      )}
                    </div>
                  </div>
                );
                i += 2;
              }
            }
            
            return rows;
          })()}
        </div>
      </section>

      {/* Team Members Section */}
      {teamMembers && teamMembers.length > 0 && (
        <section className="px-5 py-8 flex">
          <div className="hidden md:block flex-1"></div>
          <div className="flex-1">
            <div className="flex flex-col gap-1">
              {teamMembers.map((member) => (
                <div key={member.id} className="text-sm">
                  <span className="font-semibold opacity-40 inline-block md:w-1/4">{member.role_title}:</span>{" "}
                  <span className="inline-block font-medium">{member.person_name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Projects Section */}
      {featuredProjects && featuredProjects.length > 0 && (
        <FeaturedProjects initialProjects={featuredProjects} />
      )}
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const projects = await fetchProjectsSSR();
    
    const paths = projects.map((project: Project) => ({
      params: { slug: project.slug },
    }));

    return {
      paths,
      fallback: 'blocking' // Yeni projeler için blocking fallback
    };
  } catch (error) {
    console.error('Error generating static paths:', error);
    return {
      paths: [],
      fallback: 'blocking'
    };
  }
};

export const getStaticProps: GetStaticProps = async (context) => {
  const slug = context.params?.slug as string;

  try {
    const [project, allProjects] = await Promise.all([
      fetchProjectBySlugSSR(slug),
      fetchProjectsSSR()
    ]);
    
    // Mevcut projeyi hariç tut, featured projeleri al ve 3 tane göster
    const moreProjects = allProjects
      .filter((p: Project) => p.slug !== slug && p.is_featured)
      .sort((a, b) => (a.featured_order || 0) - (b.featured_order || 0))
      .slice(0, 3);
    
    // Featured projects (mevcut projeyi hariç tut)
    const featuredProjects = allProjects
      .filter((p: Project) => p.slug !== slug && p.is_featured)
      .sort((a, b) => (a.featured_order || 0) - (b.featured_order || 0));
    
    // Gallery images ve team members'ı parallel fetch et
    const [galleryImages, teamMembers] = project ? await Promise.all([
      fetchProjectGallery(project.id),
      fetchProjectTeamMembers(project.id)
    ]) : [[], []];

    return {
      props: {
        project,
        moreProjects,
        galleryImages,
        teamMembers,
        featuredProjects,
      },
      revalidate: 60 // 1 dakikada bir yenile
    };
  } catch (error) {
    return { notFound: true };
  }
};

