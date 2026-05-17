import React, { useState, useRef, useEffect } from 'react';
import {
  Heart,
  Menu,
  X,
  LayoutDashboard,
  Stethoscope,
  Sun,
  Moon,
  ChevronDown,
  User,
  Bell,
  LogOut,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useLanguage, useT, LANGUAGES } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';

/* ─── translations ─────────────────────────────────────────── */
const TRANSLATIONS = {
  en: {
    home: 'Home', how: 'How It Works', dashboard: 'Dashboard',
    doctorLogin: 'Doctor Login', getStarted: 'Get Started',
    profile: 'Profile', guardian: 'Guardian Alert', logout: 'Logout',
    themeLight: 'Switch to light mode', themeDark: 'Switch to dark mode',
  },
  hi: {
    home: 'होम', how: 'यह कैसे काम करता है', dashboard: 'डैशबोर्ड',
    doctorLogin: 'डॉक्टर लॉगिन', getStarted: 'शुरू करें',
    profile: 'प्रोफाइल', guardian: 'गार्डियन अलर्ट', logout: 'लॉगआउट',
    themeLight: 'लाइट मोड', themeDark: 'डार्क मोड',
  },
  mr: {
    home: 'मुख्यपृष्ठ', how: 'हे कसे काम करते', dashboard: 'डॅशबोर्ड',
    doctorLogin: 'डॉक्टर लॉगिन', getStarted: 'सुरू करा',
    profile: 'प्रोफाइल', guardian: 'गार्डियन अलर्ट', logout: 'लॉगआउट',
    themeLight: 'लाइट मोड', themeDark: 'डार्क मोड',
  },
};

/* ─── small reusable pieces ────────────────────────────────── */
const navLinkBase =
  'text-sm font-medium transition-colors duration-150';
const navActive =
  `${navLinkBase} text-blue-600 dark:text-blue-400`;
const navIdle =
  `${navLinkBase} text-gray-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400`;

function NavItem({ to, children, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) => (isActive ? navActive : navIdle)}
    >
      {children}
    </NavLink>
  );
}

/* ─── user avatar dropdown ─────────────────────────────────── */
function UserMenu({ user, role, t, dashboardPath }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initial = user?.name?.charAt(0).toUpperCase() ?? '?';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 shadow-sm hover:shadow-md transition-shadow"
      >
        <span className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white text-xs font-bold select-none">
          {initial}
        </span>
        <span className="text-sm font-medium text-gray-700 dark:text-slate-200 max-w-[100px] truncate">
          {user?.name}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700">
            <p className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wide">
              {role}
            </p>
            <p className="text-sm font-semibold text-gray-800 dark:text-slate-100 truncate">
              {user?.name}
            </p>
          </div>

          <div className="py-1">
            <NavLink
              to={dashboardPath}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" /> {t.dashboard}
            </NavLink>

            {role === 'patient' && (
              <>
                <NavLink
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <User className="w-4 h-4" /> {t.profile}
                </NavLink>
                <NavLink
                  to="/guardian"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Bell className="w-4 h-4" /> {t.guardian}
                </NavLink>
              </>
            )}
          </div>

          <div className="border-t border-gray-100 dark:border-slate-700 py-1">
            <NavLink
              to="/logout"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-4 h-4" /> {t.logout}
            </NavLink>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── main navbar ──────────────────────────────────────────── */
const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { language, changeLanguage } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const { user, isLoggedIn, role } = useUser();

  const t = useT(TRANSLATIONS);
  const dashboardPath = role === 'doctor' ? '/doctor-dashboard' : '/dashboard';

  const closeMobile = () => setMobileOpen(false);

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-gray-100 dark:border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-6">

          {/* ── Logo ── */}
          <NavLink to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="bg-gradient-to-br from-blue-500 to-green-500 p-2 rounded-xl shadow">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-green-600 dark:from-blue-400 dark:to-green-400 bg-clip-text text-transparent leading-tight">
              Smart HealthCare
            </span>
          </NavLink>

          {/* ── Desktop nav links ── */}
          <div className="hidden md:flex items-center gap-6 flex-1">
            <NavItem to="/">{t.home}</NavItem>
            <NavItem to="/#how-it-works">{t.how}</NavItem>

            {!isLoggedIn && (
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 ${isActive ? navActive : navIdle}`
                }
              >
                <Stethoscope className="w-4 h-4" />
                {t.doctorLogin}
              </NavLink>
            )}
          </div>

          {/* ── Desktop right controls ── */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Language selector */}
            <select
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
              className="text-sm border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-1.5 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
              aria-label="Language"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>{lang.label}</option>
              ))}
            </select>

            {/* Theme toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? t.themeLight : t.themeDark}
              className="p-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-amber-300 hover:shadow-md transition-shadow"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Auth button / user menu */}
            {isLoggedIn && user ? (
              <UserMenu user={user} role={role} t={t} dashboardPath={dashboardPath} />
            ) : (
              <NavLink
                to="/login"
                className="bg-gradient-to-r from-blue-600 to-green-600 text-white text-sm font-semibold px-5 py-2 rounded-full shadow hover:shadow-lg hover:scale-[1.03] active:scale-100 transition-all duration-200"
              >
                {t.getStarted}
              </NavLink>
            )}
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            type="button"
            className="md:hidden p-2 rounded-xl text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col gap-1">
            {/* Nav links */}
            {[
              { to: '/', label: t.home },
              { to: '/#how-it-works', label: t.how },
            ].map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={closeMobile}
                className={({ isActive }) =>
                  `px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}

            {!isLoggedIn && (
              <NavLink
                to="/login"
                onClick={closeMobile}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
              >
                <Stethoscope className="w-4 h-4" /> {t.doctorLogin}
              </NavLink>
            )}

            {isLoggedIn && user && (
              <>
                <div className="my-1 border-t border-gray-100 dark:border-slate-800" />
                <NavLink
                  to={dashboardPath}
                  onClick={closeMobile}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                >
                  <LayoutDashboard className="w-4 h-4" /> {t.dashboard}
                </NavLink>
                {role === 'patient' && (
                  <>
                    <NavLink
                      to="/profile"
                      onClick={closeMobile}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                    >
                      <User className="w-4 h-4" /> {t.profile}
                    </NavLink>
                    <NavLink
                      to="/guardian"
                      onClick={closeMobile}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Bell className="w-4 h-4" /> {t.guardian}
                    </NavLink>
                  </>
                )}
                <NavLink
                  to="/logout"
                  onClick={closeMobile}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <LogOut className="w-4 h-4" /> {t.logout}
                </NavLink>
              </>
            )}

            {/* Utility controls */}
            <div className="mt-2 pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center gap-3">
              <select
                value={language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="flex-1 text-sm border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-400"
                aria-label="Language"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>{lang.label}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={isDark ? t.themeLight : t.themeDark}
                className="p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-amber-300"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>

            {!isLoggedIn && (
              <NavLink
                to="/login"
                onClick={closeMobile}
                className="mt-2 bg-gradient-to-r from-blue-600 to-green-600 text-white text-sm font-semibold px-6 py-3 rounded-full text-center shadow hover:shadow-lg transition-shadow"
              >
                {t.getStarted}
              </NavLink>
            )}

            {isLoggedIn && user && (
              <div className="mt-2 flex items-center gap-3 px-3 py-3 rounded-xl bg-gray-50 dark:bg-slate-800">
                <span className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-slate-100 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 capitalize">{role}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;