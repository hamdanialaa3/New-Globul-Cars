// Profile Type Context - Manages profile types (private/dealer/company) and their themes
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthProvider';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
// TODO: Replace with proper services when services package is ready
let db: any;
let logger: any;
let UserRepository: any;

export const setDb = (dbInstance: any) => { db = dbInstance; };
export const setLogger = (loggerInstance: any) => { logger = loggerInstance; };
export const setUserRepository = (repo: any) => { UserRepository = repo; };

// Import from canonical types file
import type { 
  ProfileType, 
  PlanTier
} from '@globul-cars/core/typesuser/bulgarian-user.types';

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
    primary: '#FF8F10',
    secondary: '#FFDF00',
    accent: '#FF7900',
    gradient: 'linear-gradient(135deg, #FF8F10 0%, #FFDF00 100%)'
  },
  dealer: {
    primary: '#16a34a',
    secondary: '#22c55e',
    accent: '#15803d',
    gradient: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)'
  },
  company: {
    primary: '#1d4ed8',
    secondary: '#3b82f6',
    accent: '#1e40af',
    gradient: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)'
  }
};

// Permissions by Plan
// Permissions by Plan
function getPermissions(profileType: ProfileType, planTier: PlanTier): ProfilePermissions {
  // Updated December 2025 - Simplified to 3 plans matching BillingService
  const PLAN_LIMITS: Record<PlanTier, number> = {
    free: 5,
    dealer: 15,
    company: -1  // unlimited
  };

  const maxListings = PLAN_LIMITS[planTier] || 5;

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

  if (planTier === 'premium') {
    return {
      ...base,
      hasPrioritySupport: true
    };
  }

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

interface ProfileTypeProviderProps {
  children: ReactNode;
}

export const ProfileTypeProvider: React.FC<ProfileTypeProviderProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const [profileType, setProfileType] = useState<ProfileType>('private');
  const [planTier, setPlanTier] = useState<PlanTier>('free');
  const [loading, setLoading] = useState(true);

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
        const type = userData.profileType || 'private';
        setProfileType(type);
        const tier = userData.plan?.tier || 'free';
        setPlanTier(tier);
      } else {
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

  const switchProfileType = async (newType: ProfileType) => {
    if (!currentUser) {
      throw new Error('User must be logged in to switch profile type');
    }
    
    if (!db) {
      throw new Error('Firestore is not available');
    }

    try {
      const userData = await UserRepository.getById(currentUser.uid);
      if (!userData) {
        throw new Error('User document not found');
      }

      if (newType === 'dealer') {
        if (userData.profileType === 'dealer' && userData.dealershipRef) {
          const dealershipDoc = await getDoc(doc(db, userData.dealershipRef as string));
          if (!dealershipDoc.exists()) {
            throw new Error('Cannot switch to dealer profile: Dealership document not found.');
          }
        } else if (newType === 'dealer') {
          throw new Error('Cannot switch to dealer profile: Missing dealershipRef.');
        }
      }

      if (newType === 'company') {
        if (userData.profileType === 'company' && userData.companyRef) {
          const companyDoc = await getDoc(doc(db, userData.companyRef as string));
          if (!companyDoc.exists()) {
            throw new Error('Cannot switch to company profile: Company document not found.');
          }
        } else if (newType === 'company') {
          throw new Error('Cannot switch to company profile: Missing companyRef.');
        }
      }

      const activeListings = userData.stats?.activeListings || 0;
      const newPermissions = getPermissions(newType, planTier);
      
      if (newPermissions.maxListings !== -1 && activeListings > newPermissions.maxListings) {
        throw new Error(
          `Cannot switch to ${newType} profile: You have ${activeListings} active listings, ` +
          `but the new profile type only allows ${newPermissions.maxListings}.`
        );
      }

      const validPlanTiers: Record<ProfileType, PlanTier[]> = {
        private: ['free', 'premium'],
        dealer: ['dealer_basic', 'dealer_pro', 'dealer_enterprise'],
        company: ['company_starter', 'company_pro', 'company_enterprise']
      };

      const currentTier = userData.planTier || 'free';
      if (!validPlanTiers[newType].includes(currentTier as PlanTier)) {
        const defaultTier = validPlanTiers[newType][0];
        await updateDoc(doc(db, 'users', currentUser.uid), {
          profileType: newType,
          planTier: defaultTier,
          updatedAt: new Date()
        });
        
        setProfileType(newType);
        setPlanTier(defaultTier);
        return;
      }

      await updateDoc(doc(db, 'users', currentUser.uid), {
        profileType: newType,
        updatedAt: new Date()
      });
      
      setProfileType(newType);
      
    } catch (error) {
      logger.error('Error switching profile type', error as Error, { 
        userId: currentUser.uid, 
        newType, 
        currentType: profileType 
      });
      throw error;
    }
  };

  const refreshProfileType = async () => {
    try {
      await loadProfileType();
    } catch (error) {
      logger.error('Error refreshing profile type', error as Error, { 
        userId: currentUser?.uid 
      });
      setProfileType('private');
      setPlanTier('free');
      setLoading(false);
    }
  };

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    
    if (!currentUser?.uid) {
      setProfileType('private');
      setPlanTier('free');
      setLoading(false);
      return;
    }
    
    if (!db) {
      logger.error('Firestore is not initialized');
      setProfileType('private');
      setPlanTier('free');
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      unsubscribe = onSnapshot(
        doc(db, 'users', currentUser.uid),
        (userDoc) => {
          try {
            if (userDoc.exists()) {
              const userData = userDoc.data();
              const type = userData.profileType || 'private';
              setProfileType(type);
              const tier = userData.plan?.tier || userData.planTier || 'free';
              setPlanTier(tier);
            } else {
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
  }, [currentUser?.uid]);

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

export const useProfileType = (): ProfileTypeContextState => {
  const context = useContext(ProfileTypeContext);
  
  if (context === undefined) {
    throw new Error('useProfileType must be used within a ProfileTypeProvider');
  }
  
  return context;
};

export { ProfileTypeContext };

