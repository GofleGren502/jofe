import { useTranslation } from "react-i18next";
import { useEffect } from "react";

export function useLanguage() {
  const { i18n } = useTranslation();
  
  const changeLanguage = (lang: "ru" | "kk") => {
    i18n.changeLanguage(lang);
    // Save to localStorage
    localStorage.setItem("language", lang);
  };
  
  // Load language from localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem("language") as "ru" | "kk" | null;
    if (savedLang && (savedLang === "ru" || savedLang === "kk")) {
      i18n.changeLanguage(savedLang);
    }
  }, [i18n]);
  
  return {
    currentLanguage: i18n.language as "ru" | "kk",
    changeLanguage,
  };
}
