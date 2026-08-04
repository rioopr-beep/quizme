'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseBrowserClient } from '../lib/supabase/client';
import { useLanguage } from '../context/LanguageContext';

interface NavMenuProps {
  userName: string;
  userEmail: string;
}

export default function NavMenu({ userName, userEmail }: NavMenuProps): JSX.Element {
  const router = useRouter();
  const { language, toggleLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  async function handleLogout(): Promise<void> {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  const menuItems = [
    { href: '/profile', label: language === 'id' ? 'Profil' : 'Profile' },
    { href: '/history', label: language === 'id' ? 'Riwayat kuis' : 'Quiz history' },
    { href: '/stats', label: language === 'id' ? 'Statistik' : 'Statistics' },
  ];

  const initial = userName ? userName.charAt(0).toUpperCase() : '?';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Menu"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300"
      >
        <span className="font-mono text-lg leading-none">⋮</span>
      </button>

      {isOpen ? (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
            <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 font-mono text-sm font-semibold text-emerald-600">
                {initial}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800">
                  {userName || (language === 'id' ? 'Pengguna' : 'User')}
                </p>
                <p className="truncate text-xs text-slate-400">{userEmail}</p>
              </div>
            </div>

            <div className="flex flex-col py-1">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50"
                >
                  {item.label}
                </Link>
              ))}

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  toggleLanguage();
                }}
                className="px-4 py-2.5 text-left text-sm text-slate-600 transition hover:bg-slate-50"
              >
                {language === 'id' ? 'Bahasa: Indonesia' : 'Language: English'}
              </button>
            </div>

            <div className="border-t border-slate-100 py-1">
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="w-full px-4 py-2.5 text-left text-sm text-rose-500 transition hover:bg-rose-50"
              >
                {language === 'id' ? 'Keluar' : 'Logout'}
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
              }
