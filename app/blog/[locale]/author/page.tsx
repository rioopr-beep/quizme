import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllPosts } from '@/lib/blog';
import AuthorPageClient from './AuthorPageClient';

export const revalidate = 3600;

const VALID_LOCALES = ['en', 'id'] as const;
type Locale = (typeof VALID_LOCALES)[number];
function isValidLocale(value: string): value is Locale {
  return VALID_LOCALES.includes(value as Locale);
}

interface Props {
  params: { locale: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isValidLocale(params.locale)) return {};

  const title = params.locale === 'en' ? 'About Rioopr' : 'Tentang Rioopr';
  const description =
    params.locale === 'en'
      ? "Rioopr writes QuizFrend's blog out of genuine curiosity, not claimed expertise."
      : 'Rioopr menulis blog QuizFrend karena rasa penasaran, bukan klaim sebagai ahli.';

  return {
    title,
    description,
    alternates: {
      canonical: `https://www.quizfrend.my.id/blog/${params.locale}/author`,
      languages: {
        en: 'https://www.quizfrend.my.id/blog/en/author',
        id: 'https://www.quizfrend.my.id/blog/id/author',
      },
    },
  };
}

export default async function AuthorPage({ params }: Props) {
  if (!isValidLocale(params.locale)) notFound();

  const posts = await getAllPosts(params.locale);
  return <AuthorPageClient posts={posts} locale={params.locale} />;
}
