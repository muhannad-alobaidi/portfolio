import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import HeroParticles from './hero/HeroParticles';
import LogoParticles from './hero/LogoParticles';
import ErrorBoundary from './ErrorBoundary';

// the two heavy scenes (3D workstation + ~70MB model, and the brain core with
// its GPU glyph swarm) are split into their own chunks and only mounted once
// the user scrolls near them, so first paint loads just the hero swarm
const PCSection = lazy(() => import('./PCSection'));
const BrainSection = lazy(() => import('./brain/BrainSection'));

/*
  The whole site is one full-screen canvas experience, igloo-style:
  three fixed scene layers (GPU particles -> 3D workstation -> brain) and an
  invisible 300vh scroll proxy with CSS snap. Scroll progress (0..2)
  crossfades the layers and drives the hero swarm's dispersion.
*/
const ScrollExperience = () => {
  const progress = useRef(0); // continuous, read by the particle sim
  const [p, setP] = useState(0); // throttled copy for layer styling
  // Each WebGL scene is mounted only within a scroll window and UNMOUNTED when
  // far away, so its GPU context is released (display:none keeps the context
  // alive — and three live contexts + the model's would exhaust the browser's
  // limit, losing the model's context). Hysteresis bands [enter/exit] keep a
  // scene from thrashing if the user parks on a threshold. At any steady
  // section at most two contexts are live; transitions briefly touch three.
  const [mounted, setMounted] = useState({ hero: true, pc: false, brain: false });

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const vh = window.innerHeight;
        const v = Math.max(0, Math.min(2, window.scrollY / vh));
        progress.current = v;
        setP(Math.round(v * 100) / 100);
        setMounted(prev => {
          // hero swarm: only near the top. Its opacity (heroO) already hits 0
          // by p≈0.71, so unmounting by 0.85 frees its WebGL context before the
          // PC scene settles — shrinking the hero+PC context overlap window.
          const hero = v < 0.7 ? true : v > 0.85 ? false : prev.hero;
          // workstation: across the whole middle, released at either extreme
          const pc =
            v > 0.1 && v < 1.9 ? true : v < 0.05 || v > 1.95 ? false : prev.pc;
          // brain core: only once clearly leaving the PC section, so its GPU
          // sim never spins up a context while the model is on screen
          const brain = v > 1.15 ? true : v < 1.05 ? false : prev.brain;
          if (hero === prev.hero && pc === prev.pc && brain === prev.brain)
            return prev;
          return { hero, pc, brain };
        });
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // per-layer opacity over the scroll line
  const heroO = Math.max(0, 1 - p * 1.4);
  const pcO = Math.max(0, 1 - Math.abs(p - 1) * 1.6);
  const brainO = Math.max(0, (p - 1) * 1.4 - 0.15);
  // a layer owns the pointer only when settled on it
  const active = Math.abs(p - Math.round(p)) < 0.3 ? Math.round(p) : -1;
  // which layers are mounted/visible — drives each canvas's render loop so
  // off-screen scenes stop their GPU work instead of rendering invisibly
  const heroVisible = p < 1.02;
  const pcVisible = p > 0.05 && p < 1.95;
  const brainVisible = p > 1.05;

  const layer = (visible, opacity, interactive, z) => ({
    opacity,
    zIndex: z,
    display: visible ? 'block' : 'none',
    pointerEvents: interactive ? 'auto' : 'none',
  });

  return (
    <>
      {/* fixed scene stack */}
      <div className="fixed inset-0" style={layer(heroVisible, heroO, active === 0, 1)}>
        {mounted.hero && <HeroParticles progress={progress} active={heroVisible} />}
      </div>

      <div
        className="fixed inset-0"
        style={{
          ...layer(pcVisible, pcO, active === 1, 2),
          transform: `scale(${0.94 + 0.06 * pcO})`,
        }}
      >
        {mounted.pc && (
          <ErrorBoundary>
            <Suspense fallback={null}>
              <PCSection active={pcVisible} />
            </Suspense>
          </ErrorBoundary>
        )}
      </div>

      <div
        className="fixed inset-0"
        style={layer(brainVisible, brainO, active === 2, 3)}
      >
        {mounted.brain && (
          <ErrorBoundary>
            <Suspense fallback={null}>
              <BrainSection active={brainVisible} />
            </Suspense>
          </ErrorBoundary>
        )}
      </div>

      {/* corner monogram: a logo-sized echo of the hero swarm, alive on
          the PC/brain sections. Mounted only past the hero so it
          re-assembles from particles on every return; click = back home */}
      <div
        className="fixed top-2 left-2 md:top-3 md:left-4 w-28 h-10 md:w-36 md:h-13 transition-opacity duration-700"
        style={{
          zIndex: 4,
          opacity: p > 0.6 ? 1 : 0,
          pointerEvents: p > 0.6 ? 'auto' : 'none',
        }}
      >
        {p > 0.35 && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            title="back to top"
            aria-label="Muhannad Alobaidi — back to top"
            className="w-full h-full cursor-pointer opacity-90 hover:opacity-100 hover:scale-105 transition-[opacity,transform] duration-300"
          >
            <LogoParticles />
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
        className="fixed bottom-6 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[4px] text-neon/60 pointer-events-none transition-opacity duration-500"
        style={{ opacity: p < 0.05 ? 1 : 0, zIndex: 4 }}
      >
        SCROLL ▾
      </div>
    </>
  );
};

export default ScrollExperience;
