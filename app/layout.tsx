import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import type { ReactNode } from 'react';
import { GoogleAnalytics } from '@next/third-parties/google';
import { LanguageProvider } from '@/context/LanguageContext';
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
      </head>
      <body className="bg-slate-50 font-sans antialiased">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
      <GoogleAnalytics gaId="G-VNHDY1V50Z" />
    </html>
  );
}
