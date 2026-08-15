'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, ReactNode } from 'react';

declare global {
  interface Window {
    MathJax?: {
      typesetPromise?: (elements?: Element[]) => Promise<void>;
      startup?: {
        promise?: Promise<void>;
      };
    };
  }
}

interface MathJaxProviderProps {
  readonly children: ReactNode;
}

export default function MathJaxProvider({ children }: MathJaxProviderProps): JSX.Element {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);

  const typeset = () => {
    const mj = window.MathJax;
    if (!mj?.typesetPromise) return;

    // Kalau MathJax masih dalam proses startup, tunggu promise-nya dulu
    const ready = mj.startup?.promise ?? Promise.resolve();
    ready
      .then(() => mj.typesetPromise?.())
      .catch((err) => console.error('MathJax rendering error:', err));
  };

  // Re-typeset saat pindah halaman
  useEffect(() => {
    typeset();
  }, [pathname]);

  // Re-typeset setiap kali konten di dalam container berubah
  // (misalnya soal baru selesai di-fetch dari Supabase dan ditulis ke DOM)
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new MutationObserver(() => {
      typeset();
    });

    observer.observe(containerRef.current, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, []);

  return <div ref={containerRef}>{children}</div>;
}
