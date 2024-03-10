/* eslint-disable react/no-unescaped-entities */

import TechStack from './modules/techStackelement';
import {
  reactjs,
  css,
  javascript,
  redux,
  html,
  figma,
  nodejs,
  tailwind,
  typescript,
  git,
  nextjs,
  wordpress,
  storybook,
  php,
  cs,
  dotnet,
  express,
  aws,
  docker,
  kobernetes,
  sql,
} from '../assets';

const Tech = () => {
  return (
    <section
      id="Tech"
      className=" m-auto mt-[250px] mb-[128px] p-6   md:p-24 items-center flex w-[100%] max-w-[1024px] gap-10 border border-gray-500 rounded-lg backdrop-blur-[4px] z-[999]"
    >
      <div className="text-section w-[100%] gap-10 flex flex-col ">
        <div className=" mt-5 mb-5 flex items-center">
          <h2 className=" flex-[40%] text-3xl text-gray-200">TECH-STACK</h2>{' '}
          <span className=" h-[1px] bg-slate-500 w-[100%]" />
        </div>
        <div className=" flex flex-wrap gap-5 justify-center">
          <TechStack delay={1} img={html} name="Html" />
          <TechStack delay={2} img={css} name="CSS" />
          <TechStack delay={3} img={javascript} name="JavaScript" />
          <TechStack delay={4} img={reactjs} name="Reactjs" />
          <TechStack delay={4} img={reactjs} name="ReactNative" />
          <TechStack delay={5} img={nextjs} name="Nextjs" />
          <TechStack delay={6} img={redux} name="Redux" />
          <TechStack delay={7} img={nodejs} name="Nodejs" />
          <TechStack delay={14} img={express} name="Express.js" />
          <TechStack delay={8} img={typescript} name="TypeScript" />
          <TechStack delay={9} img={tailwind} name="Tailwind" />
          <TechStack delay={10} img={git} name="Git" />
          <TechStack delay={11} img={wordpress} name="Wordpress" />
          <TechStack delay={12} img={php} name="PHP" />
          <TechStack delay={13} img={figma} name="Figma" />
          <TechStack delay={14} img={storybook} name="Storybook" />
          <TechStack delay={14} img={aws} name="AWS" />
          <TechStack delay={14} img={cs} name="C#" />
          <TechStack delay={14} img={dotnet} name=".NET" />
          <TechStack delay={14} img={docker} name="Docker" />
          <TechStack delay={14} img={kobernetes} name="kobernetes" />
          <TechStack delay={14} img={sql} name="SQL" />
        </div>
      </div>
    </section>
  );
};

export default Tech;
