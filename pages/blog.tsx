import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { fetchNews, normalizeImageUrl, fetchJournalBanner, JournalBanner as JournalBannerType } from "@/lib/api";
import React from "react";
import { GetStaticProps } from "next";
import SEO from "@/components/SEO";
import JournalBanner from "@/components/JournalBanner";

interface News {
  id: number;
  title: string;
  subtitle: string;
  slug: string;
  category_text: string;
  content?: string;
  image_path?: string;
  published_at: string;
  created_at: string;
  updated_at: string;
}

type Props = {
  news: News[];
  initialBanner?: JournalBannerType | null;
};

export default function BlogPage({ news, initialBanner = null }: Props) {
  const [showJournals, setShowJournals] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const journalStartTimeRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleAnimationNearComplete = React.useCallback(() => {
    // State değişikliğini geciktirerek yazı animasyonunun durmasını önle
    journalStartTimeRef.current = Date.now();
    // Bir sonraki frame'de state'i güncelle
    requestAnimationFrame(() => {
      setShowJournals(true);
    });
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Schema for blog page
  const schema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Journal - StudioBomonty",
    "description": "Insights, thoughts, and stories from our creative journey. Explore our latest articles on design, branding, and digital experiences.",
    "url": "https://studiobomonty.vercel.app/blog",
    "publisher": {
      "@type": "Organization",
      "name": "StudioBomonty",
      "logo": {
        "@type": "ImageObject",
        "url": "https://studiobomonty.vercel.app/images/logo.png"
      }
    },
    "blogPost": news.map(article => ({
      "@type": "BlogPosting",
      "headline": article.title,
      "description": article.title,
      "author": {
        "@type": "Organization",
        "name": "StudioBomonty"
      },
      "datePublished": article.published_at,
      "dateModified": article.updated_at,
      "url": `https://studiobomonty.vercel.app/blog/${article.slug}`,
      "image": article.image_path ? normalizeImageUrl(article.image_path) : null,
      "articleSection": article.category_text
    }))
  };

  return (
    <>
      <SEO 
        title="Journal - StudioBomonty"
        description="Insights, thoughts, and stories from our creative journey. Explore our latest articles on design, branding, and digital experiences."
        image="https://studiobomonty.vercel.app/images/blog-og.jpg"
        schema={schema}
      />
      {/* Banner Section */}
      <JournalBanner 
        initialBanner={initialBanner} 
        onAnimationNearComplete={handleAnimationNearComplete}
      />

      {/* News Grid - 4 columns */}
      <div className="min-h-screen p-4 pt-4 md:pt-0">
      <div className="grid lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 gap-5">
        {news.map((article, i) => (
          <Link key={article.id} href={`/blog/${article.slug}`} passHref>
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={showJournals ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: showJournals ? i * 0.05 : 0, duration: 0.5, ease: "easeOut" }}
              className="group cursor-pointer"
            >
              {/* Image - Square */}
              <div className="relative aspect-square w-full overflow-hidden rounded-[10px] mb-3">
                {article.image_path ? (
                  <Image
                    src={normalizeImageUrl(article.image_path)}
                    alt={article.title}
                    fill
                    quality={85}
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover transition duration-500 group-hover:opacity-70"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">No image</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="px-1">
                {/* Title */}
                <h3 className="text-sm font-medium opacity-50 mb-1" style={{ letterSpacing: 0 }}>{article.category_text}</h3>
                <p className="text-xl font-medium transition duration-500 group-hover:opacity-70">{article.title}</p>
              </div>
            </motion.article>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {news.length === 0 && (
        <div className="text-center py-20">
          <h3 className="text-xl font-medium text-gray-600 mb-1">No articles yet</h3>
          <p className="text-gray-500">Check back soon for new content.</p>
        </div>
      )}
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    const news = await fetchNews();
    const journalBanner = await fetchJournalBanner();

    return {
      props: {
        news,
        initialBanner: journalBanner,
      },
      revalidate: 600 // 10 dakikada bir yenile
    };
  } catch (error) {
    console.error("News SSG alınamadı:", error);
    return {
      props: {
        news: [],
        initialBanner: null,
      },
      revalidate: 600
    };
  }
};
