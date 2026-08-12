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
