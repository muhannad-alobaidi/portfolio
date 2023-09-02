import { motion } from 'framer-motion';
import { styles } from '../styles';
import { ComputersCanvas } from './canvas';
import { useState, useEffect } from 'react';

const Hero = () => {
  const [showUi, setShowUi] = useState(false);
  const [exit, setExit] = useState(false);

  useEffect(() => {
    if (showUi) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }

    // Cleanup when component is unmounted
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [showUi]);

  return (
    <section className="relative flex justify-center  mb-[128px]  bg-cover  h-screen mx-auto">
      <div
        className={` ${styles.paddingX} 
        absolute inset-0 top-[120px] max-w-[1440px] mx-auto
        flex flex-row items-start gap-5 `}
      >
        <div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 2 }}
            className={` text-white`}
          >
            Hi, my name is
          </motion.p>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 2 }}
            className={`${styles.heroHeadText} text-white`}
          >
            <span className="text-[#5ea9ff]">Muhannad Alobaidi</span>{' '}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 3 }}
            className={`${styles.heroSubText} text-white-100`}
          >
            Crafting the modern web, pixel by pixel.
          </motion.p>
        </div>
      </div>
      <div className=" h-[350px] absolute bottom-0 z-50 w-[100%] mb-28"></div>
      <ComputersCanvas
        exit={exit}
        setExit={setExit}
        showUI={showUi}
        setShowUI={setShowUi}
      />
      {!showUi && (
        <div className="  absolute xs:bottom-10 bottom-4 md:bottom-40 w-full flex justify-center items-center">
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
      )}
    </section>
  );
};

export default Hero;
