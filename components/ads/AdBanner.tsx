'use client';

import { useEffect, useRef } from 'react';

const MONETAG_ZONE = '11635566';
const MONETAG_SRC = 'https://nap5k.com/tag.min.js';

export default function AdBanner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasInjected = useRef(false);

  useEffect(() => {
    // Guard: cegah inject dobel kalau komponen sempat re-render/re-mount
    // (mis. karena StrictMode dev, atau parent re-render) — tanpa guard
    // ini, tiap mount nambah 1 slot iklan baru yang numpuk terus di DOM.
    if (hasInjected.current || !containerRef.current) return;
    hasInjected.current = true;

    const script = document.createElement('script');
    script.dataset.zone = MONETAG_ZONE;
    script.src = MONETAG_SRC;
    containerRef.current.appendChild(script);

    return () => {
      // Bersihkan iklan yang sudah ter-inject saat komponen di-unmount,
      // supaya kalau nanti di-mount ulang (navigasi balik ke halaman ini)
      // tidak numpuk sama sisa iklan sebelumnya.
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      hasInjected.current = false;
    };
  }, []);

  return <div ref={containerRef} />;
}
