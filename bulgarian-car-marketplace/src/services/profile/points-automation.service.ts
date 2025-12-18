/**
 * Points Automation Service
 * Automatically awards points for user activities
 */

import { Timestamp } from 'firebase/firestore';
import { pointsLevelsService } from './points-levels.service';
import { successStoriesService } from './success-stories.service';
import { serviceLogger } from '../logger-service';
import type { PointsActivity } from '../../types/profile-enhancements.types';

export class PointsAutomationService {
  private static instance: PointsAutomationService;

  private constructor() {}

  public static getInstance(): PointsAutomationService {
    if (!PointsAutomationService.instance) {
      PointsAutomationService.instance = new PointsAutomationService();
    }
    return PointsAutomationService.instance;
  }

  /**
   * Award points when a listing is created
   */
  async onListingCreated(userId: string, carId: string): Promise<void> {
    try {
      const result = await pointsLevelsService.addPoints(
        userId,
        'listing_created',
        `Created listing: ${carId}`
      );

      serviceLogger.info(`Points awarded for listing creation`, {
        userId,
        carId,
        points: 10,
        newTotal: result.newPoints,
        leveledUp: result.leveledUp
      });

      // Check for milestones
      await this.checkListingMilestones(userId);
    } catch (error) {
      serviceLogger.error('Error awarding points for listing creation:', error);
      // Don't throw - points are not critical for listing creation
    }
  }

  /**
   * Award points when a car is sold
   */
  async onCarSold(userId: string, carId: string, isFirstSale: boolean = false): Promise<void> {
    try {
      // Award base points for sale
      const result = await pointsLevelsService.addPoints(
        userId,
        'listing_sold',
        `Sold car: ${carId}`
      );

      serviceLogger.info(`Points awarded for car sale`, {
        userId,
        carId,
        points: 50,
        newTotal: result.newPoints,
        leveledUp: result.leveledUp
      });

      // Award bonus for first sale
      if (isFirstSale) {
        await pointsLevelsService.addPoints(
          userId,
          'first_sale',
          'First sale milestone'
        );

        // Create success story for first sale
        await successStoriesService.createStory(userId, {
          title: 'First Sale',
          description: 'Successfully completed first car sale',
          type: 'sale',
          value: 1,
          date: Timestamp.now(),
          isPublic: true
        });
      }

      // Create success story for sale
      await successStoriesService.createStory(userId, {
        title: 'Car Sold',
        description: `Successfully sold car listing`,
        type: 'sale',
        value: 1,
        date: Timestamp.now(),
        isPublic: true
      });
    } catch (error) {
      serviceLogger.error('Error awarding points for car sale:', error);
      // Don't throw - points are not critical for sale
    }
  }

  /**
   * Award points when profile is completed
   */
  async onProfileCompleted(userId: string): Promise<void> {
    try {
      const result = await pointsLevelsService.addPoints(
        userId,
        'profile_completed',
        'Profile completion'
      );

      serviceLogger.info(`Points awarded for profile completion`, {
        userId,
        points: 15,
        newTotal: result.newPoints
      });
    } catch (error) {
      serviceLogger.error('Error awarding points for profile completion:', error);
    }
  }

  /**
   * Award points when verification is completed
   */
  async onVerificationCompleted(userId: string, verificationType: string): Promise<void> {
    try {
      const result = await pointsLevelsService.addPoints(
        userId,
        'verification_completed',
        `Verification: ${verificationType}`
      );

      serviceLogger.info(`Points awarded for verification`, {
        userId,
        verificationType,
        points: 25,
        newTotal: result.newPoints
      });
    } catch (error) {
      serviceLogger.error('Error awarding points for verification:', error);
    }
  }

  /**
   * Award points for positive review
   */
  async onPositiveReview(userId: string, reviewId: string): Promise<void> {
    try {
      const result = await pointsLevelsService.addPoints(
        userId,
        'positive_review',
        `Received positive review: ${reviewId}`
      );

      serviceLogger.info(`Points awarded for positive review`, {
        userId,
        reviewId,
        points: 20,
        newTotal: result.newPoints
      });
    } catch (error) {
      serviceLogger.error('Error awarding points for positive review:', error);
    }
  }

  /**
   * Award points for daily login
   */
  async onDailyLogin(userId: string): Promise<void> {
    try {
      // Check if user already logged in today (to prevent duplicate points)
      const userPoints = await pointsLevelsService.getUserPoints(userId);
      if (!userPoints) return;

      const lastActivity = userPoints.lastActivityAt;
      if (lastActivity) {
        const lastActivityDate = lastActivity.toDate ? lastActivity.toDate() : new Date(lastActivity);
        const today = new Date();
        if (
          lastActivityDate.getDate() === today.getDate() &&
          lastActivityDate.getMonth() === today.getMonth() &&
          lastActivityDate.getFullYear() === today.getFullYear()
        ) {
          // Already logged in today
          return;
        }
      }

      const result = await pointsLevelsService.addPoints(
        userId,
        'daily_login',
        'Daily login bonus'
      );

      serviceLogger.info(`Points awarded for daily login`, {
        userId,
        points: 5,
        newTotal: result.newPoints
      });
    } catch (error) {
      serviceLogger.error('Error awarding points for daily login:', error);
    }
  }

  /**
   * Award points for referral
   */
  async onReferral(userId: string, referredUserId: string): Promise<void> {
    try {
      const result = await pointsLevelsService.addPoints(
        userId,
        'referral',
        `Referred user: ${referredUserId}`
      );

      serviceLogger.info(`Points awarded for referral`, {
        userId,
        referredUserId,
        points: 30,
        newTotal: result.newPoints
      });
    } catch (error) {
      serviceLogger.error('Error awarding points for referral:', error);
    }
  }

  /**
   * Award points for social share
   */
  async onSocialShare(userId: string, shareType: string): Promise<void> {
    try {
      const result = await pointsLevelsService.addPoints(
        userId,
        'social_share',
        `Shared on ${shareType}`
      );

      serviceLogger.info(`Points awarded for social share`, {
        userId,
        shareType,
        points: 10,
        newTotal: result.newPoints
      });
    } catch (error) {
      serviceLogger.error('Error awarding points for social share:', error);
    }
  }

  /**
   * Check for listing milestones
   */
  private async checkListingMilestones(userId: string): Promise<void> {
    try {
      // Get user's total listings count
      // This would need to be implemented based on your car service
      // For now, we'll just check if we should award milestone points
      // You can enhance this by querying the car service

      // Example: Check for 100 listings milestone
      // const totalListings = await getTotalListingsCount(userId);
      // if (totalListings === 100) {
      //   await pointsLevelsService.addPoints(
      //     userId,
      //     'milestone_100_listings',
      //     '100 listings milestone'
      //   );
      // }
    } catch (error) {
      serviceLogger.error('Error checking listing milestones:', error);
    }
  }
}

export const pointsAutomationService = PointsAutomationService.getInstance();

