"use client";
import React, { createContext, useCallback, useContext, useSyncExternalStore } from "react";
import { translations } from "@/translations";

type Language = "en" | "es";
type TranslationNode = string | { [key: string]: TranslationNode };

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);
const LANGUAGE_CHANGE_EVENT = "kts-language-change";

function isLanguage(value: string | null): value is Language {
  return value === "en" || value === "es";
}

function getStoredLanguage(): Language {
  if (typeof window === "undefined") return "en";
  const savedLanguage = window.localStorage.getItem("language");
  return isLanguage(savedLanguage) ? savedLanguage : "en";
}

function subscribeToLanguageChanges(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};

  const handleStorage = (event: StorageEvent) => {
    if (event.key === "language") onStoreChange();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(LANGUAGE_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(LANGUAGE_CHANGE_EVENT, onStoreChange);
  };
}

function getServerLanguage(): Language {
  return "en";
}

function findTranslation(source: TranslationNode, parts: string[]): string | undefined {
  let current: TranslationNode | undefined = source;

  for (const part of parts) {
    if (typeof current === "object" && current !== null && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }

  return typeof current === "string" ? current : undefined;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const language = useSyncExternalStore(
    subscribeToLanguageChanges,
    getStoredLanguage,
    getServerLanguage
  );

  const setLanguage = useCallback((lang: Language) => {
    window.localStorage.setItem("language", lang);
    window.dispatchEvent(new Event(LANGUAGE_CHANGE_EVENT));
  }, []);

  const t = useCallback((path: string): string => {
    const parts = path.split(".");
    return (
      findTranslation(translations[language] as TranslationNode, parts) ??
      findTranslation(translations.en as TranslationNode, parts) ??
      path
    );
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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
