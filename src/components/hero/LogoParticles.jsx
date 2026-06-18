/* eslint-disable react/no-unknown-property */
/*
  Logo-sized sibling of the hero swarm for the PC/brain sections: ~4k GPU
  particles holding the <MA/> monogram in the top-left corner. Same
  ping-pong FBO sim as the hero, minus bloom, mouse and morphing — small
  enough to cost nothing, alive enough to read as the same organism.
  Remounts on each return past the hero, so it re-collapses from a shell
  into the monogram every time it appears.
*/
import { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
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
import { particleSize, maxDpr } from '../../utils/device';
import { useWebGLRecovery } from '../../utils/useContextRecovery';

const SIZE = particleSize(64, 48); // 64^2 = 4,096 particles (48^2 on mobile)
const COUNT = SIZE * SIZE;

function MiniField() {
  const { gl } = useThree();
  const dpr = maxDpr(2);
  const pointsMatRef = useRef();

  const sim = useMemo(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
    scene.add(quad);

    // one fixed shape: the monogram, no morph target needed (B = A)
    const monogram = dataTexture(textTargets(['<MA/>'], COUNT), SIZE);
    const velMat = new THREE.ShaderMaterial({
      vertexShader: SIM_VERT,
      fragmentShader: VEL_FRAG,
      uniforms: {
        uPos: { value: null },
        uVel: { value: null },
        uTargetA: { value: monogram },
        uTargetB: { value: monogram },
        uTime: { value: 0 },
        uMorph: { value: 0 },
        uDisperse: { value: 0 },
        uMouse: { value: new THREE.Vector3(99, 99, 0) },
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
      // assemble from a small shell on every appearance
      uniforms: { uSeed: { value: dataTexture(sphereSeed(COUNT, 2.0, 1.6), SIZE) } },
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

  useFrame(state => {
    const { scene, camera, quad, velMat, posMat, copyMat } = sim;

    if (!sim.booted) {
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

    velMat.uniforms.uTime.value = state.clock.elapsedTime;

    quad.material = velMat;
    velMat.uniforms.uPos.value = sim.posA.texture;
    velMat.uniforms.uVel.value = sim.velA.texture;
    gl.setRenderTarget(sim.velB);
    gl.render(scene, camera);

    quad.material = posMat;
    posMat.uniforms.uPos.value = sim.posA.texture;
    posMat.uniforms.uVel.value = sim.velB.texture;
    gl.setRenderTarget(sim.posB);
    gl.render(scene, camera);

    gl.setRenderTarget(null);

    let t = sim.posA;
    sim.posA = sim.posB;
    sim.posB = t;
    t = sim.velA;
    sim.velA = sim.velB;
    sim.velB = t;

    if (pointsMatRef.current) {
      pointsMatRef.current.uniforms.uPos.value = sim.posA.texture;
      pointsMatRef.current.uniforms.uVel.value = sim.velA.texture;
    }
  });

  return (
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
          uSizeK: { value: 3.2 },
          uOpacity: { value: 1.4 }, // no bloom here — push alpha instead
        }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

const LogoParticles = () => {
  const { canvasKey, onCreated } = useWebGLRecovery();
  return (
    <Canvas
      key={canvasKey}
      onCreated={onCreated}
      flat
      camera={{ position: [0, 0, 2.7], fov: 50 }}
      gl={{ antialias: false, alpha: true }}
      dpr={[1, maxDpr(2)]}
    >
      <MiniField />
    </Canvas>
  );
};

export default LogoParticles;
