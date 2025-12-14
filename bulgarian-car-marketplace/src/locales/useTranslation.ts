import { useState, useEffect, useCallback } from 'react';
import { translations } from './translations';

export type Language = 'bg' | 'en';

const STORAGE_KEY = 'app_language';

export function useTranslation() {
  const [language, setLang] = useState<Language>(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    return (stored as Language) || 'bg';
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {}
  }, [language]);

  const t = useCallback((key: string): string => {
    const parts = key.split('.');
    let current: Record<string, unknown> = translations[language as Language];
    for (const p of parts) {
      if (current && typeof current === 'object' && p in current) {
        current = current[p];
      } else {
        return key; // fallback show key
      }
    }
    if (Array.isArray(current)) {
      // allow array index access like key.0
      return current.join('\n');
    }
    return typeof current === 'string' ? current : key;
  }, [language]);

  const setLanguage = (lang: Language) => setLang(lang);

  return { t, language, setLanguage };
}
