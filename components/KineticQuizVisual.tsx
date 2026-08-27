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
    floatAmp: 16, floatPeriod: 4200, floatPhase: 0, rotAmp: 3, entranceDelay: 0,
  },
  {
    char: 'U',
    top: '34%', left: '4%',
    mobileTop: '30%', mobileLeft: '4%',
    color: '#0A0A0A', depth: 0.7,
    floatAmp: 11, floatPeriod: 5100, floatPhase: Math.PI, rotAmp: 2, entranceDelay: 100,
  },
  {
    char: 'I',
    top: '48%', left: '62%',
    mobileTop: '46%', mobileLeft: '64%',
    color: '#0A0A0A', depth: 0.4,
    floatAmp: 8, floatPeriod: 3600, floatPhase: Math.PI * 0.5, rotAmp: 5, entranceDelay: 200,
  },
  {
    char: 'Z',
    top: '68%', left: '30%',
    mobileTop: '72%', mobileLeft: '28%',
    color: '#2955F2', depth: 0.8,
    floatAmp: 13, floatPeriod: 4800, floatPhase: Math.PI * 1.4, rotAmp: 3, entranceDelay: 300,
  },
];

const MAX_PARALLAX = 22;
const MAX_TOUCH_PARALLAX = 16;
const MOBILE_BREAKPOINT = 640; // matches Tailwind's `sm`

export default function KineticQuizVisual(): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>(LETTERS.map(() => null));

  const pointer = useRef({ x: 0, y: 0, active: false });
  const scrollProgress = useRef(0);
  const hovered = useRef(-1);
  const reducedMotion = useRef(false);
  const startTime = useRef<number | null>(null);
  const rafId = useRef<number | null>(null);

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

        const entT = Math.max(0, Math.min(1, (elapsed - cfg.entranceDelay) / 500));
        const entEase = ease(entT);
        const entranceY = (1 - entEase) * 36;
        const entranceOpacity = reducedMotion.current ? 1 : entEase;

        const floatScale = reducedMotion.current ? 0 : entEase;
        const angle = (elapsed / cfg.floatPeriod) * Math.PI * 2 + cfg.floatPhase;
        const floatY = Math.sin(angle) * cfg.floatAmp * floatScale;
        const floatRot = Math.sin(angle * 0.8) * cfg.rotAmp * floatScale;

        // Cursor parallax only makes sense with a fine pointer (desktop);
        // touch parallax is handled separately and works on every size.
        const cursorActive = fine && !isMobile;
        const parallaxStrength = reducedMotion.current
          ? 0
          : (pointer.current.active ? MAX_TOUCH_PARALLAX : cursorActive ? MAX_PARALLAX : 0) * cfg.depth;
        const parX = pointer.current.x * parallaxStrength;
        const parY = pointer.current.y * parallaxStrength * 0.7;

        const sp = reducedMotion.current ? Math.min(scrollProgress.current, 1) * 0.4 : scrollProgress.current;
        const scrollY = sp * -70 * cfg.depth;
        const scrollScale = 1 - sp * 0.18;
        const scrollOpacity = 1 - sp * 0.85;

        const isHovered = hovered.current === i;
        const hoverScale = isHovered ? 1.08 : 1;
        const hoverY = isHovered ? -8 : 0;

        const totalY = entranceY + floatY + parY + scrollY + hoverY;
        const totalX = parX;
        const totalRot = floatRot;
        const totalScale = scrollScale * hoverScale;
        const totalOpacity = Math.max(0, entranceOpacity * scrollOpacity);

        el.style.transform = `translate3d(${totalX}px, ${totalY}px, 0) rotate(${totalRot}deg) scale(${totalScale})`;
        el.style.opacity = String(totalOpacity);
        el.style.textShadow = isHovered
          ? '0 18px 30px rgba(41,85,242,0.28)'
          : '0 10px 24px rgba(41,85,242,0.14)';
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
          onMouseEnter={() => (hovered.current = i)}
          onMouseLeave={() => (hovered.current = -1)}
          onTouchStart={() => (hovered.current = i)}
          onTouchEnd={() => (hovered.current = -1)}
          className="absolute font-black leading-none will-change-transform cursor-default"
          style={{
            top: cfg.top,
            left: cfg.left,
            color: cfg.color,
            fontSize: 'clamp(48px, 9vw, 140px)',
            opacity: 0,
            transition: 'text-shadow 300ms ease',
          }}
        >
          {cfg.char}
        </span>
      ))}
    </div>
  );
        }
