'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { labelForSector } from '@/lib/sectorLabels';
import type { BlogPost } from '@/lib/blog';

const ALL_SECTORS = '__all__';

interface Props {
  posts: BlogPost[];
  locale: 'en' | 'id';
  forcedSector?: string; // dipakai di halaman listing sector
}

export default function BlogIndexClient({ posts, locale, forcedSector }: Props) {
  const availableSectors = useMemo(() => {
    const unique = new Set(posts.map((post) => post.sector));
    return Array.from(unique).sort((a, b) =>
      labelForSector(a, locale).localeCompare(labelForSector(b, locale))
    );
  }, [posts, locale]);

  const t = {
    id: {
      title: 'Blog QuizFrend',
      subtitle: 'Artikel edukatif seputar berbagai disiplin ilmu untuk menemani latihan analisismu.',
      empty: 'Belum ada artikel.',
      all: 'Semua',
      switchLang: 'English',
    },
    en: {
      title: 'QuizFrend Blog',
      subtitle: 'Educational articles across disciplines to accompany your analysis practice.',
      empty: 'No articles yet.',
      all: 'All',
      switchLang: 'Bahasa Indonesia',
    },
  }[locale];

  const otherLocale = locale === 'en' ? 'id' : 'en';
  const switchLangHref = forcedSector ? `/blog/${otherLocale}/${forcedSector}` : `/blog/${otherLocale}`;

  const pageTitle = forcedSector ? labelForSector(forcedSector, locale) : t.title;
  const pageSubtitle = forcedSector
    ? locale === 'en'
      ? `All articles about ${labelForSector(forcedSector, locale)}.`
      : `Semua artikel tentang ${labelForSector(forcedSector, locale)}.`
    : t.subtitle;

  return (
    <main className="min-h-screen bg-base-bg px-4 py-10 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link href={forcedSector ? `/blog/${locale}` : '/'} className="text-sm text-accent inline-block">
          {forcedSector
            ? (locale === 'en' ? '← Back to Blog' : '← Kembali ke Blog')
            : (locale === 'en' ? '← Back to Home' : '← Kembali ke Beranda')}
        </Link>
        <Link href={switchLangHref} className="text-xs text-text-muted underline">
          {t.switchLang}
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-text-primary mb-2">{pageTitle}</h1>
      <p className="text-text-secondary mb-6">{pageSubtitle}</p>

      {posts.length === 0 && <p className="text-text-muted">{t.empty}</p>}

      {!forcedSector && availableSectors.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-4 px-4 scrollbar-hide">
          {availableSectors.map((sector) => (
            <Link
              key={sector}
              href={`/blog/${locale}/${sector}`}
              className="shrink-0 rounded-floating px-3 py-1.5 text-xs font-medium border transition bg-base-surface border-base-border text-text-secondary"
            >
              {labelForSector(sector, locale)}
            </Link>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-4">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${locale}/${post.sector}/${post.slug}`}
            className="block rounded-floating border border-base-border bg-base-surface p-4 hover:shadow-floating-sm transition"
          >
            <span className="text-xs uppercase text-accent font-medium">
              {labelForSector(post.sector, locale)}
            </span>
            <h2 className="text-lg font-semibold text-text-primary mt-1">{post.title}</h2>
            <p className="text-sm text-text-secondary mt-1">{post.excerpt}</p>
            <span className="text-xs text-text-muted mt-2 block">{post.date}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
