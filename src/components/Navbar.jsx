/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { styles } from '../styles';
import { navLinks } from './../constants';
import { logo, menu, close } from '../assets';

const Navbar = () => {
  const [active, setactive] = useState('');
  return (
    <div className="w-full flex justify-center items-center">
      <nav
        className={`${styles.paddingX} w-full lg:w-1/2 items-center py-5 fixed top-0 z-50 bg-slate-600 bg-opacity-10 shadow-lg backdrop-blur-md rounded-full mt-6 border border-gray-600`}
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
          {/* Mobile Navigation */}
          <div className="sm:hidden flex flex-1 justify-end items-center">
            <img
              src={active ? close : menu}
              alt="menu"
              className="w-[28px] h-[28px] object-contain cursor-pointer"
              onClick={() => setactive(!active)}
            />
          </div>
          <ul
            className={`${
              active ? 'flex' : 'hidden'
            } flex-col gap-4 p-12 pl-6 absolute top-20 right-0 mx-4 my-2 min-w-[140px]  bg-slate-600 bg-opacity-20 z-50 shadow-lg backdrop-blur-lg rounded-lg mt-6 border border-gray-600 `}
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
