'use client';

// ============================================================================
// QuizUniverse — visual utama dashboard, pengganti orbital planet lama.
// Central core (quiz aktif / topic teraktif) dikelilingi max 6 topic sphere
// procedural (CSS/SVG). Swipe horizontal HANYA menggeser fokus di dalam
// Quiz Universe, tidak memengaruhi scroll halaman ataupun section lain.
// Data-driven sepenuhnya dari props `topics` — tidak ada topic hardcoded.
// ============================================================================

import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import OrbitLayer from './OrbitLayer';
import ParticleLayer from './ParticleLayer';
import CentralQuizCore from './CentralQuizCore';
import TopicPlanet from './TopicPlanet';
import type { QuizUniverseProps, TopicActivity } from './types';

const MAX_TOPICS = 6;
const SWIPE_THRESHOLD_PX = 40;

const DEFAULT_PALETTE = [
  '#8b7ff0', // lavender — Matematika-style
  '#4f8fe0', // biru — Fisika-style
  '#e0a24f', // oranye — Ekonomi-style
  '#4fbf82', // hijau — Biologi-style
  '#4fc9c2', // teal — Psikologi-style
  '#4fb2e0', // cyan — Kimia-style
];

function computePosition(index: number, total: number): { left: number; top: number } {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  const rx = 42;
  const ry = 33;
  return {
    left: 50 + rx * Math.cos(angle),
    top: 50 + ry * Math.sin(angle),
  };
}

export default function QuizUniverse({
  activeQuiz,
  topics,
  onSelectTopic,
  swipeHintLabel = 'Geser untuk melihat topik lain',
  emptyStateLabel = 'Mulai Quiz',
  emptyStateHref = '/topics',
  className = '',
}: QuizUniverseProps): JSX.Element {
  const visibleTopics = useMemo(
    () =>
      [...topics]
        .sort((a, b) => b.activity - a.activity)
        .slice(0, MAX_TOPICS),
    [topics],
  );

  const [focusedIndex, setFocusedIndex] = useState(0);
  const pointerStartX = useRef<number | null>(null);

  const hasActivity = visibleTopics.length > 0;
  const fallbackTopic = hasActivity ? visibleTopics[0] : null;

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>): void {
    pointerStartX.current = event.clientX;
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>): void {
    if (pointerStartX.current == null || visibleTopics.length < 2) {
      pointerStartX.current = null;
      return;
    }

    const deltaX = event.clientX - pointerStartX.current;
    pointerStartX.current = null;

    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) return;

    setFocusedIndex((current) => {
      const direction = deltaX < 0 ? 1 : -1;
      const next = (current + direction + visibleTopics.length) % visibleTopics.length;
      return next;
    });
  }

  function handleSelectTopic(topic: TopicActivity): void {
    const index = visibleTopics.findIndex((item) => item.id === topic.id);
    if (index >= 0) setFocusedIndex(index);
    onSelectTopic?.(topic);
  }

  return (
    <div className={['relative w-full', className].join(' ')}>
      <style>{`
        @keyframes quizCoreBreathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        @keyframes quizPlanetBob {
          0%, 100% { translate: 0 0; }
          50% { translate: 0 -5px; }
        }
      `}</style>

      <div
        className="relative mx-auto aspect-square w-full max-w-xs touch-pan-y select-none"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          pointerStartX.current = null;
        }}
      >
        <ParticleLayer />
        {hasActivity && <OrbitLayer />}

        <div className="absolute inset-0 flex items-center justify-center">
          <CentralQuizCore
            activeQuiz={activeQuiz}
            fallbackTopic={fallbackTopic}
            emptyStateLabel={emptyStateLabel}
            emptyStateHref={emptyStateHref}
            continueLabel="Lanjutkan"
          />
        </div>

        {hasActivity &&
          visibleTopics.map((topic, index) => {
            const { left, top } = computePosition(index, visibleTopics.length);
            const color = topic.color ?? DEFAULT_PALETTE[index % DEFAULT_PALETTE.length];
            const baseScale = 0.85 + topic.activity * 0.3;

            return (
              <TopicPlanet
                key={topic.id}
                topic={topic}
                color={color}
                left={left}
                top={top}
                baseScale={baseScale}
                isFocused={index === focusedIndex}
                bobDelayMs={index * 350}
                onSelect={handleSelectTopic}
              />
            );
          })}
      </div>

      {hasActivity && visibleTopics.length > 1 && (
        <p className="mt-2 text-center text-xs text-text-muted">
          {swipeHintLabel}
        </p>
      )}
    </div>
  );
}
