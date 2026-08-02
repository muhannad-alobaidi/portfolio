/*
  Keeps Muha2.jsx in sync with the stripped model.

  strip-model.mjs removes the PC tower and desk slab from muha.glb, but the
  gltfjsx output still reaches for `nodes.<removed>.geometry`, which throws at
  runtime. This drops the matching JSX elements, and while walking the tree also
  strips castShadow/receiveShadow — no light in Computers.jsx casts shadows, so
  708 meshes were paying shadow-map bookkeeping for nothing.

  Wrapper groups left empty are removed too, but never when the name is an
  animation target: the rig drives nodes by name, and deleting one silently
  breaks the typing animation.

  Usage: node scripts/codemod-muha.mjs <removed.json> <animated.json> <file.jsx>
*/
import { readFile, writeFile } from 'node:fs/promises';
import { parse } from '@babel/parser';
import _traverse from '@babel/traverse';
import _generate from '@babel/generator';
import { format, resolveConfig } from 'prettier';

const traverse = _traverse.default ?? _traverse;
const generate = _generate.default ?? _generate;

const [, , removedPath, animatedPath, filePath] = process.argv;

const removed = new Set(JSON.parse(await readFile(removedPath, 'utf8')));
const animated = new Set(JSON.parse(await readFile(animatedPath, 'utf8')));
const src = await readFile(filePath, 'utf8');

const ast = parse(src, { sourceType: 'module', plugins: ['jsx'] });

const tagOf = el => el.openingElement?.name?.name;
const attrValue = (el, key) => {
  const attr = el.openingElement.attributes.find(
    a => a.type === 'JSXAttribute' && a.name.name === key
  );
  return attr?.value?.type === 'StringLiteral' ? attr.value.value : undefined;
};

const stats = { meshes: 0, shadowFlags: 0, groups: 0 };
// groups that held a removed mesh — the only ones pass 2 is allowed to sweep
const candidateWrappers = new Set();

// 1. drop meshes whose geometry no longer exists, and shadow flags on the rest
traverse(ast, {
  JSXElement(path) {
    const tag = tagOf(path.node);
    if (tag !== 'mesh' && tag !== 'skinnedMesh') return;

    const name = attrValue(path.node, 'name');
    if (name && removed.has(name)) {
      stats.meshes++;
      const parent = path.parentPath;
      if (parent.isJSXElement() && tagOf(parent.node) === 'group') {
        candidateWrappers.add(parent.node);
      }
      path.remove();
      return;
    }

    const attrs = path.node.openingElement.attributes;
    const kept = attrs.filter(
      a =>
        !(
          a.type === 'JSXAttribute' &&
          (a.name.name === 'castShadow' || a.name.name === 'receiveShadow')
        )
    );
    stats.shadowFlags += attrs.length - kept.length;
    path.node.openingElement.attributes = kept;
  },
});

// 2. sweep the wrapper groups those removals emptied.
//    Scoped deliberately to groups that held a removed mesh: leaf skeleton
//    bones are also childless <group>s, and deleting one breaks the rig.
const isBlank = n =>
  n.type === 'JSXText' ? n.value.trim() === '' : n.type === 'JSXExpressionContainer' && !n.expression;

const emptied = new Set(
  [...candidateWrappers].filter(el => !el.children.some(c => !isBlank(c)))
);

if (emptied.size) {
  traverse(ast, {
    JSXElement(path) {
      if (!emptied.has(path.node)) return;

      const name = attrValue(path.node, 'name');
      // an animation channel drives this node by name — keep it
      if (name && animated.has(name)) return;
      // never touch rig nodes, whatever emptied them
      if (name?.startsWith('mixamorig')) return;
      // anything the component wires up itself (refs, spreads) stays
      const hasCode = path.node.openingElement.attributes.some(
        a => a.type === 'JSXSpreadAttribute' || a.name?.name === 'ref'
      );
      if (hasCode) return;

      stats.groups++;
      path.remove();
    },
  });
}

// babel's printer ignores project style, so hand the result to prettier —
// this file is generated output but still gets read by humans
const out = generate(ast, { retainLines: false, jsescOption: { minimal: true } }, src);
const formatted = await format(out.code, {
  ...(await resolveConfig(filePath)),
  filepath: filePath,
});
await writeFile(filePath, formatted);

console.log(`  removed ${stats.meshes} mesh element(s)`);
console.log(`  removed ${stats.groups} empty group(s)`);
console.log(`  removed ${stats.shadowFlags} castShadow/receiveShadow flag(s)`);
console.log(`  ${src.split('\n').length} -> ${out.code.split('\n').length} lines`);
