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
    description: {
      id: 'Studi kasus valuasi, manajemen risiko, dan strategi investasi.',
      en: 'Case studies on valuation, risk management, and investment strategy.',
    },
    accent: 'emerald',
  },
  {
    key: 'cryptography',
    label: { id: 'Kriptografi', en: 'Cryptography' },
    description: {
      id: 'Analisis algoritma enkripsi dan protokol keamanan data.',
      en: 'Analysis of encryption algorithms and data security protocols.',
    },
    accent: 'rose',
  },
  {
    key: 'psychology',
    label: { id: 'Psikologi', en: 'Psychology' },
    description: {
      id: 'Interpretasi perilaku, bias kognitif, dan dinamika mental.',
      en: 'Interpretation of behavior, cognitive bias, and mental dynamics.',
    },
    accent: 'emerald',
  },
  {
    key: 'physics',
    label: { id: 'Fisika', en: 'Physics' },
    description: {
      id: 'Pemecahan masalah mekanika, termodinamika, dan gelombang.',
      en: 'Problem-solving in mechanics, thermodynamics, and wave physics.',
    },
    accent: 'rose',
  },
  {
    key: 'science',
    label: { id: 'Sains Umum', en: 'General Science' },
    description: {
      id: 'Penalaran ilmiah lintas disiplin biologi dan kimia.',
      en: 'Cross-disciplinary scientific reasoning across biology and chemistry.',
    },
    accent: 'emerald',
  },
  {
    key: 'linguistics',
    label: { id: 'Linguistik', en: 'Linguistics' },
    description: {
      id: 'Analisis struktur bahasa, semantik, dan wacana.',
      en: 'Analysis of language structure, semantics, and discourse.',
    },
    accent: 'rose',
  },
{
  key: 'book-trivia',
  label: { id: 'Trivia Buku', en: 'Book Trivia' },
  description: {
    id: 'Tebak topik dari buku-buku yang berpengaruh dan menggugah rasa penasaran.',
    en: 'Guess the topic from influential books and spark your curiosity.',
  },
  accent: 'emerald',
},
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
      const { data: { user } } = await supabase.auth.getUser();

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
    return () => { isMounted = false; };
  }, [router]);

  const heading = language === 'id' ? 'Semua Topik' : 'All Topics';
  const questionCountLabel = (count: number): string =>
    language === 'id' ? `${count} soal tersedia` : `${count} questions available`;
  const startLabel = language === 'id' ? 'Mulai' : 'Start';

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 font-sans text-slate-800 sm:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-slate-400 hover:text-slate-600">←</Link>
          <h1 className="text-lg font-semibold text-slate-800">{heading}</h1>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TOPIC_META.map((topic) => {
            const isEmerald = topic.accent === 'emerald';
            const count = topicCounts[topic.key] ?? 0;

            return (
              <Link
                key={topic.key}
                href={`/quiz/${topic.key}`}
                className={`group flex flex-col justify-between rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                  isEmerald ? 'border-emerald-100 hover:border-emerald-300' : 'border-rose-100 hover:border-rose-300'
                }`}
              >
                <div>
                  <h3 className="text-base font-semibold text-slate-900">{topic.label[language]}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{topic.description[language]}</p>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <span className="font-mono text-xs text-slate-400">
                    {isLoadingCounts ? '···' : questionCountLabel(count)}
                  </span>
                  <span className={`font-mono text-sm font-medium ${isEmerald ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {startLabel} →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
