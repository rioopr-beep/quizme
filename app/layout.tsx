import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import type { ReactNode } from 'react';
import Script from 'next/script';
import Link from 'next/link'; // 1. Import Link dari Next.js
import { GoogleAnalytics } from '@next/third-parties/google';
import { LanguageProvider } from '@/context/LanguageContext';
import MathJaxProvider from '@/components/MathJaxProvider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://quizfrend.my.id'),
  title: {
    default: 'QuizFrend — Latihan Analisis Lintas Disiplin',
    template: '%s | QuizFrend',
  },
  description:
    'Uji cara berpikirmu lewat studi kasus berbentuk cerita dari berbagai bidang ilmu: keuangan, fisika, psikologi, bahasa, dan lainnya. Belajar sambil menganalisis, bukan sekadar menghafal.',
  keywords: [
    'kuis studi kasus',
    'latihan analisis',
    'belajar lintas disiplin',
    'quiz edukasi',
    'QuizFrend',
  ],
  openGraph: {
    title: 'QuizFrend — Latihan Analisis Lintas Disiplin',
    description:
      'Uji cara berpikirmu lewat studi kasus berbentuk cerita dari berbagai bidang ilmu.',
    url: 'https://quizfrend.my.id',
    siteName: 'QuizFrend',
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'QuizFrend — Latihan Analisis Lintas Disiplin',
    description:
      'Uji cara berpikirmu lewat studi kasus berbentuk cerita dari berbagai bidang ilmu.',
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    'google-adsense-account': 'ca-pub-5880565428793446',
  },
};

interface RootLayoutProps {
  readonly children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps): JSX.Element {
  return (
    <html lang="id" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css"
        />
      </head>
      <body className="bg-slate-50 font-sans antialiased min-h-screen flex flex-col">
        {/* 1. Konfigurasi MathJax dipasang sebelum skrip CDN */}
        <Script id="mathjax-config" strategy="afterInteractive">
          {`
            window.MathJax = {
              tex: {
                inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
                displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']]
              },
              svg: {
                fontCache: 'global'
              }
            };
          `}
        </Script>

        {/* 2. Pemanggilan skrip utama MathJax */}
        <Script
          src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"
          strategy="afterInteractive"
        />

        <LanguageProvider>
          <MathJaxProvider>
            {/* 2. Tambahkan Navbar Minimalis di Atas */}
            <header className="border-b border-slate-200 bg-white">
              <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
                <Link href="/" className="font-bold text-slate-900">
                  QuizFrend
                </Link>
                <nav className="text-sm font-medium text-slate-600">
                  <Link href="/about" className="hover:text-slate-900 transition-colors">
                    About & Contact
                  </Link>
                </nav>
              </div>
            </header>

            {/* Content Utama */}
            <div className="flex-1">
              {children}
            </div>

            {/* 3. Atau Bisa Juga Tambahkan Footer Minimalis di Bawah */}
            <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
              <div className="max-w-4xl mx-auto px-4 text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2">
                <p>© QuizFrend. All rights reserved.</p>
                <Link href="/about" className="hover:underline">
                  About & Contact
                </Link>
              </div>
            </footer>
          </MathJaxProvider>
        </LanguageProvider>

        <GoogleAnalytics gaId="G-VNHDY1V50Z" />
      </body>
    </html>
  );
}
