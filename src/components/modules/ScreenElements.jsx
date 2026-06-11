/* eslint-disable react/prop-types */
import { motion } from 'framer-motion';
import ProjectModule from './projectModule';
import { useState, useRef, useEffect } from 'react';
import ProjectDetailsPage from './projectDetailsPage';
import {
  project4,
  project5,
  project7,
  project10,
  project11,
} from '../../assets';

const ScreenElements = ({ setShowUi }) => {
  const [showDetails, setShowDetails] = useState({
    show: false,
    projectDetails: {
      title: '',
      description: '',
      img: '',
      client: '',
      github: '',
      preview: '',
      techStach: [],
    },
  });
  const scrollRef = useRef(null);

  // the details panel renders at the top of the scroll container; make sure
  // it is in view even if the grid was scrolled down
  useEffect(() => {
    if (showDetails.show && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [showDetails.show]);

  return (
    <div
      id="ScreenElements"
      className="relative w-full h-full overflow-hidden z-50 @container"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.5 }}
        className="w-full h-full flex flex-col origin-center"
      >
        <motion.div
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ scaleY: 1, opacity: 1 }}
          exit={{ opacity: 0, scaleY: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex items-center justify-between p-2 bg-transparent w-full backdrop-blur-lg shadow-md z-50 origin-top"
        >
          <h2 className=" text-gray-900  ">Projects</h2>
          <button
            onClick={() => {
              setShowUi(false);
            }}
            className="px-3 py-1 min-w-10 min-h-10 bg-transparent opacity-80 text-gray-800 border border-gray-500 rounded-sm "
          >
            X
          </button>
        </motion.div>
        <div
          ref={scrollRef}
          className=" relative flex-1 hide-scrollbar overflow-y-auto  w-full "
        >
          <div className="h-auto w-[92%] m-auto">
            <div className="h-fit w-full m-auto  flex justify-center ">
              <div className=" grid grid-cols-2 @2xl:grid-cols-4 gap-3 p-1 @2xl:p-4">
                <ProjectModule
                  page="monitor"
                  title="Salomaa"
                  image={project11}
                  techStach={[
                    'WordPress',
                    'tailwindcss',
                    'PHP',
                    'JavaScript',
                    'HTML',
                    'CSS',
                    'GIT',
                    'GSAP',
                    'Swiper',
                  ]}
                  client="Salomaa"
                  description="
                                        Full website renewal for Salomaa, a Finnish company specializing in high-quality food products. The project involved a complete overhaul of the website, including design, functionality, and user experience enhancements. The new site features a modern design, improved navigation, and optimized performance to better serve the company's customers and showcase its products effectively.
                                          "
                  gitHub=""
                  previewLink="https://www.salomaa.fi/"
                  setShowDetails={setShowDetails}
                />
                <ProjectModule
                  page="monitor"
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
                    For this project, I built a website using WordPress as a headless CMS and Next.js for the frontend"
                  gitHub=""
                  previewLink="https://www.lagerbladfoods.fi/"
                  setShowDetails={setShowDetails}
                />
                <ProjectModule
                  page="monitor"
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
                  description="A unique brand story page in WordPress that captures the essence of the company's journey. With an engaging on-scroll sequence, visitors are taken on a visual narrative, showing the brand's story step by step. This immersive storytelling technique not only showcases the company's goals but does so in a captivating manner, creating a memorable user experience that resonates with the brand's identity."
                  client="SolarFood"
                  gitHub=""
                  previewLink="https://solarfoods.com/our-story/"
                  setShowDetails={setShowDetails}
                />

                <ProjectModule
                  page="monitor"
                  title="This portfolio site"
                  image={project10}
                  techStach={['Reactjs', 'Vite', 'ReacrFiber 3d', 'Blender']}
                  client="Myself"
                  description="My hamble portfolio I hope you like it :)"
                  gitHub=""
                  previewLink="/"
                  setShowDetails={setShowDetails}
                />
                <ProjectModule
                  page="monitor"
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
                  description="Renewal for the company website Transformong from Wprdpress to Headless CMS approach."
                  gitHub=""
                  previewLink="https://www.sek.fi/"
                  setShowDetails={setShowDetails}
                />
              </div>
            </div>
          </div>
          {showDetails.show && (
            <ProjectDetailsPage
              details={showDetails}
              setShowDetails={setShowDetails}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ScreenElements;
