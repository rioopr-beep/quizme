'use client';

import { useRouter } from 'next/navigation';
import { useLanguage } from '../../../../context/LanguageContext';

const LANGUAGES = [
  { key: 'indonesian', label: { id: 'Indonesia', en: 'Indonesian' } },
  { key: 'english', label: { id: 'Inggris', en: 'English' } },
  { key: 'javanese', label: { id: 'Jawa', en: 'Javanese' } },
  { key: 'sundanese', label: { id: 'Sunda', en: 'Sundanese' } },
  { key: 'spanish', label: { id: 'Spanyol', en: 'Spanish' } },
  { key: 'german', label: { id: 'Jerman', en: 'German' } },
] as const;

export default function LinguisticsLanguageSelectPage(): JSX.Element {
  const router = useRouter();
  const { language } = useLanguage();

  const heading = language === 'id' ? 'Pilih bahasa' : 'Choose language';
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

        <div className="grid grid-cols-3 gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.key}
              type="button"
              onClick={() => router.push(`/quiz/linguistics/${lang.key}`)}
              className="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-2 py-4 text-center text-sm font-medium text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-600"
            >
              {lang.label[language]}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
