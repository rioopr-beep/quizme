'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '../../../../../../../lib/supabase/client';
import { useLanguage } from '../../../../../../../context/LanguageContext';
import type { OptionKey, LocalizedContent, LocalizedOptions } from '../../../../../../../types/question';

interface ReviewAnswer {
  questionId: string;
  prompt: LocalizedContent | null;
  options: LocalizedOptions | null;
  selectedOption: OptionKey;
  correctOption: OptionKey | null;
  isCorrect: boolean;
  dossier: {
    summary: LocalizedContent;
    reasoning: LocalizedContent;
    references: readonly string[];
  } | null;
}

const OPTION_ORDER: readonly OptionKey[] = ['A', 'B', 'C', 'D'];

export default function TranslationReviewPage(): JSX.Element {
  const params = useParams<{ language: string; difficulty: string }>();
  const router = useRouter();
  const { language: uiLanguage } = useLanguage();

  const [answers, setAnswers] = useState<readonly ReviewAnswer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function loadLatestAttempt(): Promise<void> {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { data } = await supabase
        .from('quiz_attempts')
        .select('answers')
        .eq('user_id', user.id)
        .eq('sector', 'translation')
        .eq('difficulty', params.difficulty)
        .eq('language', params.language)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (isMounted) {
        setAnswers((data?.answers as ReviewAnswer[]) ?? []);
        setIsLoading(false);
      }
    }

    void loadLatestAttempt();
    return () => {
      isMounted = false;
    };
  }, [params.difficulty, params.language, router]);

  const back = uiLanguage === 'id' ? '← Kembali' : '← Back';
  const heading = uiLanguage === 'id' ? 'Pembahasan' : 'Review';
  const loadingText = uiLanguage === 'id' ? 'Memuat…' : 'Loading…';

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-center">
        <p className="font-mono text-sm text-slate-400">{loadingText}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 sm:px-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <header className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="font-mono text-sm text-slate-400 transition hover:text-slate-600"
          >
            {back}
          </button>
          <h1 className="text-lg font-semibold text-slate-800">{heading}</h1>
        </header>

        <div className="flex flex-col gap-5">
          {answers.map((answer, index) => (
            <section
              key={answer.questionId}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <p className="mb-3 font-mono text-xs text-slate-400">
                {uiLanguage === 'id' ? 'Soal' : 'Question'} {index + 1}
              </p>

              {answer.prompt ? (
                <p className="mb-4 text-sm font-medium leading-relaxed text-slate-900">
                  {answer.prompt[uiLanguage]}
                </p>
              ) : null}

              <div className="flex flex-col gap-2">
                {OPTION_ORDER.map((key) => {
                  if (!answer.options) return null;

                  const isSelected = key === answer.selectedOption;
                  const isCorrectOption = key === answer.correctOption;

                  let stateClass = 'border-slate-200 bg-white text-slate-600';
                  if (isCorrectOption) {
                    stateClass = 'border-emerald-300 bg-emerald-50 text-emerald-700';
                  } else if (isSelected && !answer.isCorrect) {
                    stateClass = 'border-rose-300 bg-rose-50 text-rose-700';
                  }

                  return (
                    <div
                      key={key}
                      className={`rounded-xl border px-4 py-2 text-sm ${stateClass}`}
                    >
                      {answer.options[uiLanguage][key]}
                    </div>
                  );
                })}
              </div>

              {answer.dossier ? (
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <p className="text-sm leading-relaxed text-slate-600">
                    {answer.dossier.reasoning[uiLanguage]}
                  </p>
                  {answer.dossier.references.length > 0 ? (
                    <p className="mt-2 font-mono text-xs text-emerald-600">
                      {answer.dossier.references[0]}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
