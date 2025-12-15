// src/contexts/index.ts
// ✅ Unified Contexts Export - All contexts in one place

export { AuthContext, useAuth } from './AuthContext';
export { AuthProvider } from './AuthProvider';
export { LanguageProvider, useLanguage } from './LanguageContext';
export { ProfileTypeContext, ProfileTypeProvider, useProfileType } from './ProfileTypeContext';
export type { ProfileType, ProfileTheme, ProfilePermissions, PlanTier } from './ProfileTypeContext';

