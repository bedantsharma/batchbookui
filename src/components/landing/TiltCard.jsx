// src/components/landing/TiltCard.jsx
import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { gsap } from './gsapSetup';
import { usePrefersReducedMotion, useFinePointer } from './useReducedMotion';

const MAX_TILT_DEG = 8;

/**
 * Gives a card a subtle 3D tilt that follows the cursor, plus a small
 * lift. No-ops on touch devices and for reduced-motion users.
 */
export default function TiltCard({ children, sx, ...rest }) {
  const ref = useRef(null);
  const reduced = usePrefersReducedMotion();
  const finePointer = useFinePointer();
  const enabled = !reduced && finePointer;

  useEffect(() => {
    if (!enabled) return undefined;
    const el = ref.current;
    if (!el) return undefined;

    gsap.set(el, { transformPerspective: 700 });
    const rotX = gsap.quickTo(el, 'rotationX', { duration: 0.4, ease: 'power3.out' });
    const rotY = gsap.quickTo(el, 'rotationY', { duration: 0.4, ease: 'power3.out' });
    const lift = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });

    function onMove(e) {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      rotY(px * MAX_TILT_DEG * 2);
      rotX(-py * MAX_TILT_DEG * 2);
      lift(-4);
    }
    function onLeave() {
      rotX(0);
      rotY(0);
      lift(0);
    }

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [enabled]);

  return (
    <Box ref={ref} sx={sx} {...rest}>
      {children}
    </Box>
  );
}
