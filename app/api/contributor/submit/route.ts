import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseContributor } from '@/lib/supabaseContributor'
import { screenQuestionSafety } from '@/lib/geminiScreen'

export async function POST(req: NextRequest) {
  // 1. Cek user login lewat session project utama
  const cookieStore = cookies()
  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
  const { data: { user } } = await supabaseAuth.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Harus login dulu' }, { status: 401 })
  }

  // 2. Ambil & validasi body
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

  if (!sector || !difficulty || !prompt_id || !prompt_en || !options_id || !options_en || !correct_option || !dossier) {
    return NextResponse.json({ error: 'Data soal belum lengkap' }, { status: 400 })
  }

  // 3. Pre-screen keamanan pakai Gemini
  const screenResult = await screenQuestionSafety({
    prompt_en,
    context_en,
    options_en,
    dossier,
  })

  if (!screenResult.safe) {
    return NextResponse.json(
      { error: 'Soal ditolak sistem otomatis', reason: screenResult.reason },
      { status: 422 }
    )
  }

  // 4. Insert ke tabel contributor_questions (project Supabase Contributor)
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
      contributor_display_name: contributor_display_name ?? user.email,
      status: 'pending',
      ai_screen_result: screenResult,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, submission: data })
    }
