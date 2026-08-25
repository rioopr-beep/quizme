import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseContributor } from '@/lib/supabaseContributor'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'

async function requireAdmin() {
  const cookieStore = cookies()
  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
  )
  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabaseAuth.from('profiles').select('role').eq('id', user.id).single()
  return profile?.role === 'admin' ? user : null
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // 1. Ambil soal dari contributor_questions
  const { data: contribQuestion, error: fetchError } = await supabaseContributor
    .from('contributor_questions')
    .select('*')
    .eq('id', params.id)
    .single()

  if (fetchError || !contribQuestion) {
    return NextResponse.json({ error: 'Soal tidak ditemukan' }, { status: 404 })
  }

  if (contribQuestion.status !== 'approved') {
    return NextResponse.json({ error: 'Soal harus berstatus approved dulu sebelum di-promote' }, { status: 400 })
  }

  // 2. Insert ke tabel questions project utama, pake service role
  const adminClient = getSupabaseAdminClient()
  const { data: newQuestion, error: insertError } = await adminClient
    .from('questions')
    .insert({
      sector: contribQuestion.sector,
      difficulty: contribQuestion.difficulty,
      prompt_id: contribQuestion.prompt_id,
      prompt_en: contribQuestion.prompt_en,
      context_id: contribQuestion.context_id,
      context_en: contribQuestion.context_en,
      options_id: contribQuestion.options_id,
      options_en: contribQuestion.options_en,
      correct_option: contribQuestion.correct_option,
      dossier: contribQuestion.dossier,
      contributor_name: contribQuestion.contributor_display_name,
    })
    .select()
    .single()

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  // 3. Update status jadi 'promoted', catat id soal barunya
  await supabaseContributor
    .from('contributor_questions')
    .update({ status: 'promoted', promoted_question_id: newQuestion.id })
    .eq('id', params.id)

  return NextResponse.json({ success: true, questionId: newQuestion.id })
}
