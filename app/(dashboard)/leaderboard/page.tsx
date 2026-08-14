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
  { key: 'psychology', label: { id: 'Psikologi', en: 'Psychology' }, description: { id: '', en: '' }, accent: 'amber' },
  { key: 'physics', label: { id: 'Fisika', en: 'Physics' }, description: { id: '', en: '' }, accent: 'sky' },
  { key: 'chemistry', label: { id: 'Kimia', en: 'Chemistry' }, description: { id: '', en: '' }, accent: 'violet' },
  { key: 'biology', label: { id: 'Biologi', en: 'Biology' }, description: { id: '', en: '' }, accent: 'teal' },
  { key: 'computer_science', label: { id: 'Ilmu Komputer', en: 'Computer Science' }, description: { id: '', en: '' }, accent: 'stone' },
  { key: 'astronomy', label: { id: 'Astronomi', en: 'Astronomy' }, description: { id: '', en: '' }, accent: 'indigo' },
  { key: 'earth_science', label: { id: 'Ilmu Bumi', en: 'Earth Science' }, description: { id: '', en: '' }, accent: 'emerald' },
  { key: 'economics', label: { id: 'Ekonomi', en: 'Economics' }, description: { id: '', en: '' }, accent: 'rose' },
  { key: 'engineering', label: { id: 'Teknik', en: 'Engineering' }, description: { id: '', en: '' }, accent: 'amber' },
  { key: 'linguistics', label: { id: 'Linguistik', en: 'Linguistics' }, description: { id: '', en: '' }, accent: 'sky' },
  { key: 'book-trivia', label: { id: 'Trivia Buku', en: 'Book Trivia' }, description: { id: '', en: '' }, accent: 'violet' },
  { key: 'curiosities', label: { id: 'Rasa Ingin Tahu', en: 'Curiosities' }, description: { id: '', en: '' }, accent: 'teal' },
  { key: 'mathematics', label: { id: 'Matematika', en: 'Mathematics' }, description: { id: '', en: '' }, accent: 'stone' },
  { key: 'football', label: { id: 'Sepak Bola', en: 'Football' }, description: { id: '', en: '' }, accent: 'indigo' },
  { key: 'basketball', label: { id: 'Basket', en: 'Basketball' }, description: { id: '', en: '' }, accent: 'emerald' },
  { key: 'badminton', label: { id: 'Bulu Tangkis', en: 'Badminton' }, description: { id: '', en: '' }, accent: 'rose' },
  { key: 'olympics_history', label: { id: 'Olimpiade & Sejarah Olahraga', en: 'Olympics & Sports History' }, description: { id: '', en: '' }, accent: 'amber' },
  { key: 'tennis', label: { id: 'Tenis', en: 'Tennis' }, description: { id: '', en: '' }, accent: 'sky' },
  { key: 'esports', label: { id: 'E-Sports', en: 'Esports' }, description: { id: '', en: '' }, accent: 'violet' },
  { key: 'motorsport', label: { id: 'Formula 1 / Balap', en: 'Motorsport' }, description: { id: '', en: '' }, accent: 'teal' },
  { key: 'general_sports', label: { id: 'Olahraga Umum', en: 'General Sports' }, description: { id: '', en: '' }, accent: 'stone' },
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
