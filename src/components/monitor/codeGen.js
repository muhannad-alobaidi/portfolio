/*
  Generates plausible source code for each project in its own language —
  what you'd find if the project really were a file on this machine.
  A "source" is an array of lines; a line is an array of tokens
  { c: colorKey, x: text } rendered by CodeBlock.
*/

const t = (c, x) => ({ c, x });
const kw = x => t('kw', x);
const str = x => t('str', `'${x}'`);
const prop = x => t('prop', x);
const fn = x => t('fn', x);
const cm = x => t('cm', x);
const pn = x => t('pn', x);
const id = x => t('id', x);
const num = x => t('num', x);
const type = x => t('type', x);
const tag = x => t('tag', x);

const pascal = s =>
  s
    .split(/[-_ ]/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');

const pathOf = p => `~/projects/${p.folder ? `${p.folder}/` : ''}${p.file}`;

const chunk = (arr, n) => {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
};

/* '  ' + 'a', 'b', 'c' + trailing comma */
const strListLines = (items, indent) =>
  chunk(items, 3).map(group => [
    id(indent),
    ...group.flatMap((s, i) => (i ? [pn(', '), str(s)] : [str(s)])),
    pn(','),
  ]);

const dartSource = p => [
  [cm(`// ${pathOf(p)}`)],
  [cm(`// ${p.blurb}`)],
  [kw('import'), id(' '), str('package:baity/platform.dart'), pn(';')],
  [],
  [
    kw('class'),
    id(' '),
    type(pascal(p.id)),
    id(' '),
    kw('extends'),
    id(' '),
    type('FlutterProject'),
    id(' '),
    pn('{'),
  ],
  [id('  '), fn('@override')],
  [
    id('  '),
    kw('final'),
    id(' '),
    type('String'),
    id(' client '),
    pn('='),
    id(' '),
    str(p.client),
    pn(';'),
  ],
  [id('  '), fn('@override')],
  [
    id('  '),
    kw('final'),
    id(' '),
    type('String'),
    id(' role '),
    pn('='),
    id(' '),
    str(p.role),
    pn(';'),
  ],
  [id('  '), fn('@override')],
  [
    id('  '),
    kw('final'),
    id(' '),
    type('List'),
    pn('<'),
    type('String'),
    pn('>'),
    id(' stack '),
    pn('='),
    id(' '),
    pn('['),
  ],
  ...strListLines(p.tech, '    '),
  [id('  '), pn('];')],
  [],
  [
    id('  '),
    type('Future'),
    pn('<'),
    kw('void'),
    pn('>'),
    id(' '),
    fn('ship'),
    pn('()'),
    id(' '),
    kw('async'),
    id(' '),
    pn('{'),
  ],
  [id('    '), cm(`// ${p.status} · ${p.devHost}`)],
  [
    id('    '),
    kw('await'),
    id(' '),
    fn('deploy'),
    pn('('),
    prop('targets'),
    pn(':'),
    id(' '),
    pn('['),
    type('Platform'),
    pn('.'),
    prop('ios'),
    pn(','),
    id(' '),
    type('Platform'),
    pn('.'),
    prop('android'),
    pn(']'),
    pn(');'),
  ],
  [id('  '), pn('}')],
  [pn('}')],
];

const vueSource = p => [
  [cm(`<!-- ${pathOf(p)} — ${p.blurb} -->`)],
  [tag('<script'), id(' '), prop('setup'), id(' '), prop('lang'), pn('='), str('ts'), tag('>')],
  [
    kw('import'),
    id(' '),
    pn('{'),
    id(' '),
    fn('defineProject'),
    id(' '),
    pn('}'),
    id(' '),
    kw('from'),
    id(' '),
    str('@baity/meta'),
    pn(';'),
  ],
  [],
  [kw('const'), id(' project '), pn('='), id(' '), fn('defineProject'), pn('({')],
  [id('  '), prop('client'), pn(':'), id(' '), str(p.client), pn(',')],
  [id('  '), prop('role'), pn(':'), id(' '), str(p.role), pn(',')],
  [id('  '), prop('year'), pn(':'), id(' '), num(p.year), pn(',')],
  [id('  '), prop('status'), pn(':'), id(' '), str(p.status), pn(',')],
  [id('  '), prop('stack'), pn(':'), id(' '), pn('[')],
  ...strListLines(p.tech, '    '),
  [id('  '), pn('],')],
  [pn('});')],
  [],
  [cm(`// ${p.status} · ${p.devHost}`)],
  [tag('</script>')],
  [],
  [tag('<template>')],
  [
    id('  '),
    tag('<'),
    type(pascal(p.id)),
    id(' '),
    prop(':project'),
    pn('='),
    str('project'),
    id(' '),
    tag('/>'),
  ],
  [tag('</template>')],
];

const phpSource = p => [
  [tag('<?php')],
  [cm(`// ${pathOf(p)}`)],
  [cm(`// ${p.blurb}`)],
  [],
  [id('$project'), id(' '), pn('='), id(' '), pn('[')],
  [id('  '), str('client'), id(' '), pn('=>'), id(' '), str(p.client), pn(',')],
  [id('  '), str('role'), id('   '), pn('=>'), id(' '), str(p.role), pn(',')],
  [id('  '), str('year'), id('   '), pn('=>'), id(' '), num(p.year), pn(',')],
  [id('  '), str('status'), id(' '), pn('=>'), id(' '), str(p.status), pn(',')],
  [id('  '), str('stack'), id('  '), pn('=>'), id(' '), pn('[')],
  ...strListLines(p.tech, '    '),
  [id('  '), pn('],')],
  [pn('];')],
  [],
  [cm(`// ${p.status} · ${p.devHost}`)],
  [
    fn('add_action'),
    pn('('),
    str('init'),
    pn(','),
    id(' '),
    kw('fn'),
    id(' '),
    pn('() =>'),
    id(' '),
    fn('ship'),
    pn('('),
    id('$project'),
    pn('));'),
  ],
];

const reactSource = p => [
  [cm(`// ${pathOf(p)}`)],
  [cm(`// ${p.blurb}`)],
  [
    kw('import'),
    id(' '),
    pn('{'),
    id(' '),
    type('CaseStudy'),
    pn(','),
    id(' '),
    fn('ship'),
    id(' '),
    pn('}'),
    id(' '),
    kw('from'),
    id(' '),
    str('@muha/studio'),
    pn(';'),
  ],
  [],
  [kw('export'), id(' '), kw('const'), id(' project '), pn('='), id(' '), pn('{')],
  [id('  '), prop('client'), pn(':'), id(' '), str(p.client), pn(',')],
  [id('  '), prop('role'), pn(':'), id(' '), str(p.role), pn(',')],
  [id('  '), prop('year'), pn(':'), id(' '), num(p.year), pn(',')],
  [id('  '), prop('status'), pn(':'), id(' '), str(p.status), pn(',')],
  [id('  '), prop('stack'), pn(':'), id(' '), pn('[')],
  ...strListLines(p.tech, '    '),
  [id('  '), pn('],')],
  p.lang === 'tsx'
    ? [pn('}'), id(' '), kw('as'), id(' '), kw('const'), pn(';')]
    : [pn('};')],
  [],
  [cm(`// ${p.status} · ${p.devHost}`)],
  [
    kw('export'),
    id(' '),
    kw('default'),
    id(' '),
    kw('function'),
    id(' '),
    fn(pascal(p.id)),
    pn('()'),
    id(' '),
    pn('{'),
  ],
  [
    id('  '),
    kw('return'),
    id(' '),
    tag('<'),
    type('CaseStudy'),
    id(' '),
    pn('{...'),
    id('project'),
    pn('}'),
    id(' '),
    prop('onLaunch'),
    pn('={'),
    fn('ship'),
    pn('}'),
    id(' '),
    tag('/>'),
    pn(';'),
  ],
  [pn('}')],
];

export const genSource = p => {
  switch (p.lang) {
    case 'dart':
      return dartSource(p);
    case 'vue':
      return vueSource(p);
    case 'php':
      return phpSource(p);
    default:
      return reactSource(p);
  }
};
