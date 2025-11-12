// src/contexts/ProfileTypeContext.tsx
// Profile Type Context - Manages profile types (private/dealer/company) and their themes
// Phase -1: Updated to use canonical types

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';
import { logger } from '@/services/logger-service';
import { UserRepository } from '../repositories/UserRepository';

// ✅ NEW: Import from canonical types file
import type { 
  ProfileType, 
  PlanTier
} from '@/types/user/bulgarian-user.types';

// Theme Colors by Profile Type
export interface ProfileTheme {
  primary: string;
  secondary: string;
  accent: string;
  gradient: string;
}

// Extended Permissions for Context (includes UI-specific permissions)
export interface ProfilePermissions {
  canAddListings: boolean;
  maxListings: number;  // -1 for unlimited
  hasAnalytics: boolean;
  hasAdvancedAnalytics: boolean;
  hasTeam: boolean;
  canExportData: boolean;
  hasPrioritySupport: boolean;
  canUseQuickReplies: boolean;
  canBulkEdit: boolean;
  canImportCSV: boolean;
  canUseAPI: boolean;
}

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
    gradient: 'linear-gradient(135deg, #FF8F10 0%, #FFDF00 100%)'
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

// Permissions by Plan
function getPermissions(profileType: ProfileType, planTier: PlanTier): ProfilePermissions {
  const PLAN_LIMITS: Record<PlanTier, number> = {
    free: 3,
    premium: 10,
    dealer_basic: 50,
    dealer_pro: 150,
    dealer_enterprise: -1,  // unlimited
    company_starter: 100,
    company_pro: -1,
    company_enterprise: -1
  };

  const maxListings = PLAN_LIMITS[planTier] || 3;

  // Base permissions for all
  const base: ProfilePermissions = {
    canAddListings: true,
    maxListings,
    hasAnalytics: false,
    hasAdvancedAnalytics: false,
    hasTeam: false,
    canExportData: false,
    hasPrioritySupport: false,
    canUseQuickReplies: false,
    canBulkEdit: false,
    canImportCSV: false,
    canUseAPI: false
  };

  // Premium enhancements
  if (planTier === 'premium') {
    return {
      ...base,
      hasPrioritySupport: true
    };
  }

  // Dealer enhancements
  if (profileType === 'dealer') {
    const dealerBase = {
      ...base,
      hasAnalytics: true,
      canUseQuickReplies: true,
      canBulkEdit: true
    };

    if (planTier === 'dealer_pro' || planTier === 'dealer_enterprise') {
      return {
        ...dealerBase,
        hasAdvancedAnalytics: true,
        canExportData: true,
        canImportCSV: true,
        canUseAPI: planTier === 'dealer_enterprise'
      };
    }

    return dealerBase;
  }

  // Company enhancements
  if (profileType === 'company') {
    return {
      ...base,
      hasAnalytics: true,
      hasAdvancedAnalytics: true,
      hasTeam: true,
      canExportData: true,
      canUseQuickReplies: true,
      canBulkEdit: true,
      canImportCSV: planTier !== 'company_starter',
      canUseAPI: planTier === 'company_pro' || planTier === 'company_enterprise',
      hasPrioritySupport: true
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

  // Load profile type from Firestore
  const loadProfileType = async () => {
    if (!currentUser) {
      setProfileType('private');
      setPlanTier('free');
      setLoading(false);
      return;
    }
    
    if (!db) {
      logger.error('Firestore is not available for loadProfileType');
      setProfileType('private');
      setPlanTier('free');
      setLoading(false);
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Get profileType (default to 'private' if not set)
        const type = userData.profileType || 'private';
        setProfileType(type);

        // Get plan tier (default to 'free' if not set)
        const tier = userData.plan?.tier || 'free';
        setPlanTier(tier);
      } else {
        // User document doesn't exist yet - set defaults
        setProfileType('private');
        setPlanTier('free');
      }
    } catch (error) {
      logger.error('Error loading profile type', error as Error, { userId: currentUser?.uid });
      setProfileType('private');
      setPlanTier('free');
    } finally {
      setLoading(false);
    }
  };

  // Switch profile type (for upgrade flow)
  // Phase 0 Day 4: Added validation
  const switchProfileType = async (newType: ProfileType) => {
    if (!currentUser) {
      throw new Error('User must be logged in to switch profile type');
    }
    
    if (!db) {
      throw new Error('Firestore is not available');
    }

    // ✅ REFACTORED: Validation before switching (using Repository)
    try {
      // 1. Get current user data
      const userData = await UserRepository.getById(currentUser.uid);
      if (!userData) {
        throw new Error('User document not found');
      }

      // 2. Validate dealer/company requirements
      if (newType === 'dealer') {
        // Type narrowing - only dealer profiles have dealershipRef
        if (userData.profileType === 'dealer' && userData.dealershipRef) {
          // Verify dealership document exists
          const dealershipDoc = await getDoc(doc(db, userData.dealershipRef as string));
          if (!dealershipDoc.exists()) {
            throw new Error(
              'Cannot switch to dealer profile: Dealership document not found. ' +
              'Please contact support.'
            );
          }
        } else if (newType === 'dealer') {
          throw new Error(
            'Cannot switch to dealer profile: Missing dealershipRef. ' +
            'Please complete dealership setup first.'
          );
        }
      }

      if (newType === 'company') {
        // Type narrowing - only company profiles have companyRef
        if (userData.profileType === 'company' && userData.companyRef) {
          // Verify company document exists
          const companyDoc = await getDoc(doc(db, userData.companyRef as string));
          if (!companyDoc.exists()) {
            throw new Error(
              'Cannot switch to company profile: Company document not found. ' +
              'Please contact support.'
            );
          }
        } else if (newType === 'company') {
          throw new Error(
            'Cannot switch to company profile: Missing companyRef. ' +
            'Please complete company setup first.'
          );
        }
      }

      // 3. Check active listings limit
      const activeListings = userData.stats?.activeListings || 0;
      const newPermissions = getPermissions(newType, planTier);
      
      if (newPermissions.maxListings !== -1 && activeListings > newPermissions.maxListings) {
        throw new Error(
          `Cannot switch to ${newType} profile: You have ${activeListings} active listings, ` +
          `but the new profile type only allows ${newPermissions.maxListings}. ` +
          `Please deactivate some listings first.`
        );
      }

      // 4. Validate plan tier compatibility
      const validPlanTiers: Record<ProfileType, PlanTier[]> = {
        private: ['free', 'premium'],
        dealer: ['dealer_basic', 'dealer_pro', 'dealer_enterprise'],
        company: ['company_starter', 'company_pro', 'company_enterprise']
      };

      // Type-safe plan tier access
      const currentTier = userData.planTier || 'free';
      if (!validPlanTiers[newType].includes(currentTier as PlanTier)) {
        logger.warn('Plan tier incompatible with new profile type', {
          userId: currentUser.uid,
          newType,
          currentTier
        });
        // Auto-assign default tier for new profile type
        const defaultTier = validPlanTiers[newType][0];
        await updateDoc(doc(db, 'users', currentUser.uid), {
          profileType: newType,
          planTier: defaultTier,
          updatedAt: new Date()
        });
        
        setProfileType(newType);
        setPlanTier(defaultTier);
        
        logger.info('Profile type switched with tier adjustment', {
          userId: currentUser.uid,
          newType,
          oldTier: currentTier,
          newTier: defaultTier
        });
        
        return;
      }

      // 5. All validations passed - switch profile type
      await updateDoc(doc(db, 'users', currentUser.uid), {
        profileType: newType,
        updatedAt: new Date()
      });
      
      setProfileType(newType);
      
      logger.info('Profile type switched successfully', {
        userId: currentUser.uid,
        oldType: profileType,
        newType
      });
      
    } catch (error) {
      logger.error('Error switching profile type', error as Error, { 
        userId: currentUser.uid, 
        newType, 
        currentType: profileType 
      });
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
              const userData = userDoc.data();
              
              // Get profileType (default to 'private' if not set)
              const type = userData.profileType || 'private';
              setProfileType(type);

              // Get plan tier (default to 'free' if not set)
              const tier = userData.plan?.tier || userData.planTier || 'free';
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
        } catch (cleanupError) {
          logger.warn('Error cleaning up profile listener', { 
            error: (cleanupError as Error).message,
            userId: currentUser?.uid 
          });
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

  const value: ProfileTypeContextState = {
    profileType,
    theme,
    permissions,
    planTier,
    loading,
    isPrivate,
    isDealer,
    isCompany,
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

