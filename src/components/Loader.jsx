/*
  In-canvas loading state for the workstation scene.

  This used to be a bare `<Html>` with a white bar. drei anchors `<Html>` at the
  scene origin, and the origin here is under the desk and off to one side, so
  the bar sat wherever the camera happened to put it. Now it's `center`ed on the
  camera's orbit target, which is what the frame is actually built around.

  It deliberately does NOT read useProgress: subscribing would re-render this
  component on every loaded chunk, and the whole point is to cost nothing while
  the GPU is busy transcoding KTX2 and building the HDR's PMREM cubemap. Two
  counter-rotating arcs and a pulsing core, animated entirely by the compositor.

  Scoped keyframes rather than Tailwind's `animate-spin`: one of the arcs runs
  backwards on its own timing, and both need a transform-origin SVG shapes don't
  get by default.
*/
import { Html } from '@react-three/drei';

const NEON = '#4be8ff';

const CSS = `
@keyframes rvSpin { to { transform: rotate(360deg) } }
@keyframes rvSpinBack { to { transform: rotate(-360deg) } }
@keyframes rvPulse {
  0%, 100% { opacity: .35; transform: scale(.7) }
  50%      { opacity: 1;   transform: scale(1.15) }
}
.rv-arc, .rv-core { transform-origin: center; transform-box: fill-box }
.rv-outer { animation: rvSpin 1.15s cubic-bezier(.6,.1,.4,.9) infinite }
.rv-inner { animation: rvSpinBack 1.7s linear infinite }
.rv-core  { animation: rvPulse 1.15s ease-in-out infinite }
@media (prefers-reduced-motion: reduce) {
  .rv-outer, .rv-inner, .rv-core { animation-duration: 3s }
}
`;

const Loader = () => (
  <Html center position={[0, 2, 0]} style={{ pointerEvents: 'none' }}>
    <div className="select-none flex flex-col items-center font-mono">
      <style>{CSS}</style>

      <svg width="62" height="62" viewBox="0 0 62 62" fill="none">
        {/* track */}
        <circle
          cx="31"
          cy="31"
          r="25"
          stroke={NEON}
          strokeOpacity="0.13"
          strokeWidth="1.5"
        />
        {/* outer arc — circumference 157, so 44 draws just over a quarter */}
        <circle
          className="rv-arc rv-outer"
          cx="31"
          cy="31"
          r="25"
          stroke={NEON}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeDasharray="44 113"
          style={{ filter: `drop-shadow(0 0 5px ${NEON})` }}
        />
        {/* inner arc, counter-rotating and dimmer */}
        <circle
          className="rv-arc rv-inner"
          cx="31"
          cy="31"
          r="16"
          stroke={NEON}
          strokeOpacity="0.55"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeDasharray="20 80"
        />
        {/* core */}
        <circle
          className="rv-core"
          cx="31"
          cy="31"
          r="2.6"
          fill="#ffffff"
          style={{ filter: `drop-shadow(0 0 7px ${NEON})` }}
        />
      </svg>

      <span className="mt-4 text-[9px] tracking-[6px] text-neon/45">
        MATERIALIZING
      </span>
    </div>
  </Html>
);

export default Loader;
