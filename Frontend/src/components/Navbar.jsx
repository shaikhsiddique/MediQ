import React, { useState } from 'react';

import {
  Heart,
  Menu,
  X,
  LayoutDashboard,
  Stethoscope
} from 'lucide-react';

import { NavLink } from 'react-router-dom';

import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';

const Navbar = () => {

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { language, changeLanguage } = useLanguage();
  const { user, isLoggedIn, role } = useUser();

  const dashboardPath =
    role === 'doctor' ? '/doctor-dashboard' : '/dashboard';

  const translations = {

    en: {
      home: "Home",
      about: "About Us",
      how: "How It Works",
      dashboard: "Dashboard",
      doctor: "Doctor Login",
      start: "Get Started",
      profile: "Profile",
      logout: "Logout",
    },

    hi: {
      home: "होम",
      about: "हमारे बारे में",
      how: "यह कैसे काम करता है",
      dashboard: "डैशबोर्ड",
      doctor: "डॉक्टर लॉगिन",
      start: "शुरू करें",
      profile: "प्रोफाइल",
      logout: "लॉगआउट",
    }
  };

  const t = translations[language];

  const navLinkClass = ({ isActive }) =>
    isActive
      ? "text-blue-600 font-semibold border-b-2 border-blue-600 pb-1 transition-all"
      : "text-gray-700 hover:text-blue-600 transition-colors font-medium";

  return (

    <nav className="bg-white/90 backdrop-blur-md shadow-md fixed w-full top-0 z-50 border-b border-gray-100">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <NavLink
            to="/"
            className="flex items-center space-x-2"
          >

            <div className="bg-gradient-to-r from-blue-500 to-green-500 p-2 rounded-xl shadow-md">
              <Heart className="w-6 h-6 text-white" />
            </div>

            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Smart HealthCare
            </span>

          </NavLink>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">

            <NavLink
              to="/"
              className={navLinkClass}
            >
              {t.home}
            </NavLink>

           

            <NavLink
              to="/#how-it-works"
              className={navLinkClass}
            >
              {t.how}
            </NavLink>

            {isLoggedIn ? (
              <NavLink
                to={dashboardPath}
                className={({ isActive }) =>
                  isActive
                    ? "flex items-center gap-2 text-blue-600 font-semibold border-b-2 border-blue-600 pb-1"
                    : "flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors font-medium"
                }
              >
                <LayoutDashboard className="w-5 h-5" />
                {t.dashboard}
              </NavLink>
            ) : (
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  isActive
                    ? "flex items-center gap-2 text-green-600 font-semibold border-b-2 border-green-600 pb-1"
                    : "flex items-center gap-2 text-gray-700 hover:text-green-600 transition-colors font-medium"
                }
              >
                <Stethoscope className="w-5 h-5" />
                {t.doctor}
              </NavLink>
            )}

            {/* Language Dropdown */}
            <select
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
            </select>

            {/* Login/Profile */}
            {isLoggedIn && user ? (
              <>
                {role === "patient" && (
                  <NavLink to="/profile" className={navLinkClass}>
                    {t.profile}
                  </NavLink>
                )}
                <NavLink
                  to={dashboardPath}
                  className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-5 py-2 rounded-full flex items-center gap-3 hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <div className="w-8 h-8 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium">{user?.name}</span>
                </NavLink>
                <NavLink
                  to="/logout"
                  className="text-gray-600 hover:text-red-600 font-medium text-sm"
                >
                  {t.logout}
                </NavLink>
              </>
            ) : (
              <NavLink
                to="/login"
                className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-2 rounded-full hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                {t.start}
              </NavLink>
            )}

          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >

            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}

          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (

          <div className="md:hidden pb-5 pt-2">

            <div className="flex flex-col space-y-4">

              <NavLink
                to="/"
                className={navLinkClass}
                onClick={() => setIsMenuOpen(false)}
              >
                {t.home}
              </NavLink>


              <NavLink
                to="/#how-it-works"
                className={navLinkClass}
                onClick={() => setIsMenuOpen(false)}
              >
                {t.how}
              </NavLink>

              {isLoggedIn ? (
                <NavLink
                  to={dashboardPath}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 text-blue-600 font-semibold"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  {t.dashboard}
                </NavLink>
              ) : (
                <NavLink
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 text-gray-700"
                >
                  <Stethoscope className="w-5 h-5" />
                  {t.doctor}
                </NavLink>
              )}

              {/* Mobile Language Dropdown */}
              <select
                value={language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="border border-gray-300 rounded-xl px-3 py-2 outline-none"
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
              </select>

              {/* Mobile Login/Profile */}
              {isLoggedIn && user ? (
                <>
                  {role === "patient" && (
                    <NavLink
                      to="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className={navLinkClass}
                    >
                      {t.profile}
                    </NavLink>
                  )}
                  <NavLink
                    to={dashboardPath}
                    onClick={() => setIsMenuOpen(false)}
                    className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-3 rounded-full flex items-center justify-center gap-3"
                  >
                    <div className="w-8 h-8 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span>{user?.name}</span>
                  </NavLink>
                  <NavLink
                    to="/logout"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-center text-red-600 font-medium"
                  >
                    {t.logout}
                  </NavLink>
                </>
              ) : (
                <NavLink
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-3 rounded-full text-center"
                >
                  {t.start}
                </NavLink>
              )}

            </div>

          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;