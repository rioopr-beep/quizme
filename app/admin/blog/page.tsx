'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../../context/LanguageContext';
import { getSupabaseBrowserClient } from '../../../lib/supabase/client';

const DEFAULT_AUTHOR = 'Rioopr';

interface DraftPair {
  slug: string;
  sector: string;
  date: string;
  author: string;
  id_title: string;
  id_excerpt: string;
  id_content: string;
  en_title: string;
  en_excerpt: string;
  en_content: string;
}

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

  const [isReindexing, setIsReindexing] = useState(false);
  const [reindexResult, setReindexResult] = useState<string | null>(null);
  const [reindexError, setReindexError] = useState<string | null>(null);

  // --- State antrian draft ---
  const [drafts, setDrafts] = useState<DraftPair[]>([]);
  const [isLoadingDrafts, setIsLoadingDrafts] = useState(false);
  const [draftsError, setDraftsError] = useState<string | null>(null);
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const [publishingSlug, setPublishingSlug] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

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

  const fetchDrafts = useCallback(async () => {
    setIsLoadingDrafts(true);
    setDraftsError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setDraftsError('Sesi login habis, silakan login ulang.');
        return;
      }

      const response = await fetch('/api/admin/blog/drafts', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setDraftsError(data.error ?? 'Gagal mengambil daftar antrian.');
        return;
      }

      setDrafts(data.drafts ?? []);
    } catch (error) {
      setDraftsError(error instanceof Error ? error.message : 'Gagal menghubungi server.');
    } finally {
      setIsLoadingDrafts(false);
    }
  }, []);

  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

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
      fetchDrafts(); // Refresh antrian, artikel baru bakal muncul di sini
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Gagal menghubungi server.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePublish(publishSlug: string): Promise<void> {
    setPublishingSlug(publishSlug);
    setPublishError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setPublishError('Sesi login habis, silakan login ulang.');
        return;
      }

      const response = await fetch('/api/admin/blog/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ slug: publishSlug }),
      });

      const data = await response.json();

      if (!response.ok) {
        setPublishError(data.error ?? 'Terjadi kesalahan saat publish.');
        return;
      }

      // Hapus dari antrian lokal biar langsung ilang tanpa nunggu refetch
      setDrafts((prev) => prev.filter((d) => d.slug !== publishSlug));
    } catch (error) {
      setPublishError(error instanceof Error ? error.message : 'Gagal menghubungi server.');
    } finally {
      setPublishingSlug(null);
    }
  }

  async function handleReindex(): Promise<void> {
    setIsReindexing(true);
    setReindexError(null);
    setReindexResult(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setReindexError('Sesi login habis, silakan login ulang.');
        return;
      }

      const response = await fetch('/api/admin/blog/reindex', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setReindexError(data.error ?? 'Terjadi kesalahan saat reindex.');
        return;
      }

      setReindexResult(`Berhasil submit ${data.count} URL ke IndexNow.`);
    } catch (error) {
      setReindexError(error instanceof Error ? error.message : 'Gagal menghubungi server.');
    } finally {
      setIsReindexing(false);
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
            Artikel berhasil disimpan sebagai draft! Cek di antrian di bawah sebelum publish.
          </div>
        ) : null}

        {/* --- Section Antrian Draft --- */}
        <div className="mt-10 border-t border-base-border pt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary">
              Antrian Draft {drafts.length > 0 ? `(${drafts.length})` : ''}
            </h2>
            <button
              type="button"
              onClick={fetchDrafts}
              disabled={isLoadingDrafts}
              className="text-xs text-text-muted underline hover:text-text-secondary disabled:opacity-50"
            >
              {isLoadingDrafts ? 'Memuat…' : 'Refresh'}
            </button>
          </div>

          {draftsError ? (
            <div className="mb-3 rounded-floating bg-status-incorrectSoft p-4 text-sm text-status-incorrect">
              {draftsError}
            </div>
          ) : null}

          {publishError ? (
            <div className="mb-3 rounded-floating bg-status-incorrectSoft p-4 text-sm text-status-incorrect">
              {publishError}
            </div>
          ) : null}

          {!isLoadingDrafts && drafts.length === 0 ? (
            <p className="text-sm text-text-muted">Nggak ada draft yang nunggu direview.</p>
          ) : null}

          <div className="space-y-3">
            {drafts.map((draft) => {
              const isExpanded = expandedSlug === draft.slug;
              const isPublishing = publishingSlug === draft.slug;

              return (
                <div
                  key={draft.slug}
                  className="rounded-floating bg-base-surface shadow-floating-sm p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-text-muted mb-1">
                        {draft.slug} · {draft.sector} · {draft.date}
                      </p>
                      <p className="text-sm font-medium text-text-primary truncate">
                        🇮🇩 {draft.id_title || '(judul ID kosong)'}
                      </p>
                      <p className="text-sm text-text-secondary truncate">
                        🇬🇧 {draft.en_title || '(judul EN kosong)'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setExpandedSlug(isExpanded ? null : draft.slug)}
                      className="flex-1 rounded-floating border border-base-border bg-base-bg px-3 py-2 text-xs font-medium text-text-primary transition active:scale-95 hover:opacity-90"
                    >
                      {isExpanded ? 'Sembunyikan' : 'Lihat Detail'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePublish(draft.slug)}
                      disabled={isPublishing}
                      className="flex-1 rounded-floating bg-accent px-3 py-2 text-xs font-medium text-base-surface transition active:scale-95 hover:opacity-90 disabled:opacity-50"
                    >
                      {isPublishing ? 'Publishing…' : 'Publish'}
                    </button>
                  </div>

                  {isExpanded ? (
                    <div className="mt-4 space-y-4 border-t border-base-border pt-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted mb-1">
                          🇮🇩 Excerpt
                        </p>
                        <p className="text-sm text-text-primary whitespace-pre-wrap">{draft.id_excerpt}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted mb-1">
                          🇮🇩 Isi
                        </p>
                        <p className="text-sm text-text-primary whitespace-pre-wrap font-mono text-xs max-h-64 overflow-y-auto">
                          {draft.id_content}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted mb-1">
                          🇬🇧 Excerpt
                        </p>
                        <p className="text-sm text-text-primary whitespace-pre-wrap">{draft.en_excerpt}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted mb-1">
                          🇬🇧 Content
                        </p>
                        <p className="text-sm text-text-primary whitespace-pre-wrap font-mono text-xs max-h-64 overflow-y-auto">
                          {draft.en_content}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-10 border-t border-base-border pt-6">
          <h2 className="text-sm font-semibold text-text-primary mb-2">Reindex Artikel Lama</h2>
          <p className="text-xs text-text-muted mb-3">
            Submit ulang semua slug artikel yang sudah ada ke IndexNow (Bing, Yandex, dll). Cukup dijalankan sekali.
          </p>
          <button
            type="button"
            onClick={handleReindex}
            disabled={isReindexing}
            className="w-full rounded-floating border border-base-border bg-base-surface px-4 py-3 text-sm font-medium text-text-primary shadow-floating-sm transition active:scale-95 hover:opacity-90 disabled:opacity-50"
          >
            {isReindexing ? 'Mengirim…' : 'Reindex Semua Artikel Lama'}
          </button>

          {reindexError ? (
            <div className="mt-4 rounded-floating bg-status-incorrectSoft p-4 text-sm text-status-incorrect">
              {reindexError}
            </div>
          ) : null}

          {reindexResult ? (
            <div className="mt-4 rounded-floating bg-status-correctSoft p-4 text-sm text-status-correct">
              {reindexResult}
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
        }
