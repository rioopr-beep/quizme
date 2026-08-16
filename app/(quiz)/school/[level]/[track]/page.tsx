'use client';

import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '../../../../../context/LanguageContext';
import { SMA_WAJIB_SUBJECTS, SMA_TRACK_SUBJECTS, type SmaTrack } from '../../../../../types/schoolPool';

export default function SmaTrackSubjectsPage(): JSX.Element {
  const router = useRouter();
  const params = useParams();
  const { language } = useLanguage();
  const track = (typeof params?.track === 'string' ? params.track : '') as SmaTrack;

  const trackSubjects = SMA_TRACK_SUBJECTS[track] ?? [];
  const allSubjects = [...SMA_WAJIB_SUBJECTS, ...trackSubjects];

  const heading = language === 'id' ? 'Pilih Mapel' : 'Choose Subject';
  const changeTrackLabel = language === 'id' ? '← Ganti Jurusan' : '← Change Track';

  return (
    <main className="min-h-screen bg-base-bg px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() => router.push('/school/sma_smk')}
          className="mb-4 text-sm text-text-muted transition active:scale-95 hover:text-text-secondary"
        >
          {changeTrackLabel}
        </button>

        <h1 className="text-xl font-semibold text-text-primary mb-6">{heading}</h1>

        <div className="grid grid-cols-3 gap-3">
          {allSubjects.map((subject) => (
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
