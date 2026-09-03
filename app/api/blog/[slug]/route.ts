import { NextRequest, NextResponse } from 'next/server';
import { getPostBySlug, getRandomRelatedPosts } from '@/lib/blog';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const lang = request.nextUrl.searchParams.get('lang') === 'en' ? 'en' : 'id';
  const post = await getPostBySlug(params.slug, lang);

  if (!post) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const relatedPosts = await getRandomRelatedPosts(params.slug, lang, 6);

  return NextResponse.json({ post, relatedPosts });
}
