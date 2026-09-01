import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '../../../../lib/supabase/admin';
import { supabaseContributor } from '../../../../lib/supabaseContributor';
import { submitToIndexNow } from '../../../../lib/indexnow';

export const runtime = 'nodejs';

async function checkAdminAccess(request: NextRequest): Promise<{ isAdmin: boolean; reason: string }> {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null;

  if (!token) {
    return { isAdmin: false, reason: 'Tidak ada token di header request.' };
  }

  const supabaseAdmin = getSupabaseAdminClient();

  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(token);

  if (userError || !user) {
    return { isAdmin: false, reason: `Token tidak valid/expired: ${userError?.message ?? 'user tidak ditemukan'}` };
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError) {
    return { isAdmin: false, reason: `Gagal baca profile: ${profileError.message}` };
  }

  if (profile?.role !== 'admin') {
    return { isAdmin: false, reason: `Role user ini "${profile?.role ?? 'null'}", bukan admin.` };
  }

  return { isAdmin: true, reason: 'ok' };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const { isAdmin, reason } = await checkAdminAccess(request);
  if (!isAdmin) {
    return NextResponse.json({ error: `Tidak diizinkan. Detail: ${reason}` }, { status: 403 });
  }

  const { data: posts, error: fetchError } = await supabaseContributor
    .from('blog_posts')
    .select('slug')
    .eq('lang', 'id');

  if (fetchError) {
    return NextResponse.json({ error: `Gagal ambil daftar artikel: ${fetchError.message}` }, { status: 500 });
  }

  const uniqueSlugs = Array.from(new Set((posts ?? []).map((p) => p.slug)));
  const urls = uniqueSlugs.map((slug) => `https://www.quizfrend.my.id/blog/${slug}`);

  if (urls.length === 0) {
    return NextResponse.json({ error: 'Tidak ada artikel ditemukan.' }, { status: 404 });
  }

  await submitToIndexNow(urls);

  return NextResponse.json({ success: true, submittedCount: urls.length, urls });
}
