'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseBrowserClient } from '../../../lib/supabase/client';

export default function SignupPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (error) {
      setLoading(false);
      setError('Gagal mendaftar. Coba email lain atau kata sandi lebih kuat.');
      return;
    }

    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        name,
        current_streak: 0,
        best_streak: 0,
      });
    }

    setLoading(false);
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-sm">
        <p className="mb-6 text-center font-mono text-2xl font-semibold text-slate-900">
          QuizMe
        </p>

        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-8 shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900">Buat akun</h1>
          <p className="mt-1 text-sm text-slate-500">Mulai latihan analisismu</p>

          <form onSubmit={handleSignup} className="mt-6 flex flex-col gap-3">
            <input
              type="text"
              placeholder="Nama kamu"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-400"
            />
            <input
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-400"
            />
            <input
              type="password"
              placeholder="Kata sandi (min. 6 karakter)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-400"
            />

            {error ? <p className="text-sm text-rose-500">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded-xl bg-indigo-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-indigo-800 disabled:opacity-60"
            >
              {loading ? 'Memproses...' : 'Daftar'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Sudah punya akun?{' '}
            <Link href="/login" className="font-medium text-indigo-900">
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
