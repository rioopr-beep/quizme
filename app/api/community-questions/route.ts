import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseContributor } from '@/lib/supabaseContributor'

export async function GET(req: NextRequest) {
  // Cek login lewat session project utama
  const cookieStore = cookies()
  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
  )
  const { data: { user } } = await supabaseAuth.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Harus login dulu' }, { status: 401 })
  }

  const { data, error } = await supabaseContributor
    .from('contributor_questions')
    .select('id, sector, difficulty, prompt_id, prompt_en, context_id, context_en, options_id, options_en, correct_option, dossier, contributor_display_name')
    .eq('status', 'approved')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: data ?? [] })
}
