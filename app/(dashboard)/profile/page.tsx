'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '../../../lib/supabase/client';
import { useLanguage } from '../../../context/LanguageContext';
import BookmarksSection from '../../../components/BookmarksSection';
import AvatarUpload from '../../../components/AvatarUpload';

interface ProfileSummary {
  name: string;
  email: string;
  avatarUrl: string | null;
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
  linguistics: { id: 'Linguistik', en: 'Linguistics' },
  'book-trivia': { id: 'Trivia Buku', en: 'Book Trivia' },
  curiosities: { id: 'Rasa Ingin Tahu', en: 'Curiosities' },
  mathematics: { id: 'Matematika', en: 'Mathematics' },
  chemistry: { id: 'Kimia', en: 'Chemistry' },
  biology: { id: 'Biologi', en: 'Biology' },
  computer_science: { id: 'Ilmu Komputer', en: 'Computer Science' },
  astronomy: { id: 'Astronomi', en: 'Astronomy' },
  earth_science: { id: 'Ilmu Bumi', en: 'Earth Science' },
  economics: { id: 'Ekonomi', en: 'Economics' },
  civil_engineering: { id: 'Teknik Sipil', en: 'Civil Engineering' },
  mechanical_engineering: { id: 'Teknik Mesin', en: 'Mechanical Engineering' },
  electrical_engineering: { id: 'Teknik Elektro', en: 'Electrical Engineering' },
  software_engineering: { id: 'Teknik Perangkat Lunak', en: 'Software Engineering' },
  industrial_engineering: { id: 'Teknik Industri', en: 'Industrial Engineering' },
  aerospace_engineering: { id: 'Teknik Kedirgantaraan', en: 'Aerospace Engineering' },
  automotive_engineering: { id: 'Teknik Otomotif', en: 'Automotive Engineering' },
  environmental_engineering: { id: 'Teknik Lingkungan', en: 'Environmental Engineering' },
  football: { id: 'Sepak Bola', en: 'Football' },
  basketball: { id: 'Basket', en: 'Basketball' },
  badminton: { id: 'Bulu Tangkis', en: 'Badminton' },
  olympics_history: { id: 'Olimpiade & Sejarah Olahraga', en: 'Olympics & Sports History' },
  tennis: { id: 'Tenis', en: 'Tennis' },
  esports: { id: 'E-Sports', en: 'Esports' },
  motorsport: { id: 'Formula 1 / Balap', en: 'Motorsport' },
  general_sports: { id: 'Olahraga Umum', en: 'General Sports' },
};

const UNIQUE_VIOLATION_CODE = '23505';

export default function ProfilePage(): JSX.Element {
  const router = useRouter();
  const { language, toggleLanguage } = useLanguage();

  const [userId, setUserId] = useState<string | null>(null);
  const [summary, setSummary] = useState<ProfileSummary | null>(null);
  const [stats, setStats] = useState<readonly SectorStat[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [nameDraft, setNameDraft] = useState<string>('');
  const [isSavingName, setIsSavingName] = useState<boolean>(false);
  const [nameError, setNameError] = useState<string | null>(null);

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
          .select('name, current_streak, best_streak, avatar_url')
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
        setUserId(user.id);
        setSummary({
          name: profile?.name ?? '',
          email: user.email ?? '',
          avatarUrl: profile?.avatar_url ?? null,
          currentStreak: profile?.current_streak ?? 0,
          bestStreak: profile?.best_streak ?? 0,
          totalQuestions,
          topicsAttempted,
        });
        setNameDraft(profile?.name ?? '');
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

  function startEditingName(): void {
    setNameDraft(summary?.name ?? '');
    setNameError(null);
    setIsEditingName(true);
  }

  function cancelEditingName(): void {
    setNameDraft(summary?.name ?? '');
    setNameError(null);
    setIsEditingName(false);
  }

  async function handleSaveName(): Promise<void> {
    if (!userId) return;

    const trimmed = nameDraft.trim();

    if (trimmed.length === 0) {
      setNameError(
        language === 'id' ? 'Username tidak boleh kosong.' : 'Username cannot be empty.',
      );
      return;
    }

    if (trimmed === summary?.name) {
      setIsEditingName(false);
      return;
    }

    setIsSavingName(true);
    setNameError(null);

    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase
      .from('profiles')
      .update({ name: trimmed })
      .eq('id', userId);

    setIsSavingName(false);

    if (error) {
      if (error.code === UNIQUE_VIOLATION_CODE) {
        setNameError(
          language === 'id'
            ? 'Username sudah dipakai orang lain, coba yang lain.'
            : 'That username is already taken, try another.',
        );
      } else {
        setNameError(
          language === 'id'
            ? 'Gagal menyimpan username. Coba lagi.'
            : 'Failed to save username. Please try again.',
        );
      }
      return;
    }

    setSummary((previous) => (previous ? { ...previous, name: trimmed } : previous));
    setIsEditingName(false);
  }

  const loadingText = language === 'id' ? 'Memuat…' : 'Loading…';
  const streakLabel = language === 'id' ? 'Streak' : 'Streak';
  const questionsLabel = language === 'id' ? 'Soal' : 'Questions';
  const topicsLabel = language === 'id' ? 'Topik' : 'Topics';
  const statsHeading = language === 'id' ? 'Statistik per Topik' : 'Stats per Topic';
  const statsEmpty =
    language === 'id'
      ? 'Belum ada data. Kerjakan beberapa kuis dulu.'
      : 'No data yet. Complete a few quizzes first.';
  const languageRowLabel = language === 'id' ? 'Bahasa tampilan' : 'Display language';
  const logoutLabel = language === 'id' ? 'Keluar' : 'Logout';
  const saveLabel = language === 'id' ? 'Simpan' : 'Save';
  const cancelLabel = language === 'id' ? 'Batal' : 'Cancel';
  const namePlaceholder = language === 'id' ? 'Masukkan username' : 'Enter username';

  if (isLoading || !summary || !userId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-base-bg">
        <p className="text-sm text-text-muted">{loadingText}</p>
      </main>
    );
  }

  const initial = summary.name ? summary.name.charAt(0).toUpperCase() : '?';

  return (
    <main className="min-h-screen bg-base-bg px-6 py-10 sm:px-10">
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        {/* Identitas + quick stats */}
        <div className="rounded-floating bg-base-surface shadow-floating-sm p-6">
          <div className="flex items-center gap-4">
            <AvatarUpload
              userId={userId}
              currentAvatarUrl={summary.avatarUrl}
              fallbackInitial={initial}
              onUploadSuccess={(newUrl) =>
                setSummary((previous) =>
                  previous ? { ...previous, avatarUrl: newUrl } : previous,
                )
              }
            />
            <div className="min-w-0 flex-1">
              {isEditingName ? (
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={nameDraft}
                    onChange={(event) => setNameDraft(event.target.value)}
                    placeholder={namePlaceholder}
                    autoFocus
                    disabled={isSavingName}
                    className="w-full rounded-floating border border-base-border bg-base-bg px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
                  />
                  {nameError ? (
                    <p className="text-xs text-status-incorrect">{nameError}</p>
                  ) : null}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => void handleSaveName()}
                      disabled={isSavingName}
                      className="rounded-full bg-accent px-4 py-1.5 text-xs font-medium text-base-surface transition active:scale-95 hover:opacity-90 disabled:opacity-60"
                    >
                      {isSavingName ? '...' : saveLabel}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditingName}
                      disabled={isSavingName}
                      className="rounded-full bg-base-bg px-4 py-1.5 text-xs font-medium text-text-secondary transition active:scale-95 hover:bg-base-border disabled:opacity-60"
                    >
                      {cancelLabel}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={startEditingName}
                  className="group flex items-center gap-1.5 text-left"
                >
                  <p className="truncate text-base font-semibold text-text-primary">
                    {summary.name || (language === 'id' ? 'Pengguna' : 'User')}
                  </p>
                  <i className="ti ti-pencil text-xs text-text-muted transition group-hover:text-accent" aria-hidden="true" />
                </button>
              )}
              <p className="truncate text-xs text-text-muted">{summary.email}</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2.5">
            <div className="rounded-floating bg-base-bg p-3 text-center">
              <p className="text-lg font-semibold text-accent">{summary.bestStreak}</p>
              <p className="mt-0.5 text-[10px] text-text-muted">{streakLabel}</p>
            </div>
            <div className="rounded-floating bg-base-bg p-3 text-center">
              <p className="text-lg font-semibold text-accent">{summary.totalQuestions}</p>
              <p className="mt-0.5 text-[10px] text-text-muted">{questionsLabel}</p>
            </div>
            <div className="rounded-floating bg-base-bg p-3 text-center">
              <p className="text-lg font-semibold text-accent">{summary.topicsAttempted}</p>
              <p className="mt-0.5 text-[10px] text-text-muted">{topicsLabel}</p>
            </div>
          </div>
        </div>

        {/* Statistik per topik */}
        <div className="rounded-floating bg-base-surface shadow-floating-sm p-6">
          <p className="mb-4 text-sm font-semibold text-text-primary">{statsHeading}</p>

          {stats.length === 0 ? (
            <p className="text-sm text-text-muted">{statsEmpty}</p>
          ) : (
            <div className="flex flex-col gap-3.5">
              {stats.map((stat) => {
                const label = SECTOR_LABEL[stat.sector]?.[language] ?? stat.sector;
                return (
                  <div key={stat.sector}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm text-text-secondary">{label}</span>
                      <span className="text-xs text-text-muted">{stat.accuracy}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-base-bg">
                      <div
                        className="h-full rounded-full bg-accent transition-all duration-500"
                        style={{ width: `${stat.accuracy}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

         {/* Bookmarks */}
        <BookmarksSection />

        {/* Pengaturan */}
        <div className="rounded-floating bg-base-surface shadow-floating-sm overflow-hidden">
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex w-full items-center justify-between px-6 py-3.5 text-left transition active:scale-[0.99] hover:bg-base-bg"
          >
            <span className="text-sm text-text-secondary">{languageRowLabel}</span>
            <span className="text-sm text-text-muted">
              {language === 'id' ? 'Indonesia' : 'English'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => void handleLogout()}
            className="flex w-full items-center gap-2 border-t border-base-border px-6 py-3.5 text-left transition active:scale-[0.99] hover:bg-status-incorrectSoft"
          >
            <i className="ti ti-logout text-base text-status-incorrect" aria-hidden="true" />
            <span className="text-sm font-medium text-status-incorrect">{logoutLabel}</span>
          </button>
        </div>
      </div>
    </main>
  );
    }
