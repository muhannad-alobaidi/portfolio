/* eslint-disable react/prop-types */
import { useState } from 'react';
import { ChevronIcon } from './icons';
import {
  FOLDERS,
  projectsInFolder,
  rootProjects,
  LANG_META,
} from '../../constants/projects';

/*
  The fake filesystem. Every project is a source file in its real
  language; clicking one opens its editor tab.
*/
const LangDot = ({ lang }) => (
  <span
    className="w-2 h-2 rounded-[2px] shrink-0"
    style={{ background: LANG_META[lang]?.color || '#5d7290' }}
  />
);

const FileRow = ({ project, active, onClick, depth = 1 }) => (
  <button
    onClick={onClick}
    className={`relative w-full flex items-center gap-2 py-[3px] pr-2 text-left font-mono text-[11px] leading-tight transition-colors ${
      active
        ? 'bg-[#152540] text-[#e8f2ff]'
        : 'text-[#8298b5] hover:bg-white/[0.04] hover:text-[#cdd9ec]'
    }`}
    style={{ paddingLeft: `${depth * 14 + 8}px` }}
  >
    {active && <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#4be8ff]" />}
    <LangDot lang={project.lang} />
    <span className="truncate">{project.file}</span>
  </button>
);

const Explorer = ({ open, activeTab, openProject, openReadme }) => {
  const [openFolders, setOpenFolders] = useState(() => new Set(FOLDERS));

  if (!open) return null;

  const toggleFolder = f =>
    setOpenFolders(prev => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f);
      else next.add(f);
      return next;
    });

  return (
    <div className="hidden @3xl:flex flex-col w-44 @6xl:w-52 shrink-0 bg-[#0a111f] border-r border-[#1b2a42] select-none">
      <div className="px-3 py-2 text-[9px] tracking-[2px] text-[#5d7290]">
        EXPLORER
      </div>

      <div className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold tracking-wide text-[#aebed6]">
        <ChevronIcon open size={10} />
        <span>PROJECTS</span>
        <span className="ml-auto font-mono text-[9px] text-[#46587a]">
          ~/projects
        </span>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain hide-scrollbar pb-3">
        {FOLDERS.map(folder => {
          const items = projectsInFolder(folder);
          const isOpen = openFolders.has(folder);
          return (
            <div key={folder}>
              <button
                onClick={() => toggleFolder(folder)}
                className="w-full flex items-center gap-1.5 pl-3 pr-2 py-[3px] text-[11px] font-mono text-[#aebed6] hover:bg-white/[0.04]"
              >
                <ChevronIcon open={isOpen} size={10} />
                <span className="text-[#7fb4ff]">{folder}/</span>
                <span className="ml-auto text-[9px] text-[#46587a]">
                  {items.length}
                </span>
              </button>
              {isOpen && (
                <div className="relative">
                  <span className="absolute left-[18px] top-0 bottom-0 w-px bg-[#1b2a42]" />
                  {items.map(p => (
                    <FileRow
                      key={p.id}
                      project={p}
                      depth={2}
                      active={activeTab === p.id}
                      onClick={() => openProject(p.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {rootProjects.map(p => (
          <FileRow
            key={p.id}
            project={p}
            depth={1}
            active={activeTab === p.id}
            onClick={() => openProject(p.id)}
          />
        ))}

        <button
          onClick={openReadme}
          className={`relative w-full flex items-center gap-2 py-[3px] pr-2 pl-[22px] text-left font-mono text-[11px] transition-colors ${
            activeTab === 'readme'
              ? 'bg-[#152540] text-[#e8f2ff]'
              : 'text-[#8298b5] hover:bg-white/[0.04] hover:text-[#cdd9ec]'
          }`}
        >
          {activeTab === 'readme' && (
            <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#4be8ff]" />
          )}
          <LangDot lang="md" />
          <span>README.md</span>
        </button>
      </div>

      <div className="px-3 py-2 border-t border-[#1b2a42] text-[9px] font-mono text-[#46587a]">
        8 repos · all shipped ✓
      </div>
    </div>
  );
};

export default Explorer;
