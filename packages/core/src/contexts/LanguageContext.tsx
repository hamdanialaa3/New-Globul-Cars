// Global Language Context for Smart Translation System
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations } from '../locales/translations';

export type Language = 'bg' | 'en' | 'ar';

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

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('globul-cars-language');
    if (saved === 'bg' || saved === 'en' || saved === 'ar') return saved as Language;
    return 'bg';
  });

  // Smart translation function with nested object support
  const t = (key: string): string => {
    // Validate input
    if (!key || typeof key !== 'string') {
      return key || '';
    }

    // Split key into path parts
    const parts = key.split('.').filter(p => p.length > 0);
    if (parts.length === 0) {
      return key;
    }

    // Helper function to traverse nested object
    const getNestedValue = (obj: any, pathParts: string[]): string | null => {
      let current = obj;
      for (const part of pathParts) {
        if (current && typeof current === 'object' && part in current) {
          current = current[part];
        } else {
          return null; // Path not found
        }
      }
      return typeof current === 'string' ? current : null;
    };

    // Cast translations to bypass 'as const' type restrictions
    const trans = translations as Record<string, any>;

    // Try current language first
    const langData = trans[language];
    if (langData) {
      const value = getNestedValue(langData, parts);
      if (value !== null) {
        return value;
      }
    }

    // Fallback to English
    const enData = trans.en;
    if (enData) {
      const fallbackValue = getNestedValue(enData, parts);
      if (fallbackValue !== null) {
        return fallbackValue;
      }
    }

    // Return key if translation not found
    return key;
  };

  // Smart language setter that persists to localStorage and triggers global update
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('globul-cars-language', lang);

    // Trigger a custom event for any components that need to know about language changes
    window.dispatchEvent(new CustomEvent('languageChange', {
      detail: { language: lang }
    }));

    // Update document language attribute for accessibility
    document.documentElement.lang = lang === 'bg' ? 'bg-BG' : (lang === 'ar' ? 'ar-SA' : 'en-US');

    // Update document direction
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

    if (process.env.NODE_ENV === 'development') {
      logger.info('Language changed', { language: lang.toUpperCase() });
    }
  };

  const toggleLanguage = () => {
    // Cycle through languages: bg -> en -> ar -> bg
    if (language === 'bg') setLanguage('en');
    else if (language === 'en') setLanguage('ar');
    else setLanguage('bg');
  };

  // Effect to set initial document language
  useEffect(() => {
    document.documentElement.lang = language === 'bg' ? 'bg-BG' : (language === 'ar' ? 'ar-SA' : 'en-US');
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    toggleLanguage,
    t
  };

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

