'use client';

import { useState } from 'react';
import { getSupabaseBrowserClient } from '../lib/supabase/client';
import { useLanguage } from '../context/LanguageContext';

type Props = {
  questionId: string;
};

const REASON_KEYS = [
  'jawaban_salah',
  'soal_membingungkan',
  'sumber_tidak_valid',
  'lainnya',
] as const;

type ReasonKey = (typeof REASON_KEYS)[number];

const REASON_LABELS: Record<ReasonKey, { id: string; en: string }> = {
  jawaban_salah: { id: 'Jawaban salah', en: 'Wrong answer' },
  soal_membingungkan: { id: 'Soal membingungkan', en: 'Confusing question' },
  sumber_tidak_valid: { id: 'Sumber tidak valid', en: 'Invalid source' },
  lainnya: { id: 'Lainnya', en: 'Other' },
};

export default function ReportQuestionButton({ questionId }: Props) {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState<ReasonKey | null>(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  const t = {
    reportLabel: language === 'id' ? 'Laporkan soal' : 'Report question',
    title: language === 'id' ? 'Ada yang salah?' : 'Something wrong?',
    notePlaceholder:
      language === 'id' ? 'Catatan tambahan (opsional)' : 'Additional note (optional)',
    submit: language === 'id' ? 'Kirim Laporan' : 'Submit Report',
    cancel: language === 'id' ? 'Batal' : 'Cancel',
    thanks:
      language === 'id'
        ? 'Terima kasih, laporanmu sudah kami terima.'
        : 'Thanks, your report has been received.',
    loginPrompt:
      language === 'id' ? 'Login dulu untuk melapor' : 'Log in to submit a report',
  };

  const openModal = async () => {
    const supabase = getSupabaseBrowserClient();
    const { data } = await supabase.auth.getUser();
    setIsLoggedIn(!!data.user);
    setIsOpen(true);
  };

  const handleSubmit = async () => {
    if (!reason || submitting) return;
    setSubmitting(true);

    const supabase = getSupabaseBrowserClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from('question_reports').insert({
      question_id: questionId,
      user_id: userData.user.id,
      reason,
      note: note.trim() || null,
    });

    setSubmitting(false);
    if (!error) {
      setSubmitted(true);
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    setReason(null);
    setNote('');
    setSubmitted(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="flex items-center gap-1.5 text-xs text-text-muted hover:text-status-incorrect transition"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
          <line x1="4" y1="22" x2="4" y2="15" />
        </svg>
        {t.reportLabel}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 px-4 pb-4 sm:pb-0">
          <div className="w-full max-w-sm rounded-floating bg-base-surface shadow-floating p-5">
            {submitted ? (
              <div className="text-center py-4">
                <p className="text-sm text-status-correct font-medium">{t.thanks}</p>
                <button
                  type="button"
                  onClick={closeModal}
                  className="mt-4 rounded-full bg-accent px-5 py-2 text-xs font-medium text-base-surface active:scale-95"
                >
                  OK
                </button>
              </div>
            ) : isLoggedIn === false ? (
              <div className="text-center py-4">
                <p className="text-sm text-text-secondary">{t.loginPrompt}</p>
                <button
                  type="button"
                  onClick={closeModal}
                  className="mt-4 rounded-full bg-base-bg px-5 py-2 text-xs font-medium text-text-secondary active:scale-95"
                >
                  {t.cancel}
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-sm font-semibold text-text-primary mb-3">
                  {t.title}
                </h3>

                <div className="flex flex-col gap-2 mb-3">
                  {REASON_KEYS.map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setReason(key)}
                      className={[
                        'text-left rounded-floating px-3.5 py-2.5 text-sm transition border',
                        reason === key
                          ? 'border-accent bg-accent-soft text-text-primary'
                          : 'border-base-border bg-base-bg text-text-secondary',
                      ].join(' ')}
                    >
                      {REASON_LABELS[key][language]}
                    </button>
                  ))}
                </div>

                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={t.notePlaceholder}
                  rows={2}
                  className="w-full rounded-floating bg-base-bg px-3.5 py-2.5 text-sm text-text-primary outline-none resize-none mb-4"
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 rounded-full bg-base-bg px-4 py-2.5 text-xs font-medium text-text-secondary active:scale-95"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!reason || submitting}
                    className="flex-1 rounded-full bg-status-incorrect px-4 py-2.5 text-xs font-medium text-base-surface active:scale-95 disabled:opacity-50"
                  >
                    {t.submit}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
  }
