'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useLanguage } from '@/context/LanguageContext';

type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'promoted';

type SubmissionRow = {
  id: string;
  sector: string;
  difficulty: string;
  prompt_id: string;
  prompt_en: string;
  context_id: string;
  correct_option: string;
  contributor_display_name: string;
  ai_screen_result: { safe: boolean; reason: string } | null;
  status: SubmissionStatus;
  created_at: string;
};

const STATUS_FILTERS: SubmissionStatus[] = ['pending', 'approved', 'rejected', 'promoted'];

export default function AdminContributionsPage() {
  const { language } = useLanguage();
  const router = useRouter();

  const [accessState, setAccessState] = useState<'checking' | 'denied' | 'granted'>('checking');
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus>('pending');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [debugError, setDebugError] = useState<string | null>(null);

  const t = {
    title: language === 'id' ? 'Kontribusi Soal' : 'Question Contributions',
    denied:
      language === 'id'
        ? 'Kamu tidak punya akses ke halaman ini.'
        : "You don't have access to this page.",
    empty: language === 'id' ? 'Tidak ada soal di sini.' : 'No submissions here.',
    statusLabels: {
      pending: language === 'id' ? 'Menunggu' : 'Pending',
      approved: language === 'id' ? 'Disetujui' : 'Approved',
      rejected: language === 'id' ? 'Ditolak' : 'Rejected',
      promoted: language === 'id' ? 'Dinaikkan' : 'Promoted',
    } as Record<SubmissionStatus, string>,
    by: language === 'id' ? 'oleh' : 'by',
    aiVerdict: language === 'id' ? 'Hasil AI screening' : 'AI screening result',
    approve: language === 'id' ? 'Setujui' : 'Approve',
    reject: language === 'id' ? 'Tolak' : 'Reject',
    promote: language === 'id' ? 'Naikkan ke Soal Utama' : 'Promote to Main Pool',
  };

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const { data: userData, error: userErr } = await supabase.auth.getUser();
        if (userErr) throw userErr;

        if (!userData.user) {
          router.push('/login');
          return;
        }

        const { data: profile, error: profileErr } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userData.user.id)
          .single();
        if (profileErr) throw profileErr;

        setAccessState(profile?.role === 'admin' ? 'granted' : 'denied');
      } catch (err: any) {
        setDebugError(err?.message ?? String(err));
        setAccessState('denied');
      }
    };

    checkAccess();
  }, [router]);

  useEffect(() => {
    if (accessState !== 'granted') return;

    const loadSubmissions = async () => {
      setLoading(true);
      const res = await fetch(`/api/admin/contributions?status=${statusFilter}`);
      const json = await res.json();
      setSubmissions(res.ok ? json.data : []);
      setLoading(false);
    };

    loadSubmissions();
  }, [accessState, statusFilter]);

  const handleDecide = async (id: string, decision: 'approved' | 'rejected') => {
    setUpdatingId(id);
    const res = await fetch(`/api/admin/contributions/${id}/decide`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision }),
    });
    if (res.ok) {
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
    }
    setUpdatingId(null);
  };

  const handlePromote = async (id: string) => {
    setUpdatingId(id);
    const res = await fetch(`/api/admin/contributions/${id}/promote`, { method: 'POST' });
    if (res.ok) {
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
    }
    setUpdatingId(null);
  };

  if (accessState === 'checking') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-base-bg">
        <p className="text-sm text-text-muted">…</p>
      </main>
    );
  }

  if (accessState === 'denied') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-base-bg px-6 text-center">
        <p className="text-sm text-status-incorrect">{t.denied}</p>
        {debugError && <p className="mt-2 text-xs text-text-muted">Debug: {debugError}</p>}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-base-bg px-6 py-8 sm:px-10">
      <div className="mx-auto flex max-w-2xl flex-col gap-5">
        <h1 className="text-xl font-semibold text-text-primary">{t.title}</h1>

        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={[
                'rounded-full px-4 py-1.5 text-xs font-medium transition',
                statusFilter === status
                  ? 'bg-accent text-base-surface'
                  : 'bg-base-surface text-text-secondary shadow-floating-sm',
              ].join(' ')}
            >
              {t.statusLabels[status]}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-text-muted">…</p>
        ) : submissions.length === 0 ? (
          <p className="text-sm text-text-muted">{t.empty}</p>
        ) : (
          <div className="flex flex-col gap-3">
            {submissions.map((sub) => (
              <div key={sub.id} className="rounded-floating bg-base-surface shadow-floating-sm p-5">
                <div className="flex items-center gap-2">
                  <span className="inline-block rounded-full bg-accent-soft px-2.5 py-0.5 text-[10px] font-medium text-accent">
                    {sub.sector}
                  </span>
                  <span className="text-[10px] text-text-muted">{sub.difficulty}</span>
                </div>

                <p className="mt-2 text-sm text-text-primary">{sub.context_id}</p>
                <p className="mt-1 text-sm font-medium text-text-primary">{sub.prompt_id}</p>
                <p className="mt-1 text-xs text-text-muted">
                  {language === 'id' ? 'Jawaban benar' : 'Correct answer'}: {sub.correct_option}
                </p>

                <p className="mt-2 text-[10px] text-text-muted">
                  {t.by} {sub.contributor_display_name}
                </p>

                {sub.ai_screen_result && (
                  <div className="mt-3 rounded-floating bg-base-bg px-3.5 py-2.5">
                    <p className="text-xs font-semibold text-text-primary">{t.aiVerdict}</p>
                    <p className="mt-1 text-xs text-text-secondary">
                      {sub.ai_screen_result.safe ? '✅' : '⚠️'} {sub.ai_screen_result.reason}
                    </p>
                  </div>
                )}

                <div className="mt-3 flex gap-2 justify-end flex-wrap">
                  {statusFilter === 'pending' && (
                    <>
                      <button
                        type="button"
                        disabled={updatingId === sub.id}
                        onClick={() => handleDecide(sub.id, 'rejected')}
                        className="rounded-full bg-base-bg px-3.5 py-1.5 text-xs font-medium text-text-secondary active:scale-95"
                      >
                        {t.reject}
                      </button>
                      <button
                        type="button"
                        disabled={updatingId === sub.id}
                        onClick={() => handleDecide(sub.id, 'approved')}
                        className="rounded-full bg-status-correctSoft px-3.5 py-1.5 text-xs font-medium text-status-correct active:scale-95"
                      >
                        {t.approve}
                      </button>
                    </>
                  )}

                  {statusFilter === 'approved' && (
                    <button
                      type="button"
                      disabled={updatingId === sub.id}
                      onClick={() => handlePromote(sub.id)}
                      className="rounded-full bg-accent px-3.5 py-1.5 text-xs font-medium text-base-surface active:scale-95"
                    >
                      {t.promote}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
                }
