import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';

const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
const doc = await io.read(process.argv[2]);
const root = doc.getRoot();

console.log('nodes:     ', root.listNodes().length);
console.log('meshes:    ', root.listMeshes().length);
console.log('materials: ', root.listMaterials().length);
console.log('textures:  ', root.listTextures().length);
console.log('animations:', root.listAnimations().map(a => `${a.getName()} (${a.listChannels().length} ch)`));

const nodeNames = new Set(root.listNodes().map(n => n.getName()));
for (const probe of process.argv.slice(3)) {
  console.log(`  ${probe} -> node? ${nodeNames.has(probe)}`);
}
