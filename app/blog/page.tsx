'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  sector: string;
  author: string;
}

export default function BlogIndexPage() {
  const { language } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/blog?lang=${language}`)
      .then((res) => res.json())
      .then((data) => setPosts(data.posts || []))
      .finally(() => setLoading(false));
  }, [language]);

  const t = {
    id: {
      title: 'Blog QuizFrend',
      subtitle: 'Artikel edukatif seputar berbagai disiplin ilmu untuk menemani latihan analisismu.',
      empty: 'Belum ada artikel.',
    },
    en: {
      title: 'QuizFrend Blog',
      subtitle: 'Educational articles across disciplines to accompany your analysis practice.',
      empty: 'No articles yet.',
    },
  }[language];

  return (
    <main className="min-h-screen bg-base-bg px-4 py-10 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-text-primary mb-2">{t.title}</h1>
      <p className="text-text-secondary mb-8">{t.subtitle}</p>

      {!loading && posts.length === 0 && (
        <p className="text-text-muted">{t.empty}</p>
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
