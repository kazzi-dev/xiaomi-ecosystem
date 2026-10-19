'use client';

import dynamic from 'next/dynamic';
import { useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { useIsoLayoutEffect } from '@/lib/hooks';
import { clamp } from '@/lib/math';
import { foldStats, products } from '@/data/products';
import LazyMount from '@/components/ui/LazyMount';
import type { Signal } from '@/components/three/models';
import type { FoldControl } from '@/components/three/FoldScene';

const FoldScene = dynamic(() => import('@/components/three/FoldScene'), { ssr: false });

function gearPath(teeth: number, ro: number, ri: number) {
  const pts: string[] = [];
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const corners = [
      [ri, a - step * 0.5],
      [ri, a - step * 0.28],
      [ro, a - step * 0.16],
      [ro, a + step * 0.16],
      [ri, a + step * 0.28],
    ];
    for (const [r, ang] of corners) pts.push(`${(Math.cos(ang) * r).toFixed(2)},${(Math.sin(ang) * r).toFixed(2)}`);
  }
  return `M${pts.join('L')}Z`;
}

const GEARS = [
  { x: 150, y: 120, teeth: 12, r: 34, dir: 1, cls: 'hg-gear-a' },
  { x: 214, y: 120, teeth: 10, r: 28, dir: -1, cls: 'hg-gear-b' },
  { x: 182, y: 176, teeth: 8, r: 22, dir: 1, cls: 'hg-gear-c' },
];

function HingeDiagram() {
  return (
    <svg viewBox="0 0 360 260" className="h-auto w-full" aria-hidden>
      <defs>
        <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d9d9de" />
          <stop offset="1" stopColor="#6b6b73" />
        </linearGradient>
      </defs>
      <g className="hg-plate-l">
        <rect x="40" y="60" width="90" height="140" rx="14" fill="#1a1a1f" stroke="#ffffff22" />
        <rect x="56" y="80" width="58" height="8" rx="4" fill="#ffffff14" />
      </g>
      <g className="hg-plate-r">
        <rect x="230" y="60" width="90" height="140" rx="14" fill="#1a1a1f" stroke="#ffffff22" />
        <rect x="246" y="80" width="58" height="8" rx="4" fill="#ffffff14" />
      </g>
      <g className="hg-spine">
        <rect x="120" y="205" width="120" height="22" rx="11" fill="url(#metal)" />
      </g>
      {GEARS.map((g) => (
        <g key={g.cls} transform={`translate(${g.x} ${g.y})`}>
          <g className={g.cls}>
            <path d={gearPath(g.teeth, g.r, g.r * 0.78)} fill="url(#metal)" />
            <circle r={g.r * 0.35} fill="#050505" />
            <circle r={g.r * 0.14} fill="#ff6900" />
          </g>
        </g>
      ))}
    </svg>
  );
}

export default function Fold() {
  const stage = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const [progress] = useState<Signal>(() => ({ current: 0 }));
  const [control] = useState<FoldControl>(() => ({ manual: null, releasedAt: 0 }));
  const [isOpen, setIsOpen] = useState(true);
  const drag = useRef<{ x: number; start: number } | null>(null);
  const fold = products['xiaomi-fold'];
  const [colorIdx, setColorIdx] = useState(0);
  const color = fold.colors[colorIdx];

  useIsoLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add(
      { motion: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' },
      (ctx) => {
        const counter = { v: 0 };
        const writeCount = () => {
          if (count.current) count.current.textContent = Math.round(counter.v).toLocaleString('en-US');
        };
        if (ctx.conditions?.reduce) {
          progress.current = 0.65;
          gsap.set(['.fd-panel-0', '.fd-panel-2'], { autoAlpha: 0 });
          counter.v = foldStats.foldsTested;
          writeCount();
          return;
        }
        gsap.set(['.fd-panel-1', '.fd-panel-2'], { autoAlpha: 0, y: 40 });
        gsap.set('.fd-big', { scale: 0.6, autoAlpha: 0 });

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: stage.current, start: 'top top', end: '+=280%', pin: true, scrub: 0.8 },
          onUpdate: () => {
            progress.current = tl.progress();
          },
        });
        tl.to({}, { duration: 1 }, 0)
          .to('.fd-panel-0', { autoAlpha: 0, y: -40, duration: 0.06 }, 0.16)
          .to('.fd-big', { scale: 1, autoAlpha: 1, duration: 0.35 }, 0.18)
          .to('.fd-panel-1', { autoAlpha: 1, y: 0, duration: 0.06 }, 0.52)
          .to('.fd-panel-1', { autoAlpha: 0, y: -40, duration: 0.05 }, 0.72)
          .to('.fd-big', { autoAlpha: 0, scale: 1.15, duration: 0.08 }, 0.72)
          .to('.fd-panel-2', { autoAlpha: 1, y: 0, duration: 0.06 }, 0.78)
          // Exploded hinge: plates slide apart, gears lift and spin.
          .to('.hg-plate-l', { x: -26, duration: 0.12 }, 0.82)
          .to('.hg-plate-r', { x: 26, duration: 0.12 }, 0.82)
          .to('.hg-spine', { y: 18, duration: 0.12 }, 0.82)
          .to('.hg-gear-a', { x: -10, y: -26, rotation: 240, transformOrigin: '50% 50%', duration: 0.16 }, 0.82)
          .to('.hg-gear-b', { x: 12, y: -30, rotation: -288, transformOrigin: '50% 50%', duration: 0.16 }, 0.82)
          .to('.hg-gear-c', { y: 18, rotation: 360, transformOrigin: '50% 50%', duration: 0.16 }, 0.82)
          .to(counter, { v: foldStats.foldsTested, duration: 0.16, onUpdate: writeCount }, 0.8);
      },
      stage,
    );
    return () => mm.revert();
  }, []);

  // Drag horizontally on the stage to fold/unfold; the spring in the scene does the physics.
  const onDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    drag.current = { x: e.clientX, start: control.manual ?? (progress.current > 0.5 ? 1 : 0) };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const w = (e.currentTarget as HTMLElement).clientWidth;
    control.manual = clamp(drag.current.start + (e.clientX - drag.current.x) / (w * 0.35));
    control.releasedAt = progress.current;
  };
  const onUp = () => {
    if (!drag.current) return;
    drag.current = null;
    if (control.manual !== null) {
      control.manual = control.manual > 0.5 ? 1 : 0;
      control.releasedAt = progress.current;
      setIsOpen(control.manual === 1);
    }
  };
  const toggle = () => {
    const next = !(control.manual ?? (progress.current > 0.5 ? 1 : 0));
    control.manual = next ? 1 : 0;
    control.releasedAt = progress.current;
    setIsOpen(next);
  };

  return (
    <section id="fold" aria-labelledby="fold-title" className="relative">
      <div
        ref={stage}
        className="relative h-screen touch-pan-y overflow-hidden"
        style={{ background: 'radial-gradient(70% 60% at 60% 45%, #10131c 0%, #050505 70%)' }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        data-cursor="drag"
      >
        <div
          aria-hidden
          className="fd-big display pointer-events-none absolute inset-0 grid place-items-center text-transparent"
          style={{ fontSize: 'clamp(10rem, 38vw, 34rem)', WebkitTextStroke: '1.5px rgba(255,105,0,0.35)' }}
        >
          8.0&quot;
        </div>

        <LazyMount className="absolute inset-0">
          <FoldScene progress={progress} control={control} color={color.hex} frame={color.frame} />
        </LazyMount>

        <div className="pointer-events-none absolute inset-x-6 top-24 md:inset-x-auto md:left-12 md:top-1/2 md:w-[min(28rem,36vw)] lg:left-20">
          <div className="fd-panel-0 absolute inset-x-0 top-0 md:-translate-y-1/2">
            <p className="eyebrow mb-4">02 — Xiaomi 18 Fold</p>
            <h2 id="fold-title" className="display display-lg">
              Unfold a<br />
              bigger <span className="text-mi">idea.</span>
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/60 md:text-base">
              {fold.specs.thickness} mm folded. {fold.specs.display} when you need room to think.
            </p>
          </div>
          <div className="fd-panel-1 absolute inset-x-0 top-0 md:-translate-y-1/2">
            <p className="eyebrow mb-4">Multitasking</p>
            <h3 className="display display-lg">
              Two apps.
              <br />
              One glance.
            </h3>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/60 md:text-base">
              Chat on the left, photos and maps on the right. Drag anywhere to fold it yourself.
            </p>
            <div className="pointer-events-auto mt-6 flex flex-wrap items-center gap-3">
              <button onClick={toggle} className="chip" aria-pressed={!isOpen}>
                {isOpen ? 'Fold it' : 'Unfold it'}
              </button>
              <div role="radiogroup" aria-label="Fold color" className="flex gap-2">
                {fold.colors.map((c, i) => (
                  <button
                    key={c.name}
                    role="radio"
                    aria-checked={colorIdx === i}
                    aria-label={c.name}
                    title={c.name}
                    onClick={() => setColorIdx(i)}
                    className={`focus-ring h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 ${colorIdx === i ? 'border-mi' : 'border-white/15'}`}
                    style={{ background: `linear-gradient(135deg, ${c.hex}, ${c.frame})` }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="fd-panel-2 absolute inset-x-0 top-0 md:-translate-y-1/2">
            <p className="eyebrow mb-3">The hinge</p>
            <h3 className="display text-3xl md:text-5xl">
              Built to fold
              <br />
              <span className="text-mi">
                <span ref={count} className="tabular-nums">
                  0
                </span>
              </span>{' '}
              times.
            </h3>
            <div className="glass mt-5 hidden max-w-[15rem] rounded-3xl p-3 md:block">
              <HingeDiagram />
            </div>
            <dl className="mt-4 grid max-w-sm grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-white/40">Hinge parts</dt>
                <dd className="display text-2xl">{foldStats.hingeParts}</dd>
              </div>
              <div>
                <dt className="text-white/40">Crease depth</dt>
                <dd className="display text-2xl">{foldStats.creaseDepth}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
