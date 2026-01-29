// src/contexts/ProfileTypeContext.tsx
// Profile Type Context - Manages profile types (private/dealer/company) and their themes
// Phase -1: Updated to use canonical types

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '../contexts/AuthProvider';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { logger } from '../services/logger-service';
import { UserRepository } from '../repositories/UserRepository';

// ✅ NEW: Import from canonical types file
import type {
  ProfileType,
  PlanTier
} from '../types/user/bulgarian-user.types';

// Theme Colors by Profile Type
export interface ProfileTheme {
  primary: string;
  secondary: string;
  accent: string;
  gradient: string;
}

// Extended Permissions (Now imported from types)
import type { ProfilePermissions } from '../types/user/bulgarian-user.types';

// Context State
interface ProfileTypeContextState {
  profileType: ProfileType;
  theme: ProfileTheme;
  permissions: ProfilePermissions;
  planTier: PlanTier;
  loading: boolean;

  // Helper booleans
  isPrivate: boolean;
  isDealer: boolean;
  isCompany: boolean;

  /**
   * Helper for "Usage Bars" in UI
   * Usage: const { used, total, percent } = getProgressToLimit('listings');
   */
  getProgressToLimit: (metric: 'listings' | 'flexEdits') => { used: number; total: number; percentage: number };

  // Actions
  switchProfileType: (newType: ProfileType) => Promise<void>;
  refreshProfileType: () => Promise<void>;
}

// Create Context
const ProfileTypeContext = createContext<ProfileTypeContextState | undefined>(undefined);

// Theme Configurations
const THEMES: Record<ProfileType, ProfileTheme> = {
  private: {
    primary: '#FF8F10',     // Orange
    secondary: '#FFDF00',   // Yellow
    accent: '#FF7900',      // Dark Orange
    gradient: 'linear-gradient(135deg,rgb(16, 255, 16) 0%,rgb(17, 255, 0) 100%)'
  },
  dealer: {
    primary: '#16a34a',     // Green
    secondary: '#22c55e',   // Light Green
    accent: '#15803d',      // Dark Green
    gradient: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)'
  },
  company: {
    primary: '#1d4ed8',     // Blue
    secondary: '#3b82f6',   // Light Blue
    accent: '#1e40af',      // Dark Blue
    gradient: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)'
  }
};

// Permissions by Plan - DIGITAL DOMINATION v3.0 LOGIC
// Enforces class segregation and commercial limits
function getPermissions(profileType: ProfileType, planTier: PlanTier): ProfilePermissions {
  // Base Defaults (Lowest Common Denominator - Private Free)
  const base: ProfilePermissions = {
    // Limits
    canAddListings: true,
    maxListings: 3,
    maxMonthlyListings: 3,

    // Anti-Fraud
    canEditLockedFields: false, // Locked by default
    maxFlexEditsPerMonth: 0,

    // Power Tools
    canBulkUpload: false,
    bulkUploadLimit: 0,
    canCloneListing: false,

    // Analytics & Team
    hasAnalytics: false,
    hasAdvancedAnalytics: false,
    hasTeam: false,
    canExportData: false,

    // Support & Features
    hasPrioritySupport: false,
    canUseQuickReplies: false,
    canBulkEdit: false,
    canImportCSV: false,
    canUseAPI: false,

    // Visuals
    themeMode: 'standard'
  };

  // 1. DEALER LOGIC ("The Mechanic")
  if (profileType === 'dealer' || planTier === 'dealer') {
    return {
      ...base,
      // Limits: 30 cars/mo
      maxListings: 30,
      maxMonthlyListings: 30,

      // Flex-Edit: 10/mo allowance for mistakes
      canEditLockedFields: false, // UI checks quota before enabling
      maxFlexEditsPerMonth: 10,

      // Power Tools: Matrix Grid (5 rows) & Cloning
      canBulkUpload: true,
      bulkUploadLimit: 5,
      canCloneListing: true,

      // Analytics
      hasAnalytics: true,

      // Features
      canUseQuickReplies: true,
      canBulkEdit: true,
      hasPrioritySupport: true,

      // Visual DNA: Neon Green / Dark Mode
      themeMode: 'dealer-led'
    };
  }

  // 2. COMPANY LOGIC ("The Enterprise")
  if (profileType === 'company' || planTier === 'company') {
    return {
      ...base,
      // Limits: UNLIMITED cars (no per-month limit)
      maxListings: -1, // -1 = unlimited
      maxMonthlyListings: -1, // Unlimited monthly as well

      // Unrestricted Editing (Trust-based)
      canEditLockedFields: true,
      maxFlexEditsPerMonth: 999,

      // Power Tools: Matrix Grid (20 rows) & Cloning
      canBulkUpload: true,
      bulkUploadLimit: 999, // No limit
      canCloneListing: true,
      canImportCSV: true,
      canUseAPI: true,

      // Analytics & Team
      hasAnalytics: true,
      hasAdvancedAnalytics: true, // Market Intelligence
      hasTeam: true,
      canExportData: true,

      // Features
      canUseQuickReplies: true,
      canBulkEdit: true,
      hasPrioritySupport: true,

      // Visual DNA: Royal Blue / Grid
      themeMode: 'company-led'
    };
  }

  return base;
}

// Provider Props
interface ProfileTypeProviderProps {
  children: ReactNode;
}

// Provider Component
export const ProfileTypeProvider: React.FC<ProfileTypeProviderProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const [profileType, setProfileType] = useState<ProfileType>('private');
  const [planTier, setPlanTier] = useState<PlanTier>('free');
  const [loading, setLoading] = useState(true);

  const [userData, setUserData] = useState<any>(null);

  // Load profile type from Firestore
  const loadProfileType = async () => {
    // ... logic moved to snapshot listener for real-time
  };

  // Switch profile type (for upgrade flow)
  const switchProfileType = async (newType: ProfileType, additionalData?: any) => {
    if (!currentUser) throw new Error('User must be logged in');

    try {
      const { profileService } = await import('../services/profile/UnifiedProfileService');
      await profileService.switchProfileType(currentUser.uid, newType, additionalData);

      // Update local state (snapshot will follow)
      setProfileType(newType);
      logger.info('Profile type switch initiated via service', { userId: currentUser.uid, newType });
    } catch (error) {
      logger.error('Error switching profile type', error as Error);
      throw error;
    }
  };

  // Refresh profile type (call after external updates)
  const refreshProfileType = async () => {
    try {
      await loadProfileType();
    } catch (error) {
      logger.error('Error refreshing profile type', error as Error, {
        userId: currentUser?.uid
      });
      // Set defaults on error
      setProfileType('private');
      setPlanTier('free');
      setLoading(false);
    }
  };

  // Load on mount and when user changes
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    // ✅ CRITICAL FIX: Guard against null/undefined BEFORE any Firestore operations
    if (!currentUser?.uid) {
      setProfileType('private');
      setPlanTier('free');
      setLoading(false);
      return;
    }

    // ✅ CRITICAL: Check if Firestore is available
    if (!db) {
      logger.error('Firestore is not initialized');
      setProfileType('private');
      setPlanTier('free');
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Real-time listener for user profile changes
      unsubscribe = onSnapshot(
        doc(db, 'users', currentUser.uid),
        (userDoc) => {
          try {
            if (userDoc.exists()) {
              const data = userDoc.data();
              setUserData(data);

              // Get profileType (default to 'private' if not set)
              const type = data.profileType || 'private';
              setProfileType(type);

              // Get plan tier (default to 'free' if not set)
              // ✅ FIX: Use 'data' from snapshot, not 'userData' state
              const tier = data.plan?.tier || data.planTier || 'free';
              setPlanTier(tier);
            } else {
              // User document doesn't exist yet - set defaults
              setProfileType('private');
              setPlanTier('free');
            }
            setLoading(false);
          } catch (docError) {
            logger.error('Error processing user document', docError as Error, {
              userId: currentUser?.uid
            });
            setProfileType('private');
            setPlanTier('free');
            setLoading(false);
          }
        },
        (error) => {
          logger.error('Error listening to profile type changes', error as Error, {
            userId: currentUser?.uid
          });
          setProfileType('private');
          setPlanTier('free');
          setLoading(false);
        }
      );
    } catch (setupError) {
      logger.error('Error setting up profile listener', setupError as Error, {
        userId: currentUser?.uid
      });
      setProfileType('private');
      setPlanTier('free');
      setLoading(false);
    }

    // ✅ CRITICAL: Cleanup listener on unmount or user change
    return () => {
      if (unsubscribe) {
        try {
          unsubscribe();
          unsubscribe = null; // Clear reference after cleanup
        } catch (cleanupError) {
          logger.warn('Error cleaning up profile type listener', {
            error: (cleanupError as Error).message,
            userId: currentUser?.uid
          });
          unsubscribe = null; // Clear reference even on error
        }
      }
    };
  }, [currentUser?.uid]); // ✅ FIX: Only depend on currentUser.uid, not the entire currentUser object

  // Compute derived values
  const theme = THEMES[profileType];
  // Get permissions (use local function for consistency)
  const permissions = getPermissions(profileType, planTier);
  const isPrivate = profileType === 'private';
  const isDealer = profileType === 'dealer';
  const isCompany = profileType === 'company';

  // New v3.0 Helper: Usage Tracking
  const getProgressToLimit = (metric: 'listings' | 'flexEdits') => {
    // CURRENT: Use snapshot data (userData) for accurate production stats
    const stats = userData?.stats || userData?.quotaStats || {};

    let used = 0;
    let total = 0;

    if (metric === 'listings') {
      used = stats.activeListings || stats.listingsCreatedThisMonth || 0;
      total = permissions.maxMonthlyListings;
    } else if (metric === 'flexEdits') {
      used = stats.flexEditsUsedThisMonth || 0;
      total = permissions.maxFlexEditsPerMonth;
    }

    if (total === -1 || total === 999) {
      return { used, total: 999, percentage: 0 };
    }

    const percentage = Math.min(100, Math.round((used / total) * 100));
    return { used, total, percentage };
  };

  const value: ProfileTypeContextState = {
    profileType,
    theme,
    permissions,
    planTier,
    loading,
    isPrivate,
    isDealer,
    isCompany,
    getProgressToLimit,
    switchProfileType,
    refreshProfileType
  };

  return (
    <ProfileTypeContext.Provider value={value}>
      {children}
    </ProfileTypeContext.Provider>
  );
};

// Custom Hook
export const useProfileType = (): ProfileTypeContextState => {
  const context = useContext(ProfileTypeContext);

  if (context === undefined) {
    throw new Error('useProfileType must be used within a ProfileTypeProvider');
  }

  return context;
};

// Export Context for testing
export { ProfileTypeContext };

