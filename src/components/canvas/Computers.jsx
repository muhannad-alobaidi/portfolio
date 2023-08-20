/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unknown-property */
import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Preload, Environment } from '@react-three/drei';
import Muha from '../Muha2';
import { useState } from 'react';
import CanvasLoader from '../Loader';

const ComputersCanvas = ({ showUI, setShowUI, exit, setExit }) => {
  const [zoom, setzoom] = useState(true);

  return (
    <Canvas
      className=" m-auto top-40"
      frameloop="demand"
      shadows
      camera={{ position: [10, 4, 0], fov: 75 }}
      gl={{ preserveDrawingBuffer: true }}
    >
      <Environment files="/images/blue_photo_studio_2k.hdr" blur={0.5} />
      <ambientLight intensity={0.1} />
      <pointLight intensity={0.1} />
      <hemisphereLight intensity={0.15} groundColor="black" />
      <spotLight position={[-20, 50, 10]} angle={0.12} penumbra={1} />
      <Suspense fallback={<CanvasLoader />}>
        <OrbitControls
          enableZoom={zoom}
          zoomSpeed={0.1}
          maxDistance={15}
          minDistance={10}
          minZoom={0.2}
          maxPolarAngle={Math.PI / 3}
          minPolarAngle={Math.PI / 3}
          autoRotate
          autoRotateSpeed={1}
        />
        <Muha
          exit={exit}
          setExit={setExit}
          showUI={showUI}
          setShowUI={setShowUI}
        />
      </Suspense>
      <Preload all />
    </Canvas>
  );
};

export default ComputersCanvas;
