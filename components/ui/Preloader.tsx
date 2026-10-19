'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

/** Orange 0→100 counter, then the panel wipes upward to reveal the hero. */
export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const num = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const counter = { v: 0 };

    // Dispatched on a fresh task: GSAP runs timeline callbacks inside their context,
    // so tweens other components create in response would be reverted with ours.
    const finish = () => {
      setTimeout(() => {
        window.__preloaderDone = true;
        window.dispatchEvent(new Event('preloader:done'));
        ScrollTrigger.refresh();
      }, 0);
    };

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ onComplete: () => setGone(true) });
      tl.to(counter, {
        v: 100,
        duration: reduced ? 0.3 : 1.9,
        ease: 'power2.inOut',
        onUpdate: () => {
          if (num.current) num.current.textContent = String(Math.round(counter.v)).padStart(3, '0');
          if (bar.current) bar.current.style.transform = `scaleX(${counter.v / 100})`;
        },
      });
      // Wait for webfonts so canvas screen textures draw with the right typeface.
      tl.add(() => {
        tl.pause();
        document.fonts.ready.then(() => tl.resume());
      });
      if (reduced) {
        tl.to(root.current, { autoAlpha: 0, duration: 0.3 }).add(finish, '<');
      } else {
        tl.to('.pl-content', { yPercent: -40, autoAlpha: 0, duration: 0.6, ease: 'power3.in' })
          .to(root.current, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.1, ease: 'expo.inOut' }, '-=0.15')
          .add(finish, '-=0.75');
      }
    }, root);
    return () => ctx.revert();
  }, []);

  if (gone) return null;

  return (
    <div
      ref={root}
      role="status"
      aria-label="Loading"
      className="fixed inset-0 z-[200] flex items-end justify-between bg-ink p-6 md:p-12"
      style={{ clipPath: 'inset(0% 0% 0% 0%)' }}
    >
      <div className="pl-content flex w-full items-end justify-between">
        <div>
          <p className="eyebrow mb-3">Xiaomi Ecosystem 2026</p>
          <p className="max-w-xs text-sm text-white/50">Calibrating screens, folding hinges, charging pens.</p>
        </div>
        <span ref={num} className="display text-mi" style={{ fontSize: 'clamp(5rem, 18vw, 16rem)' }}>
          000
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-white/5">
        <div ref={bar} className="h-full origin-left bg-mi" style={{ transform: 'scaleX(0)' }} />
      </div>
    </div>
  );
}
