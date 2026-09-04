'use client';

import Link from 'next/link';
import { labelForSector } from '@/lib/sectorLabels';
import type { BlogPost } from '@/lib/blog';

interface Props {
  posts: BlogPost[];
  locale: 'en' | 'id';
}

export default function AuthorPageClient({ posts, locale }: Props) {
  const t = {
    en: {
      back: '← Back to Blog',
      heading: 'About Rioopr',
      bio: "Rioopr writes QuizFrend's blog out of genuine curiosity, not claimed expertise. exploring one discipline at a time, from chemistry to psychology, and writing down what makes sense along the way. Articles are researched carefully and reviewed before publishing, though they're best treated as a starting point for your own reading, not a final authority.",
      articlesHeading: 'Articles by Rioopr',
    },
    id: {
      back: '← Kembali ke Blog',
      heading: 'Tentang Rioopr',
      bio: 'Rioopr menulis blog QuizFrend karena rasa penasaran, bukan klaim sebagai ahli. menjelajahi satu bidang demi satu bidang, dari kimia sampai psikologi, lalu menuliskan apa yang berhasil dipahami. Artikel diriset dengan hati-hati dan direview sebelum publish, tapi sebaiknya dianggap sebagai titik awal buat bacaan sendiri, bukan otoritas final.',
      articlesHeading: 'Artikel oleh Rioopr',
    },
  }[locale];

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Rioopr',
    description: t.bio,
    url: `https://www.quizfrend.my.id/blog/${locale}/author`,
  };

  return (
    <main className="min-h-screen bg-base-bg px-4 py-10 max-w-2xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <Link href={`/blog/${locale}`} className="text-sm text-accent mb-6 inline-block">
        {t.back}
      </Link>

      <h1 className="text-2xl font-bold text-text-primary mb-4">{t.heading}</h1>
      <p className="text-text-secondary leading-relaxed mb-10">{t.bio}</p>

      <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted mb-4">
        {t.articlesHeading} ({posts.length})
      </h2>

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
            <h3 className="text-lg font-semibold text-text-primary mt-1">{post.title}</h3>
            <p className="text-sm text-text-secondary mt-1">{post.excerpt}</p>
            <span className="text-xs text-text-muted mt-2 block">{post.date}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
