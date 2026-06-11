/* eslint-disable react/prop-types */
import {
  FilesIcon,
  SearchIcon,
  GitIcon,
  DebugIcon,
  ExtensionsIcon,
  AccountIcon,
  GearIcon,
} from './icons';
import { PROJECTS } from '../../constants/projects';

/*
  VS Code's icon strip. Only the explorer icon does something; the rest
  are set dressing (with honest tooltips).
*/
const Item = ({ active, onClick, title, badge, children }) => (
  <button
    onClick={onClick}
    title={title}
    className={`relative w-full h-10 grid place-items-center transition-colors ${
      active ? 'text-[#e8f2ff]' : 'text-[#46587a] hover:text-[#9fb2cf]'
    }`}
  >
    {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-[#4be8ff]" />}
    {children}
    {badge ? (
      <span className="absolute right-1.5 bottom-1 min-w-[14px] h-[14px] px-0.5 rounded-full bg-[#4be8ff] text-[#04121c] text-[9px] font-bold grid place-items-center">
        {badge}
      </span>
    ) : null}
  </button>
);

const ActivityBar = ({ explorerOpen, onToggleExplorer }) => {
  return (
    <div className="hidden @3xl:flex flex-col items-center w-10 shrink-0 bg-[#070c16] border-r border-[#1b2a42] py-1">
      <Item active={explorerOpen} onClick={onToggleExplorer} title="explorer">
        <FilesIcon size={17} />
      </Item>
      <Item title="search (everything is already in front of you)">
        <SearchIcon size={17} />
      </Item>
      <Item title="source control" badge={PROJECTS.length}>
        <GitIcon size={17} />
      </Item>
      <Item title="run & debug">
        <DebugIcon size={17} />
      </Item>
      <Item title="extensions">
        <ExtensionsIcon size={17} />
      </Item>
      <div className="mt-auto w-full">
        <Item title="muhannad">
          <AccountIcon size={17} />
        </Item>
        <Item title="settings">
          <GearIcon size={17} />
        </Item>
      </div>
    </div>
  );
};

export default ActivityBar;
