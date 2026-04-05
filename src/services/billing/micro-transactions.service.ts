/**
 * Micro-Transactions (Pay-to-Promote) System
 * One-time payments for listing promotions
 *
 * 🚀 NEW FEATURE: Turbo Boost System
 * Allows users to pay for temporary listing enhancements
 *
 * File: src/services/billing/micro-transactions.service.ts
 * Created: January 7, 2026
 */

import {
  doc,
  updateDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  Timestamp,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { logger } from '../logger-service';

export type PromotionType = 'vip_badge' | 'top_of_page' | 'instant_refresh';

export interface PromotionConfig {
  id: PromotionType;
  name: {
    bg: string;
    en: string;
  };
  description: {
    bg: string;
    en: string;
  };
  price: number; // EUR
  duration: number; // hours
  stripePriceId: string;
  icon: string;
  color: string;
  benefits: {
    bg: string[];
    en: string[];
  };
}

/**
 * Available Promotion Products
 * 💰 Revenue Generation: These are single-payment boosts
 */
export const PROMOTION_PRODUCTS: Record<PromotionType, PromotionConfig> = {
  vip_badge: {
    id: 'vip_badge',
    name: {
      bg: 'VIP Значка',
      en: 'VIP Badge',
    },
    description: {
      bg: 'Златна VIP значка на обявата ви',
      en: 'Golden VIP badge on your listing',
    },
    price: 2, // EUR
    duration: 168, // 7 days (1 week)
    stripePriceId: 'price_vip_badge_weekly',
    icon: '👑',
    color: '#FFD700', // Gold
    benefits: {
      bg: [
        'Златна VIP значка',
        'Визуално отличаване',
        'Увеличено доверие от купувачи',
        'Активна 7 дни',
      ],
      en: [
        'Golden VIP badge',
        'Visual distinction',
        'Increased buyer trust',
        'Active for 7 days',
      ],
    },
  },

  top_of_page: {
    id: 'top_of_page',
    name: {
      bg: 'Топ Позиция',
      en: 'Top Position',
    },
    description: {
      bg: 'Вашата кола първа в резултатите',
      en: 'Your car first in search results',
    },
    price: 5, // EUR
    duration: 72, // 3 days
    stripePriceId: 'price_top_position_3days',
    icon: '📌',
    color: '#FF4444', // Red
    benefits: {
      bg: [
        'Закрепена позиция в търсачката',
        'Максимална видимост',
        'Над всички органични резултати',
        'Активна 3 дни',
        '+300% повече прегледи',
      ],
      en: [
        'Pinned position in search',
        'Maximum visibility',
        'Above all organic results',
        'Active for 3 days',
        '+300% more views',
      ],
    },
  },

  instant_refresh: {
    id: 'instant_refresh',
    name: {
      bg: 'Моментално Обновяване',
      en: 'Instant Refresh',
    },
    description: {
      bg: 'Обновете обявата като нова',
      en: 'Refresh listing as brand new',
    },
    price: 1, // EUR
    duration: 0, // Instant (updates timestamp)
    stripePriceId: 'price_instant_refresh',
    icon: '🔄',
    color: '#4CAF50', // Green
    benefits: {
      bg: [
        'Обновява датата на публикуване',
        'Обявата изглежда нова',
        'Се показва отгоре в "Нови"',
        'Моментален ефект',
      ],
      en: [
        'Updates publication date',
        'Listing appears brand new',
        'Shows at top in "New"',
        'Instant effect',
      ],
    },
  },
};

// ---------------------------------------------------------------------------
// Runtime validation: catch placeholder price IDs before they reach Stripe
// ---------------------------------------------------------------------------

const PLACEHOLDER_PRICE_ID_PATTERN = /^price_[a-z_]+$/; // real IDs look like price_1ABC...

/**
 * Assert that all PROMOTION_PRODUCTS have real Stripe price IDs in production.
 * Logs a loud error but does NOT throw, so dev/staging environments still work.
 */
function validateStripePriceIds(): void {
  if (
    typeof import.meta !== 'undefined' &&
    (import.meta as Record<string, unknown>).env
  ) {
    const env = (import.meta as Record<string, unknown>).env as Record<
      string,
      string
    >;
    if (env['MODE'] !== 'production') return;
  }

  const invalid: string[] = [];
  for (const [type, cfg] of Object.entries(PROMOTION_PRODUCTS)) {
    if (PLACEHOLDER_PRICE_ID_PATTERN.test(cfg.stripePriceId)) {
      invalid.push(`${type}: "${cfg.stripePriceId}"`);
    }
  }

  if (invalid.length > 0) {
    logger.error(
      '[micro-transactions] Placeholder Stripe price IDs detected in production! ' +
        'Replace them with real price_XXXX IDs from the Stripe Dashboard.',
      new Error('PlaceholderStripePriceIds'),
      { invalid }
    );
  }
}

// Fire once at module load
validateStripePriceIds();

// ---------------------------------------------------------------------------

export interface ActivePromotion {
  type: PromotionType;
  startedAt: Date;
  expiresAt: Date;
  price: number;
  transactionId: string;
}

/**
 * Purchase a promotion for a listing
 */
export async function purchasePromotion(
  userId: string,
  listingId: string,
  promotionType: PromotionType,
  paymentIntentId: string
): Promise<{ success: boolean; expiresAt?: Date; error?: string }> {
  try {
    const promotion = PROMOTION_PRODUCTS[promotionType];
    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + promotion.duration * 60 * 60 * 1000
    );

    // Get listing document
    const listingRef = doc(db, 'listings', listingId); // Adjust collection path as needed
    const listingSnap = await getDoc(listingRef);

    if (!listingSnap.exists()) {
      return { success: false, error: 'Listing not found' };
    }

    const listingData = listingSnap.data();

    // Verify ownership
    if (listingData.userId !== userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Special handling for instant_refresh
    if (promotionType === 'instant_refresh') {
      await updateDoc(listingRef, {
        publishedAt: serverTimestamp(),
        lastRefreshedAt: serverTimestamp(),
        'promotions.lastRefresh': {
          date: serverTimestamp(),
          transactionId: paymentIntentId,
        },
        updatedAt: serverTimestamp(),
      });

      logger.info('Instant refresh applied', {
        userId,
        listingId,
        paymentIntentId,
      });

      return { success: true, expiresAt: now }; // Instant, no expiry
    }

    // For time-based promotions (VIP, Top Position)
    const activePromotions = listingData.promotions?.active || {};
    activePromotions[promotionType] = {
      startedAt: now,
      expiresAt,
      price: promotion.price,
      transactionId: paymentIntentId,
    };

    await updateDoc(listingRef, {
      'promotions.active': activePromotions,
      'promotions.history': [
        ...(listingData.promotions?.history || []),
        {
          type: promotionType,
          purchasedAt: now,
          expiresAt,
          price: promotion.price,
          transactionId: paymentIntentId,
        },
      ],
      updatedAt: serverTimestamp(),
    });

    logger.info('Promotion purchased', {
      userId,
      listingId,
      promotionType,
      expiresAt,
      paymentIntentId,
    });

    return { success: true, expiresAt };
  } catch (error) {
    logger.error('Failed to purchase promotion', error as Error, {
      userId,
      listingId,
      promotionType,
    });
    return { success: false, error: 'Failed to apply promotion' };
  }
}

/**
 * Check if a listing has an active promotion
 */
export async function hasActivePromotion(
  listingId: string,
  promotionType: PromotionType
): Promise<boolean> {
  try {
    const listingRef = doc(db, 'listings', listingId);
    const listingSnap = await getDoc(listingRef);

    if (!listingSnap.exists()) {
      return false;
    }

    const promotions = listingSnap.data().promotions?.active || {};
    const promotion = promotions[promotionType];

    if (!promotion) {
      return false;
    }

    const now = new Date();
    const expiresAt = promotion.expiresAt.toDate();

    return expiresAt > now;
  } catch (error) {
    logger.error('Failed to check active promotion', error as Error, {
      listingId,
      promotionType,
    });
    return false;
  }
}

/**
 * Get all active promotions for a listing
 */
export async function getActivePromotions(
  listingId: string
): Promise<ActivePromotion[]> {
  try {
    const listingRef = doc(db, 'listings', listingId);
    const listingSnap = await getDoc(listingRef);

    if (!listingSnap.exists()) {
      return [];
    }

    const promotions = listingSnap.data().promotions?.active || {};
    const now = new Date();
    const active: ActivePromotion[] = [];

    for (const [type, data] of Object.entries(promotions)) {
      const expiresAt = (data as any).expiresAt.toDate();
      if (expiresAt > now) {
        active.push({
          type: type as PromotionType,
          startedAt: (data as any).startedAt.toDate(),
          expiresAt,
          price: (data as any).price,
          transactionId: (data as any).transactionId,
        });
      }
    }

    return active;
  } catch (error) {
    logger.error('Failed to get active promotions', error as Error, {
      listingId,
    });
    return [];
  }
}

/**
 * Calculate total revenue from promotions for analytics
 */
export async function calculatePromotionRevenue(
  startDate: Date,
  endDate: Date
): Promise<number> {
  try {
    const txQuery = query(
      collection(db, 'micro_transactions'),
      where('createdAt', '>=', Timestamp.fromDate(startDate)),
      where('createdAt', '<=', Timestamp.fromDate(endDate)),
      where('status', '==', 'completed')
    );
    const snapshot = await getDocs(txQuery);
    let total = 0;
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      total += data.amount || 0;
    });
    logger.info('Calculated promotion revenue', { startDate, endDate, total });
    return total;
  } catch (error) {
    logger.error('Failed to calculate promotion revenue', error as Error, {
      startDate,
      endDate,
    });
    return 0;
  }
}

/**
 * Clean expired promotions (run as Cloud Function scheduled task)
 */
export async function cleanExpiredPromotions(): Promise<number> {
  try {
    const listingsQuery = query(
      collection(db, 'listings'),
      where('promotions.hasActive', '==', true)
    );
    const snapshot = await getDocs(listingsQuery);
    const now = Timestamp.now();
    const batch = writeBatch(db);
    let cleanedCount = 0;

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const activePromotions = data.promotions?.active || {};
      const updatedPromotions: Record<string, unknown> = {};
      let hasRemaining = false;

      for (const [type, promo] of Object.entries(activePromotions)) {
        const expiresAt = (promo as any).expiresAt;
        if (expiresAt && expiresAt.toMillis() > now.toMillis()) {
          updatedPromotions[type] = promo;
          hasRemaining = true;
        } else {
          cleanedCount++;
        }
      }

      if (
        Object.keys(updatedPromotions).length <
        Object.keys(activePromotions).length
      ) {
        batch.update(docSnap.ref, {
          'promotions.active': updatedPromotions,
          'promotions.hasActive': hasRemaining,
          'promotions.lastCleanedAt': serverTimestamp(),
        });
      }
    });

    if (cleanedCount > 0) {
      await batch.commit();
    }
    logger.info('Cleaned expired promotions', { cleanedCount });
    return cleanedCount;
  } catch (error) {
    logger.error('Failed to clean expired promotions', error as Error);
    return 0;
  }
}
