'use client';

// ============================================================================
// CentralQuizCore — objek pusat Quiz Universe.
// Prioritas isi: quiz yang sedang dilanjutkan > topic dengan aktivitas
// tertinggi > empty state kalau user belum punya aktivitas sama sekali.
// ============================================================================

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { ActiveQuiz, TopicActivity } from './types';

interface CentralQuizCoreProps {
  activeQuiz: ActiveQuiz | null;
  fallbackTopic: TopicActivity | null;
  emptyStateLabel: string;
  emptyStateHref: string;
  continueLabel: string;
}

export default function CentralQuizCore({
  activeQuiz,
  fallbackTopic,
  emptyStateLabel,
  emptyStateHref,
  continueLabel,
}: CentralQuizCoreProps): JSX.Element {
  const title = activeQuiz?.topicName ?? fallbackTopic?.name ?? null;
  const subtitle =
    activeQuiz != null
      ? `${activeQuiz.correctCount} / ${activeQuiz.totalCount} benar`
      : null;
  const href = activeQuiz?.href ?? emptyStateHref;

  return (
    <div
      className={[
        'relative z-10 flex h-40 w-40 flex-col items-center justify-center gap-1.5',
        'rounded-full bg-base-surface/80 text-center backdrop-blur-md',
        'shadow-floating ring-1 ring-white/50',
        'motion-safe:animate-[quizCoreBreathe_6s_ease-in-out_infinite]',
      ].join(' ')}
    >
      {title == null ? (
        <>
          <p className="px-4 text-sm font-medium text-text-secondary">
            {emptyStateLabel}
          </p>
        </>
      ) : (
        <>
          <p className="text-[11px] text-text-secondary">
            {activeQuiz != null ? 'Lanjutkan Quiz' : 'Paling Aktif'}
          </p>
          <p className="px-3 text-base font-semibold leading-tight text-text-primary">
            {title}
          </p>
          {subtitle != null && (
            <p className="text-xs font-medium text-accent">{subtitle}</p>
          )}
        </>
      )}

      <Link
        href={href}
        className="mt-1 inline-flex items-center gap-1 rounded-full bg-accent px-4 py-1.5 text-xs font-medium text-base-surface shadow-floating-sm transition active:scale-95 hover:opacity-90"
      >
        {continueLabel}
        <ArrowRight size={14} strokeWidth={2.25} />
      </Link>
    </div>
  );
}
