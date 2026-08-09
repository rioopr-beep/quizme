'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '../../../lib/supabase/client';
import { useLanguage } from '../../../context/LanguageContext';

interface ProfileSummary {
  name: string;
  email: string;
  currentStreak: number;
  bestStreak: number;
  totalQuestions: number;
  topicsAttempted: number;
}

interface SectorStat {
  sector: string;
  accuracy: number;
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

export default function ProfilePage(): JSX.Element {
  const router = useRouter();
  const { language, toggleLanguage } = useLanguage();

  const [summary, setSummary] = useState<ProfileSummary | null>(null);
  const [stats, setStats] = useState<readonly SectorStat[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile(): Promise<void> {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const [{ data: profile }, { data: attempts }] = await Promise.all([
        supabase
          .from('profiles')
          .select('name, current_streak, best_streak')
          .eq('id', user.id)
          .single(),
        supabase
          .from('quiz_attempts')
          .select('sector, question_count, score')
          .eq('user_id', user.id),
      ]);

      const totalQuestions = (attempts ?? []).reduce((sum, a) => sum + a.question_count, 0);
      const topicsAttempted = new Set((attempts ?? []).map((a) => a.sector)).size;

      const statMap = new Map<string, { total: number; correct: number }>();
      for (const attempt of attempts ?? []) {
        const existing = statMap.get(attempt.sector) ?? { total: 0, correct: 0 };
        existing.total += attempt.question_count;
        existing.correct += attempt.score;
        statMap.set(attempt.sector, existing);
      }

      const computedStats: SectorStat[] = Array.from(statMap.entries())
        .map(([sector, { total, correct }]) => ({
          sector,
          accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
        }))
        .sort((a, b) => b.accuracy - a.accuracy);

      if (isMounted) {
        setSummary({
          name: profile?.name ?? '',
          email: user.email ?? '',
          currentStreak: profile?.current_streak ?? 0,
          bestStreak: profile?.best_streak ?? 0,
          totalQuestions,
          topicsAttempted,
        });
        setStats(computedStats);
        setIsLoading(false);
      }
    }

    void loadProfile();
    return () => {
      isMounted = false;
    };
  }, [router]);

  async function handleLogout(): Promise<void> {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  const loadingText = language === 'id' ? 'Memuat…' : 'Loading…';
  const streakLabel = language === 'id' ? 'Streak' : 'Streak';
  const questionsLabel = language === 'id' ? 'Soal dijawab' : 'Questions answered';
  const topicsLabel = language === 'id' ? 'Topik dicoba' : 'Topics tried';
  const statsHeading = language === 'id' ? 'Statistik per Topik' : 'Stats per Topic';
  const statsEmpty =
    language === 'id'
      ? 'Belum ada data. Kerjakan beberapa kuis dulu.'
      : 'No data yet. Complete a few quizzes first.';
  const settingsHeading = language === 'id' ? 'Pengaturan' : 'Settings';
  const languageRowLabel = language === 'id' ? 'Bahasa tampilan' : 'Display language';
  const logoutLabel = language === 'id' ? 'Keluar' : 'Logout';

  if (isLoading || !summary) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="font-mono text-sm text-slate-400">{loadingText}</p>
      </main>
    );
  }

  const initial = summary.name ? summary.name.charAt(0).toUpperCase() : '?';

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 sm:px-10">
      <div className="mx-auto flex max-w-2xl flex-col gap-5">
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-indigo-900 font-mono text-xl font-semibold text-white">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-slate-900">
                {summary.name || (language === 'id' ? 'Pengguna' : 'User')}
              </p>
              <p className="truncate text-xs text-slate-400">{summary.email}</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-white/70 p-3 text-center">
              <p className="font-mono text-lg font-semibold text-indigo-900">
                {summary.bestStreak}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">{streakLabel}</p>
            </div>
            <div className="rounded-xl bg-white/70 p-3 text-center">
              <p className="font-mono text-lg font-semibold text-indigo-900">
                {summary.totalQuestions}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">{questionsLabel}</p>
            </div>
            <div className="rounded-xl bg-white/70 p-3 text-center">
              <p className="font-mono text-lg font-semibold text-indigo-900">
                {summary.topicsAttempted}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">{topicsLabel}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="mb-4 text-sm font-semibold text-slate-700">{statsHeading}</p>

          {stats.length === 0 ? (
            <p className="text-sm text-slate-400">{statsEmpty}</p>
          ) : (
            <div className="flex flex-col gap-4">
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
                        className="h-full rounded-full bg-indigo-800"
                        style={{ width: `${stat.accuracy}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <p className="px-6 pt-5 pb-2 text-sm font-semibold text-slate-700">
            {settingsHeading}
          </p>

          <button
            type="button"
            onClick={toggleLanguage}
            className="flex w-full items-center justify-between border-t border-slate-100 px-6 py-3.5 text-left transition hover:bg-slate-50"
          >
            <span className="text-sm text-slate-700">{languageRowLabel}</span>
            <span className="text-sm text-slate-400">
              {language === 'id' ? 'Indonesia' : 'English'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => void handleLogout()}
            className="flex w-full items-center gap-2 border-t border-slate-100 px-6 py-3.5 text-left text-rose-500 transition hover:bg-rose-50"
          >
            <i className="ti ti-logout text-base" aria-hidden="true" />
            <span className="text-sm font-medium">{logoutLabel}</span>
          </button>
        </div>
      </div>
    </main>
  );
}
