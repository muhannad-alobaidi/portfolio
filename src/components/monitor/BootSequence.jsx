/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react';

/*
  Fast fake boot: terminal lines type in (~1.2s), a short flash, then the
  IDE takes over. Click anywhere to skip. Runs once per session.
*/
const BOOT_LINES = [
  { text: 'muha-os v5.1.0 — developer workstation', c: 'head' },
  { text: '', c: 'out' },
  { text: '[ ok ] mounting /dev/projects ............ 8 repos found', c: 'ok' },
  { text: '[ ok ] loading muha-code ................. v2026.6.1', c: 'ok' },
  { text: '[ ok ] display :0 attached ............... 1920x1080 @ 144Hz', c: 'ok' },
  { text: '[ ok ] restoring last session ............ ~/projects', c: 'ok' },
  { text: '', c: 'out' },
  { text: 'welcome back, muhannad — launching workspace…', c: 'neon' },
];

const TOTAL_CHARS = BOOT_LINES.reduce((n, l) => n + Math.max(l.text.length, 1), 0);

const COLOR = {
  head: 'text-[#d7e6f5]',
  ok: 'text-[#8aa2bd]',
  out: 'text-[#8aa2bd]',
  neon: 'text-[#4be8ff]',
};

const BootSequence = ({ onDone }) => {
  const [shown, setShown] = useState(0); // chars revealed across all lines
  const [flash, setFlash] = useState(false);
  const finished = useRef(false);

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    setShown(TOTAL_CHARS);
    setFlash(true);
  };

  useEffect(() => {
    const iv = setInterval(() => {
      setShown(n => {
        if (n + 5 >= TOTAL_CHARS) {
          clearInterval(iv);
          finish();
          return TOTAL_CHARS;
        }
        return n + 5;
      });
    }, 16);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(onDone, 380);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flash]);

  // map revealed char budget onto the lines
  let budget = shown;
  const rendered = BOOT_LINES.map(line => {
    const len = Math.max(line.text.length, 1);
    const take = Math.max(0, Math.min(len, budget));
    budget -= len;
    return { ...line, visible: line.text.slice(0, take), started: take > 0 };
  });

  return (
    <div
      className="absolute inset-0 bg-[#04070d] font-mono text-[10px] @2xl:text-[12px] @5xl:text-[13px] leading-[1.9] cursor-pointer select-none overflow-hidden"
      onClick={finish}
      title="click to skip"
    >
      <div className="p-4 @2xl:p-8">
        {rendered.map(
          (l, i) =>
            l.started && (
              <div key={i} className={COLOR[l.c]}>
                {l.c === 'ok' && l.visible.startsWith('[ ok ]') ? (
                  <>
                    <span className="text-[#62de8a]">[ ok ]</span>
                    {l.visible.slice(6)}
                  </>
                ) : (
                  l.visible || ' '
                )}
              </div>
            )
        )}
        <span className="inline-block w-[7px] h-[13px] bg-[#4be8ff] align-middle caret-blink" />
      </div>
      {flash && <div className="absolute inset-0 bg-white boot-flash" />}
    </div>
  );
};

export default BootSequence;
