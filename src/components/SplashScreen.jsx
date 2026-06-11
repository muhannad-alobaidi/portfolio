import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProgress } from '@react-three/drei';

/*
  Boot splash: a small rotating wireframe core with a neon progress ring,
  HUD boot log, and real asset progress (three's DefaultLoadingManager via
  drei useProgress — covers the gltf model + HDR environment). Dissolves
  with a flash once everything is loaded.
*/

const BOOT_LINES = [
  [0, 'INITIALIZING NEURAL LINK'],
  [22, 'LOADING CORTEX GEOMETRY'],
  [52, 'CHARGING PARTICLE FIELD'],
  [78, 'SYNAPSES ONLINE'],
  [100, 'LINK ESTABLISHED'],
];

const PHI = (1 + Math.sqrt(5)) / 2;
function icosa() {
  const v = [];
  for (const a of [-1, 1])
    for (const b of [-1, 1]) v.push([0, a, b * PHI], [a, b * PHI, 0], [a * PHI, 0, b]);
  return v.map(p => {
    const l = Math.hypot(...p);
    return p.map(c => c / l);
  });
}
const VERTS = icosa();
const EDGES = (() => {
  let min = Infinity;
  const d = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  for (let i = 0; i < VERTS.length; i++)
    for (let j = i + 1; j < VERTS.length; j++) min = Math.min(min, d(VERTS[i], VERTS[j]));
  const e = [];
  for (let i = 0; i < VERTS.length; i++)
    for (let j = i + 1; j < VERTS.length; j++)
      if (d(VERTS[i], VERTS[j]) < min * 1.05) e.push([i, j]);
  return e;
})();

function rot3(p, ax, ay) {
  let [x, y, z] = p;
  let c = Math.cos(ax),
    s = Math.sin(ax),
    t;
  t = y * c - z * s;
  z = y * s + z * c;
  y = t;
  c = Math.cos(ay);
  s = Math.sin(ay);
  t = x * c + z * s;
  z = -x * s + z * c;
  x = t;
  return [x, y, z];
}

const SplashScreen = () => {
  const { progress } = useProgress();
  const [gone, setGone] = useState(false);
  const [shown, setShown] = useState(0); // monotonic displayed progress
  const canvasRef = useRef(null);
  const shownRef = useRef(0);
  const bootAt = useRef(performance.now());

  // displayed progress never regresses (the manager restarts as new items queue)
  useEffect(() => {
    setShown(s => {
      const v = Math.max(s, Math.round(progress));
      shownRef.current = v;
      return v;
    });
  }, [progress]);

  // dismiss once fully loaded (with a minimum dwell), or after a safety cap
  useEffect(() => {
    const tick = setInterval(() => {
      const elapsed = performance.now() - bootAt.current;
      if ((shownRef.current >= 100 && elapsed > 1900) || elapsed > 15000) {
        setGone(true);
        clearInterval(tick);
      }
    }, 150);
    return () => clearInterval(tick);
  }, []);

  // the spinning core + progress ring
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const S = 260;
    cv.width = S * dpr;
    cv.height = S * dpr;
    const g = cv.getContext('2d');
    let raf;
    const draw = t => {
      raf = requestAnimationFrame(draw);
      g.clearRect(0, 0, S * dpr, S * dpr);
      const c = (S / 2) * dpr;
      const p = shownRef.current / 100;

      // ticks
      for (let i = 0; i < 36; i++) {
        const a = (i / 36) * Math.PI * 2 - Math.PI / 2;
        const on = i / 36 <= p;
        g.strokeStyle = on ? 'rgba(75,232,255,0.85)' : 'rgba(75,232,255,0.14)';
        g.lineWidth = 1.4 * dpr;
        g.beginPath();
        g.moveTo(c + Math.cos(a) * 104 * dpr, c + Math.sin(a) * 104 * dpr);
        g.lineTo(c + Math.cos(a) * (on ? 112 : 109) * dpr, c + Math.sin(a) * (on ? 112 : 109) * dpr);
        g.stroke();
      }
      // progress arc
      g.strokeStyle = 'rgba(75,232,255,0.9)';
      g.lineWidth = 2 * dpr;
      g.shadowColor = 'rgba(75,232,255,0.9)';
      g.shadowBlur = 10 * dpr;
      g.beginPath();
      g.arc(c, c, 96 * dpr, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2);
      g.stroke();
      g.shadowBlur = 0;

      // wireframe core
      const rx = t * 0.00035,
        ry = t * 0.0005;
      const pts = VERTS.map(v => {
        const q = rot3(v, rx, ry);
        const persp = 3 / (3 - q[2]);
        return [c + q[0] * 58 * dpr * persp, c + q[1] * 58 * dpr * persp, q[2]];
      });
      for (const [i, j] of EDGES) {
        const depth = ((pts[i][2] + pts[j][2]) / 2 + 1) / 2;
        g.strokeStyle = `rgba(75,232,255,${0.18 + 0.55 * depth})`;
        g.lineWidth = (0.6 + 0.9 * depth) * dpr;
        g.beginPath();
        g.moveTo(pts[i][0], pts[i][1]);
        g.lineTo(pts[j][0], pts[j][1]);
        g.stroke();
      }
      // singularity
      const flick = 0.7 + 0.3 * Math.sin(t / 90);
      g.fillStyle = `rgba(255,255,255,${flick})`;
      g.shadowColor = 'rgb(75,232,255)';
      g.shadowBlur = 22 * dpr;
      g.beginPath();
      g.arc(c, c, 3.4 * dpr, 0, 7);
      g.fill();
      g.shadowBlur = 0;
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  const line = BOOT_LINES.filter(([at]) => shown >= at).pop()[1];

  return (
    <AnimatePresence>
      {!gone && (
        <motion.div
          exit={{ opacity: 0, scale: 1.07 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
          className="fixed inset-0 z-100 bg-[#02070d] flex flex-col items-center justify-center select-none"
        >
          {/* exit flash */}
          <motion.div
            initial={{ opacity: 0 }}
            exit={{ opacity: [0, 0.55, 0] }}
            transition={{ duration: 0.55 }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at center, rgba(75,232,255,0.85), rgba(75,232,255,0.15) 45%, transparent 70%)',
            }}
          />
          {/* scanlines */}
          <div
            className="absolute inset-0 pointer-events-none opacity-60"
            style={{
              background:
                'repeating-linear-gradient(0deg, rgba(0,0,0,0.25) 0 1px, transparent 1px 3px)',
            }}
          />

          <div className="relative">
            <canvas ref={canvasRef} style={{ width: 260, height: 260 }} />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="font-mono text-white text-[22px] tracking-[2px] [text-shadow:0_0_14px_rgba(75,232,255,0.8)] mt-44">
                {shown}
                <span className="text-neon text-[13px]">%</span>
              </span>
            </div>
          </div>

          <div className="mt-6 h-5 font-mono text-[11px] tracking-[4px] text-neon/85">
            ▸ {line}
            <span className="animate-pulse">▏</span>
          </div>

          <div className="absolute bottom-8 font-mono text-[9px] tracking-[5px] text-neon/40">
            MUHANNAD ALOBAIDI · NEURAL PORTFOLIO
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
