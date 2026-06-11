/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { LANG_META } from '../../constants/projects';
import { BranchIcon, SyncIcon, ErrorIcon, WarnIcon, BellIcon } from './icons';

/*
  The strip every developer's eye lands on. Mostly honest: the clock is
  real, the language follows the open file, and there really are zero
  errors.
*/
const StatusBar = ({ project }) => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(iv);
  }, []);

  const lang = project ? LANG_META[project.lang] : LANG_META.md;
  const ln = project ? 8 + project.tech.length * 3 : 12;
  const col = project ? project.title.length : 42;
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');

  return (
    <div className="flex items-center h-[20px] @3xl:h-[22px] shrink-0 bg-[#0b2231] border-t border-[#16314a] text-[9px] @3xl:text-[10px] text-[#9fdcef] select-none overflow-hidden">
      <span className="flex items-center h-full px-2 bg-[#4be8ff] text-[#04121c] font-bold gap-1">
        ⚡ muha-os
      </span>
      <span className="flex items-center gap-1 px-2 hover:bg-white/10 h-full">
        <BranchIcon size={10} />
        master*
      </span>
      <span className="hidden @3xl:flex items-center px-1.5 hover:bg-white/10 h-full">
        <SyncIcon size={10} />
      </span>
      <span className="flex items-center gap-1 px-2 hover:bg-white/10 h-full">
        <ErrorIcon size={10} /> 0
        <WarnIcon size={10} className="ml-1" /> 0
      </span>

      <span className="ml-auto hidden @3xl:flex items-center px-2 hover:bg-white/10 h-full">
        Ln {ln}, Col {col}
      </span>
      <span className="hidden @5xl:flex items-center px-2 hover:bg-white/10 h-full">
        Spaces: 2
      </span>
      <span className="hidden @5xl:flex items-center px-2 hover:bg-white/10 h-full">
        UTF-8
      </span>
      <span
        className="flex items-center px-2 hover:bg-white/10 h-full font-semibold ml-auto @3xl:ml-0"
        style={{ color: lang?.color }}
      >
        {lang?.label}
      </span>
      <span className="hidden @3xl:flex items-center gap-1 px-2 hover:bg-white/10 h-full">
        ✓ Prettier
      </span>
      <span className="flex items-center px-2 h-full font-mono">
        {hh}:{mm}
      </span>
      <span className="flex items-center px-2 hover:bg-white/10 h-full">
        <BellIcon size={10} />
      </span>
    </div>
  );
};

export default StatusBar;
