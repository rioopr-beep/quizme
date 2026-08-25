import { createClient } from '@supabase/supabase-js'

// Client pakai service role key — buat dipake di server (API routes) aja
// JANGAN pernah expose service role key ke client-side/browser
export const supabaseContributor = createClient(
  process.env.CONTRIBUTOR_SUPABASE_URL!,
  process.env.CONTRIBUTOR_SUPABASE_SERVICE_ROLE_KEY!
)
