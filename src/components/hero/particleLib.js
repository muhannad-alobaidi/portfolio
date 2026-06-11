/*
  Shared GPU-particle plumbing for the hero swarm and its logo-sized
  sibling: GLSL for the ping-pong position/velocity sim and the point
  sprites, plus text-to-target-texture generation. Both fields differ
  only in particle count, camera and uniform values.
*/
import * as THREE from 'three';

// ---------- GLSL: simplex + curl noise (Ashima / standard) ----------
export const NOISE_GLSL = /* glsl */ `
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

export const VEL_FRAG = /* glsl */ `
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

export const POS_FRAG = /* glsl */ `
uniform sampler2D uPos;
uniform sampler2D uVel;
varying vec2 vUv;
void main(){
  vec3 pos = texture2D(uPos, vUv).xyz;
  vec3 vel = texture2D(uVel, vUv).xyz;
  gl_FragColor = vec4(pos + vel, 1.0);
}
`;

export const COPY_FRAG = /* glsl */ `
uniform sampler2D uSeed;
varying vec2 vUv;
void main(){ gl_FragColor = texture2D(uSeed, vUv); }
`;

export const SIM_VERT = /* glsl */ `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

export const POINTS_VERT = /* glsl */ `
uniform sampler2D uPos;
uniform sampler2D uVel;
uniform float uDpr;
uniform float uSizeK;
attribute vec2 aRef;
varying float vSpeed;
varying float vSeed;
void main(){
  vec3 pos = texture2D(uPos, aRef).xyz;
  vSpeed = length(texture2D(uVel, aRef).xyz);
  vSeed = aRef.x * 17.0 + aRef.y * 31.0;
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = (1.1 + min(vSpeed * 26.0, 2.2)) * uDpr * (uSizeK / -mv.z);
}
`;

export const POINTS_FRAG = /* glsl */ `
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
export function textTargets(lines, count) {
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
  const data = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    const p = pts[(Math.random() * pts.length) | 0] || [0, 0, 0];
    data[i * 4] = p[0] + (Math.random() - 0.5) * 0.03;
    data[i * 4 + 1] = p[1] + (Math.random() - 0.5) * 0.03;
    data[i * 4 + 2] = p[2];
    data[i * 4 + 3] = Math.random(); // per-particle morph stagger
  }
  return data;
}

export function dataTexture(data, size) {
  const t = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.FloatType);
  t.needsUpdate = true;
  return t;
}

export function makeTarget(size) {
  return new THREE.WebGLRenderTarget(size, size, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    type: THREE.HalfFloatType,
    depthBuffer: false,
    stencilBuffer: false,
  });
}

export function sphereSeed(count, baseRadius, spread) {
  const seed = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const b = Math.acos(Math.random() * 2 - 1);
    const r = baseRadius + Math.random() * spread;
    seed[i * 4] = Math.sin(b) * Math.cos(a) * r;
    seed[i * 4 + 1] = Math.cos(b) * r;
    seed[i * 4 + 2] = Math.sin(b) * Math.sin(a) * r;
    seed[i * 4 + 3] = 1;
  }
  return seed;
}

export function refsGeometry(size) {
  const count = size * size;
  const geo = new THREE.BufferGeometry();
  const refs = new Float32Array(count * 2);
  const dummy = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    refs[i * 2] = (i % size) / size + 0.5 / size;
    refs[i * 2 + 1] = Math.floor(i / size) / size + 0.5 / size;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(dummy, 3));
  geo.setAttribute('aRef', new THREE.BufferAttribute(refs, 2));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 12);
  return geo;
}
