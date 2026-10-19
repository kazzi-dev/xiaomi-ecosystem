'use client';

import dynamic from 'next/dynamic';
import { useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { onPreloaderDone, scrollToId, useIsoLayoutEffect } from '@/lib/hooks';
import SplitText from '@/components/ui/SplitText';
import Button from '@/components/ui/Button';
import type { Signal } from '@/components/three/models';

const HeroScene = dynamic(() => import('@/components/three/HeroScene'), { ssr: false });

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const [progress] = useState<Signal>(() => ({ current: 0 }));
  const [intro] = useState<Signal>(() => ({ current: 0 }));

  useIsoLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add(
      { motion: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' },
      (ctx) => {
        if (ctx.conditions?.reduce) {
          intro.current = 1;
          return;
        }
        gsap.set('.hero-line .char', { yPercent: 115 });
        gsap.set('.hero-fade', { autoAlpha: 0, y: 24 });
        gsap.set('.hero-lineup', { autoAlpha: 0, y: 40 });

        // Scroll: headline splits apart, devices fly in (3D reads `progress`).
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: '+=130%',
            pin: true,
            scrub: true,
            onUpdate: (s) => (progress.current = s.progress),
          },
        });
        tl.to('.hero-l1', { yPercent: -70, autoAlpha: 0, ease: 'none' }, 0)
          .to('.hero-l2', { yPercent: 70, autoAlpha: 0, ease: 'none' }, 0)
          .to('.hero-sub', { autoAlpha: 0, y: -30, ease: 'none', duration: 0.4 }, 0)
          .to('.hero-lineup', { autoAlpha: 1, y: 0, ease: 'power2.out', duration: 0.4 }, 0.45)
          .to({}, { duration: 0.3 });

        // Intro: letters rise, then the phone floats up.
        const off = onPreloaderDone(() => {
          gsap.to('.hero-line .char', { yPercent: 0, duration: 1.3, ease: 'expo.out', stagger: 0.028, delay: 0.1 });
          gsap.to('.hero-fade', { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.1, delay: 0.7 });
          gsap.to(intro, { current: 1, duration: 2.2, ease: 'expo.out', delay: 0.2 });
        });
        return off;
      },
      root,
    );
    return () => mm.revert();
  }, []);

  return (
    <section id="hero" ref={root} className="relative h-screen overflow-hidden" aria-label="Introduction">
      <div aria-hidden className="ambient-glow absolute left-1/2 top-1/2 h-[95vmin] w-[95vmin] rounded-full" />

      <h1 className="display pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-between pb-[26svh] pt-[15svh] text-center md:pb-[21svh] md:pt-[10svh]" style={{ fontSize: 'clamp(2.6rem, 11vw, 10rem)' }}>
        <span className="hero-l1 hero-line block">
          <SplitText text="One ecosystem." charClassName="text-gradient" />
        </span>
        <span className="hero-l2 hero-line block">
          <SplitText text="Every screen." charClassName="text-gradient-mi-v" />
        </span>
      </h1>

      <HeroScene progress={progress} intro={intro} />

      <div className="hero-sub absolute inset-x-0 bottom-0 z-20 flex flex-col items-start justify-between gap-6 px-6 pb-8 md:flex-row md:items-end md:px-12 md:pb-10">
        <div className="hero-fade max-w-sm">
          <p className="eyebrow mb-3">Xiaomi 18 Pro · Fold · Pad 9</p>
          <p className="text-sm leading-relaxed text-white/60 md:text-base">
            Four new devices, one HyperOS. Scroll to watch them come together.
          </p>
        </div>
        <div className="hero-fade flex gap-3">
          <Button onClick={() => scrollToId('pro')}>Explore 18 Pro</Button>
          <Button variant="ghost" onClick={() => scrollToId('build')}>
            Build your setup
          </Button>
        </div>
      </div>

      <div className="hero-lineup pointer-events-none absolute inset-x-0 bottom-10 z-20 px-6 text-center">
        <p className="display text-3xl md:text-5xl">
          Phone. Fold. Pad. Watch. <span className="text-mi">One HyperOS.</span>
        </p>
        <p className="mt-3 text-sm text-white/50">Xiaomi 18 Pro Max · Xiaomi 18 Fold · Pad 9 Pro Max · Xiaomi Watch S5</p>
      </div>
    </section>
  );
}
