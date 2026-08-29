import { NextRequest, NextResponse } from 'next/server';
import { getPostBySlug } from '@/lib/blog';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const lang = request.nextUrl.searchParams.get('lang') === 'en' ? 'en' : 'id';
  const post = getPostBySlug(params.slug, lang);

  if (!post) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ post });
}
