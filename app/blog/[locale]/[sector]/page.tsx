import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPostsBySector } from '@/lib/blog';
import { labelForSector } from '@/lib/sectorLabels';
import BlogIndexClient from '../BlogIndexClient';

export const revalidate = 3600;

const VALID_LOCALES = ['en', 'id'] as const;
type Locale = (typeof VALID_LOCALES)[number];
function isValidLocale(value: string): value is Locale {
  return VALID_LOCALES.includes(value as Locale);
}

interface Props {
  params: { locale: string; sector: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isValidLocale(params.locale)) return {};
  const label = labelForSector(params.sector, params.locale);
  return {
    title: `${label} Articles`,
    description: `Educational articles about ${label} on QuizFrend Blog.`,
    alternates: {
      canonical: `https://www.quizfrend.my.id/blog/${params.locale}/${params.sector}`,
      languages: {
        en: `https://www.quizfrend.my.id/blog/en/${params.sector}`,
        id: `https://www.quizfrend.my.id/blog/id/${params.sector}`,
      },
    },
  };
}

export default async function BlogSectorPage({ params }: Props) {
  if (!isValidLocale(params.locale)) notFound();

  const posts = await getPostsBySector(params.sector, params.locale);
  return <BlogIndexClient posts={posts} locale={params.locale} forcedSector={params.sector} />;
}
