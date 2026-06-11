import { useEffect, useRef, useState } from 'react';
import { createBrain } from './brainEngine';
import { BRAIN_GRAPH } from './brainData';

/*
  Full-screen interactive "neural index": the jarvis brain core with nodes
  for skills / experience / projects / education / contact. Click a node to
  dive into its sub-brain; hover a node for details; click the core (or
  BACK) to surface again.
*/
const BrainSection = () => {
  const canvasRef = useRef(null);
  const cardRef = useRef(null);
  const brainRef = useRef(null);
  const [hovered, setHovered] = useState(null);
  const [viewPath, setViewPath] = useState(['NEURAL INDEX']);

  useEffect(() => {
    const brain = createBrain(canvasRef.current, {
      onHover: (node, x, y, moveOnly) => {
        const card = cardRef.current;
        if (card && node) {
          // clamp so the 260px card never clips at the section edges
          const half = 134;
          const w = canvasRef.current
            ? canvasRef.current.clientWidth
            : window.innerWidth;
          card.style.left = `${Math.min(Math.max(x, half), w - half)}px`;
          // flip below the node near the top edge so the fixed navbar
          // doesn't cover the card
          if (y < 320) {
            card.style.top = `${y + 34}px`;
            card.style.transform = 'translateX(-50%)';
          } else {
            card.style.top = `${y - 30}px`;
            card.style.transform = 'translateX(-50%) translateY(-100%)';
          }
        }
        if (!moveOnly) setHovered(node);
      },
      onViewChange: labels => {
        setViewPath(labels);
        setHovered(null);
      },
      onActivate: node => {
        if (!node.href) return;
        if (/^https?:/i.test(node.href)) {
          window.open(node.href, '_blank', 'noopener');
        } else {
          // mailto:, tel: — hand off to the OS handler without a blank tab
          window.location.href = node.href;
        }
      },
    });
    brain.setGraph(BRAIN_GRAPH);
    brainRef.current = brain;
    return () => brain.dispose();
  }, []);

  const inSub = viewPath.length > 1;

  return (
    <section
      id="brain"
      className="relative w-full h-screen overflow-hidden select-none"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full touch-pan-y cursor-grab [&.dragging]:cursor-grabbing [&.hovering]:cursor-pointer"
      />

      {/* back control — only inside a sub-brain */}
      {inSub && (
        <div className="absolute top-24 max-lg:top-auto max-lg:bottom-10 left-6 flex items-center gap-3 font-mono text-[11px] tracking-[2px] text-neon/80 z-10">
          <button
            onClick={() => brainRef.current && brainRef.current.back()}
            className="px-3 py-1 border border-neon/40 text-neon hover:bg-neon/10 hover:shadow-[0_0_12px_rgba(75,232,255,0.4)] transition-all"
          >
            ◂ {viewPath[viewPath.length - 1]}
          </button>
        </div>
      )}

      {/* hover details card */}
      <div
        ref={cardRef}
        className={`absolute z-10 w-65 pointer-events-none border border-neon/40 bg-[#020e16]/95 shadow-[0_0_24px_rgba(75,232,255,0.18)] p-3 font-mono text-[11px] leading-relaxed transition-opacity duration-150 ${
          hovered ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ transform: 'translateX(-50%) translateY(-100%)' }}
      >
        {hovered && (
          <>
            <b className="block text-white tracking-[2px] mb-1">
              {hovered.label}
            </b>
            <span className="text-[#b4ebff]/85">{hovered.info}</span>
            {hovered.stat && (
              <span className="block text-[#ffc36b] mt-1.5">
                ▸ {hovered.stat}
              </span>
            )}
            {hovered.tags && (
              <span className="flex flex-wrap gap-1 mt-2">
                {hovered.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-1.5 py-0.5 border border-neon/25 text-neon/90 text-[9px] tracking-wide"
                  >
                    {tag}
                  </span>
                ))}
              </span>
            )}
            {hovered.children && hovered.children.length > 0 && (
              <span className="block text-neon/60 mt-2 text-[9px] tracking-[2px]">
                ⤵ CLICK TO DIVE · {hovered.children.length} NODE
                {hovered.children.length === 1 ? '' : 'S'}
              </span>
            )}
            {hovered.href && (
              <span className="block text-neon/60 mt-2 text-[9px] tracking-[2px]">
                ⤴ CLICK TO OPEN
              </span>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default BrainSection;
