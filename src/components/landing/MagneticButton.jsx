// src/components/landing/MagneticButton.jsx
import React, { useEffect, useRef } from 'react';
import { gsap } from './gsapSetup';
import { usePrefersReducedMotion, useFinePointer } from './useReducedMotion';

const RADIUS = 90;
const STRENGTH = 0.35;

/**
 * Wraps a button and nudges it toward the cursor when the pointer is
 * within RADIUS px, springing back once it leaves. No-ops on touch
 * devices and for reduced-motion users — children render as-is.
 */
export default function MagneticButton({ children }) {
  const ref = useRef(null);
  const reduced = usePrefersReducedMotion();
  const finePointer = useFinePointer();
  const enabled = !reduced && finePointer;

  useEffect(() => {
    if (!enabled) return undefined;
    const el = ref.current;
    if (!el) return undefined;

    const moveX = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
    const moveY = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });

    function onMove(e) {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist < RADIUS) {
        moveX(dx * STRENGTH);
        moveY(dy * STRENGTH);
      } else {
        moveX(0);
        moveY(0);
      }
    }

    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [enabled]);

  return (
    <span ref={ref} style={{ display: 'inline-block' }}>
      {children}
    </span>
  );
}
