'use client';

interface ExitConfirmModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  language: 'id' | 'en';
}

export default function ExitConfirmModal({
  isOpen,
  onCancel,
  onConfirm,
  language,
}: ExitConfirmModalProps): JSX.Element | null {
  if (!isOpen) return null;

  const title = language === 'id' ? 'Keluar dari kuis?' : 'Exit quiz?';
  const subtitle =
    language === 'id'
      ? 'Progres kuis ini tidak akan disimpan'
      : 'Progress on this quiz will not be saved';
  const cancelLabel = language === 'id' ? 'Lanjut kuis' : 'Continue quiz';
  const confirmLabel = language === 'id' ? 'Keluar' : 'Exit';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-6">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-lg">
        <p className="text-base font-semibold text-slate-900">{title}</p>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{subtitle}</p>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:border-slate-300"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-rose-600"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
