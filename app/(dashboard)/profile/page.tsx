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

export default function ProfilePage(): JSX.Element {
  const router = useRouter();
  const { language } = useLanguage();

  const [summary, setSummary] = useState<ProfileSummary | null>(null);
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
        supabase.from('quiz_attempts').select('sector, question_count').eq('user_id', user.id),
      ]);

      const totalQuestions = (attempts ?? []).reduce((sum, a) => sum + a.question_count, 0);
      const topicsAttempted = new Set((attempts ?? []).map((a) => a.sector)).size;

      if (isMounted) {
        setSummary({
          name: profile?.name ?? '',
          email: user.email ?? '',
          currentStreak: profile?.current_streak ?? 0,
          bestStreak: profile?.best_streak ?? 0,
          totalQuestions,
          topicsAttempted,
        });
        setIsLoading(false);
      }
    }

    void loadProfile();
    return () => {
      isMounted = false;
    };
  }, [router]);

  const heading = language === 'id' ? 'Profil' : 'Profile';
  const back = language === 'id' ? '← Kembali' : '← Back';
  const loadingText = language === 'id' ? 'Memuat…' : 'Loading…';
  const streakLabel = language === 'id' ? 'Streak' : 'Streak';
  const questionsLabel = language === 'id' ? 'Soal dijawab' : 'Questions answered';
  const topicsLabel = language === 'id' ? 'Topik dicoba' : 'Topics tried';

  if (isLoading || !summary) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-center">
        <p className="font-mono text-sm text-slate-400">{loadingText}</p>
      </main>
    );
  }

  const initial = summary.name ? summary.name.charAt(0).toUpperCase() : '?';

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

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 font-mono text-xl font-semibold text-emerald-600">
              {initial}
            </div>
            <p className="text-base font-semibold text-slate-900">
              {summary.name || (language === 'id' ? 'Pengguna' : 'User')}
            </p>
            <p className="text-xs text-slate-400">{summary.email}</p>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-slate-50 p-3 text-center">
              <p className="font-mono text-lg font-semibold text-slate-800">
                {summary.bestStreak}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">{streakLabel}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 text-center">
              <p className="font-mono text-lg font-semibold text-slate-800">
                {summary.totalQuestions}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">{questionsLabel}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 text-center">
              <p className="font-mono text-lg font-semibold text-slate-800">
                {summary.topicsAttempted}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">{topicsLabel}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
