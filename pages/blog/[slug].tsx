import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchNewsBySlug, fetchNews, normalizeImageUrl } from "@/lib/api";
import { GetStaticProps, GetStaticPaths } from "next";
import { useRouter } from "next/router";
import SEO from "@/components/SEO";
import FromTheJournal from "@/components/FromTheJournal";

interface News {
  id: number;
  title: string;
  category_text: string;
  slug: string;
  content?: string;
  image_path?: string;
  published_at: string;
  created_at: string;
  updated_at: string;
}

type Props = {
  article: News;
  relatedArticles: News[];
};

export default function BlogDetailPage({ article, relatedArticles }: Props) {
  const router = useRouter();
  const [animateText, setAnimateText] = useState(false);
  const [animateImage, setAnimateImage] = useState(false);
  const [animateContent, setAnimateContent] = useState(false);

  // Title'ı kelimelere böl
  const titleWords = useMemo(() => {
    if (!article.title) return [];
    return article.title
      .split(/\s+/)
      .map((word) => word.trim())
      .filter(Boolean);
  }, [article.title]);

  const joinedTitle = useMemo(() => titleWords.join(" "), [titleWords]);

  // "Studio News" kelimelerini ayır
  const studioNewsWords = useMemo(() => {
    return "Studio News".split(/\s+/).map((word) => word.trim()).filter(Boolean);
  }, []);

  useEffect(() => {
    // Text animasyonu
    setAnimateText(false);
    const textTimeout = window.setTimeout(() => setAnimateText(true), 60);
    
    // Image animasyonu (text'ten sonra)
    const imageTimeout = window.setTimeout(() => setAnimateImage(true), 300);
    
    // Content animasyonu (image'den sonra)
    const contentTimeout = window.setTimeout(() => setAnimateContent(true), 600);

    return () => {
      window.clearTimeout(textTimeout);
      window.clearTimeout(imageTimeout);
      window.clearTimeout(contentTimeout);
    };
  }, [joinedTitle]);

  if (router.isFallback) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-12 bg-gray-200 rounded w-2/3 mb-8"></div>
          <div className="aspect-video w-full bg-gray-200 rounded-lg mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  // Schema for blog post
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": article.title,
    "description": article.title,
    "image": article.image_path ? normalizeImageUrl(article.image_path) : null,
    "author": {
      "@type": "Organization",
      "name": "StudioBomonty"
    },
    "publisher": {
      "@type": "Organization",
      "name": "StudioBomonty",
      "logo": {
        "@type": "ImageObject",
        "url": "https://studiobomonty.vercel.app/images/logo.png"
      }
    },
    "datePublished": article.published_at,
    "dateModified": article.updated_at,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://studiobomonty.vercel.app/blog/${article.slug}`
    },
    "articleSection": article.category_text,
    "keywords": [article.category_text, "design", "creative", "portfolio"]
  };

  return (
    <>
      <SEO 
        title={`${article.title} - StudioBomonty Journal`}
        description={article.title}
        image={article.image_path ? normalizeImageUrl(article.image_path) : "https://studiobomonty.vercel.app/images/blog-og.jpg"}
        type="article"
        publishedTime={article.published_at}
        modifiedTime={article.updated_at}
        author="StudioBomonty"
        section={article.category_text}
        tags={[article.category_text, "design", "creative"]}
        schema={schema}
      />
      
      {/* Main Content - Max width 650px */}
      <div className="min-h-screen flex flex-col">
        <div className="flex justify-center px-4 py-10">
          <div className="w-full max-w-[650px] pt-40">
            {/* Studio News - Animated */}
            <div className="mb-3">
              <h2 className="text-sm font-medium uppercase tracking-wider opacity-50 text-center">
                {studioNewsWords.map((word, idx) => (
                  <span key={`studio-news-${word}-${idx}`} className="inline-block">
                    <span
                      className="inline-block transition-all duration-500 will-change-transform"
                      style={{
                        transitionDelay: `${idx * 120}ms`,
                        transitionProperty: "opacity, transform, filter",
                        opacity: animateText ? 1 : 0,
                        transform: animateText ? "translateY(0)" : "translateY(0.6em)",
                        filter: animateText ? "blur(0px)" : "blur(6px)",
                      }}
                    >
                      {word}
                    </span>
                    {idx !== studioNewsWords.length - 1 && <span>&nbsp;</span>}
                  </span>
                ))}
              </h2>
            </div>

            {/* Title - Animated */}
            <div className="mb-12">
              <h1 className="text-3xl md:text-5xl uppercase font-medium leading-tight text-center" style={{ lineHeight: ".9" }}>
                {titleWords.map((word, idx) => (
                  <span key={`title-${word}-${idx}`} className="inline-block" style={{ lineHeight: ".9" }}>
                    <span
                      className="inline-block transition-all duration-500 will-change-transform"
                      style={{
                        transitionDelay: `${(studioNewsWords.length * 120) + (idx * 120)}ms`,
                        transitionProperty: "opacity, transform, filter",
                        opacity: animateText ? 1 : 0,
                        transform: animateText ? "translateY(0)" : "translateY(0.6em)",
                        filter: animateText ? "blur(0px)" : "blur(6px)",
                      }}
                    >
                      {word}
                    </span>
                    {idx !== titleWords.length - 1 && <span>&nbsp;</span>}
                  </span>
                ))}
              </h1>
            </div>

            {/* Featured Image - Animated */}
            {article.image_path && (
              <div className="mb-20 max-w-[400px] mx-auto h-[400px]">
                <div className="relative w-full aspect-video overflow-hidden rounded-[10px] mx-auto h-[400px]">
                  <Image
                    src={normalizeImageUrl(article.image_path)}
                    alt={article.title}
                    quality={90}
                    width={400}
                    height={400}
                    className="object-cover transition-all duration-700 will-change-transform"
                    style={{
                      opacity: animateImage ? 1 : 0,
                      transform: animateImage ? "translateY(0)" : "translateY(2em)",
                      maxWidth: "400px",
                      height: "400px",
                    }}
                    priority
                  />
                </div>
              </div>
            )}

            {/* Content - Animated */}
            {article.content && (
              <div 
                className="blog-content prose prose-lg max-w-none transition-all duration-700 will-change-transform"
                style={{
                  opacity: animateContent ? 1 : 0,
                  transform: animateContent ? "translateY(0)" : "translateY(2em)",
                }}
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            )}
          </div>
        </div>

        {/* Related Articles - Full Width */}
        {relatedArticles.length > 0 && (
          <div className="w-full px-4 py-10 mt-16">
            <div>
              <div className="flex gap-4 items-center justify-between mb-5">
                <h2 className="text-lg font-medium uppercase md:text-xl">Articles</h2>
                <Link
                  href="/blog"
                  className="group relative inline-flex items-center text-xs font-medium uppercase tracking-[0.35em] text-white"
                >
                  <span className="relative inline-block transition-transform duration-300">
                    View All
                    <span className="absolute left-0 bottom-0 block h-px w-full origin-left scale-x-0 bg-white transition-transform duration-300 ease-out group-hover:scale-x-100" />
                  </span>
                </Link>
              </div>
              <div className="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-5">
                {relatedArticles.slice(0, 3).map((relatedArticle) => (
                  <Link
                    key={relatedArticle.id}
                    href={`/blog/${relatedArticle.slug}`}
                    className="group cursor-pointer"
                  >
                    <article className="group cursor-pointer">
                      {/* Image */}
                      <div className="relative aspect-square w-full overflow-hidden rounded-[10px] mb-2">
                        {relatedArticle.image_path ? (
                          <Image
                            src={normalizeImageUrl(relatedArticle.image_path)}
                            alt={relatedArticle.title}
                            fill
                            quality={85}
                            sizes="(max-width: 768px) 100vw, 33vw"
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
                        <h3 className="text-sm font-medium opacity-50 mb-1" style={{ letterSpacing: 0 }}>
                          {relatedArticle.category_text}
                        </h3>
                        <p className="text-xl font-medium transition duration-500 group-hover:opacity-70">
                          {relatedArticle.title}
                        </p>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export const getStaticPaths = async () => {
  try {
    const allNews = await fetchNews();
    const paths = allNews.map((article) => ({
      params: { slug: article.slug },
    }));

    return {
      paths,
      fallback: 'blocking', // Yeni slug'lar için blocking
    };
  } catch (error) {
    console.error("Static paths error:", error);
    return {
      paths: [],
      fallback: 'blocking',
    };
  }
};

export const getStaticProps = async ({ params }: { params: { slug: string } }) => {
  try {
    const slug = params.slug;
    const article = await fetchNewsBySlug(slug);

    if (!article) {
      return {
        notFound: true,
      };
    }

    // Get related articles (excluding current article)
    const allNews = await fetchNews();
    const relatedArticles = allNews
      .filter(n => n.id !== article.id)
      .slice(0, 3);

    return {
      props: {
        article,
        relatedArticles,
      },
      revalidate: 300, // 5 dakikada bir yenile
    };
  } catch (error) {
    console.error("Blog detay static props error:", error);
    return {
      notFound: true,
    };
  }
};
