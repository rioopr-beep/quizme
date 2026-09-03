'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { labelForSector } from '@/lib/sectorLabels';
import type { BlogPost } from '@/lib/blog';

const ALL_SECTORS = '__all__';

interface Props {
  initialPosts: BlogPost[]; // versi EN, sudah di-fetch di server
  initialLang: 'en';
  forcedSector?: string; // kalau diisi, halaman terkunci ke 1 sector ini (dipakai di /blog/[sector])
}

export default function BlogIndexClient({ initialPosts, initialLang, forcedSector }: Props) {
  const { language } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [loading, setLoading] = useState(false);
  const [selectedSector, setSelectedSector] = useState<string>(forcedSector ?? ALL_SECTORS);

  useEffect(() => {
    if (language === initialLang) {
      setPosts(initialPosts);
      return;
    }

    let ignore = false;
    setLoading(true);
    fetch(`/api/blog?lang=${language}`)
      .then((res) => res.json())
      .then((data) => {
        if (!ignore) setPosts(data.posts || []);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [language, initialPosts, initialLang]);

  useEffect(() => {
    // Reset filter ke "Semua" pas ganti bahasa — KECUALI kalau halaman ini terkunci ke 1 sector
    if (!forcedSector) {
      setSelectedSector(ALL_SECTORS);
    }
  }, [language, forcedSector]);

  const availableSectors = useMemo(() => {
    const unique = new Set(posts.map((post) => post.sector));
    return Array.from(unique).sort((a, b) =>
      labelForSector(a, language).localeCompare(labelForSector(b, language))
    );
  }, [posts, language]);

  const filteredPosts = useMemo(() => {
    if (selectedSector === ALL_SECTORS) return posts;
    return posts.filter((post) => post.sector === selectedSector);
  }, [posts, selectedSector]);

  const t = {
    id: {
      title: 'Blog QuizFrend',
      subtitle: 'Artikel edukatif seputar berbagai disiplin ilmu untuk menemani latihan analisismu.',
      empty: 'Belum ada artikel.',
      emptyFiltered: 'Belum ada artikel untuk kategori ini.',
      all: 'Semua',
    },
    en: {
      title: 'QuizFrend Blog',
      subtitle: 'Educational articles across disciplines to accompany your analysis practice.',
      empty: 'No articles yet.',
      emptyFiltered: 'No articles for this category yet.',
      all: 'All',
    },
  }[language];

  const pageTitle = forcedSector
    ? `${labelForSector(forcedSector, language)}`
    : t.title;
  const pageSubtitle = forcedSector
    ? (language === 'en'
        ? `All articles about ${labelForSector(forcedSector, language)}.`
        : `Semua artikel tentang ${labelForSector(forcedSector, language)}.`)
    : t.subtitle;

  return (
    <main className="min-h-screen bg-base-bg px-4 py-10 max-w-2xl mx-auto">
      <Link href={forcedSector ? '/blog' : '/'} className="text-sm text-accent mb-6 inline-block">
        {forcedSector
          ? (language === 'en' ? '← Back to Blog' : '← Kembali ke Blog')
          : (language === 'en' ? '← Back to Home' : '← Kembali ke Beranda')}
      </Link>

      <h1 className="text-2xl font-bold text-text-primary mb-2">{pageTitle}</h1>
      <p className="text-text-secondary mb-6">{pageSubtitle}</p>

      {!loading && posts.length === 0 && (
        <p className="text-text-muted">{t.empty}</p>
      )}

      {!forcedSector && availableSectors.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-4 px-4 scrollbar-hide">
          <button
            type="button"
            onClick={() => setSelectedSector(ALL_SECTORS)}
            className={`shrink-0 rounded-floating px-3 py-1.5 text-xs font-medium border transition ${
              selectedSector === ALL_SECTORS
                ? 'bg-accent border-accent text-white'
                : 'bg-base-surface border-base-border text-text-secondary'
            }`}
          >
            {t.all}
          </button>
          {availableSectors.map((sector) => (
            <Link
              key={sector}
              href={`/blog/${sector}`}
              className="shrink-0 rounded-floating px-3 py-1.5 text-xs font-medium border transition bg-base-surface border-base-border text-text-secondary"
            >
              {labelForSector(sector, language)}
            </Link>
          ))}
        </div>
      )}

      {!loading && posts.length > 0 && filteredPosts.length === 0 && (
        <p className="text-text-muted">{t.emptyFiltered}</p>
      )}

      <div className="flex flex-col gap-4">
        {filteredPosts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.sector}/${post.slug}`}
            className="block rounded-floating border border-base-border bg-base-surface p-4 hover:shadow-floating-sm transition"
          >
            <span className="text-xs uppercase text-accent font-medium">
              {labelForSector(post.sector, language)}
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
