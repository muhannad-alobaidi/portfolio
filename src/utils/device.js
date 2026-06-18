/*
  Central device / performance profiling. The site runs several GPU particle
  scenes simultaneously, so phones and low-power GPUs need a lighter budget:
  fewer particles, lower DPR, and respect for reduced-motion. Everything here
  is read once at mount (particle buffers are fixed-size and not rebuilt on
  resize), so these are plain functions, not reactive hooks.
*/

const mq = q => typeof window !== 'undefined' && window.matchMedia(q).matches;

export const prefersReducedMotion = () => mq('(prefers-reduced-motion: reduce)');

export const isTouch = () =>
  mq('(pointer: coarse)') ||
  (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0);

export const isSmallScreen = () =>
  typeof window !== 'undefined' && window.innerWidth <= 768;

// 'low' gets the reduced budget: small/coarse screens, or reduced-motion.
export function perfTier() {
  if (typeof window === 'undefined') return 'high';
  if (prefersReducedMotion()) return 'low';
  const small = window.innerWidth <= 820;
  const coarse = mq('(pointer: coarse)');
  // a coarse pointer on a narrow viewport is a phone; tablets (wide + coarse)
  // still get the lighter tier because their GPUs are usually mobile-class
  if (small || coarse) return 'low';
  return 'high';
}

export const isLowPower = () => perfTier() === 'low';

/*
  Pick a square particle-grid size by tier. `high`/`low` are the texture
  dimensions (NxN particles); on low tier we shrink the grid, which cuts the
  particle count quadratically — the single biggest GPU saving on mobile.
*/
export const particleSize = (high, low) => (isLowPower() ? low : high);

// clamp the render DPR; phones lie about devicePixelRatio (often 3), which
// quadruples fragment work for no visible gain on a small panel
export function maxDpr(cap = 2) {
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  return Math.min(isLowPower() ? 1.5 : cap, dpr);
}
