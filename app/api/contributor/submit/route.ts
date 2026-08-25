import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { supabaseContributor } from '@/lib/supabaseContributor'
import { screenQuestionSafety } from '@/lib/geminiScreen'

export async function POST(req: NextRequest) {
  // 1. Cek user login lewat session project utama
  const supabaseAuth = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabaseAuth.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Harus login dulu' }, { status: 401 })
  }

  const body = await req.json()
  const {
    sector,
    difficulty,
    prompt_id,
    prompt_en,
    context_id,
    context_en,
    options_id,
    options_en,
    correct_option,
    dossier,
    contributor_display_name,
  } = body

  // 2. Validasi field wajib dasar
  if (!sector || !difficulty || !prompt_id || !context_id || !options_id || !correct_option || !dossier) {
    return NextResponse.json({ error: 'Ada field yang belum diisi' }, { status: 400 })
  }

  // 3. Pre-screen ke Gemini
  const screenResult = await screenQuestionSafety(prompt_id, context_id)

  // 4. Insert ke tabel contributor_questions
  const { data, error } = await supabaseContributor
    .from('contributor_questions')
    .insert({
      sector,
      difficulty,
      prompt_id,
      prompt_en,
      context_id,
      context_en,
      options_id,
      options_en,
      correct_option,
      dossier,
      contributor_user_id: user.id,
      contributor_display_name: contributor_display_name || user.email,
      status: screenResult.safe ? 'pending' : 'rejected',
      ai_screen_result: screenResult,
      reviewed_at: screenResult.safe ? null : new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    status: data.status,
    ai_reason: screenResult.reason,
  })
}
