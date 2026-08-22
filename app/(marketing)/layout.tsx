import type { ReactNode } from 'react';
import Link from 'next/link';

interface MarketingLayoutProps {
  readonly children: ReactNode;
}

export default function MarketingLayout({ children }: MarketingLayoutProps): JSX.Element {
  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center">
          <Link href="/" className="font-bold text-slate-900">
            QuizFrend
          </Link>
        </div>
      </header>

      <div className="flex-1">{children}</div>

      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="max-w-4xl mx-auto px-4 text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>© QuizFrend. All rights reserved.</p>
          <Link href="/about" className="hover:underline">
            About & Contact
          </Link>
        </div>
      </footer>
    </div>
  );
}
