// src/contexts/index.ts
// ✅ Unified Contexts Export - All contexts in one place

export { AuthContext, AuthProvider, useAuth } from './AuthProvider';
export { LanguageProvider, useLanguage } from './LanguageContext';
export { ProfileTypeContext, ProfileTypeProvider, useProfileType } from './ProfileTypeContext';
export type { ProfileType, ProfileTheme, ProfilePermissions, PlanTier } from './ProfileTypeContext';
export { ThemeProvider, useTheme } from './ThemeContext';

