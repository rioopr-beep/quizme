'use client';

import { usePathname } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

declare global {
  interface Window {
    MathJax?: {
      typesetPromise?: () => Promise<void>;
    };
  }
}

interface MathJaxProviderProps {
  readonly children: ReactNode;
}

export default function MathJaxProvider({ children }: MathJaxProviderProps): JSX.Element {
  const pathname = usePathname();

  useEffect(() => {
    // Memastikan MathJax tersedia di window lalu memicu re-render rumus
    if (typeof window !== 'undefined' && window.MathJax?.typesetPromise) {
      window.MathJax.typesetPromise().catch((err) => {
        console.error('MathJax rendering error:', err);
      });
    }
  }, [pathname, children]);

  return <>{children}</>;
}
