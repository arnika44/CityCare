"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type LanguageContextType = {
  language: string;
  setLanguage: (language: string) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

const languageCodes: Record<string, string> = {
  English: "en",
  Hindi: "hi",
  Marathi: "mr",
  Bengali: "bn",
  Tamil: "ta",
  Telugu: "te",
  Gujarati: "gu",
  Kannada: "kn",
  Malayalam: "ml",
  Punjabi: "pa",
  Odia: "or",
  Assamese: "as",
  Urdu: "ur",
};

function setGoogleTranslateCookie(languageCode: string) {
  document.cookie = `googtrans=/en/${languageCode}; path=/`;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState("English");

  useEffect(() => {
    const savedLanguage =
      localStorage.getItem("citycare-language") || "English";

    setLanguageState(savedLanguage);

    const languageCode = languageCodes[savedLanguage] || "en";

    setGoogleTranslateCookie(languageCode);
  }, []);

  const setLanguage = (newLanguage: string) => {
    const languageCode = languageCodes[newLanguage] || "en";

    setLanguageState(newLanguage);
    localStorage.setItem("citycare-language", newLanguage);

    setGoogleTranslateCookie(languageCode);

    window.location.reload();
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
}