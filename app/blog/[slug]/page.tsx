import type { Metadata } from 'next';
import Link from 'next/link';
import { getPostBySlug } from '@/lib/blog';
import BlogPostClient from './BlogPostClient';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug(params.slug, 'en');
  if (!post) return {};

  const description = post.excerpt?.slice(0, 160) ?? '';
  const url = `https://www.quizfrend.my.id/blog/${post.slug}`;

  return {
    title: post.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description,
      url,
      type: 'article',
      siteName: 'QuizFrend',
      locale: 'id_ID',
      images: [
        {
          url: 'https://www.quizfrend.my.id/opengraph-image',
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getPostBySlug(params.slug, 'en');

  if (!post) {
    return (
      <main className="min-h-screen bg-base-bg px-4 py-10 max-w-2xl mx-auto">
        <Link href="/blog" className="text-sm text-accent mb-6 inline-block">
          ← Back to Blog
        </Link>
        <p className="text-text-muted">Article not found.</p>
      </main>
    );
  }

  return <BlogPostClient slug={params.slug} initialPost={post} />;
}
