/* eslint-disable react/prop-types */
/*
  Progressive reveal for the workstation: the model doesn't pop in, it builds.

  Three beats, driven by one world-space height (`uFront`) that sweeps from the
  floor to the top of the scene:

    1. blueprint   — every surface renders as a neon lattice: world-space grid
                     lines, a fresnel rim, a drifting scanline, and vertices
                     scattered outward so the shape reads as an unsettled cloud
    2. the front   — a bright feathered band travels upward; below it the real
                     PBR material takes over, above it the blueprint remains
    3. settled     — the band cools off and the effect switches itself off

  ── Why it's a material patch and not a second pass ─────────────────────────
  The obvious way to get a wireframe stage is a twin mesh per node with
  `material.wireframe = true`. This scene has ~600 meshes, so that's ~600 extra
  draw calls plus a wireframe index buffer per geometry — and those buffers are
  only released when the geometry is disposed, which never happens here because
  the scene stays resident across scroll. On a scene that already documents
  WebGL context losses from GPU memory pressure (see Computers.jsx), paying
  several MB of VRAM permanently for a three-second effect is a bad trade.

  Patching the existing materials via onBeforeCompile costs zero extra draw
  calls and zero extra buffers: the lattice is drawn by the fragment shader, and
  transparency is done with a dithered discard rather than real alpha blending,
  so there's nothing to depth-sort either. The grain that dither produces is
  also what gives the front its feathered, crumbling edge.

  The effect is a no-op once `uActive` flips to 0 — the patched program is kept
  rather than reverted, because un-patching means recompiling ~50 shaders in the
  middle of a live scene.
*/
import { useLayoutEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* ── timeline, seconds ──────────────────────────────────────────────────── */
const FADE_IN = 0.35; // blueprint fades up out of black
const HOLD = 0.2; // ...and holds, so it's legible before anything solidifies
const SWEEP = 1.7; // front travels floor -> ceiling
const SETTLE = 0.3; // band cools, blueprint remnants burn off
const TOTAL = FADE_IN + HOLD + SWEEP + SETTLE;

/* ── look ───────────────────────────────────────────────────────────────── */
const EDGE = '#4be8ff';
const FEATHER = 0.85; // world units the solid/blueprint transition spans
const BAND = 0.32; // world units of glow either side of the front
const GRID = 5.0; // lattice cells per world unit (~20cm cells)
const GRAIN = 34.0; // dissolve speckle cells per world unit
const SCATTER = 0.07; // world units vertices drift before they settle

const easeInOut = x =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

/*
  Module-level, not per-mount: drei caches the loaded glTF, so the same material
  instances come back on a remount already carrying the patched program. Sharing
  one uniform block means a remount rebinds nothing and recompiles nothing — it
  just rewinds the values.
*/
const UNIFORMS = {
  uActive: { value: 1 },
  uFront: { value: -1e3 },
  uHolo: { value: 0 },
  uTime: { value: 0 },
  uEdge: { value: new THREE.Color(EDGE) },
};

/*
  Shared GLSL. `revealHash3` is stable in world space so the dissolve speckle
  sticks to the surface as the camera orbits; `revealHash2` is screen-space and
  reseeded every frame, which is what makes the blueprint flicker like a
  projection instead of looking like a static stipple pattern.
*/
const REVEAL_PARS = /* glsl */ `
uniform float uActive;
uniform float uFront;
uniform float uHolo;
uniform float uTime;
uniform vec3  uEdge;
varying vec3  vRevealWorld;

float revealHash3(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.yzx + 33.33);
  return fract((p.x + p.y) * p.z);
}
float revealHash2(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}
`;

/*
  Vertex: publish the *undisplaced* world position (all the reveal maths keys
  off it, so it has to be stable), then re-project with a scatter offset that
  decays to nothing at the front. Overriding gl_Position after <project_vertex>
  rather than editing `transformed` before it keeps vViewPosition — and so the
  lighting below the front — reading the model's true surface.
*/
const REVEAL_VERTEX = /* glsl */ `
#include <project_vertex>
{
  vec3 wp = (modelMatrix * vec4(transformed, 1.0)).xyz;
  vRevealWorld = wp;
  if (uActive > 0.5) {
    float d = max(wp.y - uFront, 0.0);
    float k = smoothstep(0.0, 1.4, d) * uHolo;
    vec3 cell = floor(wp * 6.0);
    vec3 dir = normalize(vec3(
      revealHash3(cell),
      revealHash3(cell + 13.7),
      revealHash3(cell + 91.3)
    ) - 0.5);
    gl_Position = projectionMatrix * viewMatrix *
      vec4(wp + dir * (${SCATTER.toFixed(2)} * k), 1.0);
  }
}
`;

/*
  Fragment: one branch per fragment. Below the front (dissolve grain permitting)
  the material renders exactly as authored, plus the glow band; above it, the
  blueprint.

  ── Why the blueprint is a dark shell and not a see-through hologram ────────
  The first version discarded everything the lattice didn't claim, so the model
  rendered x-ray: with ~600 nested meshes you saw every interior surface at
  once, and the overlapping lattices averaged out into glowing static. The fix
  is for the blueprint to stay opaque and keep writing depth — near-black body,
  bright lines — so only the surfaces actually facing the camera draw. Almost
  all of the brightness now has to be earned by a lattice line or a silhouette
  rim, which is what makes the structure legible.

  The dither is still here, but only as a light grain (and as the fade-in/out
  mechanism), not as the transparency model.
*/
const revealFragment = fresnel => /* glsl */ `
if (uActive > 0.5) {
  float d = vRevealWorld.y - uFront;
  float solid = 1.0 - smoothstep(0.0, ${FEATHER.toFixed(2)}, d);
  float grain = revealHash3(floor(vRevealWorld * ${GRAIN.toFixed(1)}));

  if (grain > solid) {
    // --- not solid yet: draw the blueprint -------------------------------
    // world-space lattice, kept one pixel wide at any distance by fwidth
    vec3 gp = vRevealWorld * ${GRID.toFixed(1)};
    vec3 gd = abs(fract(gp - 0.5) - 0.5);
    vec3 gw = fwidth(gp) * 1.2;
    vec3 gl3 = 1.0 - smoothstep(vec3(0.0), gw, gd);
    float grid = max(max(gl3.x, gl3.y), gl3.z);

    // steep power: the rim should trace the silhouette, not wash the surface
    float fres = pow(clamp(${fresnel}, 0.0, 1.0), 3.0);

    float scan = 0.5 + 0.5 * sin((vRevealWorld.y - uTime * 1.4) * 18.0);
    float near = exp(-max(d, 0.0) * 2.0); // hot just above the front

    float lines = grid * (0.55 + 0.45 * scan) + fres * 0.7;
    gl_FragColor = vec4(uEdge * (0.035 + lines * 1.5 + near * 0.8), 1.0);

    // grain, and the fade the timeline drives the blueprint in and out with
    float keep = uHolo * (0.87 + 0.13 * lines);
    if (revealHash2(gl_FragCoord.xy + fract(uTime) * 137.0) > keep) discard;
  } else {
    // --- solid: the real material, with the front's glow riding over it ---
    float band = smoothstep(${BAND.toFixed(2)}, 0.0, abs(d));
    gl_FragColor.rgb += uEdge * band * 1.5;
  }
}
`;

/*
  Injects the reveal into a material's compiled program. Materials without a
  normal (the video screen's basic material, for one) get a flat fresnel
  constant rather than a shader that fails to compile.
*/
function patch(material) {
  if (material.userData.__reveal) return; // already carries the patched program
  material.userData.__reveal = true;

  material.onBeforeCompile = shader => {
    Object.assign(shader.uniforms, UNIFORMS);

    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${REVEAL_PARS}`)
      .replace('#include <project_vertex>', REVEAL_VERTEX);

    const hasNormal = shader.fragmentShader.includes('normal_fragment_begin');
    const fresnel = hasNormal
      ? '1.0 - abs(dot(normalize(normal), normalize(vViewPosition)))'
      : '0.45';

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      `#include <common>\n${REVEAL_PARS}`
    );

    const body = revealFragment(fresnel);
    if (shader.fragmentShader.includes('#include <dithering_fragment>')) {
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <dithering_fragment>',
        `#include <dithering_fragment>\n${body}`
      );
    } else {
      // last resort: append to main()
      const i = shader.fragmentShader.lastIndexOf('}');
      shader.fragmentShader =
        shader.fragmentShader.slice(0, i) +
        body +
        shader.fragmentShader.slice(i);
    }
  };
  material.needsUpdate = true;
}

/*
  Wraps the loaded models. Everything below it is patched on commit — in a
  layout effect, so no frame ever renders the un-patched (fully solid) model,
  and before <PrecompileShaders/>'s passive effect, so gl.compile() warms the
  patched programs rather than programs we're about to invalidate.
*/
const Materialize = ({ children, onDone }) => {
  const group = useRef();
  const done = useRef(false);
  const elapsed = useRef(0);
  const range = useRef({ min: 0, max: 6 });
  // dropping resolution for the duration is free here — a dissolving, glowing
  // model is the last thing anyone can resolve detail on. Same lever the scroll
  // transitions pull (see TransitionRegression in Computers.jsx).
  const regress = useThree(state => state.performance.regress);

  useLayoutEffect(() => {
    const root = group.current;
    if (!root) return;

    root.traverse(o => {
      if (!o.isMesh && !o.isSkinnedMesh) return;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      for (const m of mats) if (m) patch(m);
    });

    // the sweep's travel: the scene's own vertical extent, padded by the
    // feather so the first and last surfaces get a full transition too
    const box = new THREE.Box3().setFromObject(root);
    if (isFinite(box.min.y) && box.max.y > box.min.y) {
      range.current = { min: box.min.y - FEATHER, max: box.max.y + FEATHER };
    }

    // rewind: on a remount (the canvas is rebuilt on WebGL context loss) the
    // materials are still patched, so replaying is just a uniform reset
    done.current = false;
    elapsed.current = 0;
    UNIFORMS.uActive.value = 1;
    UNIFORMS.uHolo.value = 0;
    UNIFORMS.uFront.value = range.current.min;
  }, []);

  useFrame((_, dt) => {
    if (done.current) return;
    regress();

    // clamp: a tab that was backgrounded mid-reveal shouldn't skip the whole
    // animation on its first frame back
    elapsed.current += Math.min(dt, 1 / 20);
    const t = elapsed.current;
    UNIFORMS.uTime.value = t;

    const { min, max } = range.current;

    if (t < FADE_IN) {
      UNIFORMS.uHolo.value = t / FADE_IN;
      UNIFORMS.uFront.value = min;
    } else if (t < FADE_IN + HOLD) {
      UNIFORMS.uHolo.value = 1;
      UNIFORMS.uFront.value = min;
    } else if (t < FADE_IN + HOLD + SWEEP) {
      const p = easeInOut((t - FADE_IN - HOLD) / SWEEP);
      UNIFORMS.uHolo.value = 1;
      UNIFORMS.uFront.value = min + (max - min) * p;
    } else {
      // past the top: fade the last blueprint speckle out, then switch off
      const p = Math.min(1, (t - FADE_IN - HOLD - SWEEP) / SETTLE);
      UNIFORMS.uHolo.value = 1 - p;
      UNIFORMS.uFront.value = max;
    }

    if (t >= TOTAL) {
      done.current = true;
      UNIFORMS.uActive.value = 0;
      onDone?.();
    }
  });

  return <group ref={group}>{children}</group>;
};

export default Materialize;
