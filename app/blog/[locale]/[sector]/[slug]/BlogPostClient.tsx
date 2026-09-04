'use client';

import { isValidElement, type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
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
      return <h2 className="text-lg font-semibold text-text-primary mt-8 mb-3">{children}</h2>;
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
      return <ul className="list-disc list-inside space-y-1 text-sm text-text-secondary mb-4">{children}</ul>;
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
      return <blockquote className="border-l-4 border-base-border pl-4 italic text-text-secondary my-4">{children}</blockquote>;
    },
  };
}

interface Props {
  post: BlogPost;
  locale: 'en' | 'id';
  relatedPosts: RelatedPost[];
}

export default function BlogPostClient({ post, locale, relatedPosts }: Props) {
  const backLabel = locale === 'en' ? '← Back to Blog' : '← Kembali ke Blog';
  const relatedLabel = locale === 'en' ? 'You Might Also Like' : 'Baca Juga';
  const otherLocale = locale === 'en' ? 'id' : 'en';
  const switchLangLabel = locale === 'en' ? 'Bahasa Indonesia' : 'English';

  return (
    <main className="min-h-screen bg-base-bg px-4 py-10 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link href={`/blog/${locale}`} className="text-sm text-accent inline-block">
          {backLabel}
        </Link>
        <Link href={`/blog/${otherLocale}/${post.sector}/${post.slug}`} className="text-xs text-text-muted underline">
          {switchLangLabel}
        </Link>
      </div>

      <span className="text-xs uppercase text-accent font-medium block mt-2">{post.sector}</span>
      <h1 className="text-2xl font-bold text-text-primary mt-1 mb-2">{post.title}</h1>
      <p className="text-sm text-text-muted mb-6">{post.author} · {post.date}</p>

      {post.excerpt && (
        <div className="mb-8 rounded-floating border border-base-border bg-base-surface px-4 py-4">
          <span className="block text-xs font-semibold uppercase tracking-wide text-accent mb-1">
            {locale === 'en' ? 'Definition' : 'Definisi'}
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
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted mb-4">{relatedLabel}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {relatedPosts.map((related) => (
              <Link
                key={related.slug}
                href={`/blog/${locale}/${related.sector}/${related.slug}`}
                className="block rounded-floating bg-base-surface shadow-floating-sm p-4 transition active:scale-95 hover:opacity-90"
              >
                <span className="text-xs uppercase text-accent font-medium">{related.sector}</span>
                <p className="text-sm font-medium text-text-primary mt-1 line-clamp-2">{related.title}</p>
                {related.excerpt && <p className="text-xs text-text-muted mt-1 line-clamp-2">{related.excerpt}</p>}
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
