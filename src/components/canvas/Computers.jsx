/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unknown-property */
import { Suspense, memo, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Preload, Environment } from '@react-three/drei';
import Muha from '../Muha2';
import { useState } from 'react';
import CanvasLoader from '../Loader';

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

const ComputersCanvas = ({ showUI, setShowUI, exit, setExit, setScreenRect }) => {
  const [zoom, setzoom] = useState(true);

  return (
    <Canvas
      className="m-auto"
      shadows
      camera={{ position: [8, 5, 0], fov: 75 }}
      gl={{ preserveDrawingBuffer: true }}
    >
      <TouchScrollFix />
      <Environment files="/images/blue_photo_studio_2k.hdr" blur={0.5} />
      <ambientLight intensity={0.1} />
      <pointLight intensity={0.1} />
      <hemisphereLight intensity={0.15} groundColor="black" />
      <spotLight position={[-20, 50, 10]} angle={0.12} penumbra={1} />
      <Suspense fallback={<CanvasLoader />}>
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
      </Suspense>
      <Preload all />
    </Canvas>
  );
};

// memo: Hero re-renders on every screen-rect update while the overlay is
// open; the canvas props only change on open/close transitions
export default memo(ComputersCanvas);
