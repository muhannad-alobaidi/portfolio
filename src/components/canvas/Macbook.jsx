/* eslint-disable react/no-unknown-property */
/*
  Procedural MacBook-style laptop, modelled from primitives — aluminum
  unibody, keyboard well with individual keys, trackpad, and an open lid
  whose display glows with a tiny code editor (static canvas texture).
  Sits on the desk to the right of the monitor and picks up the studio
  HDR for its metal reflections.

  Placement knobs (world space): tweak these three if the desk spot
  needs a nudge.
*/
import { useMemo } from 'react';
import { RoundedBox, Instances, Instance } from '@react-three/drei';
import * as THREE from 'three';

const POSITION = [-2.8, 2.63, 2]; // x: depth, y: desk height, z: left/right
const ROTATION_Y = 2.6; // ~66°: open side toward the camera, angled inward
const SCALE = 0.4; // base is 3 units wide locally -> ~1.14 world (~31cm)

const LID_ANGLE = -1.95; // ~112° open

const ALU = '#9099a4';
const ALU_DARK = '#7c848f';
const KEY_COLOR = '#10141a';
const WELL_COLOR = '#0b0e13';

/* the laptop's wallpaper: a dark editor with colored "code" bars */
function makeScreenTexture() {
  const w = 512;
  const h = 320;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');

  g.fillStyle = '#0c1220';
  g.fillRect(0, 0, w, h);

  // menu bar
  g.fillStyle = '#070b14';
  g.fillRect(0, 0, w, 22);
  for (let i = 0; i < 3; i++) {
    g.beginPath();
    g.arc(16 + i * 16, 11, 4, 0, Math.PI * 2);
    g.fillStyle = ['#ff5f57', '#febc2e', '#28c840'][i];
    g.fill();
  }

  // sidebar
  g.fillStyle = '#0a0f1b';
  g.fillRect(0, 22, 92, h - 22);
  g.fillStyle = '#27405e';
  for (let i = 0; i < 9; i++) {
    g.fillRect(12, 40 + i * 24, 56 + (i % 3) * 8, 5);
  }

  // code lines
  const colors = ['#c792ea', '#7fb4ff', '#9ece8c', '#4be8ff', '#f2987b', '#6e7f9b'];
  let y = 44;
  let i = 0;
  while (y < h - 16) {
    const indent = [0, 16, 16, 32, 32, 16, 0][i % 7];
    const len = 60 + ((i * 53) % 200);
    g.fillStyle = colors[i % colors.length];
    g.globalAlpha = 0.75;
    g.fillRect(108 + indent, y, len, 6);
    g.globalAlpha = 1;
    y += 18;
    i++;
  }

  // cursor
  g.fillStyle = '#4be8ff';
  g.fillRect(108, y - 18, 6, 12);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export default function Macbook() {
  const screenTex = useMemo(() => makeScreenTexture(), []);

  // 5 rows × 13 keys; the bottom row (spacebar etc.) is separate
  const keys = useMemo(() => {
    const arr = [];
    for (let r = 0; r < 5; r++) {
      for (let col = 0; col < 13; col++) {
        arr.push([-1.17 + col * 0.195, 0.124, -0.74 + r * 0.18]);
      }
    }
    return arr;
  }, []);

  return (
    <group position={POSITION} rotation={[0, ROTATION_Y, 0]} scale={SCALE}>
      {/* ── base (unibody) ── */}
      <RoundedBox
        args={[3.0, 0.11, 2.1]}
        radius={0.045}
        smoothness={3}
        position={[0, 0.055, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={ALU} metalness={0.85} roughness={0.38} />
      </RoundedBox>

      {/* keyboard well */}
      <mesh position={[0, 0.112, -0.28]} receiveShadow>
        <boxGeometry args={[2.58, 0.012, 1.04]} />
        <meshStandardMaterial color={WELL_COLOR} metalness={0.3} roughness={0.7} />
      </mesh>

      {/* keys */}
      <Instances limit={keys.length} castShadow>
        <boxGeometry args={[0.165, 0.022, 0.15]} />
        <meshStandardMaterial color={KEY_COLOR} metalness={0.2} roughness={0.62} />
        {keys.map((p, idx) => (
          <Instance key={idx} position={p} />
        ))}
      </Instances>
      {/* bottom row: modifiers + spacebar + arrows */}
      <mesh position={[-0.975, 0.124, 0.16]} castShadow>
        <boxGeometry args={[0.55, 0.022, 0.15]} />
        <meshStandardMaterial color={KEY_COLOR} metalness={0.2} roughness={0.62} />
      </mesh>
      <mesh position={[0, 0.124, 0.16]} castShadow>
        <boxGeometry args={[1.16, 0.022, 0.15]} />
        <meshStandardMaterial color={KEY_COLOR} metalness={0.2} roughness={0.62} />
      </mesh>
      <mesh position={[0.975, 0.124, 0.16]} castShadow>
        <boxGeometry args={[0.55, 0.022, 0.15]} />
        <meshStandardMaterial color={KEY_COLOR} metalness={0.2} roughness={0.62} />
      </mesh>

      {/* trackpad (slightly recessed shade difference) */}
      <mesh position={[0, 0.112, 0.62]}>
        <boxGeometry args={[1.05, 0.012, 0.68]} />
        <meshStandardMaterial color={ALU_DARK} metalness={0.85} roughness={0.3} />
      </mesh>

      {/* hinge */}
      <mesh position={[0, 0.1, -1.02]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.055, 0.055, 2.72, 16]} />
        <meshStandardMaterial color="#23272e" metalness={0.7} roughness={0.45} />
      </mesh>

      {/* ── lid, hinged at the back edge ── */}
      <group position={[0, 0.1, -1.02]} rotation={[LID_ANGLE, 0, 0]}>
        <RoundedBox
          args={[3.0, 0.06, 2.0]}
          radius={0.03}
          smoothness={3}
          position={[0, 0, 1.0]}
          castShadow
        >
          <meshStandardMaterial color={ALU} metalness={0.85} roughness={0.38} />
        </RoundedBox>

        {/* inner bezel (faces the user when open) */}
        <mesh position={[0, -0.034, 1.0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.86, 1.86]} />
          <meshStandardMaterial color="#05070b" metalness={0.1} roughness={0.4} />
        </mesh>

        {/* glowing display */}
        <mesh position={[0, -0.04, 1.0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.66, 1.66]} />
          <meshBasicMaterial map={screenTex} toneMapped={false} />
        </mesh>

        {/* soft logo glow on the lid back */}
        <mesh position={[0, 0.034, 1.0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.17, 32]} />
          <meshStandardMaterial
            color="#eaf6fb"
            emissive="#bfeefb"
            emissiveIntensity={0.55}
            roughness={0.3}
          />
        </mesh>
      </group>
    </group>
  );
}
