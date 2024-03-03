/* eslint-disable react/no-unescaped-entities */

import Lottie from 'lottie-react';
import webdev from '../assets/webdev-animation.json';

const Contact = () => {
  return (
    <section
      id="contact"
      className=" m-auto mt-[250px] p-6 md:p-24 items-center flex flex-col md:flex-row w-[100%] max-w-[1024px] gap-10 border border-gray-500 rounded-lg backdrop-blur-[4px] z-[999] "
    >
      <div className="text-section flex flex-col items-center md:flex-row">
        <div className=" mt-5 mb-5 flex  items-center w-full ">
          <div className="flex gap-4 flex-col">
            <a
              href="https://www.linkedin.com/in/muhannad-alobaidi/"
              target="_blank"
              rel="noreferrer"
              className="flex gap-4 items-center leading-none font-[200]"
            >
              <img
                src="/src/assets/someIcons/linkedin.png"
                alt=""
                height="24px"
                width="24px"
                className=" filter invert"
              />
              <span className=" h-fit text-[12px]">
                linkedin.com/in/muhannad-alobaidi/
              </span>
            </a>
            <a
              href="mailto:muhannad.alobaidi@yahoo.com"
              target="_blank"
              rel="noreferrer"
              className="flex gap-4 items-center leading-none font-[200]"
            >
              <img
                src="/src/assets/someIcons/email.png"
                alt=""
                height="24px"
                width="24px"
                className=" filter invert"
              />
              <span className=" h-fit text-[12px]">
                muhannad.alobaidi@yahoo.com
              </span>
            </a>
            <div className="flex gap-4 items-center leading-none font-[200]">
              <img
                src="/src/assets/someIcons/phone.png"
                alt=""
                height="24px"
                width="24px"
                className=" filter invert"
              />
              <span className=" h-fit text-[12px]">+358401656648</span>
            </div>
          </div>
        </div>
        <div>
          <Lottie animationData={webdev} loop={true} />
        </div>
      </div>
    </section>
  );
};

export default Contact;
