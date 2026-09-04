import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostBySlug, getRandomRelatedPosts } from '@/lib/blog';
import BlogPostClient from './BlogPostClient';

const VALID_LOCALES = ['en', 'id'] as const;
type Locale = (typeof VALID_LOCALES)[number];
function isValidLocale(value: string): value is Locale {
  return VALID_LOCALES.includes(value as Locale);
}

interface Props {
  params: { locale: string; sector: string; slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isValidLocale(params.locale)) return {};
  const post = await getPostBySlug(params.slug, params.locale);
  if (!post) return {};

  const description = post.excerpt?.slice(0, 160) ?? '';
  const url = `https://www.quizfrend.my.id/blog/${params.locale}/${post.sector}/${post.slug}`;

  return {
    title: post.title,
    description,
    alternates: {
      canonical: url,
      languages: {
        en: `https://www.quizfrend.my.id/blog/en/${post.sector}/${post.slug}`,
        id: `https://www.quizfrend.my.id/blog/id/${post.sector}/${post.slug}`,
      },
    },
    openGraph: {
      title: post.title,
      description,
      url,
      type: 'article',
      siteName: 'QuizFrend',
      locale: params.locale === 'id' ? 'id_ID' : 'en_US',
      images: [{ url: 'https://www.quizfrend.my.id/opengraph-image', width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title: post.title, description },
  };
}

export default async function BlogPostPage({ params }: Props) {
  if (!isValidLocale(params.locale)) notFound();

  const post = await getPostBySlug(params.slug, params.locale);

  if (!post || post.sector !== params.sector) {
    return (
      <main className="min-h-screen bg-base-bg px-4 py-10 max-w-2xl mx-auto">
        <Link href={`/blog/${params.locale}`} className="text-sm text-accent mb-6 inline-block">
          ← Back to Blog
        </Link>
        <p className="text-text-muted">Article not found.</p>
      </main>
    );
  }

    const relatedPosts = await getRandomRelatedPosts(params.slug, params.locale, 6, post.sector);

  return <BlogPostClient post={post} locale={params.locale} relatedPosts={relatedPosts} />;
}
