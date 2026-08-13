'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseBrowserClient } from '../../../../../lib/supabase/client';
import { useLanguage } from '../../../../../context/LanguageContext';
import { useQuizEngine } from '../../../../../hooks/useQuizEngine';
import { mapQuestionRowToQuestionData } from '../../../../../types/question';
import ExitConfirmModal from '../../../../../components/ExitConfirmModal';
import DiscussionThread from '../../../../../components/DiscussionThread';
import ReportQuestionButton from '../../../../../components/ReportQuestionButton';
import type {
  OptionKey,
  OptionVisualState,
  QuestionData,
  QuestionRow,
  SectorType,
  DifficultyLevel,
  QuizAnswerRecord,
} from '../../../../../types/question';

const VALID_SECTORS: readonly SectorType[] = [
  'financial',
  'cryptography',
  'psychology',
  'physics',
  'science',
  'linguistics',
  'book-trivia',
  'curiosities',
  'mathematics',
];

const VALID_DIFFICULTIES: readonly DifficultyLevel[] = [
  'foundational',
  'intermediate',
  'advanced',
];

const OPTION_ORDER: readonly OptionKey[] = ['A', 'B', 'C', 'D'];

const OPTION_VISUAL_CLASS_MAP: Record<OptionVisualState, string> = {
  default: 'border-slate-200 bg-white text-slate-700 hover:border-slate-300',
  correct: 'border-indigo-300 bg-indigo-50 text-indigo-900',
  incorrect: 'border-rose-300 bg-rose-50 text-rose-700',
  muted: 'border-slate-100 bg-slate-50 text-slate-400',
};

function isValidSector(value: string): value is SectorType {
  return (VALID_SECTORS as readonly string[]).includes(value);
}

function isValidDifficulty(value: string): value is DifficultyLevel {
  return (VALID_DIFFICULTIES as readonly string[]).includes(value);
}

function shuffleArray<T>(array: readonly T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function shuffleQuestionOptions(question: QuestionData): QuestionData {
  const keys: OptionKey[] = ['A', 'B', 'C', 'D'];
  const shuffledKeys = shuffleArray(keys);

  const newOptionsId: Record<OptionKey, string> = {} as Record<OptionKey, string>;
  const newOptionsEn: Record<OptionKey, string> = {} as Record<OptionKey, string>;
  let newCorrectOption: OptionKey = question.correctOption;

  keys.forEach((newKey, index) => {
    const originalKey = shuffledKeys[index];
    newOptionsId[newKey] = question.options.id[originalKey];
    newOptionsEn[newKey] = question.options.en[originalKey];
    if (originalKey === question.correctOption) {
      newCorrectOption = newKey;
    }
  });

  return {
    ...question,
    options: { id: newOptionsId, en: newOptionsEn },
    correctOption: newCorrectOption,
  };
}

async function persistBestStreak(candidate: number): Promise<void> {
  // Streak sekarang dihitung dari check-in (lihat CheckInCard.tsx),
  // bukan dari jawaban benar beruntun. Fungsi ini sengaja tidak lagi
  // menulis ke profiles.best_streak / current_streak.
  void candidate;
}

async function saveQuizAttempt(
  sector: SectorType,
  difficulty: DifficultyLevel,
  questions: readonly QuestionData[],
  answers: readonly QuizAnswerRecord[],
): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const score = answers.filter((a) => a.isCorrect).length;

  const detailedAnswers = answers.map((answer) => {
    const question = questions.find((q) => q.id === answer.questionId);
    return {
      questionId: answer.questionId,
      prompt: question?.prompt ?? null,
      options: question?.options ?? null,
      selectedOption: answer.selectedOption,
      correctOption: question?.correctOption ?? null,
      isCorrect: answer.isCorrect,
      dossier: question?.dossier ?? null,
    };
  });

  await supabase.from('quiz_attempts').insert({
    user_id: user.id,
    sector,
    difficulty,
    question_count: questions.length,
    score,
    answers: detailedAnswers,
  });
}

export default function QuizPage(): JSX.Element {
  const rawParams = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const searchParams = useSearchParams();

  const sectorParam = typeof rawParams?.sector === 'string' ? rawParams.sector.toLowerCase() : '';
  const difficultyParam =
    typeof rawParams?.difficulty === 'string' ? rawParams.difficulty.toLowerCase() : '';

  const sector: SectorType | null = isValidSector(sectorParam) ? sectorParam : null;
  const difficulty: DifficultyLevel | null = isValidDifficulty(difficultyParam)
    ? difficultyParam
    : null;

  const countParam = searchParams.get('count');
  const selectedCount = countParam ? Number.parseInt(countParam, 10) : null;

  const [questions, setQuestions] = useState<readonly QuestionData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);

  useEffect(() => {
    if (!sector || !difficulty || !selectedCount) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function loadQuestions(
      activeSector: SectorType,
      activeDifficulty: DifficultyLevel,
    ): Promise<void> {
      const supabase = getSupabaseBrowserClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      let mapped: QuestionData[];

      if (user) {
        // User login: pakai RPC yang prioritaskan soal belum pernah muncul,
        // baru soal lama kalau stok soal baru sudah habis
        const { data, error } = await supabase.rpc('get_quiz_questions', {
          p_user_id: user.id,
          p_sector: activeSector,
          p_difficulty: activeDifficulty,
          p_limit: selectedCount,
        });

        if (!isMounted) return;

        if (error || !data) {
          setLoadError(
            language === 'id'
              ? 'Gagal memuat studi kasus. Silakan coba lagi.'
              : 'Failed to load case studies. Please try again.',
          );
          setIsLoading(false);
          return;
        }

        // Urutan dari RPC sudah diprioritaskan, JANGAN diacak ulang di sini
        mapped = (data as QuestionRow[]).map(mapQuestionRowToQuestionData);
      } else {
        // Guest/belum login: tidak ada user_id untuk cek riwayat,
        // fallback ke random polos dari seluruh pool
        const { data, error } = await supabase
          .from('questions')
          .select('*')
          .eq('sector', activeSector)
          .eq('difficulty', activeDifficulty);

        if (!isMounted) return;

        if (error || !data) {
          setLoadError(
            language === 'id'
              ? 'Gagal memuat studi kasus. Silakan coba lagi.'
              : 'Failed to load case studies. Please try again.',
          );
          setIsLoading(false);
          return;
        }

        const rawMapped = (data as QuestionRow[]).map(mapQuestionRowToQuestionData);
        const shuffledOrder = shuffleArray(rawMapped);
        mapped = shuffledOrder.slice(0, selectedCount);
      }

      // Acak posisi opsi A/B/C/D untuk tiap soal (independen dari urutan soal)
      const withShuffledOptions = mapped.map(shuffleQuestionOptions);
      setQuestions(withShuffledOptions);
      setIsLoading(false);
    }

    void loadQuestions(sector, difficulty);

    return () => {
      isMounted = false;
    };
  }, [sector, difficulty, language, selectedCount]);

  const engine = useQuizEngine(sector ?? 'science', questions);

  useEffect(() => {
    if (engine.state.status === 'completed' && sector && difficulty) {
      void persistBestStreak(engine.state.bestStreak);
      void saveQuizAttempt(sector, difficulty, questions, engine.state.answers);
    }
  }, [engine.state.status, engine.state.bestStreak, sector, difficulty, questions, engine.state.answers]);

  const copy = useMemo(
    () => ({
      back: language === 'id' ? '← Kembali' : '← Back',
      progress: (current: number, total: number): string =>
        language === 'id' ? `Soal ${current} dari ${total}` : `Question ${current} of ${total}`,
      streak: language === 'id' ? 'Beruntun' : 'Streak',
      dossierHeading: language === 'id' ? 'Dossier Pembahasan' : 'Discussion Dossier',
      reasoningHeading: language === 'id' ? 'Penalaran' : 'Reasoning',
      referencesHeading: language === 'id' ? 'Referensi' : 'References',
      next: language === 'id' ? 'Soal Berikutnya' : 'Next Question',
      finish: language === 'id' ? 'Lihat Ringkasan' : 'View Summary',
      loading: language === 'id' ? 'Memuat studi kasus…' : 'Loading case studies…',
      empty:
        language === 'id'
          ? 'Belum ada soal untuk kombinasi ini.'
          : 'No questions available for this combination yet.',
      invalidSector: language === 'id' ? 'Topik atau mode tidak dikenal.' : 'Unknown topic or mode.',
      completedTitle: language === 'id' ? 'Sesi Selesai' : 'Session Complete',
      accuracyLabel: language === 'id' ? 'Akurasi' : 'Accuracy',
      bestStreakLabel: language === 'id' ? 'Beruntun Terbaik' : 'Best Streak',
      returnToDashboard: language === 'id' ? 'Kembali ke Dashboard' : 'Return to Dashboard',
      howMany: language === 'id' ? 'Berapa soal?' : 'How many questions?',
      questionsUnit: language === 'id' ? 'soal' : 'questions',
    }),
    [language],
  );

  if (!sector || !difficulty) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-center">
        <p className="font-mono text-sm text-rose-500">{copy.invalidSector}</p>
      </main>
    );
  }

  if (!selectedCount) {
    const countOptions = [10, 20];

    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-slate-800">{copy.howMany}</h1>
          <div className="mt-6 flex flex-col gap-3">
            {countOptions.map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => router.push(`/quiz/${sector}/${difficulty}?count=${count}`)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-900"
              >
                {count} {copy.questionsUnit}
              </button>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-center">
        <p className="font-mono text-sm text-slate-400">{copy.loading}</p>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-center">
        <p className="font-mono text-sm text-rose-500">{loadError}</p>
      </main>
    );
  }

  if (questions.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50 px-6 text-center">
        <p className="font-mono text-sm text-slate-400">{copy.empty}</p>
        <button
          type="button"
          onClick={() => router.push(`/quiz/${sector}`)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-indigo-300 hover:text-indigo-900"
        >
          {copy.returnToDashboard}
        </button>
      </main>
    );
  }

  if (engine.state.status === 'completed') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-md rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-8 text-center shadow-sm">
          <h1 className="font-mono text-xl font-semibold text-slate-900">{copy.completedTitle}</h1>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-white/70 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">{copy.accuracyLabel}</p>
              <p className="mt-1 font-mono text-2xl font-semibold text-indigo-900">
                {engine.accuracy}%
              </p>
            </div>
            <div className="rounded-xl bg-white/70 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                {copy.bestStreakLabel}
              </p>
              <p className="mt-1 font-mono text-2xl font-semibold text-rose-500">
                {engine.state.bestStreak}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => router.push(`/quiz/${sector}/${difficulty}/review`)}
              className="w-full rounded-xl bg-indigo-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-indigo-800"
            >
              {language === 'id' ? 'Lihat Pembahasan' : 'View Review'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              {copy.returnToDashboard}
            </button>
          </div>
        </div>
      </main>
    );
  }

  const question = engine.currentQuestion;

  if (!question) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-center">
        <p className="font-mono text-sm text-rose-500">{copy.invalidSector}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 sm:px-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <header className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowExitConfirm(true)}
            className="font-mono text-sm text-slate-400 transition hover:text-slate-600"
          >
            {copy.back}
          </button>

          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-slate-400">
              {copy.progress(engine.progress.current, engine.progress.total)}
            </span>
            <span className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 font-mono text-xs font-medium text-indigo-900">
              {copy.streak}: {engine.state.streak}
            </span>
          </div>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {question.context ? (
            <p className="mb-4 rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-500">
              {question.context[language]}
            </p>
          ) : null}

          <h1 className="text-lg font-semibold leading-relaxed text-slate-900">
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
                  className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition disabled:cursor-not-allowed ${OPTION_VISUAL_CLASS_MAP[visualState]}`}
                >
                  <span className="font-mono text-xs font-semibold">{optionKey}</span>
                  <span className="leading-relaxed">{question.options[language][optionKey]}</span>
                </button>
              );
            })}
          </div>
        </section>

        {engine.state.isRevealed ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-mono text-sm font-semibold uppercase tracking-wide text-slate-400">
                {copy.dossierHeading}
              </h2>
              <ReportQuestionButton questionId={question.id} />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">
              {question.dossier.summary[language]}
            </p>

            <h3 className="mt-6 font-mono text-xs font-semibold uppercase tracking-wide text-slate-400">
              {copy.reasoningHeading}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {question.dossier.reasoning[language]}
            </p>

            {question.dossier.references.length > 0 ? (
              <>
                <h3 className="mt-6 font-mono text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {copy.referencesHeading}
                </h3>
                <ul className="mt-2 flex flex-col gap-1">
                  {question.dossier.references.map((reference) => (
                    <li key={reference} className="font-mono text-xs text-slate-400">
                      {reference}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            <button
              type="button"
              onClick={engine.goToNextQuestion}
              className="mt-8 w-full rounded-xl bg-indigo-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-indigo-800"
            >
              {engine.progress.current === engine.progress.total ? copy.finish : copy.next}
            </button>
          </section>
        ) : null}

        {/* Diskusi — muncul di bawah dossier, hanya setelah jawaban di-reveal */}
        {engine.state.isRevealed ? (
          <DiscussionThread questionId={question.id} />
        ) : null}
      </div>

      <ExitConfirmModal
        isOpen={showExitConfirm}
        onCancel={() => setShowExitConfirm(false)}
        onConfirm={() => router.push(`/quiz/${sector}`)}
        language={language}
      />
    </main>
  );
    }
