'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseBrowserClient } from '../../../lib/supabase/client';
import { useLanguage } from '../../../context/LanguageContext';

interface TopicMeta {
  key: string;
  icon: string;
  accentClass: string;
  bgClass: string;
  label: { id: string; en: string };
  description: { id: string; en: string };
}

const TOPIC_META: readonly TopicMeta[] = [
  {
    key: 'financial',
    icon: 'ti-currency-dollar',
    accentClass: 'text-indigo-900',
    bgClass: 'bg-indigo-50',
    label: { id: 'Keuangan', en: 'Financial' },
    description: {
      id: 'Studi kasus valuasi, manajemen risiko, dan strategi investasi.',
      en: 'Case studies on valuation, risk management, and investment strategy.',
    },
  },
  {
    key: 'cryptography',
    icon: 'ti-lock',
    accentClass: 'text-slate-800',
    bgClass: 'bg-slate-100',
    label: { id: 'Kriptografi', en: 'Cryptography' },
    description: {
      id: 'Analisis algoritma enkripsi dan protokol keamanan data.',
      en: 'Analysis of encryption algorithms and data security protocols.',
    },
  },
  {
    key: 'psychology',
    icon: 'ti-brain',
    accentClass: 'text-blue-900',
    bgClass: 'bg-blue-50',
    label: { id: 'Psikologi', en: 'Psychology' },
    description: {
      id: 'Interpretasi perilaku, bias kognitif, dan dinamika mental.',
      en: 'Interpretation of behavior, cognitive bias, and mental dynamics.',
    },
  },
  {
    key: 'physics',
    icon: 'ti-atom-2',
    accentClass: 'text-indigo-800',
    bgClass: 'bg-indigo-50',
    label: { id: 'Fisika', en: 'Physics' },
    description: {
      id: 'Pemecahan masalah mekanika, termodinamika, dan gelombang.',
      en: 'Problem-solving in mechanics, thermodynamics, and wave physics.',
    },
  },
  {
    key: 'science',
    icon: 'ti-flask',
    accentClass: 'text-slate-700',
    bgClass: 'bg-slate-100',
    label: { id: 'Sains Umum', en: 'General Science' },
    description: {
      id: 'Penalaran ilmiah lintas disiplin biologi dan kimia.',
      en: 'Cross-disciplinary scientific reasoning across biology and chemistry.',
    },
  },
  {
    key: 'linguistics',
    icon: 'ti-language',
    accentClass: 'text-blue-800',
    bgClass: 'bg-blue-50',
    label: { id: 'Linguistik', en: 'Linguistics' },
    description: {
      id: 'Analisis struktur bahasa, semantik, dan wacana.',
      en: 'Analysis of language structure, semantics, and discourse.',
    },
  },
  {
    key: 'book-trivia',
    icon: 'ti-book',
    accentClass: 'text-indigo-700',
    bgClass: 'bg-indigo-50',
    label: { id: 'Trivia Buku', en: 'Book Trivia' },
    description: {
      id: 'Tebak topik dari buku-buku yang berpengaruh dan menggugah rasa penasaran.',
      en: 'Guess the topic from influential books and spark your curiosity.',
    },
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

  const heading = language === 'id' ? 'Semua Topik' : 'All Topics';
  const questionCountLabel = (count: number): string =>
    language === 'id' ? `${count} soal tersedia` :
