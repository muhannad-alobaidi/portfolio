/*
  Lists every node an animation channel drives, by the sanitized name three.js
  exposes. The Muha2.jsx codemod uses this as a do-not-touch list.

  Usage: node scripts/animated-nodes.mjs <model.glb> <out.json>
*/
import { writeFile } from 'node:fs/promises';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';

const sanitize = name => name.replace(/\s/g, '_').replace(/[[\].:/]/g, '');

const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.decoder': MeshoptDecoder });

const [, , modelPath, outPath] = process.argv;
const root = (await io.read(modelPath)).getRoot();

const names = new Set();
for (const anim of root.listAnimations()) {
  for (const channel of anim.listChannels()) {
    const target = channel.getTargetNode();
    if (target?.getName()) names.add(sanitize(target.getName()));
  }
}

await writeFile(outPath, JSON.stringify([...names], null, 2));
console.log(`  ${names.size} animated node(s) -> ${outPath}`);
