'use client';

import { useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { scrollToId, useIsoLayoutEffect } from '@/lib/hooks';
import { navSections } from '@/data/products';

const GITHUB_URL = 'https://github.com/kazzi-dev';
const SOCIALS = [
  { label: 'Instagram', href: 'https://www.instagram.com/kazzx_kun' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@kazzzutoo' },
  { label: 'GitHub', href: GITHUB_URL },
].filter((s) => s.href);

export default function Footer() {
  const root = useRef<HTMLElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const [email, setEmail] = useState('');
  const [joined, setJoined] = useState(false);

  useIsoLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add(
      { motion: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' },
      (ctx) => {
        if (ctx.conditions?.reduce) {
          gsap.set(fill.current, { clipPath: 'inset(0% 0% 0% 0%)' });
          return;
        }
        // The outlined wordmark fills with orange from the bottom as you reach the end of the page.
        gsap.fromTo(
          fill.current,
          { clipPath: 'inset(100% 0% 0% 0%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            ease: 'none',
            scrollTrigger: { trigger: '.footer-mark', start: 'top bottom', end: 'bottom bottom', scrub: 0.6 },
          },
        );
      },
      root,
    );
    return () => mm.revert();
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return;
    setJoined(true);
    setEmail('');
  };

  return (
    <footer ref={root} className="relative overflow-hidden border-t border-white/5 pt-24">
      <div className="mx-auto grid max-w-6xl gap-14 px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="display text-3xl md:text-4xl">
            Get the launch notes <span className="text-mi">first.</span>
          </p>
          <form onSubmit={submit} className="mt-6 flex max-w-md gap-2" noValidate>
            <label htmlFor="newsletter" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setJoined(false);
              }}
              placeholder="you@example.com"
              className="focus-ring min-w-0 flex-1 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm placeholder:text-white/30"
            />
            <button type="submit" className="focus-ring rounded-full bg-mi px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-white">
              Notify me
            </button>
          </form>
          <p className="mt-3 h-5 text-sm text-white/60" aria-live="polite">
            {joined ? 'Thanks. This concept has no mailing list, so nothing was sent.' : ''}
          </p>
        </div>
        <nav aria-label="Footer">
          <p className="mb-4 text-xs uppercase tracking-[0.2em] text-white/40">Explore</p>
          <ul className="grid gap-2">
            {navSections.map((s) => (
              <li key={s.id}>
                <button onClick={() => scrollToId(s.id)} className="focus-ring rounded text-sm text-white/70 transition-colors hover:text-mi">
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="mb-4 text-xs uppercase tracking-[0.2em] text-white/40">Follow</p>
          <ul className="grid gap-2">
            {SOCIALS.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" className="focus-ring rounded text-sm text-white/70 transition-colors hover:text-mi">
                  {s.label} <span aria-hidden>↗</span>
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="footer-mark relative mt-20 select-none px-2" aria-hidden>
        <span className="display block text-center leading-[0.8] text-transparent" style={{ fontSize: 'clamp(4rem, 24vw, 26rem)', WebkitTextStroke: '1.5px rgba(255,255,255,0.18)' }}>
          XIAOMI
        </span>
        <span
          ref={fill}
          className="display text-gradient-mi-v absolute inset-x-2 top-0 block text-center leading-[0.8]"
          style={{ fontSize: 'clamp(4rem, 24vw, 26rem)', clipPath: 'inset(100% 0% 0% 0%)' }}
        >
          XIAOMI
        </span>
      </div>

      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-2 px-6 py-8 text-xs text-white/35 md:flex-row">
        <p>
          © 2026 <span className="font-semibold text-white/70">Kazzi</span>. All rights reserved. Designed &amp; built by Kazzi.
        </p>
        <p>Fan-made concept, not affiliated with Xiaomi. Specs and prices are placeholders.</p>
      </div>
    </footer>
  );
}
