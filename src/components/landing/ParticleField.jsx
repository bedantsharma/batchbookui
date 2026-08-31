// src/components/landing/ParticleField.jsx
import React, { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from './useReducedMotion';

const PARTICLE_RGB = '187,134,252'; // keep in sync with LandingPage's T.primary (#BB86FC)
const LINK_DISTANCE = 130;
const CURSOR_RADIUS = 160;
const AREA_PER_PARTICLE = 9000; // px^2 per particle — lower = denser field

/**
 * Cursor-reactive particle field: dots drift slowly, draw a faint line
 * to nearby dots, and scatter gently away from the pointer. Meant to
 * sit as an absolutely-positioned background behind the hero copy.
 *
 * Renders one still frame (no animation loop, no cursor tracking) for
 * users who've asked for reduced motion.
 */
export default function ParticleField({ style }) {
  const canvasRef = useRef(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');

    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles = [];
    let rafId = null;
    const pointer = { x: -9999, y: -9999, active: false };

    function seed() {
      const count = Math.round((width * height) / AREA_PER_PARTICLE);
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.4 + 0.6,
      }));
    }

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    function render(animate) {
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        if (animate) {
          p.x += p.vx;
          p.y += p.vy;

          if (pointer.active) {
            const dx = p.x - pointer.x;
            const dy = p.y - pointer.y;
            const dist = Math.hypot(dx, dy);
            if (dist < CURSOR_RADIUS && dist > 0.01) {
              const force = (1 - dist / CURSOR_RADIUS) * 0.03;
              p.vx += (dx / dist) * force;
              p.vy += (dy / dist) * force;
            }
          }

          p.vx *= 0.98;
          p.vy *= 0.98;

          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;
          p.x = Math.max(0, Math.min(width, p.x));
          p.y = Math.max(0, Math.min(height, p.y));
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${PARTICLE_RGB},0.55)`;
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < LINK_DISTANCE) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${PARTICLE_RGB},${0.18 * (1 - dist / LINK_DISTANCE)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      if (pointer.active) {
        for (const p of particles) {
          const dist = Math.hypot(p.x - pointer.x, p.y - pointer.y);
          if (dist < CURSOR_RADIUS) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(pointer.x, pointer.y);
            ctx.strokeStyle = `rgba(${PARTICLE_RGB},${0.28 * (1 - dist / CURSOR_RADIUS)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
    }

    function loop() {
      render(true);
      rafId = requestAnimationFrame(loop);
    }

    function onPointerMove(e) {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
    }
    function onPointerLeave() {
      pointer.active = false;
    }

    resize();
    window.addEventListener('resize', resize);

    if (reduced) {
      render(false);
      return () => window.removeEventListener('resize', resize);
    }

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerleave', onPointerLeave);

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && rafId === null) {
          loop();
        } else if (!entry.isIntersecting && rafId !== null) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      },
      { threshold: 0 }
    );
    io.observe(canvas);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      io.disconnect();
    };
  }, [reduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', pointerEvents: 'none', ...style }}
    />
  );
}
