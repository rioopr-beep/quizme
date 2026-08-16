'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { SCHOOL_LEVELS } from '../../../types/schoolPool';

export default function SchoolLevelPage(): JSX.Element {
  const router = useRouter();
  const { language } = useLanguage();

  const heading = language === 'id' ? 'Pilih Tingkat' : 'Choose Level';
  const backLabel = language === 'id' ? 'Kembali' : 'Back';

  return (
    <main className="min-h-screen bg-base-bg px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-1.5 text-sm font-medium text-text-secondary transition hover:text-text-primary active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </button>

        <h1 className="text-xl font-semibold text-text-primary mb-6">{heading}</h1>

        <div className="grid grid-cols-3 gap-3">
          {SCHOOL_LEVELS.map((level) => (
            <button
              key={level.key}
              type="button"
              onClick={() => router.push(`/school/${level.key}`)}
              className="flex flex-col items-center justify-center gap-2 rounded-floating bg-base-surface shadow-floating-sm p-6 text-center transition active:scale-95 hover:shadow-floating"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent">
                <i className="ti ti-school text-lg" />
              </div>
              <span className="text-sm font-semibold text-text-primary">
                {language === 'id' ? level.label_id : level.label_en}
              </span>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
