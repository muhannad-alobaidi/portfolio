/*
  Neural-core renderer, ported from the Jarvis HUD (media/hud.html) and
  stripped of the live Claude/VS Code bridge. Pure canvas-2D: three nested
  polyhedra shells + gyro rings + singularity, firing synapses, orbiting
  labeled nodes with travelling pulses, drag-to-rotate, and a "dive"
  transition that zooms through a node into its sub-graph.
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
const easeOutBack = t => {
  const c1 = 1.2;
  return 1 + (c1 + 1) * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

export function createBrain(canvas, opts = {}) {
  const cx = canvas.getContext('2d');
  const CYAN = opts.color || '75,232,255';
  const AMBER = opts.accent || '255,195,107';
  const onHover = opts.onHover || (() => {});
  const onViewChange = opts.onViewChange || (() => {});
  const onActivate = opts.onActivate || (() => {});

  let DPR = Math.min(2, window.devicePixelRatio || 1);
  let W = 0, H = 0, CW = 0, CH = 0;
  let disposed = false;
  let running = false;
  let rafId = 0;

  // ---------- graph / view state ----------
  let root = { label: 'CORE', children: [] };
  let view = null; // current node whose children orbit the core
  let path = []; // breadcrumb of nodes from root
  let nodes = [];
  let orbiters = []; // logo sprites circling the core in this view
  let clusters = []; // per-node particle glyphs (nodes with particleIcon)

  // ---------- activity engine ----------
  let activity = 0.12;
  let phase = 0, lastT = 0;
  const synapses = [];
  let flashA = 0;

  // ---------- interaction ----------
  let mouseX = -1e4, mouseY = -1e4;
  let hoverN = null, hoverCore = false;
  let dragging = false, dragMoved = 0, lastMX = 0, lastMY = 0;
  let uRX = 0, uRY = 0, vRX = 0, vRY = 0;
  let armedTapN = -1; // touch: first tap previews the card, second activates

  // ---------- camera (zoom + pan, drives the dive transition) ----------
  let zoom = 1, panX = 0, panY = 0;
  // transition: null | {mode:'in'|'out', t, dur, node?, next, alphaFrom}
  let trans = null;
  let graphAlpha = 1;

  const ripples = [];
  const pulses = [];

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

  // ---- root-view-only embellishments (sub-brains keep the plain core) ----
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
  const axons = []; // transient filaments between the inner shells

  function resize() {
    const rect = canvas.getBoundingClientRect();
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = canvas.width = Math.max(1, Math.round(rect.width * DPR));
    H = canvas.height = Math.max(1, Math.round(rect.height * DPR));
    CW = W / 2;
    CH = H / 2;
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  // origin of the whole scene (center + pan)
  const ox = () => CW + panX * DPR;
  const oy = () => CH + panY * DPR;

  const CAM = 4;
  function project(p, R) {
    const persp = CAM / (CAM - p[2]);
    return [
      ox() + p[0] * R * DPR * zoom * persp,
      oy() + p[1] * R * DPR * zoom * persp,
      p[2],
      persp,
    ];
  }

  // node ring: evenly spaced on an ellipse, gentle wobble
  function nodeOffset(i, n, t) {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / n + Math.sin(t / 1700 + i * 3) * 0.04;
    const R = Math.min(W, H) * 0.36;
    return [Math.cos(a) * R * 1.18, Math.sin(a) * R * 0.82];
  }
  function nodePos(i, t) {
    const [dx, dy] = nodeOffset(i, nodes.length, t);
    return [ox() + dx * zoom, oy() + dy * zoom];
  }

  function excite(amount) {
    activity = Math.min(1, activity + amount);
    for (let i = 0; i < 2 + amount * 8; i++) fireSynapse();
  }
  function fireSynapse() {
    const sh = Math.random() < 0.55 ? 1 : Math.random() < 0.5 ? 0 : 2;
    synapses.push({ sh, e: Math.floor(Math.random() * SHELLS[sh].edges.length), life: 1 });
  }
  function spawnPulse(n) {
    if (!nodes.length) return;
    pulses.push({
      n: n !== undefined ? n : Math.floor(Math.random() * nodes.length),
      t: 0,
      out: Math.random() < 0.5,
      speed: 0.006 + Math.random() * 0.008,
    });
  }
  function wakeSurge() {
    flashA = 0.45;
    activity = Math.max(activity, 0.9);
    for (let i = 0; i < 16; i++) fireSynapse();
    nodes.forEach((_, n) =>
      pulses.push({ n, t: -Math.random() * 0.3, out: false, speed: 0.014 })
    );
    for (let i = 0; i < 3; i++)
      ripples.push({
        x: ox(), y: oy(),
        r: (12 + i * 34) * DPR, max: (260 + i * 70) * DPR,
        a: 0.9 - i * 0.22,
      });
  }

  // ---------- view switching ----------
  // tilted orbital planes the logos travel on, like extra gyro rings —
  // speeds are in the same phase units as RINGS so everything stays in sync
  const ORBITS = [
    { R: 158, tiltX: 0.9, tiltY: 0.3, speed: 0.0003 },
    { R: 178, tiltX: 2.05, tiltY: 1.05, speed: -0.00022 },
    { R: 198, tiltX: 1.45, tiltY: 0.7, speed: 0.00017 },
    { R: 216, tiltX: 2.6, tiltY: 1.6, speed: -0.00026 },
  ];
  const GOLDEN = Math.PI * (3 - Math.sqrt(5));

  function applyView(node, newPath) {
    view = node;
    path = newPath;
    nodes = node.children || [];
    const logos = node.orbiters || [];
    orbiters = logos.map((src, i) => ({
      sprite: neonSprite(src, `rgb(${CYAN})`),
      plane: ORBITS[i % ORBITS.length],
      // golden-angle spread + jitter: even-ish coverage, organic spacing
      a0: i * GOLDEN + Math.random() * 0.9,
      rMul: 0.82 + Math.random() * 0.5, // random orbit distance
      speedMul: 0.7 + Math.random() * 0.6, // random pace per logo
      seed: Math.random() * 7,
    }));
    clusters = nodes.map(n =>
      n.particleIcon ? { entry: iconPoints(n.particleIcon), particles: null } : null
    );
    pulses.length = 0;
    armedTapN = -1;
    onViewChange(path.map(p => p.label), node);
    onHover(null, 0, 0);
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
        nx,
        ny,
        nz: (Math.random() - 0.5) * 0.18, // shallow depth -> 3D parallax
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
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
  function drawCluster(cl, i, ax, ay, t, hot) {
    if (!cl.particles) {
      if (cl.entry.points) buildCluster(cl);
      else return false; // icon still loading -> caller draws the plain dot
    }
    const S = 84 * DPR * Math.min(1.3, zoom);
    // gentle idle turn + drag parallax, like the jarvis head
    const yaw = Math.sin(t / 2600 + i * 2.1) * 0.3 + uRY * 0.7;
    const pitch = Math.sin(t / 3300 + i) * 0.14 + uRX * 0.7;
    const bright = hot ? 1 : 0.72;
    const cols = [];
    for (let b = 0; b < 6; b++)
      cols.push(
        `rgba(${hot ? AMBER : CYAN},${Math.min(1, (0.2 + 0.16 * b) * bright) * graphAlpha})`
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
        // swarm in from scattered chaos on first sight
        p.x = tx + (Math.random() - 0.5) * 260 * DPR;
        p.y = ty + (Math.random() - 0.5) * 260 * DPR;
        p.init = false;
      }
      p.vx += (tx - p.x) * spring + (Math.random() - 0.5) * 0.07 * DPR;
      p.vy += (ty - p.y) * spring + (Math.random() - 0.5) * 0.07 * DPR;
      // the cursor blows through the swarm; it always reforms
      const dx = p.x - mouseX;
      const dy = p.y - mouseY;
      const d2 = dx * dx + dy * dy;
      if (d2 < R2 && d2 > 0.01) {
        const d = Math.sqrt(d2);
        const f = ((R - d) / R) * 3.4 * DPR;
        p.vx += (dx / d) * f;
        p.vy += (dy / d) * f;
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

  // project all orbiting logos, split into behind/in-front of the core
  function projectOrbiters(t) {
    const back = [];
    const front = [];
    for (const o of orbiters) {
      if (!o.sprite.tinted) continue;
      // same pace class as the gyro rings, with per-logo variation
      const a =
        o.a0 +
        phase * o.plane.speed * o.speedMul * 2 +
        Math.sin(t / 1900 + o.seed) * 0.05;
      const p = rot3(
        [Math.cos(a), Math.sin(a), 0],
        o.plane.tiltX + uRX,
        o.plane.tiltY + uRY,
        0
      );
      const [sx, sy, z, persp] = project(p, o.plane.R * o.rMul);
      (z < 0 ? back : front).push({ o, sx, sy, z, persp });
    }
    return { back, front };
  }

  function drawOrbiters(list) {
    for (const { o, sx, sy, z, persp } of list) {
      const depth = (z + 1) / 2;
      const s = (15 + 13 * depth) * DPR * Math.min(1.4, zoom) * persp;
      cx.globalAlpha = (0.3 + 0.65 * depth) * graphAlpha;
      cx.shadowColor = `rgba(${CYAN},0.9)`;
      cx.shadowBlur = 14 * DPR * depth;
      cx.drawImage(o.sprite.tinted, sx - s / 2, sy - s / 2, s, s);
      cx.shadowBlur = 0;
      cx.globalAlpha = 1;
    }
  }

  function diveInto(i) {
    const node = nodes[i];
    if (!node || trans) return;
    const t0 = performance.now();
    const [dx, dy] = nodeOffset(i, nodes.length, t0);
    excite(0.4);
    const [nx, ny] = nodePos(i, t0);
    ripples.push({ x: nx, y: ny, r: 10 * DPR, max: 90 * DPR, a: 0.95 });
    trans = {
      mode: 'in',
      t: 0,
      dur: 1000,
      // pan so the clicked node glides into the center while we magnify
      fromZoom: zoom, toZoom: 3.4,
      fromPanX: panX, toPanX: -dx / DPR * 3.4,
      fromPanY: panY, toPanY: -dy / DPR * 3.4,
      next: () => applyView(node, [...path, node]),
    };
  }

  function backOut() {
    // interrupting an emerge ('out') is safe — its pan is already 0; only
    // dive/back ('in') transitions stay atomic
    if (!view || path.length <= 1 || (trans && trans.mode === 'in')) return;
    const parentPath = path.slice(0, -1);
    const parent = parentPath[parentPath.length - 1];
    trans = {
      mode: 'in',
      t: 0,
      dur: 800,
      fromZoom: zoom, toZoom: 0.18,
      fromPanX: panX, toPanX: 0,
      fromPanY: panY, toPanY: 0,
      next: () => applyView(parent, parentPath),
    };
  }

  function emerge() {
    zoom = 0.4;
    panX = 0;
    panY = 0;
    trans = {
      mode: 'out',
      t: 0,
      dur: 900,
      fromZoom: 0.4, toZoom: 1,
      fromPanX: 0, toPanX: 0,
      fromPanY: 0, toPanY: 0,
      next: null,
    };
    wakeSurge();
  }

  // ---------- input ----------
  function toLocal(e) {
    const r = canvas.getBoundingClientRect();
    return [(e.clientX - r.left) * DPR, (e.clientY - r.top) * DPR];
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
    if (dragMoved < 6 && !trans) {
      // on touch there is no hover: the first tap shows the details card,
      // the second tap on the same node activates it
      if (e.pointerType === 'touch' && hoverN !== null && armedTapN !== hoverN) {
        armedTapN = hoverN;
        return;
      }
      if (hoverN !== null) {
        armedTapN = -1;
        const node = nodes[hoverN];
        if (node.children && node.children.length) diveInto(hoverN);
        else {
          // leaf: ripple + delegate (links, etc.)
          kickCluster(clusters[hoverN], 9); // particle glyphs burst apart
          const [x, y] = nodePos(hoverN, performance.now());
          ripples.push({ x, y, r: 10 * DPR, max: 70 * DPR, a: 0.9 });
          for (let i = 0; i < 7; i++)
            pulses.push({ n: hoverN, t: -i * 0.06, out: false, speed: 0.012 + Math.random() * 0.008 });
          excite(0.15);
          onActivate(node);
        }
      } else if (hoverCore) {
        if (path.length > 1) backOut();
        else {
          nodes.forEach((_, n) =>
            pulses.push({ n, t: 0, out: true, speed: 0.01 + Math.random() * 0.006 })
          );
          ripples.push({ x: ox(), y: oy(), r: 20 * DPR, max: 230 * DPR, a: 1 });
          excite(0.3);
        }
      }
    }
  }
  function onPointerLeave(e) {
    if (e.pointerType === 'touch') return; // keep the tapped card visible
    mouseX = -1e4;
    mouseY = -1e4;
  }
  function onPointerCancel() {
    // browser claimed the gesture (e.g. page scroll on touch)
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
  function drawCore3D(t) {
    if (!dragging) {
      uRX += vRX;
      uRY += vRY;
      vRX *= 0.96;
      vRY *= 0.96;
    }
    const root = path.length <= 1;
    const beat = Math.sin(phase / 420);
    // the main brain runs larger; sub-brains keep the original scale
    const breath = (1 + (0.035 + 0.11 * activity) * beat) * (root ? 1.3 : 1);

    cx.lineCap = 'round';
    const ringSet = root ? RINGS.concat(ROOT_RINGS) : RINGS;
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
        const [sx2, sy2, z] = project(p, r.R * breath);
        const alpha = (0.1 + 0.3 * (z + 1) / 2) * (0.7 + 0.6 * activity) * graphAlpha;
        if (prev) {
          cx.strokeStyle = `rgba(${CYAN},${alpha})`;
          cx.lineWidth = (0.7 + 0.7 * (z + 1) / 2) * DPR;
          cx.beginPath();
          cx.moveTo(prev[0], prev[1]);
          cx.lineTo(sx2, sy2);
          cx.stroke();
        }
        prev = [sx2, sy2];
      }
      if (root) {
        // bright beads travelling each ring
        for (let k = 0; k < 2; k++) {
          const a = spin * 36 + (k * Math.PI) + Math.sin(t / 2300 + k) * 0.3;
          const p = rot3(
            [Math.cos(a), Math.sin(a), 0],
            r.tiltX + uRX,
            r.tiltY + spin + uRY,
            spin * 0.7
          );
          const [bx, by, bz] = project(p, r.R * breath);
          const depth = (bz + 1) / 2;
          cx.fillStyle = `rgba(255,255,255,${(0.35 + 0.6 * depth) * graphAlpha})`;
          cx.shadowColor = `rgba(${CYAN},0.9)`;
          cx.shadowBlur = 10 * DPR * depth;
          cx.beginPath();
          cx.arc(bx, by, (0.9 + 1.3 * depth) * DPR, 0, 7);
          cx.fill();
          cx.shadowBlur = 0;
        }
      }
    }

    const shellSet = root ? SHELLS.concat([GEO_SHELL]) : SHELLS;
    for (const sh of shellSet) {
      const rx = phase * sh.sx + uRX,
        ry = phase * sh.sy + uRY,
        rz = phase * sh.sz;
      sh.proj = sh.verts.map(v => project(rot3(v, rx, ry, rz), sh.R * breath));
      for (const [i, j] of sh.edges) {
        const a = sh.proj[i],
          b = sh.proj[j];
        const depth = ((a[2] + b[2]) / 2 + 1) / 2;
        cx.strokeStyle = `rgba(${CYAN},${sh.alpha * (0.15 + 0.75 * depth) * (0.75 + 0.45 * activity) * graphAlpha})`;
        cx.lineWidth = sh.width * (0.5 + 0.8 * depth) * DPR;
        cx.beginPath();
        cx.moveTo(a[0], a[1]);
        cx.lineTo(b[0], b[1]);
        cx.stroke();
      }
      if (sh.dots) {
        for (const p of sh.proj) {
          const depth = (p[2] + 1) / 2;
          cx.fillStyle = `rgba(255,255,255,${(0.25 + 0.7 * depth) * graphAlpha})`;
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
    if (root) {
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
        const fade = Math.sin(ax.life * Math.PI); // ease in, ease out
        const g = cx.createLinearGradient(pa[0], pa[1], pb[0], pb[1]);
        g.addColorStop(0, `rgba(${CYAN},${0.34 * fade * graphAlpha})`);
        g.addColorStop(1, `rgba(${CYAN},${0.05 * fade * graphAlpha})`);
        cx.strokeStyle = g;
        cx.lineWidth = 0.8 * DPR;
        cx.beginPath();
        cx.moveTo(pa[0], pa[1]);
        cx.lineTo(pb[0], pb[1]);
        cx.stroke();
      }
    } else if (axons.length) {
      axons.length = 0;
    }

    for (let i = synapses.length - 1; i >= 0; i--) {
      const s = synapses[i];
      s.life -= 0.045;
      if (s.life <= 0) {
        synapses.splice(i, 1);
        continue;
      }
      const sh = SHELLS[s.sh];
      if (!sh.proj) continue;
      const [i1, i2] = sh.edges[s.e];
      const a = sh.proj[i1],
        b = sh.proj[i2];
      const col = s.life > 0.55 ? '255,255,255' : AMBER;
      cx.strokeStyle = `rgba(${col},${s.life * graphAlpha})`;
      cx.lineWidth = (1.2 + 1.8 * s.life) * DPR;
      cx.shadowColor = `rgb(${AMBER})`;
      cx.shadowBlur = 14 * DPR * s.life;
      cx.beginPath();
      cx.moveTo(a[0], a[1]);
      cx.lineTo(b[0], b[1]);
      cx.stroke();
      cx.shadowBlur = 0;
    }

    const flick = 0.7 + 0.3 * Math.sin(t / (95 - 70 * activity));
    cx.fillStyle = `rgba(255,255,255,${flick * graphAlpha})`;
    cx.shadowColor = activity > 0.4 ? `rgb(${AMBER})` : `rgb(${CYAN})`;
    cx.shadowBlur = (26 + 26 * activity) * DPR;
    cx.beginPath();
    cx.arc(ox(), oy(), (3 + 3.5 * activity) * DPR * breath * Math.max(0.4, zoom), 0, 7);
    cx.fill();
    cx.shadowBlur = 0;
  }

  function draw(t) {
    if (disposed) return;
    rafId = requestAnimationFrame(draw);
    if (!running) return;

    const dt = Math.min(60, lastT ? t - lastT : 16);
    lastT = t;
    activity = Math.max(0.08, activity * Math.pow(0.99965, dt));
    phase += dt * (0.45 + activity * 2.6);
    if (Math.random() < 0.004 + activity * 0.1) spawnPulse();
    if (Math.random() < activity * 0.18) fireSynapse();

    // transition timeline
    if (trans) {
      trans.t += dt;
      const k = Math.min(1, trans.t / trans.dur);
      const e = trans.mode === 'out' ? easeOutBack(k) : easeInOutCubic(k);
      zoom = trans.fromZoom + (trans.toZoom - trans.fromZoom) * e;
      panX = trans.fromPanX + (trans.toPanX - trans.fromPanX) * e;
      panY = trans.fromPanY + (trans.toPanY - trans.fromPanY) * e;
      graphAlpha = trans.mode === 'in' ? 1 - easeInOutCubic(k) : Math.min(1, 0.25 + easeInOutCubic(k));
      if (k >= 1) {
        const next = trans.next;
        trans = null;
        if (next) {
          flashA = 0.55;
          next();
          emerge();
        } else {
          graphAlpha = 1;
        }
      }
    } else {
      graphAlpha = 1;
    }

    cx.clearRect(0, 0, W, H);

    // edges node -> core
    cx.lineWidth = 1 * DPR;
    for (let i = 0; i < nodes.length; i++) {
      const [x, y] = nodePos(i, t);
      const g = cx.createLinearGradient(x, y, ox(), oy());
      g.addColorStop(0, `rgba(${CYAN},${0.28 * graphAlpha})`);
      g.addColorStop(1, `rgba(${CYAN},${0.04 * graphAlpha})`);
      cx.strokeStyle = g;
      cx.beginPath();
      cx.moveTo(x, y);
      cx.quadraticCurveTo((x + ox()) / 2, (y + oy()) / 2 + 30 * DPR, ox(), oy());
      cx.stroke();
    }

    // orbiting skill logos: the half behind the core renders first
    const orbProj = projectOrbiters(t);
    drawOrbiters(orbProj.back);

    // hover detection (disabled mid-transition)
    const prevHover = hoverN;
    hoverN = null;
    if (!trans) {
      for (let i = 0; i < nodes.length; i++) {
        const [x, y] = nodePos(i, t);
        const radius = clusters[i] ? 54 : 36; // particle glyphs are larger
        if (Math.hypot(mouseX - x, mouseY - y) < radius * DPR) {
          hoverN = i;
          break;
        }
      }
    }
    hoverCore =
      !trans && hoverN === null &&
      Math.hypot(mouseX - ox(), mouseY - oy()) < 120 * DPR * zoom;
    // pointer cursor only when a click actually does something
    const hoverActionable =
      hoverN !== null &&
      (nodes[hoverN].href || (nodes[hoverN].children && nodes[hoverN].children.length));
    canvas.classList.toggle('hovering', !!hoverActionable || hoverCore);
    if (hoverN !== prevHover) {
      if (hoverN !== null) {
        const [x, y] = nodePos(hoverN, t);
        onHover(nodes[hoverN], x / DPR, y / DPR);
      } else {
        onHover(null, 0, 0);
      }
    } else if (hoverN !== null) {
      const [x, y] = nodePos(hoverN, t);
      onHover(nodes[hoverN], x / DPR, y / DPR, true);
    }

    // ripples
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

    // pulses
    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i];
      p.t += p.speed;
      if (p.t >= 1 || p.n >= nodes.length) {
        pulses.splice(i, 1);
        continue;
      }
      if (p.t <= 0) continue;
      const [nx, ny] = nodePos(p.n, t);
      const k = p.out ? p.t : 1 - p.t;
      const mx = (nx + ox()) / 2,
        my = (ny + oy()) / 2 + 30 * DPR;
      const a = 1 - k;
      const px = a * a * nx + 2 * a * k * mx + k * k * ox();
      const py = a * a * ny + 2 * a * k * my + k * k * oy();
      const col = p.out ? AMBER : CYAN;
      cx.fillStyle = `rgba(${col},${0.95 * graphAlpha})`;
      cx.shadowColor = `rgb(${col})`;
      cx.shadowBlur = 12 * DPR;
      cx.beginPath();
      cx.arc(px, py, 2.4 * DPR, 0, 7);
      cx.fill();
      cx.shadowBlur = 0;
    }

    // nodes
    cx.textAlign = 'center';
    const isRoot = path.length <= 1;
    const labelPx = isRoot ? 14.5 : 11; // main-brain labels read larger
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const hot = i === hoverN;
      const [x, y] = nodePos(i, t);
      let labelLift = isRoot ? 21 : 16;
      // particle-glyph nodes render as an igloo-style swarm instead of a dot
      if (clusters[i] && drawCluster(clusters[i], i, x, y, t, hot)) {
        labelLift = 52;
      } else {
        const ringPulse = (1 + Math.sin(t / 600 + i * 5) * 0.18) * (hot ? 1.7 : 1);
        cx.strokeStyle = hot ? `rgba(${AMBER},${0.95 * graphAlpha})` : `rgba(${CYAN},${0.85 * graphAlpha})`;
        cx.lineWidth = (hot ? 2 : 1.4) * DPR;
        cx.beginPath();
        cx.arc(x, y, 7 * DPR * ringPulse, 0, 7);
        cx.stroke();
        cx.fillStyle = hot ? `rgba(${AMBER},${graphAlpha})` : `rgba(${CYAN},${0.95 * graphAlpha})`;
        cx.beginPath();
        cx.arc(x, y, (hot ? 3.6 : 2.6) * DPR, 0, 7);
        cx.fill();
      }

      cx.fillStyle = `rgba(255,255,255,${graphAlpha})`;
      cx.font = `600 ${labelPx * DPR}px Consolas, monospace`;
      cx.shadowColor = hot ? `rgb(${AMBER})` : `rgba(${CYAN},0.9)`;
      cx.shadowBlur = (hot ? 16 : 10) * DPR;
      // clamp so long labels on edge nodes stay on-canvas
      const lw = cx.measureText(n.label).width / 2;
      cx.fillText(
        n.label,
        Math.max(lw + 4 * DPR, Math.min(W - lw - 4 * DPR, x)),
        y - labelLift * DPR
      );
      cx.shadowBlur = 0;
    }

    drawCore3D(t);
    drawOrbiters(orbProj.front);

    // core glow
    const gr = (120 + 88 * activity) * DPR * Math.max(0.5, zoom);
    const glow = cx.createRadialGradient(ox(), oy(), 0, ox(), oy(), gr);
    const gp = (0.08 + 0.04 * Math.sin(t / 800) + 0.22 * activity) * graphAlpha;
    glow.addColorStop(0, `rgba(${CYAN},${gp})`);
    glow.addColorStop(1, 'transparent');
    cx.fillStyle = glow;
    cx.fillRect(ox() - gr, oy() - gr, gr * 2, gr * 2);

    // dive flash
    if (flashA > 0.01) {
      const f = cx.createRadialGradient(ox(), oy(), 0, ox(), oy(), Math.max(W, H) * 0.7);
      f.addColorStop(0, `rgba(255,255,255,${flashA})`);
      f.addColorStop(0.35, `rgba(${CYAN},${flashA * 0.5})`);
      f.addColorStop(1, 'transparent');
      cx.fillStyle = f;
      cx.fillRect(0, 0, W, H);
      flashA *= 0.9;
    }
  }
  rafId = requestAnimationFrame(draw);

  // only animate while visible
  const io = new IntersectionObserver(
    entries => {
      running = entries[0].isIntersecting;
      lastT = 0;
    },
    { threshold: 0.05 }
  );
  io.observe(canvas);

  return {
    setGraph(graph) {
      root = graph;
      applyView(root, [root]);
      wakeSurge();
    },
    back: backOut,
    dispose() {
      disposed = true;
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
