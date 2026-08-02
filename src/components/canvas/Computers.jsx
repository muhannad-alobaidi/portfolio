/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import { Suspense, memo, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, AdaptiveDpr } from '@react-three/drei';
import Muha from '../Muha2';
import Desk from './Desk';
import CanvasLoader from '../Loader';
import { maxDpr } from '../../utils/device';
import { useWebGLRecovery } from '../../utils/useContextRecovery';

/*
  Compiles every material in the scene once, while the layer is still
  transparent, so the first frame the user actually sees isn't also the frame
  that compiles ~50 shader programs.

  Deliberately NOT drei's <Preload all/>: that also renders the scene through a
  CubeCamera (six passes) to force every material variant, and that burst is
  what used to lose this canvas's WebGL context — the reason the original code
  had a comment ruling Preload out. gl.compile() alone is the cheap 90%.
*/
const PrecompileShaders = () => {
  const gl = useThree(state => state.gl);
  const scene = useThree(state => state.scene);
  const camera = useThree(state => state.camera);
  useEffect(() => {
    gl.compile(scene, camera);
  }, [gl, scene, camera]);
  return null;
};

/*
  Holds r3f in its regressed (lower-resolution) state for as long as the page is
  mid-transition. `regress()` is a one-shot that decays after `debounce` ms, so
  it has to be re-asserted each frame while movement continues; AdaptiveDpr is
  what actually acts on it.
*/
const TransitionRegression = ({ moving }) => {
  const regress = useThree(state => state.performance.regress);
  useFrame(() => {
    if (moving) regress();
  });
  return null;
};

// OrbitControls sets touch-action:none on the canvas when it connects;
// restore vertical panning so the page can still be scrolled by touch
const TouchScrollFix = () => {
  const gl = useThree(state => state.gl);
  const controls = useThree(state => state.controls);
  useEffect(() => {
    gl.domElement.style.touchAction = 'pan-y';
  }, [gl, controls]);
  return null;
};

const ComputersCanvas = ({
  showUI,
  setShowUI,
  exit,
  setExit,
  setScreenRect,
  active = true,
  moving = false,
}) => {
  // recover from WebGL context loss (GPU memory pressure on this heavy scene)
  // by remounting the canvas instead of staying permanently white
  const { canvasKey, onCreated } = useWebGLRecovery();

  return (
    <Canvas
      key={canvasKey}
      onCreated={onCreated}
      className="m-auto"
      // no `shadows`: not one light in this scene casts any, so the shadow map
      // and the per-mesh castShadow/receiveShadow bookkeeping that came with it
      // were pure cost for zero pixels
      dpr={[1, maxDpr(2)]}
      // stop rendering the workstation (orbit + lights + model) when the
      // scene is scrolled off; resumes seamlessly on return
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [8, 5, 0], fov: 75 }}
      // r3f's regression system: while the page is mid-transition, drop
      // resolution to protect frame rate, then ramp back once settled. Nobody
      // can resolve detail on a scaling, half-faded layer.
      performance={{ min: 0.5, debounce: 200 }}
      // no preserveDrawingBuffer: nothing reads the pixels back, and keeping a
      // second full back-buffer alive added needless GPU memory pressure that
      // (with the HDR's PMREM cubemap) could lose this canvas's context
      gl={{ powerPreference: 'high-performance' }}
    >
      <TouchScrollFix />
      <ambientLight intensity={0.1} />
      <pointLight intensity={0.1} />
      <hemisphereLight intensity={0.15} groundColor="black" />
      <spotLight position={[-20, 50, 10]} angle={0.12} penumbra={1} />
      <TransitionRegression moving={moving} />
      {/* no `pixelated`: the browser's smooth upscale is what keeps the
          resolution drop invisible — nearest-neighbour would announce it */}
      <AdaptiveDpr />
      {/* Environment lives INSIDE this Suspense so the HDR's async load/PMREM
          pass suspends to the CanvasLoader here — not up to the page-level
          boundary, which would blank and remount the whole section. */}
      <Suspense fallback={<CanvasLoader />}>
        <Environment
          files="/images/blue_photo_studio_2k.hdr"
          blur={0.5}
          resolution={128}
        />
        <OrbitControls
          makeDefault
          // the point the camera orbits and keeps centered: raising Y aims
          // the camera higher, which pushes the model lower in the frame
          target={[0, 2, 0]}
          enableZoom={false}
          zoomSpeed={0.1}
          maxDistance={10}
          minDistance={7}
          minZoom={0.2}
          maxPolarAngle={Math.PI / 3}
          minPolarAngle={Math.PI / 3}
          autoRotate
          autoRotateSpeed={1}
          enablePan={false}
        />
        <Muha
          exit={exit}
          setExit={setExit}
          showUI={showUI}
          setShowUI={setShowUI}
          setScreenRect={setScreenRect}
        />
        <Desk />
        <PrecompileShaders />
      </Suspense>
    </Canvas>
  );
};

// memo: Hero re-renders on every screen-rect update while the overlay is
// open; the canvas props only change on open/close transitions
export default memo(ComputersCanvas);
