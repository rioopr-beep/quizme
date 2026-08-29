'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  sector: string;
  author: string;
  content: string;
}

export default function BlogPostPage() {
  const { language } = useLanguage();
  const params = useParams();
  const slug = params.slug as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    fetch(`/api/blog/${slug}?lang=${language}`)
      .then((res) => {
        if (!res.ok) {
          setNotFound(true);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.post) setPost(data.post);
      })
      .finally(() => setLoading(false));
  }, [slug, language]);

  const backLabel = language === 'en' ? '← Back to Blog' : '← Kembali ke Blog';
  const notFoundLabel = language === 'en' ? 'Article not found.' : 'Artikel tidak ditemukan.';

  if (notFound) {
    return (
      <main className="min-h-screen bg-base-bg px-4 py-10 max-w-2xl mx-auto">
        <Link href="/blog" className="text-sm text-accent mb-6 inline-block">
          {backLabel}
        </Link>
        <p className="text-text-muted">{notFoundLabel}</p>
      </main>
    );
  }

  if (loading || !post) {
    return (
      <main className="min-h-screen bg-base-bg px-4 py-10 max-w-2xl mx-auto">
        <Link href="/blog" className="text-sm text-accent mb-6 inline-block">
          {backLabel}
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-base-bg px-4 py-10 max-w-2xl mx-auto">
      <Link href="/blog" className="text-sm text-accent mb-6 inline-block">
        {backLabel}
      </Link>

      <span className="text-xs uppercase text-accent font-medium">
        {post.sector}
      </span>
      <h1 className="text-2xl font-bold text-text-primary mt-1 mb-2">
        {post.title}
      </h1>
      <p className="text-sm
