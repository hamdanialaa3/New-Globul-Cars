/**
 * Profile Event Bus
 * Centralized dispatcher that wires real user actions to profile enhancement services.
 * All calls are fire-and-forget (failures never block the main action).
 */

import { logger } from '../logger-service';
import { pointsLevelsService } from './points-levels.service';
import { achievementsGalleryService } from './achievements-gallery.service';
import { transactionsService } from './transactions.service';
import type { Timestamp } from 'firebase/firestore';

// ── Event types ──────────────────────────────────────────────

export type ProfileEventType =
  | 'listing_created'
  | 'listing_sold'
  | 'profile_completed'
  | 'daily_login'
  | 'review_received'
  | 'trust_connection_made'
  | 'story_created'
  | 'video_uploaded'
  | 'verification_completed';

export interface ProfileEvent {
  type: ProfileEventType;
  userId: string;
  meta?: Record<string, unknown>;
}

// ── Helpers ──────────────────────────────────────────────────

const safe = async (label: string, fn: () => Promise<unknown>) => {
  try {
    await fn();
  } catch (err) {
    logger.warn(`[ProfileEventBus] ${label} failed`, {
      error: (err as Error).message,
    });
  }
};

// Day-key used to enforce once-per-day events
const todayKey = () => new Date().toISOString().slice(0, 10);
const dailyLoginTracker = new Map<string, string>();

// Track unlocked achievements in-memory to avoid duplicate writes
const unlockedAchievements = new Map<string, Set<string>>();

const hasAchievement = (userId: string, type: string): boolean =>
  unlockedAchievements.get(userId)?.has(type) ?? false;

const markAchievement = (userId: string, type: string) => {
  if (!unlockedAchievements.has(userId))
    unlockedAchievements.set(userId, new Set());
  unlockedAchievements.get(userId)!.add(type);
};

// ── Core dispatch ────────────────────────────────────────────

async function handleEvent(event: ProfileEvent): Promise<void> {
  const { type, userId, meta } = event;
  logger.info('[ProfileEventBus] handling event', { type, userId });

  switch (type) {
    // ── Listing created ──────────────────────────────────────
    case 'listing_created': {
      await safe('addPoints:listing_created', () =>
        pointsLevelsService.addPoints(
          userId,
          'listing_created',
          'Created a new listing'
        )
      );
      // First listing achievement
      if (!hasAchievement(userId, 'first_listing')) {
        await safe('achievement:first_listing', () =>
          achievementsGalleryService.unlockAchievement(
            userId,
            'first_listing',
            {
              title: 'Първо обявление',
              description: 'Създадохте първото си обявление',
              icon: '📝',
            }
          )
        );
        markAchievement(userId, 'first_listing');
      }
      break;
    }

    // ── Listing sold ─────────────────────────────────────────
    case 'listing_sold': {
      await safe('addPoints:listing_sold', () =>
        pointsLevelsService.addPoints(userId, 'listing_sold', 'Sold a vehicle')
      );

      // Record transaction
      if (meta?.carId) {
        await safe('createTransaction', () =>
          transactionsService.createTransaction({
            userId,
            carId: String(meta.carId),
            carMake: String(meta.carMake ?? ''),
            carModel: String(meta.carModel ?? ''),
            carYear: Number(meta.carYear ?? 0),
            salePrice: Number(meta.salePrice ?? 0),
            currency: 'EUR',
            saleDate: (meta.saleDate as Timestamp) ?? null,
            buyerId: meta.buyerId ? String(meta.buyerId) : undefined,
            buyerName: meta.buyerName ? String(meta.buyerName) : undefined,
            status: 'completed',
          })
        );
      }

      // First sale achievement
      if (!hasAchievement(userId, 'first_sale')) {
        await safe('achievement:first_sale', () =>
          achievementsGalleryService.unlockAchievement(userId, 'first_sale', {
            title: 'Първа продажба',
            description: 'Продадохте първия си автомобил',
            icon: '🏆',
          })
        );
        markAchievement(userId, 'first_sale');
      }
      break;
    }

    // ── Profile completed ────────────────────────────────────
    case 'profile_completed': {
      await safe('addPoints:profile_completed', () =>
        pointsLevelsService.addPoints(
          userId,
          'profile_completed',
          'Completed profile 100%'
        )
      );
      if (!hasAchievement(userId, 'profile_complete')) {
        await safe('achievement:profile_complete', () =>
          achievementsGalleryService.unlockAchievement(
            userId,
            'first_listing',
            {
              title: 'Пълен профил',
              description: 'Попълнихте профила си напълно',
              icon: '✅',
            }
          )
        );
        markAchievement(userId, 'profile_complete');
      }
      break;
    }

    // ── Daily login ──────────────────────────────────────────
    case 'daily_login': {
      const key = todayKey();
      if (dailyLoginTracker.get(userId) === key) break; // already awarded today
      dailyLoginTracker.set(userId, key);
      await safe('addPoints:daily_login', () =>
        pointsLevelsService.addPoints(
          userId,
          'daily_login',
          'Daily login bonus'
        )
      );
      break;
    }

    // ── Review received ──────────────────────────────────────
    case 'review_received': {
      await safe('addPoints:positive_review', () =>
        pointsLevelsService.addPoints(
          userId,
          'positive_review',
          'Received a review'
        )
      );
      break;
    }

    // ── Trust connection ─────────────────────────────────────
    case 'trust_connection_made': {
      await safe('addPoints:referral', () =>
        pointsLevelsService.addPoints(
          userId,
          'referral',
          'Trust connection established'
        )
      );
      break;
    }

    // ── Verification completed ───────────────────────────────
    case 'verification_completed': {
      await safe('addPoints:verification_completed', () =>
        pointsLevelsService.addPoints(
          userId,
          'verification_completed',
          'Verification completed'
        )
      );
      if (!hasAchievement(userId, 'verified_seller')) {
        await safe('achievement:verified_seller', () =>
          achievementsGalleryService.unlockAchievement(
            userId,
            'verified_seller',
            {
              title: 'Верифициран продавач',
              description: 'Верифицирахте профила си',
              icon: '🛡️',
            }
          )
        );
        markAchievement(userId, 'verified_seller');
      }
      break;
    }

    // ── Story / Video ────────────────────────────────────────
    case 'story_created':
    case 'video_uploaded': {
      await safe('addPoints:social_share', () =>
        pointsLevelsService.addPoints(
          userId,
          'social_share',
          `User ${type.replace('_', ' ')}`
        )
      );
      break;
    }

    default:
      logger.warn('[ProfileEventBus] unknown event type', { type });
  }
}

// ── Public API ───────────────────────────────────────────────

/**
 * Emit a profile event. Always fire-and-forget — never blocks the caller.
 */
export const emitProfileEvent = (event: ProfileEvent): void => {
  handleEvent(event).catch(err =>
    logger.warn('[ProfileEventBus] top-level catch', {
      error: (err as Error).message,
    })
  );
};
