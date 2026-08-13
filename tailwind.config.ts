import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './context/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        base: {
          bg: '#eef3fb',      // background utama, biru muda pucat
          surface: '#fbfcfe', // warna card/permukaan floating, off-white lembut
          border: '#e2e8f4',  // border tipis antar elemen
        },
        accent: {
          DEFAULT: '#5b7fd6', // biru soft, dipakai untuk highlight/active state
          soft: '#dde6fa',    // versi pucat, buat background icon aktif dsb
        },
        text: {
          primary: '#1e2947',   // biru gelap, teks utama (judul, prompt soal)
          secondary: '#5c6b8a', // biru abu, teks sekunder/caption/deskripsi
          muted: '#93a0bd',     // placeholder, teks nonaktif/disabled
        },
        status: {
          correct: '#4a9c6d',
          incorrect: '#d1665a',
          correctSoft: '#e3f2e9',
          incorrectSoft: '#fbe8e6',
        },
      },
      boxShadow: {
        floating: '0 8px 30px -8px rgba(30, 41, 82, 0.15)',
        'floating-sm': '0 4px 14px -4px rgba(30, 41, 82, 0.12)',
      },
      borderRadius: {
        floating: '1.5rem',
      },
    },
  },
  plugins: [],
};

export default config;
