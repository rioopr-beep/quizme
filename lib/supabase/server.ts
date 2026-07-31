// ============================================================================
// QuizMe — Supabase Server Client Factory
// Dipakai oleh Server Component / Route Handler Next.js App Router untuk
// membaca data dengan konteks cookie sesi pengguna (aman untuk RLS).
// ============================================================================

import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { Database } from '@/types/question';

function assertEnv(value: string | undefined, key: string): string {
  if (!value) {
    throw new Error(
      `Environment variable ${key} tidak ditemukan. Pastikan sudah dikonfigurasi di .env.local`,
    );
  }

  return value;
}

type SupabaseServerClient = ReturnType<typeof createServerClient<Database>>;

export async function getSupabaseServerClient(): Promise<SupabaseServerClient> {
  const cookieStore = await cookies();

  const supabaseUrl = assertEnv(process.env.NEXT_PUBLIC_SUPABASE_URL, 'NEXT_PUBLIC_SUPABASE_URL');
  const supabaseAnonKey = assertEnv(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  );

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // Dipanggil dari Server Component tanpa akses tulis cookie.
          // Aman diabaikan karena sesi tetap disegarkan oleh middleware.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options });
        } catch {
          // Dipanggil dari Server Component tanpa akses tulis cookie.
          // Aman diabaikan karena sesi tetap disegarkan oleh middleware.
        }
      },
    },
  });
}
