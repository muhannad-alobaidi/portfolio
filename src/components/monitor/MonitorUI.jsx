/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import BootSequence from './BootSequence';
import TitleBar from './TitleBar';
import ActivityBar from './ActivityBar';
import Explorer from './Explorer';
import EditorTabs from './EditorTabs';
import WelcomeView from './WelcomeView';
import ProjectView from './ProjectView';
import Terminal from './Terminal';
import StatusBar from './StatusBar';
import { getProject } from '../../constants/projects';
import { CodeIcon } from './icons';

/*
  What's on the monitor: a developer's machine, mid-session. Boots once
  per visit, then drops you into "muha-code" — explorer, tabs, a
  code-with-live-preview editor and a terminal that actually answers.
*/
let bootedThisSession = false;

const README = 'readme';

const MonitorUI = ({ setShowUi }) => {
  const [phase, setPhase] = useState(bootedThisSession ? 'ide' : 'boot');
  const [tabs, setTabs] = useState([README]);
  const [activeTab, setActiveTab] = useState(README);
  const [explorerOpen, setExplorerOpen] = useState(true);
  const [termSignal, setTermSignal] = useState(null);
  const [compact, setCompact] = useState(false);
  const seq = useRef(0);
  const rootRef = useRef(null);

  // small monitors (phones / shallow rects) start with the terminal folded
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const { height } = entries[0].contentRect;
      setCompact(height < 440);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pushTerm = spans => {
    seq.current += 1;
    setTermSignal({ seq: seq.current, lines: [spans] });
  };

  const openProject = id => {
    const p = getProject(id);
    if (!p) return;
    setTabs(t => (t.includes(id) ? t : [...t, id]));
    if (activeTab !== id) {
      pushTerm([
        { c: 'dim', x: '$ ' },
        { c: 'cmd', x: `code ./${p.folder ? `${p.folder}/` : ''}${p.file}` },
        { c: 'ok', x: '  ✓' },
      ]);
    }
    setActiveTab(id);
  };

  const openReadme = () => {
    setTabs(t => (t.includes(README) ? t : [README, ...t]));
    setActiveTab(README);
  };

  const closeTab = id => {
    setTabs(t => {
      const next = t.filter(x => x !== id);
      if (activeTab === id) {
        const idx = t.indexOf(id);
        setActiveTab(next[idx - 1] ?? next[0] ?? null);
      }
      return next;
    });
  };

  const activeProject = activeTab && activeTab !== README ? getProject(activeTab) : null;

  return (
    <div
      ref={rootRef}
      id="ScreenElements"
      className="@container relative w-full h-full overflow-hidden rounded-[3px] bg-[#0d1424]"
    >
      {phase === 'boot' ? (
        <BootSequence
          onDone={() => {
            bootedThisSession = true;
            setPhase('ide');
          }}
        />
      ) : (
        <div className="flex flex-col w-full h-full text-[#aebed6]">
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <TitleBar
              onClose={() => setShowUi(false)}
              onToggleExplorer={() => setExplorerOpen(o => !o)}
            />
          </motion.div>

          <div className="flex flex-1 min-h-0">
            <motion.div
              initial={{ x: -12, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.35, delay: 0.08 }}
              className="flex min-h-0"
            >
              <ActivityBar
                explorerOpen={explorerOpen}
                onToggleExplorer={() => setExplorerOpen(o => !o)}
              />
              <Explorer
                open={explorerOpen}
                activeTab={activeTab}
                openProject={openProject}
                openReadme={openReadme}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.16 }}
              className="flex flex-col flex-1 min-w-0 min-h-0"
            >
              {tabs.length > 0 && (
                <EditorTabs
                  tabs={tabs}
                  activeTab={activeTab}
                  onSelect={setActiveTab}
                  onClose={closeTab}
                />
              )}

              <div className="flex-1 min-h-0 relative">
                {activeTab === README ? (
                  <WelcomeView openProject={openProject} />
                ) : activeProject ? (
                  <ProjectView key={activeProject.id} project={activeProject} />
                ) : (
                  <div className="h-full grid place-items-center bg-[#0d1424]">
                    <div className="flex flex-col items-center gap-3 text-center px-6">
                      <CodeIcon size={44} className="text-[#1b2a42]" />
                      <p className="text-[11px] @3xl:text-[12px] text-[#5d7290]">
                        no file open — pick a project from the explorer
                      </p>
                      <button
                        onClick={openReadme}
                        className="font-mono text-[10px] @3xl:text-[11px] text-[#4be8ff] border border-[#4be8ff]/30 rounded px-3 py-1.5 hover:bg-[#4be8ff]/10 transition-colors"
                      >
                        open README.md
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <Terminal
                signal={termSignal}
                openProject={openProject}
                openReadme={openReadme}
                closeUi={() => setShowUi(false)}
                defaultCollapsed={compact}
              />
            </motion.div>
          </div>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <StatusBar project={activeProject} />
          </motion.div>
        </div>
      )}

      {/* glass: glare, vignette and faint scanlines over everything */}
      <div className="screen-glass" />
    </div>
  );
};

export default MonitorUI;
