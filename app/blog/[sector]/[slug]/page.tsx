import { permanentRedirect, notFound } from 'next/navigation';
import { getPostBySlug } from '@/lib/blog';

interface Props {
  params: { sector: string; slug: string };
}

export default async function OldArticleRedirect({ params }: Props) {
  const post = await getPostBySlug(params.slug, 'en');

  if (!post || post.sector !== params.sector) {
    notFound();
  }

  permanentRedirect(`/blog/en/${post.sector}/${post.slug}`);
}
