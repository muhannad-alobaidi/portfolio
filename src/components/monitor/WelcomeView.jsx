/* eslint-disable react/prop-types */
import { PROJECTS, LANG_META } from '../../constants/projects';

/*
  Rendered markdown preview of README.md — the landing tab. The project
  cards are the casual visitor's way in; the explorer and terminal are
  for the curious.
*/
const Badge = ({ label, value, color }) => (
  <span className="inline-flex font-mono text-[8.5px] @3xl:text-[9.5px] rounded-[3px] overflow-hidden border border-[#1b2a42]">
    <span className="px-1.5 py-[2px] bg-[#0a101d] text-[#8298b5]">{label}</span>
    <span
      className="px-1.5 py-[2px] font-semibold text-[#04121c]"
      style={{ background: color }}
    >
      {value}
    </span>
  </span>
);

const Card = ({ project, onOpen }) => (
  <button
    onClick={onOpen}
    className="group flex flex-col text-left rounded-md border border-[#1b2a42] bg-[#0a111f] overflow-hidden transition-all hover:border-[#4be8ff]/50 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(75,232,255,0.08)]"
  >
    <div className="relative h-20 @3xl:h-24 @6xl:h-28 overflow-hidden bg-[#070c16]">
      <img
        src={project.image}
        alt={project.title}
        loading="lazy"
        className={
          project.type === 'mobile'
            ? 'w-full h-full object-contain py-1'
            : 'w-full h-full object-cover object-top'
        }
      />
      <span className="absolute inset-0 bg-gradient-to-t from-[#0a111f] via-transparent to-transparent opacity-60" />
      <span className="absolute bottom-1.5 right-2 font-mono text-[8.5px] text-[#4be8ff] opacity-0 group-hover:opacity-100 transition-opacity">
        open →
      </span>
    </div>
    <div className="p-2.5 @3xl:p-3 flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 font-mono text-[9px] @3xl:text-[10px] text-[#5d7290]">
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: LANG_META[project.lang]?.color }}
        />
        <span className="truncate">
          {project.folder ? `${project.folder}/` : ''}
          {project.file}
        </span>
      </div>
      <h3 className="text-[12px] @3xl:text-[13px] font-semibold text-[#e8f2ff] leading-tight">
        {project.title}
      </h3>
      <p className="text-[10px] @3xl:text-[11px] text-[#8298b5] leading-snug line-clamp-2">
        {project.blurb}
      </p>
    </div>
  </button>
);

const WelcomeView = ({ openProject }) => {
  return (
    <div className="h-full overflow-y-auto hide-scrollbar bg-[#0d1424]">
      <div className="max-w-[980px] mx-auto px-4 @3xl:px-8 py-4 @3xl:py-8">
        <p className="font-mono text-[9px] @3xl:text-[10px] text-[#46587a] mb-2">
          README.md — preview
        </p>

        <h1 className="text-lg @3xl:text-2xl @6xl:text-3xl font-semibold text-[#e8f2ff] tracking-tight">
          Muhannad Alobaidi
        </h1>
        <p className="mt-1 text-[11px] @3xl:text-[13px] text-[#8298b5]">
          Full-stack &amp; mobile developer —{' '}
          <span className="text-[#4be8ff]">lead frontend @ Baity</span>. I turn
          visions into tangible digital reality.
        </p>

        <div className="flex flex-wrap gap-1.5 mt-3">
          <Badge label="stack" value="react · vue" color="#4be8ff" />
          <Badge label="mobile" value="flutter" color="#2cb7f6" />
          <Badge label="web" value="next · nuxt" color="#41b883" />
          <Badge label="status" value="shipping" color="#62de8a" />
        </div>

        <div className="flex items-center gap-3 mt-5 @3xl:mt-7 mb-3">
          <h2 className="text-[13px] @3xl:text-[15px] font-semibold text-[#cdd9ec]">
            <span className="text-[#46587a] mr-1.5">##</span>~/projects
          </h2>
          <span className="h-px flex-1 bg-[#1b2a42]" />
          <span className="font-mono text-[9px] @3xl:text-[10px] text-[#46587a]">
            {PROJECTS.length} repos
          </span>
        </div>

        <div className="grid grid-cols-2 @3xl:grid-cols-3 @6xl:grid-cols-4 gap-2.5 @3xl:gap-3">
          {PROJECTS.map(p => (
            <Card key={p.id} project={p} onOpen={() => openProject(p.id)} />
          ))}
        </div>

        <p className="mt-5 @3xl:mt-7 font-mono text-[9px] @3xl:text-[10.5px] text-[#46587a] leading-relaxed">
          <span className="text-[#4be8ff]">&gt;</span> tip: browse the{' '}
          <span className="text-[#8298b5]">EXPLORER</span> on the left, or type{' '}
          <span className="px-1 py-px rounded bg-[#0a101d] border border-[#1b2a42] text-[#9ece8c]">
            help
          </span>{' '}
          in the terminal below.
        </p>
      </div>
    </div>
  );
};

export default WelcomeView;
