/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { portraitArt, portraitPhoto, photoSuit, photoHood, gymPixel } from '../../assets';
import { isTouch } from '../../utils/device';

/*
  The ABOUT node's focused content: a neon HUD "dossier" — portrait that
  crossfades caricature -> photo on hover, the story, off-hours, languages
  and a CV download. Rendered by BrainSection while the camera is focused
  on ABOUT, floating over the dimmed brain core.
*/
const AboutDossier = ({ data, onExit }) => {
  // touch has no hover, so the portrait crossfade is also tap-toggleable
  const [flip, setFlip] = useState(false);
  const tapHint = isTouch() ? 'TAP ⟳' : 'HOVER ⟳';

  // ESC closes the dossier and flies the camera back to the brain
  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape' && onExit) onExit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onExit]);

  if (!data) return null;
  const { role, bio = [], languages = [], hobbies = [], cv } = data;

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center p-4 pt-24 pointer-events-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="pointer-events-auto relative w-full max-w-[760px] max-h-[82vh] overflow-y-auto hide-scrollbar
          border border-neon/40 bg-[#020e16]/92 backdrop-blur-md
          shadow-[0_0_40px_rgba(75,232,255,0.18)] font-mono text-[#cdeffb]"
      >
        {/* scanlines */}
        <div
          className="absolute inset-0 pointer-events-none opacity-50"
          style={{
            background:
              'repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0 1px, transparent 1px 3px)',
          }}
        />
        {/* corner brackets */}
        <span className="absolute top-0 left-0 w-4 h-4 border-t border-l border-neon" />
        <span className="absolute top-0 right-0 w-4 h-4 border-t border-r border-neon" />
        <span className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-neon" />
        <span className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-neon" />

        {/* header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-2.5 border-b border-neon/20 bg-[#020e16]/92 backdrop-blur-md">
          <span className="text-[10px] tracking-[4px] text-neon">
            IDENTITY <span className="text-neon/40">{'//'}</span> DOSSIER
          </span>
          <button
            onClick={onExit}
            aria-label="Back to the brain"
            className="group flex items-center gap-1.5 px-2.5 py-1 border border-neon/30 text-[9px] tracking-[3px] text-neon/80
              hover:bg-neon/10 hover:border-neon/70 hover:text-neon hover:shadow-[0_0_12px_rgba(75,232,255,0.4)] transition-all"
          >
            EXIT
            <span className="text-[12px] leading-none group-hover:rotate-90 transition-transform">
              ✕
            </span>
          </button>
        </div>

        <div className="p-5 sm:p-6 grid gap-6 md:grid-cols-[210px_1fr] relative">
          {/* portrait: caricature -> photo on hover (or tap on touch) */}
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setFlip(f => !f)}
              aria-label="Toggle portrait between illustration and photo"
              className="group relative aspect-[4/5] w-full overflow-hidden border border-neon/30 bg-[#04121c] cursor-pointer"
            >
              <img
                src={portraitArt}
                alt="Muhannad Alobaidi — illustration"
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                  flip ? 'opacity-0' : 'group-hover:opacity-0'
                }`}
              />
              <img
                src={portraitPhoto}
                alt="Muhannad Alobaidi"
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                  flip ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}
              />
              <span className="absolute bottom-1.5 right-2 text-[8px] tracking-[2px] text-neon/70 [text-shadow:0_0_6px_#02070d]">
                {tapHint}
              </span>
            </button>
            {/* ID thumbnails */}
            <div className="flex gap-2">
              {[photoSuit, photoHood].map((src, i) => (
                <div
                  key={i}
                  className="flex-1 aspect-square overflow-hidden border border-neon/20 grayscale hover:grayscale-0 transition-all"
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* story */}
          <div className="flex flex-col">
            <h2 className="text-white text-[22px] sm:text-[26px] font-black tracking-wide leading-none">
              MUHANNAD <span className="text-neon [text-shadow:0_0_16px_rgba(75,232,255,0.5)]">ALOBAIDI</span>
            </h2>
            {role && (
              <p className="mt-1.5 text-[11px] tracking-[3px] text-neon/80 uppercase">
                {role}
              </p>
            )}
            <div className="my-3 h-px bg-gradient-to-r from-neon/50 to-transparent" />

            <div className="space-y-2.5 text-[12.5px] leading-relaxed text-[#bfe6f5]/90">
              {bio.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            {languages.length > 0 && (
              <p className="mt-3 text-[11px] tracking-[1px] text-[#9fd4e6]">
                <span className="text-neon/60">LANGUAGES</span> ·{' '}
                {languages.join(' · ')}
              </p>
            )}
          </div>

          {/* off-hours / hobbies */}
          <div className="md:col-span-2">
            <div className="my-1 h-px bg-gradient-to-r from-transparent via-neon/25 to-transparent" />
            <p className="mt-3 mb-2 text-[10px] tracking-[4px] text-neon/60">
              OFF-HOURS
            </p>
            <div className="flex flex-wrap gap-2">
              {hobbies.map(h => (
                <span
                  key={h.label}
                  className="flex items-center gap-2 px-3 py-1.5 border border-neon/25 bg-neon/5
                    text-[11px] tracking-wide text-[#d7f3fc] hover:border-neon/60 hover:bg-neon/10 transition-all"
                >
                  {h.label === 'Gym workout' ? (
                    <img
                      src={gymPixel}
                      alt=""
                      className="w-5 h-5 object-contain"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  ) : (
                    <span className="text-[13px] leading-none">{h.icon}</span>
                  )}
                  {h.label}
                </span>
              ))}
            </div>
          </div>

          {/* CV */}
          {cv && (
            <div className="md:col-span-2 mt-1">
              <a
                href={cv}
                download
                className="inline-flex items-center gap-3 px-6 py-3 bg-neon text-primary text-[12px] tracking-[3px] font-semibold
                  hover:shadow-[0_0_28px_rgba(75,232,255,0.6)] transition-shadow"
              >
                <span className="text-[15px] leading-none">⬇</span> DOWNLOAD CV
              </a>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AboutDossier;
