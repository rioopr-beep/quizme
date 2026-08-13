'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseBrowserClient } from '../../../lib/supabase/client';
import { useLanguage } from '../../../context/LanguageContext';

interface AttemptRow {
  id: string;
  sector: string;
  difficulty: string;
  question_count: number;
  score: number;
  created_at: string;
}

const SECTOR_LABEL: Record<string, { id: string; en: string }> = {
  financial: { id: 'Keuangan', en: 'Financial' },
  cryptography: { id: 'Kriptografi', en: 'Cryptography' },
  psychology: { id: 'Psikologi', en: 'Psychology' },
  physics: { id: 'Fisika', en: 'Physics' },
  science: { id: 'Sains Umum', en: 'General Science' },
  linguistics: { id: 'Linguistik', en: 'Linguistics' },
  'book-trivia': { id: 'Trivia Buku', en: 'Book Trivia' },
  curiosities: { id: 'Rasa Ingin Tahu', en: 'Curiosities' },
  mathematics: { id: 'Matematika', en: 'Mathematics' },
};

const DIFFICULTY_LABEL: Record<string, { id: string; en: string }> = {
  foundational: { id: 'Mudah', en: 'Easy' },
  intermediate: { id: 'Menengah', en: 'Medium' },
  advanced: { id: 'Susah', en: 'Hard' },
};

export default function HistoryPage(): JSX.Element {
  const router = useRouter();
  const { language } = useLanguage();

  const [attempts, setAttempts] = useState<readonly AttemptRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function loadAttempts(): Promise<void> {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { data } = await supabase
        .from('quiz_attempts')
        .select('id, sector, difficulty, question_count, score, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (isMounted) {
        setAttempts(data ?? []);
        setIsLoading(false);
      }
    }

    void loadAttempts();
    return () => {
      isMounted = false;
    };
  }, [router]);

  const heading = language === 'id' ? 'Riwayat' : 'History';
  const loadingText = language === 'id' ? 'Memuat…' : 'Loading…';
  const emptyTitle = language === 'id' ? 'Belum ada riwayat' : 'No history yet';
  const exploreLabel = language === 'id' ? 'Jelajahi Topik' : 'Explore Topics';

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-base-bg px-6 text-center">
        <p className="text-sm text-text-muted">{loadingText}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-base-bg px-6 py-10 sm:px-10">
      <div className="mx-auto flex max-w-2xl flex-col gap-5">
        <h1 className="text-xl font-semibold text-text-primary">{heading}</h1>

        {attempts.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-floating bg-base-surface shadow-floating-sm px-6 py-12 text-center">
            <p className="text-sm font-medium text-text-primary">{emptyTitle}</p>
            <Link
              href="/topics"
              className="mt-2 rounded-full bg-accent px-5 py-2 text-sm font-medium text-base-surface shadow-floating-sm transition active:scale-95 hover:opacity-90"
            >
              {exploreLabel}
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {attempts.map((attempt) => {
              const sectorLabel = SECTOR_LABEL[attempt.sector]?.[language] ?? attempt.sector;
              const difficultyLabel =
                DIFFICULTY_LABEL[attempt.difficulty]?.[language] ?? attempt.difficulty;
              const isGood = attempt.score / attempt.question_count >= 0.7;

              return (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between rounded-floating bg-base-surface shadow-floating-sm px-4 py-3.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {sectorLabel} · {difficultyLabel}
                    </p>
                    <p className="mt-0.5 text-[11px] text-text-muted">
                      {formatDate(attempt.created_at)}
                    </p>
                  </div>
                  <span
                    className={[
                      'shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold',
                      isGood
                        ? 'bg-status-correctSoft text-status-correct'
                        : 'bg-base-bg text-text-secondary',
                    ].join(' ')}
                  >
                    {attempt.score}/{attempt.question_count}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
            }
