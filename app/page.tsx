'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseBrowserClient } from '../lib/supabase/client';
import { useLanguage } from '../context/LanguageContext';

export default function LandingPage(): JSX.Element {
  const router = useRouter();
  const { language, toggleLanguage } = useLanguage();
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function checkSession(): Promise<void> {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        router.push('/dashboard');
        return;
      }

      if (isMounted) {
        setIsChecking(false);
      }
    }

    void checkSession();
    return () => {
      isMounted = false;
    };
  }, [router]);

  const copy = {
    title:
      language === 'id'
        ? 'Latihan analisis lintas disiplin'
        : 'Cross-disciplinary analysis practice',
    subtitle:
      language === 'id'
        ? 'Uji cara berpikirmu lewat studi kasus nyata dari berbagai bidang ilmu'
        : 'Test how you think through real case studies across different fields',
    cta: language === 'id' ? 'Mulai belajar' : 'Start learning',
    login: language === 'id' ? 'Masuk' : 'Login',
    signup: language === 'id' ? 'Daftar' : 'Sign up',
    howItWorks: language === 'id' ? 'Cara kerjanya' : 'How it works',
    step1: language === 'id' ? 'Pilih topik yang ingin dipelajari' : 'Choose a topic to study',
    step2:
      language === 'id'
        ? 'Kerjakan studi kasus berbentuk cerita'
        : 'Work through story-based case studies',
    step3:
      language === 'id'
        ? 'Materi disusun dari sumber terpercaya dan diperiksa berkala'
        : 'Content is curated from trusted sources and reviewed regularly',
    step4: language === 'id' ? 'Lihat hasil dan pembahasannya' : 'See your results and review',
    privacy: language === 'id' ? 'Kebijakan Privasi' : 'Privacy Policy',
    terms: language === 'id' ? 'Syarat & Ketentuan' : 'Terms & Conditions',
    aboutContact: language === 'id' ? 'Tentang & Kontak' : 'About & Contact',
    popularTopics: language === 'id' ? 'Topik Populer' : 'Popular Topics',
  };

  if (isChecking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="font-mono text-sm text-slate-400">…</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-800">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
        <header className="flex items-center justify-between px-6 py-5">
          <span className="font-mono text-lg font-semibold text-slate-900">QuizFrend</span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleLanguage}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-mono text-xs font-medium text-slate-500 shadow-sm"
            >
              {language === 'id' ? 'EN' : 'ID'}
            </button>
            <Link
              href="/login"
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 shadow-sm"
            >
              {copy.login}
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-indigo-900 px-3 py-1.5 text-sm font-medium text-white shadow-sm"
            >
              {copy.signup}
            </Link>
          </div>
        </header>

        <section className="mx-6 mt-4 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white px-6 py-10 text-center">
          <h1 className="text-2xl font-semibold leading-snug text-slate-900">{copy.title}</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-500">
            {copy.subtitle}
          </p>
          {/* DIUBAH: Mengarah ke /topics bukan /signup */}
          <Link
            href="/topics"
            className="mt-6 inline-block rounded-xl bg-indigo-900 px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-800"
          >
            {copy.cta}
          </Link>
        </section>

        <section className="px-6 py-8">
          <p className="mb-4 text-xs font-medium uppercase tracking-wide text-slate-400">
            {copy.howItWorks}
          </p>
          <div className="flex flex-col gap-4">
            {[copy.step1, copy.step2, copy.step3, copy.step4].map((step, index) => (
              <div key={step} className="flex items-start gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-50 font-mono text-xs font-medium text-indigo-900">
                  {index + 1}
                </span>
                <p className="mt-0.5 text-sm text-slate-600">{step}</p>
              </div>
            ))}
          </div>
        </section>

        {/* DITAMBAHKAN: Link kuis langsung buat Google Crawler/AdSense */}
        <section className="px-6 pb-10">
          <p className="mb-4 text-xs font-medium uppercase tracking-wide text-slate-400">
            {copy.popularTopics}
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Link
              href="/quiz/psychology/advanced?count=10"
              className="rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-900"
            >
              Psychology
            </Link>
            <Link
              href="/quiz/financial/foundational?count=10"
              className="rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-900"
            >
              Financial
            </Link>
            <Link
              href="/topics"
              className="rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-900"
            >
              {language === 'id' ? 'Lainnya →' : 'More →'}
            </Link>
          </div>
        </section>

        <footer className="border-t border-slate-200 px-6 py-6">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-slate-400">
            <Link href="/privacy" className="hover:text-indigo-900">
              {copy.privacy}
            </Link>
            <span className="text-slate-300">•</span>
            <Link href="/terms" className="hover:text-indigo-900">
              {copy.terms}
            </Link>
            <span className="text-slate-300">•</span>
            <Link href="/about" className="hover:text-indigo-900">
              {copy.aboutContact}
            </Link>
          </div>
          <p className="mt-2 text-center text-xs text-slate-300">
            © {new Date().getFullYear()} QuizFrend
          </p>
        </footer>
      </div>
    </main>
  );
}
