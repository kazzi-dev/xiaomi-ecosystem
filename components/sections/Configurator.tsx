'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { accessories, products } from '@/data/products';
import CountUp from '@/components/ui/CountUp';
import Button from '@/components/ui/Button';
import LazyMount from '@/components/ui/LazyMount';
import type { Setup } from '@/components/three/ConfiguratorScene';

const ConfiguratorScene = dynamic(() => import('@/components/three/ConfiguratorScene'), { ssr: false });

const PHONES = ['xiaomi-18-pro', 'xiaomi-18-pro-max', 'xiaomi-fold'] as const;
const TABLETS = ['none', 'pad-9', 'pad-9-pro-max'] as const;

function Option({ checked, onClick, title, sub, price, disabled }: { checked: boolean; onClick: () => void; title: string; sub?: string; price?: number; disabled?: boolean }) {
  return (
    <button
      role="radio"
      aria-checked={checked}
      disabled={disabled}
      onClick={onClick}
      className={`focus-ring flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-35 ${
        checked ? 'border-mi bg-mi/10' : 'border-white/10 hover:border-white/30'
      }`}
    >
      <span>
        <span className="block text-sm font-semibold">{title}</span>
        {sub && <span className="block text-xs text-white/45">{sub}</span>}
      </span>
      {price !== undefined && <span className="text-sm tabular-nums text-white/70">{price ? `$${price}` : '—'}</span>}
    </button>
  );
}

export default function Configurator() {
  const [setup, setSetup] = useState<Setup>({
    phone: 'xiaomi-18-pro',
    tablet: 'pad-9-pro-max',
    extras: { watch: true, buds: false, pen: true, keyboard: false },
  });
  const [saved, setSaved] = useState(false);
  const hasTablet = setup.tablet !== 'none';

  const total =
    products[setup.phone].price +
    (hasTablet ? products[setup.tablet as 'pad-9'].price : 0) +
    accessories.reduce((sum, a) => sum + (setup.extras[a.id] && (!a.requiresTablet || hasTablet) ? a.price : 0), 0);

  const update = (patch: Partial<Setup>) => {
    setSaved(false);
    setSetup((s) => ({ ...s, ...patch }));
  };

  return (
    <section id="build" aria-labelledby="build-title" className="relative py-28 md:py-40">
      <div className="mx-auto max-w-6xl px-6">
        <p className="eyebrow mb-4">06 — Build your setup</p>
        <h2 id="build-title" className="display display-lg">
          Your ecosystem,
          <br />
          <span className="text-gradient-mi">your way.</span>
        </h2>
      </div>

      <div className="mx-auto mt-12 grid max-w-6xl gap-6 px-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="glass relative aspect-[4/3] overflow-hidden rounded-[32px] lg:aspect-auto lg:min-h-[620px]">
          <div aria-hidden className="ambient-glow absolute left-1/2 top-1/2 h-[80%] w-[80%] rounded-full opacity-60" />
          <LazyMount className="absolute inset-0">
            <ConfiguratorScene setup={setup} />
          </LazyMount>
          <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">Total</p>
              <p className="display text-4xl md:text-5xl" aria-live="polite">
                <CountUp value={total} prefix="$" />
              </p>
            </div>
            <p className="max-w-[12rem] text-right text-xs text-white/40">Placeholder pricing. Move your cursor to turn the scene.</p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <fieldset>
            <legend className="mb-3 text-xs uppercase tracking-[0.2em] text-white/40">Phone</legend>
            <div role="radiogroup" aria-label="Phone" className="grid gap-2">
              {PHONES.map((id) => (
                <Option key={id} checked={setup.phone === id} onClick={() => update({ phone: id })} title={products[id].name} sub={products[id].specs.display} price={products[id].price} />
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-3 text-xs uppercase tracking-[0.2em] text-white/40">Tablet</legend>
            <div role="radiogroup" aria-label="Tablet" className="grid gap-2">
              {TABLETS.map((id) => (
                <Option
                  key={id}
                  checked={setup.tablet === id}
                  onClick={() => update({ tablet: id })}
                  title={id === 'none' ? 'No tablet' : products[id].name}
                  sub={id === 'none' ? undefined : products[id].specs.display}
                  price={id === 'none' ? 0 : products[id].price}
                />
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-3 text-xs uppercase tracking-[0.2em] text-white/40">Accessories</legend>
            <div className="grid grid-cols-2 gap-2">
              {accessories.map((a) => {
                const disabled = a.requiresTablet && !hasTablet;
                const on = setup.extras[a.id] && !disabled;
                return (
                  <button
                    key={a.id}
                    role="checkbox"
                    aria-checked={on}
                    disabled={disabled}
                    onClick={() => update({ extras: { ...setup.extras, [a.id]: !setup.extras[a.id] } })}
                    className={`focus-ring rounded-2xl border px-4 py-3 text-left transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-35 ${
                      on ? 'border-mi bg-mi/10' : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <span className="block text-sm font-semibold">{a.name}</span>
                    <span className="block text-xs text-white/45">{disabled ? 'Needs a tablet' : `$${a.price}`}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>
          <div className="flex items-center gap-4">
            <Button onClick={() => setSaved(true)}>Save this setup</Button>
            <p className="text-sm text-white/60" aria-live="polite">
              {saved ? 'Saved for this visit. Nothing was ordered.' : ''}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
