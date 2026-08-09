'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '../../../../lib/supabase/client';
import { useLanguage } from '../../../../context/LanguageContext';

interface LeaderboardRow {
  user_id: string;
  name: string;
  total_questions: number;
}

const SECTOR_LABEL: Record<string, { id: string; en: string }> = {
  financial: { id: 'Keuangan', en: 'Financial' },
  cryptography: { id: 'Kriptografi', en: 'Cryptography' },
  psychology: { id: 'Psikologi', en: 'Psychology' },
  physics: { id: 'Fisika', en: 'Physics' },
  science: { id: 'Sains Umum', en: 'General Science' },
  linguistics: { id: 'Linguistik', en: 'Linguistics' },
  'book-trivia': { id: 'Trivia Buku', en: 'Book Trivia' },
};

export default function LeaderboardPage(): JSX.Element {
  const params = useParams<{ sector: string }>();
  const router = useRouter();
  const { language } = useLanguage();

  const [rows, setRows] = useState<readonly LeaderboardRow[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function loadLeaderboard(): Promise<void> {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { data } = await supabase.rpc('get_leaderboard', {
        target_sector: params.sector,
      });

      if (isMounted) {
        setRows(data ?? []);
        setCurrentUserId(user.id);
        setIsLoading(false);
      }
    }

    void loadLeaderboard();
    return () => {
      isMounted = false;
    };
  }, [params.sector, router]);

  const sectorLabel = SECTOR_LABEL[params.sector]?.[language] ?? params.sector;
  const back = language === 'id' ? '← Kembali' : '← Back';
  const heading = language === 'id' ? 'Papan Peringkat' : 'Leaderboard';
  const loadingText = language === 'id' ? 'Memuat…' : 'Loading…';
  const emptyText = language === 'id' ? 'Belum ada data peringkat.' : 'No ranking data yet.';
  const questionsLabel = language === 'id' ? 'soal' : 'questions';
  const youLabel = language === 'id' ? 'kamu' : 'you';

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-center">
        <p className="font-mono text-sm text-slate-400">{loadingText}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 sm:px-10">
      <div className="mx-auto flex max-w-md flex-col gap-6">
        <header className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/leaderboard')}
            className="font-mono text-sm text-slate-400 transition hover:text-slate-600"
          >
            {back}
          </button>
          <h1 className="text-lg font-semibold text-slate-800">
            {heading} · {sectorLabel}
          </h1>
        </header>

        {rows.length === 0 ? (
          <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white px-6 py-10 text-center shadow-sm">
            <p className="text-sm text-slate-500">{emptyText}</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-sm">
            {rows.map((row, index) => {
              const isMe = row.user_id === currentUserId;
              return (
                <div
                  key={row.user_id}
                  className={`flex items-center justify-between px-5 py-3 ${
                    isMe ? 'bg-indigo-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 font-mono text-sm ${
                        index === 0 ? 'text-amber-500' : 'text-slate-400'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span
                      className={`text-sm ${
                        isMe ? 'font-semibold text-indigo-900' : 'text-slate-700'
                      }`}
                    >
                      {row.name || (language === 'id' ? 'Pengguna' : 'User')}
                      {isMe ? ` (${youLabel})` : ''}
                    </span>
                  </div>
                  <span className="font-mono text-sm text-slate-500">
                    {row.total_questions} {questionsLabel}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
