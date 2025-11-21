// useTranslation Hook - Moved to @globul-cars/core package
// Updated imports to use package aliases

import * as React from 'react';
import { useLanguage } from '../contexts';

type Interpolations = Record<string, string | number>;

export interface LegacyTranslationAPI {
  language: 'bg' | 'en';
  setLanguage: (lang: 'bg' | 'en') => void;
  t: (key: string, defaultValue?: string, interpolations?: Interpolations) => string;
}

// Dummy provider kept for test files or legacy renders that still wrap components.
// It simply renders children because the real context is provided at the app root (LanguageProvider).
export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;

export const useTranslation = (): LegacyTranslationAPI => {
  const { t: baseT, language, setLanguage } = useLanguage();

  const wrappedT = React.useCallback((key: string, defaultValue?: string, interpolations?: Interpolations) => {
    let result = baseT(key);
    // Apply fallback defaultValue if the key was missing (result returns the key itself as last resort)
    if (result === key && defaultValue) {
      result = defaultValue;
    }
    if (typeof result === 'string' && interpolations) {
      Object.entries(interpolations).forEach(([token, val]) => {
        result = result.replace(new RegExp(`{{${token}}}`, 'g'), String(val));
      });
    }
    return result;
  }, [baseT]);

  return { language, setLanguage, t: wrappedT };
};

export default useTranslation;
