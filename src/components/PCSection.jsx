import { motion, AnimatePresence } from 'framer-motion';
import { ComputersCanvas } from './canvas';
import MonitorUI from './monitor/MonitorUI';
import { useState, useEffect } from 'react';

/*
  Full-screen 3D workstation scene. Clicking the monitor flies the camera in
  and overlays the project UI exactly over the panel (screenRect).
*/
const PCSection = () => {
  const [showUi, setShowUi] = useState(false);
  const [exit, setExit] = useState(false);
  const [screenRect, setScreenRect] = useState(null);

  // hard scroll lock while zoomed in: freeze body AND the root scroller
  // (the actual snap container), keeping the scroll position pinned so
  // navigating inside the monitor can't snap the page to another section
  useEffect(() => {
    if (!showUi) return;
    const y = window.scrollY;
    document.body.classList.add('no-scroll');
    document.documentElement.classList.add('no-scroll');
    window.scrollTo(0, y); // guard against the root clamping while locked
    return () => {
      document.body.classList.remove('no-scroll');
      document.documentElement.classList.remove('no-scroll');
      window.scrollTo(0, y); // re-engage the snap exactly where we left
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
            className="z-60 rounded-[4px] bg-[#070b14] ring-1 ring-[#4be8ff]/20 shadow-[0_0_90px_rgba(75,232,255,0.14),0_25px_80px_rgba(0,0,0,0.6)]"
            style={{
              position: 'fixed',
              left: screenRect.left,
              top: screenRect.top,
              width: screenRect.width,
              height: screenRect.height,
            }}
          >
            <MonitorUI setShowUi={setShowUi} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PCSection;
