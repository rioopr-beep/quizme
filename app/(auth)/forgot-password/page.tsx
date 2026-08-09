'use client';

import { useState } from 'react';
import { getSupabaseBrowserClient } from '../../../lib/supabase/client';
import { useLanguage } from '../../../context/LanguageContext';

export default function ForgotPasswordPage(): JSX.Element {
  const { language } = useLanguage();
  const supabase = getSupabaseBrowserClient();

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setStatus('sending');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setStatus(error ? 'error' : 'sent');
  }

  const heading = language === 'id' ? 'Lupa kata sandi' : 'Forgot password';
  const subtitle =
    language === 'id'
      ? 'Masukkan email, kami kirim tautan untuk reset'
      : 'Enter your email, we will send a reset link';
  const emailPlaceholder = language === 'id' ? 'nama@email.com' : 'name@email.com';
  const submitLabel = language === 'id' ? 'Kirim tautan' : 'Send link';
  const sendingLabel = language === 'id' ? 'Mengirim...' : 'Sending...';
  const sentMessage =
    language === 'id'
      ? 'Tautan reset sudah dikirim. Cek email kamu.'
      : 'Reset link sent. Check your email.';
  const errorMessage =
    language === 'id'
      ? 'Gagal mengirim tautan. Periksa email yang kamu masukkan.'
      : 'Failed to send link. Check the email you entered.';

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-sm">
        <p className="mb-6 text-center font-mono text-2xl font-semibold text-slate-900">
          QuizMe
        </p>

        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-8 shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900">{heading}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>

          {status === 'sent' ? (
            <p className="mt-6 rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
              {sentMessage}
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
              <input
                type="email"
                placeholder={emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-400"
              />

              {status === 'error' ? (
                <p className="text-sm text-rose-500">{errorMessage}</p>
              ) : null}

              <button
                type="submit"
                disabled={status === 'sending'}
                className="rounded-xl bg-indigo-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-indigo-800 disabled:opacity-60"
              >
                {status === 'sending' ? sendingLabel : submitLabel}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
