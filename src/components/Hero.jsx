import { motion, AnimatePresence } from 'framer-motion';
import { styles } from '../styles';
import { ComputersCanvas } from './canvas';
import { useState } from 'react';
import ScreenElements from './ScreenElements';

const Hero = () => {
  const [showUi, setShowUi] = useState(false);
  const [exit, setExit] = useState(false);

  return (
    <section className="relative flex justify-center   bg-cover  h-screen mx-auto">
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
        {showUi && <ScreenElements setShowUi={setShowUi} />}
      </AnimatePresence>
      <ComputersCanvas
        exit={exit}
        setExit={setExit}
        showUI={showUi}
        setShowUI={setShowUi}
      />

      <div className="  absolute xs:bottom-10 bottom-32 w-full flex justify-center items-center">
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
