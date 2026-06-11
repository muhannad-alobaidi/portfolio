import { useEffect, useRef, useState } from 'react';
import HeroParticles from './hero/HeroParticles';
import LogoParticles from './hero/LogoParticles';
import PCSection from './PCSection';
import BrainSection from './brain/BrainSection';

/*
  The whole site is one full-screen canvas experience, igloo-style:
  three fixed scene layers (GPU particles -> 3D workstation -> brain) and an
  invisible 300vh scroll proxy with CSS snap. Scroll progress (0..2)
  crossfades the layers and drives the hero swarm's dispersion.
*/
const ScrollExperience = () => {
  const progress = useRef(0); // continuous, read by the particle sim
  const [p, setP] = useState(0); // throttled copy for layer styling

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const vh = window.innerHeight;
        const v = Math.max(0, Math.min(2, window.scrollY / vh));
        progress.current = v;
        setP(Math.round(v * 100) / 100);
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

  const layer = (visible, opacity, interactive, z) => ({
    opacity,
    zIndex: z,
    display: visible ? 'block' : 'none',
    pointerEvents: interactive ? 'auto' : 'none',
  });

  return (
    <>
      {/* fixed scene stack */}
      <div className="fixed inset-0" style={layer(p < 1.02, heroO, active === 0, 1)}>
        <HeroParticles progress={progress} />
      </div>

      <div
        className="fixed inset-0"
        style={{
          ...layer(p > 0.05 && p < 1.95, pcO, active === 1, 2),
          transform: `scale(${0.94 + 0.06 * pcO})`,
        }}
      >
        <PCSection />
      </div>

      <div
        className="fixed inset-0"
        style={layer(p > 1.05, brainO, active === 2, 3)}
      >
        <BrainSection />
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
