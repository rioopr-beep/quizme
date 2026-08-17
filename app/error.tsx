'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div style={{ padding: 20, fontFamily: 'monospace', fontSize: 12, whiteSpace: 'pre-wrap' }}>
      <h2 style={{ fontSize: 16, marginBottom: 10 }}>Error caught:</h2>
      <p><b>Message:</b> {error.message}</p>
      {error.digest && <p><b>Digest:</b> {error.digest}</p>}
      <p><b>Stack:</b></p>
      <p>{error.stack}</p>
      <button onClick={() => reset()} style={{ marginTop: 20, padding: 10, background: '#333', color: '#fff' }}>
        Coba lagi
      </button>
    </div>
  );
}
