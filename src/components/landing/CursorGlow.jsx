// src/components/landing/CursorGlow.jsx
import React, { useEffect, useRef } from 'react';
import { gsap } from './gsapSetup';
import { usePrefersReducedMotion, useFinePointer } from './useReducedMotion';

/**
 * A soft, low-opacity glow that trails the cursor across the whole page.
 * Purely decorative — skipped on touch devices and for reduced-motion users.
 */
export default function CursorGlow() {
  const ref = useRef(null);
  const reduced = usePrefersReducedMotion();
  const finePointer = useFinePointer();
  const enabled = !reduced && finePointer;

  useEffect(() => {
    if (!enabled) return undefined;
    const el = ref.current;
    if (!el) return undefined;

    const moveX = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
    const moveY = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });

    function onMove(e) {
      moveX(e.clientX);
      moveY(e.clientY);
    }
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={ref}
      aria-hidden
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 480,
        height: 480,
        marginLeft: -240,
        marginTop: -240,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(187,134,252,0.14) 0%, rgba(187,134,252,0) 70%)',
        pointerEvents: 'none',
        zIndex: 0,
        willChange: 'transform',
      }}
    />
  );
}
