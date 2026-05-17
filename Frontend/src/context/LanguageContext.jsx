import { createContext, useContext, useEffect, useState } from "react";

const LanguageContext = createContext();

export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
  { code: "mr", label: "मराठी" },
];

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem("language") || "en";
    return LANGUAGES.some((l) => l.code === saved) ? saved : "en";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const changeLanguage = (lang) => {
    if (LANGUAGES.some((l) => l.code === lang)) setLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

/** Pick translated object; merges with English for missing keys */
export const useT = (translations) => {
  const { language } = useLanguage();
  const en = translations.en ?? {};
  const selected = translations[language];
  if (!selected || language === "en") return en;
  return { ...en, ...selected };
};

/** Inline string by language */
export const pickLang = (en, hi, mr, language) => {
  if (language === "hi") return hi;
  if (language === "mr") return mr;
  return en;
};
