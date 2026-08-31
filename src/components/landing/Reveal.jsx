// src/components/landing/Reveal.jsx
import React, { useRef } from 'react';
import { useReveal } from './useReveal';

/** Convenience wrapper for a plain block that doesn't need MUI's `sx`. */
export default function Reveal({ children, stagger, y, delay, ...rest }) {
  const ref = useRef(null);
  useReveal(ref, { stagger, y, delay });

  return (
    <div ref={ref} {...rest}>
      {children}
    </div>
  );
}
