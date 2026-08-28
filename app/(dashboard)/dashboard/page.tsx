'use client';

// ============================================================================
// QuizMe — Dashboard Interface
// Ringkasan personal: sapaan minimal di atas, badge streak floating,
// Quiz Universe, check-in mingguan, dan quick stats + progress topik.
// ============================================================================

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '../../../lib/supabase/client';
import { useLanguage } from '../../../context/LanguageContext';
import { QuizUniverse, type TopicActivity } from '../../../components/QuizUniverse';
import { useQuizUniverseData } from '../../../hooks/useQuizUniverseData';
import CheckInCard from '../../../components/CheckInCard';
import QuickStats from '../../../components/QuickStats';
import ContinueLearningCard from '../../../components/ContinueLearningCard';

export default function DashboardPage(): JSX.Element {
  const router = useRouter();
  const { language } = useLanguage();

  const [userName, setUserName] = useState<string>('');
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  const { topics, activeQuiz, loading: universeLoading } = useQuizUniverseData();

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
  const exploreLabel = language === 'id' ? 'Jelajahi Topik' : 'Explore Topics';

  function handleSelectTopic(topic: TopicActivity): void {
    router.push(`/quiz/${topic.id}`);
  }

  if (isCheckingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-base-bg">
        <p className="font-mono text-sm text-text-muted">Memuat…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-base-bg px-6 py-8 font-sans text-text-primary sm:px-10">
      <div className="mx-auto flex max-w-2xl flex-col gap-5">
        {/* Sapaan minimal, bukan di dalam card */}
        <header className="flex items-start justify-between pt-2">
          <div>
            <p className="text-2xl font-semibold tracking-tight text-text-primary">
              {greeting}{userName ? `, ${userName}` : ''}
            </p>
            <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
          </div>

          {/* Badge streak kecil floating, bukan kotak besar */}
          <div className="flex flex-col items-center rounded-floating bg-base-surface shadow-floating-sm px-4 py-2.5 shrink-0">
            <span className="text-lg font-bold text-accent leading-none">
              {bestStreak}
            </span>
            <span className="mt-1 text-[9px] uppercase tracking-wide text-text-muted">
              Streak
            </span>
          </div>
        </header>

        {/* Tombol pill, bukan block full-width */}
        <button
          type="button"
          onClick={() => router.push('/topics')}
          className="self-start rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-base-surface shadow-floating-sm transition active:scale-95 hover:opacity-90"
        >
          {exploreLabel}
        </button>

        {/* Quiz Universe — tidak render sampai loading auth/data selesai,
            biar tidak ada "flash" empty state sebelum data user masuk */}
        {!universeLoading && (
          <QuizUniverse
            activeQuiz={activeQuiz}
            topics={topics}
            onSelectTopic={handleSelectTopic}
          />
        )}

        {/* Check-in mingguan */}
        <CheckInCard onStreakUpdate={setBestStreak} />

        {/* Quick stats */}
        <QuickStats />

        {/* Lanjutkan belajar — muncul otomatis kalau ada riwayat */}
        <ContinueLearningCard />
      </div>
    </main>
  );
}
