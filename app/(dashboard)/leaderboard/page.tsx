'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseBrowserClient } from '../../../lib/supabase/client';
import { useLanguage } from '../../../context/LanguageContext';

interface StandaloneTopic {
  kind: 'standalone';
  key: string;
  label: { id: string; en: string };
}

interface CategoryTopic {
  kind: 'category';
  key: string;
  label: { id: string; en: string };
}

type TopicEntry = StandaloneTopic | CategoryTopic;

export const LEADERBOARD_CATEGORY_CHILDREN: Record<string, readonly { key: string; label: { id: string; en: string } }[]> = {
  science: [
    { key: 'chemistry', label: { id: 'Kimia', en: 'Chemistry' } },
    { key: 'biology', label: { id: 'Biologi', en: 'Biology' } },
    { key: 'computer_science', label: { id: 'Ilmu Komputer', en: 'Computer Science' } },
    { key: 'astronomy', label: { id: 'Astronomi', en: 'Astronomy' } },
    { key: 'earth_science', label: { id: 'Ilmu Bumi', en: 'Earth Science' } },
    { key: 'economics', label: { id: 'Ekonomi', en: 'Economics' } },
  ],
  engineering: [
    { key: 'civil_engineering', label: { id: 'Teknik Sipil', en: 'Civil Engineering' } },
    { key: 'mechanical_engineering', label: { id: 'Teknik Mesin', en: 'Mechanical Engineering' } },
    { key: 'electrical_engineering', label: { id: 'Teknik Elektro', en: 'Electrical Engineering' } },
    { key: 'software_engineering', label: { id: 'Teknik Perangkat Lunak', en: 'Software Engineering' } },
    { key: 'industrial_engineering', label: { id: 'Teknik Industri', en: 'Industrial Engineering' } },
    { key: 'aerospace_engineering', label: { id: 'Teknik Kedirgantaraan', en: 'Aerospace Engineering' } },
    { key: 'automotive_engineering', label: { id: 'Teknik Otomotif', en: 'Automotive Engineering' } },
    { key: 'environmental_engineering', label: { id: 'Teknik Lingkungan', en: 'Environmental Engineering' } },
  ],
  sports: [
    { key: 'football', label: { id: 'Sepak Bola', en: 'Football' } },
    { key: 'basketball', label: { id: 'Basket', en: 'Basketball' } },
    { key: 'badminton', label: { id: 'Bulu Tangkis', en: 'Badminton' } },
    { key: 'olympics_history', label: { id: 'Olimpiade & Sejarah Olahraga', en: 'Olympics & Sports History' } },
    { key: 'tennis', label: { id: 'Tenis', en: 'Tennis' } },
    { key: 'esports', label: { id: 'E-Sports', en: 'Esports' } },
    { key: 'motorsport', label: { id: 'Formula 1 / Balap', en: 'Motorsport' } },
    { key: 'general_sports', label: { id: 'Olahraga Umum', en: 'General Sports' } },
  ],
};

const TOPIC_ENTRIES: readonly TopicEntry[] = [
  { kind: 'standalone', key: 'financial', label: { id: 'Keuangan', en: 'Financial' } },
  { kind: 'standalone', key: 'cryptography', label: { id: 'Kriptografi', en: 'Cryptography' } },
  { kind: 'standalone', key: 'psychology', label: { id: 'Psikologi', en: 'Psychology' } },
  { kind: 'standalone', key: 'physics', label: { id: 'Fisika', en: 'Physics' } },
  { kind: 'standalone', key: 'linguistics', label: { id: 'Linguistik', en: 'Linguistics' } },
  { kind: 'standalone', key: 'book-trivia', label: { id: 'Trivia Buku', en: 'Book Trivia' } },
  { kind: 'standalone', key: 'curiosities', label: { id: 'Rasa Ingin Tahu', en: 'Curiosities' } },
  { kind: 'standalone', key: 'mathematics', label: { id: 'Matematika', en: 'Mathematics' } },
  { kind: 'category', key: 'science', label: { id: 'Science', en: 'Science' } },
  { kind: 'category', key: 'engineering', label: { id: 'Engineering', en: 'Engineering' } },
  { kind: 'category', key: 'sports', label: { id: 'Olahraga', en: 'Sports' } },
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
          {TOPIC_ENTRIES.map((topic) => {
            const href =
              topic.kind === 'standalone'
                ? `/leaderboard/${topic.key}`
                : `/leaderboard/category/${topic.key}`;

            return (
              <Link
                key={topic.key}
                href={href}
                className="flex items-center justify-between rounded-floating bg-base-surface shadow-floating-sm px-4 py-3.5 transition active:scale-95 hover:shadow-floating"
              >
                <span className="text-sm font-medium text-text-primary">
                  {topic.label[language]}
                </span>
                <i className="ti ti-chevron-right text-sm text-text-muted" aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
