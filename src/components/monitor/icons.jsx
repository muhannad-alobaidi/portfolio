/* eslint-disable react/prop-types */
/*
  Minimal stroke icons for the fake IDE — kept tiny and dependency-free.
  All take a `size` (px) and inherit currentColor.
*/

const Svg = ({ size = 16, children, ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...rest}
  >
    {children}
  </svg>
);

export const FilesIcon = p => (
  <Svg {...p}>
    <path d="M14 3H7a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7z" />
    <path d="M14 3v4h4" />
    <path d="M9 3V2" opacity="0" />
  </Svg>
);

export const SearchIcon = p => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M16 16l4.5 4.5" />
  </Svg>
);

export const GitIcon = p => (
  <Svg {...p}>
    <circle cx="6" cy="6" r="2.4" />
    <circle cx="6" cy="18" r="2.4" />
    <circle cx="18" cy="9" r="2.4" />
    <path d="M6 8.4v7.2" />
    <path d="M15.7 10.2C13.5 12 9 12 6.5 15.5" />
  </Svg>
);

export const DebugIcon = p => (
  <Svg {...p}>
    <path d="M8 5l11 7-11 7z" />
  </Svg>
);

export const ExtensionsIcon = p => (
  <Svg {...p}>
    <rect x="4" y="4" width="7" height="7" rx="1" />
    <rect x="13" y="4" width="7" height="7" rx="1" />
    <rect x="4" y="13" width="7" height="7" rx="1" />
    <rect x="13" y="13" width="7" height="7" rx="1" opacity="0.45" />
  </Svg>
);

export const AccountIcon = p => (
  <Svg {...p}>
    <circle cx="12" cy="8.5" r="3.6" />
    <path d="M5 20a7 7 0 0 1 14 0" />
  </Svg>
);

export const GearIcon = p => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7" />
  </Svg>
);

export const ChevronIcon = ({ open, size = 12, ...rest }) => (
  <Svg
    size={size}
    style={{
      transform: open ? 'rotate(90deg)' : 'none',
      transition: 'transform 0.15s',
    }}
    {...rest}
  >
    <path d="M9 5l8 7-8 7" />
  </Svg>
);

export const CloseIcon = p => (
  <Svg {...p}>
    <path d="M5 5l14 14M19 5L5 19" />
  </Svg>
);

export const BranchIcon = p => (
  <Svg {...p}>
    <circle cx="7" cy="5.5" r="2.2" />
    <circle cx="7" cy="18.5" r="2.2" />
    <circle cx="17" cy="8" r="2.2" />
    <path d="M7 7.7v8.6" />
    <path d="M17 10.2c0 3.3-4.5 3.3-7.5 5" />
  </Svg>
);

export const SyncIcon = p => (
  <Svg {...p}>
    <path d="M20 5v5h-5" />
    <path d="M4 19v-5h5" />
    <path d="M19.5 10a8 8 0 0 0-14.2-3M4.5 14a8 8 0 0 0 14.2 3" />
  </Svg>
);

export const ErrorIcon = p => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M9 9l6 6M15 9l-6 6" />
  </Svg>
);

export const WarnIcon = p => (
  <Svg {...p}>
    <path d="M12 4L2.8 20h18.4z" />
    <path d="M12 10v4M12 17.2v.3" />
  </Svg>
);

export const TerminalIcon = p => (
  <Svg {...p}>
    <path d="M4 6l6 6-6 6" />
    <path d="M12 19h8" />
  </Svg>
);

export const SplitIcon = p => (
  <Svg {...p}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="1.5" />
    <path d="M12 4.5v15" />
  </Svg>
);

export const TrashIcon = p => (
  <Svg {...p}>
    <path d="M4 7h16M9 7V5h6v2M7 7l1 13h8l1-13" />
  </Svg>
);

export const BellIcon = p => (
  <Svg {...p}>
    <path d="M12 4a6 6 0 0 1 6 6v4l2 3H4l2-3v-4a6 6 0 0 1 6-6z" />
    <path d="M10.5 20a1.8 1.8 0 0 0 3 0" />
  </Svg>
);

export const LockIcon = p => (
  <Svg {...p}>
    <rect x="5.5" y="11" width="13" height="9" rx="1.5" />
    <path d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3" />
  </Svg>
);

export const ExternalIcon = p => (
  <Svg {...p}>
    <path d="M14 4h6v6" />
    <path d="M20 4L11 13" />
    <path d="M19 13v6H5V5h6" />
  </Svg>
);

export const CodeIcon = p => (
  <Svg {...p}>
    <path d="M8 6l-6 6 6 6M16 6l6 6-6 6" />
  </Svg>
);
