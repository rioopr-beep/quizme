import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import type { ReactNode } from 'react';
import Script from 'next/script';
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
  title: 'QuizMe — Platform Evaluasi Analisis Dwibahasa',
  description:
    'QuizMe adalah platform ujian dan evaluasi analisis dwibahasa (ID/EN) lintas 6 sektor: keuangan, kriptografi, psikologi, fisika, sains, dan linguistik.',
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
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5880565428793446"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className="bg-slate-50 font-sans antialiased">
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
            {children}
          </MathJaxProvider>
        </LanguageProvider>

        <GoogleAnalytics gaId="G-VNHDY1V50Z" />
      </body>
    </html>
  );
}
