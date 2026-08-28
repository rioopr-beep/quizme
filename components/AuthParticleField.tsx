'use client';

import { useEffect, useRef } from 'react';

/**
 * 3D character particle field background for the auth pages.
 * - 9 individual letters (Q U I Z F R E N D) distributed on a Fibonacci sphere
 * - drag (mouse) / swipe (touch) rotates the whole field, with inertia after release
 * - each particle floats independently (own phase/speed)
 * - depth (opacity/blur/scale) is recomputed every frame from the current rotation
 * - respects prefers-reduced-motion
 *
 * Usage: render this absolutely/fixed behind your auth form, e.g.
 *   <div className="relative min-h-screen">
 *     <AuthParticleField />
 *     <main className="relative z-10 ...">...your form...</main>
 *   </div>
 */

const LETTERS = ['Q', 'U', 'I', 'Z', 'F', 'R', 'E', 'N', 'D'];

type Particle = {
  el: HTMLDivElement;
  x0: number;
  y0: number;
  z0: number;
  phase: number;
  speed: number;
  ampX: number;
  ampY: number;
};

export default function AuthParticleField() {
  const stageRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const scene = sceneRef.current;
    if (!stage || !scene) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 640;
    const REPEAT = isMobile ? 2 : 4;
    const COUNT = LETTERS.length * REPEAT;
    const SPHERE_R = isMobile ? 190 : 340;

    let particles: Particle[] = [];
    let rafId = 0;

    function buildField() {
      if (!scene) return;
      scene.innerHTML = '';
      particles = [];
      const golden = Math.PI * (3 - Math.sqrt(5));

      for (let i = 0; i < COUNT; i++) {
        const yFrac = 1 - (i / (COUNT - 1)) * 2;
        const radiusAtY = Math.sqrt(Math.max(0, 1 - yFrac * yFrac));
        const theta = golden * i;
        const x = Math.cos(theta) * radiusAtY;
        const y = yFrac;
        const z = Math.sin(theta) * radiusAtY;

        const jitter = 0.62 + Math.random() * 0.5;
        const x0 = x * SPHERE_R * jitter;
        const y0 = y * SPHERE_R * jitter;
        const z0 = z * SPHERE_R * jitter;

        const el = document.createElement('div');
        el.textContent = LETTERS[i % LETTERS.length];
        el.style.position = 'absolute';
        el.style.top = '0';
        el.style.left = '0';
        el.style.transform = 'translate(-50%,-50%)';
        el.style.fontFamily = "'Plus Jakarta Sans', ui-sans-serif, sans-serif";
        el.style.fontWeight = '700';
        el.style.color = '#3E5BE8';
        el.style.userSelect = 'none';
        el.style.pointerEvents = 'none';
        el.style.willChange = 'transform, opacity, filter';
        const size = isMobile ? 20 + Math.random() * 16 : 26 + Math.random() * 26;
        el.style.fontSize = `${size.toFixed(1)}px`;
        scene.appendChild(el);

        particles.push({
          el,
          x0,
          y0,
          z0,
          phase: Math.random() * Math.PI * 2,
          speed: 0.12 + Math.random() * 0.16,
          ampY: reduceMotion ? 0 : 6 + Math.random() * 12,
          ampX: reduceMotion ? 0 : 3 + Math.random() * 7,
        });
      }
    }

    buildField();

    let theta = 24;
    let velocity = 0;
    let dragging = false;
    let lastX = 0;

    function setSceneTransform() {
      if (scene) scene.style.transform = `translate(-50%,-50%) rotateY(${theta}deg)`;
    }

    function startDrag(x: number) {
      dragging = true;
      stage?.classList.add('cursor-grabbing');
      lastX = x;
      velocity = 0;
    }
    function moveDrag(x: number) {
      if (!dragging) return;
      const dx = x - lastX;
      lastX = x;
      const delta = dx * 0.22;
      theta += delta;
      velocity = reduceMotion ? 0 : delta;
      setSceneTransform();
    }
    function endDrag() {
      dragging = false;
      stage?.classList.remove('cursor-grabbing');
    }

    const onPointerDown = (e: PointerEvent) => {
      stage.setPointerCapture(e.pointerId);
      startDrag(e.clientX);
    };
    const onPointerMove = (e: PointerEvent) => moveDrag(e.clientX);
    const onPointerUp = () => endDrag();

    stage.addEventListener('pointerdown', onPointerDown);
    stage.addEventListener('pointermove', onPointerMove);
    stage.addEventListener('pointerup', onPointerUp);
    stage.addEventListener('pointercancel', onPointerUp);

    const radConst = Math.PI / 180;

    function tick(t: number) {
      if (!dragging && Math.abs(velocity) > 0.015) {
        theta += velocity;
        velocity *= 0.93;
        setSceneTransform();
      }

      const time = t / 1000;
      const rad = theta * radConst;
      const sinT = Math.sin(rad);
      const cosT = Math.cos(rad);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const floatX = p.ampX * Math.cos(time * p.speed * 0.8 + p.phase);
        const floatY = p.ampY * Math.sin(time * p.speed + p.phase);

        const effZ = p.x0 * sinT + p.z0 * cosT;
        const depth01 = Math.min(1, Math.max(0, (effZ / SPHERE_R + 1) / 2));

        const opacity = 0.12 + depth01 * 0.68;
        const blur = (1 - depth01) * 4.5;
        const scale = 0.62 + depth01 * 0.7;

        p.el.style.transform = `translate3d(${(p.x0 + floatX).toFixed(1)}px, ${(p.y0 + floatY).toFixed(1)}px, ${p.z0.toFixed(1)}px) scale(${scale.toFixed(2)})`;
        p.el.style.opacity = opacity.toFixed(2);
        p.el.style.filter = blur > 0.08 ? `blur(${blur.toFixed(1)}px)` : 'none';
      }

      rafId = requestAnimationFrame(tick);
    }

    setSceneTransform();
    rafId = requestAnimationFrame(tick);

    const onResize = () => buildField();
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafId);
      stage.removeEventListener('pointerdown', onPointerDown);
      stage.removeEventListener('pointermove', onPointerMove);
      stage.removeEventListener('pointerup', onPointerUp);
      stage.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div
      ref={stageRef}
      className="fixed inset-0 cursor-grab overflow-hidden touch-none"
      style={{ perspective: '1200px', perspectiveOrigin: '50% 50%' }}
      aria-hidden="true"
    >
      <div
        ref={sceneRef}
        className="absolute left-1/2 top-1/2 h-0 w-0"
        style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 38%, #F6F8FE 96%)',
        }}
      />
    </div>
  );
}
