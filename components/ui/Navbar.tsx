'use client';

import { useEffect, useRef, useState } from 'react';
import { navSections } from '@/data/products';
import { scrollToId } from '@/lib/hooks';

export default function Navbar() {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const progress = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      if (Math.abs(y - last) > 6) {
        setHidden(y > last && y > 200);
        last = y;
      }
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progress.current) progress.current.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = (id: string) => {
    setOpen(false);
    scrollToId(id);
  };

  return (
    <>
      <div aria-hidden className="fixed inset-x-0 top-0 z-[80] h-[2px]">
        <div ref={progress} className="h-full origin-left bg-mi" style={{ transform: 'scaleX(0)' }} />
      </div>
      <header
        className={`fixed inset-x-0 top-0 z-[70] transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] ${
          hidden && !open ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        <nav
          aria-label="Primary"
          className={`mt-3 flex max-w-6xl items-center justify-between rounded-full px-4 py-2.5 transition-colors duration-500 md:px-6 ${
            scrolled || open ? 'glass' : 'border border-transparent'
          } mx-4 md:mx-auto`}
        >
          <button onClick={() => go('hero')} className="focus-ring flex items-center gap-2 rounded-full" aria-label="Back to top">
            <span aria-hidden className="grid h-8 w-8 place-items-center rounded-full bg-mi">
              <span className="h-3 w-3 rounded-full border-[2.5px] border-ink" />
            </span>
            <span className="hidden text-sm font-semibold tracking-tight sm:block">Ecosystem 2026</span>
          </button>

          <ul className="hidden items-center gap-1 md:flex">
            {navSections.slice(1).map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => go(s.id)}
                  className="focus-ring rounded-full px-3 py-1.5 text-sm text-white/65 transition-colors hover:bg-white/5 hover:text-white"
                >
                  {s.label}
                </button>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <button
              onClick={() => go('build')}
              className="focus-ring hidden rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-ink transition-colors hover:bg-mi sm:block"
            >
              Build yours
            </button>
            <button
              className="focus-ring grid h-9 w-9 place-items-center rounded-full md:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((o) => !o)}
            >
              <span className="relative block h-3 w-5">
                <span className={`absolute left-0 h-[1.5px] w-5 bg-white transition-all ${open ? 'top-1.5 rotate-45' : 'top-0'}`} />
                <span className={`absolute left-0 h-[1.5px] w-5 bg-white transition-all ${open ? 'top-1.5 -rotate-45' : 'top-3'}`} />
              </span>
            </button>
          </div>
        </nav>

        <div
          id="mobile-menu"
          className={`glass mx-4 mt-2 overflow-hidden rounded-3xl transition-all duration-500 md:hidden ${
            open ? 'max-h-96 opacity-100' : 'pointer-events-none max-h-0 opacity-0'
          }`}
        >
          <ul className="p-3">
            {navSections.slice(1).map((s) => (
              <li key={s.id}>
                <button
                  tabIndex={open ? 0 : -1}
                  onClick={() => go(s.id)}
                  className="focus-ring display w-full rounded-2xl px-4 py-3 text-left text-3xl text-white/80 hover:text-mi"
                >
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </header>
    </>
  );
}
