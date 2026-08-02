/*
  Removes geometry the site never shows, before compression runs.

  muha.glb ships the whole PC tower (case + internals) and a desk slab that
  Muha2.jsx immediately sets `visible = false` on, plus a 2MB mixamo clip that
  is never played — all of it downloaded, parsed and uploaded to VRAM to be
  invisible. Dropping it here is worth more than any compression setting.

  Usage: node scripts/strip-model.mjs <in.glb> <out.glb>
*/
import { NodeIO, PropertyType } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune, dedup } from '@gltf-transform/functions';
import { TOWER_HIDDEN, DESK_MESH } from '../src/components/towerHidden.js';

// glTF names carry spaces and dots ("aorus case fans.001_..."); three.js
// sanitizes them before they reach `nodes` (PropertyBinding.sanitizeNodeName),
// which is the form towerHidden.js was written against.
const sanitize = name => name.replace(/\s/g, '_').replace(/[[\].:/]/g, '');

// the clip Muha2.jsx actually plays; every other animation is dead weight
const KEEP_ANIMATION = 'typing';

const [, , inPath, outPath] = process.argv;
if (!inPath || !outPath) {
  console.error('usage: node scripts/strip-model.mjs <in.glb> <out.glb>');
  process.exit(1);
}

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(inPath);
const root = doc.getRoot();

const before = {
  meshes: root.listMeshes().length,
  materials: root.listMaterials().length,
  textures: root.listTextures().length,
};

// 1. drop the nodes whose mesh is one the site hides
const hidden = new Set([...TOWER_HIDDEN, DESK_MESH]);
const matched = new Set();
let dropped = 0;
for (const node of root.listNodes()) {
  const mesh = node.getMesh();
  if (!mesh) continue;
  const name = sanitize(mesh.getName());
  if (!hidden.has(name)) continue;
  matched.add(name);
  node.dispose();
  dropped++;
}

const unmatched = [...hidden].filter(n => !matched.has(n));
if (unmatched.length) {
  console.warn(`  ! ${unmatched.length} hidden name(s) matched no mesh:`);
  for (const n of unmatched) console.warn(`      ${n}`);
}

// 2. drop every animation except the one that plays
let clips = 0;
for (const anim of root.listAnimations()) {
  if (anim.getName() === KEEP_ANIMATION) continue;
  anim.dispose();
  clips++;
}

// 3. sweep everything the removals orphaned.
//    Materials are excluded from dedup on purpose: Muha2.jsx looks them up by
//    name (materials['Wolf3D_Eye.006']), and merging two identical materials
//    drops one of those names, leaving that mesh with an undefined material.
//    The savings would be negligible anyway — the bytes are in accessors.
await doc.transform(
  prune(),
  dedup({
    propertyTypes: [
      PropertyType.ACCESSOR,
      PropertyType.TEXTURE,
      PropertyType.MESH,
      PropertyType.SKIN,
    ],
  })
);

await io.write(outPath, doc);

const after = {
  meshes: root.listMeshes().length,
  materials: root.listMaterials().length,
  textures: root.listTextures().length,
};
console.log(`  dropped ${dropped} node(s), ${clips} animation clip(s)`);
console.log(`  meshes    ${before.meshes} -> ${after.meshes}`);
console.log(`  materials ${before.materials} -> ${after.materials}`);
console.log(`  textures  ${before.textures} -> ${after.textures}`);

// the JSX codemod needs to know exactly what left the model
if (process.env.EMIT_REMOVED) {
  const fs = await import('node:fs/promises');
  await fs.writeFile(process.env.EMIT_REMOVED, JSON.stringify([...matched], null, 2));
}
