import { supabaseContributor } from './supabaseContributor';

export interface BlogPost {
  slug: string;
  lang: 'id' | 'en';
  title: string;
  excerpt: string;
  date: string;
  sector: string;
  author: string;
  content: string;
}

export interface RelatedPost {
  slug: string;
  title: string;
  excerpt: string;
  sector: string;
}

export async function getAllPosts(lang: 'id' | 'en'): Promise<BlogPost[]> {
  const { data, error } = await supabaseContributor
    .from('blog_posts')
    .select('slug, lang, title, excerpt, date, sector, author, content')
    .eq('lang', lang)
    .eq('status', 'published')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }

  return data as BlogPost[];
}

export async function getPostBySlug(
  slug: string,
  lang: 'id' | 'en'
): Promise<BlogPost | null> {
  const { data, error } = await supabaseContributor
    .from('blog_posts')
    .select('slug, lang, title, excerpt, date, sector, author, content')
    .eq('slug', slug)
    .eq('lang', lang)
    .eq('status', 'published')
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as BlogPost;
}

export async function getAllSlugs(): Promise<string[]> {
  const { data, error } = await supabaseContributor
    .from('blog_posts')
    .select('slug')
    .eq('status', 'published');

  if (error || !data) return [];

  const slugs = new Set(data.map((row) => row.slug));
  return Array.from(slugs);
}

export async function getDraftPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabaseContributor
    .from('blog_posts')
    .select('slug, lang, title, excerpt, date, sector, author, content')
    .eq('lang', 'id')
    .eq('status', 'draft')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching draft posts:', error);
    return [];
  }

  return data as BlogPost[];
}

export async function getRandomRelatedPosts(
  excludeSlug: string,
  lang: 'id' | 'en',
  count = 6
): Promise<RelatedPost[]> {
  const { data, error } = await supabaseContributor
    .from('blog_posts')
    .select('slug, title, excerpt, sector')
    .eq('lang', lang)
    .eq('status', 'published')
    .neq('slug', excludeSlug);

  if (error || !data) {
    console.error('Error fetching related posts:', error);
    return [];
  }

  // Acak urutan (Fisher-Yates shuffle)
  const shuffled = [...data];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count) as RelatedPost[];
}

export async function getPostsBySector(sector: string, lang: 'id' | 'en'): Promise<BlogPost[]> {
  const { data, error } = await supabaseContributor
    .from('blog_posts')
    .select('slug, lang, title, excerpt, date, sector, author, content')
    .eq('sector', sector)
    .eq('lang', lang)
    .eq('status', 'published')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching posts by sector:', error);
    return [];
  }

  return data as BlogPost[];
    }
