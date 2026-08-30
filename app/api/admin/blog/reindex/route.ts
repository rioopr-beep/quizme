import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '../../../../../lib/supabase/admin';
import { getAllSlugs } from '../../../../../lib/blog';
import { submitToIndexNow } from '../../../../../lib/indexnow';

export const runtime = 'nodejs';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null;
  if (!token) {
    return NextResponse.json({ error: 'Tidak ada token.' }, { status: 401 });
  }

  const supabaseAdmin = getSupabaseAdminClient();
  const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !user) {
    return NextResponse.json({ error: 'Token tidak valid.' }, { status: 401 });
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Bukan admin.' }, { status: 403 });
  }

  const slugs = await getAllSlugs();
  const urls = slugs.map((slug) => `https://www.quizfrend.my.id/blog/${slug}`);
  await submitToIndexNow(urls);

  return NextResponse.json({ success: true, count: urls.length });
}
