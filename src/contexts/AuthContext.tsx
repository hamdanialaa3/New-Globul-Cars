/**
 * AuthContext.tsx
 *
 * ⚠️ LEGACY BARREL — DO NOT ADD LOGIC HERE.
 *
 * All context identity lives in ./auth-context.ts (isolated, no heavy deps).
 * All provider logic lives in ./AuthProvider.tsx.
 *
 * This file exists only so that legacy imports such as
 *   import { useAuth } from '…/contexts/AuthContext'
 * still resolve to the real, stable context object that AuthProvider provides.
 * Without this re-export, those consumers would call useContext() on a
 * *different* AuthContext instance that is never given a Provider, causing
 * the "useAuth must be used within an AuthProvider" runtime error.
 */

// Re-export everything from the canonical modules
export { AuthContext, useAuth } from './auth-context';
export type { AuthContextType, RegisterOptions } from './auth-context';
export { AuthProvider } from './AuthProvider';
