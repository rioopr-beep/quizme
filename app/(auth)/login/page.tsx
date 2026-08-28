'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseBrowserClient } from '../../../lib/supabase/client';
import AuthParticleField from '../../../components/AuthParticleField';

export default function LoginPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleGoogleLogin() {
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });

    if (error) {
      setError('Gagal login dengan Google.');
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      setError('Email atau kata sandi salah.');
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F6F8FE]">
      <AuthParticleField />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-5">
        <div className="w-full max-w-sm rounded-[28px] border border-white/70 bg-white/50 p-8 shadow-[0_24px_60px_-28px_rgba(30,45,120,0.28)] backdrop-blur-2xl backdrop-saturate-150">
          <div className="mb-5 flex items-center justify-center gap-2 text-[14.5px] font-extrabold tracking-tight text-slate-500">
            <svg viewBox="0 0 24 24" fill="none" className="h-[17px] w-[17px]">
              <path d="M12 2 L21 7 V17 L12 22 L3 17 V7 Z" stroke="#2955F2" strokeWidth="2" strokeLinejoin="round" />
            </svg>
            Quiz<span className="text-[#2955F2]">Frend</span>
          </div>

          <h1 className="text-center text-[23px] font-extrabold text-slate-900">Selamat datang</h1>
          <p className="mt-1 text-center text-[13.5px] text-slate-500">Lanjutkan perjalanan belajarmu</p>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-[13px] border border-[#E6EAF9] bg-white/75 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:-translate-y-px hover:shadow-md disabled:opacity-60"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.87 2.7-6.62z" />
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.94v2.33A9 9 0 0 0 9 18z" />
              <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.94A9 9 0 0 0 0 9c0 1.45.35 2.83.94 4.03l3.01-2.33z" />
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .94 4.97l3.01 2.33C4.66 5.17 6.65 3.58 9 3.58z" />
            </svg>
            Masuk dengan Google
          </button>

          <div className="my-5 flex items-center gap-3 text-xs text-slate-500">
            <div className="h-px flex-1 bg-[#E6EAF9]" />
            atau
            <div className="h-px flex-1 bg-[#E6EAF9]" />
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            <label className="relative block">
              <span className="sr-only">Email</span>
              <svg className="pointer-events-none absolute left-3.5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 7l9 6 9-6" />
              </svg>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-[13px] border border-[#E6EAF9] bg-white/70 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#2955F2] focus:ring-4 focus:ring-[#2955F2]/10"
              />
            </label>

            <label className="relative block">
              <span className="sr-only">Kata sandi</span>
              <svg className="pointer-events-none absolute left-3.5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="10" width="16" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 018 0v3" />
              </svg>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Kata sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-[13px] border border-[#E6EAF9] bg-white/70 py-3 pl-10 pr-10 text-sm outline-none transition focus:border-[#2955F2] focus:ring-4 focus:ring-[#2955F2]/10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                aria-pressed={showPassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2955F2]"
              >
                {showPassword ? (
                  <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3l18 18M10.6 10.6a3 3 0 004.2 4.2M9.5 5.2A10.8 10.8 0 0112 5c7 0 11 7 11 7a13.6 13.6 0 01-3.1 3.7M6.5 6.6C4 8.3 2 11 2 12c0 0 4 7 11 7 1.3 0 2.5-.2 3.6-.6" />
                  </svg>
                ) : (
                  <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </label>

            <div className="-mt-1 text-right">
              <Link href="/forgot-password" className="text-[12.5px] font-semibold text-[#2955F2]">
                Lupa kata sandi?
              </Link>
            </div>

            {error ? <p className="text-sm text-rose-500">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 rounded-[13px] bg-gradient-to-b from-[#2955F2] to-[#1B3ECC] px-4 py-3 text-[14.5px] font-bold text-white shadow-[0_12px_24px_-10px_rgba(41,85,242,0.55)] transition hover:-translate-y-px disabled:opacity-60"
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          <p className="mt-5 text-center text-[13px] text-slate-500">
            Belum punya akun?{' '}
            <Link href="/signup" className="font-bold text-[#2955F2]">
              Daftar
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
