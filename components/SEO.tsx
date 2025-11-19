import Head from 'next/head';
import { useRouter } from 'next/router';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
  schema?: any;
  canonical?: string;
}

export default function SEO({
  title = "StudioBomonty - Creative Portfolio & Design Studio",
  description = "StudioBomonty is a creative design studio specializing in brand strategy, visual design, and digital experiences. We create compelling stories that leave lasting impressions.",
  image = "https://studiobomonty.vercel.app/images/og-image.jpg",
  type = "website",
  publishedTime,
  modifiedTime,
  author = "StudioBomonty",
  section,
  tags = [],
  schema,
  canonical
}: SEOProps) {
  const router = useRouter();
  const url = canonical || `https://studiobomonty.vercel.app${router.asPath}`;

  // Default schema for organization
  const defaultSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "StudioBomonty",
    "url": "https://studiobomonty.vercel.app",
    "logo": "https://studiobomonty.vercel.app/images/logo.png",
    "description": "Creative design studio specializing in brand strategy and visual design",
    "sameAs": [
      "https://instagram.com/studiobomonty",
      "https://linkedin.com/company/studiobomonty"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+45-123-456-789",
      "contactType": "customer service",
      "email": "hello@studiobomonty.com"
    }
  };

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="StudioBomonty" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      <meta property="twitter:creator" content="@studiobomonty" />
      
      {/* Article specific meta tags */}
      {type === 'article' && (
        <>
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {author && <meta property="article:author" content={author} />}
          {section && <meta property="article:section" content={section} />}
          {tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema || defaultSchema)
        }}
      />
      
      {/* Additional SEO meta tags */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content={author} />
      <meta name="keywords" content="design studio, brand strategy, visual design, creative agency, portfolio" />
      
      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://hyjzyillgvjuuuktfqum.supabase.co" />
      <link rel="dns-prefetch" href="https://hyjzyillgvjuuuktfqum.supabase.co" />
    </Head>
  );
}
