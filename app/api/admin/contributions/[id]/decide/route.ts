import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseContributor } from '@/lib/supabaseContributor'

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

  const { decision, admin_note } = await req.json() // decision: 'approved' | 'rejected'

  if (decision !== 'approved' && decision !== 'rejected') {
    return NextResponse.json({ error: 'Decision tidak valid' }, { status: 400 })
  }

  const { error } = await supabaseContributor
    .from('contributor_questions')
    .update({ status: decision, admin_note: admin_note ?? null, reviewed_at: new Date().toISOString() })
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
