'use client';

import { useRouter, useParams } from 'next/navigation';
import { useLanguage } from '../../../context/LanguageContext';

const MODES = [
  { key: 'foundational', label: { id: 'Mudah', en: 'Easy' } },
  { key: 'intermediate', label: { id: 'Menengah', en: 'Medium' } },
  { key: 'advanced', label: { id: 'Susah', en: 'Hard' } },
] as const;

export default function ModeSelectPage(): JSX.Element {
  const router = useRouter();
  const params = useParams<{ sector: string }>();
  const { language } = useLanguage();

  const heading = language === 'id' ? 'Pilih mode' : 'Choose mode';
  const back = language === 'id' ? '← Kembali' : '← Back';

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 sm:px-10">
      <div className="mx-auto flex max-w-md flex-col gap-6">
        <button
          type="button"
          onClick={() => router.push('/topics')}
          className="self-start font-mono text-sm text-slate-400 transition hover:text-slate-600"
        >
          {back}
        </button>

        <h1 className="text-lg font-semibold text-slate-800">{heading}</h1>

        <div className="flex flex-col gap-3">
          {MODES.map((mode) => (
            <button
              key={mode.key}
              type="button"
              onClick={() => router.push(`/quiz/${params.sector}/${mode.key}`)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-4 text-left text-sm font-medium text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-600"
            >
              {mode.label[language]}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
