'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '../lib/supabase/client';
import { useLanguage } from '../context/LanguageContext';

type LastAttempt = {
  sector: string;
  difficulty: string;
  questionCount: number;
  score: number;
};

const SECTOR_LABELS: Record<string, { id: string; en: string }> = {
  financial: { id: 'Finansial', en: 'Financial' },
  cryptography: { id: 'Kriptografi', en: 'Cryptography' },
  linguistics: { id: 'Linguistik', en: 'Linguistics' },
  physics: { id: 'Fisika', en: 'Physics' },
  psychology: { id: 'Psikologi', en: 'Psychology' },
  science: { id: 'Sains', en: 'Science' },
  curiosities: { id: 'Rasa Ingin Tahu', en: 'Curiosities' },
  mathematics: { id: 'Matematika', en: 'Mathematics' },
};

export default function ContinueLearningCard() {
  const { language } = useLanguage();
  const router = useRouter();
  const [lastAttempt, setLastAttempt] = useState<LastAttempt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLastAttempt = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('sector, difficulty, question_count, score')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setLastAttempt({
          sector: data.sector,
          difficulty: data.difficulty,
          questionCount: data.question_count,
          score: data.score,
        });
      }
      setLoading(false);
    };

    loadLastAttempt();
  }, []);

  // Belum ada riwayat sama sekali (user baru) — tidak render apa-apa,
  // biar tidak ada card kosong yang aneh di homepage
  if (loading || !lastAttempt) return null;

  const sectorLabel =
    SECTOR_LABELS[lastAttempt.sector]?.[language] ?? lastAttempt.sector;

  const title = language === 'id' ? 'Lanjutkan Belajar' : 'Continue Learning';
  const scoreLabel =
    language === 'id'
      ? `${lastAttempt.score}/${lastAttempt.questionCount} benar`
      : `${lastAttempt.score}/${lastAttempt.questionCount} correct`;
  const ctaLabel = language === 'id' ? 'Lanjut' : 'Continue';

  const progressPercent =
    lastAttempt.questionCount > 0
      ? Math.round((lastAttempt.score / lastAttempt.questionCount) * 100)
      : 0;

  return (
    <div className="rounded-floating bg-base-surface shadow-floating-sm p-5">
      <p className="text-xs uppercase tracking-wide text-text-muted mb-2">
        {title}
      </p>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-text-primary">
            {sectorLabel}
          </p>
          <p className="mt-0.5 text-xs text-text-secondary">{scoreLabel}</p>
        </div>

        <button
          type="button"
          onClick={() => router.push(`/quiz/${lastAttempt.sector}`)}
          className="rounded-full bg-accent-soft px-4 py-2 text-xs font-medium text-accent transition active:scale-95 hover:opacity-90"
        >
          {ctaLabel}
        </button>
      </div>

      <div className="mt-3 h-1.5 w-full rounded-full bg-base-bg overflow-hidden">
        <div
          className="h-full rounded-full bg-accent transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
