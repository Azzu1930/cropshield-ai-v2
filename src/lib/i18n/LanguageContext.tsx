'use client';

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { SupportedLanguage, TranslationDictionary } from './types';
import { getTranslation } from './index';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: TranslationDictionary;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cropshield_lang') as SupportedLanguage | null;
      if (saved && (saved === 'en' || saved === 'te' || saved === 'hi')) {
        setLanguageState(saved);
      }
    } catch {
      // localStorage may be unavailable
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('cropshield_lang', lang);
    } catch {
      // Ignore
    }
  };

  const t = getTranslation(language);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      language: 'en',
      setLanguage: () => {},
      t: getTranslation('en'),
    };
  }
  return context;
}
