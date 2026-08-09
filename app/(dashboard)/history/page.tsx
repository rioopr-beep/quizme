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

  const heading = language === 'id' ? 'Riwayat Kuis' : 'Quiz History';
  const loadingText = language === 'id' ? 'Memuat…' : 'Loading…';
  const emptyTitle = language === 'id' ? 'Belum ada riwayat' : 'No history yet';
  const emptySubtitle =
    language === 'id'
      ? 'Mulai kuis pertamamu dan lihat progresmu di sini'
      : 'Start your first quiz and see your progress here';
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
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-center">
        <p className="font-mono text-sm text-slate-400">{loadingText}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 sm:px-10">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <h1 className="text-lg font-semibold text-slate-800">{heading}</h1>

        {attempts.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white px-6 py-12 text-center shadow-sm">
            <p className="text-sm font-medium text-slate-700">{emptyTitle}</p>
            <p className="text-sm text-slate-500">{emptySubtitle}</p>
            <Link
              href="/topics"
              className="mt-2 rounded-xl bg-indigo-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-800"
            >
              {exploreLabel}
            </Link>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-sm">
            {attempts.map((attempt) => {
              const sectorLabel = SECTOR_LABEL[attempt.sector]?.[language] ?? attempt.sector;
              const difficultyLabel =
                DIFFICULTY_LABEL[attempt.difficulty]?.[language] ?? attempt.difficulty;
              const isGood = attempt.score / attempt.question_count >= 0.7;

              return (
                <div key={attempt.id} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {sectorLabel} · {difficultyLabel}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {formatDate(attempt.created_at)} · {attempt.question_count}{' '}
                      {language === 'id' ? 'soal' : 'questions'}
                    </p>
                  </div>
                  <span
                    className={`font-mono text-sm font-semibold ${
                      isGood ? 'text-indigo-800' : 'text-amber-600'
                    }`}
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
