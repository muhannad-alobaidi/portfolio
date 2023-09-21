import { motion, AnimatePresence } from 'framer-motion';

const techStack = ({ img, name, delay }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        transition={{ delay: 0.1 * delay }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className=" hover:shadow-xl transition-all ease-in  flex flex-col justify-between items-center w-[88px] border border-gray-500 rounded-lg p-2 "
      >
        <img
          className="mb-1 h-[60px]"
          height={60}
          width={60}
          src={img}
          alt=""
        />
        <span className="text-gray-400 text-[12px]">{name}</span>
      </motion.div>
    </AnimatePresence>
  );
};

export default techStack;
