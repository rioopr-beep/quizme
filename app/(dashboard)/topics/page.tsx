'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseBrowserClient } from '../../../lib/supabase/client';
import { useLanguage } from '../../../context/LanguageContext';

interface StandaloneTopic {
  kind: 'standalone';
  key: string;
  icon: string;
  label: { id: string; en: string };
}

interface CategoryTopic {
  kind: 'category';
  key: string;
  icon: string;
  label: { id: string; en: string };
  childCount: number;
}

type TopicEntry = StandaloneTopic | CategoryTopic;

export const CATEGORY_CHILDREN: Record<string, readonly { key: string; icon: string; label: { id: string; en: string } }[]> = {
  science: [
    { key: 'chemistry', icon: 'ti-flask', label: { id: 'Kimia', en: 'Chemistry' } },
    { key: 'biology', icon: 'ti-dna-2', label: { id: 'Biologi', en: 'Biology' } },
    { key: 'computer_science', icon: 'ti-code', label: { id: 'Ilmu Komputer', en: 'Computer Science' } },
    { key: 'astronomy', icon: 'ti-telescope', label: { id: 'Astronomi', en: 'Astronomy' } },
    { key: 'earth_science', icon: 'ti-world', label: { id: 'Ilmu Bumi', en: 'Earth Science' } },
    { key: 'economics', icon: 'ti-chart-line', label: { id: 'Ekonomi', en: 'Economics' } },
  ],
  engineering: [
    { key: 'civil_engineering', icon: 'ti-building-bridge-2', label: { id: 'Teknik Sipil', en: 'Civil Engineering' } },
    { key: 'mechanical_engineering', icon: 'ti-settings', label: { id: 'Teknik Mesin', en: 'Mechanical Engineering' } },
    { key: 'electrical_engineering', icon: 'ti-bolt', label: { id: 'Teknik Elektro', en: 'Electrical Engineering' } },
    { key: 'software_engineering', icon: 'ti-code', label: { id: 'Teknik Perangkat Lunak', en: 'Software Engineering' } },
    { key: 'industrial_engineering', icon: 'ti-building-factory-2', label: { id: 'Teknik Industri', en: 'Industrial Engineering' } },
    { key: 'aerospace_engineering', icon: 'ti-rocket', label: { id: 'Teknik Kedirgantaraan', en: 'Aerospace Engineering' } },
    { key: 'automotive_engineering', icon: 'ti-car', label: { id: 'Teknik Otomotif', en: 'Automotive Engineering' } },
    { key: 'environmental_engineering', icon: 'ti-leaf', label: { id: 'Teknik Lingkungan', en: 'Environmental Engineering' } },
  ],
  sports: [
    { key: 'football', icon: 'ti-ball-football', label: { id: 'Sepak Bola', en: 'Football' } },
    { key: 'basketball', icon: 'ti-ball-basketball', label: { id: 'Basket', en: 'Basketball' } },
    { key: 'badminton', icon: 'ti-ball-badminton', label: { id: 'Bulu Tangkis', en: 'Badminton' } },
    { key: 'olympics_history', icon: 'ti-medal', label: { id: 'Olimpiade & Sejarah Olahraga', en: 'Olympics & Sports History' } },
    { key: 'tennis', icon: 'ti-ball-tennis', label: { id: 'Tenis', en: 'Tennis' } },
    { key: 'esports', icon: 'ti-device-gamepad-2', label: { id: 'E-Sports', en: 'Esports' } },
    { key: 'motorsport', icon: 'ti-steering-wheel', label: { id: 'Formula 1 / Balap', en: 'Motorsport' } },
    { key: 'general_sports', icon: 'ti-run', label: { id: 'Olahraga Umum', en: 'General Sports' } },
  ],
};

const TOPIC_ENTRIES: readonly TopicEntry[] = [
  { kind: 'standalone', key: 'financial', icon: 'ti-currency-dollar', label: { id: 'Keuangan', en: 'Financial' } },
  { kind: 'standalone', key: 'cryptography', icon: 'ti-lock', label: { id: 'Kriptografi', en: 'Cryptography' } },
  { kind: 'standalone', key: 'psychology', icon: 'ti-brain', label: { id: 'Psikologi', en: 'Psychology' } },
  { kind: 'standalone', key: 'physics', icon: 'ti-atom-2', label: { id: 'Fisika', en: 'Physics' } },
  { kind: 'standalone', key: 'linguistics', icon: 'ti-language', label: { id: 'Linguistik', en: 'Linguistics' } },
  { kind: 'standalone', key: 'book-trivia', icon: 'ti-book', label: { id: 'Trivia Buku', en: 'Book Trivia' } },
  { kind: 'standalone', key: 'curiosities', icon: 'ti-bulb', label: { id: 'Rasa Ingin Tahu', en: 'Curiosities' } },
  { kind: 'standalone', key: 'mathematics', icon: 'ti-math-function', label: { id: 'Matematika', en: 'Mathematics' } },
  {
    kind: 'category',
    key: 'science',
    icon: 'ti-atom',
    label: { id: 'Science', en: 'Science' },
    childCount: CATEGORY_CHILDREN.science.length,
  },
  {
    kind: 'category',
    key: 'engineering',
    icon: 'ti-tool',
    label: { id: 'Engineering', en: 'Engineering' },
    childCount: CATEGORY_CHILDREN.engineering.length,
  },
  {
    kind: 'category',
    key: 'sports',
    icon: 'ti-trophy',
    label: { id: 'Olahraga', en: 'Sports' },
    childCount: CATEGORY_CHILDREN.sports.length,
  },
];

type TopicCountMap = Readonly<Record<string, number>>;

function getAllLeafKeys(): string[] {
  const standaloneKeys = TOPIC_ENTRIES.filter(
    (entry): entry is StandaloneTopic => entry.kind === 'standalone',
  ).map((entry) => entry.key);

  const categoryChildKeys = Object.values(CATEGORY_CHILDREN).flatMap((children) =>
    children.map((child) => child.key),
  );

  return [...standaloneKeys, ...categoryChildKeys];
}

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

      const leafKeys = getAllLeafKeys();
      const counts: Record<string, number> = {};

      await Promise.all(
        leafKeys.map(async (key) => {
          const { count } = await supabase
            .from('questions')
            .select('id', { count: 'exact', head: true })
            .eq('sector', key);
          counts[key] = count ?? 0;
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
  const subTopicsLabel = language === 'id' ? 'sub-topik' : 'sub-topics';

  return (
    <main className="min-h-screen bg-base-bg px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-xl font-semibold text-text-primary mb-6">{heading}</h1>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {TOPIC_ENTRIES.map((topic) => {
            const href =
              topic.kind === 'standalone' ? `/quiz/${topic.key}` : `/topics/${topic.key}`;
            const countLabel =
              topic.kind === 'standalone'
                ? isLoadingCounts
                  ? '...'
                  : topicCounts[topic.key] ?? 0
                : `${topic.childCount} ${subTopicsLabel}`;

            return (
              <Link
                key={topic.key}
                href={href}
                className="flex flex-col items-start gap-3 rounded-floating bg-base-surface shadow-floating-sm p-5 transition active:scale-95 hover:shadow-floating"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <i className={`ti ${topic.icon} text-lg`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    {topic.label[language]}
                  </p>
                  <p className="mt-0.5 text-[11px] text-text-muted">{countLabel}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
