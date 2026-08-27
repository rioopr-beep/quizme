'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Hexagon,
  ChevronDown,
  Globe,
  BookOpen,
  Layers,
  TrendingUp,
  Target,
  ShieldCheck,
  Lock,
  Zap,
  Users,
  ArrowRight,
  Menu,
  X,
} from 'lucide-react';
import { getSupabaseBrowserClient } from '../lib/supabase/client';
import { useLanguage } from '../context/LanguageContext';
import KineticQuizVisual from '../components/KineticQuizVisual';

export default function LandingPage(): JSX.Element {
  const router = useRouter();
  const { language, toggleLanguage } = useLanguage();
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

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

  // Close the mobile menu automatically if the viewport grows past the
  // breakpoint (e.g. rotating a tablet), so it can't get stuck open.
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMenuOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const copy = {
    login: language === 'id' ? 'Masuk' : 'Login',
    signup: language === 'id' ? 'Daftar' : 'Sign up',
    navAbout: language === 'id' ? 'Tentang Kami' : 'About Us',
    navFeatures: language === 'id' ? 'Fitur' : 'Features',
    navCategories: language === 'id' ? 'Kategori' : 'Categories',
    navBlog: 'Blog',
    navHelp: language === 'id' ? 'Bantuan' : 'Help',
    eyebrow: language === 'id' ? 'PLATFORM KUIS INTERAKTIF' : 'INTERACTIVE QUIZ PLATFORM',
    headlineLine1: language === 'id' ? 'Belajar.' : 'Learn.',
    headlineLine2: language === 'id' ? 'Uji Pengetahuan.' : 'Test Your Knowledge.',
    headlineLine3: language === 'id' ? 'Jadi Lebih Baik.' : 'Get Better.',
    description:
      language === 'id'
        ? 'Ribuan kuis lintas disiplin, dibuat dari studi kasus nyata untuk membantumu belajar lebih aktif, paham lebih dalam, dan berkembang setiap hari.'
        : 'Thousands of cross-disciplinary quizzes built from real case studies, helping you learn more actively, understand more deeply, and grow every day.',
    ctaPrimary: language === 'id' ? 'Mulai Belajar' : 'Start Learning',
    ctaSecondary: language === 'id' ? 'Daftar Gratis' : 'Sign Up Free',
    trustLine:
      language === 'id'
        ? 'Aman, cepat, dan gratis untuk memulai.'
        : 'Safe, fast, and free to get started.',
    features: [
      {
        icon: BookOpen,
        title: language === 'id' ? 'Berbasis Studi Kasus' : 'Case-Study Based',
        desc:
          language === 'id'
            ? 'Soal dikembangkan dari studi kasus nyata yang relevan dan aplikatif.'
            : 'Questions built from real, relevant, applicable case studies.',
      },
      {
        icon: Layers,
        title: language === 'id' ? '30+ Disiplin' : '30+ Disciplines',
        desc:
          language === 'id'
            ? 'Beragam kategori mulai dari sains, teknologi, ekonomi, hingga olahraga.'
            : 'Wide range of categories, from science and tech to economics and sports.',
      },
      {
        icon: TrendingUp,
        title: language === 'id' ? 'Belajar Terukur' : 'Measurable Progress',
        desc:
          language === 'id'
            ? 'Pantau perkembangan dengan statistik dan laporan yang mudah dipahami.'
            : 'Track your growth with clear, easy-to-read stats and reports.',
      },
      {
        icon: Target,
        title: language === 'id' ? 'Tantangan Seru' : 'Fun Challenges',
        desc:
          language === 'id'
            ? 'Kuis harian, leaderboard, dan pencapaian untuk memotivasi belajar.'
            : 'Daily quizzes, leaderboards, and achievements to keep you motivated.',
      },
    ],
    trustBar: [
      {
        icon: ShieldCheck,
        title: language === 'id' ? 'Gratis untuk Memulai' : 'Free to Start',
        desc: language === 'id' ? 'Akses ribuan kuis tanpa biaya.' : 'Access thousands of quizzes at no cost.',
      },
      {
        icon: Lock,
        title: language === 'id' ? 'Data Aman & Privat' : 'Safe & Private Data',
        desc: language === 'id' ? 'Kami menjaga datamu dengan serius.' : 'We take protecting your data seriously.',
      },
      {
        icon: Zap,
        title: language === 'id' ? 'Cepat & Ringan' : 'Fast & Lightweight',
        desc: language === 'id' ? 'Dioptimalkan untuk semua perangkat.' : 'Optimized for every device.',
      },
      {
        icon: Users,
        title: language === 'id' ? 'Untuk Semua Orang' : 'For Everyone',
        desc: language === 'id' ? 'Belajar kapan saja, di mana saja.' : 'Learn anytime, anywhere.',
      },
    ],
    privacy: language === 'id' ? 'Kebijakan Privasi' : 'Privacy Policy',
    terms: language === 'id' ? 'Syarat & Ketentuan' : 'Terms & Conditions',
    aboutContact: language === 'id' ? 'Tentang & Kontak' : 'About & Contact',
  };

  const navItems = [
    { href: '/about', label: copy.navAbout, isAnchor: false },
    { href: '#fitur', label: copy.navFeatures, isAnchor: true },
    { href: '/topics', label: copy.navCategories, isAnchor: false },
    { href: '/blog', label: copy.navBlog, isAnchor: false },
    { href: '/help', label: copy.navHelp, isAnchor: false },
  ];

  if (isChecking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <p className="font-mono text-sm text-slate-400">…</p>
      </main>
    );
  }

  return (
    <main className="bg-white text-slate-900 font-sans min-h-screen">
      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 md:px-10 py-6 relative z-30">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-9 h-9 flex items-center justify-center">
              <Hexagon className="w-9 h-9 text-[#2955F2]" strokeWidth={2.2} />
              <span className="absolute font-black text-sm text-[#2955F2]">Q</span>
            </div>
            <span className="font-black text-xl tracking-tight">
              Quiz<span className="text-[#2955F2]">Frend</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) =>
              item.isAnchor ? (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-sm text-slate-700 hover:text-slate-950 transition-colors"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-sm text-slate-700 hover:text-slate-950 transition-colors"
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          <div className="flex items-center gap-3 md:gap-6">
            <button
              type="button"
              onClick={toggleLanguage}
              className="hidden sm:flex items-center gap-1 text-sm text-slate-700"
            >
              <Globe className="w-4 h-4" />
              {language === 'id' ? 'ID' : 'EN'}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <Link href="/login" className="hidden sm:block text-sm font-medium text-[#2955F2]">
              {copy.login}
            </Link>
            <Link
              href="/signup"
              className="hidden sm:block bg-[#2955F2] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[#2244d4] transition-colors"
            >
              {copy.signup}
            </Link>

            {/* Mobile: hamburger toggle */}
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? (language === 'id' ? 'Tutup menu' : 'Close menu') : (language === 'id' ? 'Buka menu' : 'Open menu')}
              aria-expanded={menuOpen}
              className="lg:hidden flex items-center justify-center w-9 h-9 text-slate-700"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        {menuOpen && (
          <div className="lg:hidden absolute left-0 right-0 top-full mt-2 mx-4 rounded-2xl border border-slate-100 bg-white shadow-lg px-6 py-6">
            <nav className="flex flex-col gap-4 mb-6">
              {navItems.map((item) =>
                item.isAnchor ? (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="text-[15px] font-medium text-slate-700"
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="text-[15px] font-medium text-slate-700"
                  >
                    {item.label}
                  </Link>
                )
              )}
            </nav>

            <div className="flex items-center justify-between border-t border-slate-100 pt-5 mb-5">
              <button
                type="button"
                onClick={toggleLanguage}
                className="flex items-center gap-1 text-sm text-slate-700"
              >
                <Globe className="w-4 h-4" />
                {language === 'id' ? 'ID' : 'EN'}
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="text-center text-sm font-medium text-[#2955F2] border border-[#2955F2] rounded-lg px-5 py-2.5"
              >
                {copy.login}
              </Link>
              <Link
                href="/signup"
                onClick={() => setMenuOpen(false)}
                className="text-center bg-[#2955F2] text-white text-sm font-medium px-5 py-2.5 rounded-lg"
              >
                {copy.signup}
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center px-6 md:px-10 pt-8 pb-20 md:pb-28">
        <div>
          <p className="text-[#2955F2] text-xs font-bold tracking-widest mb-4">{copy.eyebrow}</p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-[1.08] mb-6 tracking-tight">
            {copy.headlineLine1}
            <br />
            {copy.headlineLine2}
            <br />
            <span className="text-[#2955F2]">{copy.headlineLine3}</span>
          </h1>
          <p className="text-slate-500 text-[15px] leading-relaxed mb-8 max-w-md">{copy.description}</p>
          <div className="flex flex-wrap gap-3 mb-6">
            <Link
              href="/topics"
              className="bg-[#2955F2] text-white font-medium px-6 py-3.5 rounded-xl flex items-center gap-2 hover:bg-[#2244d4] transition-colors"
            >
              {copy.ctaPrimary} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/signup"
              className="border border-[#2955F2] text-[#2955F2] font-medium px-6 py-3.5 rounded-xl hover:bg-blue-50 transition-colors"
            >
              {copy.ctaSecondary}
            </Link>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <ShieldCheck className="w-4 h-4 text-[#2955F2]" />
            {copy.trustLine}
          </div>
        </div>

        <KineticQuizVisual />
      </section>

      {/* Features */}
      <section id="fitur" className="border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 grid sm:grid-cols-2 md:grid-cols-4 gap-10">
          {copy.features.map(({ icon: Icon, title, desc }) => (
            <div key={title}>
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-[#2955F2]" strokeWidth={2} />
              </div>
              <h3 className="font-semibold text-[15px] mb-1.5">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust bar */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 pb-16">
        <div className="border border-slate-100 rounded-2xl px-8 py-8 grid sm:grid-cols-2 md:grid-cols-4 gap-8">
          {copy.trustBar.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3">
              <Icon className="w-5 h-5 text-[#2955F2] shrink-0 mt-0.5" strokeWidth={2} />
              <div>
                <h4 className="font-semibold text-sm">{title}</h4>
                <p className="text-sm text-slate-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 px-6 py-8">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-slate-400">
          <Link href="/privacy" className="hover:text-[#2955F2]">
            {copy.privacy}
          </Link>
          <span className="text-slate-300">•</span>
          <Link href="/terms" className="hover:text-[#2955F2]">
            {copy.terms}
          </Link>
          <span className="text-slate-300">•</span>
          <Link href="/about" className="hover:text-[#2955F2]">
            {copy.aboutContact}
          </Link>
        </div>
        <p className="mt-2 text-center text-xs text-slate-300">© {new Date().getFullYear()} QuizFrend</p>
      </footer>
    </main>
  );
              }
