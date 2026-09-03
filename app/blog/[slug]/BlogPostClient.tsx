'use client';

import { useEffect, useState, isValidElement, type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import type { BlogPost, RelatedPost } from '@/lib/blog';

const TIP_TAG = '§§TIP§§';
const IMPORTANT_TAG = '§§IMPORTANT§§';

function preprocessCallouts(markdown: string): string {
  return markdown
    .replace(/^>\s*\[TIP\]\s*/gim, `${TIP_TAG}\n> `)
    .replace(/^>\s*\[PENTING\]\s*/gim, `${IMPORTANT_TAG}\n> `)
    .replace(/^>\s*\[IMPORTANT\]\s*/gim, `${IMPORTANT_TAG}\n> `);
}

function protectMathDelimiters(markdown: string): string {
  // Markdown menghapus 1 backslash di depan tanda kurung (dianggap "escape").
  // Kita double-kan backslashnya dulu, supaya setelah Markdown hapus satu,
  // sisa satu backslash tetap ada untuk dikenali MathJax sebagai delimiter rumus.
  return markdown.replace(/\\([()[\]])/g, '\\\\$1');
}

function getPlainText(node: ReactNode): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(getPlainText).join('');
  if (isValidElement(node)) return getPlainText(node.props.children);
  return '';
}

function createMarkdownComponents() {
  let nextListIsTakeaways = false;
  let nextBlockquoteType: 'tip' | 'important' | null = null;

  return {
    p: ({ children }: { children?: ReactNode }) => {
      const text = getPlainText(children).trim();
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
        nextListIsTakeaways = false;
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
      nextBlockquoteType = null;

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

interface Props {
  slug: string;
  initialPost: BlogPost; // versi EN, sudah di-fetch di server
  initialRelatedPosts: RelatedPost[]; // versi EN, sudah di-fetch di server
}

export default function BlogPostClient({ slug, initialPost, initialRelatedPosts }: Props) {
  const { language } = useLanguage();
  const [post, setPost] = useState<BlogPost>(initialPost);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>(initialRelatedPosts);

  useEffect(() => {
    // Kalau bahasa yg dipilih user sama kayak yg sudah di-render server, gak perlu fetch ulang
    if (language === initialPost.lang && slug === initialPost.slug) {
      setPost(initialPost);
      setRelatedPosts(initialRelatedPosts);
      return;
    }

    let ignore = false;
    fetch(`/api/blog/${slug}?lang=${language}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!ignore && data?.post) {
          setPost(data.post);
          // Kalau API belum mengembalikan relatedPosts sesuai bahasa baru,
          // daftar "Baca Juga" tetap pakai versi awal (judul mungkin beda bahasa
          // sampai endpoint ini diupdate untuk include relatedPosts juga)
          if (data.relatedPosts) setRelatedPosts(data.relatedPosts);
        }
      });

    return () => {
      ignore = true;
    };
  }, [slug, language, initialPost, initialRelatedPosts]);

  const backLabel = language === 'en' ? '← Back to Blog' : '← Kembali ke Blog';
  const relatedLabel = language === 'en' ? 'You Might Also Like' : 'Baca Juga';

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

      {post.excerpt && (
        <div className="mb-8 rounded-floating border border-base-border bg-base-surface px-4 py-4">
          <span className="block text-xs font-semibold uppercase tracking-wide text-accent mb-1">
            {language === 'en' ? 'Definition' : 'Definisi'}
          </span>
          <p className="text-sm text-text-secondary m-0">{post.excerpt}</p>
        </div>
      )}

      <article className="prose prose-sm max-w-none text-text-primary">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={createMarkdownComponents()}>
          {preprocessCallouts(protectMathDelimiters(post.content))}
        </ReactMarkdown>
      </article>

      {relatedPosts.length > 0 && (
        <div className="mt-12 border-t border-base-border pt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted mb-4">
            {relatedLabel}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {relatedPosts.map((related) => (
              <Link
                key={related.slug}
                href={`/blog/${related.slug}`}
                className="block rounded-floating bg-base-surface shadow-floating-sm p-4 transition active:scale-95 hover:opacity-90"
              >
                <span className="text-xs uppercase text-accent font-medium">
                  {related.sector}
                </span>
                <p className="text-sm font-medium text-text-primary mt-1 line-clamp-2">
                  {related.title}
                </p>
                {related.excerpt && (
                  <p className="text-xs text-text-muted mt-1 line-clamp-2">
                    {related.excerpt}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
