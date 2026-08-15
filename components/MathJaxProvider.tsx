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
  const observerRef = useRef<MutationObserver | null>(null);
  const isTypesettingRef = useRef(false);

  const typeset = () => {
    const mj = window.MathJax;
    if (!mj?.typesetPromise || isTypesettingRef.current) return;

    isTypesettingRef.current = true;
    // Matikan observer sementara supaya perubahan DOM yang dibuat
    // oleh MathJax sendiri (ganti teks -> render rumus) tidak memicu
    // observer lagi dan bikin loop tak berhenti.
    observerRef.current?.disconnect();

    const ready = mj.startup?.promise ?? Promise.resolve();
    ready
      .then(() => mj.typesetPromise?.())
      .catch((err) => console.error('MathJax rendering error:', err))
      .finally(() => {
        isTypesettingRef.current = false;
        // Nyalakan lagi observer setelah MathJax selesai mengubah DOM
        if (containerRef.current && observerRef.current) {
          observerRef.current.observe(containerRef.current, {
            childList: true,
            subtree: true,
            characterData: true,
          });
        }
      });
  };

  useEffect(() => {
    typeset();
  }, [pathname]);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new MutationObserver(() => {
      typeset();
    });
    observerRef.current = observer;

    observer.observe(containerRef.current, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, []);

  return <div ref={containerRef}>{children}</div>;
}
