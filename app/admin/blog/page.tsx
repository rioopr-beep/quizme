'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../../context/LanguageContext';
import { getSupabaseBrowserClient } from '../../../lib/supabase/client';

const DEFAULT_AUTHOR = 'Rioopr';

export default function AdminBlogPage(): JSX.Element {
  const router = useRouter();
  const { language } = useLanguage();

  const [slug, setSlug] = useState('');
  const [sector, setSector] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const [idTitle, setIdTitle] = useState('');
  const [idExcerpt, setIdExcerpt] = useState('');
  const [idContent, setIdContent] = useState('');

  const [enTitle, setEnTitle] = useState('');
  const [enExcerpt, setEnExcerpt] = useState('');
  const [enContent, setEnContent] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  function resetForm() {
    setSlug('');
    setSector('');
    setIdTitle('');
    setIdExcerpt('');
    setIdContent('');
    setEnTitle('');
    setEnExcerpt('');
    setEnContent('');
  }

  async function handleSubmit(): Promise<void> {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setSubmitError('Sesi login habis, silakan login ulang.');
        return;
      }

      const response = await fetch('/api/admin/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          slug,
          sector,
          date,
          author: DEFAULT_AUTHOR,
          id_title: idTitle,
          id_excerpt: idExcerpt,
          id_content: idContent,
          en_title: enTitle,
          en_excerpt: enExcerpt,
          en_content: enContent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSubmitError(data.error ?? 'Terjadi kesalahan saat submit.');
        return;
      }

      setSubmitSuccess(true);
      resetForm();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Gagal menghubungi server.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass =
    'w-full rounded-floating border border-base-border bg-base-surface p-3 text-sm text-text-primary shadow-floating-sm focus:outline-none focus:ring-2 focus:ring-accent';
  const labelClass = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-text-muted';

  return (
    <main className="min-h-screen bg-base-bg px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-2xl">
        <button
          type="button"
          onClick={() => router.push('/admin')}
          className="mb-4 text-sm text-text-muted transition active:scale-95 hover:text-text-secondary"
        >
          ← Kembali
        </button>

        <h1 className="text-xl font-semibold text-text-primary mb-6">Tambah Artikel Blog</h1>

        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Slug</label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className={inputClass}
              placeholder="kenapa-langit-biru"
            />
          </div>
          <div>
            <label className={labelClass}>Sector</label>
            <input
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className={inputClass}
              placeholder="biologi"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className={labelClass}>Tanggal</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="mb-6 rounded-floating bg-base-surface shadow-floating-sm p-4">
          <h2 className="text-sm font-semibold text-text-primary mb-3">🇮🇩 Versi Indonesia</h2>
          <div className="mb-3">
            <label className={labelClass}>Judul</label>
            <input value={idTitle} onChange={(e) => setIdTitle(e.target.value)} className={inputClass} />
          </div>
          <div className="mb-3">
            <label className={labelClass}>Excerpt</label>
            <input value={idExcerpt} onChange={(e) => setIdExcerpt(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Isi Artikel (Markdown)</label>
            <textarea
              value={idContent}
              onChange={(e) => setIdContent(e.target.value)}
              rows={10}
              className={`${inputClass} font-mono text-xs`}
            />
          </div>
        </div>

        <div className="mb-6 rounded-floating bg-base-surface shadow-floating-sm p-4">
          <h2 className="text-sm font-semibold text-text-primary mb-3">🇬🇧 English Version</h2>
          <div className="mb-3">
            <label className={labelClass}>Title</label>
            <input value={enTitle} onChange={(e) => setEnTitle(e.target.value)} className={inputClass} />
          </div>
          <div className="mb-3">
            <label className={labelClass}>Excerpt</label>
            <input value={enExcerpt} onChange={(e) => setEnExcerpt(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Content (Markdown)</label>
            <textarea
              value={enContent}
              onChange={(e) => setEnContent(e.target.value)}
              rows={10}
              className={`${inputClass} font-mono text-xs`}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !slug || !idTitle || !enTitle}
          className="w-full rounded-floating bg-accent px-4 py-3 text-sm font-medium text-base-surface shadow-floating-sm transition active:scale-95 hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? 'Menyimpan…' : 'Simpan Artikel'}
        </button>

        {submitError ? (
          <div className="mt-4 rounded-floating bg-status-incorrectSoft p-4 text-sm text-status-incorrect">
            {submitError}
          </div>
        ) : null}

        {submitSuccess ? (
          <div className="mt-4 rounded-floating bg-status-correctSoft p-4 text-sm text-status-correct">
            Artikel berhasil disimpan! (versi ID & EN sekaligus)
          </div>
        ) : null}
      </div>
    </main>
  );
        }
