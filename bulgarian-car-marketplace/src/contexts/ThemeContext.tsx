// ThemeContext.tsx - نظام الثيم المركزي للتبديل بين الوضع الليلي والنهاري
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // 1️⃣ التحقق من التفضيل المحفوظ في localStorage أو من النظام
  const getInitialTheme = (): ThemeMode => {
    // أولاً: تحقق من localStorage
    const savedTheme = localStorage.getItem('theme') as ThemeMode;
    if (savedTheme) {
      return savedTheme;
    }

    // ثانياً: تحقق من تفضيل النظام
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    // افتراضي: الوضع النهاري
    return 'light';
  };

  const [theme, setThemeState] = useState<ThemeMode>(getInitialTheme);

  // 2️⃣ تطبيق الثيم على الـ HTML root
  useEffect(() => {
    const root = document.documentElement;
    
    // إزالة الثيم القديم
    root.classList.remove('light-theme', 'dark-theme');
    
    // إضافة الثيم الجديد
    root.classList.add(`${theme}-theme`);
    
    // حفظ في localStorage
    localStorage.setItem('theme', theme);
    
    // تحديث الـ data attribute للاستخدام في CSS
    root.setAttribute('data-theme', theme);
    
    // تحديث meta theme-color للموبايل
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#1a1d2e' : '#f5f5f5');
    }
  }, [theme]);

  // 3️⃣ الاستماع لتغييرات تفضيل النظام
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // فقط إذا لم يكن هناك تفضيل محفوظ
      if (!localStorage.getItem('theme')) {
        setThemeState(e.matches ? 'dark' : 'light');
      }
    };

    // Add event listener with proper typing
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      // @ts-ignore
      mediaQuery.addListener(handleChange);
      // @ts-ignore
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  const toggleTheme = () => {
    setThemeState((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook للاستخدام في المكونات
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

