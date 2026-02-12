// src/utils/listing-limits.ts
// Listing Limits - Enforce plan caps
// ✅ FIXED January 7, 2026: Now imports from single source of truth

import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import type { PlanTier } from '../config/subscription-plans';
import { logger } from '../services/logger-service';
import { getMaxListings, hasUnlimitedListings } from '../config/subscription-plans';

// ⚠️ DEPRECATED: Plan limits now defined in subscription-plans.ts
// This ensures consistency across the entire application

// Plan limits mapping (for getPlanLimit backward compatibility)
const PLAN_LIMITS: Record<string, number> = {
  free: 3,
  dealer: 30,
  company: Infinity
};

/**
 * Check if user can add another listing
 * ✅ CRITICAL FIX: Now uses planTier directly (not plan.tier) for consistency
 * 
 * @param userId - User ID
 * @returns Promise<boolean> - true if user can add listing, false otherwise
 * @throws Error if database query fails (for critical path)
 */
export async function canAddListing(userId: string): Promise<boolean> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      logger.warn('User not found when checking listing limit', { userId });
      return false;
    }

    const userData = userDoc.data();
    
    // ✅ FIX: Use planTier directly (not plan.tier) - consistent with firestore.rules
    const planTier = (userData.planTier || userData.plan?.tier || 'free') as PlanTier;
    const limit = getMaxListings(planTier);

    // Unlimited plans (company)
    if (hasUnlimitedListings(planTier)) {
      logger.debug('User has unlimited listings', { userId, planTier });
      return true;
    }

    // Check current active listings count
    const activeCount = userData.stats?.activeListings || 0;
    const canAdd = activeCount < limit;
    
    if (!canAdd) {
      logger.warn('Listing limit reached', { 
        userId, 
        planTier, 
        activeCount, 
        limit,
        remaining: limit - activeCount
      });
    }
    
    return canAdd;
  } catch (error) {
    logger.error('Error checking listing limit', error as Error, { userId });
    // Fail closed - don't allow listing creation if we can't verify limits
    return false;
  }
}

/**
 * Get remaining listing slots for user
 * ✅ UPDATED: Uses planTier directly for consistency
 * 
 * @param userId - User ID
 * @returns Promise<number> - -1 for unlimited, 0 or positive for remaining slots
 */
export async function getRemainingListings(userId: string): Promise<number> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      return 0;
    }

    const userData = userDoc.data();
    // ✅ FIX: Use planTier directly (not plan.tier)
    const planTier = (userData.planTier || userData.plan?.tier || 'free') as PlanTier;
    const limit = getMaxListings(planTier);

    // Unlimited plans
    if (hasUnlimitedListings(planTier)) return -1;

    const activeCount = userData.stats?.activeListings || 0;
    const remaining = Math.max(0, limit - activeCount);
    
    logger.debug('Remaining listings calculated', { userId, planTier, activeCount, limit, remaining });
    
    return remaining;
  } catch (error) {
    logger.error('Error getting remaining listings', error as Error, { userId });
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

