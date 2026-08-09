'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '../../../lib/supabase/client';
import { useLanguage } from '../../../context/LanguageContext';

export default function ResetPasswordPage(): JSX.Element {
  const router = useRouter();
  const { language } = useLanguage();
  const supabase = getSupabaseBrowserClient();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'error' | 'mismatch'>('idle');

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();

    if (password !== confirmPassword) {
      setStatus('mismatch');
      return;
    }

    setStatus('saving');

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setStatus('error');
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  const heading = language === 'id' ? 'Buat kata sandi baru' : 'Set new password';
  const subtitle =
    language === 'id'
      ? 'Masukkan kata sandi baru untuk akunmu'
      : 'Enter a new password for your account';
  const passwordPlaceholder = language === 'id' ? 'Kata sandi baru' : 'New password';
  const confirmPlaceholder = language === 'id' ? 'Ulangi kata sandi' : 'Confirm password';
  const submitLabel = language === 'id' ? 'Simpan kata sandi' : 'Save password';
  const savingLabel = language === 'id' ? 'Menyimpan...' : 'Saving...';
  const mismatchMessage =
    language === 'id' ? 'Kata sandi tidak cocok.' : 'Passwords do not match.';
  const errorMessage =
    language === 'id'
      ? 'Gagal menyimpan kata sandi. Coba lagi atau minta tautan baru.'
      : 'Failed to save password. Try again or request a new link.';

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-sm">
        <p className="mb-6 text-center font-mono text-2xl font-semibold text-slate-900">
          QuizMe
        </p>

        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-8 shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900">{heading}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
            <input
              type="password"
              placeholder={passwordPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-400"
            />

            <input
              type="password"
              placeholder={confirmPlaceholder}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
              required
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-400"
            />

            {status === 'mismatch' ? (
              <p className="text-sm text-rose-500">{mismatchMessage}</p>
            ) : null}
            {status === 'error' ? (
              <p className="text-sm text-rose-500">{errorMessage}</p>
            ) : null}

            <button
              type="submit"
              disabled={status === 'saving'}
              className="rounded-xl bg-indigo-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-indigo-800 disabled:opacity-60"
            >
              {status === 'saving' ? savingLabel : submitLabel}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
