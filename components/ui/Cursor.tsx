'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';

/**
 * Dot + ring cursor. Elements opt in to a morph with data-cursor:
 *   data-cursor="hover"         ring grows
 *   data-cursor="drag"          ring becomes a labelled "Drag" pill
 *   data-cursor-label="Draw"    custom label
 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState('');
  const [mode, setMode] = useState<'default' | 'hover' | 'label'>('default');
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduced) return;
    setEnabled(true);
    document.documentElement.classList.add('has-cursor');
    return () => document.documentElement.classList.remove('has-cursor');
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const dx = gsap.quickTo(dot.current, 'x', { duration: 0.08, ease: 'power3' });
    const dy = gsap.quickTo(dot.current, 'y', { duration: 0.08, ease: 'power3' });
    const rx = gsap.quickTo(ring.current, 'x', { duration: 0.45, ease: 'power3' });
    const ry = gsap.quickTo(ring.current, 'y', { duration: 0.45, ease: 'power3' });

    const move = (e: PointerEvent) => {
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
    };
    const over = (e: PointerEvent) => {
      const target = (e.target as HTMLElement).closest<HTMLElement>(
        '[data-cursor], a, button, [role="button"], [role="slider"], input, label',
      );
      if (!target) {
        setMode('default');
        return;
      }
      const custom = target.dataset.cursorLabel || (target.dataset.cursor === 'drag' ? 'Drag' : '');
      if (custom) {
        setLabel(custom);
        setMode('label');
      } else setMode('hover');
    };
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerover', over, { passive: true });
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerover', over);
    };
  }, [enabled]);

  if (!enabled) return null;

  const ringSize = mode === 'label' ? 84 : mode === 'hover' ? 56 : 34;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100]">
      <div ref={dot} className="absolute left-0 top-0">
        <div className="h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-mi" />
      </div>
      <div ref={ring} className="absolute left-0 top-0">
        <div
          className="flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-[11px] font-semibold uppercase tracking-widest transition-[width,height,background-color,border-color] duration-300 ease-out"
          style={{
            width: ringSize,
            height: ringSize,
            borderColor: mode === 'default' ? 'rgba(255,255,255,0.35)' : 'rgba(255,105,0,0.9)',
            backgroundColor: mode === 'label' ? 'rgba(255,105,0,0.92)' : mode === 'hover' ? 'rgba(255,105,0,0.12)' : 'transparent',
            color: '#050505',
          }}
        >
          {mode === 'label' ? label : null}
        </div>
      </div>
    </div>
  );
}
