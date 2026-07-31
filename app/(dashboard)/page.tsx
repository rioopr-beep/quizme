'use client';

// ============================================================================
// QuizMe — Dashboard Interface
// Header dengan indikator streak, tombol sakelar bahasa, dan grid pilihan
// 6 sektor studi kasus dengan estetika Soft Light Theme.
// ============================================================================

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import type { SectorMeta } from '@/types/question';

const SECTOR_META: readonly SectorMeta[] = [
  {
    key: 'financial',
    label: { id: 'Keuangan', en: 'Financial' },
    description: {
      id: 'Studi kasus valuasi, manajemen risiko, dan strategi investasi.',
      en: 'Case studies on valuation, risk management, and investment strategy.',
    },
    accent: 'emerald',
  },
  {
    key: 'cryptography',
    label: { id: 'Kriptografi', en: 'Cryptography' },
    description: {
      id: 'Analisis algoritma enkripsi dan protokol keamanan data.',
      en: 'Analysis of encryption algorithms and data security protocols.',
    },
    accent: 'rose',
  },
  {
    key: 'psychology',
    label: { id: 'Psikologi', en: 'Psychology' },
    description: {
      id: 'Interpretasi perilaku, bias kognitif, dan dinamika mental.',
      en: 'Interpretation of behavior, cognitive bias, and mental dynamics.',
    },
    accent: 'emerald',
  },
  {
    key: 'physics',
    label: { id: 'Fisika', en: 'Physics' },
    description: {
      id: 'Pemecahan masalah mekanika, termodinamika, dan gelombang.',
      en: 'Problem-solving in mechanics, thermodynamics, and wave physics.',
    },
    accent: 'rose',
  },
  {
    key: 'science',
    label: { id: 'Sains Umum', en: 'General Science' },
    description: {
      id: 'Penalaran ilmiah lintas disiplin biologi dan kimia.',
      en: 'Cross-disciplinary scientific reasoning across biology and chemistry.',
    },
    accent: 'emerald',
  },
  {
    key: 'linguistics',
    label: { id: 'Linguistik', en: 'Linguistics' },
    description: {
      id: 'Analisis struktur bahasa, semantik, dan wacana.',
      en: 'Analysis of language structure, semantics, and discourse.',
    },
    accent: 'rose',
  },
];

const STREAK_STORAGE_KEY = 'quizme:best-streak';

type SectorCountMap = Readonly<Record<string, number>>;

function readStoredBestStreak(): number {
  if (typeof window === 'undefined') {
    return 0;
  }

  const stored = window.localStorage.getItem(STREAK_STORAGE_KEY);
  const parsed = stored ? Number.parseInt(stored, 10) : 0;

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export default function DashboardPage(): JSX.Element {
  const { language, toggleLanguage } = useLanguage();
  const [sectorCounts, setSectorCounts] = useState<SectorCountMap>({});
  const [isLoadingCounts, setIsLoadingCounts] = useState<boolean>(true);
  const [bestStreak, setBestStreak] = useState<number>(0);

  useEffect(() => {
    setBestStreak(readStoredBestStreak());
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadSectorCounts(): Promise<void> {
      const supabase = getSupabaseBrowserClient();
      const counts: Record<string, number> = {};

      await Promise.all(
        SECTOR_META.map(async (sector) => {
          const { count } = await supabase
            .from('questions')
            .select('id', { count: 'exact', head: true })
            .eq('sector', sector.key);

          counts[sector.key] = count ?? 0;
        }),
      );

      if (isMounted) {
        setSectorCounts(counts);
        setIsLoadingCounts(false);
      }
    }

    void loadSectorCounts();

    return () => {
      isMounted = false;
    };
  }, []);

  const copy = useMemo(
    () => ({
      subtitle:
        language === 'id'
          ? 'Platform evaluasi analisis lintas disiplin'
          : 'Cross-disciplinary analysis assessment platform',
      streakLabel: language === 'id' ? 'Rekor Beruntun' : 'Best Streak',
      sectorHeading: language === 'id' ? 'Pilih Sektor Studi Kasus' : 'Choose a Case Study Sector',
      questionCountLabel: (count: number): string =>
        language === 'id' ? `${count} soal tersedia` : `${count} questions available`,
      startLabel: language === 'id' ? 'Mulai' : 'Start',
    }),
    [language],
  );

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 font-sans text-slate-800 sm:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <header className="flex flex-col items-start justify-between gap-6 border-b border-slate-200 pb-8 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-mono text-3xl font-semibold tracking-tight text-slate-900">
              QuizMe
            </h1>
            <p className="mt-1 text-sm text-slate-500">{copy.subtitle}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
              <span className="text-xs uppercase tracking-wide text-slate-400">
                {copy.streakLabel}
              </span>
              <span className="font-mono text-lg font-semibold text-emerald-600">{bestStreak}</span>
            </div>

            <button
              type="button"
              onClick={toggleLanguage}
              aria-label="Toggle language"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-mono text-sm font-medium text-slate-600 shadow-sm transition hover:border-emerald-300 hover:text-emerald-600"
            >
              {language === 'id' ? 'EN' : 'ID'}
            </button>
          </div>
        </header>

        <section>
          <h2 className="mb-5 text-lg font-semibold text-slate-800">{copy.sectorHeading}</h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SECTOR_META.map((sector) => {
              const isEmerald = sector.accent === 'emerald';
              const count = sectorCounts[sector.key] ?? 0;

              return (
                <Link
                  key={sector.key}
                  href={`/quiz/${sector.key}`}
                  className={`group flex flex-col justify-between rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                    isEmerald
                      ? 'border-emerald-100 hover:border-emerald-300'
                      : 'border-rose-100 hover:border-rose-300'
                  }`}
                >
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                      {sector.label[language]}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                      {sector.description[language]}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <span className="font-mono text-xs text-slate-400">
                      {isLoadingCounts ? '···' : copy.questionCountLabel(count)}
                    </span>
                    <span
                      className={`font-mono text-sm font-medium ${
                        isEmerald ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {copy.startLabel} →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
