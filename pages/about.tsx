import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { GetStaticProps } from 'next';
import { fetchAbout, AboutContent, fetchProjectsSSR, Project, fetchServicesSSR, Service, fetchRecognitionWithItemsSSR, Recognition, RecognitionItem, fetchClientsWithSettingsSSR, ClientsSettings, Client, fetchLatestProjectsBannerSSR, LatestProjectsBanner } from '@/lib/api';
import SEO from '@/components/SEO';

const AnimatedAbout = dynamic(() => import("@/components/AnimatedAbout"), {
});

interface AboutPageProps {
  aboutContent: AboutContent;
  projects: Project[];
  services: Service[];
  recognition: Recognition | null;
  recognitionItems: RecognitionItem[];
  clientsSettings: ClientsSettings | null;
  clients: Client[];
  latestProjectsBanner: LatestProjectsBanner | null;
}

export default function AboutPage({ aboutContent, projects, services, recognition, recognitionItems, clientsSettings, clients, latestProjectsBanner }: AboutPageProps) {
  // Schema for about page
  const schema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About - StudioBomonty",
    "description": aboutContent?.description || "A collective of visionaries shaping tomorrow, where creativity and innovation intersect.",
    "url": "https://studiobomonty.vercel.app/about",
      "mainEntity": {
        "@type": "Organization",
        "name": "StudioBomonty",
        "description": aboutContent?.description || "Creative design studio specializing in brand strategy and visual design"
      }
  };

  return (
    <>
      <SEO 
        title={`${aboutContent?.title || "About"} - StudioBomonty`}
        description={aboutContent?.description || "A collective of visionaries shaping tomorrow, where creativity and innovation intersect. Our studio is built on the belief that bold ideas and meticulous execution drive meaningful design."}
        image={aboutContent?.image_path ? `https://hyjzyillgvjuuuktfqum.supabase.co/storage/v1/object/public/uploads/${aboutContent.image_path}` : "https://studiobomonty.vercel.app/images/about-og.jpg"}
        schema={schema}
      />
      <AnimatedAbout initialContent={aboutContent} initialProjects={projects} initialServices={services} initialRecognition={recognition} initialRecognitionItems={recognitionItems} initialClientsSettings={clientsSettings} initialClients={clients} initialLatestProjectsBanner={latestProjectsBanner} />
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    const [aboutContent, projects, services, recognitionData, clientsData, latestProjectsBanner] = await Promise.all([
      fetchAbout(),
      fetchProjectsSSR(),
      fetchServicesSSR(),
      fetchRecognitionWithItemsSSR(),
      fetchClientsWithSettingsSSR(),
      fetchLatestProjectsBannerSSR()
    ]);

    return {
      props: {
        aboutContent,
        projects,
        services,
        recognition: recognitionData.recognition,
        recognitionItems: recognitionData.items,
        clientsSettings: clientsData.settings,
        clients: clientsData.clients,
        latestProjectsBanner
      },
      revalidate: 300 // 5 dakikada bir yenile (daha uzun cache)
    };
  } catch (error) {
    console.error('About static props error:', error);
    return {
      props: {
        aboutContent: {
          id: '',
          title: "About Us",
          subtitle: "A collective of visionaries shaping tomorrow",
          description: "A collective of visionaries shaping tomorrow, where creativity and innovation intersect. Our studio is built on the belief that bold ideas and meticulous execution drive meaningful design.",
          image_path: "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        services: [],
        recognition: null,
        recognitionItems: [],
        clientsSettings: null,
        clients: [],
        latestProjectsBanner: null
      },
      revalidate: 60
    };
  }
};

