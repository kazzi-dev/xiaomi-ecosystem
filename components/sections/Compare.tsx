'use client';

import { useRef, useState } from 'react';
import { productList, type Product, type ProductId } from '@/data/products';
import { useInView } from '@/lib/hooks';

type Row = {
  label: string;
  value: (p: Product) => string;
  /** Optional numeric metric to draw as a bar; `invert` means lower is better. */
  bar?: { get: (p: Product) => number; invert?: boolean };
};

const ROWS: Row[] = [
  { label: 'Price', value: (p) => `$${p.price.toLocaleString('en-US')}` },
  { label: 'Display', value: (p) => p.specs.display, bar: { get: (p) => p.specs.displaySize } },
  { label: 'Refresh rate', value: (p) => p.specs.refresh },
  { label: 'Chip', value: (p) => p.specs.chip },
  { label: 'Memory', value: (p) => p.specs.ram },
  { label: 'Storage', value: (p) => p.specs.storage },
  { label: 'Main camera', value: (p) => p.specs.mainCamera, bar: { get: (p) => p.specs.cameraMp } },
  { label: 'Zoom', value: (p) => p.specs.zoom },
  { label: 'Battery', value: (p) => `${p.specs.battery.toLocaleString('en-US')} mAh`, bar: { get: (p) => p.specs.battery } },
  { label: 'Charging', value: (p) => `${p.specs.charging} W`, bar: { get: (p) => p.specs.charging } },
  { label: 'Thickness', value: (p) => `${p.specs.thickness} mm`, bar: { get: (p) => p.specs.thickness, invert: true } },
  { label: 'Weight', value: (p) => `${p.specs.weight} g` },
];

const MIN = 2;
const MAX = 3;

export default function Compare() {
  const [picked, setPicked] = useState<ProductId[]>(['xiaomi-18-pro-max', 'xiaomi-fold', 'pad-9-pro-max']);
  const [hover, setHover] = useState<number | null>(null);
  const table = useRef<HTMLDivElement>(null);
  const seen = useInView(table, '-15% 0px', true);
  const cols = picked.map((id) => productList.find((p) => p.id === id)!);

  const toggle = (id: ProductId) => {
    setPicked((cur) => {
      if (cur.includes(id)) return cur.length > MIN ? cur.filter((x) => x !== id) : cur;
      if (cur.length >= MAX) return [...cur.slice(1), id];
      return [...cur, id];
    });
  };

  const grid = { gridTemplateColumns: `repeat(${cols.length}, minmax(0, 1fr))` };

  return (
    <section id="compare" aria-labelledby="compare-title" className="relative py-28 md:py-40">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="eyebrow mb-4">05 — Compare</p>
            <h2 id="compare-title" className="display display-lg">
              Find your <span className="text-mi">screen.</span>
            </h2>
          </div>
          <div>
            <p className="mb-3 text-sm text-white/50">Pick {MIN}–{MAX} devices</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Devices to compare">
              {productList.map((p) => (
                <button key={p.id} className="chip" aria-pressed={picked.includes(p.id)} onClick={() => toggle(p.id)}>
                  {p.short}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div ref={table} role="table" aria-label="Specification comparison" className="relative">
          {/* Sticky device header */}
          <div role="rowgroup" className="sticky top-16 z-20 -mx-2 mb-2 md:top-20">
            <div role="row" className="glass grid gap-3 rounded-2xl px-2 py-3 md:grid-cols-[10rem_1fr] md:gap-6 md:px-4 md:py-4">
              <span role="columnheader" className="hidden self-center text-xs uppercase tracking-[0.2em] text-white/40 md:block">
                Spec
              </span>
              <div className="grid gap-3" style={grid}>
                {cols.map((p) => (
                  <div role="columnheader" key={p.id} className="min-w-0" style={{ animation: 'cmp-in .5s cubic-bezier(.2,.8,.2,1)' }}>
                    <p className="display truncate text-base md:text-2xl">{p.name.replace('Xiaomi ', '')}</p>
                    <p className="truncate text-xs text-white/50">{p.tagline}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div role="rowgroup">
            {ROWS.map((row, ri) => {
              const values = row.bar ? productList.map((p) => row.bar!.get(p)) : [];
              const max = Math.max(...values);
              const min = Math.min(...values);
              return (
                <div
                  role="row"
                  key={row.label}
                  onMouseEnter={() => setHover(ri)}
                  onMouseLeave={() => setHover(null)}
                  className={`grid gap-2 rounded-2xl border-b border-white/5 px-2 py-4 transition-colors duration-300 md:grid-cols-[10rem_1fr] md:gap-6 md:px-4 ${
                    hover === ri ? 'bg-white/[0.04]' : ''
                  }`}
                >
                  <span role="rowheader" className={`text-xs uppercase tracking-[0.15em] transition-colors md:self-center ${hover === ri ? 'text-mi' : 'text-white/40'}`}>
                    {row.label}
                  </span>
                  <div className="grid gap-3" style={grid}>
                    {cols.map((p) => {
                      const v = row.bar?.get(p) ?? 0;
                      let pct = row.bar ? v / max : 0;
                      if (row.bar?.invert) pct = min / v;
                      return (
                        <div role="cell" key={p.id} className="min-w-0">
                          <p className="text-sm text-white/90 md:text-base">{row.value(p)}</p>
                          {row.bar && (
                            <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                              <div
                                className="h-full origin-left rounded-full bg-gradient-to-r from-mi-deep to-mi transition-transform duration-1000 ease-[cubic-bezier(.2,.8,.2,1)]"
                                style={{ transform: `scaleX(${seen ? pct : 0})`, transitionDelay: seen ? `${ri * 40}ms` : '0ms' }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <p className="mt-6 text-xs text-white/35">All specifications and prices are placeholders for this concept and will change once official figures are published.</p>
      </div>
      <style>{`@keyframes cmp-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}`}</style>
    </section>
  );
}
