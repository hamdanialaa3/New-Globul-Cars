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
import { ProfileService } from '@globul-cars/services/profile/ProfileService';
import { logger } from '@globul-cars/services';
import type { BulgarianUser } from '@globul-cars/core/typesuser/bulgarian-user.types';
import type { DealershipInfo } from '@globul-cars/core/typesdealership/dealership.types';
import type { CompanyInfo } from '@globul-cars/core/typescompany/company.types';

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

      const profile = await ProfileService.getCompleteProfile(uid);
      
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

