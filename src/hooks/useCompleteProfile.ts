/**
 * useCompleteProfile Hook
 * Phase 3: UI Components Integration
 * 
 * Custom hook to load complete profile (user + dealership/company).
 * Replaces scattered profile loading logic across components.
 * 
 * File: src/hooks/useCompleteProfile.ts
 */

import { useState, useEffect } from 'react';
import { profileService } from '../services/profile/UnifiedProfileService';
import { logger } from '../services/logger-service';
import type { BulgarianUser } from '../types/user/bulgarian-user.types';
import type { DealershipInfo } from '../types/dealership/dealership.types';
import type { CompanyInfo } from '../types/company/company.types';

export interface CompleteProfile {
  user: BulgarianUser | null;
  dealership?: DealershipInfo;
  company?: CompanyInfo;
  loading: boolean;
  error: Error | null;
  reload: () => Promise<void>;
}

export const useCompleteProfile = (uid?: string): CompleteProfile => {
  const [user, setUser] = useState<BulgarianUser | null>(null);
  const [dealership, setDealership] = useState<DealershipInfo | undefined>();
  const [company, setCompany] = useState<CompanyInfo | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadProfile = async () => {
    if (!uid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const profile = await profileService.getCompleteProfile(uid);
      
      setUser(profile.user);
      setDealership(profile.dealership);
      setCompany(profile.company);
    } catch (err) {
      logger.error('Error loading complete profile', err as Error, { uid });
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [uid]);

  return {
    user,
    dealership,
    company,
    loading,
    error,
    reload: loadProfile
  };
};

export default useCompleteProfile;

