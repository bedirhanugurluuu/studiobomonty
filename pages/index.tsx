import IntroBanner from '@/components/IntroBanner'
import FeaturedProjects from '@/components/FeaturedProjects';
import AboutBanner from '@/components/AboutBanner';
import FromTheJournal from '@/components/FromTheJournal';
import SEO from '@/components/SEO';
import { GetStaticProps } from 'next';
import { fetchProjectsSSR, fetchIntroBannerSSR, Project, IntroBanner as IntroBannerType } from '@/lib/api';

interface HomeProps {
  featuredProjects: Project[];
  introBanner: IntroBannerType | null;
}

export default function Home({ featuredProjects, introBanner }: HomeProps) {
  // Schema for homepage
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "StudioBomonty - Creative Portfolio & Design Studio",
    "url": "https://studiobomonty.vercel.app",
    "description": "StudioBomonty is a creative design studio specializing in brand strategy, visual design, and digital experiences.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://studiobomonty.vercel.app/projects?search={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "StudioBomonty",
      "logo": {
        "@type": "ImageObject",
        "url": "https://studiobomonty.vercel.app/images/logo.png"
      }
    }
  };

  return (
    <>
      <SEO 
        title="StudioBomonty - Creative Portfolio & Design Studio"
        description="StudioBomonty is a creative design studio specializing in brand strategy, visual design, and digital experiences. We create compelling stories that leave lasting impressions."
        image="https://studiobomonty.vercel.app/images/og-image.jpg"
        schema={schema}
      />
      <div>
        <IntroBanner initialBanner={introBanner} />
        <FeaturedProjects initialProjects={featuredProjects} />
        <FromTheJournal />
        <AboutBanner />
      </div>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    // Paralel olarak verileri çek
    const [allProjects, introBanner] = await Promise.all([
      fetchProjectsSSR(),
      fetchIntroBannerSSR()
    ]);

    // Featured projeleri filtrele (yeni Supabase schema'sına göre)
    const featuredProjects = allProjects
      .filter((project: Project) => project.is_featured)
      .sort((a, b) => (a.featured_order || 0) - (b.featured_order || 0))
      .slice(0, 4);

    return {
      props: {
        featuredProjects,
        introBanner
      },
      revalidate: 60 // 1 dakikada bir yenile
    };
  } catch (error) {
    console.error('Static props error:', error);
    return {
      props: {
        featuredProjects: [],
        introBanner: null
      },
      revalidate: 60
    };
  }
};