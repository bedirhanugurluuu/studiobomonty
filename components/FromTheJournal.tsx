"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchFeaturedNews, normalizeImageUrl, News } from "@/lib/api";

export default function FromTheJournal() {
  const [featuredNews, setFeaturedNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedNews = async () => {
      try {
        const news = await fetchFeaturedNews();
        setFeaturedNews(news);
      } catch (error) {
        console.error("Featured news yüklenemedi:", error);
        // Fallback to static data if API fails
        setFeaturedNews([
          {
            id: "1",
            title: "The Art of Minimalism",
            category_text: "DESIGN",
            photographer: "Anna Surokin",
            subtitle: "The Art of Minimalism: Creating Impactful Designs with Less",
            slug: "sustainable-design",
            content: "The Art of Minimalism: Creating Impactful Designs with Less",
            image_path: "/images/journal1.jpg",
            published_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "2",
            title: "Art Direction from scratch",
            category_text: "ART DIRECTION",
            photographer: "Anna Surokin",
            subtitle: "Art Direction from scratch: Creating a unique art direction for a brand",
            slug: "urban-inspiration",
            content: "Art Direction from scratch: Creating a unique art direction for a brand",
            image_path: "/images/journal2.jpg",
            published_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "3",
            title: "Material Matters",
            category_text: "DESIGN",
            photographer: "Anna Surokin",
            subtitle: "We launched a new project redefining sustainable branding",
            slug: "material-matters",
            content: "We launched a new project redefining sustainable branding",
            image_path: "/images/journal3.jpg",
            published_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedNews();
  }, []);

  const items = useMemo(() => featuredNews.slice(0, 4), [featuredNews]);

  return (
    <section className="px-4 pb-24">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-lg font-medium uppercase md:text-xl">Articles</h2>
        <Link
          href="/blog"
          className="group relative inline-flex items-center text-xs font-medium uppercase tracking-[0.35em] text-white"
        >
          <span className="relative inline-block transition-transform duration-300">
            Read All Articles
            <span className="absolute left-0 bottom-0 block h-px w-full origin-left scale-x-0 bg-white transition-transform duration-300 ease-out group-hover:scale-x-100" />
          </span>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={`journal-skeleton-${index}`} className="animate-pulse">
              <div className="mb-4 aspect-square w-full rounded-[12px] bg-white/10" />
              <div className="space-y-2">
                <div className="h-3 w-1/4 rounded bg-white/10" />
                <div className="h-5 w-3/4 rounded bg-white/10" />
              </div>
            </div>
          ))
        ) : (
          items.map((article) => (
            <Link
              href={`/blog/${article.slug}`}
              key={article.id}
              className="group block"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-[10px]">
                {article.image_path ? (
                  <Image
                    src={normalizeImageUrl(article.image_path)}
                    alt={article.subtitle}
                    fill
                    loading="lazy"
                    className="object-cover transition duration-500 group-hover:opacity-70"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-white/10 text-white/60">
                    No image
                  </div>
                )}
              </div>

              <div className="mt-3 px-1">
                <h3 className="text-xs font-medium uppercase tracking-[0.35em] text-white/50">
                  {article.category_text}
                </h3>
                <p className="mt-2 text-lg font-medium leading-tight transition duration-500 text-white md:text-xl group-hover:opacity-70">
                  {article.subtitle}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
