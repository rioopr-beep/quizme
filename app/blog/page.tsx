import type { Metadata } from 'next';
import { getAllPosts } from '@/lib/blog';
import BlogIndexClient from './BlogIndexClient';

export const metadata: Metadata = {
  title: 'QuizFrend Blog',
  description:
    'Educational articles across disciplines to accompany your analysis practice on QuizFrend.',
  alternates: { canonical: 'https://www.quizfrend.my.id/blog' },
};

export default async function BlogIndexPage() {
  const posts = await getAllPosts('en');
  return <BlogIndexClient initialPosts={posts} initialLang="en" />;
}
