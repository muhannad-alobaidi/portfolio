/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
/* eslint-disable no-unused-vars */
/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.1.4 muha2.glb
*/

import React, { useRef, useState, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Box3, Quaternion } from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import * as THREE from 'three';

export default function Screen(props) {
  const { nodes, materials } = useGLTF('/muha2.glb');

  const { showUI, setShowUI } = props;
  const [hover, setHover] = useState(false);

  const [clicked, setClicked] = useState(false);
  const screenRef = useRef();
  const { camera, scene } = useThree();
  const [material, setMaterial] = useState(materials['Material.074_30']);

  const handleClick = () => {
    setClicked(true);
  };

  useEffect(() => {
    document.body.style.cursor = hover ? 'pointer' : 'auto';
  }, [hover]);

  useFrame(() => {
    TWEEN.update(); // update the TWEEN animation on every frame

    if (clicked) {
      const screenPosition = new Vector3();
      const screenQuaternion = new Quaternion();
      screenRef.current.getWorldPosition(screenPosition);
      screenRef.current.getWorldQuaternion(screenQuaternion);

      const cameraTargetPosition = new Vector3(
        screenPosition.x,
        screenPosition.y,
        screenPosition.z - 2
      );

      const cameraPosition = new Vector3(
        cameraTargetPosition.x,
        cameraTargetPosition.y,
        -cameraTargetPosition.z + 2
      );

      const tween = new TWEEN.Tween(camera.position)
        .to(cameraPosition, 1400) // duration of the tween animation in milliseconds
        .easing(TWEEN.Easing.Quadratic.Out) // easing function to use
        .start();

      // update the camera lookAt target as well
      tween.onUpdate(() => {
        camera.lookAt(cameraTargetPosition);
      });

      // re-render the component on every frame until the animation completes
    }
  });

  useEffect(() => {
    if (clicked) {
      console.log(showUI);
      setTimeout(() => {
        setMaterial('');
        setShowUI(true);
      }, 8000);
    }
  }, [clicked]);

  useEffect(() => {
    if (!showUI) {
      setMaterial(materials['Material.074_30']);

      setShowUI(false);
      setClicked(false);
    }
  }, [showUI]);

  return (
    <group
      name="MY_SCREEN"
      position={[-136.18, 300.41, -300.13]}
      rotation={[0, 0.07, -Math.PI / 2]}
      scale={[331.62, 331.62, 348.07]}
    >
      <mesh
        onClick={handleClick}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        ref={screenRef}
        name="MY_SCREEN_MY_SCREEN_0"
        geometry={nodes.MY_SCREEN_MY_SCREEN_0.geometry}
        material={material}
      />
    </group>
  );
}
