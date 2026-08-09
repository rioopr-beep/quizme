'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';

const NAV_ITEMS = [
  {
    href: '/dashboard',
    icon: 'ti-home',
    label: { id: 'Beranda', en: 'Home' },
  },
  {
    href: '/topics',
    icon: 'ti-list',
    label: { id: 'Topik', en: 'Topics' },
  },
  {
    href: '/leaderboard',
    icon: 'ti-trophy',
    label: { id: 'Peringkat', en: 'Leaderboard' },
  },
  {
    href: '/history',
    icon: 'ti-history',
    label: { id: 'Riwayat', en: 'History' },
  },
  {
    href: '/profile',
    icon: 'ti-user',
    label: { id: 'Profil', en: 'Profile' },
  },
] as const;

export default function BottomNav(): JSX.Element {
  const pathname = usePathname();
  const { language } = useLanguage();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-2">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-1.5 transition ${
                isActive ? 'text-emerald-600' : 'text-slate-400'
              }`}
            >
              <i className={`ti ${item.icon} text-xl`} aria-hidden="true" />
              <span
                className={`text-[11px] ${
                  isActive ? 'font-semibold' : 'font-medium'
                }`}
              >
                {item.label[language]}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
