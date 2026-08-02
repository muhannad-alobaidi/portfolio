import { maxDpr } from '../../utils/device';

/*
  Neural-core renderer, ported from the Jarvis HUD and stripped of the live
  Claude/VS Code bridge. Pure canvas-2D: polyhedra shells + gyro rings +
  singularity, firing synapses, orbiting labeled nodes with travelling
  pulses, drag-to-rotate.

  Navigation is ONE continuous camera over a single constellation: every
  category node anchors its own tiny sub-brain (scale SUB_SCALE) at its
  position in the main graph. Clicking a node flies the camera into it —
  the sub-brain simply scales up under the zoom, and the edge back to the
  main core stays visible. Sibling flights arc the camera from node to
  node, dipping out far enough to glimpse the constellation in between.
*/

const PHI = (1 + Math.sqrt(5)) / 2;

function normalize(verts) {
  return verts.map(v => {
    const l = Math.hypot(v[0], v[1], v[2]);
    return [v[0] / l, v[1] / l, v[2] / l];
  });
}
function edgesFor(verts, tol = 1.05) {
  let min = Infinity;
  const d = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  for (let i = 0; i < verts.length; i++)
    for (let j = i + 1; j < verts.length; j++)
      min = Math.min(min, d(verts[i], verts[j]));
  const edges = [];
  for (let i = 0; i < verts.length; i++)
    for (let j = i + 1; j < verts.length; j++)
      if (d(verts[i], verts[j]) < min * tol) edges.push([i, j]);
  return edges;
}
function icosahedron() {
  const v = [];
  for (const a of [-1, 1])
    for (const b of [-1, 1])
      v.push([0, a, b * PHI], [a, b * PHI, 0], [a * PHI, 0, b]);
  return normalize(v);
}
function dodecahedron() {
  const v = [];
  for (const a of [-1, 1])
    for (const b of [-1, 1]) {
      for (const c of [-1, 1]) v.push([a, b, c]);
      v.push([0, a / PHI, b * PHI], [a / PHI, b * PHI, 0], [a * PHI, 0, b / PHI]);
    }
  return normalize(v);
}
function octahedron() {
  return [
    [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1],
  ];
}
// frequency-2 geodesic sphere: icosahedron vertices + normalized edge
// midpoints — a fine 42-vertex / 120-edge web for the root core
function geodesic() {
  const base = icosahedron();
  const verts = base.slice();
  for (const [i, j] of edgesFor(base)) {
    verts.push([
      (base[i][0] + base[j][0]) / 2,
      (base[i][1] + base[j][1]) / 2,
      (base[i][2] + base[j][2]) / 2,
    ]);
  }
  return normalize(verts);
}

function rot3(p, ax, ay, az) {
  let [x, y, z] = p;
  let c = Math.cos(ax),
    s = Math.sin(ax),
    t1;
  t1 = y * c - z * s; z = y * s + z * c; y = t1;
  c = Math.cos(ay); s = Math.sin(ay);
  t1 = x * c + z * s; z = -x * s + z * c; x = t1;
  c = Math.cos(az); s = Math.sin(az);
  t1 = x * c - y * s; y = x * s + y * c; x = t1;
  return [x, y, z];
}

const easeInOutCubic = t =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// igloo-style particle glyphs: sample an icon image into normalized target
// points; particles spring onto them and the cursor blows through the swarm
const iconPointsCache = new Map();
function iconPoints(src) {
  let entry = iconPointsCache.get(src);
  if (!entry) {
    entry = { points: null };
    iconPointsCache.set(src, entry);
    const img = new Image();
    img.onload = () => {
      const s = 44;
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
      // glyphs come either alpha-keyed or dark-on-light
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
          if (solid) pts.push([x / s - 0.5, y / s - 0.5]);
        }
      }
      entry.points = pts;
    };
    img.src = src;
  }
  return entry;
}

// neon-tinted logo sprites, cached per image url across engine instances
const logoCache = new Map();
function neonSprite(src, color) {
  let entry = logoCache.get(src);
  if (!entry) {
    entry = { tinted: null };
    logoCache.set(src, entry);
    const img = new Image();
    img.onload = () => {
      const s = 96;
      const c = document.createElement('canvas');
      c.width = c.height = s;
      const g = c.getContext('2d');
      const r = Math.min((s * 0.92) / img.width, (s * 0.92) / img.height);
      const w = img.width * r;
      const h = img.height * r;
      g.drawImage(img, (s - w) / 2, (s - h) / 2, w, h);
      // keep only the logo's silhouette, refilled in neon
      g.globalCompositeOperation = 'source-in';
      g.fillStyle = color;
      g.fillRect(0, 0, s, s);
      entry.tinted = c;
    };
    img.src = src;
  }
  return entry;
}

export function createBrain(canvas, opts = {}) {
  const cx = canvas.getContext('2d');
  const CYAN = opts.color || '75,232,255';
  const AMBER = opts.accent || '255,195,107';
  const onHover = opts.onHover || (() => {});
  const onFocusChange = opts.onFocusChange || (() => {});
  const onActivate = opts.onActivate || (() => {});
  // fired whenever the brain leaves / returns to the main view (covers the
  // flight transitions too) so the host can lock page scroll while engaged
  const onEngagedChange = opts.onEngagedChange || (() => {});
  let lastEngaged = false;
  // when provided, glyph nodes (particleIcon) are rendered by an external
  // GPU particle overlay; the engine just streams anchors into this ref
  const glyphTracker = opts.glyphTracker || null;

  let DPR = maxDpr(2);
  let W = 0, H = 0, CW = 0, CH = 0;
  let disposed = false;
  let running = false;
  let rafId = 0;

  // ---------- graph ----------
  let root = { label: 'CORE', children: [] };
  let mainNodes = [];
  let subs = []; // per main node: {nodes, orbiters, clusters} (lazy)

  // ---------- one-camera view state ----------
  const SUB_SCALE = 0.15; // a sub-brain's true size inside its node
  const FOCUS_ZOOM = 1 / SUB_SCALE;
  const DIP_ZOOM = 2.3; // how far the sibling flight pulls back out
  // mode: 'main' | 'flyIn' | 'focus' | 'flyOut' | 'flySide'
  let mode = 'main';
  let focusIdx = -1;
  let sideFrom = -1;
  let anim = 0; // 0..1 within a flight
  let animDur = 1200;
  let camC = [0, 0]; // camera center, device px in main-graph space
  let camZ = 1;

  // ---------- activity ----------
  let activity = 0.12;
  let phase = 0, lastT = 0;
  const synapses = [];
  const ripples = [];
  const pulses = [];
  const axons = [];

  // ---------- interaction ----------
  let mouseX = -1e4, mouseY = -1e4;
  let hoverN = null, hoverCore = false;
  let dragging = false, dragMoved = 0, lastMX = 0, lastMY = 0;
  let uRX = 0, uRY = 0, vRX = 0, vRY = 0;
  let armedTapN = -1; // touch: first tap previews the card, second activates

  const SHELLS = [
    { verts: dodecahedron(), R: 102, sx: 0.0001, sy: 0.00017, sz: 0.00006, alpha: 0.5, width: 1.0, dots: false },
    { verts: icosahedron(), R: 70, sx: -0.00022, sy: 0.0003, sz: -0.00012, alpha: 0.85, width: 1.3, dots: true },
    { verts: octahedron(), R: 37, sx: 0.00055, sy: -0.0004, sz: 0.00033, alpha: 1.0, width: 1.6, dots: true },
  ];
  for (const s of SHELLS) s.edges = edgesFor(s.verts);

  const RINGS = [
    { R: 86, tiltX: 0.45, tiltY: 0, speed: 0.00045 },
    { R: 118, tiltX: 1.25, tiltY: 0.6, speed: -0.00028 },
    { R: 131, tiltX: 1.95, tiltY: 1.2, speed: 0.00018 },
  ];
  const RING_SEG = 64;

  // root-view-only embellishments
  const GEO_SHELL = {
    verts: geodesic(),
    R: 136,
    sx: 0.00007,
    sy: -0.00011,
    sz: 0.00004,
    alpha: 0.32,
    width: 0.75,
    dots: false,
  };
  GEO_SHELL.edges = edgesFor(GEO_SHELL.verts, 1.13);
  const ROOT_RINGS = [
    { R: 147, tiltX: 0.2, tiltY: 2.2, speed: -0.00034 },
    { R: 159, tiltX: 2.7, tiltY: 0.35, speed: 0.00012 },
  ];

  const ORBITS = [
    { R: 158, tiltX: 0.9, tiltY: 0.3, speed: 0.0003 },
    { R: 178, tiltX: 2.05, tiltY: 1.05, speed: -0.00022 },
    { R: 198, tiltX: 1.45, tiltY: 0.7, speed: 0.00017 },
    { R: 216, tiltX: 2.6, tiltY: 1.6, speed: -0.00026 },
  ];
  const GOLDEN = Math.PI * (3 - Math.sqrt(5));

  function resize() {
    DPR = maxDpr(2);
    // clientWidth/Height, NOT getBoundingClientRect: the scene layer carries a
    // CSS scale during transitions, which the rect includes and the layout box
    // does not. Measuring the rect sized the backing store to whatever mid-
    // transition scale happened to be applied, permanently offsetting every
    // node's hit area from where it was drawn.
    W = canvas.width = Math.max(1, Math.round(canvas.clientWidth * DPR));
    H = canvas.height = Math.max(1, Math.round(canvas.clientHeight * DPR));
    CW = W / 2;
    CH = H / 2;
    if (mode === 'focus') emitFocus(); // button positions follow the layout
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  // ---------- geometry ----------
  // a node's anchor in main-graph space (device px around the main core)
  function nodeAnchor(i, n, t) {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / n + Math.sin(t / 1700 + i * 3) * 0.04;
    const R = Math.min(W, H) * 0.36;
    return [Math.cos(a) * R * 1.18, Math.sin(a) * R * 0.82];
  }
  const screenOf = p => [CW + (p[0] - camC[0]) * camZ, CH + (p[1] - camC[1]) * camZ];

  // frame = {x, y, s}: where a graph's core sits on screen and its scale
  const mainFrame = () => {
    const [x, y] = screenOf([0, 0]);
    return { x, y, s: camZ };
  };
  const subFrame = (i, t) => {
    const [x, y] = screenOf(nodeAnchor(i, mainNodes.length, t));
    return { x, y, s: camZ * SUB_SCALE };
  };

  const CAM = 4;
  function project(p, R, f) {
    const persp = CAM / (CAM - p[2]);
    return [f.x + p[0] * R * DPR * f.s * persp, f.y + p[1] * R * DPR * f.s * persp, p[2], persp];
  }
  // ring position of node i within a graph drawn at frame f
  function ringPos(i, n, t, f) {
    const [dx, dy] = nodeAnchor(i, n, t);
    return [f.x + dx * f.s, f.y + dy * f.s];
  }

  // ---------- activity helpers ----------
  function excite(amount) {
    activity = Math.min(1, activity + amount);
    for (let i = 0; i < 2 + amount * 8; i++) fireSynapse();
  }
  function fireSynapse() {
    const sh = Math.random() < 0.55 ? 1 : Math.random() < 0.5 ? 0 : 2;
    synapses.push({ sh, e: Math.floor(Math.random() * SHELLS[sh].edges.length), life: 1 });
  }
  function spawnPulse(n, count) {
    if (!count) return;
    pulses.push({
      n: n !== undefined ? n : Math.floor(Math.random() * count),
      t: 0,
      out: Math.random() < 0.5,
      speed: 0.006 + Math.random() * 0.008,
    });
  }
  function wakeSurge() {
    activity = Math.max(activity, 0.9);
    for (let i = 0; i < 16; i++) fireSynapse();
    const f = activeFrame();
    for (let i = 0; i < 3; i++)
      ripples.push({
        x: f.x, y: f.y,
        r: (12 + i * 34) * DPR, max: (260 + i * 70) * DPR,
        a: 0.9 - i * 0.22,
      });
  }

  // ---------- sub-graph assets ----------
  function buildSub(node) {
    const children = node.children || [];
    const logos = node.orbiters || [];
    return {
      nodes: children,
      orbiters: logos.map((src, i) => ({
        sprite: neonSprite(src, `rgb(${CYAN})`),
        plane: ORBITS[i % ORBITS.length],
        a0: i * GOLDEN + Math.random() * 0.9,
        rMul: 0.82 + Math.random() * 0.5,
        speedMul: 0.7 + Math.random() * 0.6,
        seed: Math.random() * 7,
      })),
      clusters: children.map(n =>
        n.particleIcon ? { entry: iconPoints(n.particleIcon), particles: null } : null
      ),
    };
  }
  const subOf = i => {
    if (!subs[i]) subs[i] = buildSub(mainNodes[i]);
    return subs[i];
  };

  // ---------- navigation ----------
  function activeFrame() {
    return mode === 'focus' && focusIdx >= 0
      ? subFrame(focusIdx, performance.now())
      : mainFrame();
  }
  function emitFocus() {
    if (mode !== 'focus' || focusIdx < 0) {
      onFocusChange(null);
      return;
    }
    const n = mainNodes.length;
    const t = performance.now();
    const Wi = nodeAnchor(focusIdx, n, t);
    const prevIdx = (focusIdx - 1 + n) % n;
    const nextIdx = (focusIdx + 1) % n;
    const place = dir => {
      const len = Math.hypot(dir[0], dir[1]) || 1;
      const u = [dir[0] / len, dir[1] / len];
      // sit beyond the node ring's ellipse radius in this direction, with
      // generous padding so labels are never covered
      const ringR =
        Math.min(W, H) * 0.36 * Math.hypot(1.18 * u[0], 0.82 * u[1]);
      const R = ringR + 130 * DPR;
      // clamp inside the viewport with a margin
      const px = Math.max(80, Math.min(W / DPR - 80, (CW + u[0] * R) / DPR));
      const py = Math.max(100, Math.min(H / DPR - 56, (CH + u[1] * R) / DPR));
      return [px, py];
    };
    const dirTo = j => {
      const Wj = nodeAnchor(j, n, t);
      return [Wj[0] - Wi[0], Wj[1] - Wi[1]];
    };
    const back = place([-Wi[0], -Wi[1]]);
    const prev = place(dirTo(prevIdx));
    const next = place(dirTo(nextIdx));
    onFocusChange({
      index: focusIdx,
      label: mainNodes[focusIdx].label,
      buttons: [
        { kind: 'back', label: root.label, x: back[0], y: back[1] },
        { kind: 'prev', label: mainNodes[prevIdx].label, x: prev[0], y: prev[1], target: prevIdx },
        { kind: 'next', label: mainNodes[nextIdx].label, x: next[0], y: next[1], target: nextIdx },
      ],
    });
  }

  function flyIn(i) {
    if (mode !== 'main' || !mainNodes[i]) return;
    subOf(i);
    focusIdx = i;
    mode = 'flyIn';
    anim = 0;
    animDur = 1300;
    pulses.length = 0;
    excite(0.35);
    onFocusChange(null);
    onHover(null, 0, 0);
    const [x, y] = ringPos(i, mainNodes.length, performance.now(), mainFrame());
    ripples.push({ x, y, r: 10 * DPR, max: 90 * DPR, a: 0.95 });
  }
  function flyOut() {
    if (mode !== 'focus') return;
    mode = 'flyOut';
    anim = 0;
    animDur = 1100;
    pulses.length = 0;
    excite(0.2);
    onFocusChange(null);
    onHover(null, 0, 0);
  }
  function flySide(j) {
    if (mode !== 'focus' || j === focusIdx || !mainNodes[j]) return;
    subOf(j);
    sideFrom = focusIdx;
    focusIdx = j;
    mode = 'flySide';
    anim = 0;
    animDur = 1500;
    pulses.length = 0;
    excite(0.3);
    onFocusChange(null);
    onHover(null, 0, 0);
  }

  // ---------- input ----------
  function activeNodes() {
    if (mode === 'main') return { nodes: mainNodes, frame: mainFrame(), sub: null };
    if (mode === 'focus') {
      const s = subOf(focusIdx);
      return { nodes: s.nodes, frame: subFrame(focusIdx, performance.now()), sub: s };
    }
    return { nodes: [], frame: mainFrame(), sub: null };
  }
  function toLocal(e) {
    // rect here IS the transformed box, which is what a pointer coordinate
    // lives in — so derive the scale from it rather than assuming DPR. Reduces
    // to (client - left) * DPR when the layer is untransformed.
    const r = canvas.getBoundingClientRect();
    const sx = r.width ? W / r.width : DPR;
    const sy = r.height ? H / r.height : DPR;
    return [(e.clientX - r.left) * sx, (e.clientY - r.top) * sy];
  }
  function onPointerDown(e) {
    dragging = true;
    dragMoved = 0;
    lastMX = e.clientX;
    lastMY = e.clientY;
    canvas.classList.add('dragging');
    canvas.setPointerCapture(e.pointerId);
    const [mx, my] = toLocal(e);
    mouseX = mx;
    mouseY = my;
  }
  function onPointerMove(e) {
    const [mx, my] = toLocal(e);
    mouseX = mx;
    mouseY = my;
    if (dragging) {
      const dx = e.clientX - lastMX,
        dy = e.clientY - lastMY;
      dragMoved += Math.abs(dx) + Math.abs(dy);
      uRY += dx * 0.008;
      uRX += dy * 0.008;
      vRY = dx * 0.0035;
      vRX = dy * 0.0035;
      lastMX = e.clientX;
      lastMY = e.clientY;
    }
  }
  function onPointerUp(e) {
    dragging = false;
    canvas.classList.remove('dragging');
    if (dragMoved >= 6) return;
    // on touch there is no hover: the first tap shows the details card,
    // the second tap on the same node activates it
    if (e.pointerType === 'touch' && hoverN !== null && armedTapN !== hoverN) {
      armedTapN = hoverN;
      return;
    }
    if (hoverN !== null) {
      armedTapN = -1;
      const { nodes, sub } = activeNodes();
      const node = nodes[hoverN];
      if (!node) return;
      if (mode === 'main') {
        flyIn(hoverN);
      } else {
        // focused leaf: ripple + delegate (links, etc.)
        if (sub) kickCluster(sub.clusters[hoverN], 9);
        if (glyphTracker && sub && sub.clusters[hoverN]) glyphTracker.current.kick = 1;
        const { frame } = activeNodes();
        const [x, y] = ringPos(hoverN, nodes.length, performance.now(), frame);
        ripples.push({ x, y, r: 10 * DPR, max: 70 * DPR, a: 0.9 });
        for (let i = 0; i < 7; i++)
          pulses.push({ n: hoverN, t: -i * 0.06, out: false, speed: 0.012 + Math.random() * 0.008 });
        excite(0.15);
        onActivate(node);
      }
    } else if (hoverCore) {
      if (mode === 'focus') flyOut();
      else if (mode === 'main') {
        mainNodes.forEach((_, n) =>
          pulses.push({ n, t: 0, out: true, speed: 0.01 + Math.random() * 0.006 })
        );
        const f = mainFrame();
        ripples.push({ x: f.x, y: f.y, r: 20 * DPR, max: 230 * DPR, a: 1 });
        excite(0.3);
      }
    }
  }
  function onPointerLeave(e) {
    if (e.pointerType === 'touch') return; // keep the tapped card visible
    mouseX = -1e4;
    mouseY = -1e4;
  }
  function onPointerCancel() {
    dragging = false;
    dragMoved = 0;
    vRX = vRY = 0;
    canvas.classList.remove('dragging');
  }
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerLeave);
  canvas.addEventListener('pointercancel', onPointerCancel);

  // ---------- drawing ----------
  function drawCore3D(t, f, alpha, isRoot) {
    if (alpha <= 0.01) return;
    const beat = Math.sin(phase / 420);
    const breath = (1 + (0.035 + 0.11 * activity) * beat) * (isRoot ? 1.3 : 1);

    cx.lineCap = 'round';
    const ringSet = isRoot ? RINGS.concat(ROOT_RINGS) : RINGS;
    for (const r of ringSet) {
      const spin = phase * r.speed;
      let prev = null;
      for (let i = 0; i <= RING_SEG; i++) {
        const a = (i / RING_SEG) * Math.PI * 2;
        const p = rot3(
          [Math.cos(a), Math.sin(a), 0],
          r.tiltX + uRX,
          r.tiltY + spin + uRY,
          spin * 0.7
        );
        const [sx2, sy2, z] = project(p, r.R * breath, f);
        const a2 = (0.1 + 0.3 * (z + 1) / 2) * (0.7 + 0.6 * activity) * alpha;
        if (prev) {
          cx.strokeStyle = `rgba(${CYAN},${a2})`;
          cx.lineWidth = (0.7 + 0.7 * (z + 1) / 2) * DPR * Math.min(1, f.s);
          cx.beginPath();
          cx.moveTo(prev[0], prev[1]);
          cx.lineTo(sx2, sy2);
          cx.stroke();
        }
        prev = [sx2, sy2];
      }
      if (isRoot) {
        // bright beads travelling each ring
        for (let k = 0; k < 2; k++) {
          const a = spin * 36 + (k * Math.PI) + Math.sin(t / 2300 + k) * 0.3;
          const p = rot3(
            [Math.cos(a), Math.sin(a), 0],
            r.tiltX + uRX,
            r.tiltY + spin + uRY,
            spin * 0.7
          );
          const [bx, by, bz] = project(p, r.R * breath, f);
          const depth = (bz + 1) / 2;
          cx.fillStyle = `rgba(255,255,255,${(0.35 + 0.6 * depth) * alpha})`;
          cx.shadowColor = `rgba(${CYAN},0.9)`;
          cx.shadowBlur = 10 * DPR * depth;
          cx.beginPath();
          cx.arc(bx, by, (0.9 + 1.3 * depth) * DPR, 0, 7);
          cx.fill();
          cx.shadowBlur = 0;
        }
      }
    }

    const shellSet = isRoot ? SHELLS.concat([GEO_SHELL]) : SHELLS;
    for (const sh of shellSet) {
      const rx = phase * sh.sx + uRX,
        ry = phase * sh.sy + uRY,
        rz = phase * sh.sz;
      sh.proj = sh.verts.map(v => project(rot3(v, rx, ry, rz), sh.R * breath, f));
      for (const [i, j] of sh.edges) {
        const a = sh.proj[i],
          b = sh.proj[j];
        const depth = ((a[2] + b[2]) / 2 + 1) / 2;
        cx.strokeStyle = `rgba(${CYAN},${sh.alpha * (0.15 + 0.75 * depth) * (0.75 + 0.45 * activity) * alpha})`;
        cx.lineWidth = sh.width * (0.5 + 0.8 * depth) * DPR * Math.min(1, f.s * 2);
        cx.beginPath();
        cx.moveTo(a[0], a[1]);
        cx.lineTo(b[0], b[1]);
        cx.stroke();
      }
      if (sh.dots && f.s > 0.4) {
        for (const p of sh.proj) {
          const depth = (p[2] + 1) / 2;
          cx.fillStyle = `rgba(255,255,255,${(0.25 + 0.7 * depth) * alpha})`;
          cx.shadowColor = `rgba(${CYAN},0.9)`;
          cx.shadowBlur = 8 * DPR * depth;
          cx.beginPath();
          cx.arc(p[0], p[1], (1.1 + 1.5 * depth) * DPR, 0, 7);
          cx.fill();
        }
        cx.shadowBlur = 0;
      }
    }

    // transient axon filaments weaving the inner shells together (root only)
    if (isRoot) {
      if (Math.random() < 0.035 + activity * 0.05) {
        axons.push({
          a: Math.floor(Math.random() * SHELLS[1].verts.length),
          b: Math.floor(Math.random() * SHELLS[0].verts.length),
          life: 1,
        });
      }
      for (let i = axons.length - 1; i >= 0; i--) {
        const ax = axons[i];
        ax.life -= 0.012;
        if (ax.life <= 0) {
          axons.splice(i, 1);
          continue;
        }
        const pa = SHELLS[1].proj[ax.a];
        const pb = SHELLS[0].proj[ax.b];
        if (!pa || !pb) continue;
        const fade = Math.sin(ax.life * Math.PI);
        const g = cx.createLinearGradient(pa[0], pa[1], pb[0], pb[1]);
        g.addColorStop(0, `rgba(${CYAN},${0.34 * fade * alpha})`);
        g.addColorStop(1, `rgba(${CYAN},${0.05 * fade * alpha})`);
        cx.strokeStyle = g;
        cx.lineWidth = 0.8 * DPR;
        cx.beginPath();
        cx.moveTo(pa[0], pa[1]);
        cx.lineTo(pb[0], pb[1]);
        cx.stroke();
      }
    }

    // firing synapses on the shells of this core
    for (let i = synapses.length - 1; i >= 0; i--) {
      const s = synapses[i];
      if (isRoot) {
        s.life -= 0.045;
        if (s.life <= 0) {
          synapses.splice(i, 1);
          continue;
        }
      }
      const sh = SHELLS[s.sh];
      if (!sh.proj) continue;
      const [i1, i2] = sh.edges[s.e];
      const a = sh.proj[i1],
        b = sh.proj[i2];
      const col = s.life > 0.55 ? '255,255,255' : AMBER;
      cx.strokeStyle = `rgba(${col},${s.life * alpha})`;
      cx.lineWidth = (1.2 + 1.8 * s.life) * DPR * Math.min(1, f.s * 2);
      cx.shadowColor = `rgb(${AMBER})`;
      cx.shadowBlur = 14 * DPR * s.life * Math.min(1, f.s);
      cx.beginPath();
      cx.moveTo(a[0], a[1]);
      cx.lineTo(b[0], b[1]);
      cx.stroke();
      cx.shadowBlur = 0;
    }

    // singularity + glow
    const flick = 0.7 + 0.3 * Math.sin(t / (95 - 70 * activity));
    cx.fillStyle = `rgba(255,255,255,${flick * alpha})`;
    cx.shadowColor = activity > 0.4 ? `rgb(${AMBER})` : `rgb(${CYAN})`;
    cx.shadowBlur = (26 + 26 * activity) * DPR * Math.min(1, f.s);
    cx.beginPath();
    cx.arc(f.x, f.y, (3 + 3.5 * activity) * DPR * breath * Math.max(0.4, Math.min(1.6, f.s)), 0, 7);
    cx.fill();
    cx.shadowBlur = 0;

    const gr = (120 + 88 * activity) * DPR * Math.max(0.5, Math.min(1.4, f.s)) * (isRoot ? 1.3 : 1);
    const glow = cx.createRadialGradient(f.x, f.y, 0, f.x, f.y, gr);
    const gp = (0.08 + 0.04 * Math.sin(t / 800) + 0.22 * activity) * alpha;
    glow.addColorStop(0, `rgba(${CYAN},${gp})`);
    glow.addColorStop(1, 'transparent');
    cx.fillStyle = glow;
    cx.fillRect(f.x - gr, f.y - gr, gr * 2, gr * 2);
  }

  // edges from a graph's core to its nodes
  function drawEdges(count, t, f, alpha, only = null) {
    cx.lineWidth = 1 * DPR;
    for (let i = 0; i < count; i++) {
      if (only && !only.includes(i)) continue;
      const [x, y] = ringPos(i, count, t, f);
      const g = cx.createLinearGradient(x, y, f.x, f.y);
      g.addColorStop(0, `rgba(${CYAN},${0.28 * alpha})`);
      g.addColorStop(1, `rgba(${CYAN},${0.06 * alpha})`);
      cx.strokeStyle = g;
      cx.beginPath();
      cx.moveTo(x, y);
      cx.quadraticCurveTo((x + f.x) / 2, (y + f.y) / 2 + 30 * DPR * f.s, f.x, f.y);
      cx.stroke();
    }
  }

  // ---------- igloo-style particle node glyphs ----------
  const CLUSTER_MAX = 240;
  function buildCluster(cl) {
    const pts = cl.entry.points;
    const keep = Math.min(1, CLUSTER_MAX / pts.length);
    cl.particles = [];
    for (const [nx, ny] of pts) {
      if (Math.random() > keep) continue;
      cl.particles.push({
        nx, ny,
        nz: (Math.random() - 0.5) * 0.18,
        x: 0, y: 0, vx: 0, vy: 0,
        seed: Math.random() * 7,
        init: true,
      });
    }
  }
  function kickCluster(cl, mag) {
    if (!cl || !cl.particles) return;
    for (const p of cl.particles) {
      p.vx += (Math.random() - 0.5) * mag * DPR;
      p.vy += (Math.random() - 0.5) * mag * DPR;
    }
  }
  function drawCluster(cl, i, ax, ay, t, hot, scale, alpha) {
    if (!cl.particles) {
      if (cl.entry.points) buildCluster(cl);
      else return false;
    }
    const S = 84 * DPR * Math.min(1.3, scale);
    const yaw = Math.sin(t / 2600 + i * 2.1) * 0.3 + uRY * 0.7;
    const pitch = Math.sin(t / 3300 + i) * 0.14 + uRX * 0.7;
    const bright = hot ? 1 : 0.72;
    const cols = [];
    for (let b = 0; b < 6; b++)
      cols.push(
        `rgba(${hot ? AMBER : CYAN},${Math.min(1, (0.2 + 0.16 * b) * bright) * alpha})`
      );
    const R = 46 * DPR;
    const R2 = R * R;
    const spring = 0.024;
    const damp = 0.86;
    for (const p of cl.particles) {
      const q = rot3([p.nx, p.ny, p.nz], pitch, yaw, 0);
      const persp = 3 / (3 - q[2] * 2);
      const tx = ax + q[0] * S * persp;
      const ty = ay + q[1] * S * persp;
      if (p.init) {
        p.x = tx + (Math.random() - 0.5) * 260 * DPR;
        p.y = ty + (Math.random() - 0.5) * 260 * DPR;
        p.init = false;
      }
      p.vx += (tx - p.x) * spring + (Math.random() - 0.5) * 0.07 * DPR;
      p.vy += (ty - p.y) * spring + (Math.random() - 0.5) * 0.07 * DPR;
      const dx = p.x - mouseX;
      const dy = p.y - mouseY;
      const d2 = dx * dx + dy * dy;
      if (d2 < R2 && d2 > 0.01) {
        const d = Math.sqrt(d2);
        const fForce = ((R - d) / R) * 3.4 * DPR;
        p.vx += (dx / d) * fForce;
        p.vy += (dy / d) * fForce;
      }
      p.vx *= damp;
      p.vy *= damp;
      p.x += p.vx;
      p.y += p.vy;
      const depth = (q[2] + 1) / 2;
      cx.fillStyle = cols[Math.min(5, (depth * 6) | 0)];
      const sz = (0.9 + depth) * 1.5 * DPR;
      cx.fillRect(p.x - sz / 2, p.y - sz / 2, sz, sz);
    }
    return true;
  }

  // orbiting neon logos around a sub core
  function drawOrbiters(sub, t, f, alpha) {
    if (!sub.orbiters.length || alpha <= 0.02) return;
    const back = [];
    const front = [];
    for (const o of sub.orbiters) {
      if (!o.sprite.tinted) continue;
      const a =
        o.a0 + phase * o.plane.speed * o.speedMul * 2 + Math.sin(t / 1900 + o.seed) * 0.05;
      const p = rot3(
        [Math.cos(a), Math.sin(a), 0],
        o.plane.tiltX + uRX,
        o.plane.tiltY + uRY,
        0
      );
      const pr = project(p, o.plane.R * o.rMul, f);
      (pr[2] < 0 ? back : front).push(pr.concat([o]));
    }
    const drawList = list => {
      for (const [sx, sy, z, persp, o] of list) {
        const depth = (z + 1) / 2;
        const s = (15 + 13 * depth) * DPR * Math.min(1.4, f.s) * persp;
        cx.globalAlpha = (0.3 + 0.65 * depth) * alpha;
        cx.shadowColor = `rgba(${CYAN},0.9)`;
        cx.shadowBlur = 14 * DPR * depth;
        cx.drawImage(o.sprite.tinted, sx - s / 2, sy - s / 2, s, s);
        cx.shadowBlur = 0;
        cx.globalAlpha = 1;
      }
    };
    drawList(back);
    sub._front = drawList.bind(null, front); // drawn after the core
  }

  // a graph's node ring: dots/clusters, labels
  function drawNodes(nodes, sub, t, f, alpha, interactive, isRoot) {
    if (alpha <= 0.02) return;
    cx.textAlign = 'center';
    const labelPx = isRoot ? 14.5 : 11;
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const hot = interactive && i === hoverN;
      const [x, y] = ringPos(i, nodes.length, t, f);
      let labelLift = isRoot ? 21 : 16;
      const cl = sub ? sub.clusters[i] : null;
      if (cl && glyphTracker) {
        labelLift = 52; // glyph is rendered by the GPU particle overlay
      } else if (cl && drawCluster(cl, i, x, y, t, hot, f.s, alpha)) {
        labelLift = 52;
      } else {
        const ringPulse = (1 + Math.sin(t / 600 + i * 5) * 0.18) * (hot ? 1.7 : 1);
        cx.strokeStyle = hot ? `rgba(${AMBER},${0.95 * alpha})` : `rgba(${CYAN},${0.85 * alpha})`;
        cx.lineWidth = (hot ? 2 : 1.4) * DPR;
        cx.beginPath();
        cx.arc(x, y, 7 * DPR * ringPulse * Math.min(1.4, Math.max(0.5, f.s)), 0, 7);
        cx.stroke();
        cx.fillStyle = hot ? `rgba(${AMBER},${alpha})` : `rgba(${CYAN},${0.95 * alpha})`;
        cx.beginPath();
        cx.arc(x, y, (hot ? 3.6 : 2.6) * DPR * Math.min(1.4, Math.max(0.5, f.s)), 0, 7);
        cx.fill();
      }

      // labels fade in only near full scale (tiny sub-brains keep them off)
      const labelA = alpha * Math.max(0, Math.min(1, (f.s - 0.55) * 3));
      if (labelA > 0.03) {
        cx.fillStyle = `rgba(255,255,255,${labelA})`;
        cx.font = `600 ${labelPx * DPR}px Consolas, monospace`;
        cx.shadowColor = hot ? `rgb(${AMBER})` : `rgba(${CYAN},0.9)`;
        cx.shadowBlur = (hot ? 16 : 10) * DPR;
        const lw = cx.measureText(n.label).width / 2;
        cx.fillText(
          n.label,
          Math.max(lw + 4 * DPR, Math.min(W - lw - 4 * DPR, x)),
          y - labelLift * DPR
        );
        cx.shadowBlur = 0;
      }
    }
  }

  function drawPulses(count, t, f, alpha) {
    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i];
      p.t += p.speed;
      if (p.t >= 1 || p.n >= count) {
        pulses.splice(i, 1);
        continue;
      }
      if (p.t <= 0) continue;
      const [nx, ny] = ringPos(p.n, count, t, f);
      const k = p.out ? p.t : 1 - p.t;
      const mx = (nx + f.x) / 2,
        my = (ny + f.y) / 2 + 30 * DPR * f.s;
      const a = 1 - k;
      const px = a * a * nx + 2 * a * k * mx + k * k * f.x;
      const py = a * a * ny + 2 * a * k * my + k * k * f.y;
      const col = p.out ? AMBER : CYAN;
      cx.fillStyle = `rgba(${col},${0.95 * alpha})`;
      cx.shadowColor = `rgb(${col})`;
      cx.shadowBlur = 12 * DPR;
      cx.beginPath();
      cx.arc(px, py, 2.4 * DPR, 0, 7);
      cx.fill();
      cx.shadowBlur = 0;
    }
  }

  // ---------- main loop ----------
  function draw(t) {
    if (disposed) return;
    // off-screen: stop ticking entirely (the IntersectionObserver below
    // restarts the loop on re-entry) instead of burning a RAF every frame
    if (!running) {
      rafId = 0;
      return;
    }
    rafId = requestAnimationFrame(draw);

    const dt = Math.min(60, lastT ? t - lastT : 16);
    lastT = t;
    activity = Math.max(0.08, activity * Math.pow(0.99965, dt));
    phase += dt * (0.45 + activity * 2.6);
    if (!dragging) {
      uRX += vRX;
      uRY += vRY;
      vRX *= 0.96;
      vRY *= 0.96;
    }

    // ---- camera ----
    const n = mainNodes.length;
    if (mode === 'flyIn' || mode === 'flyOut' || mode === 'flySide') {
      anim = Math.min(1, anim + dt / animDur);
      const k = easeInOutCubic(anim);
      if (mode === 'flyIn') {
        const Wi = nodeAnchor(focusIdx, n, t);
        camC = [Wi[0] * k, Wi[1] * k];
        camZ = 1 + (FOCUS_ZOOM - 1) * k;
        if (anim >= 1) {
          mode = 'focus';
          wakeSurge();
          emitFocus();
        }
      } else if (mode === 'flyOut') {
        const Wi = nodeAnchor(focusIdx, n, t);
        camC = [Wi[0] * (1 - k), Wi[1] * (1 - k)];
        camZ = FOCUS_ZOOM + (1 - FOCUS_ZOOM) * k;
        if (anim >= 1) {
          mode = 'main';
          focusIdx = -1;
          emitFocus();
        }
      } else {
        const Wa = nodeAnchor(sideFrom, n, t);
        const Wb = nodeAnchor(focusIdx, n, t);
        camC = [Wa[0] + (Wb[0] - Wa[0]) * k, Wa[1] + (Wb[1] - Wa[1]) * k];
        // dip out mid-flight to see the constellation pass by
        camZ = FOCUS_ZOOM + (DIP_ZOOM - FOCUS_ZOOM) * Math.sin(Math.PI * k);
        if (anim >= 1) {
          mode = 'focus';
          sideFrom = -1;
          wakeSurge();
          emitFocus();
        }
      }
    } else if (mode === 'focus') {
      camC = nodeAnchor(focusIdx, n, t);
      camZ = FOCUS_ZOOM;
    } else {
      camC = [0, 0];
      camZ = 1;
    }

    // notify the host when we enter/leave the main view (lock page scroll)
    const engaged = mode !== 'main';
    if (engaged !== lastEngaged) {
      lastEngaged = engaged;
      onEngagedChange(engaged);
    }

    if (Math.random() < 0.004 + activity * 0.1) {
      const { nodes } = activeNodes();
      spawnPulse(undefined, nodes.length);
    }
    if (Math.random() < activity * 0.18) fireSynapse();

    cx.clearRect(0, 0, W, H);
    if (glyphTracker) glyphTracker.current.active = false;

    // ---- main graph (always present — this is the "one camera" feel) ----
    const fMain = mainFrame();
    // constellation fades as we get close, but never fully disappears
    const mainA = Math.max(0.0, Math.min(1, (3.2 - camZ) / 2.2));
    // the umbilical edges to the focused (and flight-related) nodes persist
    const persistent = [];
    if (focusIdx >= 0) persistent.push(focusIdx);
    if (sideFrom >= 0) persistent.push(sideFrom);
    if (mainA > 0.02) drawEdges(n, t, fMain, mainA);
    if (persistent.length) drawEdges(n, t, fMain, 0.5, persistent);

    // ---- hover detection ----
    const prevHover = hoverN;
    hoverN = null;
    if (mode === 'main' || mode === 'focus') {
      const { nodes, frame, sub } = activeNodes();
      for (let i = 0; i < nodes.length; i++) {
        const [x, y] = ringPos(i, nodes.length, t, frame);
        const radius = sub && sub.clusters[i] ? 54 : 36;
        if (Math.hypot(mouseX - x, mouseY - y) < radius * DPR) {
          hoverN = i;
          break;
        }
      }
      const coreF = mode === 'focus' ? subFrame(focusIdx, t) : fMain;
      hoverCore =
        hoverN === null &&
        Math.hypot(mouseX - coreF.x, mouseY - coreF.y) < 120 * DPR * Math.min(1.4, coreF.s);
      const node = hoverN !== null ? nodes[hoverN] : null;
      const actionable =
        node && (node.href || (node.children && node.children.length) || mode === 'main');
      canvas.classList.toggle('hovering', !!actionable || hoverCore);
      if (hoverN !== prevHover) {
        if (hoverN !== null) {
          const [x, y] = ringPos(hoverN, nodes.length, t, frame);
          onHover(nodes[hoverN], x / DPR, y / DPR);
        } else onHover(null, 0, 0);
      } else if (hoverN !== null) {
        const [x, y] = ringPos(hoverN, nodes.length, t, frame);
        onHover(nodes[hoverN], x / DPR, y / DPR, true);
      }
    } else {
      hoverCore = false;
      canvas.classList.remove('hovering');
      if (prevHover !== null) onHover(null, 0, 0);
    }

    // main node ring (dots/labels fade with the constellation)
    drawNodes(mainNodes, null, t, fMain, mainA, mode === 'main', true);

    // ---- sub-brains: each lives tiny inside its node and scales with the camera ----
    // visible when its on-screen scale is meaningful
    const subVisible = [];
    if (focusIdx >= 0) subVisible.push(focusIdx);
    if (sideFrom >= 0 && sideFrom !== focusIdx) subVisible.push(sideFrom);
    for (const idx of subVisible) {
      const s = subOf(idx);
      const f = subFrame(idx, t);
      // alpha ramps with apparent scale: tiny seed -> full brain
      let a = Math.max(0, Math.min(1, (f.s - 0.16) / 0.5));
      if (mode === 'flySide') {
        // crossfade between departure and arrival sub-brains
        a *= idx === focusIdx ? easeInOutCubic(anim) : 1 - easeInOutCubic(anim);
      }
      if (a <= 0.02) continue;
      drawEdges(s.nodes.length, t, f, a);
      drawOrbiters(s, t, f, a);
      drawNodes(s.nodes, s, t, f, a, mode === 'focus' && idx === focusIdx, false);
      drawCore3D(t, f, a, false);
      if (s._front) {
        s._front();
        s._front = null;
      }
      // stream glyph-node anchors to the GPU particle overlay
      if (glyphTracker && s.clusters.some(Boolean)) {
        const tr = glyphTracker.current;
        tr.active = true;
        tr.alpha = a;
        tr.scale = f.s;
        tr.anchors = [];
        tr.hot = -1;
        for (let i = 0; i < s.nodes.length; i++) {
          if (!s.clusters[i]) continue;
          const [x, y] = ringPos(i, s.nodes.length, t, f);
          if (mode === 'focus' && idx === focusIdx && hoverN === i) {
            tr.hot = tr.anchors.length;
          }
          tr.anchors.push([x / DPR, y / DPR]);
        }
      }
    }

    // main core drawn last so its glow layers over everything when dominant
    drawCore3D(t, fMain, mainA, true);

    // ---- pulses on the active graph ----
    if (mode === 'main') drawPulses(n, t, fMain, 1);
    else if (mode === 'focus') drawPulses(subOf(focusIdx).nodes.length, t, subFrame(focusIdx, t), 1);

    // ---- ripples ----
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i];
      r.r += (r.max - r.r) * 0.08;
      r.a *= 0.94;
      if (r.a < 0.02) {
        ripples.splice(i, 1);
        continue;
      }
      cx.strokeStyle = `rgba(${r.amber ? AMBER : CYAN},${r.a})`;
      cx.lineWidth = 1.5 * DPR;
      cx.beginPath();
      cx.arc(r.x, r.y, r.r, 0, 7);
      cx.stroke();
    }
  }
  rafId = requestAnimationFrame(draw);

  // only animate while visible; restart the loop on re-entry since draw()
  // now halts itself (rafId=0) when scrolled away
  const io = new IntersectionObserver(
    entries => {
      running = entries[0].isIntersecting;
      lastT = 0;
      if (running && !rafId && !disposed) rafId = requestAnimationFrame(draw);
    },
    { threshold: 0.05 }
  );
  io.observe(canvas);

  return {
    setGraph(graph) {
      root = graph;
      mainNodes = graph.children || [];
      subs = new Array(mainNodes.length).fill(null);
      mode = 'main';
      focusIdx = -1;
      pulses.length = 0;
      armedTapN = -1;
      if (lastEngaged) {
        lastEngaged = false;
        onEngagedChange(false);
      }
      onFocusChange(null);
      onHover(null, 0, 0);
      wakeSurge();
    },
    back: flyOut,
    focusNode: flySide,
    dispose() {
      disposed = true;
      if (lastEngaged) onEngagedChange(false); // never leave the page locked
      cancelAnimationFrame(rafId);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      canvas.removeEventListener('pointercancel', onPointerCancel);
    },
  };
}
