// src/contexts/AdminLanguageContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { adminDictEN } from '../i18n/admin/en';
import { adminDictBG } from '../i18n/admin/bg';
import { adminDictTR } from '../i18n/admin/tr';
import { adminDictDE } from '../i18n/admin/de';
import { adminDictAR } from '../i18n/admin/ar';

// Supported Admin Languages
export type AdminLanguage = 'en' | 'bg' | 'tr' | 'de' | 'ar';

// Dictionary Type Inference
type AdminDictionary = typeof adminDictEN; // All dicts must match EN structure

interface AdminLanguageContextType {
    adminLang: AdminLanguage;
    setAdminLang: (lang: AdminLanguage) => void;
    t: AdminDictionary; // Use 't' for quick access like t.common.dashboard
}

const AdminLanguageContext = createContext<AdminLanguageContextType | undefined>(undefined);

const dictionaries: Record<AdminLanguage, AdminDictionary> = {
    en: adminDictEN,
    bg: adminDictBG,
    tr: adminDictTR,
    de: adminDictDE,
    ar: adminDictAR,
};

export const AdminLanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Initialize from localStorage or default to English
    const [adminLang, setAdminLangState] = useState<AdminLanguage>(() => {
        const saved = localStorage.getItem('admin_locale');
        if (saved && ['en', 'bg', 'tr', 'de', 'ar'].includes(saved)) {
            return saved as AdminLanguage;
        }
        return 'en';
    });

    const t = dictionaries[adminLang];

    const setAdminLang = (lang: AdminLanguage) => {
        localStorage.setItem('admin_locale', lang);
        setAdminLangState(lang);

        // Handle RTL for Arabic
        if (lang === 'ar') {
            document.documentElement.dir = 'rtl';
        } else {
            document.documentElement.dir = 'ltr';
        }
    };

    // Apply direction on mount
    useEffect(() => {
        if (adminLang === 'ar') {
            document.documentElement.dir = 'rtl';
        } else {
            document.documentElement.dir = 'ltr';
        }
    }, [adminLang]);

    return (
        <AdminLanguageContext.Provider value={{ adminLang, setAdminLang, t }}>
            {children}
        </AdminLanguageContext.Provider>
    );
};

export const useAdminLang = () => {
    const context = useContext(AdminLanguageContext);
    if (!context) {
        throw new Error('useAdminLang must be used within an AdminLanguageProvider');
    }
    return context;
};
