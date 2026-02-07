"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { translations, type Language } from "@/lib/translations";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations;
  getText: <T extends { nl: string; en: string }>(obj: T) => string;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

const STORAGE_KEY = "labeff_language";

function getInitialLanguage(): Language {
  if (typeof window === "undefined") return "nl";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "en" || stored === "nl") return stored;
  return "nl";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }, []);

  const getText = useCallback(
    <T extends { nl: string; en: string }>(obj: T): string => {
      return obj[language];
    },
    [language],
  );

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, t: translations, getText }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
