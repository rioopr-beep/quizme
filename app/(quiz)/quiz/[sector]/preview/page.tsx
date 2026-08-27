'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { getSupabaseBrowserClient } from '../../../../../lib/supabase/client';
import { useLanguage } from '../../../../../context/LanguageContext';
import { useQuizEngine } from '../../../../../hooks/useQuizEngine';
import { mapQuestionRowToQuestionData } from '../../../../../types/question';
import type {
  OptionKey,
  OptionVisualState,
  QuestionData,
  QuestionRow,
  SectorType,
} from '../../../../../types/question';

const VALID_SECTORS: readonly SectorType[] = [
  'financial', 'cryptography', 'psychology', 'physics', 'linguistics',
  'translation', 'book-trivia', 'curiosities', 'mathematics', 'chemistry',
  'biology', 'computer_science', 'astronomy', 'earth_science', 'economics',
  'civil_engineering', 'mechanical_engineering', 'electrical_engineering',
  'software_engineering', 'industrial_engineering', 'aerospace_engineering',
  'automotive_engineering', 'environmental_engineering', 'football',
  'basketball', 'badminton', 'olympics_history', 'tennis', 'esports',
  'motorsport', 'general_sports',
];

const OPTION_ORDER: readonly OptionKey[] = ['A', 'B', 'C', 'D'];

const OPTION_VISUAL_CLASS_MAP: Record<OptionVisualState, string> = {
  default: 'border-base-border bg-base-surface text-text-secondary hover:border-accent/40',
  correct: 'border-status-correct bg-status-correctSoft text-status-correct',
  incorrect: 'border-status-incorrect bg-status-incorrectSoft text-status-incorrect',
  muted: 'border-base-border bg-base-bg text-text-muted',
};

function isValidSector(value: string): value is SectorType {
  return (VALID_SECTORS as readonly string[]).includes(value);
}

function shuffleArray<T>(array: readonly T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function remapLettersInString(text: string, oldToNewKey: Record<OptionKey, OptionKey>): string {
  if (!text) return text;
  return text.replace(
    /\b(opsi|option|jawaban|answer)([^A-Za-z]{0,3})([A-D])\b/gi,
    (_match, label: string, sep: string, letter: string) => {
      const oldKey = letter.toUpperCase() as OptionKey;
      const newKey = oldToNewKey[oldKey] ?? oldKey;
      return `${label}${sep}${newKey}`;
    },
  );
}

function remapOptionLettersInText(
  text: string | string[],
  oldToNewKey: Record<OptionKey, OptionKey>,
): string | string[] {
  if (Array.isArray(text)) {
    return text.map((part) => remapLettersInString(part, oldToNewKey));
  }
  return remapLettersInString(text, oldToNewKey);
}

function shuffleQuestionOptions(question: QuestionData): QuestionData {
  const keys: OptionKey[] = ['A', 'B', 'C', 'D'];
  const shuffledKeys = shuffleArray(keys);

  const newOptionsId: Record<OptionKey, string> = {} as Record<OptionKey, string>;
  const newOptionsEn: Record<OptionKey, string> = {} as Record<OptionKey, string>;
  let newCorrectOption: OptionKey = question.correctOption;
  const oldToNewKey: Record<OptionKey, OptionKey> = {} as Record<OptionKey, OptionKey>;

  keys.forEach((newKey, index) => {
    const originalKey = shuffledKeys[index];
    newOptionsId[newKey] = question.options.id[originalKey];
    newOptionsEn[newKey] = question.options.en[originalKey];
    oldToNewKey[originalKey] = newKey;
    if (originalKey === question.correctOption) newCorrectOption = newKey;
  });

  return {
    ...question,
    options: { id: newOptionsId, en: newOptionsEn },
    correctOption: newCorrectOption,
    dossier: {
      ...question.dossier,
      summary: {
        id: remapLettersInString(question.dossier.summary.id, oldToNewKey),
        en: remapLettersInString(question.dossier.summary.en, oldToNewKey),
      },
      reasoning: {
        id: remapOptionLettersInText(question.dossier.reasoning.id, oldToNewKey),
        en: remapOptionLettersInText(question.dossier.reasoning.en, oldToNewKey),
      },
    },
  };
}

function splitReasoningSteps(text: string | string[]): string[] {
  if (Array.isArray(text)) {
    return text.map((part) => part.trim()).filter((part) => part.length > 0);
  }
  return text
    .split(/(?=(?:Step|Langkah)\s*\d+\s*:)/gi)
    .map((part) => part.replace(/^\.\s*/, '').replace(/\.\s*$/, '').trim())
    .filter((part) => part.length > 0);
}

export default function PreviewQuizPage(): JSX.Element {
  const rawParams = useParams();
  const router = useRouter();
  const { language } = useLanguage();

  const sectorParam = typeof rawParams?.sector === 'string' ? rawParams.sector.toLowerCase() : '';
  const sector: SectorType | null = isValidSector(sectorParam) ? sectorParam : null;

  const [questions, setQuestions] = useState<readonly QuestionData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isReasoningExpanded, setIsReasoningExpanded] = useState<boolean>(false);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState<boolean>(false);

  useEffect(() => {
    if (!sector) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function loadPreviewQuestions(activeSector: SectorType): Promise<void> {
      const supabase = getSupabaseBrowserClient();

      const { data, error } = await supabase.rpc('get_preview_questions', {
        p_sector: activeSector,
      });

      if (!isMounted) return;

      if (error || !data || data.length === 0) {
        setLoadError(
          language === 'id'
            ? 'Belum ada contoh soal untuk topik ini.'
            : 'No sample questions available for this topic yet.',
        );
        setIsLoading(false);
        return;
      }

      const mapped = (data as QuestionRow[]).map(mapQuestionRowToQuestionData);
      const withShuffledOptions = mapped.map(shuffleQuestionOptions);
      setQuestions(withShuffledOptions);
      setIsLoading(false);
    }

    void loadPreviewQuestions(sector);

    return () => {
      isMounted = false;
    };
  }, [sector, language]);

  const engine = useQuizEngine(sector ?? 'financial', questions);

  useEffect(() => {
    setIsReasoningExpanded(false);
    setIsSummaryExpanded(false);
  }, [engine.currentQuestion?.id]);

  const copy = useMemo(
    () => ({
      back: language === 'id' ? '← Kembali' : '← Back',
      progress: (current: number, total: number): string =>
        language === 'id' ? `Contoh Soal ${current} dari ${total}` : `Sample ${current} of ${total}`,
      dossierHeading: language === 'id' ? 'Dossier Pembahasan' : 'Discussion Dossier',
      reasoningHeading: language === 'id' ? 'Penalaran' : 'Reasoning',
      referencesHeading: language === 'id' ? 'Referensi' : 'References',
      showReasoning: language === 'id' ? 'Lihat detail perhitungan' : 'Show calculation details',
      hideReasoning: language === 'id' ? 'Sembunyikan detail' : 'Hide details',
      showSummary: language === 'id' ? 'Baca selengkapnya' : 'Read more',
      hideSummary: language === 'id' ? 'Ringkas' : 'Show less',
      next: language === 'id' ? 'Soal Berikutnya' : 'Next Question',
      loading: language === 'id' ? 'Memuat contoh soal…' : 'Loading sample questions…',
      invalidSector: language === 'id' ? 'Topik tidak dikenal.' : 'Unknown topic.',
      ctaTitle: language === 'id' ? 'Itu baru contoh kecilnya' : 'That was just a preview',
      ctaBody:
        language === 'id'
          ? 'Login untuk akses ribuan studi kasus lainnya di semua topik, simpan progres, dan ikut leaderboard.'
          : 'Log in to access thousands more case studies across every topic, save your progress, and join the leaderboard.',
      ctaButton: language === 'id' ? 'Masuk / Daftar Gratis' : 'Log In / Sign Up Free',
      backToTopics: language === 'id' ? 'Lihat Topik Lain' : 'Browse Other Topics',
    }),
    [language],
  );

  if (!sector) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-base-bg px-6 text-center">
        <p className="text-sm text-status-incorrect">{copy.invalidSector}</p>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-base-bg px-6 text-center">
        <p className="text-sm text-text-muted">{copy.loading}</p>
      </main>
    );
  }

  if (loadError || questions.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-base-bg px-6 text-center">
        <p className="text-sm text-text-muted">{loadError}</p>
        <button
          type="button"
          onClick={() => router.push('/topics')}
          className="rounded-floating bg-base-surface px-4 py-2 text-sm font-medium text-text-secondary shadow-floating-sm transition active:scale-95 hover:text-accent"
        >
          {copy.backToTopics}
        </button>
      </main>
    );
  }

  // Setelah 3 soal preview selesai dijawab & di-reveal semua -> CTA login
  if (engine.state.status === 'completed') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-base-bg px-6">
        <div className="w-full max-w-md rounded-floating bg-base-surface/80 backdrop-blur-sm shadow-floating p-8 text-center">
          <h1 className="text-xl font-semibold text-text-primary">{copy.ctaTitle}</h1>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">{copy.ctaBody}</p>
          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="w-full rounded-floating bg-accent px-4 py-3 text-sm font-medium text-base-surface shadow-floating-sm transition active:scale-95 hover:opacity-90"
            >
              {copy.ctaButton}
            </button>
            <button
              type="button"
              onClick={() => router.push('/topics')}
              className="w-full rounded-floating bg-base-bg px-4 py-3 text-sm font-medium text-text-secondary transition active:scale-95 hover:bg-base-border"
            >
              {copy.backToTopics}
            </button>
          </div>
        </div>
      </main>
    );
  }

  const question = engine.currentQuestion;

  if (!question) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-base-bg px-6 text-center">
        <p className="text-sm text-status-incorrect">{copy.invalidSector}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-base-bg px-6 py-10 sm:px-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <header className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push('/topics')}
            className="text-sm text-text-muted transition active:scale-95 hover:text-text-secondary"
          >
            {copy.back}
          </button>
          <span className="text-xs text-text-muted">
            {copy.progress(engine.progress.current, engine.progress.total)}
          </span>
        </header>

        <section className="relative rounded-floating bg-base-surface/80 backdrop-blur-sm shadow-floating p-8">
          {question.context ? (
            <div className="mb-4 rounded-floating bg-base-bg p-4 text-sm leading-relaxed text-text-secondary [&_p]:m-0">
              <ReactMarkdown>{question.context[language]}</ReactMarkdown>
            </div>
          ) : null}

          <h1 className="text-lg font-semibold leading-relaxed text-text-primary">
            {question.prompt[language]}
          </h1>

          <div className="mt-6 flex flex-col gap-3">
            {OPTION_ORDER.map((optionKey) => {
              const visualState = engine.getOptionVisualState(optionKey);
              const isLocked = engine.isOptionLocked(optionKey);

              return (
                <button
                  key={optionKey}
                  type="button"
                  disabled={isLocked || engine.state.isRevealed}
                  onClick={() => engine.selectOption(optionKey)}
                  className={`flex items-start gap-3 rounded-floating border px-4 py-3.5 text-left text-sm transition active:scale-[0.98] disabled:active:scale-100 disabled:cursor-not-allowed ${OPTION_VISUAL_CLASS_MAP[visualState]}`}
                >
                  <span className="text-xs font-semibold">{optionKey}</span>
                  <span className="font-medium leading-relaxed">{question.options[language][optionKey]}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section
          className={`overflow-hidden rounded-floating bg-base-surface/80 backdrop-blur-sm shadow-floating p-8 ${
            engine.state.isRevealed ? '' : 'hidden'
          }`}
        >
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
            {copy.dossierHeading}
          </h2>
          <div
            className={`mt-3 text-sm leading-relaxed text-text-primary [&_p]:m-0 ${
              isSummaryExpanded ? '' : 'line-clamp-2'
            }`}
          >
            <ReactMarkdown>{question.dossier.summary[language]}</ReactMarkdown>
          </div>
          <button
            type="button"
            onClick={() => setIsSummaryExpanded((prev) => !prev)}
            className="mt-1 text-xs font-medium text-accent underline decoration-accent-soft underline-offset-2"
          >
            {isSummaryExpanded ? copy.hideSummary : copy.showSummary}
          </button>

          <div className="mt-6 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              {copy.reasoningHeading}
            </h3>
            <button
              type="button"
              onClick={() => setIsReasoningExpanded((prev) => !prev)}
              className="text-xs font-medium text-accent underline decoration-accent-soft underline-offset-2"
            >
              {isReasoningExpanded ? copy.hideReasoning : copy.showReasoning}
            </button>
          </div>
          <div className={`mt-2 flex flex-col gap-4 ${isReasoningExpanded ? '' : 'hidden'}`}>
            {splitReasoningSteps(question.dossier.reasoning[language]).map((step, index) => (
              <div key={index} className="overflow-x-auto">
                <div className="text-sm leading-relaxed text-text-secondary [&_p]:m-0">
                  <ReactMarkdown>{step}</ReactMarkdown>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={engine.goToNextQuestion}
            className="mt-8 w-full rounded-floating bg-accent px-4 py-3 text-sm font-medium text-base-surface shadow-floating-sm transition active:scale-95 hover:opacity-90"
          >
            {copy.next}
          </button>
        </section>
      </div>
    </main>
  );
                             }
