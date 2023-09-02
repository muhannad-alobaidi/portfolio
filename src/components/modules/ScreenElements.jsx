/* eslint-disable react/prop-types */
import { motion } from 'framer-motion';
import ProjectModule from './projectModule';
import { useState } from 'react';
import ProjectDetailsPage from './projectDetailsPage';
import { project1, project2, project3, project4 } from '../../assets';

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
        className="m-auto  opacity-25  bg-gradient-to-b bg-white  w-[100%] min-w-[350px] md:min-w-[544px] h-[304px]   mt-[60px] z-10  origin-center"
      >
        <motion.div
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ scaleY: 1, opacity: 1 }}
          exit={{ opacity: 0, scaleY: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="flex relative  p-2 bg-transparent  w-[100%] backdrop-blur-lg  shadow-md z-50 justify-between  origin-top"
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
                  title="project 1"
                  image={project1}
                  techStach={['reactjs', 'nextjs', 'firebase', 'scss']}
                  client="DNA yo."
                  description="some text"
                  gitHub="https://github.com/muhannad-alobaidi/client-project-4"
                  previewLink="https://oppaat.dna.fi/teknologiatrendit2023?ircp=694458037&deliveryid=229043761&utm_source=&utm_medium=&utm_campaign="
                  setShowDetails={setShowDetails}
                />
                <ProjectModule
                  title="project 2"
                  image={project2}
                  techStach={['html', 'css', 'js']}
                  description="some text"
                  client="<NAME>"
                  previewLink="https://www.fazer.fi/olerealisti"
                  gitHub="https://github.com/muhannad-alobaidi/client-project-2/tree/main/fazerRealisty"
                  setShowDetails={setShowDetails}
                />

                <ProjectModule
                  title="project 3"
                  image={project3}
                  techStach={['html', 'css', 'js']}
                  description="some text"
                  client="<NAME>"
                  gitHub="https://github.com/muhannad-alobaidi/client-project-3/"
                  previewLink=""
                  setShowDetails={setShowDetails}
                />
                <ProjectModule
                  title="project 4"
                  image={project4}
                  techStach={['html', 'css', 'js']}
                  client="name"
                  description="some text"
                  gitHub="https://github.com/muhannad-alobaidi/client-project-4"
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
