import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { Lang } from "../i18n";

interface LangContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  isRTL: boolean;
}

const LangContext = createContext<LangContextType | undefined>(undefined);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem("medassist-lang");
    return (saved === "ar" || saved === "en") ? saved : "en";
  });

  const isRTL = lang === "ar";

  useEffect(() => {
    localStorage.setItem("medassist-lang", lang);
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang, isRTL]);

  const setLang = (l: Lang) => setLangState(l);
  const toggleLang = () => setLangState((prev) => (prev === "en" ? "ar" : "en"));

  return (
    <LangContext.Provider value={{ lang, setLang, toggleLang, isRTL }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const context = useContext(LangContext);
  if (!context) throw new Error("useLang must be used within LangProvider");
  return context;
}
