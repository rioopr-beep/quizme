import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Leaderboard',
  description: 'See the top performers on QuizFrend and how your analysis practice ranks against others.',
  alternates: { canonical: 'https://www.quizfrend.my.id/leaderboard' },
};

export default function LeaderboardLayout({ children }: { children: ReactNode }) {
  return children;
}
