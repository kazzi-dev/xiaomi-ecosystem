'use client';

/**
 * Window-level normalized pointer (-1..1). 3D scenes read this instead of R3F's
 * canvas pointer so overlays above the canvas never block the parallax.
 */
export const pointer = { x: 0, y: 0 };

if (typeof window !== 'undefined') {
  window.addEventListener(
    'pointermove',
    (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    },
    { passive: true },
  );
}
