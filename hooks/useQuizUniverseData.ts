'use client';

// ============================================================================
// useQuizUniverseData — agregasi quiz_attempts jadi bentuk yang dipakai
// QuizUniverse: activeQuiz (attempt terbaru) & topics (per-sector activity).
// Pola fetch sama persis dengan QuickStats/ContinueLearningCard yang sudah
// ada (getSupabaseBrowserClient → auth.getUser → query), sengaja tidak
// direfactor jadi shared util biar tidak menyentuh component existing.
// ============================================================================

import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '../lib/supabase/client';
import { useLanguage } from '../context/LanguageContext';
import type { ActiveQuiz, TopicActivity } from '../components/QuizUniverse';

type AttemptRow = {
  sector: string;
  question_count: number | null;
  score: number | null;
  created_at: string;
};

// Sama dengan SECTOR_LABELS di ContinueLearningCard, ditambah beberapa sector
// lain yang sering muncul. Sector yang belum terdaftar di sini otomatis
// fallback ke fallbackLabel() (capitalize key-nya), tidak akan crash.
const SECTOR_LABELS: Record<string, { id: string; en: string }> = {
  financial: { id: 'Finansial', en: 'Financial' },
  cryptography: { id: 'Kriptografi', en: 'Cryptography' },
  linguistics: { id: 'Linguistik', en: 'Linguistics' },
  translation: { id: 'Terjemahan', en: 'Translation' },
  physics: { id: 'Fisika', en: 'Physics' },
  psychology: { id: 'Psikologi', en: 'Psychology' },
  curiosities: { id: 'Rasa Ingin Tahu', en: 'Curiosities' },
  mathematics: { id: 'Matematika', en: 'Mathematics' },
  'book-trivia': { id: 'Trivia Buku', en: 'Book Trivia' },
  kimia: { id: 'Kimia', en: 'Chemistry' },
  biologi: { id: 'Biologi', en: 'Biology' },
  computer_science: { id: 'Ilmu Komputer', en: 'Computer Science' },
  astronomy: { id: 'Astronomi', en: 'Astronomy' },
  earth_science: { id: 'Ilmu Bumi', en: 'Earth Science' },
  economic: { id: 'Ekonomi', en: 'Economics' },
};

function fallbackLabel(sector: string): string {
  return sector.replace(/[_-]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function labelFor(sector: string, language: 'id' | 'en'): string {
  return SECTOR_LABELS[sector]?.[language] ?? fallbackLabel(sector);
}

interface UseQuizUniverseDataResult {
  topics: TopicActivity[];
  activeQuiz: ActiveQuiz | null;
  loading: boolean;
}

export function useQuizUniverseData(): UseQuizUniverseDataResult {
  const { language } = useLanguage();
  const [topics, setTopics] = useState<TopicActivity[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<ActiveQuiz | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function load(): Promise<void> {
      const supabase = getSupabaseBrowserClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        if (isMounted) setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('sector, question_count, score, created_at')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false });

      if (!isMounted) return;

      if (error || data == null || data.length === 0) {
        setLoading(false);
        return;
      }

      const rows = data as AttemptRow[];

      // Agregasi per-sector: jumlah attempt & kapan terakhir dikerjakan
      const bySector = new Map<string, { count: number; lastAccessedAt: string }>();
      for (const row of rows) {
        const existing = bySector.get(row.sector);
        if (existing != null) {
          existing.count += 1;
          if (row.created_at > existing.lastAccessedAt) {
            existing.lastAccessedAt = row.created_at;
          }
        } else {
          bySector.set(row.sector, { count: 1, lastAccessedAt: row.created_at });
        }
      }

      const maxCount = Math.max(...Array.from(bySector.values(), (v) => v.count));

      const nextTopics: TopicActivity[] = Array.from(bySector.entries()).map(
        ([sector, info]) => ({
          id: sector,
          name: labelFor(sector, language),
          quizCount: info.count,
          activity: maxCount > 0 ? info.count / maxCount : 0,
          lastAccessedAt: info.lastAccessedAt,
        }),
      );

      const latest = rows[0];
      setActiveQuiz({
        topicId: latest.sector,
        topicName: labelFor(latest.sector, language),
        correctCount: latest.score ?? 0,
        totalCount: latest.question_count ?? 0,
        href: `/quiz/${latest.sector}`,
      });
      setTopics(nextTopics);
      setLoading(false);
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, [language]);

  return { topics, activeQuiz, loading };
}
