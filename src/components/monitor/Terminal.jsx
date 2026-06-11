/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react';
import { PROJECTS, FOLDERS, projectsInFolder, rootProjects, matchProject, LANG_META } from '../../constants/projects';
import { ChevronIcon, TerminalIcon, TrashIcon } from './icons';

/*
  A working terminal. Type `help`. Knows how to open projects, talk
  about me, and power the screen down. Output lines arrive from outside
  too (via `signal`) when a project is opened from the UI.
*/
const SPAN_COLOR = {
  out: 'text-[#aebed6]',
  dim: 'text-[#5d7290]',
  ok: 'text-[#62de8a]',
  err: 'text-[#ff7b88]',
  neon: 'text-[#4be8ff]',
  cmd: 'text-[#e8f2ff]',
  user: 'text-[#62de8a]',
  path: 'text-[#7fb4ff]',
};

const PROMPT = [
  { c: 'user', x: 'muha@workstation' },
  { c: 'dim', x: ':' },
  { c: 'path', x: '~/projects' },
  { c: 'dim', x: '$ ' },
];

const line = spans => ({ spans });
const txt = (c, x) => ({ c, x });

const GREETING = [
  line([...PROMPT, txt('cmd', 'npm run dev')]),
  line([
    txt('neon', '  ➜ '),
    txt('out', 'portfolio ready on '),
    txt('neon', 'http://localhost:5173'),
    txt('dim', ` — ${PROJECTS.length} projects mounted`),
  ]),
  line([
    txt('dim', '  type '),
    txt('ok', 'help'),
    txt('dim', ' for commands — yes, this terminal actually works'),
  ]),
];

const HELP_LINES = [
  ['ls', 'list the projects on this machine'],
  ['open <name>', "open a project tab — try 'open baity-app'"],
  ['cat readme.md', 'back to the welcome tab'],
  ['whoami', 'who is this guy?'],
  ['contact', 'open a channel'],
  ['clear', 'wipe the terminal'],
  ['exit', 'power down the screen'],
].map(([cmd, desc]) =>
  line([txt('ok', `  ${cmd.padEnd(16)}`), txt('dim', desc)])
);

const Terminal = ({ signal, openProject, openReadme, closeUi, defaultCollapsed }) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const userToggled = useRef(false);
  const [lines, setLines] = useState(GREETING);
  const [value, setValue] = useState('');
  const hist = useRef([]);
  const histIdx = useRef(-1);
  const bodyRef = useRef(null);
  const inputRef = useRef(null);
  const exitTimer = useRef(null);

  useEffect(() => {
    if (!userToggled.current) setCollapsed(defaultCollapsed);
  }, [defaultCollapsed]);

  useEffect(() => {
    if (signal) setLines(prev => [...prev, ...signal.lines.map(line)]);
  }, [signal]);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, collapsed]);

  useEffect(() => () => clearTimeout(exitTimer.current), []);

  const print = (...ls) => setLines(prev => [...prev, ...ls]);

  const lsOutput = () => {
    const out = [];
    FOLDERS.forEach(f => {
      out.push(
        line([
          txt('path', `  ${`${f}/`.padEnd(18)}`),
          ...projectsInFolder(f).flatMap(p => [
            { x: p.file, color: LANG_META[p.lang]?.color },
            txt('dim', '  '),
          ]),
        ])
      );
    });
    out.push(
      line([
        txt('path', `  ${'./'.padEnd(18)}`),
        ...rootProjects.flatMap(p => [
          { x: p.file, color: LANG_META[p.lang]?.color },
          txt('dim', '  '),
        ]),
        { x: 'README.md', color: LANG_META.md.color },
      ])
    );
    return out;
  };

  const run = raw => {
    const input = raw.trim();
    print(line([...PROMPT, txt('cmd', input)]));
    if (!input) return;

    hist.current = [input, ...hist.current.slice(0, 30)];
    histIdx.current = -1;

    const [cmd, ...rest] = input.split(/\s+/);
    const arg = rest.join(' ');

    switch (cmd.toLowerCase()) {
      case 'help':
        print(...HELP_LINES);
        break;
      case 'ls':
        print(...lsOutput());
        break;
      case 'open':
      case 'code': {
        if (arg.toLowerCase() === 'readme.md') {
          openReadme();
          print(line([txt('ok', '  ✓ '), txt('out', 'opened README.md')]));
          break;
        }
        const p = matchProject(arg);
        if (p) {
          openProject(p.id);
          print(
            line([
              txt('ok', '  ✓ '),
              txt('out', `opened ${p.folder ? `${p.folder}/` : ''}${p.file}`),
            ])
          );
        } else {
          print(
            line([
              txt('err', `  ✗ no project matching '${arg}'`),
              txt('dim', " — try 'ls'"),
            ])
          );
        }
        break;
      }
      case 'cat':
        if (arg.toLowerCase() === 'readme.md') {
          openReadme();
          print(line([txt('ok', '  ✓ '), txt('out', 'rendering README.md preview')]));
        } else {
          print(line([txt('err', `  cat: ${arg || '?'}: no such file`)]));
        }
        break;
      case 'whoami':
        print(
          line([
            txt('out', '  muhannad alobaidi — full-stack & mobile developer'),
          ]),
          line([
            txt('dim', '  lead frontend @ '),
            txt('neon', 'Baity'),
            txt('dim', ' · Vue/Nuxt · Flutter · React · AI'),
          ])
        );
        break;
      case 'contact':
        print(
          line([
            txt('dim', '  linkedin  '),
            {
              x: 'linkedin.com/in/muhannad-alobaidi',
              c: 'neon',
              href: 'https://www.linkedin.com/in/muhannad-alobaidi/',
            },
          ]),
          line([
            txt('dim', '  email     '),
            {
              x: 'muhannad.alobaidi@yahoo.com',
              c: 'neon',
              href: 'mailto:muhannad.alobaidi@yahoo.com',
            },
          ])
        );
        break;
      case 'pwd':
        print(line([txt('out', '  /home/muha/projects')]));
        break;
      case 'sudo':
        print(
          line([
            txt('err', '  muha is not in the sudoers file. '),
            txt('dim', 'this incident will be reported.'),
          ])
        );
        break;
      case 'rm':
        print(
          line([
            txt('err', '  permission denied'),
            txt('dim', ' — these projects took years.'),
          ])
        );
        break;
      case 'clear':
        setLines([]);
        break;
      case 'exit':
      case 'shutdown':
      case 'logout':
        print(line([txt('dim', '  logging out…')]));
        exitTimer.current = setTimeout(closeUi, 450);
        break;
      default:
        print(
          line([
            txt('err', `  zsh: command not found: ${cmd}`),
            txt('dim', "  (try 'help')"),
          ])
        );
    }
  };

  const onKeyDown = e => {
    if (e.key === 'Enter') {
      run(value);
      setValue('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(histIdx.current + 1, hist.current.length - 1);
      if (hist.current[next] !== undefined) {
        histIdx.current = next;
        setValue(hist.current[next]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = histIdx.current - 1;
      histIdx.current = Math.max(next, -1);
      setValue(next < 0 ? '' : hist.current[next]);
    }
  };

  const toggle = () => {
    userToggled.current = true;
    setCollapsed(c => !c);
  };

  return (
    <div className="shrink-0 bg-[#070c16] border-t border-[#1b2a42]">
      <div className="flex items-center gap-2 h-6 px-3 select-none">
        <TerminalIcon size={11} className="text-[#5d7290]" />
        <button
          onClick={toggle}
          className="text-[9px] tracking-[2px] text-[#aebed6] border-b border-[#4be8ff] pb-px"
        >
          TERMINAL
        </button>
        <span className="text-[9px] tracking-wider text-[#46587a] hidden @3xl:inline">
          zsh — interactive, really
        </span>
        <div className="ml-auto flex items-center gap-1 text-[#5d7290]">
          <button
            title="clear terminal"
            onClick={() => setLines([])}
            className="w-5 h-5 grid place-items-center rounded hover:bg-white/10"
          >
            <TrashIcon size={11} />
          </button>
          <button
            title={collapsed ? 'expand' : 'collapse'}
            onClick={toggle}
            className="w-5 h-5 grid place-items-center rounded hover:bg-white/10"
          >
            <ChevronIcon open={!collapsed} size={10} />
          </button>
        </div>
      </div>

      {!collapsed && (
        <div
          ref={bodyRef}
          onClick={() => inputRef.current?.focus()}
          className="h-[96px] @3xl:h-[120px] @6xl:h-[140px] overflow-y-auto overscroll-contain hide-scrollbar px-3 pb-2 font-mono text-[9.5px] @3xl:text-[11px] leading-[1.65] cursor-text"
        >
          {lines.map((l, i) => (
            <div key={i} className="whitespace-pre-wrap break-words">
              {l.spans.map((s, j) =>
                s.href ? (
                  <a
                    key={j}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#4be8ff] underline decoration-[#4be8ff]/40 hover:decoration-[#4be8ff]"
                  >
                    {s.x}
                  </a>
                ) : (
                  <span
                    key={j}
                    className={s.color ? undefined : SPAN_COLOR[s.c] || SPAN_COLOR.out}
                    style={s.color ? { color: s.color } : undefined}
                  >
                    {s.x}
                  </span>
                )
              )}
            </div>
          ))}
          <div className="flex items-center">
            <span className="whitespace-pre">
              {PROMPT.map((s, j) => (
                <span key={j} className={SPAN_COLOR[s.c]}>
                  {s.x}
                </span>
              ))}
            </span>
            <input
              ref={inputRef}
              value={value}
              onChange={e => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              spellCheck={false}
              autoComplete="off"
              aria-label="terminal input"
              className="flex-1 min-w-0 bg-transparent outline-none border-none font-mono text-[#e8f2ff] caret-[#4be8ff] placeholder:text-[#33415c]"
              placeholder="help"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Terminal;
