import type { Metadata } from 'next';
import { permanentRedirect, notFound } from 'next/navigation';
import { getAllPosts, getPostsBySector, getPostBySlug } from '@/lib/blog';
import BlogIndexClient from './BlogIndexClient';

export const revalidate = 3600;

const VALID_LOCALES = ['en', 'id'] as const;
type Locale = (typeof VALID_LOCALES)[number];
function isValidLocale(value: string): value is Locale {
  return VALID_LOCALES.includes(value as Locale);
}

interface Props {
  params: { locale: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isValidLocale(params.locale)) return {};

  const title = params.locale === 'en' ? 'QuizFrend Blog' : 'Blog QuizFrend';
  const description =
    params.locale === 'en'
      ? 'Educational articles across disciplines to accompany your analysis practice on QuizFrend.'
      : 'Artikel edukatif seputar berbagai disiplin ilmu untuk menemani latihan analisismu di QuizFrend.';

  return {
    title,
    description,
    alternates: {
      canonical: `https://www.quizfrend.my.id/blog/${params.locale}`,
      languages: {
        en: 'https://www.quizfrend.my.id/blog/en',
        id: 'https://www.quizfrend.my.id/blog/id',
      },
    },
  };
}

export default async function BlogIndexOrLegacyPage({ params }: Props) {
  if (isValidLocale(params.locale)) {
    const posts = await getAllPosts(params.locale);
    return <BlogIndexClient posts={posts} locale={params.locale} />;
  }

  // params.locale bukan 'en'/'id' — kemungkinan besar ini URL LAMA (v2: /blog/[sector])
  const sectorPosts = await getPostsBySector(params.locale, 'en');
  if (sectorPosts.length > 0) {
    permanentRedirect(`/blog/en/${params.locale}`);
  }

  // Atau URL SANGAT lama (v1: /blog/[slug] flat)
  const post = await getPostBySlug(params.locale, 'en');
  if (post) {
    permanentRedirect(`/blog/en/${post.sector}/${post.slug}`);
  }

  notFound();
}
