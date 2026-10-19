'use client';

import { useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useIsoLayoutEffect } from '@/lib/hooks';
import { products } from '@/data/products';
import DrawingCanvas from './DrawingCanvas';

const EDGE = 14; // tablet thickness in px for the CSS 3D slab

export default function Pad() {
  const stage = useRef<HTMLDivElement>(null);
  const tablet = useRef<HTMLDivElement>(null);
  const pro = products['pad-9-pro-max'];

  useIsoLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add(
      { motion: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' },
      (ctx) => {
        if (ctx.conditions?.reduce) {
          gsap.set('.pad-title', { autoAlpha: 0 });
          return;
        }
        // Edge-on → flat → fills the viewport and becomes the page.
        gsap.set(tablet.current, { rotationY: -76, rotationX: 16, scale: 0.42, transformPerspective: 1800 });
        gsap.set('.pad-hint', { autoAlpha: 0, y: 20 });
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: stage.current, start: 'top top', end: '+=220%', pin: true, scrub: 0.8 },
        });
        tl.to({}, { duration: 1 }, 0)
          .to(tablet.current, { rotationY: 0, rotationX: 0, scale: 0.58, duration: 0.38, ease: 'power1.inOut' }, 0)
          .to('.pad-title', { autoAlpha: 0, y: -80, scale: 0.92, duration: 0.18 }, 0.34)
          .to(tablet.current, { scale: 1, duration: 0.32, ease: 'power2.inOut' }, 0.42)
          .to('.pad-glow', { autoAlpha: 0, duration: 0.2 }, 0.5)
          .to('.pad-hint', { autoAlpha: 1, y: 0, duration: 0.06 }, 0.78);
      },
      stage,
    );
    return () => mm.revert();
  }, []);

  return (
    <section id="pad" aria-labelledby="pad-title" className="relative">
      <div ref={stage} className="relative grid h-screen place-items-center overflow-hidden" style={{ perspective: 1800 }}>
        <div aria-hidden className="pad-glow ambient-glow absolute left-1/2 top-1/2 h-[80vmin] w-[120vmin] rounded-full opacity-70" />

        <div className="pad-title pointer-events-none absolute inset-x-0 top-[12svh] z-0 px-6 text-center">
          <p className="eyebrow mb-4">03 — Xiaomi Pad 9 · Pad 9 Pro Max</p>
          <h2 id="pad-title" className="display display-xl">
            A studio you
            <br />
            can <span className="text-gradient-mi">carry.</span>
          </h2>
        </div>

        <div
          ref={tablet}
          className="relative z-10 aspect-[3/4] w-[min(92vw,66svh)] md:aspect-[1.45] md:w-[min(94vw,132svh)]"
          style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
        >
          {/* Back */}
          <div
            aria-hidden
            className="absolute inset-0 rounded-[4%] md:rounded-[3%]"
            style={{ transform: `rotateY(180deg) translateZ(${EDGE / 2}px)`, background: 'linear-gradient(135deg, #3a3b40, #1d1e22)' }}
          >
            <div className="absolute right-[6%] top-[6%] h-[7%] w-auto rounded-full border border-white/20 bg-black/80" style={{ aspectRatio: 1 }} />
          </div>
          {/* Edges */}
          {(['left', 'right'] as const).map((side) => (
            <div
              key={side}
              aria-hidden
              className="absolute top-[3%] h-[94%]"
              style={{
                width: EDGE,
                [side]: -EDGE / 2,
                transform: 'rotateY(90deg)',
                background: 'linear-gradient(90deg, #6b6c72, #c9cacf 50%, #6b6c72)',
              }}
            />
          ))}
          {(['top', 'bottom'] as const).map((side) => (
            <div
              key={side}
              aria-hidden
              className="absolute left-[3%] w-[94%]"
              style={{
                height: EDGE,
                [side]: -EDGE / 2,
                transform: 'rotateX(90deg)',
                background: 'linear-gradient(180deg, #6b6c72, #c9cacf 50%, #6b6c72)',
              }}
            />
          ))}
          {/* Front */}
          <div
            className="absolute inset-0 rounded-[4%] bg-[#0b0b0d] p-[1.6%] shadow-[0_40px_120px_-20px_rgba(255,105,0,0.35)] ring-1 ring-white/15 md:rounded-[3%] md:p-[1.1%]"
            style={{ transform: `translateZ(${EDGE / 2}px)` }}
          >
            <div className="relative h-full w-full overflow-hidden rounded-[3%] md:rounded-[2.2%]">
              <DrawingCanvas />
            </div>
          </div>
        </div>

        <p className="pad-hint glass pointer-events-none absolute bottom-5 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full px-4 py-2 text-xs text-white/80">
          {pro.specs.display} · Focus Pen 3 pressure simulation
        </p>
      </div>

    </section>
  );
}
