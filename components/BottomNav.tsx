'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  LayoutGrid,
  Trophy,
  History,
  User,
  type LucideIcon,
} from 'lucide-react';

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Beranda', icon: Home },
  { href: '/topics', label: 'Topik', icon: LayoutGrid },
  { href: '/leaderboard', label: 'Peringkat', icon: Trophy },
  { href: '/history', label: 'Riwayat', icon: History },
  { href: '/profile', label: 'Profil', icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-50 flex justify-center pb-4 pointer-events-none"
    >
      <div className="flex items-end gap-3 pointer-events-auto">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname?.startsWith(item.href);
          const Icon = item.icon;

          return (
            <button
              key={item.href}
              type="button"
              onClick={() => router.push(item.href)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
              className={[
                'group flex flex-col items-center justify-center',
                'rounded-floating transition-all duration-300 ease-out',
                'active:scale-95',
                isActive
                  ? 'w-16 h-16 -translate-y-2 bg-accent shadow-floating'
                  : 'w-12 h-12 bg-base-surface shadow-floating-sm hover:-translate-y-1',
              ].join(' ')}
            >
              <Icon
                size={isActive ? 22 : 20}
                strokeWidth={isActive ? 2.25 : 2}
                className={[
                  'transition-colors duration-300',
                  isActive ? 'text-base-surface' : 'text-text-secondary',
                ].join(' ')}
              />
              <span
                className={[
                  'mt-0.5 text-[10px] font-medium transition-all duration-300',
                  isActive
                    ? 'text-base-surface opacity-100'
                    : 'text-text-muted opacity-0 h-0 group-hover:opacity-100 group-hover:h-auto',
                ].join(' ')}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
