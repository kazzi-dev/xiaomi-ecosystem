'use client';

import { useEffect, useState } from 'react';
import { navSections } from '@/data/products';
import { scrollToId } from '@/lib/hooks';

export default function SectionDots() {
  const [active, setActive] = useState<string>('hero');

  useEffect(() => {
    const onScroll = () => {
      const mid = window.innerHeight / 2;
      let current: string = navSections[0].id;
      for (const s of navSections) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= mid) current = s.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav aria-label="Sections" className="fixed right-4 top-1/2 z-[60] hidden -translate-y-1/2 lg:block">
      <ul className="flex flex-col gap-3">
        {navSections.map((s) => {
          const on = active === s.id;
          return (
            <li key={s.id} className="group relative flex items-center justify-end">
              <span
                className={`pointer-events-none absolute right-6 whitespace-nowrap rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 ${
                  on ? 'opacity-100' : ''
                }`}
              >
                {s.label}
              </span>
              <button
                onClick={() => scrollToId(s.id)}
                aria-label={`Go to ${s.label}`}
                aria-current={on ? 'true' : undefined}
                className="focus-ring grid h-4 w-4 place-items-center rounded-full"
              >
                <span
                  className={`block rounded-full transition-all duration-500 ${on ? 'h-3 w-3 bg-mi' : 'h-1.5 w-1.5 bg-white/40 group-hover:bg-white'}`}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
