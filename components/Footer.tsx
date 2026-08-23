import Link from 'next/link';

export default function Footer(): JSX.Element {
  return (
    <footer className="border-t border-slate-200 bg-white mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="text-sm text-slate-500">
          © {new Date().getFullYear()} QuizFrend. Semua hak dilindungi.
        </p>

        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
          <Link href="/topics" className="hover:text-slate-900 transition-colors">
            Topik
          </Link>
          <Link href="/about" className="hover:text-slate-900 transition-colors">
            Tentang
          </Link>
          <Link href="/privacy" className="hover:text-slate-900 transition-colors">
            Kebijakan Privasi
          </Link>
          <Link href="/terms" className="hover:text-slate-900 transition-colors">
            Syarat & Ketentuan
          </Link>
        </nav>
      </div>
    </footer>
  );
}
