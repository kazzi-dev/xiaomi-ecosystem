'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { onPreloaderDone, useReducedMotion } from '@/lib/hooks';

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // The site always opens on the hero intro, even if the browser restored a scroll position.
    if (!window.__preloaderDone) {
      lenis.scrollTo(0, { immediate: true, force: true });
      lenis.stop();
    }
    const off = onPreloaderDone(() => {
      if (window.scrollY > 0 && lenis.isStopped) lenis.scrollTo(0, { immediate: true, force: true });
      lenis.start();
    });

    return () => {
      off();
      gsap.ticker.remove(tick);
      lenis.destroy();
      delete window.__lenis;
    };
  }, [reduced]);

  return <>{children}</>;
}
