'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseBrowserClient } from '../../../lib/supabase/client';
import { useLanguage } from '../../../context/LanguageContext';
import type { SectorMeta } from '../../../types/question';

const TOPIC_META: readonly SectorMeta[] = [
  {
    key: 'financial',
    label: { id: 'Keuangan', en: 'Financial' },
    description: { id: '', en: '' },
    accent: 'emerald',
  },
  {
    key: 'cryptography',
    label: { id: 'Kriptografi', en: 'Cryptography' },
    description: { id: '', en: '' },
    accent: 'rose',
  },
  {
    key: 'psychology',
    label: { id: 'Psikologi', en: 'Psychology' },
    description: { id: '', en: '' },
    accent: 'emerald',
  },
  {
    key: 'physics',
    label: { id: 'Fisika', en: 'Physics' },
    description: { id: '', en: '' },
    accent: 'rose',
  },
  {
    key: 'science',
    label: { id: 'Sains Umum', en: 'General Science' },
    description: { id: '', en: '' },
    accent: 'emerald',
  },
  {
    key: 'linguistics',
    label: { id: 'Linguistik', en: 'Linguistics' },
    description: { id: '', en: '' },
    accent: 'rose',
  },
  {
    key: 'book-trivia',
    label: { id: 'Trivia Buku', en: 'Book Trivia' },
    description: { id: '', en: '' },
    accent: 'emerald',
  },
{
  key: 'curiosities',
  label: { id: 'Rasa Ingin Tahu', en: 'Curiosities' },
  description: { id: '', en: '' },
  accent: 'emerald',
},
{
  key: 'mathematics',
  label: { id: 'Matematika', en: 'Mathematics' },
  description: { id: '', en: '' },
  accent: 'rose',
},
];

export default function LeaderboardTopicSelectPage(): JSX.Element {
  const router = useRouter();
  const { language } = useLanguage();
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function checkAuth(): Promise<void> {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      if (isMounted) {
        setIsCheckingAuth(false);
      }
    }

    void checkAuth();
    return () => {
      isMounted = false;
    };
  }, [router]);

  const heading = language === 'id' ? 'Papan Peringkat' : 'Leaderboard';
  const subtitle =
    language === 'id' ? 'Pilih topik untuk lihat peringkat' : 'Choose a topic to see rankings';
  const loadingText = language === 'id' ? 'Memuat…' : 'Loading…';

  if (isCheckingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="font-mono text-sm text-slate-400">{loadingText}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 sm:px-10">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <header>
          <h1 className="text-lg font-semibold text-slate-800">{heading}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </header>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {TOPIC_META.map((topic) => {
            const isEmerald = topic.accent === 'emerald';
            return (
              <Link
                key={topic.key}
                href={`/leaderboard/${topic.key}`}
                className={`flex items-center justify-between rounded-xl border bg-white px-5 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                  isEmerald
                    ? 'border-emerald-100 hover:border-emerald-300'
                    : 'border-rose-100 hover:border-rose-300'
                }`}
              >
                <span className="text-sm font-medium text-slate-800">
                  {topic.label[language]}
                </span>
                <i
                  className={`ti ti-chevron-right text-lg ${
                    isEmerald ? 'text-emerald-500' : 'text-rose-500'
                  }`}
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
