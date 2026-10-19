'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  // Mobile toolbars resize the viewport while scrolling; re-measuring pins then causes jumps.
  ScrollTrigger.config({ ignoreMobileResize: true });
}

export { gsap, ScrollTrigger };
