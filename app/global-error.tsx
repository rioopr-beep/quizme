'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body style={{ padding: 20, fontFamily: 'monospace', fontSize: 12, whiteSpace: 'pre-wrap' }}>
        <h2>Global error caught:</h2>
        <p><b>Message:</b> {error.message}</p>
        {error.digest && <p><b>Digest:</b> {error.digest}</p>}
        <p>{error.stack}</p>
        <button onClick={() => reset()}>Coba lagi</button>
      </body>
    </html>
  );
}
