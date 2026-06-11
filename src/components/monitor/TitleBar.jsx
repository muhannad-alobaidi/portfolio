/* eslint-disable react/prop-types */
import { CloseIcon, GearIcon } from './icons';

const MENU = ['File', 'Edit', 'Selection', 'View', 'Go', 'Run', 'Terminal', 'Help'];

/*
  Window chrome: traffic lights (red actually closes, green toggles the
  explorer), fake menu, and an explicit ✕ on the right for non-mac folks.
*/
const TitleBar = ({ onClose, onToggleExplorer }) => {
  return (
    <div className="relative flex items-center h-7 @3xl:h-8 px-2.5 gap-3 bg-[#070c16] border-b border-[#1b2a42] select-none shrink-0">
      <div className="flex items-center gap-1.5 group/lights">
        <button
          onClick={onClose}
          title="close"
          className="w-2.5 h-2.5 @3xl:w-3 @3xl:h-3 rounded-full bg-[#ff5f57] grid place-items-center text-transparent group-hover/lights:text-black/60 text-[7px] leading-none font-bold"
        >
          ×
        </button>
        <span
          title="minimize (it’s decorative, like most minimize buttons)"
          className="w-2.5 h-2.5 @3xl:w-3 @3xl:h-3 rounded-full bg-[#febc2e] grid place-items-center text-transparent group-hover/lights:text-black/60 text-[7px] leading-none font-bold"
        >
          −
        </span>
        <button
          onClick={onToggleExplorer}
          title="toggle sidebar"
          className="w-2.5 h-2.5 @3xl:w-3 @3xl:h-3 rounded-full bg-[#28c840] grid place-items-center text-transparent group-hover/lights:text-black/60 text-[7px] leading-none font-bold"
        >
          +
        </button>
      </div>

      <nav className="hidden @5xl:flex items-center gap-3 text-[10.5px] text-[#5d7290]">
        {MENU.map(m => (
          <span key={m} className="hover:text-[#cdd9ec] cursor-default">
            {m}
          </span>
        ))}
      </nav>

      <div className="absolute left-1/2 -translate-x-1/2 font-mono text-[9px] @3xl:text-[10.5px] text-[#5d7290] truncate max-w-[40%] pointer-events-none">
        ~/projects — muha-code
      </div>

      <div className="ml-auto flex items-center gap-1 text-[#5d7290]">
        <span className="hidden @3xl:grid w-6 h-6 place-items-center" title="settings">
          <GearIcon size={13} />
        </span>
        <button
          onClick={onClose}
          title="close (Esc)"
          className="w-6 h-6 grid place-items-center rounded hover:bg-[#ff5f57]/80 hover:text-white transition-colors"
        >
          <CloseIcon size={12} />
        </button>
      </div>
    </div>
  );
};

export default TitleBar;
