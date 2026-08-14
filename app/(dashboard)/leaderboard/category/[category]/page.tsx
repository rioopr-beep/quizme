'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '../../../../../context/LanguageContext';
import { LEADERBOARD_CATEGORY_CHILDREN } from '../../page';

const CATEGORY_LABEL: Record<string, { id: string; en: string }> = {
  science: { id: 'Science', en: 'Science' },
  engineering: { id: 'Engineering', en: 'Engineering' },
  sports: { id: 'Olahraga', en: 'Sports' },
};

export default function LeaderboardCategoryPage(): JSX.Element {
  const params = useParams<{ category: string }>();
  const router = useRouter();
  const { language } = useLanguage();

  const children = LEADERBOARD_CATEGORY_CHILDREN[params.category] ?? [];
  const categoryLabel = CATEGORY_LABEL[params.category]?.[language] ?? params.category;
  const backAriaLabel = language === 'id' ? 'Kembali' : 'Back';
  const eyebrow = language === 'id' ? 'Papan Peringkat' : 'Leaderboard';

  return (
    <main className="min-h-screen bg-base-bg px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-2xl">
        <header className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/leaderboard')}
            aria-label={backAriaLabel}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-base-surface text-text-secondary shadow-floating-sm transition active:scale-95 hover:text-text-primary"
          >
            <i className="ti ti-arrow-left text-base" />
          </button>
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-wide text-text-muted">
              {eyebrow}
            </span>
            <h1 className="text-lg font-semibold leading-tight text-text-primary">
              {categoryLabel}
            </h1>
          </div>
        </header>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {children.map((child) => (
            <Link
              key={child.key}
              href={`/leaderboard/${child.key}`}
              className="flex items-center justify-between rounded-floating bg-base-surface shadow-floating-sm px-4 py-3.5 transition active:scale-95 hover:shadow-floating"
            >
              <span className="text-sm font-medium text-text-primary">
                {child.label[language]}
              </span>
              <i className="ti ti-chevron-right text-sm text-text-muted" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
      }
