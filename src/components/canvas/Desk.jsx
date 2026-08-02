/* eslint-disable react/no-unknown-property */
/*
  The desk, replacing the slab that ships inside muha.glb (that mesh,
  `Cube_Material_0`, is hidden at runtime in Muha2.jsx). The monitor,
  keyboard and mouse still come from muha.glb and do NOT move — this model
  has to come to them.

  ── Tuning ─────────────────────────────────────────────────────────────
  Only touch the four knobs below. Y is derived, not typed: the model's
  origin sits at the desk's base, so scaling it would drag the work surface
  up or down with it. Solving for Y keeps the surface pinned to SURFACE_Y
  no matter what you do to SCALE, which means you can never knock the
  monitor and keyboard off the desk by adjusting size.

  World-space reference for what you're aiming at:
    keyboard        x -0.63 .. 1.15    z 1.53 .. 2.05
    mousepad        x -2.01 .. -0.66   z 1.38 .. 2.46
    monitor (all)   x -2.01 .. 1.23    z 1.38 .. 3.60
    chair front     x -1.38 .. 1.60    z -1.62 .. 1.40
    old desk was    x -4.00 .. 2.37    z 1.09 .. 4.46

  +Z is away from the character, -Z is toward the chair. At the values
  below the desk covers x -4.76..3.11, z 1.08..6.51.
*/
import { useGLTF } from '@react-three/drei';

const MODEL = '/muha/desk.glb';

/* height of this model's own desk mesh, office_manager_desk.003 */
const DESK_TOP_LOCAL = 0.752;
/* where the monitor, keyboard and mouse rest — don't change this */
const SURFACE_Y = 2.61;

const X = -0.5; // along the desk's width
const Z = 1.5; // 3.8 puts the near edge on the old desk's, at z 1.08
const ROTATION_Y = 0; // radians
const SCALE = 3.391; // 3.391 == real-world size for this scene's units

/* derived: keeps the work surface on SURFACE_Y at any SCALE */
const Y = SURFACE_Y - DESK_TOP_LOCAL * SCALE;

export default function Desk() {
  const { scene } = useGLTF(MODEL);
  return (
    <primitive
      object={scene}
      position={[X, Y, Z]}
      rotation={[0, ROTATION_Y, 0]}
      scale={SCALE}
    />
  );
}

useGLTF.preload(MODEL);
