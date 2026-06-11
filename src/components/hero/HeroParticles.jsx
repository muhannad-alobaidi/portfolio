/* eslint-disable react/no-unknown-property */
/* eslint-disable react/prop-types */
/*
  Igloo-style GPU particle field for the hero.

  ~65k particles simulated on the GPU (ping-pong position/velocity FBOs):
  spring toward a target shape, curl-noise turbulence, cursor repulsion,
  color by speed, additive soft points. The swarm morphs between the "MA"
  monogram and a neural sphere, and `disperse` (scroll progress) blows the
  whole field apart as you leave the hero.

  The GLSL and target generators live in particleLib.js, shared with the
  logo-sized corner swarm (LogoParticles).
*/
import { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import {
  VEL_FRAG,
  POS_FRAG,
  COPY_FRAG,
  SIM_VERT,
  POINTS_VERT,
  POINTS_FRAG,
  textTargets,
  dataTexture,
  makeTarget,
  sphereSeed,
  refsGeometry,
} from './particleLib';

const SIZE = 256; // 256^2 = 65,536 particles
const COUNT = SIZE * SIZE;

function ParticleField({ progress }) {
  const { gl } = useThree();
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const pointsMatRef = useRef();
  const mouse = useRef(new THREE.Vector3(0, 0, 0));
  const mouseOn = useRef(0);
  // value 0 = the name, 1 = the <MA/> code tag; boot holds the name first
  const morphState = useRef({ value: 0, dir: 1, hold: 8, frames: 0 });

  const sim = useMemo(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const quadGeo = new THREE.PlaneGeometry(2, 2);
    const quad = new THREE.Mesh(quadGeo);
    scene.add(quad);

    const velMat = new THREE.ShaderMaterial({
      vertexShader: SIM_VERT,
      fragmentShader: VEL_FRAG,
      uniforms: {
        uPos: { value: null },
        uVel: { value: null },
        uTargetA: {
          value: dataTexture(textTargets(['MUHANNAD', 'ALOBAIDI'], COUNT), SIZE),
        },
        // the second form: initials as a self-closing component tag
        uTargetB: { value: dataTexture(textTargets(['<MA/>'], COUNT), SIZE) },
        uTime: { value: 0 },
        uMorph: { value: 0 },
        uDisperse: { value: 0 },
        uMouse: { value: new THREE.Vector3() },
        uMouseOn: { value: 0 },
      },
    });
    const posMat = new THREE.ShaderMaterial({
      vertexShader: SIM_VERT,
      fragmentShader: POS_FRAG,
      uniforms: { uPos: { value: null }, uVel: { value: null } },
    });
    const copyMat = new THREE.ShaderMaterial({
      vertexShader: SIM_VERT,
      fragmentShader: COPY_FRAG,
      // seed: a loose shell the swarm collapses inward from on boot
      uniforms: { uSeed: { value: dataTexture(sphereSeed(COUNT, 3.2, 2.5), SIZE) } },
    });

    return {
      scene,
      camera,
      quad,
      velMat,
      posMat,
      copyMat,
      posA: makeTarget(SIZE),
      posB: makeTarget(SIZE),
      velA: makeTarget(SIZE),
      velB: makeTarget(SIZE),
      booted: false,
    };
  }, []);

  const pointsGeo = useMemo(() => refsGeometry(SIZE), []);

  useFrame((state, delta) => {
    const { scene, camera, quad, velMat, posMat, copyMat } = sim;

    if (!sim.booted) {
      // write the seed into both position buffers; velocities start at zero
      quad.material = copyMat;
      gl.setRenderTarget(sim.posA);
      gl.render(scene, camera);
      gl.setRenderTarget(sim.posB);
      gl.render(scene, camera);
      gl.setClearColor(0x000000, 0);
      gl.setRenderTarget(sim.velA);
      gl.clear();
      gl.setRenderTarget(sim.velB);
      gl.clear();
      gl.setRenderTarget(null);
      sim.booted = true;
    }

    // shape cycle: hold each form, then morph (pauses while dispersed);
    // the name is home base and holds longest. The frame gate keeps slow
    // devices from morphing before the swarm has actually settled.
    const m = morphState.current;
    m.frames++;
    if (progress.current < 0.2) {
      if (m.hold > 0) m.hold -= delta;
      else if (m.frames > 240) {
        m.value += m.dir * delta * 0.5;
        if (m.value >= 1 || m.value <= 0) {
          m.value = Math.round(m.value);
          m.dir *= -1;
          m.hold = m.value === 0 ? 7 : 3;
          m.frames = 0;
        }
      }
    }

    velMat.uniforms.uTime.value = state.clock.elapsedTime;
    velMat.uniforms.uMorph.value = m.value;
    velMat.uniforms.uDisperse.value = Math.min(1, progress.current);
    velMat.uniforms.uMouse.value.copy(mouse.current);
    velMat.uniforms.uMouseOn.value = mouseOn.current;

    // velocity pass
    quad.material = velMat;
    velMat.uniforms.uPos.value = sim.posA.texture;
    velMat.uniforms.uVel.value = sim.velA.texture;
    gl.setRenderTarget(sim.velB);
    gl.render(scene, camera);

    // position pass
    quad.material = posMat;
    posMat.uniforms.uPos.value = sim.posA.texture;
    posMat.uniforms.uVel.value = sim.velB.texture;
    gl.setRenderTarget(sim.posB);
    gl.render(scene, camera);

    gl.setRenderTarget(null);

    // swap
    let t = sim.posA;
    sim.posA = sim.posB;
    sim.posB = t;
    t = sim.velA;
    sim.velA = sim.velB;
    sim.velB = t;

    if (pointsMatRef.current) {
      pointsMatRef.current.uniforms.uPos.value = sim.posA.texture;
      pointsMatRef.current.uniforms.uVel.value = sim.velA.texture;
      pointsMatRef.current.uniforms.uOpacity.value = Math.max(
        0,
        1 - progress.current * 1.15
      );
    }
  });

  // cursor -> world position on the z=0 plane
  const onPointerMove = e => {
    const ndc = e.pointer; // r3f normalized device coords
    const cam = e.camera;
    const fovScale = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * cam.position.z;
    mouse.current.set(ndc.x * fovScale * cam.aspect, ndc.y * fovScale, 0);
    mouseOn.current = 1;
  };

  return (
    <group>
      {/* transparent full-view plane catches the cursor for the repulsion */}
      <mesh onPointerMove={onPointerMove} onPointerLeave={() => (mouseOn.current = 0)}>
        <planeGeometry args={[40, 20]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <points frustumCulled={false}>
        <primitive object={pointsGeo} attach="geometry" />
        <shaderMaterial
          ref={pointsMatRef}
          vertexShader={POINTS_VERT}
          fragmentShader={POINTS_FRAG}
          uniforms={{
            uPos: { value: null },
            uVel: { value: null },
            uDpr: { value: dpr },
            uSizeK: { value: 5.2 },
            uOpacity: { value: 1 },
          }}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

const HeroParticles = ({ progress }) => {
  return (
    <Canvas
      flat
      camera={{ position: [0, 0, 7.5], fov: 50 }}
      gl={{ antialias: false, alpha: true }}
      dpr={[1, 2]}
      className="touch-pan-y"
    >
      <ParticleField progress={progress} />
      <EffectComposer>
        <Bloom
          intensity={1.15}
          luminanceThreshold={0.12}
          luminanceSmoothing={0.3}
          mipmapBlur
          radius={0.75}
        />
      </EffectComposer>
    </Canvas>
  );
};

export default HeroParticles;
