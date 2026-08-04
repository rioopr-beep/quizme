'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '../../../lib/supabase/client';
import { useLanguage } from '../../../context/LanguageContext';

interface AttemptRow {
  sector: string;
  question_count: number;
  score: number;
}

interface SectorStat {
  sector: string;
  totalQuestions: number;
  totalCorrect: number;
  accuracy: number;
}

const SECTOR_LABEL: Record<string, { id: string; en: string }> = {
  financial: { id: 'Keuangan', en: 'Financial' },
  cryptography: { id: 'Kriptografi', en: 'Cryptography' },
  psychology: { id: 'Psikologi', en: 'Psychology' },
  physics: { id: 'Fisika', en: 'Physics' },
  science: { id: 'Sains Umum', en: 'General Science' },
  linguistics: { id: 'Linguistik', en: 'Linguistics' },
};

function aggregateBySector(attempts: readonly AttemptRow[]): SectorStat[] {
  const map = new Map<string, { totalQuestions: number; totalCorrect: number }>();

  for (const attempt of attempts) {
    const existing = map.get(attempt.sector) ?? { totalQuestions: 0, totalCorrect: 0 };
    existing.totalQuestions += attempt.question_count;
    existing.totalCorrect += attempt.score;
    map.set(attempt.sector, existing);
  }

  return Array.from(map.entries())
    .map(([sector, { totalQuestions, totalCorrect }]) => ({
      sector,
      totalQuestions,
      totalCorrect,
      accuracy: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
    }))
    .sort((a, b) => b.totalQuestions - a.totalQuestions);
}

export default function StatsPage(): JSX.Element {
  const router = useRouter();
  const { language } = useLanguage();

  const [stats, setStats] = useState<readonly SectorStat[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function loadStats(): Promise<void> {
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
        .select('sector, question_count, score')
        .eq('user_id', user.id);

      if (isMounted) {
        setStats(aggregateBySector(data ?? []));
        setIsLoading(false);
      }
    }

    void loadStats();
    return () => {
      isMounted = false;
    };
  }, [router]);

  const heading = language === 'id' ? 'Statistik' : 'Statistics';
  const back = language === 'id' ? '← Kembali' : '← Back';
  const loadingText = language === 'id' ? 'Memuat…' : 'Loading…';
  const emptyText =
    language === 'id'
      ? 'Belum ada data. Kerjakan beberapa kuis dulu.'
      : 'No data yet. Complete a few quizzes first.';

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-center">
        <p className="font-mono text-sm text-slate-400">{loadingText}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 sm:px-10">
      <div className="mx-auto flex max-w-md flex-col gap-6">
        <header className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="font-mono text-sm text-slate-400 transition hover:text-slate-600"
          >
            {back}
          </button>
          <h1 className="text-lg font-semibold text-slate-800">{heading}</h1>
        </header>

        {stats.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
            <p className="text-sm text-slate-500">{emptyText}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            {stats.map((stat) => {
              const label = SECTOR_LABEL[stat.sector]?.[language] ?? stat.sector;
              return (
                <div key={stat.sector}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm text-slate-700">{label}</span>
                    <span className="font-mono text-xs text-slate-400">{stat.accuracy}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${stat.accuracy}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
