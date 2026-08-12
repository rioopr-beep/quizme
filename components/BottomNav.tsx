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
    <nav className="fixed inset-x-0 bottom-4 z-40 px-4 animate-nav-in">
      <div className="mx-auto flex max-w-md items-center justify-between rounded-floating border border-base-border bg-base-surface/90 px-3 py-2 shadow-floating backdrop-blur-md">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 transition-all duration-300 ease-out ${
                isActive
                  ? 'bg-accent-soft text-accent scale-105'
                  : 'text-slate-400 scale-100 hover:text-slate-500'
              }`}
            >
              <i
                className={`ti ${item.icon} text-xl transition-transform duration-300 ease-out ${
                  isActive ? '-translate-y-0.5' : 'translate-y-0'
                }`}
                aria-hidden="true"
              />
              <span
                className={`text-[11px] transition-all duration-300 ${
                  isActive ? 'font-semibold opacity-100' : 'font-medium opacity-70'
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
