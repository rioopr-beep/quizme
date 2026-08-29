import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';

export const metadata = {
  title: 'Blog — QuizFrend',
  description: 'Artikel edukatif seputar analisis lintas disiplin di QuizFrend.',
};

export default function BlogIndexPage() {
  const posts = getAllPosts('id');

  return (
    <main className="min-h-screen bg-base-bg px-4 py-10 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-text-primary mb-2">Blog QuizFrend</h1>
      <p className="text-text-secondary mb-8">
        Artikel edukatif seputar berbagai disiplin ilmu untuk menemani latihan analisismu.
      </p>

      {posts.length === 0 && (
        <p className="text-text-muted">Belum ada artikel.</p>
      )}

      <div className="flex flex-col gap-4">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block rounded-floating border border-base-border bg-base-surface p-4 hover:shadow-floating-sm transition"
          >
            <span className="text-xs uppercase text-accent font-medium">
              {post.sector}
            </span>
            <h2 className="text-lg font-semibold text-text-primary mt-1">
              {post.title}
            </h2>
            <p className="text-sm text-text-secondary mt-1">{post.excerpt}</p>
            <span className="text-xs text-text-muted mt-2 block">{post.date}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
