export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

/** Maps p from [a, b] to [0, 1] with smoothstep easing. */
export function range(p: number, a: number, b: number) {
  const t = clamp((p - a) / (b - a));
  return t * t * (3 - 2 * t);
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
