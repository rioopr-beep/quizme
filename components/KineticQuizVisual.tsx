'use client';

import { useEffect, useRef } from 'react';

type LetterConfig = {
  char: string;
  top: string;
  left: string;
  mobileTop: string;
  mobileLeft: string;
  color: string;
  depth: number;
  floatAmp: number;
  floatAmpX: number;
  floatPeriod: number;
  floatPhase: number;
  rotAmp: number;
  entranceDelay: number;
};

// Desktop composition: scattered diagonally, per the original spec sketch.
// Mobile composition: re-centered and pulled in from the edges so nothing
// clips the narrower container — a separate layout, not just a shrink.
const LETTERS: LetterConfig[] = [
  {
    char: 'Q',
    top: '2%', left: '54%',
    mobileTop: '2%', mobileLeft: '46%',
    color: '#2955F2', depth: 1.0,
    floatAmp: 24, floatAmpX: 10, floatPeriod: 3600, floatPhase: 0, rotAmp: 4, entranceDelay: 0,
  },
  {
    char: 'U',
    top: '34%', left: '4%',
    mobileTop: '30%', mobileLeft: '4%',
    color: '#0A0A0A', depth: 0.7,
    floatAmp: 18, floatAmpX: 8, floatPeriod: 4400, floatPhase: Math.PI, rotAmp: 3, entranceDelay: 100,
  },
  {
    char: 'I',
    top: '48%', left: '62%',
    mobileTop: '46%', mobileLeft: '64%',
    color: '#0A0A0A', depth: 0.4,
    floatAmp: 13, floatAmpX: 6, floatPeriod: 3100, floatPhase: Math.PI * 0.5, rotAmp: 6, entranceDelay: 200,
  },
  {
    char: 'Z',
    top: '68%', left: '30%',
    mobileTop: '72%', mobileLeft: '28%',
    color: '#2955F2', depth: 0.8,
    floatAmp: 20, floatAmpX: 9, floatPeriod: 4100, floatPhase: Math.PI * 1.4, rotAmp: 4, entranceDelay: 300,
  },
];

const MAX_PARALLAX = 22;
const MAX_TOUCH_PARALLAX = 16;
const MOBILE_BREAKPOINT = 640; // matches Tailwind's `sm`

// --- Drag interaction tuning ---
const MAX_DRAG = 64; // px — invisible boundary radius a letter can be pulled from its float position
const RETURN_DECAY = 0.9; // per-frame decay while easing back to origin after release (~0.9 ≈ smooth glide home)

export default function KineticQuizVisual(): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>(LETTERS.map(() => null));

  const pointer = useRef({ x: 0, y: 0, active: false });
  const scrollProgress = useRef(0);
  const hovered = useRef(-1);
  const reducedMotion = useRef(false);
  const startTime = useRef<number | null>(null);
  const rafId = useRef<number | null>(null);

  // Per-letter drag state (independent — each letter can be dragged on its own).
  const isDragging = useRef<boolean[]>(LETTERS.map(() => false));
  const activePointerId = useRef<(number | null)[]>(LETTERS.map(() => null));
  const dragStart = useRef<{ x: number; y: number }[]>(LETTERS.map(() => ({ x: 0, y: 0 })));
  const dragOffsetStart = useRef<{ x: number; y: number }[]>(LETTERS.map(() => ({ x: 0, y: 0 })));
  const dragOffset = useRef<{ x: number; y: number }[]>(LETTERS.map(() => ({ x: 0, y: 0 })));

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotion.current = mq.matches;
    const onMQ = (e: MediaQueryListEvent) => (reducedMotion.current = e.matches);
    mq.addEventListener?.('change', onMQ);

    const fineMq = window.matchMedia('(hover: hover) and (pointer: fine)');
    let fine = fineMq.matches;
    const onFineChange = (e: MediaQueryListEvent) => (fine = e.matches);
    fineMq.addEventListener?.('change', onFineChange);

    // --- Mobile vs desktop composition (position only, not the motion params) ---
    const applyPositions = () => {
      const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
      LETTERS.forEach((cfg, i) => {
        const el = letterRefs.current[i];
        if (!el) return;
        el.style.top = isMobile ? cfg.mobileTop : cfg.top;
        el.style.left = isMobile ? cfg.mobileLeft : cfg.left;
      });
    };
    applyPositions();
    window.addEventListener('resize', applyPositions);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      pointer.current.x = Math.max(-1, Math.min(1, (e.clientX - cx) / (rect.width / 2)));
      pointer.current.y = Math.max(-1, Math.min(1, (e.clientY - cy) / (rect.height / 2)));
      pointer.current.active = true;
    };
    const handleMouseLeave = () => {
      pointer.current.x = 0;
      pointer.current.y = 0;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      const t = e.touches?.[0];
      if (!rect || !t) return;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      pointer.current.x = Math.max(-1, Math.min(1, (t.clientX - cx) / (rect.width / 2)));
      pointer.current.y = Math.max(-1, Math.min(1, (t.clientY - cy) / (rect.height / 2)));
      pointer.current.active = true;
    };
    const handleTouchEnd = () => {
      pointer.current.active = false;
    };
    const handleScroll = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const raw = -rect.top / (rect.height * 0.9 || 1);
      scrollProgress.current = Math.max(0, Math.min(1, raw));
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    containerRef.current?.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    const ease = (t: number) => 1 - Math.pow(1 - t, 3);

    const tick = (ts: number) => {
      if (startTime.current === null) startTime.current = ts;
      const elapsed = ts - startTime.current;
      const isMobile = window.innerWidth < MOBILE_BREAKPOINT;

      LETTERS.forEach((cfg, i) => {
        const el = letterRefs.current[i];
        if (!el) return;

        const dragging = isDragging.current[i];
        const offset = dragOffset.current[i];

        // Ease the drag offset back to the origin once released — "perlahan
        // kembali ke posisi asal". While actively dragging, offset is driven
        // directly by the pointer handlers instead.
        if (!dragging) {
          offset.x *= RETURN_DECAY;
          offset.y *= RETURN_DECAY;
          if (Math.abs(offset.x) < 0.05) offset.x = 0;
          if (Math.abs(offset.y) < 0.05) offset.y = 0;
        }

        const entT = Math.max(0, Math.min(1, (elapsed - cfg.entranceDelay) / 500));
        const entEase = ease(entT);
        const entranceY = (1 - entEase) * 36;
        const entranceOpacity = reducedMotion.current ? 1 : entEase;

        // Idle floating pauses the instant a letter is grabbed, and resumes
        // immediately once released (it keeps running underneath the
        // ease-back so the motion never looks like it "restarts").
        const floatScale = reducedMotion.current || dragging ? 0 : entEase;
        const angle = (elapsed / cfg.floatPeriod) * Math.PI * 2 + cfg.floatPhase;
        const floatY = Math.sin(angle) * cfg.floatAmp * floatScale;
        const floatX = Math.sin(angle * 0.6 + cfg.floatPhase * 0.5) * cfg.floatAmpX * floatScale;
        const floatRot = Math.sin(angle * 0.8) * cfg.rotAmp * floatScale;

        // Cursor parallax only makes sense with a fine pointer (desktop);
        // touch parallax is handled separately and works on every size.
        // Both pause while the letter itself is being dragged.
        const cursorActive = fine && !isMobile;
        const parallaxStrength = reducedMotion.current || dragging
          ? 0
          : (pointer.current.active ? MAX_TOUCH_PARALLAX : cursorActive ? MAX_PARALLAX : 0) * cfg.depth;
        const parX = pointer.current.x * parallaxStrength;
        const parY = pointer.current.y * parallaxStrength * 0.7;

        const sp = reducedMotion.current ? Math.min(scrollProgress.current, 1) * 0.4 : scrollProgress.current;
        const scrollY = sp * -70 * cfg.depth;
        const scrollScale = 1 - sp * 0.18;
        const scrollOpacity = 1 - sp * 0.85;

        const isHovered = hovered.current === i;
        const hoverScale = isHovered && !dragging ? 1.08 : dragging ? 1.12 : 1;
        const hoverY = isHovered && !dragging ? -8 : 0;

        const totalY = entranceY + floatY + parY + scrollY + hoverY + offset.y;
        const totalX = floatX + parX + offset.x;
        const totalRot = floatRot;
        const totalScale = scrollScale * hoverScale;
        const totalOpacity = Math.max(0, entranceOpacity * scrollOpacity);

        el.style.transform = `translate3d(${totalX}px, ${totalY}px, 0) rotate(${totalRot}deg) scale(${totalScale})`;
        el.style.opacity = String(totalOpacity);
        el.style.textShadow = isHovered || dragging
          ? '0 18px 30px rgba(41,85,242,0.28)'
          : '0 10px 24px rgba(41,85,242,0.14)';
        el.style.cursor = dragging ? 'grabbing' : 'grab';
      });

      rafId.current = requestAnimationFrame(tick);
    };

    rafId.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('resize', applyPositions);
      window.removeEventListener('mousemove', handleMouseMove);
      containerRef.current?.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('scroll', handleScroll);
      mq.removeEventListener?.('change', onMQ);
      fineMq.removeEventListener?.('change', onFineChange);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  // --- Drag handlers (per letter, independent — each is its own draggable object) ---
  const handlePointerDown = (i: number) => (e: React.PointerEvent<HTMLSpanElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    isDragging.current[i] = true;
    activePointerId.current[i] = e.pointerId;
    dragStart.current[i] = { x: e.clientX, y: e.clientY };
    dragOffsetStart.current[i] = { ...dragOffset.current[i] };
    hovered.current = i;
  };

  const handlePointerMove = (i: number) => (e: React.PointerEvent<HTMLSpanElement>) => {
    if (!isDragging.current[i] || activePointerId.current[i] !== e.pointerId) return;
    const dx = e.clientX - dragStart.current[i].x;
    const dy = e.clientY - dragStart.current[i].y;
    let nx = dragOffsetStart.current[i].x + dx;
    let ny = dragOffsetStart.current[i].y + dy;

    // Constrain to an invisible bounding circle around the letter's float position.
    const dist = Math.hypot(nx, ny);
    if (dist > MAX_DRAG) {
      const scale = MAX_DRAG / dist;
      nx *= scale;
      ny *= scale;
    }
    dragOffset.current[i] = { x: nx, y: ny };
  };

  const handlePointerRelease = (i: number) => (e: React.PointerEvent<HTMLSpanElement>) => {
    if (activePointerId.current[i] !== e.pointerId) return;
    isDragging.current[i] = false;
    activePointerId.current[i] = null;
    hovered.current = -1;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[280px] sm:h-[380px] md:h-[480px] select-none"
      aria-hidden="true"
    >
      {LETTERS.map((cfg, i) => (
        <span
          key={cfg.char}
          ref={(node) => {
            letterRefs.current[i] = node;
          }}
          onMouseEnter={() => !isDragging.current[i] && (hovered.current = i)}
          onMouseLeave={() => !isDragging.current[i] && (hovered.current = -1)}
          onPointerDown={handlePointerDown(i)}
          onPointerMove={handlePointerMove(i)}
          onPointerUp={handlePointerRelease(i)}
          onPointerCancel={handlePointerRelease(i)}
          className="absolute font-black leading-none will-change-transform"
          style={{
            top: cfg.top,
            left: cfg.left,
            color: cfg.color,
            fontSize: 'clamp(48px, 9vw, 140px)',
            opacity: 0,
            touchAction: 'none',
            transition: 'text-shadow 300ms ease',
          }}
        >
          {cfg.char}
        </span>
      ))}
    </div>
  );
        }
