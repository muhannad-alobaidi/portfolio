import { motion, AnimatePresence } from 'framer-motion';
import { styles } from '../styles';
import { ComputersCanvas } from './canvas';
import ScreenElements from './modules/ScreenElements';
import { useState, useEffect } from 'react';

const Hero = () => {
  const [showUi, setShowUi] = useState(false);
  const [exit, setExit] = useState(false);
  // viewport rect of the 3D monitor, reported by the Screen component once
  // the camera flight arrives; the project UI is rendered as a DOM overlay
  // exactly over it
  const [screenRect, setScreenRect] = useState(null);

  useEffect(() => {
    if (showUi) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }

    // Cleanup when component is unmounted
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [showUi]);

  // Escape closes the screen UI as a fallback for the small X button
  useEffect(() => {
    if (!showUi) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setShowUi(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showUi]);

  return (
    <section className="relative flex flex-col mb-32 min-h-screen mx-auto">
      <div
        className={` ${styles.paddingX}
        z-10 max-w-360 mx-auto w-full pt-32.5`}
      >
        <div className="max-w-[640px]">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="font-mono text-neon text-[11px] sm:text-[13px] tracking-[5px] mb-4"
          >
            ▸ FULL-STACK · MOBILE DEVELOPER
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.9 }}
            className="font-black text-white leading-none text-[44px] xs:text-[54px] sm:text-[68px] lg:text-[84px]"
          >
            Muhannad
            <br />
            <span className="text-transparent [-webkit-text-stroke:.5px_#4be8ff] filter-[drop-shadow(0_0_12px_rgba(75,232,255,0.2))_drop-shadow(0_0_30px_rgba(75,232,255,0.1))]">
              Alobaidi
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.4 }}
            className="text-secondary mt-6 text-[15px] sm:text-[18px] leading-relaxed max-w-[520px]"
          >
            I build complete products end to end — web platforms, native mobile
            apps, and the cloud and AI behind them.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.9 }}
            className="flex flex-wrap gap-2 mt-6 font-mono text-[10px] sm:text-[11px] tracking-[2px]"
          >
            {['WEB', 'MOBILE', 'CLOUD', 'AI'].map(tag => (
              <span
                key={tag}
                className="px-3 py-1.5 border border-neon/25 text-neon/90"
              >
                {tag}
              </span>
            ))}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 2.4 }}
            className="flex flex-wrap gap-4 mt-10"
          >
            <a
              href="#brain"
              className="px-6 py-3 font-mono text-[12px] tracking-[3px] text-primary bg-neon hover:shadow-[0_0_28px_rgba(75,232,255,0.55)] transition-shadow"
            >
              EXPLORE THE BRAIN ▾
            </a>
            <a
              href="mailto:muhannad.alobaidi@yahoo.com"
              className="px-6 py-3 font-mono text-[12px] tracking-[3px] text-neon border border-neon/40 hover:bg-neon/10 transition-colors"
            >
              OPEN A CHANNEL
            </a>
          </motion.div>
        </div>
      </div>
      <div className="relative w-full h-[52vh] sm:h-[65vh] min-h-105">
        <ComputersCanvas
          exit={exit}
          setExit={setExit}
          showUI={showUi}
          setShowUI={setShowUi}
          setScreenRect={setScreenRect}
        />
      </div>
      <AnimatePresence>
        {showUi && screenRect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="z-60 bg-white/95 rounded-sm shadow-2xl"
            style={{
              position: 'fixed',
              left: screenRect.left,
              top: screenRect.top,
              width: screenRect.width,
              height: screenRect.height,
            }}
          >
            <ScreenElements setShowUi={setShowUi} />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Hero;
