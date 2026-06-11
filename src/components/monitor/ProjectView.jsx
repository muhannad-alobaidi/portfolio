/* eslint-disable react/prop-types */
import { useState } from 'react';
import CodeBlock from './CodeBlock';
import DeviceFrame from './DeviceFrame';
import { ExternalIcon, CodeIcon, ChevronIcon } from './icons';

/*
  A project tab: the generated "source file" on the left, a rendered
  preview (device frame + details) on the right — like a markdown editor
  with live preview. Below @5xl the code collapses behind a toggle.
*/
const StatusBadge = ({ status }) => {
  const live = status === 'live';
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-[3px] rounded-full font-mono text-[8.5px] @3xl:text-[9.5px] tracking-wider uppercase border ${
        live
          ? 'border-[#62de8a]/40 text-[#62de8a] bg-[#62de8a]/10'
          : 'border-[#4be8ff]/40 text-[#4be8ff] bg-[#4be8ff]/10'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full animate-pulse ${
          live ? 'bg-[#62de8a]' : 'bg-[#4be8ff]'
        }`}
      />
      {status}
    </span>
  );
};

const Details = ({ project }) => (
  <div className="flex flex-col gap-3 @3xl:gap-4">
    <div className="flex items-center gap-2 flex-wrap">
      <StatusBadge status={project.status} />
      <span className="font-mono text-[9px] @3xl:text-[10px] text-[#46587a]">
        {project.client} · {project.year} · {project.role}
      </span>
    </div>

    <DeviceFrame project={project} />

    <div>
      <h1 className="text-base @3xl:text-xl @6xl:text-2xl font-semibold text-[#e8f2ff] tracking-tight">
        {project.title}
      </h1>
      <p className="mt-1.5 text-[11px] @3xl:text-[12.5px] leading-relaxed text-[#8298b5]">
        {project.description}
      </p>
    </div>

    <ul className="flex flex-col gap-1">
      {project.highlights.map(h => (
        <li
          key={h}
          className="flex items-start gap-2 text-[10.5px] @3xl:text-[12px] text-[#aebed6]"
        >
          <span className="text-[#62de8a] font-mono mt-px">✓</span>
          {h}
        </li>
      ))}
    </ul>

    <div className="flex flex-wrap gap-1.5">
      {project.tech.map(t => (
        <span
          key={t}
          className="px-2 py-[3px] rounded border border-[#1b2a42] bg-[#0a101d] font-mono text-[9px] @3xl:text-[10px] text-[#8298b5] hover:text-[#4be8ff] hover:border-[#4be8ff]/40 transition-colors"
        >
          {t}
        </span>
      ))}
    </div>

    <div className="flex items-center gap-2 flex-wrap pb-1">
      {project.links?.preview ? (
        <a
          href={project.links.preview}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#4be8ff] text-[#04121c] text-[10px] @3xl:text-[11px] font-semibold hover:bg-[#7df0ff] transition-colors"
        >
          <ExternalIcon size={11} />
          {project.id === 'portfolio' ? 'you are here' : 'visit live'}
        </a>
      ) : (
        <span className="font-mono text-[9px] @3xl:text-[10px] text-[#46587a] border border-dashed border-[#1b2a42] rounded px-2.5 py-1.5">
          internal product — no public link yet
        </span>
      )}
      {project.links?.github && (
        <a
          href={project.links.github}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#1b2a42] text-[10px] @3xl:text-[11px] text-[#aebed6] hover:border-[#4be8ff]/40 hover:text-[#4be8ff] transition-colors"
        >
          <CodeIcon size={11} />
          source
        </a>
      )}
    </div>
  </div>
);

const ProjectView = ({ project }) => {
  const [showSource, setShowSource] = useState(false);

  return (
    <div className="h-full bg-[#0d1424]">
      {/* wide: split editor — code left, preview right */}
      <div className="hidden @5xl:flex h-full">
        <div className="w-[42%] h-full overflow-y-auto overscroll-contain hide-scrollbar bg-[#0b1120] border-r border-[#1b2a42]">
          <CodeBlock project={project} />
        </div>
        <div className="flex-1 h-full overflow-y-auto overscroll-contain hide-scrollbar">
          <div className="max-w-[760px] mx-auto px-6 py-5">
            <Details project={project} />
          </div>
        </div>
      </div>

      {/* narrow: preview first, source behind a toggle */}
      <div className="@5xl:hidden h-full overflow-y-auto overscroll-contain hide-scrollbar">
        <div className="px-3 @3xl:px-6 py-3 @3xl:py-5">
          <Details project={project} />
          <button
            onClick={() => setShowSource(s => !s)}
            className="mt-3 inline-flex items-center gap-1.5 font-mono text-[9.5px] @3xl:text-[10.5px] text-[#5d7290] hover:text-[#4be8ff] transition-colors"
          >
            <ChevronIcon open={showSource} size={9} />
            <span>{'{ }'} view source</span>
          </button>
          {showSource && (
            <div className="mt-2 rounded-md border border-[#1b2a42] bg-[#0b1120] overflow-hidden">
              <CodeBlock project={project} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectView;
