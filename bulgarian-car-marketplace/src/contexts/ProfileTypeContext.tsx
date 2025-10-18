// src/contexts/ProfileTypeContext.tsx
// Profile Type Context - Manages profile types (private/dealer/company) and their themes

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '../context/AuthProvider';  // FIXED: Correct path
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';

// Profile Type
export type ProfileType = 'private' | 'dealer' | 'company';

// Theme Colors by Profile Type
export interface ProfileTheme {
  primary: string;
  secondary: string;
  accent: string;
  gradient: string;
}

// Permissions by Profile Type
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

// Plan Tier
export type PlanTier = 
  | 'free' 
  | 'premium' 
  | 'dealer_basic' 
  | 'dealer_pro' 
  | 'dealer_enterprise' 
  | 'company_starter' 
  | 'company_pro' 
  | 'company_enterprise' 
  | 'custom';

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
    company_enterprise: -1,
    custom: -1
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
      console.error('Error loading profile type:', error);
      setProfileType('private');
      setPlanTier('free');
    } finally {
      setLoading(false);
    }
  };

  // Switch profile type (for upgrade flow)
  const switchProfileType = async (newType: ProfileType) => {
    if (!currentUser) {
      throw new Error('User must be logged in to switch profile type');
    }

    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        profileType: newType
      });
      
      setProfileType(newType);
    } catch (error) {
      console.error('Error switching profile type:', error);
      throw error;
    }
  };

  // Refresh profile type (call after external updates)
  const refreshProfileType = async () => {
    await loadProfileType();
  };

  // Load on mount and when user changes
  useEffect(() => {
    loadProfileType();
  }, [currentUser?.uid]);

  // Compute derived values
  const theme = THEMES[profileType];
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

