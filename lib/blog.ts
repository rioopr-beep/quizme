import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const BLOG_DIR = path.join(process.cwd(), 'content/blog');

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

function getAllFilenames(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'));
}

// filename format: [slug].[lang].md → e.g. kenapa-langit-biru.id.md
function parseFilename(filename: string): { slug: string; lang: string } | null {
  const match = filename.match(/^(.+)\.(id|en)\.md$/);
  if (!match) return null;
  return { slug: match[1], lang: match[2] };
}

export function getAllPosts(lang: 'id' | 'en'): BlogPost[] {
  const filenames = getAllFilenames();
  const posts: BlogPost[] = [];

  for (const filename of filenames) {
    const parsed = parseFilename(filename);
    if (!parsed || parsed.lang !== lang) continue;

    const fullPath = path.join(BLOG_DIR, filename);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    posts.push({
      slug: parsed.slug,
      lang: lang,
      title: data.title || '',
      excerpt: data.excerpt || '',
      date: data.date || '',
      sector: data.sector || '',
      author: data.author || '',
      content,
    });
  }

  // urutkan dari terbaru
  posts.sort((a, b) => (a.date < b.date ? 1 : -1));
  return posts;
}

export function getPostBySlug(slug: string, lang: 'id' | 'en'): BlogPost | null {
  const filename = `${slug}.${lang}.md`;
  const fullPath = path.join(BLOG_DIR, filename);

  if (!fs.existsSync(fullPath)) return null;

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  return {
    slug,
    lang,
    title: data.title || '',
    excerpt: data.excerpt || '',
    date: data.date || '',
    sector: data.sector || '',
    author: data.author || '',
    content,
  };
}

export function getAllSlugs(): string[] {
  const filenames = getAllFilenames();
  const slugs = new Set<string>();
  for (const filename of filenames) {
    const parsed = parseFilename(filename);
    if (parsed) slugs.add(parsed.slug);
  }
  return Array.from(slugs);
  }
