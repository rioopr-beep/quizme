import { permanentRedirect, notFound } from 'next/navigation';
import { getPostsBySector, getPostBySlug } from '@/lib/blog';

interface Props {
  params: { sector: string };
}

export default async function OldSectorRedirect({ params }: Props) {
  const posts = await getPostsBySector(params.sector, 'en');
  if (posts.length > 0) {
    permanentRedirect(`/blog/en/${params.sector}`);
  }

  // Fallback buat URL SANGAT lama (v1, flat slug tanpa sector)
  const post = await getPostBySlug(params.sector, 'en');
  if (post) {
    permanentRedirect(`/blog/en/${post.sector}/${post.slug}`);
  }

  notFound();
}
