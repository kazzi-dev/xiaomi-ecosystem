'use client';

import { useRef } from 'react';
import { useInView } from '@/lib/hooks';

/** Mounts children only once the wrapper comes within `rootMargin` of the viewport. */
export default function LazyMount({
  children,
  className = '',
  rootMargin = '600px',
}: {
  children: React.ReactNode;
  className?: string;
  rootMargin?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, rootMargin, true);
  return (
    <div ref={ref} className={className}>
      {seen ? children : null}
    </div>
  );
}
