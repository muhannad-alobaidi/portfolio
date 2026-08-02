/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unknown-property */
import { Suspense, memo, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import Muha from '../Muha2';
import Desk from './Desk';
import { useState } from 'react';
import CanvasLoader from '../Loader';
import { maxDpr } from '../../utils/device';
import { useWebGLRecovery } from '../../utils/useContextRecovery';

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
}) => {
  const [zoom, setzoom] = useState(true);
  // recover from WebGL context loss (GPU memory pressure on this heavy scene)
  // by remounting the canvas instead of staying permanently white
  const { canvasKey, onCreated } = useWebGLRecovery();

  return (
    <Canvas
      key={canvasKey}
      onCreated={onCreated}
      className="m-auto"
      shadows
      dpr={[1, maxDpr(2)]}
      // stop rendering the workstation (orbit + lights + model) when the
      // scene is scrolled off; resumes seamlessly on return
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [8, 5, 0], fov: 75 }}
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
      {/* Environment lives INSIDE this Suspense so the HDR's async load/PMREM
          pass suspends to the CanvasLoader here — not up to the page-level
          boundary, which would blank and remount the whole section.
          No <Preload all/>: let the 28MB model + HDR upload to the GPU lazily
          per-frame instead of one synchronous burst that can lose the context */}
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
      </Suspense>
    </Canvas>
  );
};

// memo: Hero re-renders on every screen-rect update while the overlay is
// open; the canvas props only change on open/close transitions
export default memo(ComputersCanvas);
