/* eslint-disable react/prop-types */
import { motion } from 'framer-motion';
import ProjectModule from './projectModule';

const ScreenElements = ({ setShowUi }) => {
  return (
    <div
      id="ScreenElements"
      className=" absolute inset-0 top-[120px] max-w-7x1 mx-auto 
        flex flex-row items-start gap-5 perspective z-40 "
    >
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.75, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}
        transition={{ duration: 0.5 }}
        className="m-auto  opacity-25  bg-gradient-to-b bg-white w-[840px]  h-[448px]  mt-[294px] z-10 rotate-x origin-center"
      >
        <motion.div
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ scaleY: 1, opacity: 1 }}
          exit={{ opacity: 0, scaleY: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="flex  p-2 bg-transparent stiky w-[100%] backdrop-blur-lg  shadow-md z-50 justify-between  origin-top"
        >
          <div>
            <h2 className=" text-gray-900  ">Welcome to my portfolio</h2>
          </div>
          <button
            onClick={() => {
              setShowUi(false);
            }}
            className="pl-2 pr-2 bg-transperent opacity-80 text-gray-800 border border-gray-500 rounded-sm "
          >
            X
          </button>
        </motion.div>
        <div className="h-[90%] overflow-scroll scrollbar-hide hide-scrollbar overflow-y-auto  w-full ">
          <div className="h-auto bg-white-500/20 border border-grey-500 bg- w-[80%] m-auto">
            <div className="h-fit w-full m-auto p-8 flex justify-center ">
              <div className=" flex flex-col  gap-20  pr-0 flex-[1_1_49%]">
                <ProjectModule
                  title="project 1"
                  image="/public/images/1.webp"
                  plink="https://oppaat.dna.fi/teknologiatrendit2023?ircp=694458037&deliveryid=229043761&utm_source=&utm_medium=&utm_campaign="
                  glink="https://github.com/muhannad-alobaidi/client-project-4"
                />
                <ProjectModule
                  title="project 1"
                  image="/public/images/2.webp"
                  plink="https://www.fazer.fi/olerealisti"
                  glink="https://github.com/muhannad-alobaidi/client-project-2/tree/main/fazerRealisty"
                />
              </div>
              <div className=" h-full m-2 shadow-lg  flex-[1_1_1%]"></div>
              <div className=" flex flex-col  gap-20 p-8 pr-0 flex-[1_1_49%]">
                <div className=" mt-[170px]  ">
                  <ProjectModule
                    title="project 1"
                    image="/public/images/3.webp"
                    plink=""
                    glink=""
                  />
                </div>
                <ProjectModule
                  title="project 2"
                  image="/public/images/4.webp"
                  plink=""
                  glink=""
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ScreenElements;
