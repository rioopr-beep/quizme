'use client';

import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '../lib/supabase/client';
import { useLanguage } from '../context/LanguageContext';

type Stats = {
  totalAnswered: number;
  topicsTriedCount: number;
  accuracy: number; // 0-100
};

export default function QuickStats() {
  const { language } = useLanguage();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('sector, question_count, score')
        .eq('user_id', userData.user.id);

      if (!error && data) {
        const totalAnswered = data.reduce(
          (sum, row) => sum + (row.question_count ?? 0),
          0
        );
        const totalCorrect = data.reduce((sum, row) => sum + (row.score ?? 0), 0);
        const topicsTriedCount = new Set(data.map((row) => row.sector)).size;
        const accuracy =
          totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

        setStats({ totalAnswered, topicsTriedCount, accuracy });
      }
      setLoading(false);
    };

    loadStats();
  }, []);

  const labels =
    language === 'id'
      ? { answered: 'Soal Dijawab', topics: 'Topik Dicoba', accuracy: 'Akurasi' }
      : { answered: 'Answered', topics: 'Topics Tried', accuracy: 'Accuracy' };

  const items = [
    { label: labels.answered, value: stats?.totalAnswered ?? 0 },
    { label: labels.topics, value: stats?.topicsTriedCount ?? 0 },
    { label: labels.accuracy, value: `${stats?.accuracy ?? 0}%` },
  ];

  return (
    <div className="flex gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex-1 rounded-floating bg-base-surface shadow-floating-sm px-3 py-3.5 text-center"
        >
          <p className="text-lg font-bold text-text-primary leading-none">
            {loading ? '—' : item.value}
          </p>
          <p className="mt-1.5 text-[10px] uppercase tracking-wide text-text-muted">
            {item.label}
          </p>
        </div>
      ))}
    </div>
  );
}
