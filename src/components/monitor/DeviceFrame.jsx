/* eslint-disable react/prop-types */
import { LockIcon } from './icons';

/*
  Wraps a project screenshot in device chrome: a browser window for web
  projects (address bar shows the live host, or the dev host with a DEV
  chip for internal products) and a phone for the mobile app.

  Tall page screenshots slowly pan to the bottom on hover — like
  scrolling the page.
*/
const hostOf = url => {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
};

const BrowserFrame = ({ project }) => {
  const live = project.links?.preview && project.links.preview !== '/';
  const host = live ? hostOf(project.links.preview) : project.devHost;

  return (
    <div className="rounded-lg border border-[#1b2a42] bg-[#0a101d] overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
      <div className="flex items-center gap-2 h-7 px-2.5 bg-[#070c16] border-b border-[#1b2a42]">
        <span className="flex gap-1.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#ff5f57]" />
          <span className="w-2 h-2 rounded-full bg-[#febc2e]" />
          <span className="w-2 h-2 rounded-full bg-[#28c840]" />
        </span>
        <span className="flex items-center gap-1.5 flex-1 min-w-0 max-w-[420px] mx-auto h-[18px] px-2 rounded-md bg-[#0d1424] border border-[#1b2a42] font-mono text-[8.5px] @3xl:text-[9.5px] text-[#8298b5]">
          {live ? (
            <LockIcon size={9} />
          ) : (
            <span className="px-1 rounded-sm bg-[#4be8ff]/15 text-[#4be8ff] text-[7.5px] font-bold tracking-wider">
              DEV
            </span>
          )}
          <span className="truncate">{host}</span>
        </span>
        <span className="w-8 shrink-0" />
      </div>
      <div className="group aspect-[16/10] overflow-hidden bg-[#0d1424]">
        <img
          src={project.image}
          alt={`${project.title} screenshot`}
          className="w-full h-full object-cover [object-position:50%_0%] group-hover:[object-position:50%_100%] transition-[object-position] duration-[3500ms] ease-linear"
        />
      </div>
    </div>
  );
};

const PhoneFrame = ({ project }) => (
  <div className="mx-auto w-[150px] @3xl:w-[180px] @6xl:w-[200px]">
    <div className="relative rounded-[26px] border-[5px] border-[#070c16] ring-1 ring-[#1b2a42] bg-black overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
      <div className="absolute top-[5px] left-1/2 -translate-x-1/2 w-14 h-[12px] bg-[#070c16] rounded-full z-10" />
      <div className="aspect-[400/860]">
        <img
          src={project.image}
          alt={`${project.title} screenshot`}
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  </div>
);

const DeviceFrame = ({ project }) =>
  project.type === 'mobile' ? (
    <PhoneFrame project={project} />
  ) : (
    <BrowserFrame project={project} />
  );

export default DeviceFrame;
