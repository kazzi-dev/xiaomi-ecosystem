'use client';

import { useEffect, useRef, useState } from 'react';

const PHOTOS = [
  'linear-gradient(160deg,#ffb27a 0%,#ff6900 45%,#3b1460 100%)',
  'linear-gradient(200deg,#0ea5e9 0%,#1e3a8a 60%,#020617 100%)',
  'linear-gradient(170deg,#bef264 0%,#16a34a 50%,#052e16 100%)',
  'linear-gradient(140deg,#f9a8d4 0%,#db2777 50%,#1e1b4b 100%)',
  'linear-gradient(180deg,#fde68a 0%,#f97316 55%,#431407 100%)',
  'linear-gradient(150deg,#e9d5ff 0%,#7c3aed 55%,#0b0b16 100%)',
];

type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number; size: number };

function Photo({ bg, className = '' }: { bg: string; className?: string }) {
  return (
    <span className={`block overflow-hidden ${className}`} style={{ background: bg }}>
      <span className="absolute right-[18%] top-[18%] h-[22%] w-[22%] rounded-full bg-white/70" />
      <span className="absolute inset-x-0 bottom-0 h-[40%] bg-black/35" style={{ clipPath: 'polygon(0 60%,30% 10%,55% 55%,75% 25%,100% 70%,100% 100%,0 100%)' }} />
    </span>
  );
}

export default function TransferDemo() {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const drop = useRef<HTMLDivElement>(null);
  const slotsRef = useRef<HTMLDivElement>(null);
  const particles = useRef<Particle[]>([]);
  const raf = useRef(0);
  const [sent, setSent] = useState<number[]>([]);
  const [inFlight, setInFlight] = useState<number[]>([]);
  const [ghost, setGhost] = useState<{ i: number; x: number; y: number } | null>(null);
  const [over, setOver] = useState(false);
  const dragRef = useRef<number | null>(null);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const local = (x: number, y: number) => {
    const r = wrap.current!.getBoundingClientRect();
    return { x: x - r.left, y: y - r.top };
  };

  const tick = () => {
    const c = canvas.current;
    if (!c) return;
    const g = c.getContext('2d')!;
    g.clearRect(0, 0, c.width, c.height);
    g.globalCompositeOperation = 'lighter';
    const dpr = c.width / c.offsetWidth;
    particles.current = particles.current.filter((p) => {
      p.life += 1;
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.94;
      p.vy *= 0.94;
      const a = 1 - p.life / p.max;
      if (a <= 0) return false;
      const grd = g.createRadialGradient(p.x * dpr, p.y * dpr, 0, p.x * dpr, p.y * dpr, p.size * dpr * 2);
      grd.addColorStop(0, `rgba(255,170,90,${a})`);
      grd.addColorStop(1, 'rgba(255,105,0,0)');
      g.fillStyle = grd;
      g.beginPath();
      g.arc(p.x * dpr, p.y * dpr, p.size * dpr * 2, 0, Math.PI * 2);
      g.fill();
      return true;
    });
    raf.current = particles.current.length ? requestAnimationFrame(tick) : 0;
  };

  /** Flies a comet from (sx, sy) to the next free gallery slot along a curved path, then lands the photo. */
  const transfer = (i: number, sx: number, sy: number) => {
    const c = canvas.current;
    const slots = slotsRef.current;
    if (!c || !slots || sent.includes(i) || inFlight.includes(i)) return;
    c.width = c.offsetWidth * Math.min(window.devicePixelRatio, 2);
    c.height = c.offsetHeight * Math.min(window.devicePixelRatio, 2);
    const slotEl = slots.children[Math.min(sent.length + inFlight.length, slots.children.length - 1)] as HTMLElement;
    const sr = slotEl.getBoundingClientRect();
    const end = local(sr.left + sr.width / 2, sr.top + sr.height / 2);
    const start = local(sx, sy);
    const ctrl = { x: (start.x + end.x) / 2, y: Math.min(start.y, end.y) - 160 };
    setInFlight((f) => [...f, i]);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = reduced ? 0 : 750;
    const t0 = performance.now();
    const emit = () => {
      const t = Math.min((performance.now() - t0) / Math.max(duration, 1), 1);
      const e = 1 - Math.pow(1 - t, 3);
      const x = (1 - e) * (1 - e) * start.x + 2 * (1 - e) * e * ctrl.x + e * e * end.x;
      const y = (1 - e) * (1 - e) * start.y + 2 * (1 - e) * e * ctrl.y + e * e * end.y;
      if (!reduced)
        for (let k = 0; k < 6; k++)
          particles.current.push({ x, y, vx: (Math.random() - 0.5) * 2.2, vy: (Math.random() - 0.5) * 2.2, life: 0, max: 26 + Math.random() * 26, size: 2 + Math.random() * 4 });
      if (particles.current.length && !raf.current) raf.current = requestAnimationFrame(tick);
      if (t < 1) requestAnimationFrame(emit);
      else {
        if (!reduced)
          for (let k = 0; k < 40; k++) {
            const a = Math.random() * Math.PI * 2;
            const s = 2 + Math.random() * 5;
            particles.current.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0, max: 30 + Math.random() * 20, size: 2 + Math.random() * 3 });
          }
        setInFlight((f) => f.filter((v) => v !== i));
        setSent((s) => [...s, i]);
      }
    };
    requestAnimationFrame(emit);
  };

  const onDown = (i: number) => (e: React.PointerEvent) => {
    if (sent.includes(i)) return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = i;
    setGhost({ i, x: e.clientX, y: e.clientY });
  };
  const onMove = (e: React.PointerEvent) => {
    if (dragRef.current === null) return;
    setGhost({ i: dragRef.current, x: e.clientX, y: e.clientY });
    const r = drop.current!.getBoundingClientRect();
    setOver(e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom);
  };
  const onUp = (e: React.PointerEvent) => {
    const i = dragRef.current;
    dragRef.current = null;
    setGhost(null);
    setOver(false);
    if (i === null) return;
    const r = drop.current!.getBoundingClientRect();
    if (e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom) transfer(i, e.clientX, e.clientY);
  };

  const sendWithKeyboard = (i: number, el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    transfer(i, r.left + r.width / 2, r.top + r.height / 2);
  };

  return (
    <div className="relative mx-auto mt-28 max-w-6xl px-6">
      <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="eyebrow mb-4">Try it</p>
          <h3 className="display display-lg">
            Phone to Pad,
            <br />
            in one <span className="text-mi">drag.</span>
          </h3>
        </div>
        <p className="max-w-sm text-white/60">Drag a photo from the phone and drop it on the Pad. Keyboard users: focus a photo and press Enter.</p>
      </div>

      <div ref={wrap} className="glass relative grid items-center gap-10 overflow-hidden rounded-[32px] p-6 md:grid-cols-[auto_1fr] md:gap-16 md:p-12">
        {/* Phone */}
        <div className="mx-auto w-[220px] shrink-0 rounded-[38px] bg-[#0b0b0d] p-2.5 ring-1 ring-white/15 shadow-2xl">
          <div className="rounded-[30px] bg-gradient-to-b from-[#16161c] to-[#0b0b0f] px-3 pb-5 pt-8">
            <p className="mb-3 px-1 text-xs font-semibold text-white/80">Gallery</p>
            <div className="grid grid-cols-2 gap-2">
              {PHOTOS.map((bg, i) => {
                const gone = sent.includes(i) || inFlight.includes(i);
                return (
                  <button
                    key={i}
                    aria-label={`Photo ${i + 1}${gone ? ', sent to Pad' : ', drag to Pad or press Enter'}`}
                    disabled={gone}
                    data-cursor="drag"
                    onPointerDown={onDown(i)}
                    onPointerMove={onMove}
                    onPointerUp={onUp}
                    onPointerCancel={onUp}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        sendWithKeyboard(i, e.currentTarget);
                      }
                    }}
                    className={`focus-ring aspect-square touch-none overflow-hidden rounded-xl transition-all duration-300 ${
                      gone ? 'scale-90 opacity-20' : ghost?.i === i ? 'opacity-40' : 'hover:scale-[1.04]'
                    }`}
                  >
                    <Photo bg={bg} className="relative h-full w-full" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pad drop zone */}
        <div
          ref={drop}
          className={`relative aspect-[1.45] w-full rounded-[22px] bg-[#0b0b0d] p-2 ring-1 transition-all duration-300 ${
            over ? 'scale-[1.02] ring-2 ring-mi shadow-[0_0_60px_-10px_rgba(255,105,0,0.7)]' : 'ring-white/15'
          }`}
        >
          <div className="flex h-full flex-col rounded-[16px] bg-gradient-to-br from-[#14141a] to-[#0a0a0e] p-4 md:p-6">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-white/80">Pad 9 Pro Max · Shared</p>
              <p className="text-xs text-white/40" aria-live="polite">
                {sent.length} / {PHOTOS.length} received
              </p>
            </div>
            <div ref={slotsRef} className="grid flex-1 grid-cols-3 gap-2 md:gap-3">
              {PHOTOS.map((_, slot) => {
                const photo = sent[slot];
                return (
                  <div key={slot} className="relative overflow-hidden rounded-xl border border-dashed border-white/10">
                    {photo !== undefined && <Photo bg={PHOTOS[photo]} className="absolute inset-0 animate-[pop_.5s_cubic-bezier(.2,1.4,.4,1)]" />}
                  </div>
                );
              })}
            </div>
            {sent.length === PHOTOS.length && (
              <button onClick={() => setSent([])} className="chip mt-3 self-center">
                Reset demo
              </button>
            )}
          </div>
        </div>

        <canvas ref={canvas} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />
      </div>

      {ghost && (
        <div className="pointer-events-none fixed z-[95] h-24 w-24 -translate-x-1/2 -translate-y-1/2 rotate-6 overflow-hidden rounded-2xl shadow-2xl ring-2 ring-mi" style={{ left: ghost.x, top: ghost.y }}>
          <Photo bg={PHOTOS[ghost.i]} className="relative h-full w-full" />
        </div>
      )}
      <style>{`@keyframes pop{from{transform:scale(.3);opacity:0}to{transform:none;opacity:1}}`}</style>
    </div>
  );
}
