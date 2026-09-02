import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSupabaseAdminClient } from '../../../../../lib/supabase/admin';
import { supabaseContributor } from '../../../../../lib/supabaseContributor';
import { submitToIndexNow } from '../../../../../lib/indexnow';

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

interface PublishBody {
  slug: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const { isAdmin, reason } = await checkAdminAccess(request);
  if (!isAdmin) {
    return NextResponse.json({ error: `Tidak diizinkan. Detail: ${reason}` }, { status: 403 });
  }

  let body: PublishBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body request tidak valid.' }, { status: 400 });
  }

  const { slug } = body;
  if (!slug) {
    return NextResponse.json({ error: 'slug wajib diisi.' }, { status: 400 });
  }

  // Publish kedua baris (id & en) yang punya slug ini sekaligus
  const { error: updateError } = await supabaseContributor
    .from('blog_posts')
    .update({ status: 'published' })
    .eq('slug', slug)
    .eq('status', 'draft'); // jaga-jaga, cuma yang masih draft yang boleh di-publish

  if (updateError) {
    return NextResponse.json({ error: `Gagal publish: ${updateError.message}` }, { status: 500 });
  }

  // Baru sekarang artikel resmi tayang: revalidate cache + kasih tahu search engine
  revalidatePath('/blog');
  revalidatePath(`/blog/${slug}`);
  await submitToIndexNow([`https://www.quizfrend.my.id/blog/${slug}`]);

  return NextResponse.json({ success: true });
}
