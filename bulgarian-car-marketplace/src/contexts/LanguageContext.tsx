import { logger } from '../services/logger-service';
// Global Language Context for Smart Translation System
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { translations } from '../locales';

export type Language = 'bg' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

// Helper function to get nested value from object by dot-notation path
function getNestedTranslation(obj: any, keyPath: string): string {
  const keys = keyPath.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      // Key not found, return the original keyPath
      return keyPath;
    }
  }
  
  // If we found a string value, return it
  if (typeof current === 'string') {
    return current;
  }
  
  // If we got an object or other type, return the original key
  return keyPath;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('globul-cars-language');
      if (saved === 'bg' || saved === 'en') return saved;
    }
    return 'bg';
  });

  // Translation function - gets value from nested object using dot notation
  const t = useCallback((key: string): string => {
    if (!key || typeof key !== 'string') {
      logger.warn('[Translation] Invalid key:', key);
      return key || '';
    }
    
    // Get the language object (bg or en)
    const langObj = translations[language];
    if (!langObj) {
      logger.error('[Translation] Language object not found for:', language);
      return key;
    }
    
    // Try to get the translation for current language
    const translation = getNestedTranslation(langObj, key);
    
    // If translation is found (not equal to key), return it
    if (translation !== key) {
      return translation;
    }
    
    // Fallback to English if current language is not English
    if (language !== 'en') {
      const enObj = translations.en;
      if (enObj) {
        const enTranslation = getNestedTranslation(enObj, key);
        if (enTranslation !== key) {
          logger.warn(`[Translation] Key "${key}" not found in ${language}, using English fallback`);
          return enTranslation;
        }
      }
    }
    
    // If all else fails, log and return the key itself
    logger.warn(`[Translation] Missing translation for key: "${key}" in language: ${language}`);
    return key;
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('globul-cars-language', lang);
    window.dispatchEvent(new CustomEvent('languageChange', { detail: { language: lang } }));
    document.documentElement.lang = lang === 'bg' ? 'bg-BG' : 'en-US';
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'bg' ? 'en' : 'bg');
  }, [language, setLanguage]);

  useEffect(() => {
    document.documentElement.lang = language === 'bg' ? 'bg-BG' : 'en-US';
  }, [language]);

  const value = useMemo<LanguageContextType>(() => ({
    language,
    setLanguage,
    toggleLanguage,
    t
  }), [language, setLanguage, toggleLanguage, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook for using the language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// HOC for class components
export const withLanguage = <P extends object>(
  Component: React.ComponentType<P & LanguageContextType>
) => {
  const WrappedComponent = (props: P) => {
    const languageProps = useLanguage();
    return <Component {...props} {...languageProps} />;
  };
  
  WrappedComponent.displayName = `withLanguage(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

export default LanguageContext;
