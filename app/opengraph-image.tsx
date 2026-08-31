import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'QuizFrend — Latihan Analisis Lintas Disiplin';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Mark — sama persis dgn app/icon.tsx, diperbesar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 180,
            height: 180,
            borderRadius: 40,
            background: '#0a0a0a',
            border: '2px solid rgba(255,255,255,0.15)',
            marginBottom: 40,
          }}
        >
          <svg width="120" height="120" viewBox="0 0 40 40">
            <circle cx="14" cy="16" r="4" fill="none" stroke="#ffffff" strokeWidth="2.2" />
            <circle cx="26" cy="16" r="4" fill="none" stroke="#ffffff" strokeWidth="2.2" />
            <path
              d="M10 24 Q20 30 30 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <path
              d="M17 27 Q17 34 20 34 Q23 34 23 27"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Wordmark */}
        <div
          style={{
            display: 'flex',
            fontSize: 72,
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '-0.02em',
          }}
        >
          QuizFrend
        </div>

        {/* Tagline */}
        <div
          style={{
            display: 'flex',
            marginTop: 16,
            fontSize: 30,
            fontWeight: 400,
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          Latihan Analisis Lintas Disiplin
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
        }
