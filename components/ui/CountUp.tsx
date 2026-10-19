'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

type Props = { value: number; decimals?: number; duration?: number; prefix?: string; suffix?: string; start?: number };

const format = (v: number, decimals: number) =>
  v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

/** Animates from the previous value to the new one whenever `value` changes. */
export default function CountUp({ value, decimals = 0, duration = 0.9, prefix = '', suffix = '', start }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const current = useRef({ v: start ?? value });

  useEffect(() => {
    const tween = gsap.to(current.current, {
      v: value,
      duration,
      ease: 'power3.out',
      onUpdate: () => {
        if (ref.current) ref.current.textContent = prefix + format(current.current.v, decimals) + suffix;
      },
    });
    return () => {
      tween.kill();
    };
  }, [value, decimals, duration, prefix, suffix]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix + format(start ?? value, decimals) + suffix}
    </span>
  );
}
