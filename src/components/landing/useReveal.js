// src/components/landing/useReveal.js
import { useEffect } from 'react';
import { gsap } from './gsapSetup';
import { usePrefersReducedMotion } from './useReducedMotion';

/**
 * Fades + slides the element `ref` points at up as it scrolls into view.
 * Pass `stagger` (seconds) to animate its direct children one after
 * another instead of the element as a single block — use that for grids.
 * Works on any element ref, MUI `Box` included (Box forwards its ref).
 */
export function useReveal(ref, { stagger = 0, y = 40, delay = 0 } = {}) {
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced || !ref.current) return undefined;

    const targets = stagger ? ref.current.children : ref.current;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          delay,
          ease: 'power3.out',
          stagger: stagger || 0,
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 85%',
            once: true,
          },
        }
      );
    }, ref);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, stagger, y, delay]);
}
