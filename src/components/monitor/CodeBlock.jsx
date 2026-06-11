/* eslint-disable react/prop-types */
import { useMemo } from 'react';
import { genSource } from './codeGen';
import { LANG_META } from '../../constants/projects';

const TOKEN_COLOR = {
  kw: 'text-[#c792ea]',
  str: 'text-[#9ece8c]',
  prop: 'text-[#82b6ff]',
  fn: 'text-[#4be8ff]',
  cm: 'text-[#4d6078] italic',
  pn: 'text-[#6e7f9b]',
  id: 'text-[#cdd9ec]',
  num: 'text-[#f2987b]',
  tag: 'text-[#ff7ab8]',
  type: 'text-[#7fd6c2]',
};

/*
  The "source file" of a project — generated from its data, with line
  numbers and a cascading reveal. Key on project.id so the animation
  replays when switching files.
*/
const CodeBlock = ({ project }) => {
  const lines = useMemo(() => genSource(project), [project]);

  return (
    <div className="font-mono text-[10px] @3xl:text-[11.5px] leading-[1.75]">
      <div className="flex items-center px-3 py-1.5 border-b border-[#1b2a42] text-[9px] @3xl:text-[10px] text-[#46587a] sticky top-0 bg-[#0b1120] z-10">
        <span className="truncate">
          {project.folder ? `${project.folder}/` : ''}
          {project.file}
        </span>
        <span className="ml-auto shrink-0" style={{ color: LANG_META[project.lang]?.color }}>
          {LANG_META[project.lang]?.label}
        </span>
      </div>
      <div className="py-2 pr-3">
        {lines.map((ln, i) => (
          <div
            key={`${project.id}-${i}`}
            className="flex code-line"
            style={{ animationDelay: `${Math.min(i * 22, 700)}ms` }}
          >
            <span className="w-8 @3xl:w-10 pr-2.5 text-right select-none text-[#2c3b58] shrink-0">
              {i + 1}
            </span>
            <span className="whitespace-pre-wrap break-words min-w-0">
              {ln.length === 0
                ? ' '
                : ln.map((tk, j) => (
                    <span key={j} className={TOKEN_COLOR[tk.c] || TOKEN_COLOR.id}>
                      {tk.x}
                    </span>
                  ))}
            </span>
          </div>
        ))}
        <div className="flex">
          <span className="w-8 @3xl:w-10 pr-2.5 text-right select-none text-[#2c3b58] shrink-0">
            {lines.length + 1}
          </span>
          <span className="inline-block w-[6px] h-[13px] mt-[3px] bg-[#4be8ff] caret-blink" />
        </div>
      </div>
    </div>
  );
};

export default CodeBlock;
