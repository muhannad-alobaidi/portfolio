import ProjectModule from './modules/projectModule-projects';
import {
  project1,
  project2,
  project3,
  project4,
  project5,
  project6,
  project7,
  project8,
  project9,
  project10,
} from '../assets';

const Works = () => {
  return (
    <div>
      <div
        id="work"
        className=" m-auto mt-[100px] mb-[128px]  items-center flex flex-col w-[100%] max-w-[1024px] gap-10 border border-gray-500 rounded-lg backdrop-blur-[4px] z-[999]"
      >
        <div className="h-auto p-6 w-[100%] ">
          <div className=" w-[100%] mt-5 mb-5 flex items-center px-4 gap-4">
            <h2 className="text-3xl text-gray-200">PROJECTS</h2>{' '}
            <span className=" h-[1px] bg-slate-500 w-[100%]" />
          </div>{' '}
          <div className="h-fit w-full m-auto">
            <div className="  gap-16 p-1 md:p-4  pr-0 flex flex-col justify-start ">
              <ProjectModule
                page="work"
                title="LagerBlad Foods"
                image={project5}
                techStach={[
                  'Reactjs',
                  'Nextjs',
                  'WordPress',
                  'SCSS',
                  'PHP',
                  'HeadlessCMS',
                  'Rest API',
                  'AJAX',
                  'GIT',
                ]}
                client="Lagerblad"
                description="
                         For this project, I built a website using WordPress as a headless CMS and Next.js for the front end.
                          "
                gitHub=""
                previewLink="https://www.lagerbladfoods.fi/"
              />
              <div className=" w-[100%] h-[1px] bg-slate-500" />

              <ProjectModule
                page="work"
                title="SolarFoods Website"
                image={project4}
                techStach={[
                  'HTML',
                  'CSS',
                  'WordPress',
                  'JQuery',
                  'PHP',
                  'NPM',
                  'GIT',
                ]}
                description="A unique brand story page in WordPress that captures the essence of the company's journey. With an engaging on-scroll sequence, visitors are taken on a visual narrative, showing the brand's story step by step."
                client="SolarFood"
                gitHub=""
                previewLink="https://solarfoods.com/our-story/"
              />
              <div className=" w-[100%] h-[1px] bg-slate-500" />

              <ProjectModule
                page="work"
                title="SEK website renewal"
                image={project7}
                techStach={[
                  'Reactjs',
                  'Nextjs',
                  'WordPress',
                  'SCSS',
                  'PHP',
                  'HeadlessCMS',
                  'API',
                  'GIT',
                  'TypeScript',
                ]}
                client="SEK Oy."
                description="Renewal for the company website Transformong from WordPress to Headless CMS approach."
                gitHub=""
                previewLink="https://www.sek.fi/"
              />
              <div className=" w-[100%] h-[1px] bg-slate-500" />

              <ProjectModule
                page="work"
                title="This portfolio site"
                image={project10}
                techStach={['Reactjs', 'Vite', 'ReacrFiber 3d', 'Blender']}
                client="Myself"
                description="My hamble portfolio I hope you like it :)"
                gitHub=""
                previewLink="/"
              />
              <div className=" w-[100%] h-[1px] bg-slate-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Works;
