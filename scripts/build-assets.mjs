/*
  Rebuilds public/muha/*.glb from the originals in assets-src/.

  The site shipped 61.5MB of raw glTF that expanded to ~368MB of GPU texture
  memory — the reason scene transitions used to stall. This pass strips geometry
  the site hides, then compresses with gltfpack (meshopt geometry + KTX2/BasisU
  textures), which is what makes the workstation scene cheap enough to keep
  resident instead of tearing its WebGL context down on every scroll.

  gltfpack must be the NATIVE build: the npm one has no BasisU, so it silently
  cannot do texture compression. See tools/README.md.

  Usage: npm run assets:models
*/
import { execFileSync } from 'node:child_process';
import { mkdirSync, statSync, existsSync, copyFileSync } from 'node:fs';

const GLTFPACK = 'tools/gltfpack';
const SRC = 'assets-src';
const OUT = 'public/muha';
const CACHE = '.cache/models';

const mb = p => (statSync(p).size / 1024 / 1024).toFixed(1);
const run = (cmd, args) =>
  execFileSync(cmd, args, { stdio: 'inherit', cwd: process.cwd() });

if (!existsSync(GLTFPACK)) {
  console.error(`missing ${GLTFPACK} — see tools/README.md for the download step`);
  process.exit(1);
}

mkdirSync(CACHE, { recursive: true });
mkdirSync(OUT, { recursive: true });

/*
  -kn/-km  keep node and material names: Muha2.jsx reaches into the model by
           name for ~600 nodes, so any renaming is a runtime crash
  -cc      meshopt geometry compression (drei enables the decoder by default)
  -tc/-tu  ETC1S for colour, UASTC for normals — normals band badly under ETC1S
  -tl 1024 cap texture dimensions; the source had 2048s and a 2880x1862
  -vpf     float positions instead of quantized ones. NOT optional: quantized
           positions need a dequantization transform, and gltfpack carries it by
           wrapping each mesh in an extra node — which leaves `nodes.Foo`
           pointing at a Group with no .geometry and takes the whole scene down
           on the first frame. Costs nothing here (identical output size), since
           meshopt still compresses the float data.
  -vtf     float UVs, for the same reason one level up. Quantized UVs are
           compensated with KHR_texture_transform on the *material*, but
           screen.jsx swaps in a material of its own to play the video texture
           on the monitor — which carries no such transform, so the video ends
           up sampled over a fraction of its UV range (it renders as one
           magnified fragment of the recording).
*/
const PACK_FLAGS = [
  '-kn', '-km', '-ke',
  '-cc',
  '-vpf', '-vtf',
  '-tc', 'color,attrib',
  '-tu', 'normal',
  '-tl', '1024',
  '-tj', '8',
];

const models = [
  // muha.glb carries the hidden PC tower + desk slab and a dead mixamo clip
  { name: 'muha.glb', strip: true },
  // desk.glb has nothing hidden — compression only
  { name: 'desk.glb', strip: false },
];

for (const { name, strip } of models) {
  const src = `${SRC}/${name}`;
  const staged = `${CACHE}/${name.replace('.glb', '.stripped.glb')}`;
  const out = `${OUT}/${name}`;

  console.log(`\n${name}  (${mb(src)}MB)`);

  if (strip) {
    process.env.EMIT_REMOVED = `${CACHE}/removed.json`;
    run('node', ['scripts/strip-model.mjs', src, staged]);
    console.log(`  stripped -> ${mb(staged)}MB`);
  } else {
    copyFileSync(src, staged);
  }

  run(GLTFPACK, ['-i', staged, '-o', out, ...PACK_FLAGS]);
  console.log(`  packed   -> ${mb(out)}MB`);
}

console.log('\nverifying JSX name lookups survive...');
run('node', [
  'scripts/verify-model.mjs',
  `${SRC}/muha.glb`,
  `${OUT}/muha.glb`,
  'src/components/Muha2.jsx',
  'src/components/screen.jsx',
]);
