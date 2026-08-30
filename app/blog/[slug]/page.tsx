'use client';

import { useEffect, useState, isValidElement, type ReactNode } from 'react';
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

// --- Callout markers (dari prompt generator v5) ---
// "> [TIP] ..." / "> [PENTING] ..." / "> [IMPORTANT] ..." di raw markdown diubah jadi:
//   §§TIP§§
//   > ...(isi tanpa tag lagi)
// Baris "§§TIP§§" itu paragraf TERPISAH tepat sebelum blockquote-nya (bukan
// disisipkan ke dalam teks blockquote) — jadi gak perlu "bedah ulang" isi
// blockquote buat buang tag-nya, cukup sembunyiin paragraf penanda ini.
const TIP_TAG = '§§TIP§§';
const IMPORTANT_TAG = '§§IMPORTANT§§';

function preprocessCallouts(markdown: string): string {
  return markdown
    .replace(/^>\s*\[TIP\]\s*/gim, `${TIP_TAG}\n> `)
    .replace(/^>\s*\[PENTING\]\s*/gim, `${IMPORTANT_TAG}\n> `)
    .replace(/^>\s*\[IMPORTANT\]\s*/gim, `${IMPORTANT_TAG}\n> `);
}

// Ambil teks polos dari sebuah React node tree (dipakai buat cek heading & paragraf penanda)
function getPlainText(node: ReactNode): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(getPlainText).join('');
  if (isValidElement(node)) return getPlainText(node.props.children);
  return '';
}



// Heading "Poin Penting" / "Key Takeaways" + list (ul) yang PERSIS mengikutinya
// dirender jadi satu box. Deteksinya lewat flag sederhana: ReactMarkdown me-render
// elemen blok secara berurutan sesuai urutan di markdown, jadi h2 di bawah ini
// "menandai" flag, dan ul berikutnya yang membacanya lalu me-reset-nya lagi.
// Function ini dipanggil ulang tiap render BlogPostPage supaya flag-nya selalu bersih.
function createMarkdownComponents() {
  let nextListIsTakeaways = false;
  let nextBlockquoteType: 'tip' | 'important' | null = null;

  return {
    p: ({ children }: { children?: ReactNode }) => {
      const text = getPlainText(children).trim();

      // Paragraf penanda callout — sembunyikan, jangan dirender sama sekali,
      // cukup "nyalain" flag buat blockquote yang langsung nempel di bawahnya.
      if (text === TIP_TAG) {
        nextBlockquoteType = 'tip';
        return null;
      }
      if (text === IMPORTANT_TAG) {
        nextBlockquoteType = 'important';
        return null;
      }

      return <p className="mb-4 leading-relaxed">{children}</p>;
    },
    h2: ({ children }: { children?: ReactNode }) => {
      const text = getPlainText(children).trim();
      const isTakeaways = text === 'Poin Penting' || text === 'Key Takeaways';
      nextListIsTakeaways = isTakeaways;

      if (isTakeaways) {
        return (
          <h2 className="text-xs font-semibold uppercase tracking-wide text-accent mt-6 mb-2">
            {children}
          </h2>
        );
      }

      return (
        <h2 className="text-lg font-semibold text-text-primary mt-8 mb-3">
          {children}
        </h2>
      );
    },
    ul: ({ children }: { children?: ReactNode }) => {
      if (nextListIsTakeaways) {
        nextListIsTakeaways = false; // cuma list yang langsung nempel di bawah heading yang kena
        return (
          <ul className="mb-6 rounded-floating border border-base-border bg-base-surface px-5 py-4 space-y-2 list-disc list-inside text-sm text-text-secondary">
            {children}
          </ul>
        );
      }
      return (
        <ul className="list-disc list-inside space-y-1 text-sm text-text-secondary mb-4">
          {children}
        </ul>
      );
    },
    blockquote: ({ children }: { children?: ReactNode }) => {
      const type = nextBlockquoteType;
      nextBlockquoteType = null; // cuma blockquote yang langsung nempel di bawah flag yang kena

      if (type === 'tip' || type === 'important') {
        const isTip = type === 'tip';
        return (
          <div
            className={`my-4 rounded-floating border-l-4 px-4 py-3 text-sm ${
              isTip
                ? 'bg-accent-soft border-accent text-text-primary'
                : 'bg-status-warningSoft border-status-warning text-text-primary'
            }`}
          >
            <span className="block text-xs font-semibold uppercase tracking-wide mb-1 opacity-70">
              {isTip ? 'TIP' : 'PENTING'}
            </span>
            <div className="[&>p]:m-0">{children}</div>
          </div>
        );
      }

      return (
        <blockquote className="border-l-4 border-base-border pl-4 italic text-text-secondary my-4">
          {children}
        </blockquote>
      );
    },
  };
}

export default function BlogPostPage() {
  const { language } = useLanguage();
  const params = useParams();
  const slug = params.slug as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setNotFound(false);

    fetch(`/api/blog/${slug}?lang=${language}`)
      .then((res) => {
        if (!res.ok) {
          if (!ignore) setNotFound(true);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (ignore) return;
        if (data?.post) setPost(data.post);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
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

      <span className="text-xs uppercase text-accent font-medium block mt-2">
        {post.sector}
      </span>
      <h1 className="text-2xl font-bold text-text-primary mt-1 mb-2">
        {post.title}
      </h1>
      <p className="text-sm text-text-muted mb-6">
        {post.author} · {post.date}
      </p>

      {/* Definition box — dari field excerpt yang ditulis sbg definisi berdiri sendiri */}
      {post.excerpt && (
        <div className="mb-8 rounded-floating border border-base-border bg-base-surface px-4 py-4">
          <span className="block text-xs font-semibold uppercase tracking-wide text-accent mb-1">
            {language === 'en' ? 'Definition' : 'Definisi'}
          </span>
          <p className="text-sm text-text-secondary m-0">{post.excerpt}</p>
        </div>
      )}

      <article className="prose prose-sm max-w-none text-text-primary">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={createMarkdownComponents()}
        >
          {preprocessCallouts(post.content)}
        </ReactMarkdown>
      </article>
    </main>
  );
    }
