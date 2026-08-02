import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import HeroParticles from './hero/HeroParticles';
import LogoParticles from './hero/LogoParticles';
import ErrorBoundary from './ErrorBoundary';
import {
  opacities,
  visibility,
  activeSection,
  mounts,
  sameMounts,
} from '../utils/sceneTransition';

// the two heavy scenes (3D workstation, and the brain core with its GPU glyph
// swarm) are split into their own chunks. PCSection is also warmed early by
// utils/preloadScenes so reaching it is a render, not a download.
const PCSection = lazy(() => import('./PCSection'));
const BrainSection = lazy(() => import('./brain/BrainSection'));

/*
  The whole site is one full-screen canvas experience, igloo-style:
  three fixed scene layers (GPU particles -> 3D workstation -> brain) and an
  invisible 300vh scroll proxy with CSS snap.

  Scroll progress (0..2) drives everything, but nothing here re-renders on it.
  The previous version called setState on every scroll frame, re-rendering the
  whole layer tree ~200 times per pass; layer styling is now written straight to
  the DOM from a rAF loop, and React state is reserved for mount decisions,
  which change a handful of times per session.

  That loop also damps: it eases a displayed progress toward the raw scroll
  position rather than tracking it exactly. Wheel and trackpad deliver chunky
  deltas and the browser's snap animation can hitch, and damping decouples the
  crossfade from both — which is most of what makes the transition feel smooth.
*/

// how fast the displayed progress chases the real one (per second, exponential).
// high enough to feel connected to the wheel, low enough to absorb a stutter.
const FOLLOW = 12;
// below this the follower has effectively arrived; park the loop so the page
// can go fully idle instead of burning a rAF forever
const SETTLED = 5e-4;

const INITIAL_MOUNTS = { hero: true, pc: true, brain: false, logo: false };

const ScrollExperience = () => {
  const progress = useRef(0); // damped, continuous — read by the particle sims
  const [mounted, setMounted] = useState(INITIAL_MOUNTS);
  // mid-transition flag, used to tell the canvases to trade resolution for
  // frame rate while everything is moving (nobody can see DPR mid-fade)
  const [moving, setMoving] = useState(false);

  const heroRef = useRef(null);
  const pcRef = useRef(null);
  const brainRef = useRef(null);
  const logoRef = useRef(null);
  const hintRef = useRef(null);

  // `visible` gates each canvas's render loop; it lags the styling by a React
  // render, which is fine — the bands have slack built in either side
  const [visible, setVisible] = useState(() => visibility(0));
  const [active, setActive] = useState(0);

  useEffect(() => {
    const layers = {
      hero: heroRef.current,
      pc: pcRef.current,
      brain: brainRef.current,
    };

    let raf = 0;
    let last = performance.now();
    let target = 0;
    let running = false;
    // last values pushed to React, so we only setState on an actual change
    let lastVisible = visibility(progress.current);
    let lastActive = activeSection(progress.current);
    let lastMoving = false;
    let lastMounts = INITIAL_MOUNTS;

    const readTarget = () => {
      const vh = window.innerHeight || 1;
      target = Math.max(0, Math.min(2, window.scrollY / vh));
    };

    const paint = p => {
      const o = opacities(p);
      const vis = visibility(p);

      for (const key of ['hero', 'pc', 'brain']) {
        const el = layers[key];
        if (!el) continue;
        // opacity only — see the note in sceneTransition.js on why these layers
        // must never carry a transform
        el.style.opacity = o[key];
        // display:none rather than visibility:hidden so the compositor drops
        // the layer entirely; the canvas and its GL context stay alive
        el.style.display = vis[key] ? 'block' : 'none';
      }

      if (logoRef.current) {
        const on = p > 0.6;
        logoRef.current.style.opacity = on ? 1 : 0;
        logoRef.current.style.pointerEvents = on ? 'auto' : 'none';
      }
      if (hintRef.current) hintRef.current.style.opacity = p < 0.05 ? 1 : 0;
    };

    const tick = now => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const delta = target - progress.current;
      // frame-rate independent exponential ease
      progress.current += delta * (1 - Math.exp(-FOLLOW * dt));

      const arrived = Math.abs(target - progress.current) < SETTLED;
      if (arrived) progress.current = target;

      const p = progress.current;
      paint(p);

      const vis = visibility(p);
      if (
        vis.hero !== lastVisible.hero ||
        vis.pc !== lastVisible.pc ||
        vis.brain !== lastVisible.brain
      ) {
        lastVisible = vis;
        setVisible(vis);
      }

      const act = activeSection(p);
      if (act !== lastActive) {
        lastActive = act;
        setActive(act);
      }

      const isMoving = !arrived;
      if (isMoving !== lastMoving) {
        lastMoving = isMoving;
        setMoving(isMoving);
      }

      const nextMounts = mounts(p, lastMounts);
      if (!sameMounts(nextMounts, lastMounts)) {
        lastMounts = nextMounts;
        setMounted(nextMounts);
      }

      if (arrived) {
        running = false; // park until the next scroll
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      readTarget();
      start();
    };

    readTarget();
    progress.current = target; // no opening slide if reloaded mid-page
    paint(target);
    start();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  /*
    Static per-layer style. opacity/display are owned by the rAF loop from here
    on; the values seeded here are just the resting state at p=0, so the first
    paint matches before the loop's first frame lands.
    will-change is opacity ONLY — promoting the layer for transform would invite
    exactly the transform these layers must not have.
  */
  const layerStyle = useMemo(() => {
    const o = opacities(0);
    const v = visibility(0);
    return (key, z) => ({
      zIndex: z,
      willChange: 'opacity',
      opacity: o[key],
      display: v[key] ? 'block' : 'none',
    });
  }, []);

  return (
    <>
      {/* fixed scene stack */}
      <div
        ref={heroRef}
        className="fixed inset-0"
        style={{
          ...layerStyle('hero', 1),
          pointerEvents: active === 0 ? 'auto' : 'none',
        }}
      >
        {/* no DPR regression here: this canvas runs an EffectComposer, and
            resizing its render targets mid-transition would cost more than the
            resolution drop saves */}
        {mounted.hero && (
          <HeroParticles progress={progress} active={visible.hero} />
        )}
        {/* the name itself is GPU particles (HeroParticles/particleLib), not
            DOM text, so this subtitle rides underneath as an overlay rather
            than a third simulated word target. Parked at 78%: the swarm
            morphs between "MUHANNAD ALOBAIDI" (two lines, taller) and
            "<MA/>" (one line) — low enough to clear both. */}
        <div
          className="absolute left-1/2 top-[78%] -translate-x-1/2 text-center font-mono text-[11px] md:text-sm tracking-[3px] md:tracking-[5px] text-neon/70 pointer-events-none"
          style={{ zIndex: 1 }}
        >
          FULLSTACK / MOBILE DEVELOPER
        </div>
      </div>

      <div
        ref={pcRef}
        className="fixed inset-0"
        style={{
          ...layerStyle('pc', 2),
          pointerEvents: active === 1 ? 'auto' : 'none',
        }}
      >
        {mounted.pc && (
          <ErrorBoundary>
            <Suspense fallback={null}>
              <PCSection active={visible.pc} moving={moving} />
            </Suspense>
          </ErrorBoundary>
        )}
      </div>

      <div
        ref={brainRef}
        className="fixed inset-0"
        style={{
          ...layerStyle('brain', 3),
          pointerEvents: active === 2 ? 'auto' : 'none',
        }}
      >
        {mounted.brain && (
          <ErrorBoundary>
            <Suspense fallback={null}>
              <BrainSection active={visible.brain} />
            </Suspense>
          </ErrorBoundary>
        )}
      </div>

      {/* corner monogram: a logo-sized echo of the hero swarm, alive on
          the PC/brain sections. Mounted only past the hero so it
          re-assembles from particles on every return; click = back home */}
      <div
        ref={logoRef}
        className="fixed top-2 left-2 md:top-3 md:left-4 w-28 h-10 md:w-36 md:h-13 transition-opacity duration-700"
        style={{ zIndex: 4, opacity: 0, pointerEvents: 'none' }}
      >
        {mounted.logo && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            title="back to top"
            aria-label="Muhannad Alobaidi — back to top"
            className="w-full h-full cursor-pointer opacity-90 hover:opacity-100 hover:scale-105 transition-[opacity,transform] duration-300"
          >
            {/* only renders while settled: it is a fourth WebGL context, and
                letting it run through a transition took frame budget from the
                scene actually being looked at */}
            <LogoParticles active={!moving} />
          </button>
        )}
      </div>

      {/* invisible scroll proxy: 3 snap stops */}
      <div className="relative" style={{ zIndex: 0 }}>
        <section id="hero" className="snap-section" />
        <section id="model" className="snap-section" />
        <section id="brain" className="snap-section" />
      </div>

      {/* scroll hint, fades once you move */}
      <div
        ref={hintRef}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[4px] text-neon/60 pointer-events-none transition-opacity duration-500"
        style={{ opacity: 1, zIndex: 4 }}
      >
        SCROLL ▾
      </div>
    </>
  );
};

export default ScrollExperience;
