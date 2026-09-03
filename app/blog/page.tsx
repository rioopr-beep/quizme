import type { Metadata } from 'next';
import { getPostsBySector } from '@/lib/blog';
import { labelForSector } from '@/lib/sectorLabels';
import BlogIndexClient from '../BlogIndexClient';

export const revalidate = 3600;

interface Props {
  params: { sector: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const label = labelForSector(params.sector, 'en');
  return {
    title: `${label} Articles`,
    description: `Educational articles about ${label} on QuizFrend Blog.`,
    alternates: { canonical: `https://www.quizfrend.my.id/blog/${params.sector}` },
  };
}

export default async function BlogSectorPage({ params }: Props) {
  const posts = await getPostsBySector(params.sector, 'en');
  return <BlogIndexClient initialPosts={posts} initialLang="en" forcedSector={params.sector} />;
}
