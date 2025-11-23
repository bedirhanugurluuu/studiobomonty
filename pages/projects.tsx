import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { fetchProjectsSSR, normalizeImageUrl } from "@/lib/api";
import React from "react";
import { GetStaticProps } from "next";
import SEO from "@/components/SEO";

interface Project {
  id: number;
  title: string;
  subtitle: string;
  slug: string;
  client_name?: string;
  year?: number;
  role?: string;
  thumbnail_media?: string;
  banner_media?: string;
  description?: string;
  is_featured?: boolean;
  featured_order?: number;
  display_order?: number; // Proje sıralaması için
  tab1?: string;
  tab2?: string;
  created_at: string;
  updated_at: string;
}

type Props = {
  projects: Project[];
};

export default function ProjectsPage({ projects }: Props) {
  const normalizeMedia = (path: string) => {
    if (!path) return { type: "unknown", url: "" };
    const fullUrl = normalizeImageUrl(path);
    if (fullUrl.toLowerCase().endsWith(".mp4")) return { type: "video", url: fullUrl };
    if (/\.(jpg|jpeg|png|gif|webp)$/i.test(fullUrl)) return { type: "image", url: fullUrl };
    return { type: "unknown", url: fullUrl };
  };

  // Schema for projects page
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Projects - StudioBomonty",
    "description": "Explore our creative projects and design work. From brand strategy to visual design, discover how we create compelling stories.",
    "url": "https://studiobomonty.vercel.app/projects",
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": projects.length,
      "itemListElement": projects.map((project, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "CreativeWork",
          "name": project.title,
          "description": project.subtitle,
          "url": `https://studiobomonty.vercel.app/projects/${project.slug}`,
          "creator": {
            "@type": "Organization",
            "name": "StudioBomonty"
          },
          "dateCreated": project.created_at,
          "dateModified": project.updated_at
        }
      }))
    }
  };

  return (
    <>
      <SEO
        title="Projects - StudioBomonty"
        description="Explore our creative projects and design work. From brand strategy to visual design, discover how we create compelling stories that leave lasting impressions."
        image="https://studiobomonty.vercel.app/images/projects-og.jpg"
        schema={schema}
      />
      <div className="min-h-screen px-4 pt-50 pb-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-5xl font-medium uppercase">
          Projects
        </h1>
      </div>

      {/* GRID VIEW */}
      <motion.div layout className="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-5">
          {projects.map((project, i) => {
            const media = normalizeMedia(project.banner_media || "");

            return (
              <Link key={project.id} href={`/projects/${project.slug}`} passHref >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group cursor-pointer"
                >
                  {/* Image Container */}
                  <div className="relative overflow-hidden rounded-[10px] mb-4" style={{ aspectRatio: 2000 / 1333 }}>
                    {media.type === "video" ? (
                      <video
                        src={media.url}
                        autoPlay
                        muted
                        loop
                        controls={false}
                        playsInline
                        className="w-full object-cover h-full rounded-[10px]"
                      />
                    ) : media.type === "image" ? (
                      <Image
                        src={media.url}
                        alt={project.title}
                        width={600}
                        height={400}
                        quality={90}
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="w-full object-cover h-full scale-105 group-hover:scale-100 transition-transform duration-500 rounded-[10px]"
                      />
                    ) : (
                      <div className="w-full bg-gray-200 flex items-center justify-center h-full rounded-[10px]">
                        <span>Media yok</span>
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div 
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: 'linear-gradient(rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0) 70%)',
                        opacity: 1
                      }}
                    />

                    {/* Tabs - Top Right */}
                    {(project.tab1 || project.tab2) && (
                      <div className="absolute top-4 right-4 flex gap-2 z-10">
                        {project.tab1 && (
                          <div className="text-white px-3 py-2 rounded-sm text-xs font-semibold" style={{ backgroundColor: "rgba(255, 255, 255, 0.1)", backdropFilter: "blur(10px)" }}>
                            {project.tab1}
                          </div>
                        )}
                        {project.tab2 && (
                          <div className="text-white px-3 py-2 rounded-sm text-xs font-semibold" style={{ backgroundColor: "rgba(255, 255, 255, 0.1)", backdropFilter: "blur(10px)" }}>
                            {project.tab2}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Title and Subtitle - Below Image */}
                  <div className="text-white font-regular flex flex-col md:flex-row justify-between gap-0 md:gap-2">
                    <h2 className="text-lg font-semibold">{project.title}</h2>
                    <p className="text-md opacity-50 group-hover:opacity-100 transition-opacity">
                      {project.subtitle}
                    </p>
                  </div>
                </motion.div>
              </Link>
            );
          })}
      </motion.div>
      </div>
    </>
  );
}

// SSG ile veri çekmek için:
export const getStaticProps: GetStaticProps = async () => {
  try {
    const projects = await fetchProjectsSSR();

    return {
      props: {
        projects,
      },
      revalidate: 300 // 5 dakikada bir yenile
    };
  } catch (error) {
    console.error("SSG: Projeler alınamadı:", error);
    return {
      props: {
        projects: [],
      },
      revalidate: 300
    };
  }
};
