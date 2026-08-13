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
  curiosities: { id: 'Rasa Ingin Tahu', en: 'Curiosities' },
  mathematics: { id: 'Matematika', en: 'Mathematics' },
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
  const youLabel = language === 'id' ? 'kamu' : 'you';

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-base-bg px-6 text-center">
        <p className="text-sm text-text-muted">{loadingText}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-base-bg px-6 py-10 sm:px-10">
      <div className="mx-auto flex max-w-md flex-col gap-5">
        <header className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/leaderboard')}
            className="text-sm text-text-muted transition active:scale-95 hover:text-text-secondary"
          >
            {back}
          </button>
          <h1 className="text-base font-semibold text-text-primary">
            {heading} · {sectorLabel}
          </h1>
        </header>

        {rows.length === 0 ? (
          <div className="rounded-floating bg-base-surface shadow-floating-sm px-6 py-10 text-center">
            <p className="text-sm text-text-muted">{emptyText}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {rows.map((row, index) => {
              const isMe = row.user_id === currentUserId;
              const isTopThree = index < 3;

              return (
                <div
                  key={row.user_id}
                  className={[
                    'flex items-center justify-between rounded-floating px-4 py-3 transition',
                    isMe
                      ? 'bg-accent-soft shadow-floating-sm'
                      : 'bg-base-surface shadow-floating-sm',
                  ].join(' ')}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={[
                        'flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold',
                        isTopThree
                          ? 'bg-accent text-base-surface'
                          : 'text-text-muted',
                      ].join(' ')}
                    >
                      {index + 1}
                    </span>
                    <span
                      className={[
                        'text-sm',
                        isMe ? 'font-semibold text-accent' : 'text-text-primary',
                      ].join(' ')}
                    >
                      {row.name || (language === 'id' ? 'Pengguna' : 'User')}
                      {isMe ? ` (${youLabel})` : ''}
                    </span>
                  </div>
                  <span className="text-xs text-text-muted">{row.total_questions}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
                  }
