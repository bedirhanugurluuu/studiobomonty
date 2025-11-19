import { supabase } from './supabase';

// TypeScript interfaces
export interface Project {
  id: string; // UUID for Supabase
  title: string;
  subtitle: string;
  description: string;
  banner_media?: string;
  video_url?: string;
  is_featured: boolean;
  featured_order?: number;
  client_name?: string;
  tab1?: string;
  tab2?: string;
  external_link?: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectTeamMember {
  id: string;
  project_id: string;
  role_title: string;
  person_name: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface IntroBanner {
  id: string;
  title_line1?: string;
  image?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AboutContent {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  description: string;
  main_text: string;
  image_path?: string;
  created_at: string;
  updated_at: string;
}

export interface News {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  image_path?: string;
  category_text?: string;
  photographer?: string;
  published_at?: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface AboutGalleryImage {
  id: string;
  image_path: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface AboutBanner {
  id: string;
  image: string;
  title_desktop: string;
  title_mobile: string;
  button_text: string;
  button_link: string;
  created_at: string;
  updated_at: string;
}

export interface Footer {
  id: string;
  sitemap_items: Array<{ name: string; link: string }>;
  social_items: Array<{ name: string; link: string }>;
  copyright_text: string;
  created_at: string;
  updated_at: string;
}

export interface Award {
  id: string;
  title: string;
  link: string;
  date: string;
  subtitle: string;
  halo: string;
  image_path?: string;
  year?: number;
  created_at: string;
  updated_at: string;
}

export interface SliderItem {
  id: string;
  title: string;
  subtitle: string;
  sub_subtitle: string;
  image_path: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface WhatWeDoContent {
  id: string;
  title: string;
  subtitle: string;
  service_1_title: string;
  service_1_items: string;
  service_2_title: string;
  service_2_items: string;
  service_3_title: string;
  service_3_items: string;
  created_at: string;
  updated_at: string;
}

export interface ContactContent {
  id: string;
  title: string;
  phone: string;
  email: string;
  social_items: Array<{ name: string; link: string }>;
  image_path?: string;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  image_path?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Recognition {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface RecognitionItem {
  id: string;
  recognition_id: string;
  organization_name: string;
  awards: string[];
  counts: string[];
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface ClientsSettings {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  name: string;
  image_path?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface LatestProjectsBanner {
  id: string;
  title: string;
  subtitle: string;
  image_path?: string;
  created_at: string;
  updated_at: string;
}

// Görsel URL'lerini normalize eden utility fonksiyonu
export const normalizeImageUrl = (imagePath: string): string => {
  if (!imagePath) return "";

  let p = imagePath.trim();

  // Eğer zaten tam URL ise (http/https ile başlıyorsa) direkt döndür
  if (p.startsWith("http://") || p.startsWith("https://")) {
    return p;
  }

  // Eğer data URL ise direkt döndür
  if (p.startsWith("data:")) {
    return p;
  }

  // Eğer Supabase Storage URL formatında ise direkt döndür
  if (p.includes("supabase.co/storage/v1/object/public/")) {
    return p;
  }

  // Eğer local path ise (/uploads/ ile başlıyorsa) Supabase URL'ine dönüştür
  if (p.startsWith("/uploads/")) {
    const fileName = p.replace("/uploads/", "");
    return `https://hyjzyillgvjuuuktfqum.supabase.co/storage/v1/object/public/uploads/${fileName}`;
  }

  // Eğer sadece dosya adı ise, uploads bucket'ına yönlendir
  if (!p.includes("/") && !p.includes("\\")) {
    return `https://hyjzyillgvjuuuktfqum.supabase.co/storage/v1/object/public/uploads/${p}`;
  }

  // Diğer durumlar için fallback
  return p;
};

// Client-side API functions
export async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchProjectsSSR(): Promise<Project[]> {
  return fetchProjects();
}

export async function fetchFeaturedProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('featured', true)
    .order('featured_order', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function fetchProjectBySlug(slug: string): Promise<Project | null> {
  const raw = decodeURIComponent(slug || "").trim();

  // Single optimized query with case-insensitive match
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .ilike('slug', raw)
    .single();

  if (error) throw error;
  return data as Project;
}

export async function fetchProjectGallery(projectId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('project_gallery')
    .select('image_path')
    .eq('project_id', projectId)
    .order('sort', { ascending: true });

  if (error) throw error;
  return data?.map(item => item.image_path) || [];
}

export async function fetchProjectTeamMembers(projectId: string): Promise<ProjectTeamMember[]> {
  const { data, error } = await supabase
    .from('project_team_members')
    .select('*')
    .eq('project_id', projectId)
    .order('order_index', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function fetchIntroBanner(): Promise<IntroBanner | null> {
  const { data, error } = await supabase
    .from('intro_banners')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') throw error;
  return data ?? null;
}

export async function fetchIntroBannerSSR(): Promise<IntroBanner | null> {
  return fetchIntroBanner();
}

export async function fetchAbout(): Promise<AboutContent | null> {
  const { data, error } = await supabase
    .from('about_content')
    .select('*')
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function fetchAboutContent(): Promise<AboutContent | null> {
  return fetchAbout();
}

export async function fetchAboutGallery(): Promise<AboutGalleryImage[]> {
  const { data, error } = await supabase
    .from('about_gallery')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function fetchNews(): Promise<News[]> {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchAboutBanner(): Promise<AboutBanner | null> {
  const { data, error } = await supabase
    .from('about_banner')
    .select('*')
    .single();

  if (error) {
    console.error('Error fetching about banner:', error);
    return null;
  }

  return data;
}

export async function updateAboutBanner(banner: Partial<AboutBanner>): Promise<AboutBanner | null> {
  const { data, error } = await supabase
    .from('about_banner')
    .upsert(banner)
    .select()
    .single();

  if (error) {
    console.error('Error updating about banner:', error);
    return null;
  }

  return data;
}

export async function fetchFooter(): Promise<Footer | null> {
  const { data, error } = await supabase
    .from('footer')
    .select('*')
    .single();

  if (error) {
    console.error('Error fetching footer:', error);
    return null;
  }

  return data;
}

export async function updateFooter(footer: Partial<Footer>): Promise<Footer | null> {
  const { data, error } = await supabase
    .from('footer')
    .upsert(footer)
    .select()
    .single();

  if (error) {
    console.error('Error updating footer:', error);
    return null;
  }

  return data;
}

export async function fetchFeaturedNews(): Promise<News[]> {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false, nullsFirst: false })
    .limit(4);

  if (error) throw error;
  return data || [];
}

export async function fetchNewsBySlug(slug: string): Promise<News | null> {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return data;
}

export async function fetchAwards(): Promise<Award[]> {
  const { data, error } = await supabase
    .from('awards')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchSlider(): Promise<SliderItem[]> {
  const { data, error } = await supabase
    .from('about_slider')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function fetchSliderItems(): Promise<SliderItem[]> {
  return fetchSlider();
}

export async function fetchWhatWeDo(): Promise<WhatWeDoContent | null> {
  const { data, error } = await supabase
    .from('what_we_do')
    .select('*')
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function fetchWhatWeDoContent(): Promise<WhatWeDoContent | null> {
  return fetchWhatWeDo();
}

export async function fetchContact(): Promise<ContactContent | null> {
  const { data, error } = await supabase
    .from('contact')
    .select('*')
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  
  // Eğer data varsa ama social_items yoksa, fallback değer ekle
  if (data && !data.social_items) {
    return {
      ...data,
      social_items: [
        { name: "Instagram", link: "#" },
        { name: "LinkedIn", link: "#" }
      ]
    };
  }
  
  return data;
}

export async function fetchContactContent(): Promise<ContactContent | null> {
  return fetchContact();
}

export async function fetchServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function fetchServicesSSR(): Promise<Service[]> {
  return fetchServices();
}

export async function fetchRecognition(): Promise<Recognition | null> {
  const { data, error } = await supabase
    .from('recognitions')
    .select('*')
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function fetchRecognitionItems(recognitionId: string): Promise<RecognitionItem[]> {
  const { data, error } = await supabase
    .from('recognition_items')
    .select('*')
    .eq('recognition_id', recognitionId)
    .order('order_index', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function fetchRecognitionWithItems(): Promise<{ recognition: Recognition | null; items: RecognitionItem[] }> {
  const recognition = await fetchRecognition();
  if (!recognition) {
    return { recognition: null, items: [] };
  }
  const items = await fetchRecognitionItems(recognition.id);
  return { recognition, items };
}

export async function fetchRecognitionWithItemsSSR(): Promise<{ recognition: Recognition | null; items: RecognitionItem[] }> {
  return fetchRecognitionWithItems();
}

export async function fetchClientsSettings(): Promise<ClientsSettings | null> {
  const { data, error } = await supabase
    .from('clients_settings')
    .select('*')
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function fetchClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function fetchClientsWithSettings(): Promise<{ settings: ClientsSettings | null; clients: Client[] }> {
  const settings = await fetchClientsSettings();
  const clients = await fetchClients();
  return { settings, clients };
}

export async function fetchClientsWithSettingsSSR(): Promise<{ settings: ClientsSettings | null; clients: Client[] }> {
  return fetchClientsWithSettings();
}

export async function fetchLatestProjectsBanner(): Promise<LatestProjectsBanner | null> {
  const { data, error } = await supabase
    .from('latest_projects_banner')
    .select('*')
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function fetchLatestProjectsBannerSSR(): Promise<LatestProjectsBanner | null> {
  return fetchLatestProjectsBanner();
}

// SSR versions for getServerSideProps
export async function fetchProjectBySlugSSR(slug: string): Promise<Project | null> {
  return fetchProjectBySlug(slug);
}

export async function fetchNewsBySlugSSR(slug: string): Promise<News | null> {
  return fetchNewsBySlug(slug);
}

export async function fetchNewsSSR(): Promise<News[]> {
  return fetchNews();
}
