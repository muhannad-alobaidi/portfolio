import { useEffect, useState } from 'react';

// icons are hand-drawn to match the site's thin neon-outline aesthetic
// (stroke only, no fill) rather than pulling in an icon library for three glyphs
const SECTIONS = [
  {
    id: 'hero',
    label: 'Intro',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 11.5 12 4l9 7.5" />
        <path d="M5.5 10v9a1 1 0 0 0 1 1H9v-5.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1V20h2.5a1 1 0 0 0 1-1v-9" />
      </svg>
    ),
  },
  {
    id: 'model',
    label: 'Workstation',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4.5" width="18" height="12" rx="1.5" />
        <path d="M9 20h6M12 16.5V20" />
      </svg>
    ),
  },
  {
    id: 'brain',
    label: 'Brain',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 7.3C9.3 5.6 10.5 4.5 12 4.5s2.7 1.1 3 2.8c1.7.3 3 1.7 3 3.4 0 .7-.2 1.4-.6 1.9.4.6.6 1.2.6 2 0 1.9-1.5 3.4-3.3 3.4-.4 1.1-1.5 1.9-2.7 1.9s-2.3-.8-2.7-1.9c-1.8 0-3.3-1.5-3.3-3.4 0-.8.2-1.4.6-2-.4-.5-.6-1.2-.6-1.9 0-1.7 1.3-3.1 3-3.4Z" />
        <path d="M12 4.5v15" strokeWidth="1.1" />
        <path d="M9.3 8.4c.9.5 1 1.8 0 2.6M14.7 8.4c-.9.5-1 1.8 0 2.6M9 15c.8-.3 1.6.1 1.9.9M15 15c-.8-.3-1.6.1-1.9.9" strokeWidth="1.1" />
      </svg>
    ),
  },
];

// button diameter + the flex gap between them, in px — the slider below walks
// in multiples of this instead of measuring the DOM, so the two stay in lockstep
const STEP = 56;

// mirrors the 3-stop scroll proxy in ScrollExperience (0 = hero, 1 = model,
// 2 = brain) but tracks it independently with a plain scroll listener rather
// than tapping into that component's rAF-driven progress ref
const SectionNav = () => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const vh = window.innerHeight || 1;
      const p = Math.max(0, Math.min(2, window.scrollY / vh));
      setActive(Math.round(p));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const goTo = index => {
    const vh = window.innerHeight || 1;
    window.scrollTo({ top: index * vh, behavior: 'smooth' });
  };

  return (
    <nav
      aria-label="Section navigation"
      className="fixed right-4 md:right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-3 px-2.5 py-4 rounded-full bg-[#04101a]/40 backdrop-blur-md border border-neon/15 shadow-lg"
    >
      <div className="relative flex flex-col gap-3">
        {/* single indicator that glides between buttons, rather than each
            button fading its own highlight in/out */}
        <span
          className="absolute left-0 top-0 w-11 h-11 rounded-full bg-neon/10 shadow-[0_0_12px_2px_rgba(75,232,255,0.35)] transition-transform duration-400 ease-out pointer-events-none"
          style={{ transform: `translateY(${active * STEP}px)` }}
        />
        {SECTIONS.map((section, index) => {
          const isActive = active === index;
          return (
            <button
              key={section.id}
              type="button"
              aria-label={section.label}
              aria-current={isActive ? 'true' : undefined}
              onClick={() => goTo(index)}
              className={`relative flex items-center justify-center w-11 h-11 rounded-full transition-colors duration-300 ${
                isActive ? 'text-neon' : 'text-white/40 hover:text-white/80'
              }`}
            >
              <span className="relative w-6 h-6">{section.icon}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default SectionNav;
