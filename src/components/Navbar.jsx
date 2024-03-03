/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { styles } from '../styles';
import { navLinks } from './../constants';
import { logo, menu, close } from '../assets';

const Navbar = () => {
  const [active, setactive] = useState('');
  return (
    <nav
      className={`${styles.paddingX} w-full items-center py-5 fixed top-0 z-50 bg-transparen shadow-md backdrop-blur-md`}
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
          <img src={logo} alt="logo" className="w-16 h-9 object-cont7ain" />
        </Link>
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
  );
};

export default Navbar;
