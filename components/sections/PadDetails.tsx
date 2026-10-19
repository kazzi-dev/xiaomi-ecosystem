'use client';

import { useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { useIsoLayoutEffect } from '@/lib/hooks';
import { padOutlines, products } from '@/data/products';

type Outline = 'pad-9' | 'pad-9-pro-max';

const USE_CASES = [
  {
    title: 'Productivity',
    line: 'Three windows, one keyboard, zero compromises.',
    body: 'Free-form windows, a desktop-class browser and a keyboard that snaps on magnetically.',
    visual: 'work',
  },
  {
    title: 'Entertainment',
    line: 'A cinema that fits in a tote.',
    body: 'A bright high-refresh display with quad speakers tuned for films, games and late-night series.',
    visual: 'play',
  },
  {
    title: 'Creativity',
    line: 'Pressure, tilt, and nothing in the way.',
    body: 'Focus Pen 3 with low-latency ink for sketching, notes and storyboarding on the go.',
    visual: 'create',
  },
] as const;

function UseCaseVisual({ kind }: { kind: (typeof USE_CASES)[number]['visual'] }) {
  if (kind === 'work')
    return (
      <div className="grid h-full grid-cols-5 gap-2 p-3">
        <div className="col-span-3 rounded-xl bg-white/10 p-3">
          <div className="mb-2 h-2 w-1/3 rounded bg-white/50" />
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="mb-1.5 h-1.5 rounded bg-white/15" style={{ width: `${90 - i * 9}%` }} />
          ))}
        </div>
        <div className="col-span-2 grid gap-2">
          <div className="rounded-xl bg-mi/80" />
          <div className="rounded-xl bg-[#2e7bff]/60" />
        </div>
      </div>
    );
  if (kind === 'play')
    return (
      <div className="relative h-full overflow-hidden" style={{ background: 'radial-gradient(80% 80% at 30% 30%, #ff6900, #5a1f3a 45%, #0b0b16 80%)' }}>
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70" />
        <div className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90">
          <svg width="18" height="20" viewBox="0 0 18 20">
            <path d="M2 1l15 9-15 9z" fill="#050505" />
          </svg>
        </div>
        <div className="absolute inset-x-4 bottom-4 h-1 rounded bg-white/20">
          <div className="h-full w-2/5 rounded bg-mi" />
        </div>
      </div>
    );
  return (
    <div className="relative h-full bg-[#f4efe8]">
      <svg viewBox="0 0 300 180" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        <path d="M20 130 C 70 20, 120 170, 170 70 S 260 40, 285 120" stroke="#ff6900" strokeWidth="10" fill="none" strokeLinecap="round" />
        <path d="M30 60 C 90 90, 140 20, 210 50" stroke="#111114" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M60 160 C 120 120, 180 170, 260 140" stroke="#2e7bff" strokeWidth="6" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export default function PadDetails() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const hWrap = useRef<HTMLDivElement>(null);
  const [focus, setFocus] = useState<Outline | 'both'>('both');
  const phone = products['xiaomi-18-pro'];

  useIsoLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add(
      { motion: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' },
      (ctx) => {
        if (ctx.conditions?.reduce) return;

        // Keyboard: drops in and snaps with an overshoot, plus a magnetic flash at the seam.
        gsap.set('.kb', { y: 170, rotationX: 60, autoAlpha: 0.3, transformPerspective: 1200, transformOrigin: '50% 0%' });
        gsap.set('.kb-flash', { scaleX: 0, autoAlpha: 0 });
        gsap.set('.kb-field', { autoAlpha: 0, scale: 0.6 });
        gsap
          .timeline({ scrollTrigger: { trigger: '.kb-wrap', start: 'top 70%', toggleActions: 'play none none reverse' } })
          .to('.kb-field', { autoAlpha: 1, scale: 1, duration: 0.35, stagger: 0.05, ease: 'power2.out' })
          .to('.kb', { y: 0, rotationX: 0, autoAlpha: 1, duration: 0.7, ease: 'back.out(2.6)' }, 0.15)
          .to('.kb-field', { autoAlpha: 0, duration: 0.2 }, 0.7)
          .to('.kb-flash', { scaleX: 1, autoAlpha: 1, duration: 0.25, ease: 'expo.out' }, 0.62)
          .to('.kb-flash', { autoAlpha: 0, duration: 0.6 }, 0.95)
          .fromTo('.kb-tablet', { y: 0 }, { y: -6, duration: 0.08, yoyo: true, repeat: 1, ease: 'power1.out' }, 0.62);

        // True-scale outlines draw themselves in.
        gsap.set('.outline-shape', { strokeDashoffset: 1 });
        gsap.to('.outline-shape', {
          strokeDashoffset: 0,
          duration: 1.4,
          ease: 'power2.inOut',
          stagger: 0.2,
          scrollTrigger: { trigger: '.outline-svg', start: 'top 75%' },
        });

        // Horizontal use-case track.
        const distance = () => (track.current ? track.current.scrollWidth - window.innerWidth : 0);
        gsap.to(track.current, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: { trigger: hWrap.current, start: 'top top', end: () => `+=${distance()}`, pin: true, scrub: 0.8, invalidateOnRefresh: true },
        });
      },
      root,
    );
    return () => mm.revert();
  }, []);

  const scale = 0.9; // px per mm in the comparison SVG
  const vb = { w: 400, h: 230 };

  return (
    <section ref={root} aria-label="Pad 9 keyboard, sizes and use cases">
      {/* Keyboard snap */}
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 py-28 md:grid-cols-2 md:py-40">
        <div>
          <p className="eyebrow mb-4">Pad Touch Keyboard</p>
          <h3 className="display display-lg">
            Snaps on.
            <br />
            Gets to <span className="text-mi">work.</span>
          </h3>
          <p className="mt-5 max-w-md text-white/60">
            Magnetic pogo-pin connection. No pairing, no charging: bring it close and it clicks into place.
          </p>
        </div>
        <div className="kb-wrap relative mx-auto w-full max-w-lg" style={{ perspective: 1200 }}>
          <div className="kb-tablet relative z-10 aspect-[1.45] rounded-[4%] bg-[#0b0b0d] p-[1.6%] ring-1 ring-white/15">
            <div className="h-full w-full overflow-hidden rounded-[3%]">
              <UseCaseVisual kind="work" />
            </div>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                aria-hidden
                className="kb-field absolute left-1/2 top-full -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-mi/50"
                style={{ width: `${60 + i * 18}%`, height: `${16 + i * 12}%` }}
              />
            ))}
            <div aria-hidden className="kb-flash absolute -bottom-[2px] left-[4%] right-[4%] h-[3px] rounded-full bg-mi shadow-[0_0_24px_6px_rgba(255,105,0,0.7)]" />
          </div>
          <div className="kb relative z-0 mt-[2px] rounded-b-[18px] rounded-t-[4px] bg-[#1c1c20] p-[3%] ring-1 ring-white/10">
            <div className="grid grid-cols-[repeat(13,minmax(0,1fr))] gap-[3px]">
              {Array.from({ length: 52 }, (_, i) => (
                <span key={i} className="aspect-square rounded-[3px] bg-[#2c2c31]" />
              ))}
            </div>
            <div className="mx-auto mt-[3%] h-6 w-2/5 rounded-md bg-[#26262b] md:h-10" />
          </div>
        </div>
      </div>

      {/* True-scale comparison */}
      <div className="mx-auto max-w-6xl px-6 pb-28 md:pb-40">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="eyebrow mb-4">Two sizes</p>
            <h3 className="display display-lg">True to scale.</h3>
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Highlight a size">
            {(['both', 'pad-9', 'pad-9-pro-max'] as const).map((k) => (
              <button key={k} className="chip" aria-pressed={focus === k} onClick={() => setFocus(k)}>
                {k === 'both' ? 'Both' : products[k].short}
              </button>
            ))}
          </div>
        </div>
        <div className="glass rounded-[28px] p-6 md:p-10">
          <svg viewBox={`0 0 ${vb.w} ${vb.h}`} className="outline-svg mx-auto h-auto w-full max-w-3xl" role="img" aria-label="Pad 9, Pad 9 Pro Max and Xiaomi 18 Pro outlines at true relative scale">
            {(['pad-9-pro-max', 'pad-9'] as const).map((k) => {
              const o = padOutlines[k];
              const w = o.width * scale * 1.05;
              const h = o.height * scale * 1.05;
              const dim = focus !== 'both' && focus !== k;
              const big = k === 'pad-9-pro-max';
              return (
                <g key={k} style={{ opacity: dim ? 0.18 : 1, transition: 'opacity .5s' }}>
                  <rect
                    className="outline-shape"
                    x={10}
                    y={vb.h - 10 - h}
                    width={w}
                    height={h}
                    rx={10}
                    pathLength={1}
                    strokeDasharray="1"
                    fill={big ? 'rgba(255,105,0,0.05)' : 'rgba(255,255,255,0.03)'}
                    stroke={big ? '#ff6900' : '#ffffff'}
                    strokeWidth={1.4}
                  />
                  <text x={18} y={vb.h - 10 - h + 14} fontSize="8" fill={big ? '#ff6900' : '#ffffffcc'}>
                    {o.label} · {o.width}×{o.height} mm
                  </text>
                </g>
              );
            })}
            <g style={{ opacity: focus === 'both' ? 0.9 : 0.3, transition: 'opacity .5s' }}>
              <rect className="outline-shape" x={vb.w - 85} y={vb.h - 10 - 162 * scale} width={75 * scale} height={162 * scale} rx={9} pathLength={1} strokeDasharray="1" fill="none" stroke="#ffffff88" strokeWidth={1.2} />
              <text x={vb.w - 85} y={vb.h - 14 - 162 * scale} fontSize="7" fill="#ffffff88">
                {phone.short} for scale
              </text>
            </g>
          </svg>
          <p className="mt-4 text-center text-xs text-white/40">Dimensions are placeholders until official specs are confirmed.</p>
        </div>
      </div>

      {/* Horizontal use cases */}
      <div ref={hWrap} className="relative h-screen overflow-hidden">
        <div ref={track} className="flex h-full items-center gap-6 pl-6 pr-[10vw] md:gap-10 md:pl-[8vw]">
          <div className="w-[78vw] shrink-0 md:w-[34vw]">
            <p className="eyebrow mb-4">Made for every mode</p>
            <h3 className="display display-lg">
              Work. Watch.
              <br />
              <span className="text-mi">Create.</span>
            </h3>
            <p className="mt-5 max-w-sm text-white/60">Keep scrolling. The Pad changes shape around what you are doing.</p>
          </div>
          {USE_CASES.map((u, i) => (
            <article key={u.title} className="glass flex h-[70svh] w-[82vw] shrink-0 flex-col overflow-hidden rounded-[32px] md:w-[52vw]">
              <div className="relative m-3 flex-1 overflow-hidden rounded-[22px] bg-[#0b0b0d] ring-1 ring-white/10">
                <UseCaseVisual kind={u.visual} />
              </div>
              <div className="flex items-end justify-between gap-6 p-6 md:p-8">
                <div>
                  <p className="text-xs text-white/40">0{i + 1}</p>
                  <h4 className="display mt-1 text-3xl md:text-5xl">{u.title}</h4>
                  <p className="mt-2 max-w-md text-sm text-white/60 md:text-base">{u.body}</p>
                </div>
                <p className="hidden max-w-[14rem] text-right text-sm text-white/80 lg:block">{u.line}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
