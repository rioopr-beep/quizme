'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

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
      options: {
        data: { name },
      },
    });

    if (error) {
      setLoading(false);
      setError('Gagal mendaftar. Coba email lain atau kata sandi lebih kuat.');
      return;
    }

    // Buat baris di tabel profiles begitu user berhasil signup
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
    <form onSubmit={handleSignup}>
      <h1>Buat akun</h1>

      <input
        type="text"
        placeholder="Nama kamu"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <input
        type="email"
        placeholder="nama@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Kata sandi (min. 6 karakter)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        minLength={6}
        required
      />

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? 'Memproses...' : 'Daftar'}
      </button>
    </form>
  );
}
