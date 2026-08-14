'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseBrowserClient } from '../../../lib/supabase/client';
import { useLanguage } from '../../../context/LanguageContext';

interface TopicMeta {
  key: string;
  icon: string;
  label: { id: string; en: string };
}

const TOPIC_META: readonly TopicMeta[] = [
  { key: 'financial', icon: 'ti-currency-dollar', label: { id: 'Keuangan', en: 'Financial' } },
  { key: 'cryptography', icon: 'ti-lock', label: { id: 'Kriptografi', en: 'Cryptography' } },
  { key: 'psychology', icon: 'ti-brain', label: { id: 'Psikologi', en: 'Psychology' } },
  { key: 'physics', icon: 'ti-atom-2', label: { id: 'Fisika', en: 'Physics' } },
  { key: 'chemistry', icon: 'ti-flask', label: { id: 'Kimia', en: 'Chemistry' } },
  { key: 'biology', icon: 'ti-dna-2', label: { id: 'Biologi', en: 'Biology' } },
  { key: 'computer_science', icon: 'ti-code', label: { id: 'Ilmu Komputer', en: 'Computer Science' } },
  { key: 'astronomy', icon: 'ti-telescope', label: { id: 'Astronomi', en: 'Astronomy' } },
  { key: 'earth_science', icon: 'ti-world', label: { id: 'Ilmu Bumi', en: 'Earth Science' } },
  { key: 'economics', icon: 'ti-chart-line', label: { id: 'Ekonomi', en: 'Economics' } },
  { key: 'engineering', icon: 'ti-settings', label: { id: 'Teknik', en: 'Engineering' } },
  { key: 'linguistics', icon: 'ti-language', label: { id: 'Linguistik', en: 'Linguistics' } },
  { key: 'book-trivia', icon: 'ti-book', label: { id: 'Trivia Buku', en: 'Book Trivia' } },
  { key: 'curiosities', icon: 'ti-bulb', label: { id: 'Rasa Ingin Tahu', en: 'Curiosities' } },
  { key: 'mathematics', icon: 'ti-math-function', label: { id: 'Matematika', en: 'Mathematics' } },
  { key: 'football', icon: 'ti-ball-football', label: { id: 'Sepak Bola', en: 'Football' } },
  { key: 'basketball', icon: 'ti-ball-basketball', label: { id: 'Basket', en: 'Basketball' } },
  { key: 'badminton', icon: 'ti-ball-badminton', label: { id: 'Bulu Tangkis', en: 'Badminton' } },
  { key: 'olympics_history', icon: 'ti-medal', label: { id: 'Olimpiade & Sejarah Olahraga', en: 'Olympics & Sports History' } },
  { key: 'tennis', icon: 'ti-ball-tennis', label: { id: 'Tenis', en: 'Tennis' } },
  { key: 'esports', icon: 'ti-device-gamepad-2', label: { id: 'E-Sports', en: 'Esports' } },
  { key: 'motorsport', icon: 'ti-steering-wheel', label: { id: 'Formula 1 / Balap', en: 'Motorsport' } },
  { key: 'general_sports', icon: 'ti-run', label: { id: 'Olahraga Umum', en: 'General Sports' } },
];

type TopicCountMap = Readonly<Record<string, number>>;

export default function TopicsPage(): JSX.Element {
  const router = useRouter();
  const { language } = useLanguage();
  const [topicCounts, setTopicCounts] = useState<TopicCountMap>({});
  const [isLoadingCounts, setIsLoadingCounts] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function checkAuthAndLoad(): Promise<void> {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const counts: Record<string, number> = {};
      await Promise.all(
        TOPIC_META.map(async (topic) => {
          const { count } = await supabase
            .from('questions')
            .select('id', { count: 'exact', head: true })
            .eq('sector', topic.key);
          counts[topic.key] = count ?? 0;
        }),
      );

      if (isMounted) {
        setTopicCounts(counts);
        setIsLoadingCounts(false);
      }
    }

    void checkAuthAndLoad();
    return () => {
      isMounted = false;
    };
  }, [router]);

  const heading = language === 'id' ? 'Topik' : 'Topics';

  return (
    <main className="min-h-screen bg-base-bg px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-xl font-semibold text-text-primary mb-6">{heading}</h1>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {TOPIC_META.map((topic) => {
            const count = topicCounts[topic.key] ?? 0;
            return (
              <Link
                key={topic.key}
                href={`/quiz/${topic.key}`}
                className="flex flex-col items-start gap-3 rounded-floating bg-base-surface shadow-floating-sm p-5 transition active:scale-95 hover:shadow-floating"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <i className={`ti ${topic.icon} text-lg`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    {topic.label[language]}
                  </p>
                  <p className="mt-0.5 text-[11px] text-text-muted">
                    {isLoadingCounts ? '...' : count}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
