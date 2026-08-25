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

  // ...sisanya SAMA PERSIS kayak yang tadi (body, validasi, screening, insert)
