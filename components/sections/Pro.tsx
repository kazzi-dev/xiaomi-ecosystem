'use client';

import dynamic from 'next/dynamic';
import { useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { useIsoLayoutEffect } from '@/lib/hooks';
import { cameraCallouts, products } from '@/data/products';
import CountUp from '@/components/ui/CountUp';
import LazyMount from '@/components/ui/LazyMount';
import CameraDemo from './CameraDemo';
import type { Signal } from '@/components/three/models';

const ProScene = dynamic(() => import('@/components/three/ProScene'), { ssr: false });

// Label box position + where its leader line meets the lens stack (percent of the stage).
const CALLOUT_LAYOUT = {
  tl: { box: 'left-[4%] top-[16%] md:left-[12%] md:top-[18%]', from: [24, 22], to: [44, 40] },
  tr: { box: 'right-[4%] top-[16%] text-right md:right-[12%] md:top-[18%]', from: [76, 22], to: [56, 40] },
  bl: { box: 'left-[4%] bottom-[30%] md:left-[12%] md:bottom-[22%]', from: [24, 72], to: [44, 58] },
  br: { box: 'right-[4%] bottom-[30%] text-right md:right-[12%] md:bottom-[22%]', from: [76, 72], to: [56, 58] },
} as const;

export default function Pro() {
  const stage = useRef<HTMLDivElement>(null);
  const [progress] = useState<Signal>(() => ({ current: 0 }));
  const [variant, setVariant] = useState<'xiaomi-18-pro' | 'xiaomi-18-pro-max'>('xiaomi-18-pro');
  const product = products[variant];
  const [colorIdx, setColorIdx] = useState(0);
  const color = product.colors[colorIdx];

  useIsoLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add(
      { motion: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' },
      (ctx) => {
        if (ctx.conditions?.reduce) {
          progress.current = 1;
          gsap.set(['.p18-panel-0', '.p18-panel-1', '.p18-callout', '.p18-line'], { autoAlpha: 0 });
          return;
        }
        gsap.set(['.p18-panel-1', '.p18-panel-3'], { autoAlpha: 0, y: 40 });
        gsap.set('.p18-callout', { autoAlpha: 0, y: 12 });
        gsap.set('.p18-line', { strokeDashoffset: 1200 });

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: stage.current, start: 'top top', end: '+=300%', pin: true, scrub: 0.8 },
          onUpdate: () => {
            progress.current = tl.progress();
          },
        });
        tl.to({}, { duration: 1 }, 0)
          .to('.p18-panel-0', { autoAlpha: 0, y: -40, duration: 0.05 }, 0.12)
          .to('.p18-panel-1', { autoAlpha: 1, y: 0, duration: 0.05 }, 0.19)
          .to('.p18-panel-1', { autoAlpha: 0, y: -40, duration: 0.05 }, 0.38)
          .to('.p18-line', { strokeDashoffset: 0, duration: 0.07, stagger: 0.012 }, 0.5)
          .to('.p18-callout', { autoAlpha: 1, y: 0, duration: 0.05, stagger: 0.012 }, 0.53)
          .to('.p18-line', { strokeDashoffset: 1200, duration: 0.04 }, 0.63)
          .to('.p18-callout', { autoAlpha: 0, duration: 0.04 }, 0.63)
          .to('.p18-panel-3', { autoAlpha: 1, y: 0, duration: 0.06 }, 0.8);
      },
      stage,
    );
    return () => mm.revert();
  }, []);

  return (
    <section id="pro" aria-labelledby="pro-title" className="relative">
      <div ref={stage} className="relative h-screen overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(60% 50% at 70% 50%, rgba(255,105,0,0.14), transparent 70%), radial-gradient(40% 40% at 20% 80%, rgba(90,90,255,0.08), transparent 70%)' }}
        />
        <LazyMount className="absolute inset-0">
          <ProScene progress={progress} color={color.hex} frame={color.frame} finish={color.finish} isMax={variant === 'xiaomi-18-pro-max'} />
        </LazyMount>

        {/* Story copy */}
        <div className="pointer-events-none absolute inset-x-6 top-24 md:inset-x-auto md:left-12 md:top-1/2 md:w-[min(28rem,36vw)] md:-translate-y-1/2 lg:left-20">
          <div className="p18-panel-0 absolute inset-x-0 top-0 md:-translate-y-1/2">
            <p className="eyebrow mb-4">01 — Xiaomi 18 Pro</p>
            <h2 id="pro-title" className="display display-lg">
              Pro to
              <br />
              the <span className="text-mi">core.</span>
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/60 md:text-base">
              Aerospace aluminium, a {product.specs.thickness} mm profile and a camera built like a cinema lens. Keep scrolling.
            </p>
          </div>
          <div className="p18-panel-1 absolute inset-x-0 top-0 md:-translate-y-1/2">
            <p className="eyebrow mb-4">Camera system</p>
            <h3 className="display display-lg">
              Sees in
              <br />
              the dark.
            </h3>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/60 md:text-base">
              A {product.specs.mainCamera} sensor gathers more light than ever. Here is what sits behind the glass.
            </p>
          </div>
          <div className="p18-panel-3 absolute inset-x-0 top-0 md:-translate-y-1/2">
            <p className="eyebrow mb-4">Display · {product.specs.os}</p>
            <h3 className="display display-lg">
              Lit from
              <br />
              <span className="text-gradient-mi">within.</span>
            </h3>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/60 md:text-base">
              {product.specs.display}, {product.specs.refresh}. Brighter outdoors, gentler at night.
            </p>
          </div>
        </div>

        {/* Exploded-view callouts */}
        <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full">
          {cameraCallouts.map((c) => {
            const L = CALLOUT_LAYOUT[c.pos];
            return (
              <line
                key={c.pos}
                className="p18-line"
                x1={`${L.from[0]}%`}
                y1={`${L.from[1]}%`}
                x2={`${L.to[0]}%`}
                y2={`${L.to[1]}%`}
                strokeDasharray="1200"
                stroke="#ff6900"
                strokeWidth="1.2"
              />
            );
          })}
        </svg>
        <ul aria-label="Camera highlights">
          {cameraCallouts.map((c) => (
            <li key={c.pos} className={`p18-callout glass pointer-events-none absolute rounded-2xl bg-black/50 px-4 py-3 ${CALLOUT_LAYOUT[c.pos].box}`}>
              <p className="text-sm font-semibold text-white md:text-base">{c.label}</p>
              <p className="text-xs text-white/55">{c.detail}</p>
            </li>
          ))}
        </ul>

        {/* Controls */}
        <div className="absolute inset-x-4 bottom-4 z-10 md:inset-x-12 md:bottom-8">
          <div className="glass flex flex-col gap-4 rounded-3xl p-4 md:flex-row md:items-center md:justify-between md:p-5">
            <div className="flex flex-wrap items-center gap-4">
              <div role="radiogroup" aria-label="Model" className="flex rounded-full bg-white/5 p-1">
                {(['xiaomi-18-pro', 'xiaomi-18-pro-max'] as const).map((id) => (
                  <button
                    key={id}
                    role="radio"
                    aria-checked={variant === id}
                    onClick={() => setVariant(id)}
                    className={`focus-ring relative rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                      variant === id ? 'bg-white text-ink' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {products[id].short}
                  </button>
                ))}
              </div>
              <div role="radiogroup" aria-label="Color" className="flex items-center gap-2">
                {product.colors.map((c, i) => (
                  <button
                    key={c.name}
                    role="radio"
                    aria-checked={colorIdx === i}
                    aria-label={c.name}
                    title={c.name}
                    onClick={() => setColorIdx(i)}
                    className={`focus-ring h-8 w-8 rounded-full border-2 transition-transform duration-300 hover:scale-110 ${
                      colorIdx === i ? 'scale-110 border-mi' : 'border-white/15'
                    }`}
                    style={{ background: `linear-gradient(135deg, ${c.hex}, ${c.frame})` }}
                  />
                ))}
                <span className="ml-1 hidden text-sm text-white/60 sm:inline" aria-live="polite">
                  {color.name}
                </span>
              </div>
            </div>
            <dl className="grid grid-cols-4 gap-3 text-left md:gap-8">
              <Spec label="Display" value={<CountUp value={product.specs.displaySize} decimals={2} suffix={'"'} />} />
              <Spec label="Battery" value={<CountUp value={product.specs.battery} suffix=" mAh" />} />
              <Spec label="Charging" value={<CountUp value={product.specs.charging} suffix="W" />} />
              <Spec label="Weight" value={<CountUp value={product.specs.weight} suffix=" g" />} />
            </dl>
          </div>
        </div>
      </div>

      <CameraDemo />
    </section>
  );
}

function Spec({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.18em] text-white/40 md:text-[11px]">{label}</dt>
      <dd className="display mt-1 text-base text-white md:text-2xl">{value}</dd>
    </div>
  );
}
