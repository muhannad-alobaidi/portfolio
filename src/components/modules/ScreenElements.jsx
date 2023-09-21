/* eslint-disable react/prop-types */
import { motion } from 'framer-motion';
import ProjectModule from './projectModule';
import { useState } from 'react';
import ProjectDetailsPage from './projectDetailsPage';
import { project1, project2, project3, project4, project5 } from '../../assets';

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
  return (
    <div
      id="ScreenElements"
      className=" absolute inset-0 top-[0] md:top-[0] max-w-7x1 mx-auto 
        flex flex-row items-start gap-5 perspective z-50 "
    >
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.75, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}
        transition={{ duration: 0.5 }}
        className="m-auto  opacity-25  bg-gradient-to-b   w-[100%] min-w-[350px] md:min-w-[544px] h-[304px]   mt-[60px] z-10  origin-center"
      >
        <motion.div
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ scaleY: 1, opacity: 1 }}
          exit={{ opacity: 0, scaleY: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="flex relative bg-white  p-2 bg-transparent  w-[100%] backdrop-blur-lg  shadow-md z-50 justify-between  origin-top"
        >
          <div className=" flex-[45%] ">
            <h2 className=" text-gray-900  ">Projects</h2>
          </div>
          <div className=" flex-[50%] ">
            <button
              onClick={() => {
                setShowUi(false);
              }}
              className="pl-2 pr-2 bg-transperent opacity-80 text-gray-800 border border-gray-500 rounded-sm "
            >
              X
            </button>
          </div>
        </motion.div>
        <div className=" relative h-[83%] md:h-[88%] overflow-scroll scrollbar-hide hide-scrollbar overflow-y-auto  w-full ">
          <div className="h-auto  bg-white-500/20  bg- w-[80%] m-auto">
            <div className="h-fit w-full m-auto  flex justify-center ">
              <div className=" grid grid-cols-2 md:grid-cols-4 gap-3 p-1 md:p-4  pr-0 flex-[1_1_49%]">
                <ProjectModule
                  page="monitor"
                  title="project 1"
                  image={project5}
                  techStach={[
                    'Reactjs',
                    'Nextjs',
                    'WordPress',
                    'scss',
                    'PHP',
                    'HeadlessCMS',
                  ]}
                  client="Lagerblad"
                  description="
                          For this project, I built a website using WordPress as a headless CMS and Next.js for the frontend.
                          I picked WordPress because it's user-friendly for content updates. Next.js made the site load quickly and improved its SEO.
                          I also set up a custom WordPress API to connect the frontend and backend smoothly. I handled all parts of this project by myself, from start to finish. The end product is a fast, responsive website that's easy to update."
                  gitHub=""
                  previewLink="https://www.lagerbladfoods.fi/"
                  setShowDetails={setShowDetails}
                />
                <ProjectModule
                  page="monitor"
                  title="project 2"
                  image={project1}
                  techStach={['Reactjs', 'Nextjs', 'Firebase', 'scss']}
                  client="DNA yo."
                  description="For this assignment,  I developed a landing page dedicated to DNA's annual trend report. Utilizing Next.js for frontend development, the site not only showcases the trends but also integrates an interactive quiz for users. Upon quiz completion, user responses are stored in Firebase, and real-time results are visually represented on a chart. This project was an enjoyable experience, allowing me to blend design with functionality, ensuring that users not only gain insight into DNA's trends but also engage actively through the quiz feature."
                  gitHub="https://github.com/muhannad-alobaidi/client-project-4"
                  previewLink="https://oppaat.dna.fi/teknologiatrendit2023?ircp=694458037&deliveryid=229043761&utm_source=&utm_medium=&utm_campaign="
                  setShowDetails={setShowDetails}
                />
                <ProjectModule
                  page="monitor"
                  title="project 3"
                  image={project2}
                  techStach={['Reactjs', 'Nextjs', 'SCSS']}
                  description="Landing page for Fazer, leveraging the capabilities of Next.js. Known for its speed and efficiency, Next.js provided a foundation that ensured the page was both responsive and user-friendly. This project allowed me to dive deep into frontend development nuances, optimizing for both aesthetics and performance. The end result is a sleek, fast-loading page that effectively represents Fazer's brand and values."
                  client="Fazer"
                  previewLink="https://viljavisio.fazer.fi/"
                  gitHub="https://github.com/muhannad-alobaidi/client-project-3/"
                  setShowDetails={setShowDetails}
                />

                <ProjectModule
                  page="monitor"
                  title="project 4"
                  image={project4}
                  techStach={['html', 'css', 'WordPress']}
                  description="A unique brand story page in WordPress that captures the essence of the company's journey. With an engaging on-scroll sequence, visitors are taken on a visual narrative, showing the brand's story step by step. This immersive storytelling technique not only showcases the company's goals but does so in a captivating manner, creating a memorable user experience that resonates with the brand's identity."
                  client="SolarFood"
                  gitHub=""
                  previewLink="https://solarfoods.com/our-story/"
                  setShowDetails={setShowDetails}
                />
                <ProjectModule
                  page="monitor"
                  title="project 5"
                  image={project3}
                  techStach={['html', 'css', 'js']}
                  client="Fazer"
                  description="This was one of my first projects, a landing page made with vanilla JavaScript. It features a cool effect when submitting a letter, showcasing the basics and the fun of pure JavaScript development."
                  gitHub=""
                  previewLink="https://www.fazer.fi/olerealisti"
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
          {console.log(showDetails)}
        </div>
      </motion.div>
    </div>
  );
};

export default ScreenElements;
