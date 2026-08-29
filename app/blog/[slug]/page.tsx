import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { getPostBySlug, getAllSlugs } from '@/lib/blog';

export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug, 'id');
  if (!post) return {};
  return {
    title: `${post.title} — QuizFrend`,
    description: post.excerpt,
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug, 'id');

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-base-bg px-4 py-10 max-w-2xl mx-auto">
      <Link href="/blog" className="text-sm text-accent mb-6 inline-block">
        ← Kembali ke Blog
      </Link>

      <span className="text-xs uppercase text-accent font-medium">
        {post.sector}
      </span>
      <h1 className="text-2xl font-bold text-text-primary mt-1 mb-2">
        {post.title}
      </h1>
      <p className="text-sm text-text-muted mb-8">
        {post.author} · {post.date}
      </p>

      <article className="prose prose-sm max-w-none text-text-primary">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {post.content}
        </ReactMarkdown>
      </article>
    </main>
  );
}
