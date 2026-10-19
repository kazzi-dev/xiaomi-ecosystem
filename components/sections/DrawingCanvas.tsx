'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useMediaQuery } from '@/lib/hooks';

const COLORS = [
  { name: 'Orange', value: '#ff6900' },
  { name: 'Ink', value: '#111114' },
  { name: 'Blue', value: '#2e7bff' },
  { name: 'Green', value: '#16a34a' },
];

type Point = { x: number; y: number; w: number };

/**
 * Stylus simulation: line width follows real pen pressure when the device reports it,
 * otherwise it thins out as the stroke speeds up, like a brush pen.
 */
export default function DrawingCanvas() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const last = useRef<Point & { t: number } | null>(null);
  const mid = useRef<{ x: number; y: number } | null>(null);
  const [color, setColor] = useState(COLORS[0].value);
  const [size, setSize] = useState(10);
  const [eraser, setEraser] = useState(false);
  const [hasInk, setHasInk] = useState(false);
  const coarse = useMediaQuery('(pointer: coarse)');
  // On touch screens drawing must be switched on, otherwise the canvas would trap page scrolling.
  const [touchDraw, setTouchDraw] = useState(false);
  const active = !coarse || touchDraw;

  const resize = useCallback(() => {
    const c = canvas.current;
    if (!c) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = c.offsetWidth;
    const h = c.offsetHeight;
    if (!w || !h) return;
    const prev = document.createElement('canvas');
    prev.width = c.width;
    prev.height = c.height;
    prev.getContext('2d')?.drawImage(c, 0, 0);
    c.width = Math.round(w * dpr);
    c.height = Math.round(h * dpr);
    const g = c.getContext('2d')!;
    g.drawImage(prev, 0, 0, c.width, c.height);
  }, []);

  useEffect(() => {
    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.current) ro.observe(canvas.current);
    return () => ro.disconnect();
  }, [resize]);

  const toLocal = (e: React.PointerEvent) => {
    const c = canvas.current!;
    const r = c.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * c.width, y: ((e.clientY - r.top) / r.height) * c.height, scale: c.width / r.width };
  };

  const onDown = (e: React.PointerEvent) => {
    if (!active) return;
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const p = toLocal(e);
    const w = size * p.scale;
    last.current = { x: p.x, y: p.y, w, t: performance.now() };
    mid.current = { x: p.x, y: p.y };
    const g = canvas.current!.getContext('2d')!;
    g.globalCompositeOperation = eraser ? 'destination-out' : 'source-over';
    g.fillStyle = color;
    g.beginPath();
    g.arc(p.x, p.y, w / 2, 0, Math.PI * 2);
    g.fill();
    setHasInk(true);
  };

  const onMove = (e: React.PointerEvent) => {
    const L = last.current;
    if (!L || !mid.current) return;
    e.stopPropagation();
    const p = toLocal(e);
    const now = performance.now();
    const dist = Math.hypot(p.x - L.x, p.y - L.y);
    if (dist < 1) return;
    const speed = dist / p.scale / Math.max(now - L.t, 1); // css px per ms
    const pressure = e.pointerType === 'pen' && e.pressure > 0 ? 0.3 + e.pressure * 1.4 : Math.max(0.35, 1.25 - speed * 0.45);
    const target = size * p.scale * (eraser ? 2.5 : pressure);
    const w = L.w + (target - L.w) * 0.35;
    const g = canvas.current!.getContext('2d')!;
    const m = { x: (L.x + p.x) / 2, y: (L.y + p.y) / 2 };
    g.globalCompositeOperation = eraser ? 'destination-out' : 'source-over';
    g.strokeStyle = color;
    g.lineCap = 'round';
    g.lineJoin = 'round';
    g.lineWidth = w;
    g.beginPath();
    g.moveTo(mid.current.x, mid.current.y);
    g.quadraticCurveTo(L.x, L.y, m.x, m.y);
    g.stroke();
    mid.current = m;
    last.current = { x: p.x, y: p.y, w, t: now };
  };

  const onUp = () => {
    last.current = null;
    mid.current = null;
  };

  const clear = () => {
    const c = canvas.current;
    if (!c) return;
    c.getContext('2d')!.clearRect(0, 0, c.width, c.height);
    setHasInk(false);
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#f4efe8]">
      <div
        aria-hidden
        className="absolute inset-0 opacity-60"
        style={{ backgroundImage: 'radial-gradient(#00000014 1px, transparent 1px)', backgroundSize: '22px 22px' }}
      />
      {!hasInk && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="display text-3xl text-ink/80 md:text-6xl">Draw something.</p>
            <p className="mt-2 text-sm text-ink/50">{coarse ? 'Tap “Draw” then use your finger.' : 'Click and drag anywhere on the screen.'}</p>
          </div>
        </div>
      )}
      <canvas
        ref={canvas}
        className="absolute inset-0 h-full w-full"
        style={{ touchAction: active ? 'none' : 'pan-y' }}
        data-cursor-label="Draw"
        aria-label="Drawing canvas"
        role="img"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerLeave={onUp}
      />
      <div className="absolute left-1/2 top-3 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-ink/85 p-1.5 shadow-xl backdrop-blur md:top-4 md:gap-2 md:p-2">
        {coarse && (
          <button
            onClick={() => setTouchDraw((v) => !v)}
            aria-pressed={touchDraw}
            className={`focus-ring rounded-full px-3 py-1.5 text-xs font-semibold ${touchDraw ? 'bg-mi text-ink' : 'bg-white/10 text-white'}`}
          >
            {touchDraw ? 'Drawing' : 'Draw'}
          </button>
        )}
        <div role="radiogroup" aria-label="Pen color" className="flex gap-1.5">
          {COLORS.map((c) => (
            <button
              key={c.value}
              role="radio"
              aria-checked={!eraser && color === c.value}
              aria-label={c.name}
              onClick={() => {
                setColor(c.value);
                setEraser(false);
              }}
              className={`focus-ring h-6 w-6 rounded-full border-2 md:h-7 md:w-7 ${!eraser && color === c.value ? 'border-white' : 'border-transparent'}`}
              style={{ background: c.value, boxShadow: c.value === '#111114' ? 'inset 0 0 0 1px #ffffff40' : undefined }}
            />
          ))}
        </div>
        <label className="hidden items-center gap-2 px-2 text-xs text-white/70 sm:flex">
          <span className="sr-only">Brush size</span>
          <input type="range" min={3} max={28} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-20 accent-[#ff6900]" />
        </label>
        <button
          onClick={() => setEraser((v) => !v)}
          aria-pressed={eraser}
          className={`focus-ring rounded-full px-3 py-1.5 text-xs font-semibold ${eraser ? 'bg-white text-ink' : 'text-white/80 hover:bg-white/10'}`}
        >
          Eraser
        </button>
        <button onClick={clear} className="focus-ring rounded-full px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10">
          Clear
        </button>
      </div>
    </div>
  );
}
