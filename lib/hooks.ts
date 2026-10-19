'use client';

import { useEffect, useLayoutEffect, useState, type RefObject } from 'react';

export const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [query]);
  return matches;
}

export const useReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');
export const useIsMobile = () => useMediaQuery('(max-width: 767px), (pointer: coarse)');

/** True while the element is within `rootMargin` of the viewport. */
export function useInView(ref: RefObject<Element>, rootMargin = '0px', once = false) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting && once) io.disconnect();
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin, once]);
  return inView;
}

/** Resolves once the preloader has finished (or immediately if it already has). */
export function onPreloaderDone(cb: () => void) {
  if (typeof window === 'undefined') return () => {};
  if (window.__preloaderDone) {
    cb();
    return () => {};
  }
  window.addEventListener('preloader:done', cb, { once: true });
  return () => window.removeEventListener('preloader:done', cb);
}

export function usePreloaderDone() {
  const [done, setDone] = useState(false);
  useEffect(() => onPreloaderDone(() => setDone(true)), []);
  return done;
}

/** Smooth-scrolls to a section id through Lenis when it is running. */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (window.__lenis) window.__lenis.scrollTo(el, { duration: 1.6 });
  else el.scrollIntoView({ behavior: 'smooth' });
}
