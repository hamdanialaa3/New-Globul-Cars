// Global Language Context for Smart Translation System
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations } from '../locales/translations';
import { logger } from '../services/logger-service';

export type Language = 'bg' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void; // ✅ FIX: Added toggleLanguage
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Get saved language from localStorage or default to Bulgarian
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('globul-cars-language');
    return (saved as Language) || 'bg';
  });

  // Smart translation function with nested object support
  const t = (key: string): string => {
    try {
      const keys = key.split('.');
      let value: any = translations[language];
      
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          // Fallback to English if Bulgarian translation missing
          let fallbackValue: any = translations.en;
          for (const fk of keys) {
            if (fallbackValue && typeof fallbackValue === 'object' && fk in fallbackValue) {
              fallbackValue = fallbackValue[fk];
          } else {
            // If both languages fail, return the key itself as last resort
            if (process.env.NODE_ENV === 'development') {
              logger.warn('Translation missing for key', { key });
            }
            return key;
          }
        }
        return fallbackValue;
      }
    }
    
    return typeof value === 'string' ? value : key;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      logger.warn('Translation error for key', { key, error: (error as Error).message });
    }
    return key;
  }
};  // Smart language setter that persists to localStorage and triggers global update
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('globul-cars-language', lang);
    
    // Trigger a custom event for any components that need to know about language changes
    window.dispatchEvent(new CustomEvent('languageChange', { 
      detail: { language: lang } 
    }));
    
    // Update document language attribute for accessibility
    document.documentElement.lang = lang === 'bg' ? 'bg-BG' : 'en-US';
    
    // Update document direction (both Bulgarian and English are LTR)
    document.documentElement.dir = 'ltr';
    
    if (process.env.NODE_ENV === 'development') {
      logger.info('Language changed', { language: lang.toUpperCase() });
    }
  };

  // ✅ FIX: Toggle language function
  const toggleLanguage = () => {
    const newLang: Language = language === 'bg' ? 'en' : 'bg';
    setLanguage(newLang);
  };

  // Effect to set initial document language
  useEffect(() => {
    document.documentElement.lang = language === 'bg' ? 'bg-BG' : 'en-US';
    document.documentElement.dir = 'ltr';
  }, [language]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    toggleLanguage, // ✅ FIX: Added to context value
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