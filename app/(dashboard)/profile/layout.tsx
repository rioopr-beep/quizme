import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Profile',
  description: 'Manage your QuizFrend account and view your personal analysis practice stats.',
  alternates: { canonical: 'https://www.quizfrend.my.id/profile' },
};

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return children;
}
