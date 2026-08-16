'use client';

import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '../../../../context/LanguageContext';
import { SD_SUBJECTS, SMP_SUBJECTS, SMA_TRACKS, type SchoolLevel } from '../../../../types/schoolPool';

export default function SchoolLevelDetailPage(): JSX.Element {
  const router = useRouter();
  const params = useParams();
  const { language } = useLanguage();
  const level = (typeof params?.level === 'string' ? params.level : '') as SchoolLevel;

  if (level === 'sma_smk') {
    const heading = language === 'id' ? 'Pilih Jurusan' : 'Choose Track';

    return (
      <main className="min-h-screen bg-base-bg px-6 py-10 sm:px-10">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-xl font-semibold text-text-primary mb-6">{heading}</h1>
          <div className="grid grid-cols-3 gap-3">
            {SMA_TRACKS.map((track) => (
              <button
                key={track.key}
                type="button"
                onClick={() => router.push(`/school/sma_smk/${track.key}`)}
                className="flex flex-col items-center justify-center gap-2 rounded-floating bg-base-surface shadow-floating-sm p-6 text-center transition active:scale-95 hover:shadow-floating"
              >
                <span className="text-sm font-semibold text-text-primary">
                  {language === 'id' ? track.label_id : track.label_en}
                </span>
              </button>
            ))}
          </div>
        </div>
      </main>
    );
  }

  const subjects = level === 'sd' ? SD_SUBJECTS : SMP_SUBJECTS;
  const heading = language === 'id' ? 'Pilih Mapel' : 'Choose Subject';

  return (
    <main className="min-h-screen bg-base-bg px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-xl font-semibold text-text-primary mb-6">{heading}</h1>
        <div className="grid grid-cols-3 gap-3">
          {subjects.map((subject) => (
            <button
              key={subject.key}
              type="button"
              onClick={() => router.push(`/school/quiz/${subject.key}`)}
              className="flex flex-col items-center justify-center gap-2 rounded-floating bg-base-surface shadow-floating-sm p-5 px-2 text-center transition active:scale-95 hover:shadow-floating"
            >
              <span className="text-xs font-semibold text-text-primary">
                {language === 'id' ? subject.label_id : subject.label_en}
              </span>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
