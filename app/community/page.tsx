'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { useQuizEngine } from '@/hooks/useQuizEngine';
import ExitConfirmModal from '@/components/ExitConfirmModal';
import DiscussionThread from '@/components/DiscussionThread';
import ReportQuestionButton from '@/components/ReportQuestionButton';
import type {
  OptionKey,
  OptionVisualState,
  QuestionData,
  SectorType,
} from '@/types/question';

const OPTION_ORDER: readonly OptionKey[] = ['A', 'B', 'C', 'D'];

const OPTION_VISUAL_CLASS_MAP: Record<OptionVisualState, string> = {
  default: 'border-base-border bg-base-surface text-text-secondary hover:border-accent/40',
  correct: 'border-status-correct bg-status-correctSoft text-status-correct',
  incorrect: 'border-status-incorrect bg-status-incorrectSoft text-status-incorrect',
  muted: 'border-base-border bg-base-bg text-text-muted',
};

interface CommunityQuestionRow {
  id: string;
  sector: string;
  difficulty: string;
  prompt_id: string;
  prompt_en: string;
  context_id: string | null;
  context_en: string | null;
  options_id: Record<OptionKey, string>;
  options_en: Record<OptionKey, string>;
  correct_option: OptionKey;
  dossier: {
    summary?: { id: string; en: string };
    reasoning?: { id: string; en: string };
    references?: unknown[];
  } | null;
  contributor_display_name: string;
}

interface CommunityQuestionData extends QuestionData {
  contributorName: string;
}

function mapRowToQuestionData(row: CommunityQuestionRow): CommunityQuestionData {
  return {
    id: row.id,
    prompt: { id: row.prompt_id, en: row.prompt_en },
    context:
      row.context_id || row.context_en
        ? { id: row.context_id ?? '', en: row.context_en ?? '' }
        : null,
    options: { id: row.options_id, en: row.options_en },
    correctOption: row.correct_option,
    dossier: {
      summary: row.dossier?.summary ?? { id: '', en: '' },
      reasoning: row.dossier?.reasoning ?? { id: '', en: '' },
      references: (row.dossier?.references as string[]) ?? [],
    },
    contributorName: row.contributor_display_name,
  } as CommunityQuestionData;
}

function shuffleArray<T>(array: readonly T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function remapOptionLettersInText(
  text: string,
  oldToNewKey: Record<OptionKey, OptionKey>,
): string {
  if (!text) return text;
  return text.replace(/\b(opsi|option)\s+([A-D])\b/gi, (_match, label: string, letter: string) => {
    const oldKey = letter.toUpperCase() as OptionKey;
    const newKey = oldToNewKey[oldKey] ?? oldKey;
    return `${label} ${newKey}`;
  });
}

function shuffleQuestionOptions<T extends QuestionData>(question: T): T {
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
    if (originalKey === question.correctOption) {
      newCorrectOption = newKey;
    }
  });

  return {
    ...question,
    options: { id: newOptionsId, en: newOptionsEn },
    correctOption: newCorrectOption,
    dossier: {
      ...question.dossier,
      reasoning: {
        id: remapOptionLettersInText(question.dossier.reasoning.id, oldToNewKey),
        en: remapOptionLettersInText(question.dossier.reasoning.en, oldToNewKey),
      },
    },
  };
}

function splitReasoningSteps(text: string): string[] {
  return text
    .split(/(?=(?:Step|Langkah)\s*\d+\s*:)/gi)
    .map((part) => part.replace(/^\.\s*/, '').replace(/\.\s*$/, '').trim())
    .filter((part) => part.length > 0);
}

function isUrlReference(reference: string): boolean {
  return /^https?:\/\//i.test(reference.trim());
}

export default function CommunityQuizPage(): JSX.Element {
  const router = useRouter();
  const { language } = useLanguage();

  const [questions, setQuestions] = useState<readonly CommunityQuestionData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
  const [isReasoningExpanded, setIsReasoningExpanded] = useState<boolean>(false);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function loadQuestions(): Promise<void> {
      try {
        const supabase = getSupabaseBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push('/login?redirect=/community');
          return;
        }

        const res = await fetch('/api/community-questions');
        const json = await res.json();

        if (!isMounted) return;

        if (!res.ok) {
          setLoadError(
            `Gagal memuat soal (${res.status}): ${json.error ?? 'unknown error'}`,
          );
          setIsLoading(false);
          return;
        }

        const mapped = (json.data as CommunityQuestionRow[]).map(mapRowToQuestionData);
        const shuffledOrder = shuffleArray(mapped);
        const withShuffledOptions = shuffledOrder.map(shuffleQuestionOptions);
        setQuestions(withShuffledOptions);
        setIsLoading(false);
      } catch (err: any) {
        if (isMounted) {
          setLoadError(`Error: ${err?.message ?? String(err)}`);
          setIsLoading(false);
        }
      }
    }

    void loadQuestions();
    return () => {
      isMounted = false;
    };
  }, [language, router]);

  const engine = useQuizEngine('community' as unknown as SectorType, questions);

  useEffect(() => {
    setIsReasoningExpanded(false);
    setIsSummaryExpanded(false);
  }, [engine.currentQuestion?.id]);

  const copy = useMemo(
    () => ({
      back: language === 'id' ? '← Kembali' : '← Back',
      progress: (current: number, total: number): string =>
        language === 'id' ? `Soal ${current} dari ${total}` : `Question ${current} of ${total}`,
      by: language === 'id' ? 'Dibuat oleh' : 'Created by',
      dossierHeading: language === 'id' ? 'Dossier Pembahasan' : 'Discussion Dossier',
      reasoningHeading: language === 'id' ? 'Penalaran' : 'Reasoning',
      referencesHeading: language === 'id' ? 'Referensi' : 'References',
      showReasoning: language === 'id' ? 'Lihat penalaran' : 'Show reasoning',
      hideReasoning: language === 'id' ? 'Sembunyikan detail' : 'Hide details',
      showSummary: language === 'id' ? 'Baca selengkapnya' : 'Read more',
      hideSummary: language === 'id' ? 'Ringkas' : 'Show less',
      next: language === 'id' ? 'Soal Berikutnya' : 'Next Question',
      finish: language === 'id' ? 'Selesai' : 'Finish',
      loading: language === 'id' ? 'Memuat soal…' : 'Loading questions…',
      empty:
        language === 'id'
          ? 'Belum ada soal komunitas yang tersedia saat ini.'
          : 'No community questions available right now.',
      completedTitle: language === 'id' ? 'Sesi Selesai' : 'Session Complete',
      accuracyLabel: language === 'id' ? 'Akurasi' : 'Accuracy',
      returnToTopics: language === 'id' ? 'Kembali ke Topik' : 'Back to Topics',
    }),
    [language],
  );

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-base-bg px-6 text-center">
        <p className="text-sm text-text-muted">{copy.loading}</p>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-base-bg px-6 text-center">
        <p className="text-sm text-status-incorrect">{loadError}</p>
      </main>
    );
  }

  if (questions.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-base-bg px-6 text-center">
        <p className="text-sm text-text-muted">{copy.empty}</p>
        <button
          type="button"
          onClick={() => router.replace('/topics')}
          className="rounded-floating bg-base-surface px-4 py-2 text-sm font-medium text-text-secondary shadow-floating-sm transition active:scale-95 hover:text-accent"
        >
          {copy.returnToTopics}
        </button>
      </main>
    );
  }

  if (engine.state.status === 'completed') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-base-bg px-6">
        <div className="w-full max-w-md rounded-floating bg-base-surface/80 backdrop-blur-sm shadow-floating p-8 text-center">
          <h1 className="text-xl font-semibold text-text-primary">{copy.completedTitle}</h1>
          <div className="mt-6 rounded-floating bg-base-bg p-4">
            <p className="text-xs uppercase tracking-wide text-text-muted">{copy.accuracyLabel}</p>
            <p className="mt-1 text-2xl font-semibold text-accent">{engine.accuracy}%</p>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => router.replace('/topics')}
              className="w-full rounded-floating bg-base-bg px-4 py-3 text-sm font-medium text-text-secondary transition active:scale-95 hover:bg-base-border"
            >
              {copy.returnToTopics}
            </button>
          </div>
        </div>
      </main>
    );
  }

  const question = engine.currentQuestion as CommunityQuestionData | null;

  if (!question) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-base-bg px-6 text-center">
        <p className="text-sm text-status-incorrect">{copy.empty}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-base-bg px-6 py-10 sm:px-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <header className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowExitConfirm(true)}
            className="text-sm text-text-muted transition active:scale-95 hover:text-text-secondary"
          >
            {copy.back}
          </button>

          <span className="text-xs text-text-muted">
            {copy.progress(engine.progress.current, engine.progress.total)}
          </span>
        </header>

        <section className="rounded-floating bg-base-surface/80 backdrop-blur-sm shadow-floating p-8">
          <p className="mb-3 text-[11px] font-medium text-accent">
            {copy.by} {question.contributorName}
          </p>

          {question.context ? (
            <p className="mb-4 rounded-floating bg-base-bg p-4 text-sm leading-relaxed text-text-secondary">
              {question.context[language]}
            </p>
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
                  <span className="leading-relaxed">{question.options[language][optionKey]}</span>
                </button>
              );
            })}
          </div>
        </section>

        {engine.state.isRevealed ? (
          <section className="overflow-hidden rounded-floating bg-base-surface/80 backdrop-blur-sm shadow-floating p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
                {copy.dossierHeading}
              </h2>
              <ReportQuestionButton questionId={question.id} />
            </div>

            <p
              className={`mt-3 text-sm leading-relaxed text-text-primary ${
                isSummaryExpanded ? '' : 'line-clamp-2'
              }`}
            >
              {question.dossier.summary[language]}
            </p>
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
            {isReasoningExpanded ? (
              <div className="mt-2 flex flex-col gap-4">
                {splitReasoningSteps(question.dossier.reasoning[language]).map((step, index) => (
                  <div key={index} className="overflow-x-auto">
                    <p className="text-sm leading-relaxed text-text-secondary">{step}</p>
                  </div>
                ))}
              </div>
            ) : null}

            {question.dossier.references.length > 0 ? (
              <>
                <h3 className="mt-6 text-xs font-semibold uppercase tracking-wide text-text-muted">
                  {copy.referencesHeading}
                </h3>
                <ul className="mt-2 flex flex-col gap-2">
                  {question.dossier.references.map((reference, idx) =>
                    isUrlReference(String(reference)) ? (
                      <li key={idx}>
                        <a
                          href={String(reference)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block truncate text-xs text-accent underline decoration-accent-soft underline-offset-2"
                          title={String(reference)}
                        >
                          {String(reference)}
                        </a>
                      </li>
                    ) : (
                      <li key={idx}>
                        <p className="text-xs leading-relaxed text-text-muted">{String(reference)}</p>
                      </li>
                    ),
                  )}
                </ul>
              </>
            ) : null}

            <button
              type="button"
              onClick={engine.goToNextQuestion}
              className="mt-8 w-full rounded-floating bg-accent px-4 py-3 text-sm font-medium text-base-surface shadow-floating-sm transition active:scale-95 hover:opacity-90"
            >
              {engine.progress.current === engine.progress.total ? copy.finish : copy.next}
            </button>
          </section>
        ) : null}

        {engine.state.isRevealed ? <DiscussionThread questionId={question.id} /> : null}
      </div>

      <ExitConfirmModal
        isOpen={showExitConfirm}
        onCancel={() => setShowExitConfirm(false)}
        onConfirm={() => router.replace('/topics')}
        language={language}
      />
    </main>
  );
    }
