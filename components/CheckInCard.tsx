'use client';

import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '../../lib/supabase/client';

const DAY_LABELS = ['S', 'S', 'R', 'K', 'J', 'S', 'M']; // Sen-Min (mulai Senin)

function getWeekDates(): string[] {
  const now = new Date();
  const day = now.getDay(); // 0 = Minggu
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
  });
}

export default function CheckInCard() {
  const [checkedDates, setCheckedDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const weekDates = getWeekDates();
  const todayStr = new Date().toISOString().slice(0, 10);
  const alreadyCheckedToday = checkedDates.has(todayStr);

  useEffect(() => {
    const loadCheckIns = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('check_ins')
        .select('checked_in_date')
        .eq('user_id', userData.user.id)
        .gte('checked_in_date', weekDates[0])
        .lte('checked_in_date', weekDates[6]);

      if (!error && data) {
        setCheckedDates(new Set(data.map((row) => row.checked_in_date)));
      }
      setLoading(false);
    };

    loadCheckIns();
  }, []);

  const handleCheckIn = async () => {
    if (alreadyCheckedToday || submitting) return;
    setSubmitting(true);

    const supabase = getSupabaseBrowserClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from('check_ins').insert({
      user_id: userData.user.id,
      checked_in_date: todayStr,
    });

    if (!error) {
      setCheckedDates((prev) => new Set(prev).add(todayStr));
    }
    setSubmitting(false);
  };

  return (
    <div className="rounded-floating bg-base-surface shadow-floating-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-primary">Check-in Minggu Ini</h3>
        <span className="text-xs text-text-muted">
          {checkedDates.size}/7 hari
        </span>
      </div>

      <div className="flex justify-between mb-4">
        {weekDates.map((date, i) => {
          const isChecked = checkedDates.has(date);
          const isToday = date === todayStr;

          return (
            <div key={date} className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] text-text-muted">{DAY_LABELS[i]}</span>
              <div
                className={[
                  'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300',
                  isChecked
                    ? 'bg-accent shadow-floating-sm'
                    : 'bg-base-bg border border-base-border',
                  isToday && !isChecked ? 'ring-2 ring-accent-soft' : '',
                ].join(' ')}
              >
                {isChecked && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleCheckIn}
        disabled={alreadyCheckedToday || submitting || loading}
        className={[
          'w-full py-2.5 rounded-floating text-sm font-medium transition-all duration-300 active:scale-95',
          alreadyCheckedToday
            ? 'bg-status-correctSoft text-status-correct cursor-default'
            : 'bg-accent text-base-surface hover:opacity-90',
        ].join(' ')}
      >
        {loading
          ? '...'
          : alreadyCheckedToday
          ? 'Sudah check-in hari ini'
          : 'Check-in Sekarang'}
      </button>
    </div>
  );
}
