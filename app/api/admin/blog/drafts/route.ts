import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '../../../../../lib/supabase/admin';
import { supabaseContributor } from '../../../../../lib/supabaseContributor';

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

export interface DraftPair {
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

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { isAdmin, reason } = await checkAdminAccess(request);
  if (!isAdmin) {
    return NextResponse.json({ error: `Tidak diizinkan. Detail: ${reason}` }, { status: 403 });
  }

  const { data, error } = await supabaseContributor
    .from('blog_posts')
    .select('slug, lang, title, excerpt, content, sector, author, date')
    .eq('status', 'draft')
    .order('date', { ascending: false });

  if (error) {
    return NextResponse.json({ error: `Gagal ambil draft: ${error.message}` }, { status: 500 });
  }

  // Gabungin baris id & en yang slug-nya sama jadi 1 objek per artikel
  const bySlug = new Map<string, Partial<DraftPair>>();

  for (const row of data ?? []) {
    const current = bySlug.get(row.slug) ?? { slug: row.slug, sector: row.sector, date: row.date, author: row.author };

    if (row.lang === 'id') {
      current.id_title = row.title;
      current.id_excerpt = row.excerpt;
      current.id_content = row.content;
    } else if (row.lang === 'en') {
      current.en_title = row.title;
      current.en_excerpt = row.excerpt;
      current.en_content = row.content;
    }

    bySlug.set(row.slug, current);
  }

  const drafts = Array.from(bySlug.values()) as DraftPair[];

  return NextResponse.json({ drafts });
}
