import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import AnimatedText from "@/components/AnimatedText";
import ButtonWithHoverArrow from "@/components/ButtonWithHoverArrow";
import Link from "next/link";
import { GetStaticProps, GetStaticPaths } from "next";
import { fetchProjectBySlugSSR, fetchProjectsSSR, fetchProjectGallery, fetchProjectTeamMembers, normalizeImageUrl, Project, ProjectTeamMember, ProjectGalleryItem } from "@/lib/api";
import SEO from "@/components/SEO";
import FeaturedProjects from "@/components/FeaturedProjects";

interface ProjectDetailProps {
  project: Project | null;
  moreProjects: Project[];
  galleryItems: ProjectGalleryItem[];
  teamMembers: ProjectTeamMember[];
  featuredProjects: Project[];
}

export default function ProjectDetail({ project, moreProjects, galleryItems, teamMembers, featuredProjects }: ProjectDetailProps) {
  if (!project) return <p>Project not found.</p>;

  // Animation state
  const [animateContent, setAnimateContent] = useState(false);
  const [animateBottomContent, setAnimateBottomContent] = useState(false);

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
  const galleryMap = useMemo(() => {
    return galleryItems.reduce<Record<number, string>>((acc, item) => {
      acc[item.sort] = item.image_path;
      return acc;
    }, {});
  }, [galleryItems]);
  const horizontalImage = galleryMap[0];
  const verticalLeftImage = galleryMap[2];
  const verticalRightImage = galleryMap[3];
  const additionalVerticalRows = useMemo(() => {
    const rows: Array<{ leftOrder: number; rightOrder: number; leftImage?: string; rightImage?: string }> = [];
    const rowMap = new Map<number, { leftOrder: number; rightOrder: number; leftImage?: string; rightImage?: string }>();

    galleryItems
      .filter((item) => item.sort >= 4)
      .forEach((item) => {
        const leftOrder = item.sort % 2 === 0 ? item.sort : item.sort - 1;
        const rightOrder = leftOrder + 1;
        const existing = rowMap.get(leftOrder) || { leftOrder, rightOrder };

        if (item.sort % 2 === 0) {
          existing.leftImage = item.image_path;
        } else {
          existing.rightImage = item.image_path;
        }

        rowMap.set(leftOrder, existing);
      });

    rowMap.forEach((value) => rows.push(value));
    rows.sort((a, b) => a.leftOrder - b.leftOrder);
    return rows;
  }, [galleryItems]);

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
        className={`relative w-full overflow-hidden lg:transition-[padding] lg:duration-500 lg:ease-out ${animateContent ? 'lg:p-[15px]' : ''}`}
      >
        <div className="relative w-full overflow-hidden md:rounded-[10px]" style={{ height: "calc(100vh - 30px)" }}>
          {/* Desktop Banner */}
          {project.banner_media && (
            <Image
              src={normalizeImageUrl(project.banner_media)}
              alt="Banner"
              fill
              quality={95}
              sizes="100vw"
              style={{ objectFit: "cover", minHeight: "calc(100vh - 30px)" }}
              priority
              className="object-cover hidden lg:block"
            />
          )}
          
          {/* Mobile Banner */}
          {project.mobile_image_url && (
            <Image
              src={normalizeImageUrl(project.mobile_image_url)}
              alt="Banner"
              fill
              quality={95}
              sizes="100vw"
              style={{ objectFit: "cover", minHeight: "calc(100vh - 30px)" }}
              priority
              className="object-cover block lg:hidden"
            />
          )}
          
          {/* Fallback: If no mobile image, show desktop on mobile too */}
          {!project.mobile_image_url && project.banner_media && (
            <Image
              src={normalizeImageUrl(project.banner_media)}
              alt="Banner"
              fill
              quality={95}
              sizes="100vw"
              style={{ objectFit: "cover", minHeight: "calc(100vh - 30px)" }}
              priority
              className="object-cover block lg:hidden"
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
          {/* Order 0 - Full width (horizontal) */}
          {horizontalImage && (
            <div className="w-full relative aspect-[16/9]">
              {horizontalImage.toLowerCase().endsWith('.mp4') || horizontalImage.toLowerCase().endsWith('.webm') ? (
                <video
                  src={normalizeImageUrl(horizontalImage)}
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls={false}
                  className="w-full object-cover h-full rounded-[10px]"
                />
              ) : (
                <Image
                  src={normalizeImageUrl(horizontalImage)}
                  alt="Gallery image order 0"
                  fill
                  quality={90}
                  className="object-cover rounded-[10px]"
                  sizes="100vw"
                />
              )}
            </div>
          )}

          {/* Order 2-3 - Side by side slots, allow one side empty */}
          {(verticalLeftImage || verticalRightImage) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative aspect-[3/4]">
                {verticalLeftImage ? (
                  verticalLeftImage.toLowerCase().endsWith('.mp4') || verticalLeftImage.toLowerCase().endsWith('.webm') ? (
                    <video
                      src={normalizeImageUrl(verticalLeftImage)}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full object-cover h-full rounded-[10px]"
                    />
                  ) : (
                    <Image
                      src={normalizeImageUrl(verticalLeftImage)}
                      alt="Gallery image order 2"
                      fill
                      quality={90}
                      className="object-cover rounded-[10px]"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  )
                ) : (
                  <div className="w-full h-full rounded-[10px] bg-transparent" />
                )}
              </div>
              <div className="relative aspect-[3/4]">
                {verticalRightImage ? (
                  verticalRightImage.toLowerCase().endsWith('.mp4') || verticalRightImage.toLowerCase().endsWith('.webm') ? (
                    <video
                      src={normalizeImageUrl(verticalRightImage)}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full object-cover h-full rounded-[10px]"
                    />
                  ) : (
                    <Image
                      src={normalizeImageUrl(verticalRightImage)}
                      alt="Gallery image order 3"
                      fill
                      quality={90}
                      className="object-cover rounded-[10px]"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  )
                ) : (
                  <div className="w-full h-full rounded-[10px] bg-transparent" />
                )}
              </div>
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

          {/* Additional vertical rows: 4-5, 6-7, ... (even=left, odd=right) */}
          {additionalVerticalRows.map((row) => (
            <div key={`vertical-row-${row.leftOrder}`} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative aspect-[3/4]">
                {row.leftImage ? (
                  row.leftImage.toLowerCase().endsWith('.mp4') || row.leftImage.toLowerCase().endsWith('.webm') ? (
                    <video
                      src={normalizeImageUrl(row.leftImage)}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full object-cover h-full rounded-[10px]"
                    />
                  ) : (
                    <Image
                      src={normalizeImageUrl(row.leftImage)}
                      alt={`Gallery image order ${row.leftOrder}`}
                      fill
                      quality={90}
                      className="object-cover rounded-[10px]"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  )
                ) : (
                  <div className="w-full h-full rounded-[10px] bg-transparent" />
                )}
              </div>
              <div className="relative aspect-[3/4]">
                {row.rightImage ? (
                  row.rightImage.toLowerCase().endsWith('.mp4') || row.rightImage.toLowerCase().endsWith('.webm') ? (
                    <video
                      src={normalizeImageUrl(row.rightImage)}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full object-cover h-full rounded-[10px]"
                    />
                  ) : (
                    <Image
                      src={normalizeImageUrl(row.rightImage)}
                      alt={`Gallery image order ${row.rightOrder}`}
                      fill
                      quality={90}
                      className="object-cover rounded-[10px]"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  )
                ) : (
                  <div className="w-full h-full rounded-[10px] bg-transparent" />
                )}
              </div>
            </div>
          ))}
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
    const [galleryItems, teamMembers] = project ? await Promise.all([
      fetchProjectGallery(project.id),
      fetchProjectTeamMembers(project.id)
    ]) : [[], []];

    return {
      props: {
        project,
        moreProjects,
        galleryItems,
        teamMembers,
        featuredProjects,
      },
      revalidate: 60 // 1 dakikada bir yenile
    };
  } catch (error) {
    return { notFound: true };
  }
};

