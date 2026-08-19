'use client';

import { useRouter } from 'next/navigation';
import { useLanguage } from '../../../../context/LanguageContext';

const LANGUAGES = [
  // Bahasa Indonesia & daerah
  { key: 'indonesian', label: { id: 'Indonesia', en: 'Indonesian' } },
  { key: 'javanese', label: { id: 'Jawa', en: 'Javanese' } },
  { key: 'sundanese', label: { id: 'Sunda', en: 'Sundanese' } },
  { key: 'minangkabau', label: { id: 'Minangkabau', en: 'Minangkabau' } },
  { key: 'balinese', label: { id: 'Bali', en: 'Balinese' } },
  { key: 'batak', label: { id: 'Batak', en: 'Batak' } },
  { key: 'buginese', label: { id: 'Bugis', en: 'Buginese' } },
  { key: 'malay', label: { id: 'Melayu', en: 'Malay' } },

  // Bahasa internasional utama
  { key: 'english', label: { id: 'Inggris', en: 'English' } },
  { key: 'spanish', label: { id: 'Spanyol', en: 'Spanish' } },
  { key: 'french', label: { id: 'Prancis', en: 'French' } },
  { key: 'german', label: { id: 'Jerman', en: 'German' } },
  { key: 'italian', label: { id: 'Italia', en: 'Italian' } },
  { key: 'portuguese', label: { id: 'Portugis', en: 'Portuguese' } },
  { key: 'dutch', label: { id: 'Belanda', en: 'Dutch' } },
  { key: 'russian', label: { id: 'Rusia', en: 'Russian' } },

  // Bahasa Asia
  { key: 'mandarin', label: { id: 'Mandarin', en: 'Mandarin' } },
  { key: 'japanese', label: { id: 'Jepang', en: 'Japanese' } },
  { key: 'korean', label: { id: 'Korea', en: 'Korean' } },
  { key: 'thai', label: { id: 'Thailand', en: 'Thai' } },
  { key: 'vietnamese', label: { id: 'Vietnam', en: 'Vietnamese' } },
  { key: 'hindi', label: { id: 'Hindi', en: 'Hindi' } },
  { key: 'arabic', label: { id: 'Arab', en: 'Arabic' } },
] as const;

export default function TranslationLanguageSelectPage(): JSX.Element {
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
              onClick={() => router.push(`/quiz/translation/${lang.key}`)}
              className="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-2 py-4 text-center text-sm font-medium text-slate-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-900"
            >
              {lang.label[language]}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
