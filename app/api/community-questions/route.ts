import { NextResponse } from 'next/server'
import { supabaseContributor } from '@/lib/supabaseContributor'

export async function GET() {
  const { data, error } = await supabaseContributor
    .from('contributor_questions')
    .select('id, sector, difficulty, prompt_id, prompt_en, context_id, context_en, options_id, options_en, correct_option, dossier, contributor_display_name')
    .eq('status', 'approved')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: data ?? [] })
}
