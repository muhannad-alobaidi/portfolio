/* eslint-disable react/no-unknown-property */
/* eslint-disable react/prop-types */
/*
  GPU particle glyphs for the brain's contact nodes — same GPGPU recipe as
  the hero (ping-pong position/velocity FBOs, curl noise, cursor repulsion,
  color by speed) but simulated in screen-pixel space and anchored to the
  brain engine's node positions, streamed in via a shared tracker ref:
    { active, alpha, scale, anchors: [[x,y]...], hot, kick }
  The overlay canvas is pointer-events-none; the brain canvas handles input.
*/
import { useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { particleSize, maxDpr } from '../../utils/device';
import { useWebGLRecovery } from '../../utils/useContextRecovery';

// 192^2 = 36,864 particles across the glyphs; 128^2 = 16,384 on mobile
const SIZE = particleSize(192, 128);
const COUNT = SIZE * SIZE;
const GLYPHS = 3;
const GLYPH_PX = 130; // glyph size at focus scale 1

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
uniform sampler2D uTarget; // xy = glyph-local offset (px), z = rand, w = glyph idx
uniform vec2 uAnchors[${GLYPHS}];
uniform float uScale;
uniform float uTime;
uniform float uKick;
uniform vec2 uMouse;
varying vec2 vUv;
${NOISE_GLSL}
void main(){
  vec2 pos = texture2D(uPos, vUv).xy;
  vec2 vel = texture2D(uVel, vUv).xy;
  vec4 ta = texture2D(uTarget, vUv);
  int g = int(ta.w + 0.5);
  vec2 anchor = uAnchors[0];
  if (g == 1) anchor = uAnchors[1];
  if (g == 2) anchor = uAnchors[2];
  vec2 target = anchor + ta.xy * uScale;

  vec2 spring = (target - pos) * 0.05;
  vec3 c = curlNoise(vec3(pos * 0.012, ta.z * 9.0) + uTime * 0.12);
  vec2 curl = c.xy * (0.35 + uKick * 26.0);
  // soft gradient cursor brush (never evacuates the glyph)
  vec2 mouseF = vec2(0.0);
  float md = distance(pos, uMouse);
  if (md < 70.0) {
    float t = 1.0 - md / 70.0;
    mouseF = normalize(pos - uMouse + 0.001) * t * t * 2.6;
  }
  vel = vel * 0.84 + spring + curl + mouseF;
  gl_FragColor = vec4(vel, 0.0, 1.0);
}
`;

const POS_FRAG = /* glsl */ `
uniform sampler2D uPos;
uniform sampler2D uVel;
varying vec2 vUv;
void main(){
  vec2 pos = texture2D(uPos, vUv).xy;
  vec2 vel = texture2D(uVel, vUv).xy;
  gl_FragColor = vec4(pos + vel, 0.0, 1.0);
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
uniform sampler2D uTarget;
uniform vec2 uRes;
uniform float uDpr;
uniform float uScale;
attribute vec2 aRef;
varying float vSpeed;
varying float vGlyph;
varying float vSeed;
void main(){
  vec2 pos = texture2D(uPos, aRef).xy;
  vSpeed = length(texture2D(uVel, aRef).xy);
  vec4 ta = texture2D(uTarget, aRef);
  vGlyph = ta.w;
  vSeed = ta.z;
  // pixel space -> NDC (y down in screen space)
  vec2 ndc = (pos / uRes) * 2.0 - 1.0;
  gl_Position = vec4(ndc.x, -ndc.y, 0.0, 1.0);
  gl_PointSize = (1.5 + min(vSpeed * 0.35, 2.0)) * uDpr * clamp(uScale, 0.25, 1.3);
}
`;

const POINTS_FRAG = /* glsl */ `
uniform float uAlpha;
uniform float uHot;
varying float vSpeed;
varying float vGlyph;
varying float vSeed;
void main(){
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.08, d);
  vec3 deep = vec3(0.07, 0.35, 0.48);
  vec3 cyan = vec3(0.29, 0.91, 1.0);
  vec3 amber = vec3(1.0, 0.76, 0.42);
  vec3 col = mix(deep, cyan, clamp(vSpeed * 0.5, 0.0, 1.0));
  col = mix(col, vec3(1.0), clamp(vSpeed * 0.25 - 0.5, 0.0, 1.0));
  // hovered glyph heats up amber
  if (abs(vGlyph - uHot) < 0.5) col = mix(col, amber, 0.75);
  gl_FragColor = vec4(col, a * uAlpha * (0.55 + 0.45 * fract(vSeed * 7.0)));
}
`;

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
function dataTexture(data) {
  const t = new THREE.DataTexture(data, SIZE, SIZE, THREE.RGBAFormat, THREE.FloatType);
  t.needsUpdate = true;
  return t;
}

// sample an icon image into glyph-local pixel offsets (reuses the same
// alpha-or-darkness rule as the engine's 2D sampler)
function sampleIcon(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const s = 64;
      const c = document.createElement('canvas');
      c.width = c.height = s;
      const g = c.getContext('2d');
      const r = Math.min(s / img.width, s / img.height);
      g.drawImage(
        img,
        (s - img.width * r) / 2,
        (s - img.height * r) / 2,
        img.width * r,
        img.height * r
      );
      const data = g.getImageData(0, 0, s, s).data;
      let hasAlpha = false;
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] < 250) {
          hasAlpha = true;
          break;
        }
      }
      const pts = [];
      for (let y = 0; y < s; y++) {
        for (let x = 0; x < s; x++) {
          const i4 = (y * s + x) * 4;
          const lum = (data[i4] + data[i4 + 1] + data[i4 + 2]) / 3;
          const solid = hasAlpha ? data[i4 + 3] > 140 : lum < 150;
          if (solid) pts.push([(x / s - 0.5) * GLYPH_PX, (y / s - 0.5) * GLYPH_PX]);
        }
      }
      resolve(pts);
    };
    img.onerror = () => resolve([]);
    img.src = src;
  });
}

function GlyphField({ tracker, icons }) {
  const { gl, size } = useThree();
  const dpr = maxDpr(2);
  const pointsMatRef = useRef();
  const mouse = useRef([1e6, 1e6]);

  useEffect(() => {
    const onMove = e => {
      mouse.current = [e.clientX, e.clientY];
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  const sim = useMemo(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
    scene.add(quad);

    const seed = new Float32Array(COUNT * 4);
    for (let i = 0; i < COUNT; i++) {
      seed[i * 4] = Math.random() * 1600;
      seed[i * 4 + 1] = Math.random() * 1000;
    }

    const velMat = new THREE.ShaderMaterial({
      vertexShader: SIM_VERT,
      fragmentShader: VEL_FRAG,
      uniforms: {
        uPos: { value: null },
        uVel: { value: null },
        uTarget: { value: null },
        uAnchors: { value: [new THREE.Vector2(), new THREE.Vector2(), new THREE.Vector2()] },
        uScale: { value: 1 },
        uTime: { value: 0 },
        uKick: { value: 0 },
        uMouse: { value: new THREE.Vector2(1e6, 1e6) },
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
      scene, camera, quad, velMat, posMat, copyMat,
      posA: makeTarget(), posB: makeTarget(),
      velA: makeTarget(), velB: makeTarget(),
      booted: false,
      targetsReady: false,
    };
  }, []);

  // build per-particle glyph targets once the three icons are sampled
  useEffect(() => {
    let dead = false;
    Promise.all(icons.map(sampleIcon)).then(sets => {
      if (dead) return;
      const data = new Float32Array(COUNT * 4);
      for (let i = 0; i < COUNT; i++) {
        const g = i % GLYPHS;
        const pts = sets[g];
        const p = pts.length ? pts[(Math.random() * pts.length) | 0] : [0, 0];
        data[i * 4] = p[0] + (Math.random() - 0.5) * 1.5;
        data[i * 4 + 1] = p[1] + (Math.random() - 0.5) * 1.5;
        data[i * 4 + 2] = Math.random();
        data[i * 4 + 3] = g;
      }
      const tex = dataTexture(data);
      sim.velMat.uniforms.uTarget.value = tex;
      if (pointsMatRef.current) pointsMatRef.current.uniforms.uTarget.value = tex;
      sim.targetsReady = true;
    });
    return () => {
      dead = true;
    };
  }, [icons, sim]);

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
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e6);
    return geo;
  }, []);

  useFrame(state => {
    const tr = tracker.current;
    const mat = pointsMatRef.current;
    if (!mat) return;
    const visible = tr.active && tr.alpha > 0.02 && sim.targetsReady;
    mat.uniforms.uAlpha.value = visible ? tr.alpha : 0;
    if (!visible) return; // freeze the sim while hidden

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

    tr.kick = Math.max(0, (tr.kick || 0) * 0.86 - 0.005);
    const u = velMat.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    u.uScale.value = tr.scale;
    u.uKick.value = tr.kick;
    u.uMouse.value.set(mouse.current[0], mouse.current[1]);
    for (let i = 0; i < GLYPHS; i++) {
      const a = tr.anchors[i] || tr.anchors[tr.anchors.length - 1] || [1e6, 1e6];
      u.uAnchors.value[i].set(a[0], a[1]);
    }

    quad.material = velMat;
    u.uPos.value = sim.posA.texture;
    u.uVel.value = sim.velA.texture;
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

    mat.uniforms.uPos.value = sim.posA.texture;
    mat.uniforms.uVel.value = sim.velA.texture;
    mat.uniforms.uRes.value.set(size.width, size.height);
    mat.uniforms.uHot.value = tr.hot;
    mat.uniforms.uScale.value = tr.scale;
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
          uTarget: { value: null },
          uRes: { value: new THREE.Vector2(1, 1) },
          uDpr: { value: dpr },
          uScale: { value: 1 },
          uAlpha: { value: 0 },
          uHot: { value: -1 },
        }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

const ContactParticles = ({ tracker, icons, active = true }) => {
  const { canvasKey, onCreated } = useWebGLRecovery();
  return (
    <Canvas
      key={canvasKey}
      onCreated={onCreated}
      flat
      gl={{ antialias: false, alpha: true }}
      dpr={[1, maxDpr(2)]}
      // glyph swarm only animates while the brain scene is on screen
      frameloop={active ? 'always' : 'never'}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      <GlyphField tracker={tracker} icons={icons} />
    </Canvas>
  );
};

export default ContactParticles;
