// src/components/landing/gsapSetup.js
// Central place to register GSAP plugins once, so every landing-page
// effect component can just import { gsap, ScrollTrigger } from here.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
