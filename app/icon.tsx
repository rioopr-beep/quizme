import { ImageResponse } from 'next/og';

export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0a',
          borderRadius: 8,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 40 40">
          <circle cx="14" cy="16" r="4" fill="none" stroke="#ffffff" strokeWidth="2.2" />
          <circle cx="26" cy="16" r="4" fill="none" stroke="#ffffff" strokeWidth="2.2" />
          <path d="M10 24 Q20 30 30 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M17 27 Q17 34 20 34 Q23 34 23 27" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
