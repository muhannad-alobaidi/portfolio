import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { styles } from '../styles';
import { navLinks } from './../constants';
import { logo, menu, close } from '../assets';

const Navbar = () => {
  const [active, setactive] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Set initial state
    handleResize();

    // Add event listener for window resize
    window.addEventListener('resize', handleResize);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="w-full flex justify-center items-center">
      {/* converts the filled logo raster into a glowing neon outline:
          dilated alpha minus the original alpha leaves only the contour */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <filter id="neon-outline">
          <feMorphology
            operator="dilate"
            radius="1.4"
            in="SourceAlpha"
            result="thick"
          />
          <feComposite in="thick" in2="SourceAlpha" operator="out" result="ring" />
          <feFlood floodColor="#4be8ff" result="col" />
          <feComposite in="col" in2="ring" operator="in" result="outline" />
          <feGaussianBlur in="outline" stdDeviation="2.2" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="glow" />
            <feMergeNode in="outline" />
          </feMerge>
        </filter>
      </svg>
      <nav
        className={`${styles.paddingX} w-full lg:w-1/2 items-center py-5 fixed top-0 z-50 bg-[#04101a]/40 shadow-lg backdrop-blur-md rounded-full mt-6 border border-neon/15`}
      >
        <div className="w-full flex justify-between items-center  mx-auto">
          <Link
            to="/"
            className="flex items-center gap-2"
            onClick={() => {
              setactive('');
              window.scrollTo(0, 0);
            }}
          >
            <img
              src={logo}
              alt="logo"
              className="w-16 h-9 object-contain filter-[url(#neon-outline)]"
            />
          </Link>
          {/* Mobile Navigation */}
          <div className="sm:hidden flex flex-1 justify-end items-center">
            <img
              src={active ? close : menu}
              alt="menu"
              className="w-[28px] h-[28px] object-contain cursor-pointer"
              onClick={() => setactive(active ? '' : 'menu')}
            />
          </div>
          <ul
            className={`${
              isMobile && active ? 'flex' : 'hidden'
            } flex-col gap-4 p-12 pl-6 absolute top-20 right-0 mx-4 my-2 min-w-[140px]  bg-[#04101a]/70 z-50 shadow-lg backdrop-blur-lg rounded-lg mt-6 border border-neon/15 `}
          >
            {navLinks.map(nav => (
              <li
                key={nav.id}
                className={`${
                  active === nav.title ? 'text-white' : 'text-secondary'
                } font-poppins font-medium cursor-pointer text-[16px]`}
                onClick={() => {
                  setactive(nav.title);
                  window.scrollTo(0, document.getElementById(nav.id).offsetTop);
                }}
              >
                <a href={`#${nav.id}`}>{nav.title}</a>
              </li>
            ))}
          </ul>
          {/* Desktop Navigation */}
          <ul className="list-none hidden sm:flex flex-row gap-10">
            {navLinks.map(nav => (
              <li
                key={nav.id}
                className={`${
                  active === nav.title ? 'text-white' : 'text-secondary'
                } hover:text-white text-[18px] font-medium cursor-pointer`}
                onClick={() => setactive(nav.title)}
              >
                <a href={`#${nav.id}`}>{nav.title}</a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
