/**
 * auth-context.ts
 *
 * ⚠️ CRITICAL: This file MUST remain a standalone module with NO imports
 * from firebase, social-auth-service, or other app-level code.
 *
 * WHY: Vite HMR re-evaluates modules when their import graph changes.
 * If AuthContext lived inside AuthProvider.tsx, any change to
 * social-auth-service → UnifiedProfileService (or any dep of AuthProvider)
 * would cause AuthProvider.tsx to be re-evaluated, which re-runs
 * createContext() and produces a NEW AuthContext object. Modules that
 * imported the OLD context (like ProfileTypeContext) would then see
 * undefined from useContext because the provider now holds the NEW object.
 *
 * By isolating createContext here (a file with zero dynamic deps),
 * the context identity is stable across every HMR cycle.
 */

import { createContext, useContext } from 'react';
import { User } from 'firebase/auth';
import type { BulgarianUser } from '../types/user/bulgarian-user.types';

export interface RegisterOptions {
  displayName?: string;
}

export interface AuthContextType {
  currentUser: User | null;
  user: User | null;
  /** Real-time Firestore profile — always reflects latest name/photo from any device */
  userProfile: BulgarianUser | null;
  /**
   * Authoritative display name: reads from Firestore profile (real-time) first,
   * falls back to Firebase Auth object. Use THIS instead of currentUser.displayName
   * to ensure changes from any device reflect instantly.
   */
  displayName: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, options?: RegisterOptions) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
