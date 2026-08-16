'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseBrowserClient } from '../../../lib/supabase/client';
import { useLanguage } from '../../../context/LanguageContext';
import { TOPIC_CATEGORY_CHILDREN } from '../../../lib/topicCategories';

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
    childCount: TOPIC_CATEGORY_CHILDREN.science.length,
  },
  {
    kind: 'category',
    key: 'engineering',
    icon: 'ti-tool',
    label: { id: 'Engineering', en: 'Engineering' },
    childCount: TOPIC_CATEGORY_CHILDREN.engineering.length,
  },
  {
    kind: 'category',
    key: 'sports',
    icon: 'ti-trophy',
    label: { id: 'Olahraga', en: 'Sports' },
    childCount: TOPIC_CATEGORY_CHILDREN.sports.length,
  },
];

type TopicCountMap = Readonly<Record<string, number>>;

function getAllLeafKeys(): string[] {
  const standaloneKeys = TOPIC_ENTRIES.filter(
    (entry): entry is StandaloneTopic => entry.kind === 'standalone',
  ).map((entry) => entry.key);

  const categoryChildKeys = Object.values(TOPIC_CATEGORY_CHILDREN).flatMap((children) =>
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
  const schoolLabel = language === 'id' ? 'Sekolah' : 'School';
  const schoolSubtitle = language === 'id' ? 'SD • SMP • SMA/SMK' : 'Elementary • Junior • Senior High';

  return (
    <main className="min-h-screen bg-base-bg px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-xl font-semibold text-text-primary mb-6">{heading}</h1>

        {/* Card khusus Sekolah — dipisah visual dari grid topik biasa, warna netral bukan accent */}
        <Link
          href="/school"
          className="mb-6 flex items-center gap-4 rounded-floating bg-slate-800 p-5 text-white shadow-floating-sm transition active:scale-[0.98] hover:shadow-floating"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
            <i className="ti ti-school text-2xl" />
          </div>
          <div>
            <p className="text-sm font-semibold">{schoolLabel}</p>
            <p className="mt-0.5 text-[11px] text-white/70">{schoolSubtitle}</p>
          </div>
        </Link>

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
