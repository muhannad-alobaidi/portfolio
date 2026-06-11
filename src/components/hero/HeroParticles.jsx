/* eslint-disable react/no-unknown-property */
/* eslint-disable react/prop-types */
/*
  Igloo-style GPU particle field for the hero.

  ~65k particles simulated on the GPU (ping-pong position/velocity FBOs):
  spring toward a target shape, curl-noise turbulence, cursor repulsion,
  color by speed, additive soft points. The swarm morphs between the "MA"
  monogram and a neural sphere, and `disperse` (scroll progress) blows the
  whole field apart as you leave the hero.
*/
import { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

const SIZE = 256; // 256^2 = 65,536 particles
const COUNT = SIZE * SIZE;

// ---------- GLSL: simplex + curl noise (Ashima / standard) ----------
const NOISE_GLSL = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
vec3 curlNoise(vec3 p){
  const float e=0.1;
  float n1=snoise(vec3(p.x,p.y+e,p.z));
  float n2=snoise(vec3(p.x,p.y-e,p.z));
  float n3=snoise(vec3(p.x,p.y,p.z+e));
  float n4=snoise(vec3(p.x,p.y,p.z-e));
  float n5=snoise(vec3(p.x+e,p.y,p.z));
  float n6=snoise(vec3(p.x-e,p.y,p.z));
  float x=(n1-n2)-(n3-n4);
  float y=(n3-n4)-(n5-n6);
  float z=(n5-n6)-(n1-n2);
  return normalize(vec3(x,y,z)/(2.0*e));
}
`;

const VEL_FRAG = /* glsl */ `
uniform sampler2D uPos;
uniform sampler2D uVel;
uniform sampler2D uTargetA;
uniform sampler2D uTargetB;
uniform float uTime;
uniform float uMorph;
uniform float uDisperse;
uniform vec3 uMouse;
uniform float uMouseOn;
varying vec2 vUv;
${NOISE_GLSL}
void main(){
  vec3 pos = texture2D(uPos, vUv).xyz;
  vec3 vel = texture2D(uVel, vUv).xyz;
  vec4 ta = texture2D(uTargetA, vUv);
  vec4 tb = texture2D(uTargetB, vUv);
  // staggered morph: each particle departs on its own beat
  float k = smoothstep(0.0, 1.0, clamp(uMorph * 1.5 - ta.w * 0.5, 0.0, 1.0));
  vec3 target = mix(ta.xyz, tb.xyz, k);

  // spring must beat the turbulence at rest, or the glyphs smear into fog:
  // equilibrium fuzz ~= curl/spring (here ~0.2 world units)
  vec3 spring = (target - pos) * 0.026;
  vec3 curl = curlNoise(pos * 0.5 + uTime * 0.10) * (0.0018 + uDisperse * 0.12);
  // cursor brush: a soft gradient push — strong only at the very center,
  // fading quadratically to the rim so it stirs the swarm without ever
  // clearing a hole
  vec3 mouseF = vec3(0.0);
  float md = distance(pos.xy, uMouse.xy);
  if (uMouseOn > 0.5 && md < 0.9) {
    vec2 dir = normalize(pos.xy - uMouse.xy + 0.0001);
    float t = 1.0 - md / 0.9;
    mouseF = vec3(dir, (ta.w - 0.5) * 0.6) * (t * t) * 0.08;
  }
  // scroll: everything streams outward
  vec3 disperse = normalize(pos + vec3(0.0001)) * uDisperse * 0.10;

  vel = vel * 0.86 + spring + curl + mouseF + disperse;
  gl_FragColor = vec4(vel, 1.0);
}
`;

const POS_FRAG = /* glsl */ `
uniform sampler2D uPos;
uniform sampler2D uVel;
varying vec2 vUv;
void main(){
  vec3 pos = texture2D(uPos, vUv).xyz;
  vec3 vel = texture2D(uVel, vUv).xyz;
  gl_FragColor = vec4(pos + vel, 1.0);
}
`;

const COPY_FRAG = /* glsl */ `
uniform sampler2D uSeed;
varying vec2 vUv;
void main(){ gl_FragColor = texture2D(uSeed, vUv); }
`;

const SIM_VERT = /* glsl */ `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const POINTS_VERT = /* glsl */ `
uniform sampler2D uPos;
uniform sampler2D uVel;
uniform float uDpr;
attribute vec2 aRef;
varying float vSpeed;
varying float vSeed;
void main(){
  vec3 pos = texture2D(uPos, aRef).xyz;
  vSpeed = length(texture2D(uVel, aRef).xyz);
  vSeed = aRef.x * 17.0 + aRef.y * 31.0;
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = (1.1 + min(vSpeed * 26.0, 2.2)) * uDpr * (5.2 / -mv.z);
}
`;

const POINTS_FRAG = /* glsl */ `
uniform float uOpacity;
varying float vSpeed;
varying float vSeed;
void main(){
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.06, d);
  // calm particles are deep cyan; fast ones flash white-hot (igloo style)
  vec3 cyan = vec3(0.29, 0.91, 1.0);
  vec3 deep = vec3(0.07, 0.35, 0.48);
  vec3 col = mix(deep, cyan, clamp(vSpeed * 14.0, 0.0, 1.0));
  col = mix(col, vec3(1.0), clamp(vSpeed * 9.0 - 0.55, 0.0, 1.0));
  gl_FragColor = vec4(col, a * uOpacity * (0.5 + 0.5 * fract(vSeed)));
}
`;

// ---------- target shape generators ----------
function textTargets(lines) {
  const w = 760;
  const h = 380;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  g.fillStyle = '#000';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#fff';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  // largest weight-900 size where every line still fits
  let size = 170;
  const fits = s => {
    g.font = `900 ${s}px Poppins, Arial, sans-serif`;
    return lines.every(ln => g.measureText(ln).width < w * 0.94);
  };
  while (size > 40 && !fits(size)) size -= 4;
  for (let i = 0; i < lines.length; i++) {
    g.fillText(lines[i], w / 2, (h * (i + 1)) / (lines.length + 1));
  }
  const img = g.getImageData(0, 0, w, h).data;
  const pts = [];
  for (let y = 0; y < h; y += 2) {
    for (let x = 0; x < w; x += 2) {
      if (img[(y * w + x) * 4] > 128) {
        pts.push([
          ((x / w) - 0.5) * 8.2,
          (0.5 - y / h) * 4.1,
          (Math.random() - 0.5) * 0.4,
        ]);
      }
    }
  }
  const data = new Float32Array(COUNT * 4);
  for (let i = 0; i < COUNT; i++) {
    const p = pts[(Math.random() * pts.length) | 0] || [0, 0, 0];
    data[i * 4] = p[0] + (Math.random() - 0.5) * 0.03;
    data[i * 4 + 1] = p[1] + (Math.random() - 0.5) * 0.03;
    data[i * 4 + 2] = p[2];
    data[i * 4 + 3] = Math.random(); // per-particle morph stagger
  }
  return data;
}

function dataTexture(data) {
  const t = new THREE.DataTexture(data, SIZE, SIZE, THREE.RGBAFormat, THREE.FloatType);
  t.needsUpdate = true;
  return t;
}

function makeTarget() {
  return new THREE.WebGLRenderTarget(SIZE, SIZE, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    type: THREE.HalfFloatType,
    depthBuffer: false,
    stencilBuffer: false,
  });
}

function ParticleField({ progress }) {
  const { gl } = useThree();
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const pointsMatRef = useRef();
  const mouse = useRef(new THREE.Vector3(0, 0, 0));
  const mouseOn = useRef(0);
  // value 0 = the name, 1 = the <MA/> code tag; boot holds the name first
  const morphState = useRef({ value: 0, dir: 1, hold: 8, frames: 0 });

  const sim = useMemo(() => {
    // seed: a loose shell the swarm collapses inward from on boot
    const seed = new Float32Array(COUNT * 4);
    for (let i = 0; i < COUNT; i++) {
      const a = Math.random() * Math.PI * 2;
      const b = Math.acos(Math.random() * 2 - 1);
      const r = 3.2 + Math.random() * 2.5;
      seed[i * 4] = Math.sin(b) * Math.cos(a) * r;
      seed[i * 4 + 1] = Math.cos(b) * r;
      seed[i * 4 + 2] = Math.sin(b) * Math.sin(a) * r;
      seed[i * 4 + 3] = 1;
    }

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
        uTargetA: { value: dataTexture(textTargets(['MUHANNAD', 'ALOBAIDI'])) },
        // the second form: initials as a self-closing component tag
        uTargetB: { value: dataTexture(textTargets(['<MA/>'])) },
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
      uniforms: { uSeed: { value: dataTexture(seed) } },
    });

    return {
      scene,
      camera,
      quad,
      velMat,
      posMat,
      copyMat,
      posA: makeTarget(),
      posB: makeTarget(),
      velA: makeTarget(),
      velB: makeTarget(),
      booted: false,
    };
  }, []);

  const pointsGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const refs = new Float32Array(COUNT * 2);
    const dummy = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      refs[i * 2] = (i % SIZE) / SIZE + 0.5 / SIZE;
      refs[i * 2 + 1] = Math.floor(i / SIZE) / SIZE + 0.5 / SIZE;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(dummy, 3));
    geo.setAttribute('aRef', new THREE.BufferAttribute(refs, 2));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 12);
    return geo;
  }, []);

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
