'use client';

// ============================================================================
// QuizMe — Assessment Engine Hook
// Mengisolasi seluruh logika evaluasi jawaban: penguncian status opsi,
// kalkulasi streak, dan navigasi antar soal. Tidak bergantung pada UI.
// ============================================================================

import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  OptionKey,
  OptionVisualState,
  QuestionData,
  QuizAnswerRecord,
  QuizState,
  SectorType,
} from '@/types/question';

export interface QuizProgress {
  readonly current: number;
  readonly total: number;
}

export interface UseQuizEngineResult {
  readonly state: QuizState;
  readonly currentQuestion: QuestionData | null;
  readonly progress: QuizProgress;
  readonly accuracy: number;
  readonly selectOption: (option: OptionKey) => void;
  readonly goToNextQuestion: () => void;
  readonly isOptionLocked: (option: OptionKey) => boolean;
  readonly getOptionVisualState: (option: OptionKey) => OptionVisualState;
}

function buildInitialState(sector: SectorType, questions: readonly QuestionData[]): QuizState {
  return {
    sector,
    questions,
    currentIndex: 0,
    answers: [],
    streak: 0,
    bestStreak: 0,
    lockedOption: null,
    isRevealed: false,
    status: questions.length > 0 ? 'active' : 'idle',
  };
}

export function useQuizEngine(
  sector: SectorType,
  questions: readonly QuestionData[],
): UseQuizEngineResult {
  const [state, setState] = useState<QuizState>(() => buildInitialState(sector, questions));

  // Sync state ketika data questions selesai dimuat (misal dari async fetch)
  useEffect(() => {
    setState(buildInitialState(sector, questions));
  }, [sector, questions]);

  const currentQuestion = useMemo<QuestionData | null>(
    () => state.questions[state.currentIndex] ?? null,
    [state.questions, state.currentIndex],
  );

  const selectOption = useCallback((option: OptionKey): void => {
    setState((previous) => {
      if (previous.isRevealed || previous.status !== 'active') {
        return previous;
      }

      const question = previous.questions[previous.currentIndex];

      if (!question) {
        return previous;
      }

      const isCorrect = option === question.correctOption;
      const nextStreak = isCorrect ? previous.streak + 1 : 0;

      const record: QuizAnswerRecord = {
        questionId: question.id,
        selectedOption: option,
        isCorrect,
        answeredAt: Date.now(),
      };

      return {
        ...previous,
        lockedOption: option,
        isRevealed: true,
        answers: [...previous.answers, record],
        streak: nextStreak,
        bestStreak: Math.max(previous.bestStreak, nextStreak),
      };
    });
  }, []);

  const goToNextQuestion = useCallback((): void => {
    setState((previous) => {
      const nextIndex = previous.currentIndex + 1;
      const hasNext = nextIndex < previous.questions.length;

      return {
        ...previous,
        currentIndex: hasNext ? nextIndex : previous.currentIndex,
        lockedOption: null,
        isRevealed: false,
        status: hasNext ? 'active' : 'completed',
      };
    });
  }, []);

  const isOptionLocked = useCallback(
    (option: OptionKey): boolean => state.isRevealed && state.lockedOption !== option,
    [state.isRevealed, state.lockedOption],
  );

  const getOptionVisualState = useCallback(
    (option: OptionKey): OptionVisualState => {
      if (!state.isRevealed || !currentQuestion) {
        return 'default';
      }

      const isCorrectOption = option === currentQuestion.correctOption;
      const isSelectedOption = option === state.lockedOption;

      if (isCorrectOption) {
        return 'correct';
      }

      if (isSelectedOption) {
        return 'incorrect';
      }

      return 'muted';
    },
    [state.isRevealed, state.lockedOption, currentQuestion],
  );

  const progress = useMemo<QuizProgress>(
    () => ({
      current: Math.min(state.currentIndex + 1, state.questions.length),
      total: state.questions.length,
    }),
    [state.currentIndex, state.questions.length],
  );

  const accuracy = useMemo<number>(() => {
    if (state.answers.length === 0) {
      return 0;
    }

    const correctCount = state.answers.filter((answer) => answer.isCorrect).length;

    return Math.round((correctCount / state.answers.length) * 100);
  }, [state.answers]);

  return {
    state,
    currentQuestion,
    progress,
    accuracy,
    selectOption,
    goToNextQuestion,
    isOptionLocked,
    getOptionVisualState,
  };
}
