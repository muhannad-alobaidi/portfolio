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
                title="DNA Trend Report 2023"
                image={project1}
                techStach={['Reactjs', 'Nextjs', 'Firebase', 'SCSS', 'GIT']}
                client="DNA Oy."
                description="For this assignment, I developed a landing page dedicated to DNA's annual trend report. Utilizing Next.js for frontend development."
                gitHub=""
                previewLink="https://oppaat.dna.fi/teknologiatrendit2023?ircp=694458037&deliveryid=229043761&utm_source=&utm_medium=&utm_campaign="
              />
              <div className=" w-[100%] h-[1px] bg-slate-500" />

              <ProjectModule
                page="work"
                title="Fazer Landing page"
                image={project2}
                techStach={['Reactjs', 'Nextjs', 'SCSS', 'GIT']}
                description="Landing page for Fazer, leveraging the capabilities of Next.js. Known for its speed and efficiency."
                client="Fazer"
                previewLink="https://viljavisio.fazer.fi/"
                gitHub=""
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
                title="DNA Trend Report 2024"
                image={project6}
                techStach={['Reactjs', 'Nextjs', 'Firebase', 'SCSS']}
                client="DNA Oy."
                description="Landing page dedicated to DNA's annual trend report. Utilizing Next.js for frontend development, the site not only showcases the trends but also integrates an interactive quiz for users."
                gitHub=""
                previewLink="https://oppaat.dna.fi/teknologiatrendit2024"
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
                title="Finnair Cargo 360"
                image={project8}
                techStach={[
                  'HTML',
                  'css',
                  'js',
                  'Reactjs',
                  'Redux',
                  'AWS',
                  'GIT',
                ]}
                client="Finnair"
                description="Working on maintaining, updating, and adding new features for the Cargo 360 website."
                gitHub=""
                previewLink="https://cargo.finnair.com/coolterminal360/"
              />
              <div className=" w-[100%] h-[1px] bg-slate-500" />

              <ProjectModule
                page="work"
                title="Finnair HTML Banner building system"
                image={project9}
                techStach={[
                  'HTML',
                  'CSS',
                  'js',
                  'Nodejs',
                  'GoogleSheet',
                  'Google Studio',
                  'BannerFlow',
                  'GIT',
                ]}
                client="Finnair"
                description="Working on maintaining, updating, and adding new features for the Nodejs-based application for building HTML banners for Finnair advertising."
                gitHub=""
                previewLink=""
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

              <ProjectModule
                page="work"
                title="Fazer Landing Page"
                image={project3}
                techStach={['HTML', 'CSS', 'JS', 'JQuery']}
                client="Fazer"
                description="This was one of my first projects, a landing page made with vanilla JavaScript. It features a cool effect when submitting a letter, showcasing the basics and the fun of pure JavaScript development."
                gitHub=""
                previewLink="https://www.fazer.fi/olerealisti"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Works;
