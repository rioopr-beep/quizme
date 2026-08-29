'use client';

import { useEffect, useState, isValidElement, cloneElement, type ReactNode } from 'react';
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
// Sebelum di-render, "> [TIP] ..." / "> [PENTING] ..." / "> [IMPORTANT] ..."
// diubah jadi marker internal biar bisa dideteksi dari hasil parse markdown
// (ReactMarkdown kasih kita React nodes, bukan raw text, jadi deteksi dilakukan
// di raw string dulu sebelum di-parse).
const TIP_MARKER = '__CALLOUT_TIP__';
const IMPORTANT_MARKER = '__CALLOUT_IMPORTANT__';

function preprocessCallouts(markdown: string): string {
  return markdown
    .replace(/^>\s*\[TIP\]\s*/gim, `> ${TIP_MARKER} `)
    .replace(/^>\s*\[PENTING\]\s*/gim, `> ${IMPORTANT_MARKER} `)
    .replace(/^>\s*\[IMPORTANT\]\s*/gim, `> ${IMPORTANT_MARKER} `);
}

// Ambil teks polos dari sebuah React node tree (buat cek marker di awal blockquote)
function getPlainText(node: ReactNode): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(getPlainText).join('');
  if (isValidElement(node)) return getPlainText(node.props.children);
  return '';
}

// Buang N karakter pertama dari leaf teks paling awal di sebuah node tree,
// tanpa merusak formatting (bold/link/dst) di bagian selanjutnya.
function stripLeadingChars(node: ReactNode, count: number): ReactNode {
  if (count <= 0) return node;
  if (typeof node === 'string') {
    return node.slice(count);
  }
  if (Array.isArray(node)) {
    const [first, ...rest] = node;
    return [stripLeadingChars(first, count), ...rest];
  }
  if (isValidElement(node)) {
    return cloneElement(node, undefined, stripLeadingChars(node.props.children, count));
  }
  return node;
}

function CalloutBlockquote({ children }: { children?: ReactNode }) {
  const text = getPlainText(children);

  const isTip = text.trimStart().startsWith(TIP_MARKER);
  const isImportant = text.trimStart().startsWith(IMPORTANT_MARKER);

  if (isTip || isImportant) {
    const marker = isTip ? TIP_MARKER : IMPORTANT_MARKER;
    const markerIndex = text.indexOf(marker);
    // +1 buat buang spasi setelah marker juga
    const stripped = stripLeadingChars(children, markerIndex + marker.length + 1);
    const label = isTip ? 'TIP' : 'PENTING';

    return (
      <div
        className={`my-4 rounded-floating border-l-4 px-4 py-3 text-sm ${
          isTip
            ? 'bg-accent-soft border-accent text-text-primary'
            : 'bg-status-warningSoft border-status-warning text-text-primary'
        }`}
      >
        <span className="block text-xs font-semibold uppercase tracking-wide mb-1 opacity-70">
          {label}
        </span>
        <div className="[&>p]:m-0">{stripped}</div>
      </div>
    );
  }

  return (
    <blockquote className="border-l-4 border-base-border pl-4 italic text-text-secondary my-4">
      {children}
    </blockquote>
  );
}

// Heading "Poin Penting" / "Key Takeaways" + list (ul) yang PERSIS mengikutinya
// dirender jadi satu box. Deteksinya lewat flag sederhana: ReactMarkdown me-render
// elemen blok secara berurutan sesuai urutan di markdown, jadi h2 di bawah ini
// "menandai" flag, dan ul berikutnya yang membacanya lalu me-reset-nya lagi.
// Function ini dipanggil ulang tiap render BlogPostPage supaya flag-nya selalu bersih.
function createMarkdownComponents() {
  let nextListIsTakeaways = false;

  return {
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
    blockquote: CalloutBlockquote,
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
