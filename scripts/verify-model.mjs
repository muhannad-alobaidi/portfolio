/*
  Guards the asset pipeline against silently breaking the scene.

  Muha2.jsx is 11k lines of gltfjsx output that reaches into the loaded model by
  name (`nodes.Cube011_Material010_0`, `materials['Material.074']`). gltfpack can
  merge or rename things, so every optimization pass has to be checked against
  the names the JSX still expects — a miss is a white screen at runtime, not a
  build error.

  Compares the optimized model against the original and reports any name the JSX
  references that the original had but the optimized file lost.

  Usage: node scripts/verify-model.mjs <original.glb> <optimized.glb> <...jsx>
*/
import { readFile } from 'node:fs/promises';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';

const sanitize = name => name.replace(/\s/g, '_').replace(/[[\].:/]/g, '');

const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.decoder': MeshoptDecoder });

// three.js exposes objects under sanitized node names, de-duplicated the way
// GLTFLoader.createUniqueName does — a second "mixamorigHips" becomes
// "mixamorigHips_1", and gltfjsx emitted those suffixed names verbatim.
// gltfjsx also reaches meshes by mesh name, so accept either form.
async function namesOf(path) {
  const root = (await io.read(path)).getRoot();
  const nodes = new Set();
  const used = Object.create(null);
  const unique = raw => {
    const s = sanitize(raw ?? '');
    if (s in used) return `${s}_${++used[s]}`;
    used[s] = 0;
    return s;
  };

  // names that resolve to something carrying geometry — the JSX uses these as
  // `nodes.X.geometry`, so a name that survives but now points at a Group is
  // just as fatal as one that disappeared. gltfpack does exactly that when it
  // quantizes positions, and checking mere presence missed it.
  const geometry = new Set();

  for (const n of root.listNodes()) {
    const name = unique(n.getName());
    nodes.add(name);
    if (n.getMesh()) geometry.add(name);
  }
  for (const m of root.listMeshes()) if (m.getName()) nodes.add(sanitize(m.getName()));

  // material names reach three.js unsanitized
  const materials = new Set(root.listMaterials().map(m => m.getName()).filter(Boolean));
  return { nodes, materials, geometry };
}

const [, , origPath, optPath, ...jsxPaths] = process.argv;

const referenced = { nodes: new Set(), materials: new Set(), geometry: new Set() };
for (const p of jsxPaths) {
  const src = await readFile(p, 'utf8');
  for (const m of src.matchAll(/nodes\.([A-Za-z0-9_$]+)/g)) referenced.nodes.add(m[1]);
  for (const m of src.matchAll(/nodes\[['"]([^'"]+)['"]\]/g)) referenced.nodes.add(m[1]);
  for (const m of src.matchAll(/materials\.([A-Za-z0-9_$]+)/g)) referenced.materials.add(m[1]);
  for (const m of src.matchAll(/materials\[['"]([^'"]+)['"]\]/g)) referenced.materials.add(m[1]);
  // the subset dereferenced as .geometry / .skeleton, which must be real meshes
  for (const m of src.matchAll(/nodes\.([A-Za-z0-9_$]+)\.(?:geometry|skeleton)/g))
    referenced.geometry.add(m[1]);
}

const orig = await namesOf(origPath);
const opt = await namesOf(optPath);

let failed = false;
for (const kind of ['nodes', 'materials', 'geometry']) {
  // names the JSX wants, that the source model could satisfy
  const expected = [...referenced[kind]].filter(n => orig[kind].has(n));
  const lost = expected.filter(n => !opt[kind].has(n));
  // referenced but absent from the ORIGINAL too — pre-existing dead references,
  // or meshes this pipeline intentionally stripped. Reported, never fatal.
  const preexisting = [...referenced[kind]].filter(n => !orig[kind].has(n));

  console.log(
    `${kind}: ${referenced[kind].size} referenced, ${expected.length} resolvable in source, ${lost.length} lost by optimization`
  );
  if (preexisting.length) {
    console.log(`  (${preexisting.length} referenced name(s) absent from the source model too)`);
  }
  if (lost.length) {
    failed = true;
    console.error(`  FAIL — optimization dropped ${lost.length} ${kind} the JSX uses:`);
    for (const n of lost.slice(0, 30)) console.error(`      ${n}`);
    if (lost.length > 30) console.error(`      ... and ${lost.length - 30} more`);
  }
}

if (failed) process.exit(1);
console.log('OK — every name the JSX resolves in the source model survives optimization.');
