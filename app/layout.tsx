import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import type { ReactNode } from 'react';
import Script from 'next/script';
import { GoogleAnalytics } from '@next/third-parties/google';
import { LanguageProvider } from '@/context/LanguageContext';
import MathJaxProvider from '@/components/MathJaxProvider';
import Footer from '@/components/Footer';
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
  metadataBase: new URL('https://www.quizfrend.my.id'),
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
    url: 'https://www.quizfrend.my.id',
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

        <Script
          src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"
          strategy="afterInteractive"
        />

        <LanguageProvider>
          <MathJaxProvider>
            <div className="flex-1 flex flex-col">
              {children}
            </div>
          </MathJaxProvider>
        </LanguageProvider>

        <Footer />

        <GoogleAnalytics gaId="G-VNHDY1V50Z" />
      </body>
    </html>
  );
}
