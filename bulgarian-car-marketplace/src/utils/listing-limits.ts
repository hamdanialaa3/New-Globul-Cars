// src/utils/listing-limits.ts
// Listing Limits - Enforce plan caps

import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';
import type { PlanTier } from '@/features/billing/types';
import { logger } from '@/services/logger-service';

// Plan Limits Configuration
const PLAN_LIMITS: Record<PlanTier, number> = {
  free: 3,
  premium: 10,
  dealer_basic: 50,
  dealer_pro: 150,
  dealer_enterprise: -1,  // unlimited
  company_starter: 100,
  company_pro: -1,        // unlimited
  company_enterprise: -1, // unlimited
  custom: -1              // unlimited
};

/**
 * Check if user can add another listing
 * @param userId - User ID
 * @returns Promise<boolean>
 */
export async function canAddListing(userId: string): Promise<boolean> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      return false;
    }

    const userData = userDoc.data();
    const planTier = userData.plan?.tier || 'free';
    const limit = PLAN_LIMITS[planTier as PlanTier] || 3;

    // Unlimited
    if (limit === -1) return true;

    // Check current active listings count
    const activeCount = userData.stats?.activeListings || 0;
    
    return activeCount < limit;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      logger.error('Error checking listing limit', error as Error);
    }
    return false;
  }
}

/**
 * Get remaining listing slots for user
 * @param userId - User ID
 * @returns Promise<number> - -1 for unlimited
 */
export async function getRemainingListings(userId: string): Promise<number> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      return 0;
    }

    const userData = userDoc.data();
    const planTier = userData.plan?.tier || 'free';
    const limit = PLAN_LIMITS[planTier as PlanTier] || 3;

    // Unlimited
    if (limit === -1) return -1;

    const activeCount = userData.stats?.activeListings || 0;
    
    return Math.max(0, limit - activeCount);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      logger.error('Error getting remaining listings', error as Error);
    }
    return 0;
  }
}

/**
 * Get plan limit for a specific tier
 * @param planTier - Plan tier
 * @returns number - -1 for unlimited
 */
export function getPlanLimit(planTier: PlanTier): number {
  return PLAN_LIMITS[planTier] || 3;
}

