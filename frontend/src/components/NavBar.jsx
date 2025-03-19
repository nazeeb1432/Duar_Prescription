import React from 'react'
import { assets } from '../assets/assets'
import { NavLink } from 'react-router-dom';

const Navbar = () => {
    return (
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
             
            <div className="flex-shrink-0 flex items-center">
              <NavLink to="/" className="text-2xl font-bold text-blue-600">
              <img src={assets.logo} alt=""/>
              </NavLink>
            </div>
  
            {/* Navigation links */}
            <div className="hidden sm:flex sm:space-x-8 sm:items-center">
              <ul className="flex space-x-8">
                <li>
                  <NavLink
                    to="/"
                    className={({ isActive }) =>
                      `text-gray-700 hover:text-blue-600 ${
                        isActive ? 'font-bold' : ''
                      }`
                    }
                  >
                    Home
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/all-doctors"
                    className={({ isActive }) =>
                      `text-gray-700 hover:text-blue-600 ${
                        isActive ? 'font-bold' : ''
                      }`
                    }
                  >
                    All Doctors
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/about"
                    className={({ isActive }) =>
                      `text-gray-700 hover:text-blue-600 ${
                        isActive ? 'font-bold' : ''
                      }`
                    }
                  >
                    About
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/contact"
                    className={({ isActive }) =>
                      `text-gray-700 hover:text-blue-600 ${
                        isActive ? 'font-bold' : ''
                      }`
                    }
                  >
                    Contact
                  </NavLink>
                </li>
              </ul>
            </div>
  
            {/* Create Account button */}
            <div className="flex items-center">
              <NavLink
                to="/create-account"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
              >
                Create Account
              </NavLink>
            </div>
          </div>
        </div>
      </nav>
    );
  };
  
  export default Navbar;
