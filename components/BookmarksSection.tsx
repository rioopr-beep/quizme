'use client';

import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '../lib/supabase/client';
import { useLanguage } from '../context/LanguageContext';

interface BookmarkedQuestion {
  bookmarkId: string;
  questionId: string;
  sector: string;
  promptId: string;
  promptEn: string;
  contextId: string | null;
  contextEn: string | null;
  dossier: {
    summary: { id: string; en: string };
    reasoning: { id: string; en: string };
  } | null;
}

const SECTOR_LABEL: Record<string, { id: string; en: string }> = {
  financial: { id: 'Keuangan', en: 'Financial' },
  cryptography: { id: 'Kriptografi', en: 'Cryptography' },
  psychology: { id: 'Psikologi', en: 'Psychology' },
  physics: { id: 'Fisika', en: 'Physics' },
  linguistics: { id: 'Linguistik', en: 'Linguistics' },
  'book-trivia': { id: 'Trivia Buku', en: 'Book Trivia' },
  curiosities: { id: 'Rasa Ingin Tahu', en: 'Curiosities' },
  mathematics: { id: 'Matematika', en: 'Mathematics' },
  chemistry: { id: 'Kimia', en: 'Chemistry' },
  biology: { id: 'Biologi', en: 'Biology' },
  computer_science: { id: 'Ilmu Komputer', en: 'Computer Science' },
  astronomy: { id: 'Astronomi', en: 'Astronomy' },
  earth_science: { id: 'Ilmu Bumi', en: 'Earth Science' },
  economics: { id: 'Ekonomi', en: 'Economics' },
  civil_engineering: { id: 'Teknik Sipil', en: 'Civil Engineering' },
  mechanical_engineering: { id: 'Teknik Mesin', en: 'Mechanical Engineering' },
  electrical_engineering: { id: 'Teknik Elektro', en: 'Electrical Engineering' },
  software_engineering: { id: 'Teknik Perangkat Lunak', en: 'Software Engineering' },
  industrial_engineering: { id: 'Teknik Industri', en: 'Industrial Engineering' },
  aerospace_engineering: { id: 'Teknik Kedirgantaraan', en: 'Aerospace Engineering' },
  automotive_engineering: { id: 'Teknik Otomotif', en: 'Automotive Engineering' },
  environmental_engineering: { id: 'Teknik Lingkungan', en: 'Environmental Engineering' },
  football: { id: 'Sepak Bola', en: 'Football' },
  basketball: { id: 'Basket', en: 'Basketball' },
  badminton: { id: 'Bulu Tangkis', en: 'Badminton' },
  olympics_history: { id: 'Olimpiade & Sejarah Olahraga', en: 'Olympics & Sports History' },
  tennis: { id: 'Tenis', en: 'Tennis' },
  esports: { id: 'E-Sports', en: 'Esports' },
  motorsport: { id: 'Formula 1 / Balap', en: 'Motorsport' },
  general_sports: { id: 'Olahraga Umum', en: 'General Sports' },
};

export default function BookmarksSection(): JSX.Element {
  const { language } = useLanguage();
  const [items, setItems] = useState<readonly BookmarkedQuestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isRoomOpen, setIsRoomOpen] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function loadBookmarks(): Promise<void> {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (isMounted) setIsLoading(false);
        return;
      }

      const { data } = await supabase
        .from('bookmarks')
        .select(
          'id, question_id, questions(id, sector, prompt_id, prompt_en, context_id, context_en, dossier)',
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (isMounted) {
        const mapped: BookmarkedQuestion[] = (data ?? [])
          .filter((row: any) => row.questions)
          .map((row: any) => ({
            bookmarkId: row.id,
            questionId: row.questions.id,
            sector: row.questions.sector,
            promptId: row.questions.prompt_id,
            promptEn: row.questions.prompt_en,
            contextId: row.questions.context_id,
            contextEn: row.questions.context_en,
            dossier: row.questions.dossier,
          }));
        setItems(mapped);
        setIsLoading(false);
      }
    }

    void loadBookmarks();
    return () => {
      isMounted = false;
    };
  }, []);

  // Kunci scroll body saat room terbuka, biar nggak scroll ganda di belakang overlay
  useEffect(() => {
    if (isRoomOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isRoomOpen]);

  async function removeBookmark(bookmarkId: string): Promise<void> {
    const supabase = getSupabaseBrowserClient();
    await supabase.from('bookmarks').delete().eq('id', bookmarkId);
    setItems((previous) => previous.filter((item) => item.bookmarkId !== bookmarkId));
    if (expandedId === bookmarkId) setExpandedId(null);
  }

  const heading = language === 'id' ? 'Soal Tersimpan' : 'Bookmarked Questions';
  const emptyText =
    language === 'id' ? 'Belum ada soal yang disimpan.' : 'No bookmarked questions yet.';
  const removeLabel = language === 'id' ? 'Hapus' : 'Remove';
  const reasoningHeading = language === 'id' ? 'Penalaran' : 'Reasoning';
  const countLabel =
    language === 'id'
      ? `${items.length} soal disimpan`
      : `${items.length} saved question${items.length === 1 ? '' : 's'}`;

  if (isLoading) return <></>;

  const list = (
    <div className="flex flex-col gap-2">
      {items.map((item) => {
        const isExpanded = expandedId === item.bookmarkId;
        const sectorLabel = SECTOR_LABEL[item.sector]?.[language] ?? item.sector;
        const promptText = language === 'id' ? item.promptId : item.promptEn;
        const contextText = language === 'id' ? item.contextId : item.contextEn;

        return (
          <div key={item.bookmarkId} className="rounded-floating bg-base-bg">
            <button
              type="button"
              onClick={() => setExpandedId(isExpanded ? null : item.bookmarkId)}
              className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left"
            >
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-medium uppercase tracking-wide text-accent">
                  {sectorLabel}
                </span>
                <p className="mt-0.5 truncate text-sm text-text-secondary">{promptText}</p>
              </div>
              <i
                className={`ti ti-chevron-${isExpanded ? 'up' : 'down'} mt-1 shrink-0 text-sm text-text-muted`}
                aria-hidden="true"
              />
            </button>

            {isExpanded ? (
              <div className="border-t border-base-border px-4 py-3.5">
                {contextText ? (
                  <p className="mb-3 text-xs leading-relaxed text-text-muted">{contextText}</p>
                ) : null}
                <p className="text-sm leading-relaxed text-text-primary">{promptText}</p>

                {item.dossier ? (
                  <>
                    <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                      {item.dossier.summary[language]}
                    </p>
                    <h4 className="mt-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
                      {reasoningHeading}
                    </h4>
                    <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                      {item.dossier.reasoning[language]}
                    </p>
                  </>
                ) : null}

                <button
                  type="button"
                  onClick={() => void removeBookmark(item.bookmarkId)}
                  className="mt-4 text-xs font-medium text-status-incorrect transition active:scale-95 hover:opacity-80"
                >
                  {removeLabel}
                </button>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Card ringkasan di halaman Profile */}
      <button
        type="button"
        onClick={() => setIsRoomOpen(true)}
        disabled={items.length === 0}
        className="flex w-full items-center justify-between rounded-floating bg-base-surface shadow-floating-sm p-6 text-left transition active:scale-[0.99] disabled:active:scale-100"
      >
        <div>
          <p className="text-sm font-semibold text-text-primary">{heading}</p>
          <p className="mt-0.5 text-xs text-text-muted">
            {items.length === 0 ? emptyText : countLabel}
          </p>
        </div>
        {items.length > 0 ? (
          <i className="ti ti-chevron-right shrink-0 text-lg text-text-muted" aria-hidden="true" />
        ) : null}
      </button>

      {/* "Ruangan" fullscreen berisi semua bookmark */}
      {isRoomOpen ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-base-bg">
          <div className="flex shrink-0 items-center justify-between border-b border-base-border bg-base-surface px-6 py-4">
            <div>
              <p className="text-sm font-semibold text-text-primary">{heading}</p>
              <p className="text-xs text-text-muted">{countLabel}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsRoomOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-base-bg text-text-secondary transition active:scale-95"
              aria-label={language === 'id' ? 'Tutup' : 'Close'}
            >
              <i className="ti ti-x text-base" aria-hidden="true" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">{list}</div>
        </div>
      ) : null}
    </>
  );
      }
