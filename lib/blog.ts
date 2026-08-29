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

export async function getAllPosts(lang: 'id' | 'en'): Promise<BlogPost[]> {
  const { data, error } = await supabaseContributor
    .from('blog_posts')
    .select('slug, lang, title, excerpt, date, sector, author, content')
    .eq('lang', lang)
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
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as BlogPost;
}

export async function getAllSlugs(): Promise<string[]> {
  const { data, error } = await supabaseContributor
    .from('blog_posts')
    .select('slug');

  if (error || !data) return [];

  const slugs = new Set(data.map((row) => row.slug));
  return Array.from(slugs);
}
