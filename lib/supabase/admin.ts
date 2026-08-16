'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../../context/LanguageContext';
import { getSupabaseBrowserClient } from '../../../lib/supabase/client';

type ImportTarget = 'sector' | 'school';

interface ValidationError {
  row: number;
  message: string;
}

interface DbError {
  row: number;
  success: boolean;
  message?: string;
}

interface ImportResponse {
  totalRows: number;
  successCount: number;
  validationErrorCount: number;
  dbErrorCount: number;
  validationErrors: ValidationError[];
  dbErrors: DbError[];
  error?: string;
}

export default function AdminImportPage(): JSX.Element {
  const router = useRouter();
  const { language } = useLanguage();

  const [target, setTarget] = useState<ImportTarget>('school');
  const [raw, setRaw] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<ImportResponse | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(): Promise<void> {
    if (!raw.trim()) return;

    setIsSubmitting(true);
    setResult(null);
    setSubmitError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setSubmitError(
          language === 'id' ? 'Sesi login habis, silakan login ulang.' : 'Session expired, please log in again.',
        );
        return;
      }

      const response = await fetch('/api/admin/import-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ target, raw }),
      });

      const data: ImportResponse = await response.json();

      if (!response.ok) {
        setSubmitError(data.error ?? 'Terjadi kesalahan saat import.');
        return;
      }

      setResult(data);
      if (data.successCount > 0) {
        setRaw('');
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Gagal menghubungi server.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const copy = {
    title: language === 'id' ? 'Import Soal' : 'Import Questions',
    back: language === 'id' ? '← Kembali' : '← Back',
    targetLabel: language === 'id' ? 'Target tabel' : 'Target table',
    targetSector: language === 'id' ? 'Sector biasa (questions)' : 'Regular sector (questions)',
    targetSchool: language === 'id' ? 'Kolam Sekolah (school_questions)' : 'School Pool (school_questions)',
    textareaLabel: language === 'id' ? 'Paste JSON array atau SQL INSERT INTO di sini' : 'Paste JSON array or SQL INSERT INTO here',
    submit: language === 'id' ? 'Validasi & Import' : 'Validate & Import',
    submitting: language === 'id' ? 'Memproses…' : 'Processing…',
    resultTitle: language === 'id' ? 'Hasil Import' : 'Import Result',
    totalRows: language === 'id' ? 'Total baris terbaca' : 'Total rows parsed',
    success: language === 'id' ? 'Berhasil masuk' : 'Successfully inserted',
    validationErrors: language === 'id' ? 'Gagal validasi (tidak sempat insert)' : 'Failed validation (not inserted)',
    dbErrors: language === 'id' ? 'Gagal insert ke database' : 'Failed database insert',
  };

  return (
    <main className="min-h-screen bg-base-bg px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() => router.push('/admin')}
          className="mb-4 text-sm text-text-muted transition active:scale-95 hover:text-text-secondary"
        >
          {copy.back}
        </button>

        <h1 className="text-xl font-semibold text-text-primary mb-6">{copy.title}</h1>

        <div className="mb-4">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-muted">
            {copy.targetLabel}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setTarget('school')}
              className={`rounded-floating p-3 text-sm font-medium transition active:scale-95 ${
                target === 'school'
                  ? 'bg-accent text-base-surface'
                  : 'bg-base-surface text-text-secondary shadow-floating-sm'
              }`}
            >
              {copy.targetSchool}
            </button>
            <button
              type="button"
              onClick={() => setTarget('sector')}
              className={`rounded-floating p-3 text-sm font-medium transition active:scale-95 ${
                target === 'sector'
                  ? 'bg-accent text-base-surface'
                  : 'bg-base-surface text-text-secondary shadow-floating-sm'
              }`}
            >
              {copy.targetSector}
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-muted">
            {copy.textareaLabel}
          </label>
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={14}
            className="w-full rounded-floating border border-base-border bg-base-surface p-4 font-mono text-xs text-text-primary shadow-floating-sm focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder='[{"subject": "smp_kimia", ...}] atau INSERT INTO school_questions (...) VALUES (...);'
          />
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !raw.trim()}
          className="w-full rounded-floating bg-accent px-4 py-3 text-sm font-medium text-base-surface shadow-floating-sm transition active:scale-95 hover:opacity-90 disabled:opacity-50 disabled:active:scale-100"
        >
          {isSubmitting ? copy.submitting : copy.submit}
        </button>

        {submitError ? (
          <div className="mt-4 rounded-floating bg-status-incorrectSoft p-4 text-sm text-status-incorrect">
            {submitError}
          </div>
        ) : null}

        {result ? (
          <section className="mt-6 rounded-floating bg-base-surface shadow-floating-sm p-6">
            <h2 className="text-sm font-semibold text-text-primary mb-4">{copy.resultTitle}</h2>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-floating bg-base-bg p-3">
                <p className="text-lg font-semibold text-text-primary">{result.totalRows}</p>
                <p className="text-[10px] text-text-muted">{copy.totalRows}</p>
              </div>
              <div className="rounded-floating bg-status-correctSoft p-3">
                <p className="text-lg font-semibold text-status-correct">{result.successCount}</p>
                <p className="text-[10px] text-status-correct">{copy.success}</p>
              </div>
              <div className="rounded-floating bg-status-incorrectSoft p-3">
                <p className="text-lg font-semibold text-status-incorrect">
                  {result.validationErrorCount + result.dbErrorCount}
                </p>
                <p className="text-[10px] text-status-incorrect">
                  {language === 'id' ? 'Gagal' : 'Failed'}
                </p>
              </div>
            </div>

            {result.validationErrors.length > 0 ? (
              <div className="mt-4">
                <p className="mb-2 text-xs font-semibold text-text-muted">{copy.validationErrors}</p>
                <ul className="flex flex-col gap-1">
                  {result.validationErrors.map((err, idx) => (
                    <li key={idx} className="rounded-floating bg-base-bg p-2 text-xs text-text-secondary">
                      <span className="font-semibold text-status-incorrect">Baris {err.row}:</span> {err.message}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {result.dbErrors.length > 0 ? (
              <div className="mt-4">
                <p className="mb-2 text-xs font-semibold text-text-muted">{copy.dbErrors}</p>
                <ul className="flex flex-col gap-1">
                  {result.dbErrors.map((err, idx) => (
                    <li key={idx} className="rounded-floating bg-base-bg p-2 text-xs text-text-secondary">
                      <span className="font-semibold text-status-incorrect">Baris {err.row}:</span> {err.message}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        ) : null}
      </div>
    </main>
  );
}
