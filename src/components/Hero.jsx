import { motion, AnimatePresence } from 'framer-motion';
import { styles } from '../styles';
import { ComputersCanvas } from './canvas';
import { useState } from 'react';

const Hero = () => {
  const [showUi, setShowUi] = useState(false);
  const [exit, setExit] = useState(false);

  return (
    <section className="relative flex justify-center  bg-hero-pattern bg-cover  h-screen mx-auto">
      <div
        className={` ${styles.paddingX} 
        absolute inset-0 top-[120px] max-w-7x1 mx-auto 
        flex flex-row items-start gap-5 `}
      >
        <div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 2 }}
            className={`${styles.heroHeadText} text-white`}
          >
            Hi, I&apos;am <span className="text-[#5ea9ff]">Muha</span>{' '}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 3 }}
            className={`${styles.heroSubText} text-white-100`}
          >
            I&apos;m a web developer
          </motion.p>
        </div>
      </div>
      <AnimatePresence>
        {showUi && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.75, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.5 }}
            className="m-auto  opacity-25  bg-gradient-to-b from-blue-500 w-[820px]  h-[450px] top-[415px] absolute z-10"
          >
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="flex  p-2 bg-violet-400/40  shadow-lg justify-between "
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
            <div className="h-[92%] overflow-scroll scrollbar-hide w-full ">
              <div className="h-auto bg-white-500/20 shadow-lg bg- w-[70%] m-auto">
                <div className="h-fit w-full m-auto p-2 flex justify-center ">
                  <div className=" flex flex-col  gap-20 p-8 pr-0 flex-[1_1_49%]">
                    <div className=" flex flex-col gap-2 bg-blue-100/10 p-2 shadow-lg backdrop-blur-sm ">
                      <h2 className="text-gray-900 p-2 ">project 1</h2>
                      <img
                        className=" p-2"
                        src="/public/images/1.webp"
                        alt=""
                      />
                      <div className="p-2 flex justify-between">
                        <a
                          className="  border-solid border-2 border-salt-500 text-xs p-2"
                          href=""
                        >
                          Preview
                        </a>
                        <a
                          className=" border-solid border-2 border-salt-500 text-xs p-2"
                          href=""
                        >
                          GitHub
                        </a>
                      </div>
                    </div>
                    <div className=" flex flex-col gap-2 bg-blue-100/10 p-2 shadow-lg backdrop-blur-sm ">
                      <h2 className="text-gray-900 p-2 ">project 2</h2>
                      <img
                        className=" p-2"
                        src="/public/images/2.webp"
                        alt=""
                      />
                      <div className="p-2 flex justify-between">
                        <a
                          className="  border-solid border-2 border-salt-500 text-xs p-2"
                          href=""
                        >
                          Preview
                        </a>
                        <a
                          className=" border-solid border-2 border-salt-500 text-xs p-2"
                          href=""
                        >
                          GitHub
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className=" h-full m-2 shadow-lg  flex-[1_1_1%]"></div>
                  <div className=" flex flex-col  gap-20 p-8 pr-0 flex-[1_1_49%]">
                    <div className=" mt-[170px] flex flex-col gap-2 bg-blue-100/10 p-2 shadow-lg backdrop-blur-sm ">
                      <h2 className="text-gray-900 p-2 ">project 1</h2>
                      <img
                        className=" p-2"
                        src="/public/images/3.webp"
                        alt=""
                      />
                      <div className="p-2 flex justify-between">
                        <a
                          className="  border-solid border-2 border-salt-500 text-xs p-2"
                          href=""
                        >
                          Preview
                        </a>
                        <a
                          className=" border-solid border-2 border-salt-500 text-xs p-2"
                          href=""
                        >
                          GitHub
                        </a>
                      </div>
                    </div>
                    <div className=" flex flex-col gap-2 bg-blue-100/10 p-2 shadow-lg backdrop-blur-sm ">
                      <h2 className="text-gray-900 p-2 ">project 2</h2>
                      <img
                        className=" p-2"
                        src="/public/images/4.webp"
                        alt=""
                      />
                      <div className="p-2 flex justify-between">
                        <a
                          className="  border-solid border-2 border-salt-500 text-xs p-2"
                          href=""
                        >
                          Preview
                        </a>
                        <a
                          className=" border-solid border-2 border-salt-500 text-xs p-2"
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
        )}
      </AnimatePresence>
      <ComputersCanvas
        exit={exit}
        setExit={setExit}
        showUI={showUi}
        setShowUI={setShowUi}
      />

      <div className=" hidden absolute xs:bottom-10 bottom-32 w-full flex justify-center items-center">
        <a href="#about">
          <div className=" w-[35px] h-[64px] rounded-3xl border-4 border-secondary flex justify-center items-start p-2">
            <motion.div
              animate={{ y: [0, 24, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: 'loop',
              }}
              className=" w-3 h-3 rounded-full bg-secondary mb-1"
            ></motion.div>
          </div>
        </a>
      </div>
    </section>
  );
};

export default Hero;
