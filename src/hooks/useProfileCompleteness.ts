// src/hooks/useProfileCompleteness.ts
// Profile Completeness Gate Hook — determines if a user can leave reviews

import { useMemo } from 'react';
import type { BulgarianUser } from '@/types/user/bulgarian-user.types';

interface ProfileCompletenessResult {
  isComplete: boolean;
  missingFields: string[];
  completionPercentage: number;
  canReview: boolean;
}

/**
 * useProfileCompleteness
 * Checks 4 critical profile fields required for review eligibility:
 * 1. phoneVerified
 * 2. emailVerified
 * 3. hasLocation
 * 4. displayName present
 */
export function useProfileCompleteness(
  user: BulgarianUser | null | undefined
): ProfileCompletenessResult {
  return useMemo(() => {
    if (!user) {
      return {
        isComplete: false,
        missingFields: [
          'displayName',
          'emailVerified',
          'phoneVerified',
          'location',
        ],
        completionPercentage: 0,
        canReview: false,
      };
    }

    const checks = [
      {
        key: 'displayName',
        label: 'Display name',
        passed: !!user.displayName?.trim(),
      },
      {
        key: 'emailVerified',
        label: 'Email verification',
        passed: !!user.verification?.email?.verified,
      },
      {
        key: 'phoneVerified',
        label: 'Phone verification',
        passed: !!user.verification?.phone?.verified,
      },
      {
        key: 'location',
        label: 'Location',
        passed: !!(user.location?.city || user.city),
      },
    ];

    const passed = checks.filter(c => c.passed);
    const missing = checks.filter(c => !c.passed).map(c => c.key);

    return {
      isComplete: missing.length === 0,
      missingFields: missing,
      completionPercentage: Math.round((passed.length / checks.length) * 100),
      canReview: missing.length === 0,
    };
  }, [user]);
}

export default useProfileCompleteness;
