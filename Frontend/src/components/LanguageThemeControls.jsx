import { Sun, Moon } from "lucide-react";
import { LANGUAGES, useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";

/** Compact language + theme toggles for pages without Navbar */
export default function LanguageThemeControls({ className = "" }) {
  const { language, changeLanguage } = useLanguage();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <select
        value={language}
        onChange={(e) => changeLanguage(e.target.value)}
        className="border border-gray-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-400"
        aria-label="Language"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={toggleTheme}
        className="p-2.5 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-amber-300 hover:ring-2 hover:ring-blue-400"
        aria-label={isDark ? "Light mode" : "Dark mode"}
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>
    </div>
  );
}
