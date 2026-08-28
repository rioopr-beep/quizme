'use client';

// ============================================================================
// ParticleLayer — dekorasi partikel Quiz Universe.
// WAJIB pakai satu <canvas> (bukan puluhan DOM element per partikel).
// Auto-pause kalau: keluar viewport (IntersectionObserver), tab tidak aktif
// (Page Visibility API), atau prefers-reduced-motion aktif.
// ============================================================================

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  radius: number;
  speed: number;
  driftPhase: number;
  opacity: number;
}

const PARTICLE_COUNT = 26;

export default function ParticleLayer(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas == null) return;

    const context = canvas.getContext('2d');
    if (context == null) return;

    const reducedMotionQuery = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    );

    let particles: Particle[] = [];
    let animationFrameId = 0;
    let isPaused = false;
    let width = 0;
    let height = 0;

    function resize(): void {
      const canvasEl = canvasRef.current;
      if (canvasEl == null) return;
      const rect = canvasEl.parentElement?.getBoundingClientRect();
      width = rect?.width ?? canvasEl.clientWidth;
      height = rect?.height ?? canvasEl.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvasEl.width = width * dpr;
      canvasEl.height = height * dpr;
      context?.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function seedParticles(): void {
      particles = Array.from({ length: PARTICLE_COUNT }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 0.8 + Math.random() * 1.4,
        speed: 0.04 + Math.random() * 0.06,
        driftPhase: Math.random() * Math.PI * 2,
        opacity: 0.15 + Math.random() * 0.25,
      }));
    }

    function draw(): void {
      if (context == null) return;
      context.clearRect(0, 0, width, height);

      const staticFrame = reducedMotionQuery.matches;

      for (const particle of particles) {
        if (!staticFrame) {
          particle.y -= particle.speed;
          particle.x += Math.sin(particle.driftPhase + particle.y * 0.02) * 0.15;
          if (particle.y < -4) {
            particle.y = height + 4;
            particle.x = Math.random() * width;
          }
        }

        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(91, 127, 214, ${particle.opacity})`;
        context.fill();
      }

      if (!staticFrame && !isPaused) {
        animationFrameId = requestAnimationFrame(draw);
      }
    }

    function start(): void {
      if (isPaused) return;
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(draw);
    }

    function stop(): void {
      cancelAnimationFrame(animationFrameId);
    }

    resize();
    seedParticles();
    draw();

    const handleResize = (): void => {
      resize();
      seedParticles();
    };
    window.addEventListener('resize', handleResize);

    const handleVisibilityChange = (): void => {
      if (document.hidden) {
        stop();
      } else if (!isPaused) {
        start();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    let observer: IntersectionObserver | null = null;
    if (canvas.parentElement != null) {
      observer = new IntersectionObserver(
        ([entry]) => {
          isPaused = !entry.isIntersecting;
          if (isPaused) {
            stop();
          } else {
            start();
          }
        },
        { threshold: 0.1 },
      );
      observer.observe(canvas.parentElement);
    }

    return () => {
      stop();
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      observer?.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
