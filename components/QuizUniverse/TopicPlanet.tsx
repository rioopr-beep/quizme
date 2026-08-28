'use client';

// ============================================================================
// TopicPlanet — satu bola topik dalam Quiz Universe.
// Sphere dibuat murni dari radial-gradient CSS (bukan gambar/icon besar).
// Bisa dipilih lewat klik/tap ATAU keyboard (tidak bergantung gesture swipe).
// ============================================================================

import type { CSSProperties } from 'react';
import type { TopicActivity } from './types';

interface TopicPlanetProps {
  topic: TopicActivity;
  color: string;
  /** posisi absolut dalam persen terhadap container (top/left) */
  left: number;
  top: number;
  /** skala dasar dari activity/progress, sebelum efek fokus */
  baseScale: number;
  isFocused: boolean;
  /** index dipakai untuk stagger delay animasi bob, bukan untuk posisi */
  bobDelayMs: number;
  onSelect: (topic: TopicActivity) => void;
}

export default function TopicPlanet({
  topic,
  color,
  left,
  top,
  baseScale,
  isFocused,
  bobDelayMs,
  onSelect,
}: TopicPlanetProps): JSX.Element {
  const scale = baseScale * (isFocused ? 1.16 : 1);

  const wrapperStyle: CSSProperties = {
    left: `${left}%`,
    top: `${top}%`,
    transform: `translate(-50%, -50%) scale(${scale})`,
    zIndex: isFocused ? 20 : Math.round(baseScale * 10),
    animationDelay: `${bobDelayMs}ms`,
  };

  const sphereStyle: CSSProperties = {
    background: `radial-gradient(circle at 32% 28%, ${color}f2, ${color}b3 55%, ${color}80 100%)`,
    boxShadow: isFocused
      ? `0 8px 22px -6px ${color}80`
      : `0 4px 14px -6px ${color}66`,
  };

  return (
    <button
      type="button"
      onClick={() => onSelect(topic)}
      aria-label={`${topic.name}, ${topic.quizCount} kuis`}
      aria-current={isFocused ? 'true' : undefined}
      className={[
        'absolute flex w-16 flex-col items-center gap-1',
        'motion-safe:animate-[quizPlanetBob_5.5s_ease-in-out_infinite]',
        'transition-[transform,z-index] duration-300 ease-out',
        'active:scale-95',
      ].join(' ')}
      style={wrapperStyle}
    >
      <span
        className="h-11 w-11 rounded-full ring-1 ring-white/40"
        style={sphereStyle}
      />
      <span className="rounded-full bg-base-surface/90 px-2 py-0.5 text-center text-[10px] font-medium leading-tight text-text-primary shadow-floating-sm">
        {topic.name}
        <span className="block text-[9px] font-normal text-text-muted">
          {topic.quizCount} Quiz
        </span>
      </span>
    </button>
  );
}
