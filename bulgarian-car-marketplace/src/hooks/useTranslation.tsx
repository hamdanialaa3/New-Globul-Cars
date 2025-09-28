// src/hooks/useTranslation.tsx
// Translation hook for Bulgarian/English support

import * as React from 'react';
import { useContext, useState, useMemo, useCallback } from 'react';
// TEMP: using minimal translations to allow app to compile
import { translations, BulgarianLanguage } from '../locales/minimal-translations';

interface TranslationContextType {
  language: BulgarianLanguage;
  setLanguage: (lang: BulgarianLanguage) => void;
  t: (key: string, defaultValue?: string, interpolations?: Record<string, string | number>) => string;
}

const TranslationContext = React.createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Force Bulgarian as default language and clear old localStorage
  const [language, setLanguageState] = useState<BulgarianLanguage>(() => {
    if (typeof window !== 'undefined') {
      // Clear any old language setting
      localStorage.removeItem('bulgarian.language');
      // Set Bulgarian as default
      localStorage.setItem('bulgarian.language', 'bg');
      return 'bg';
    }
    return 'bg';
  });

  // Save language to localStorage when it changes
  const setLanguage = useCallback((lang: BulgarianLanguage) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bulgarian.language', lang);
    }
  }, []);

  const t = useCallback((key: string, defaultValue?: string, interpolations?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }

    let result = value || defaultValue || key;

    // Handle interpolation for tokens like {{count}}
    if (typeof result === 'string' && interpolations) {
      Object.entries(interpolations).forEach(([key, val]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        result = result.replace(regex, String(val));
      });
    }

    return result;
  }, [language]);

  const contextValue = useMemo<TranslationContextType>(() => ({
    language,
    setLanguage,
    t
  }), [language, setLanguage, t]);

  return (
    <TranslationContext.Provider value={contextValue}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};