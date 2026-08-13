'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '../../../lib/supabase/client';
import { useLanguage } from '../../../context/LanguageContext';

type ReportStatus = 'pending' | 'reviewed' | 'dismissed';

type ReportRow = {
  id: string;
  question_id: string;
  reason: string;
  note: string | null;
  status: ReportStatus;
  created_at: string;
  reporterName: string;
  questionPrompt: string | null;
  sector: string | null;
};

const REASON_LABELS: Record<string, { id: string; en: string }> = {
  jawaban_salah: { id: 'Jawaban salah', en: 'Wrong answer' },
  soal_membingungkan: { id: 'Soal membingungkan', en: 'Confusing question' },
  sumber_tidak_valid: { id: 'Sumber tidak valid', en: 'Invalid source' },
  lainnya: { id: 'Lainnya', en: 'Other' },
};

const STATUS_FILTERS: ReportStatus[] = ['pending', 'reviewed', 'dismissed'];

export default function AdminReportsPage() {
  const { language } = useLanguage();
  const router = useRouter();

  const [accessState, setAccessState] = useState<'checking' | 'denied' | 'granted'>(
    'checking'
  );
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ReportStatus>('pending');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const t = {
    title: language === 'id' ? 'Laporan Soal' : 'Question Reports',
    denied:
      language === 'id'
        ? 'Kamu tidak punya akses ke halaman ini.'
        : "You don't have access to this page.",
    empty:
      language === 'id' ? 'Tidak ada laporan di sini.' : 'No reports here.',
    statusLabels: {
      pending: language === 'id' ? 'Menunggu' : 'Pending',
      reviewed: language === 'id' ? 'Ditinjau' : 'Reviewed',
      dismissed: language === 'id' ? 'Ditolak' : 'Dismissed',
    } as Record<ReportStatus, string>,
    markReviewed: language === 'id' ? 'Tandai Selesai' : 'Mark Reviewed',
    dismiss: language === 'id' ? 'Tolak' : 'Dismiss',
    viewQuestion: language === 'id' ? 'Lihat Soal' : 'View Question',
    reportedBy: language === 'id' ? 'Dilaporkan oleh' : 'Reported by',
  };

  // Cek akses admin
  useEffect(() => {
    const checkAccess = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userData.user.id)
        .single();

      if (profile?.role === 'admin') {
        setAccessState('granted');
      } else {
        setAccessState('denied');
      }
    };

    checkAccess();
  }, [router]);

  // Load reports (baru dijalankan kalau akses granted)
  useEffect(() => {
    if (accessState !== 'granted') return;

    const loadReports = async () => {
      setLoading(true);
      const supabase = getSupabaseBrowserClient();

      const { data, error } = await supabase
        .from('question_reports')
        .select(
          'id, question_id, reason, note, status, created_at, profiles(name), questions(prompt_id, sector)'
        )
        .eq('status', statusFilter)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setReports(
          data.map((row: any) => ({
            id: row.id,
            question_id: row.question_id,
            reason: row.reason,
            note: row.note,
            status: row.status,
            created_at: row.created_at,
            reporterName: row.profiles?.name ?? '—',
            questionPrompt: row.questions?.prompt_id ?? null,
            sector: row.questions?.sector ?? null,
          }))
        );
      }
      setLoading(false);
    };

    loadReports();
  }, [accessState, statusFilter]);

  const updateStatus = async (reportId: string, newStatus: ReportStatus) => {
    setUpdatingId(reportId);
    const supabase = getSupabaseBrowserClient();

    const { error } = await supabase
      .from('question_reports')
      .update({ status: newStatus })
      .eq('id', reportId);

    if (!error) {
      setReports((prev) => prev.filter((r) => r.id !== reportId));
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
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-base-bg px-6 py-8 sm:px-10">
      <div className="mx-auto flex max-w-2xl flex-col gap-5">
        <h1 className="text-xl font-semibold text-text-primary">{t.title}</h1>

        {/* Filter status */}
        <div className="flex gap-2">
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
        ) : reports.length === 0 ? (
          <p className="text-sm text-text-muted">{t.empty}</p>
        ) : (
          <div className="flex flex-col gap-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className="rounded-floating bg-base-surface shadow-floating-sm p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="inline-block rounded-full bg-accent-soft px-2.5 py-0.5 text-[10px] font-medium text-accent">
                      {report.sector ?? '—'}
                    </span>
                    <p className="mt-2 text-sm text-text-primary line-clamp-2">
                      {report.questionPrompt ?? '—'}
                    </p>
                  </div>
                </div>

                <div className="mt-3 rounded-floating bg-base-bg px-3.5 py-2.5">
                  <p className="text-xs font-semibold text-text-primary">
                    {REASON_LABELS[report.reason]?.[language] ?? report.reason}
                  </p>
                  {report.note && (
                    <p className="mt-1 text-xs text-text-secondary">{report.note}</p>
                  )}
                  <p className="mt-2 text-[10px] text-text-muted">
                    {t.reportedBy}: {report.reporterName}
                  </p>
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => router.push(`/quiz/review/${report.question_id}`)}
                    className="text-xs font-medium text-accent"
                  >
                    {t.viewQuestion}
                  </button>
                  <div className="flex-1" />
                  {statusFilter === 'pending' && (
                    <>
                      <button
                        type="button"
                        disabled={updatingId === report.id}
                        onClick={() => updateStatus(report.id, 'dismissed')}
                        className="rounded-full bg-base-bg px-3.5 py-1.5 text-xs font-medium text-text-secondary active:scale-95"
                      >
                        {t.dismiss}
                      </button>
                      <button
                        type="button"
                        disabled={updatingId === report.id}
                        onClick={() => updateStatus(report.id, 'reviewed')}
                        className="rounded-full bg-status-correctSoft px-3.5 py-1.5 text-xs font-medium text-status-correct active:scale-95"
                      >
                        {t.markReviewed}
                      </button>
                    </>
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
