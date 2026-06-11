import { motion, AnimatePresence } from 'framer-motion';
import { ComputersCanvas } from './canvas';
import ScreenElements from './modules/ScreenElements';
import { useState, useEffect } from 'react';

/*
  Full-screen 3D workstation scene. Clicking the monitor flies the camera in
  and overlays the project UI exactly over the panel (screenRect).
*/
const PCSection = () => {
  const [showUi, setShowUi] = useState(false);
  const [exit, setExit] = useState(false);
  const [screenRect, setScreenRect] = useState(null);

  useEffect(() => {
    if (showUi) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [showUi]);

  // Escape closes the screen UI as a fallback for the small X button
  useEffect(() => {
    if (!showUi) return;
    const onKey = e => {
      if (e.key === 'Escape') setShowUi(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showUi]);

  return (
    <div className="relative w-full h-full">
      <ComputersCanvas
        exit={exit}
        setExit={setExit}
        showUI={showUi}
        setShowUI={setShowUi}
        setScreenRect={setScreenRect}
      />
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[3px] text-neon/50 pointer-events-none">
        CLICK THE SCREEN
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
    </div>
  );
};

export default PCSection;
