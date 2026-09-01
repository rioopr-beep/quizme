import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
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

interface BlogSubmitBody {
  slug: string;
  sector: string;
  date: string;
  author: string;
  id_title: string;
  id_excerpt: string;
  id_content: string;
  en_title: string;
  en_excerpt: string;
  en_content: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const { isAdmin, reason } = await checkAdminAccess(request);
  if (!isAdmin) {
    return NextResponse.json({ error: `Tidak diizinkan. Detail: ${reason}` }, { status: 403 });
  }

  let body: BlogSubmitBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body request tidak valid.' }, { status: 400 });
  }

  const { slug, sector, date, author, id_title, id_excerpt, id_content, en_title, en_excerpt, en_content } = body;

  if (!slug || !sector || !date || !author) {
    return NextResponse.json({ error: 'slug, sector, date, author wajib diisi.' }, { status: 400 });
  }
  if (!id_title || !id_excerpt || !id_content) {
    return NextResponse.json({ error: 'Field Bahasa Indonesia wajib diisi.' }, { status: 400 });
  }
  if (!en_title || !en_excerpt || !en_content) {
    return NextResponse.json({ error: 'Field Bahasa Inggris wajib diisi.' }, { status: 400 });
  }

  const rows = [
    { slug, lang: 'id', title: id_title, excerpt: id_excerpt, content: id_content, sector, author, date },
    { slug, lang: 'en', title: en_title, excerpt: en_excerpt, content: en_content, sector, author, date },
  ];

  const { error: insertError } = await supabaseContributor.from('blog_posts').insert(rows);

  if (insertError) {
    return NextResponse.json({ error: `Gagal insert: ${insertError.message}` }, { status: 500 });
  }

  // Hapus cache halaman blog index & halaman artikel ini sendiri, biar langsung muncul tanpa nunggu revalidate 1 jam
  revalidatePath('/blog');
  revalidatePath(`/blog/${slug}`);

  // Kasih tahu search engine (Bing, Yandex, dll) ada artikel baru — gak nge-block response,
  // gak bikin insert gagal walau IndexNow-nya sendiri gagal
  submitToIndexNow([`https://www.quizfrend.my.id/blog/${slug}`]);

  return NextResponse.json({ success: true });
      }
