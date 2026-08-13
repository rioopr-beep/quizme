'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseBrowserClient } from '../../../lib/supabase/client';
import { useLanguage } from '../../../context/LanguageContext';
import type { SectorMeta } from '../../../types/question';

const TOPIC_META: readonly SectorMeta[] = [
  { key: 'financial', label: { id: 'Keuangan', en: 'Financial' }, description: { id: '', en: '' }, accent: 'emerald' },
  { key: 'cryptography', label: { id: 'Kriptografi', en: 'Cryptography' }, description: { id: '', en: '' }, accent: 'rose' },
  { key: 'psychology', label: { id: 'Psikologi', en: 'Psychology' }, description: { id: '', en: '' }, accent: 'emerald' },
  { key: 'physics', label: { id: 'Fisika', en: 'Physics' }, description: { id: '', en: '' }, accent: 'rose' },
  { key: 'science', label: { id: 'Sains Umum', en: 'General Science' }, description: { id: '', en: '' }, accent: 'emerald' },
  { key: 'linguistics', label: { id: 'Linguistik', en: 'Linguistics' }, description: { id: '', en: '' }, accent: 'rose' },
  { key: 'book-trivia', label: { id: 'Trivia Buku', en: 'Book Trivia' }, description: { id: '', en: '' }, accent: 'emerald' },
  { key: 'curiosities', label: { id: 'Rasa Ingin Tahu', en: 'Curiosities' }, description: { id: '', en: '' }, accent: 'emerald' },
  { key: 'mathematics', label: { id: 'Matematika', en: 'Mathematics' }, description: { id: '', en: '' }, accent: 'rose' },
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
  const loadingText = language === 'id' ? 'Memuat…' : 'Loading…';

  if (isCheckingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-base-bg">
        <p className="text-sm text-text-muted">{loadingText}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-base-bg px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-xl font-semibold text-text-primary mb-6">{heading}</h1>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {TOPIC_META.map((topic) => (
            <Link
              key={topic.key}
              href={`/leaderboard/${topic.key}`}
              className="flex items-center justify-between rounded-floating bg-base-surface shadow-floating-sm px-4 py-3.5 transition active:scale-95 hover:shadow-floating"
            >
              <span className="text-sm font-medium text-text-primary">
                {topic.label[language]}
              </span>
              <i className="ti ti-chevron-right text-sm text-text-muted" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
