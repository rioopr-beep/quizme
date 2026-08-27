import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import PreviewQuizClient from './PreviewQuizClient';

export default async function PreviewPage({
  params,
}: {
  params: { sector: string };
}) {
  const supabase = createClient();

  const { data: questions, error } = await supabase
    .rpc('get_preview_questions', { p_sector: params.sector });

  if (error || !questions || questions.length === 0) {
    notFound();
  }

  return <PreviewQuizClient sector={params.sector} questions={questions} />;
}

export async function generateMetadata({
  params,
}: {
  params: { sector: string };
}) {
  return {
    title: `Coba Gratis: ${params.sector} — QuizFrend`,
    description: `Coba beberapa soal analisis studi kasus topik ${params.sector} di QuizFrend tanpa perlu login.`,
  };
}
