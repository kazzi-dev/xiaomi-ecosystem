'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { clamp } from '@/lib/math';

/** Seeded PRNG so server and client draw the same skyline. */
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

const ZOOM_ORIGIN = '50.3% 22%'; // top of the central tower
const ZOOM_STOPS = [1, 5, 10];

function NightCity() {
  const scene = useMemo(() => {
    const r = rng(18);
    const buildings: { x: number; w: number; h: number; windows: { x: number; y: number; c: string }[] }[] = [];
    let x = -20;
    while (x < 1620) {
      const w = 60 + r() * 110;
      const h = 220 + r() * 420;
      const windows = [];
      for (let wy = 1000 - h + 24; wy < 990; wy += 22)
        for (let wx = x + 10; wx < x + w - 14; wx += 16) {
          const v = r();
          if (v > 0.62) windows.push({ x: wx, y: wy, c: v > 0.93 ? '#9fd3ff' : v > 0.8 ? '#ffd28a' : '#ffb35c' });
        }
      buildings.push({ x, w, h, windows });
      x += w + 4 + r() * 10;
    }
    const stars = Array.from({ length: 90 }, () => ({ x: r() * 1600, y: r() * 420, s: 0.6 + r() * 1.6, o: 0.3 + r() * 0.7 }));
    return { buildings, stars };
  }, []);

  return (
    <svg viewBox="0 0 1600 1000" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#05060f" />
          <stop offset="0.55" stopColor="#1b1240" />
          <stop offset="0.85" stopColor="#5a1f3a" />
          <stop offset="1" stopColor="#ff6900" />
        </linearGradient>
        <radialGradient id="moonGlow">
          <stop offset="0" stopColor="#fff1dc" stopOpacity="0.5" />
          <stop offset="1" stopColor="#fff1dc" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1600" height="1000" fill="url(#sky)" />
      {scene.stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.s} fill="#fff" opacity={s.o} />
      ))}
      <circle cx="1220" cy="200" r="160" fill="url(#moonGlow)" />
      <circle cx="1220" cy="200" r="62" fill="#fff4e4" />
      <circle cx="1200" cy="185" r="11" fill="#e8dcc8" />
      <circle cx="1238" cy="222" r="7" fill="#e8dcc8" />
      <circle cx="1232" cy="178" r="4" fill="#e8dcc8" />
      {scene.buildings.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={1000 - b.h} width={b.w} height={b.h} fill={i % 3 ? '#0b0b16' : '#100d1d'} />
          {b.windows.map((w, j) => (
            <rect key={j} x={w.x} y={w.y} width="8" height="11" fill={w.c} opacity="0.9" />
          ))}
        </g>
      ))}
      {/* Central tower: the zoom target */}
      <g>
        <rect x="760" y="250" width="90" height="750" fill="#0d0c18" />
        <rect x="785" y="160" width="40" height="90" fill="#0d0c18" />
        <rect x="803" y="70" width="4" height="90" fill="#2a2840" />
        <circle cx="805" cy="68" r="5" fill="#ff2a2a" />
        <rect x="789" y="196" width="32" height="14" rx="2" fill="#ff6900" />
        <text x="805" y="206.5" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#050505" fontFamily="sans-serif">
          18 PRO
        </text>
        <text x="805" y="232" textAnchor="middle" fontSize="5" fill="#ffd28a" fontFamily="sans-serif" opacity="0.9">
          OPEN LATE · FLOOR 88
        </text>
        {Array.from({ length: 28 }, (_, i) => (
          <rect key={i} x={772 + (i % 4) * 18} y={270 + Math.floor(i / 4) * 40} width="10" height="16" fill="#ffd28a" opacity={(i * 7) % 5 ? 0.85 : 0.2} />
        ))}
      </g>
      <rect y="960" width="1600" height="40" fill="#06060c" />
    </svg>
  );
}

export default function CameraDemo() {
  const [split, setSplit] = useState(50);
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ x: number; z: number } | null>(null);

  const setZ = useCallback((z: number) => setZoom(Math.round(clamp(z, 1, 10) * 10) / 10), []);

  const onDialDown = (e: React.PointerEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, z: zoom };
    setDragging(true);
  };
  const onDialMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    setZ(drag.current.z - (e.clientX - drag.current.x) / 48);
  };
  const onDialUp = () => {
    drag.current = null;
    setDragging(false);
  };
  const onDialKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') setZ(zoom + 0.5);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') setZ(zoom - 0.5);
    else if (e.key === 'Home') setZ(1);
    else if (e.key === 'End') setZ(10);
    else return;
    e.preventDefault();
  };

  const layer = { transform: `scale(${zoom})`, transformOrigin: ZOOM_ORIGIN, transition: dragging ? 'none' : 'transform 0.6s cubic-bezier(.2,.8,.2,1)' };
  const ticks = Array.from({ length: 19 }, (_, i) => 1 + i * 0.5);

  return (
    <div className="relative mx-auto max-w-6xl px-6 py-28 md:py-40">
      <div className="mb-12 grid gap-6 md:grid-cols-2 md:items-end">
        <div>
          <p className="eyebrow mb-4">Night mode · Zoom</p>
          <h3 className="display display-lg">
            Night,
            <br />
            made <span className="text-mi">legible.</span>
          </h3>
        </div>
        <p className="max-w-md text-white/60 md:justify-self-end">
          Drag across the frame to compare, then scrub the zoom dial from 1x to 10x and read the sign on the tower.
          <span className="mt-2 block text-xs text-white/35">Illustration, not a real camera sample.</span>
        </p>
      </div>

      <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] border border-white/10 sm:aspect-[16/10]">
        {/* Before */}
        <div className="absolute inset-0" style={{ filter: 'brightness(0.32) contrast(0.85) saturate(0.55) blur(1.3px)' }}>
          <div className="h-full w-full will-change-transform" style={layer}>
            <NightCity />
          </div>
        </div>
        <div aria-hidden className="grain pointer-events-none absolute -inset-[20%] opacity-30 mix-blend-overlay" />
        {/* After */}
        <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${split}%)`, filter: 'brightness(1.05) saturate(1.15) contrast(1.05)' }}>
          <div className="h-full w-full will-change-transform" style={layer}>
            <NightCity />
          </div>
        </div>

        <div aria-hidden className="pointer-events-none absolute inset-y-0 w-px bg-white/80" style={{ left: `${split}%` }}>
          <div className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-ink shadow-xl">
            <svg width="20" height="12" viewBox="0 0 20 12">
              <path d="M6 1L1 6l5 5M14 1l5 5-5 5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            </svg>
          </div>
        </div>
        <span className="glass pointer-events-none absolute left-4 top-4 rounded-full px-3 py-1 text-xs text-white/70">Night mode off</span>
        <span className="pointer-events-none absolute right-4 top-4 rounded-full bg-mi px-3 py-1 text-xs font-semibold text-ink">Night mode on</span>

        <input
          type="range"
          min={0}
          max={100}
          value={split}
          onChange={(e) => setSplit(Number(e.target.value))}
          aria-label="Compare night mode off and on"
          data-cursor="drag"
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        />

        <div className="glass absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full px-4 py-1.5 text-sm font-semibold tabular-nums text-white" aria-live="polite">
          {zoom.toFixed(1)}x
        </div>
      </div>

      {/* Zoom dial */}
      <div className="mt-8 flex flex-col items-center gap-5">
        <div
          role="slider"
          tabIndex={0}
          aria-label="Zoom level"
          aria-valuemin={1}
          aria-valuemax={10}
          aria-valuenow={zoom}
          aria-valuetext={`${zoom.toFixed(1)} times zoom`}
          data-cursor="drag"
          onPointerDown={onDialDown}
          onPointerMove={onDialMove}
          onPointerUp={onDialUp}
          onPointerCancel={onDialUp}
          onKeyDown={onDialKey}
          className="focus-ring relative h-16 w-full max-w-xl touch-none select-none overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
          style={{ maskImage: 'linear-gradient(90deg, transparent, #000 25%, #000 75%, transparent)', WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 25%, #000 75%, transparent)' }}
        >
          <div
            className="absolute left-1/2 top-0 flex h-full items-end pb-3"
            style={{ transform: `translateX(${-(zoom - 1) * 48}px)`, transition: dragging ? 'none' : 'transform 0.5s cubic-bezier(.2,.8,.2,1)' }}
          >
            {ticks.map((t) => {
              const major = Number.isInteger(t);
              return (
                <div key={t} className="absolute bottom-3 flex flex-col items-center" style={{ left: (t - 1) * 48, transform: 'translateX(-50%)' }}>
                  {major && <span className={`mb-1 text-[11px] tabular-nums ${ZOOM_STOPS.includes(t) ? 'text-white' : 'text-white/40'}`}>{t}x</span>}
                  <span className={`block w-px ${major ? 'h-4 bg-white/70' : 'h-2 bg-white/30'}`} />
                </div>
              );
            })}
          </div>
          <span aria-hidden className="absolute left-1/2 top-2 h-12 w-[2px] -translate-x-1/2 rounded bg-mi" />
        </div>
        <div className="flex gap-2">
          {ZOOM_STOPS.map((z) => (
            <button key={z} onClick={() => setZ(z)} aria-pressed={zoom === z} className="chip">
              {z}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
