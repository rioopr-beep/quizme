'use client';

// ============================================================================
// QuizMe — Dashboard Interface
// Ringkasan personal: sapaan, streak dari Supabase, tombol menuju halaman
// pilih Topik. Navigasi ditangani oleh BottomNav lewat layout.
// ============================================================================

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '../../../lib/supabase/client';
import { useLanguage } from '../../../context/LanguageContext';
import CheckInCard from '../../../components/CheckInCard';

export default function DashboardPage(): JSX.Element {
  const router = useRouter();
  const { language } = useLanguage();

  const [userName, setUserName] = useState<string>('');
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

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

      const { data: profile } = await supabase
        .from('profiles')
        .select('name, best_streak')
        .eq('id', user.id)
        .single();

      if (isMounted) {
        setUserName(profile?.name ?? '');
        setBestStreak(profile?.best_streak ?? 0);
        setIsCheckingAuth(false);
      }
    }

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const greeting = language === 'id' ? 'Halo' : 'Hi';
  const subtitle =
    language === 'id'
      ? 'Yuk lanjut belajar hari ini'
      : "Let's keep learning today";
  const streakLabel = language === 'id' ? 'Rekor Beruntun' : 'Best Streak';
  const exploreLabel = language === 'id' ? 'Jelajahi Topik' : 'Explore Topics';

  if (isCheckingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="font-mono text-sm text-slate-400">Memuat…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 font-sans text-slate-800 sm:px-10">
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        <header>
          <h1 className="font-mono text-2xl font-semibold tracking-tight text-slate-900">
            QuizMe
          </h1>
        </header>

        <section className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-6 shadow-sm">
          <p className="text-lg font-semibold text-slate-900">
            {greeting}{userName ? `, ${userName}` : ''}
          </p>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>

          <div className="mt-6 flex gap-4">
            <div className="flex flex-1 flex-col items-center rounded-xl bg-white/70 px-4 py-4">
              <span className="font-mono text-2xl font-semibold text-indigo-900">
                {bestStreak}
              </span>
              <span className="mt-1 text-xs uppercase tracking-wide text-slate-400">
                {streakLabel}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push('/topics')}
            className="mt-6 w-full rounded-xl bg-indigo-900 px-4 py-3 font-mono text-sm font-medium text-white shadow-sm transition hover:bg-indigo-800"
          >
            {exploreLabel}
          </button>
        </section>

        {/* Tambahan baru: check-in mingguan */}
        <CheckInCard />
      </div>
    </main>
  );
}
