/*
  The shape of the scroll experience, in one place.

  Scroll progress runs 0..2 across three sections. Everything visual — layer
  opacity, the depth push-through, which canvases are allowed to render — is a
  pure function of that number, so the scroll driver stays a thin loop and the
  choreography can be tuned here without touching it.

  Two properties the old linear crossfade lacked and the transitions needed:

  - the bands barely overlap. Fading two full-screen WebGL canvases through each
    other at partial alpha is both muddy to look at and expensive to composite;
    the outgoing layer now lands at zero as the incoming one solidifies.
  - opacity is smoothstepped rather than linear, so a layer eases out of and
    into rest instead of starting and stopping abruptly at the band edges.
*/

export const clamp01 = t => (t < 0 ? 0 : t > 1 ? 1 : t);

/* Hermite ease, zero derivative at both ends. */
export const smoothstep = t => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};

/* Eased 0..1 ramp as `p` crosses from `a` to `b`. */
export const band = (p, a, b) => smoothstep((p - a) / (b - a));

/*
  Layer opacities. Deliberately reaching 0/1 with room to spare either side of
  each snap point, so a settled section is always exactly one opaque layer.
*/
export function opacities(p) {
  return {
    hero: 1 - band(p, 0.05, 0.55),
    pc: band(p, 0.15, 0.6) * (1 - band(p, 1.1, 1.6)),
    brain: band(p, 1.15, 1.65),
  };
}

/*
  NO CSS TRANSFORM ON THE SCENE LAYERS. This is load-bearing, not an omission.

  Every layer holds a self-measuring canvas: @react-three/fiber sizes its
  drawing buffer from the container's getBoundingClientRect, and the brain
  engine did the same. getBoundingClientRect includes CSS transforms, so a
  scale animated across a transition made every one of those canvases
  reallocate its drawing buffer on every frame of that transition — hundreds of
  GPU buffer allocations per scroll, which is enough to lose a WebGL context
  outright (observed: the hero canvas resizing to 1742x1089 under scale(1.25),
  then dying).

  The site shipped with `transform: scale(0.94 + 0.06 * pcO)` on the workstation
  layer, so this was already happening before any of this work — it was one of
  the causes of the stutter, not a new risk introduced by tuning it.

  Depth is expressed inside the scenes instead, where it costs nothing: the hero
  feeds `progress` straight into its dispersion shader (uDisperse), so its
  particles physically fly outward past the camera as you scroll away.
*/

/*
  A layer renders only while it can actually be seen. The old code drove the
  render loop off a much wider visibility band than the one where opacity was
  non-zero, so the workstation scene ran at full frame rate while fully
  transparent through a large part of the scroll.

  EPS keeps a layer alive one hair past true zero, so the frame that reaches
  opacity 0 is still drawn rather than freezing a stale image on screen.
*/
const EPS = 0.001;
export const visibility = p => {
  const o = opacities(p);
  return {
    hero: o.hero > EPS,
    pc: o.pc > EPS,
    brain: o.brain > EPS,
  };
};

/*
  Which layer owns pointer events: only the one settled under the snap point.
  Mid-transition nothing is interactive, so a drifting cursor can't grab the
  orbit controls of a scene that is on its way out.
*/
export const activeSection = p =>
  Math.abs(p - Math.round(p)) < 0.3 ? Math.round(p) : -1;

/*
  Mount windows — distinct from visibility, and much wider.

  The PC scene latches: once mounted it never unmounts. Tearing down its WebGL
  context was the single biggest source of transition stutter (context
  recreation, texture re-upload, shader recompilation and an HDR PMREM pass, all
  synchronous, right as the user was scrolling). That teardown only existed to
  relieve VRAM pressure from uncompressed textures — with the models now
  KTX2-compressed, the scene can simply stay resident.

  Hero and brain still cycle: the hero is pure shader work with no assets, and
  the brain's engine is Canvas2D with only a light particle overlay in WebGL, so
  rebuilding either is cheap.
*/
export function mounts(p, prev) {
  return {
    // the only scene that still cycles: pure shader work, no assets, so
    // rebuilding it is cheap. Enter/exit thresholds differ so parking on the
    // boundary can't thrash it.
    hero: p < 0.7 ? true : p > 0.9 ? false : prev.hero,
    // mounted from the very first frame and never unmounted. Building this
    // scene costs ~250ms of reconciliation, glTF parse and shader compilation;
    // mounting it on approach spent that in the middle of the hero->PC scroll,
    // which was the single worst frame in the whole experience. Mounted at load
    // it happens behind the splash screen instead, where nobody is waiting on a
    // frame — and staying mounted means it is never paid again.
    pc: true,
    // latches on first approach and stays. Its engine init and teardown were
    // each costing a ~120-235ms frame, once on the way in and again on the way
    // back out. Also warmed on idle (see ScrollExperience) so even the first
    // approach doesn't pay it.
    brain: prev.brain || p > 1.0,
    // likewise latching: a small canvas, but creating and destroying its GL
    // context on every hero<->PC pass is the same mistake in miniature. Its
    // render loop is gated separately, so mounted-but-idle costs nothing.
    logo: prev.logo || p > 0.35,
  };
}

export const sameMounts = (a, b) =>
  a.hero === b.hero && a.pc === b.pc && a.brain === b.brain && a.logo === b.logo;
