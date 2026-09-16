import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
} from "../types/language";

import type { Language } from "../types/language";

import en from "../locales/en";
import pl from "../locales/pl";

const STORAGE_KEY = "plpe-language";

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: typeof en;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

interface Props {
  children: React.ReactNode;
}

export function LanguageProvider({ children }: Props) {
  const [language, setLanguageState] =
    useState<Language>(DEFAULT_LANGUAGE);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (
      saved &&
      SUPPORTED_LANGUAGES.includes(saved as Language)
    ) {
      setLanguageState(saved as Language);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    localStorage.setItem(STORAGE_KEY, lang);
    setLanguageState(lang);
  };

  const t = useMemo(() => {
    switch (language) {
      case "pl":
        return pl;

      case "en":
      default:
        return en;
    }
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguageContext() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguageContext must be used inside LanguageProvider"
    );
  }

  return context;
}