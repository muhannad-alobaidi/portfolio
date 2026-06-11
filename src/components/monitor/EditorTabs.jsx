/* eslint-disable react/prop-types */
import { getProject, LANG_META } from '../../constants/projects';
import { SplitIcon } from './icons';

/*
  Open-file tabs. `tabs` is an ordered list of ids ('readme' or project
  ids); closing the active one falls back to its neighbour.
*/
const Tab = ({ label, lang, active, onSelect, onClose }) => (
  <div
    onClick={onSelect}
    className={`group relative flex items-center gap-1.5 h-full px-2.5 @3xl:px-3 font-mono text-[10px] @3xl:text-[11px] border-r border-[#1b2a42] cursor-pointer whitespace-nowrap select-none ${
      active
        ? 'bg-[#0d1424] text-[#e8f2ff]'
        : 'bg-transparent text-[#5d7290] hover:text-[#aebed6]'
    }`}
  >
    {active && <span className="absolute top-0 left-0 right-0 h-[2px] bg-[#4be8ff]" />}
    <span
      className="w-2 h-2 rounded-[2px] shrink-0"
      style={{ background: LANG_META[lang]?.color || '#5d7290' }}
    />
    <span>{label}</span>
    <button
      onClick={e => {
        e.stopPropagation();
        onClose();
      }}
      title="close tab"
      className={`w-3.5 h-3.5 grid place-items-center rounded-sm text-[11px] leading-none hover:bg-white/10 ${
        active ? 'opacity-60 hover:opacity-100' : 'opacity-0 group-hover:opacity-60'
      }`}
    >
      ×
    </button>
  </div>
);

const EditorTabs = ({ tabs, activeTab, onSelect, onClose }) => {
  return (
    <div className="flex items-stretch h-8 shrink-0 bg-[#0a101d] border-b border-[#1b2a42] overflow-x-auto hide-scrollbar">
      {tabs.map(id => {
        if (id === 'readme') {
          return (
            <Tab
              key={id}
              label="README.md"
              lang="md"
              active={activeTab === id}
              onSelect={() => onSelect(id)}
              onClose={() => onClose(id)}
            />
          );
        }
        const p = getProject(id);
        if (!p) return null;
        return (
          <Tab
            key={id}
            label={p.file}
            lang={p.lang}
            active={activeTab === id}
            onSelect={() => onSelect(id)}
            onClose={() => onClose(id)}
          />
        );
      })}
      <div className="ml-auto hidden @3xl:flex items-center gap-2 px-3 text-[#46587a]">
        <SplitIcon size={13} />
        <span className="text-[12px] leading-none">⋯</span>
      </div>
    </div>
  );
};

export default EditorTabs;
