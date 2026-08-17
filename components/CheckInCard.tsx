'use client';

import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '../lib/supabase/client';
import { useLanguage } from '../context/LanguageContext';

const DAY_LABELS_ID = ['S', 'S', 'R', 'K', 'J', 'S', 'M'];
const DAY_LABELS_EN = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

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

interface CheckInCardProps {
  onStreakUpdate?: (bestStreak: number) => void;
}

export default function CheckInCard({ onStreakUpdate }: CheckInCardProps) {
  const { language } = useLanguage();
  const [checkedDates, setCheckedDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const dayLabels = language === 'id' ? DAY_LABELS_ID : DAY_LABELS_EN;
  const title = language === 'id' ? 'Check-in Minggu Ini' : 'This Week\'s Check-in';
  const daysLabel = language === 'id' ? 'hari' : 'days';
  const checkedInLabel = language === 'id' ? 'Sudah check-in hari ini' : 'Checked in today';
  const checkInLabel = language === 'id' ? 'Check-in Sekarang' : 'Check In Now';

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
      await updateStreakFromCheckIns(userData.user.id);
    }
    setSubmitting(false);
  };

  const updateStreakFromCheckIns = async (userId: string) => {
    const supabase = getSupabaseBrowserClient();

    // Ambil semua tanggal check-in user, terbaru dulu
    const { data, error } = await supabase
      .from('check_ins')
      .select('checked_in_date')
      .eq('user_id', userId)
      .order('checked_in_date', { ascending: false });

    if (error || !data || data.length === 0) return;

    // Hitung streak berjalan (hari berurutan mundur dari hari ini)
    let streak = 0;
    let cursor = new Date();
    cursor.setHours(0, 0, 0, 0);

    const dateSet = new Set(data.map((row) => row.checked_in_date));

    for (;;) {
      const cursorStr = cursor.toISOString().slice(0, 10);
      if (dateSet.has(cursorStr)) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('best_streak')
      .eq('id', userId)
      .single();

    const previousBest = profile?.best_streak ?? 0;
    const nextBest = Math.max(previousBest, streak);

    await supabase
      .from('profiles')
      .update({
        current_streak: streak,
        best_streak: nextBest,
      })
      .eq('id', userId);

    onStreakUpdate?.(nextBest);
  };

  return (
    <div className="rounded-floating bg-base-surface shadow-floating-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
        <span className="text-xs text-text-muted">
          {checkedDates.size}/7 {daysLabel}
        </span>
      </div>

      <div className="flex justify-between mb-4">
        {weekDates.map((date, i) => {
          const isChecked = checkedDates.has(date);
          const isToday = date === todayStr;

          return (
            <div key={date} className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] text-text-muted">{dayLabels[i]}</span>
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
          ? checkedInLabel
          : checkInLabel}
      </button>
    </div>
  );
}
