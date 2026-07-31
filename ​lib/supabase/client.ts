// ============================================================================
// QuizMe — Supabase Browser Client Singleton
// Dipakai oleh Client Component (dashboard, quiz engine) untuk membaca data
// publik tabel `questions`. Menggunakan anon key yang aman untuk RLS read-only.
// ============================================================================

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/question';

type SupabaseBrowserClient = ReturnType<typeof createBrowserClient<Database>>;

let browserClientSingleton: SupabaseBrowserClient | null = null;

function assertEnv(value: string | undefined, key: string): string {
  if (!value) {
    throw new Error(
      `Environment variable ${key} tidak ditemukan. Pastikan sudah dikonfigurasi di .env.local`,
    );
  }

  return value;
}

export function getSupabaseBrowserClient(): SupabaseBrowserClient {
  if (browserClientSingleton !== null) {
    return browserClientSingleton;
  }

  const supabaseUrl = assertEnv(process.env.NEXT_PUBLIC_SUPABASE_URL, 'NEXT_PUBLIC_SUPABASE_URL');
  const supabaseAnonKey = assertEnv(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  );

  browserClientSingleton = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);

  return browserClientSingleton;
}
