/* eslint-disable react/no-unescaped-entities */

import { Tilt } from 'react-tilt';

const defaultOptions = {
  reverse: false, // reverse the tilt direction
  max: 35, // max tilt rotation (degrees)
  perspective: 1000, // Transform perspective, the lower the more extreme the tilt gets.
  scale: 1.1, // 2 = 200%, 1.5 = 150%, etc..
  speed: 1000, // Speed of the enter/exit transition
  transition: true, // Set a transition on enter/exit.
  axis: null, // What axis should be disabled. Can be X or Y.
  reset: true, // If the tilt effect has to be reset on exit.
  easing: 'cubic-bezier(.03,.98,.52,.99)', // Easing on enter/exit.
};
const About = () => {
  return (
    <section
      id="about"
      className=" m-auto mt-[250px] mb-[128px] p-6 md:p-24 items-center flex flex-col md:flex-row w-[100%] max-w-[1024px] gap-10 border border-gray-500 rounded-lg backdrop-blur-[4px] z-[999]"
    >
      <div className="text-section flex flex-col ">
        <div className=" mt-5 mb-5 flex items-center">
          <h2 className=" flex-[70%] text-2xl text-gray-200">About me</h2>{' '}
          <span className=" h-[1px] bg-slate-500 w-[100%]" />
        </div>
        <div>
          <p className=" mt-3 mb-3 text-gray-400">
            Hi! I'm Muhannad Alobaidi. Before diving into the world of web
            development in 2019, I had been immersed in the gaming industry. The
            skills I cultivated in game development laid the foundation for my
            passion in web creation. That spark was ignited further when I
            realized the potential to bring ideas to life on the web.
          </p>
          <p className=" mt-3 mb-3 text-gray-400">
            Today, I build websites that are not only aesthetically pleasing but
            also user-friendly. Every new project is an opportunity for me to
            transform a vision into a tangible digital experience. I'm always
            eager and excited about the next creation I'll embark on!
          </p>
        </div>
      </div>
      <Tilt options={defaultOptions}>
        <img
          className=" rounded-full max-w-xs"
          src="/images/muhannad.jpg"
          alt=""
        />
      </Tilt>
    </section>
  );
};

export default About;
