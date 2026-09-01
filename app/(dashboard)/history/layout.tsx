import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'History',
  description: 'Review your past quiz attempts and track your progress on QuizFrend.',
  alternates: { canonical: 'https://www.quizfrend.my.id/history' },
};

export default function HistoryLayout({ children }: { children: ReactNode }) {
  return children;
}
