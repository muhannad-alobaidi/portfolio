/* eslint-disable react/prop-types */
import { motion } from 'framer-motion';

const ScreenElements = ({ setShowUi }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 0.75, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ duration: 0.5 }}
      className="m-auto  opacity-25  bg-gradient-to-b bg-white w-[820px]  h-[450px] top-[415px] absolute z-10"
    >
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="flex  p-2 bg-transparent stiky w-[100%] backdrop-blur-lg  shadow-md z-50 justify-between "
      >
        <div>
          <h2 className=" text-gray-900  ">Welcome to my portfolio</h2>
        </div>
        <button
          onClick={() => {
            setShowUi(false);
          }}
          className="pl-2 pr-2 bg-gray-800 opacity-80 "
        >
          X
        </button>
      </motion.div>
      <div className="h-[91%] overflow-scroll scrollbar-hide hide-scrollbar overflow-y-auto  w-full ">
        <div className="h-auto bg-white-500/20 border border-grey-500 bg- w-[80%] m-auto">
          <div className="h-fit w-full m-auto p-8 flex justify-center ">
            <div className=" flex flex-col  gap-20  pr-0 flex-[1_1_49%]">
              <div className=" flex flex-col gap-2 bg-white p-2  border border-grey-500 rounded-lg ">
                <h2 className="text-gray-900 p-2 ">project 1</h2>
                <img className=" p-2" src="/public/images/1.webp" alt="" />
                <div className="p-2 flex justify-between">
                  <a
                    target="blank"
                    className="border border-grey-600 rounded-sm text-gray-700 text-xs p-2"
                    href="https://oppaat.dna.fi/teknologiatrendit2023?ircp=694458037&deliveryid=229043761&utm_source=&utm_medium=&utm_campaign="
                  >
                    Preview
                  </a>
                  <a
                    target="blank"
                    className=" border border-grey-600 rounded-sm text-gray-700 text-xs p-2"
                    href="https://github.com/muhannad-alobaidi/client-project-4"
                  >
                    GitHub
                  </a>
                </div>
              </div>
              <div className=" flex flex-col gap-2 bg-white p-2  border border-grey-500 rounded-lg ">
                <h2 className="text-gray-900 p-2 ">project 2</h2>
                <img className=" p-2" src="/public/images/2.webp" alt="" />
                <div className="p-2 flex justify-between">
                  <a
                    target="blank"
                    className="  border border-grey-600 rounded-sm text-gray-700 text-xs p-2"
                    href="https://www.fazer.fi/olerealisti"
                  >
                    Preview
                  </a>
                  <a
                    target="blank"
                    className=" border border-grey-600 rounded-sm text-gray-700 text-xs p-2"
                    href="https://github.com/muhannad-alobaidi/client-project-2/tree/main/fazerRealisty"
                  >
                    GitHub
                  </a>
                </div>
              </div>
            </div>
            <div className=" h-full m-2 shadow-lg  flex-[1_1_1%]"></div>
            <div className=" flex flex-col  gap-20 p-8 pr-0 flex-[1_1_49%]">
              <div className=" mt-[170px] flex flex-col gap-2 bg-white p-2  border border-grey-500 rounded-lg ">
                <h2 className="text-gray-900 p-2 ">project 1</h2>
                <img className=" p-2" src="/public/images/3.webp" alt="" />
                <div className="p-2 flex justify-between">
                  <a
                    className="  border border-grey-600 rounded-sm text-gray-700 text-xs p-2"
                    href=""
                  >
                    Preview
                  </a>
                  <a
                    className=" border border-grey-600 rounded-sm text-gray-700 text-xs p-2"
                    href=""
                  >
                    GitHub
                  </a>
                </div>
              </div>
              <div className=" flex flex-col gap-2 bg-white p-2  border border-grey-500 rounded-lg ">
                <h2 className="text-gray-900 p-2 ">project 2</h2>
                <img className=" p-2" src="/public/images/4.webp" alt="" />
                <div className="p-2 flex justify-between">
                  <a
                    className="  border border-grey-600 rounded-sm text-gray-700 text-xs p-2"
                    href=""
                  >
                    Preview
                  </a>
                  <a
                    className=" border border-grey-600 rounded-sm text-gray-700 text-xs p-2"
                    href=""
                  >
                    GitHub
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ScreenElements;