'use client';

import { useMemo, useRef, useState } from 'react';
import { AnimatePresence, LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion';
import { gsap } from '@/lib/gsap';
import { useIsoLayoutEffect } from '@/lib/hooks';
import { ecosystemNodes, type EcoNodeId } from '@/data/products';
import TransferDemo from './TransferDemo';

const ICONS: Record<EcoNodeId, React.ReactNode> = {
  phone: <rect x="8" y="3" width="10" height="20" rx="2.5" />,
  fold: (
    <>
      <rect x="4" y="4" width="8" height="18" rx="2" />
      <rect x="14" y="4" width="8" height="18" rx="2" />
    </>
  ),
  pad: <rect x="2" y="6" width="22" height="15" rx="2.5" />,
  watch: (
    <>
      <circle cx="13" cy="13" r="6" />
      <path d="M10 7V3h6v4M10 19v4h6v-4" />
    </>
  ),
  buds: (
    <>
      <rect x="5" y="5" width="5" height="11" rx="2.5" />
      <rect x="16" y="5" width="5" height="11" rx="2.5" />
      <path d="M7.5 16v5M18.5 16v5" />
    </>
  ),
  home: <path d="M4 12l9-8 9 8v10H4z M10 22v-6h6v6" />,
  car: (
    <>
      <path d="M3 17v-4l3-6h14l3 6v4z" />
      <circle cx="8" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
    </>
  ),
};

const SIZE = 600;
const C = SIZE / 2;
const R = 225;

export default function Ecosystem() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState<EcoNodeId | null>(null);
  const reduced = useReducedMotion();
  const shown = ecosystemNodes.find((n) => n.id === (active ?? 'pad'))!;

  const pos = useMemo(() => {
    const out = {} as Record<EcoNodeId, { x: number; y: number }>;
    ecosystemNodes.forEach((n, i) => {
      const a = -Math.PI / 2 + (i / ecosystemNodes.length) * Math.PI * 2;
      out[n.id] = { x: C + Math.cos(a) * R, y: C + Math.sin(a) * R };
    });
    return out;
  }, []);

  const links = useMemo(() => {
    const seen = new Set<string>();
    const out: [EcoNodeId, EcoNodeId][] = [];
    ecosystemNodes.forEach((n) =>
      n.links.forEach((l) => {
        const key = [n.id, l].sort().join('-');
        if (!seen.has(key)) {
          seen.add(key);
          out.push([n.id, l]);
        }
      }),
    );
    return out;
  }, []);

  useIsoLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add(
      '(prefers-reduced-motion: no-preference)',
      () => {
        gsap.from('.eco-node', {
          scale: 0,
          autoAlpha: 0,
          duration: 0.8,
          ease: 'back.out(2)',
          stagger: 0.07,
          scrollTrigger: { trigger: '.eco-graph', start: 'top 70%' },
        });
        gsap.from('.eco-hub', { scale: 0.4, autoAlpha: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.eco-graph', start: 'top 75%' } });
        gsap.from('.eco-head > *', { y: 40, autoAlpha: 0, stagger: 0.1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.eco-head', start: 'top 80%' } });
      },
      root,
    );
    return () => mm.revert();
  }, []);

  const isLit = (a: EcoNodeId, b: EcoNodeId) => active !== null && (a === active || b === active);
  const connected = (id: EcoNodeId) => active === null || id === active || ecosystemNodes.find((n) => n.id === active)!.links.includes(id);

  return (
    <section id="ecosystem" ref={root} aria-labelledby="eco-title" className="relative overflow-hidden py-28 md:py-40">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(50% 40% at 30% 40%, rgba(255,105,0,0.12), transparent 70%)' }}
      />
      <div className="eco-head relative mx-auto max-w-6xl px-6">
        <p className="eyebrow mb-4">04 — Xiaomi HyperOS</p>
        <h2 id="eco-title" className="display display-lg max-w-3xl">
          Everything talks to <span className="text-gradient-mi">everything.</span>
        </h2>
        <p className="mt-5 max-w-lg text-white/60">Hover or tap a device to see what it shares with the rest of your setup.</p>
      </div>

      <div className="relative mx-auto mt-14 grid max-w-6xl items-center gap-10 px-6 lg:grid-cols-[1.25fr_1fr]">
        <div className="eco-graph relative mx-auto aspect-square w-full max-w-[600px]" onMouseLeave={() => setActive(null)}>
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0 h-full w-full" aria-hidden>
            <defs>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <circle cx={C} cy={C} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeDasharray="2 6" />
            {ecosystemNodes.map((n) => (
              <line
                key={n.id}
                x1={C}
                y1={C}
                x2={pos[n.id].x}
                y2={pos[n.id].y}
                className="flow-line"
                stroke={active === n.id ? '#ff6900' : 'rgba(255,105,0,0.35)'}
                strokeWidth={active === n.id ? 2 : 1.2}
              />
            ))}
            {links.map(([a, b]) => {
              const lit = isLit(a, b);
              const pa = pos[a];
              const pb = pos[b];
              // Bow each link toward the hub so the web reads as one system.
              const mx = (pa.x + pb.x) / 2 + (C - (pa.x + pb.x) / 2) * 0.45;
              const my = (pa.y + pb.y) / 2 + (C - (pa.y + pb.y) / 2) * 0.45;
              return (
                <path
                  key={`${a}-${b}`}
                  d={`M${pa.x} ${pa.y} Q${mx} ${my} ${pb.x} ${pb.y}`}
                  fill="none"
                  className={lit ? 'flow-line' : ''}
                  stroke={lit ? '#ff6900' : 'rgba(255,255,255,0.06)'}
                  strokeWidth={lit ? 2.2 : 1}
                  filter={lit ? 'url(#glow)' : undefined}
                  style={{ transition: 'stroke .4s, stroke-width .4s' }}
                />
              );
            })}
          </svg>

          <div className="eco-hub absolute left-1/2 top-1/2 grid h-[24%] w-[24%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-mi/40 bg-ink text-center shadow-[0_0_80px_-10px_rgba(255,105,0,0.6)]">
            <div>
              <p className="display text-lg md:text-2xl">HyperOS</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">3</p>
            </div>
          </div>

          {ecosystemNodes.map((n) => {
            const on = active === n.id;
            const dim = !connected(n.id);
            return (
              <button
                key={n.id}
                onMouseEnter={() => setActive(n.id)}
                onFocus={() => setActive(n.id)}
                onClick={() => setActive(n.id)}
                aria-pressed={on}
                aria-label={`${n.label}: ${n.feature}`}
                className="eco-node focus-ring absolute grid h-[15%] w-[15%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
                style={{ left: `${(pos[n.id].x / SIZE) * 100}%`, top: `${(pos[n.id].y / SIZE) * 100}%` }}
              >
                <span
                  className={`grid h-full w-full place-items-center rounded-full border transition-all duration-500 ${
                    on ? 'scale-110 border-mi bg-mi text-ink' : 'border-white/15 bg-[#0d0d10] text-white'
                  } ${dim ? 'opacity-30' : 'opacity-100'}`}
                >
                  <svg viewBox="0 0 26 26" className="h-[42%] w-[42%]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
                    {ICONS[n.id]}
                  </svg>
                </span>
                <span className={`pointer-events-none absolute top-full mt-2 whitespace-nowrap text-[11px] transition-opacity md:text-xs ${dim ? 'opacity-30' : 'text-white/70'}`}>
                  {n.label}
                </span>
              </button>
            );
          })}
        </div>

        <div aria-live="polite" className="glass relative overflow-hidden rounded-[28px] p-7 md:p-9">
          <div aria-hidden className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-mi/20 blur-3xl" />
          <LazyMotion features={domAnimation} strict>
            <AnimatePresence mode="wait" initial={false}>
              <m.div
                key={shown.id}
                initial={reduced ? false : { opacity: 0, y: 16, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={reduced ? undefined : { opacity: 0, y: -12, filter: 'blur(6px)' }}
                transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
              >
                <p className="eyebrow mb-3">{shown.label}</p>
                <h3 className="display text-3xl md:text-4xl">{shown.feature}</h3>
                <p className="mt-4 text-white/60">{shown.description}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {shown.links.map((l, i) => (
                    <m.span
                      key={l}
                      initial={reduced ? false : { opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.05 * i, type: 'spring', stiffness: 400, damping: 22 }}
                      className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60"
                    >
                      {ecosystemNodes.find((n) => n.id === l)!.label}
                    </m.span>
                  ))}
                </div>
              </m.div>
            </AnimatePresence>
          </LazyMotion>
        </div>
      </div>

      <TransferDemo />
    </section>
  );
}
