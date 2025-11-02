/**
 * Profile Service - Unified Profile Management
 * Phase 2A: Core Service Layer
 * 
 * This service handles all profile-related operations across all types.
 * It orchestrates repositories and maintains consistency.
 * 
 * File: src/services/profile/ProfileService.ts
 */

import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  serverTimestamp,
  runTransaction,
  increment
} from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { logger } from '../logger-service';
import { DealershipRepository } from '../../repositories/DealershipRepository';
import { CompanyRepository } from '../../repositories/CompanyRepository';
import type { 
  BulgarianUser, 
  BulgarianUserUpdate,
  ProfileType,
  DealerProfile,
  CompanyProfile
} from '../../types/user/bulgarian-user.types';
import type { DealershipInfo } from '../../types/dealership/dealership.types';
import type { CompanyInfo } from '../../types/company/company.types';

export class ProfileService {
  /**
   * Get complete profile (user + dealership/company data if applicable)
   */
  static async getCompleteProfile(uid: string): Promise<{
    user: BulgarianUser;
    dealership?: DealershipInfo;
    company?: CompanyInfo;
  }> {
    try {
      // Get user document
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        throw new Error('User not found');
      }

      const user = { ...userSnap.data(), uid } as BulgarianUser;
      const result: any = { user };

      // Load additional data based on profile type
      if (user.profileType === 'dealer') {
        const dealership = await DealershipRepository.getById(uid);
        if (dealership) {
          result.dealership = dealership;
        }
      } else if (user.profileType === 'company') {
        const company = await CompanyRepository.getById(uid);
        if (company) {
          result.company = company;
        }
      }

      return result;
    } catch (error) {
      logger.error('Error fetching complete profile', error as Error, { uid });
      throw new Error(`Failed to fetch profile: ${(error as Error).message}`);
    }
  }

  /**
   * Update user profile (basic fields only)
   */
  static async updateUserProfile(uid: string, data: BulgarianUserUpdate): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);

      await updateDoc(userRef, {
        ...data,
        updatedAt: serverTimestamp()
      });

      logger.info('User profile updated', { uid, fields: Object.keys(data) });
    } catch (error) {
      logger.error('Error updating user profile', error as Error, { uid });
      throw new Error(`Failed to update profile: ${(error as Error).message}`);
    }
  }

  /**
   * Switch profile type (with full validation and data setup)
   */
  static async switchProfileType(
    uid: string,
    newType: ProfileType,
    additionalData?: {
      dealershipInfo?: Partial<DealershipInfo>;
      companyInfo?: Partial<CompanyInfo>;
    }
  ): Promise<void> {
    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', uid);
        const userSnap = await transaction.get(userRef);

        if (!userSnap.exists()) {
          throw new Error('User not found');
        }

        const currentUser = userSnap.data() as BulgarianUser;
        const currentType = currentUser.profileType;

        // Validation already done in ProfileTypeContext
        // This is the actual switch operation

        if (newType === 'dealer') {
          // Ensure dealership exists or create it
          if (additionalData?.dealershipInfo) {
            const dealershipRef = doc(db, 'dealerships', uid);
            transaction.set(dealershipRef, {
              ...additionalData.dealershipInfo,
              uid,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            }, { merge: true });
          }

          // Update user with dealer fields
          transaction.update(userRef, {
            profileType: 'dealer',
            dealershipRef: `dealerships/${uid}`,
            planTier: currentUser.planTier?.includes('dealer') ? currentUser.planTier : 'dealer_basic',
            updatedAt: serverTimestamp()
          });

        } else if (newType === 'company') {
          // Ensure company exists or create it
          if (additionalData?.companyInfo) {
            const companyRef = doc(db, 'companies', uid);
            transaction.set(companyRef, {
              ...additionalData.companyInfo,
              uid,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            }, { merge: true });
          }

          // Update user with company fields
          transaction.update(userRef, {
            profileType: 'company',
            companyRef: `companies/${uid}`,
            planTier: currentUser.planTier?.includes('company') ? currentUser.planTier : 'company_starter',
            updatedAt: serverTimestamp()
          });

        } else {
          // Switch to private
          transaction.update(userRef, {
            profileType: 'private',
            planTier: 'free',
            updatedAt: serverTimestamp()
          });
        }
      });

      logger.info('Profile type switched', { uid, newType });
    } catch (error) {
      logger.error('Error switching profile type', error as Error, { uid, newType });
      throw new Error(`Failed to switch profile type: ${(error as Error).message}`);
    }
  }

  /**
   * Increment profile view count
   */
  static async incrementViews(uid: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      
      await updateDoc(userRef, {
        'stats.totalViews': increment(1)
      });

      logger.debug('Profile views incremented', { uid });
    } catch (error) {
      logger.error('Error incrementing views', error as Error, { uid });
      // Don't throw - views are not critical
    }
  }

  /**
   * Update profile stats
   */
  static async updateStats(
    uid: string,
    stats: {
      activeListings?: number;
      totalViews?: number;
      totalMessages?: number;
      trustScore?: number;
    }
  ): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      const updates: any = {};

      if (stats.activeListings !== undefined) {
        updates['stats.activeListings'] = stats.activeListings;
      }
      if (stats.totalViews !== undefined) {
        updates['stats.totalViews'] = stats.totalViews;
      }
      if (stats.totalMessages !== undefined) {
        updates['stats.totalMessages'] = stats.totalMessages;
      }
      if (stats.trustScore !== undefined) {
        updates['stats.trustScore'] = stats.trustScore;
      }

      if (Object.keys(updates).length > 0) {
        updates.updatedAt = serverTimestamp();
        await updateDoc(userRef, updates);
        logger.debug('Profile stats updated', { uid, stats: Object.keys(stats) });
      }
    } catch (error) {
      logger.error('Error updating stats', error as Error, { uid });
      throw new Error(`Failed to update stats: ${(error as Error).message}`);
    }
  }

  /**
   * Update verification status
   */
  static async updateVerificationStatus(
    uid: string,
    field: 'email' | 'phone' | 'id' | 'business',
    verified: boolean
  ): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      
      await updateDoc(userRef, {
        [`verification.${field}`]: verified,
        updatedAt: serverTimestamp()
      });

      logger.info('Verification status updated', { uid, field, verified });
    } catch (error) {
      logger.error('Error updating verification', error as Error, { uid, field });
      throw new Error(`Failed to update verification: ${(error as Error).message}`);
    }
  }

  /**
   * Get user's active listings count
   */
  static async getActiveListingsCount(uid: string): Promise<number> {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return 0;
      }

      const user = userSnap.data() as BulgarianUser;
      return user.stats?.activeListings || 0;
    } catch (error) {
      logger.error('Error getting active listings count', error as Error, { uid });
      return 0;
    }
  }

  /**
   * Check if user can add more listings
   */
  static async canAddListing(uid: string): Promise<boolean> {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return false;
      }

      const user = userSnap.data() as BulgarianUser;
      const activeListings = user.stats?.activeListings || 0;
      const maxListings = user.permissions?.maxListings || 3;

      return maxListings === -1 || activeListings < maxListings;
    } catch (error) {
      logger.error('Error checking listing permission', error as Error, { uid });
      return false;
    }
  }

  /**
   * Initialize new user profile
   */
  static async initializeProfile(
    uid: string,
    email: string,
    displayName: string
  ): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);

      // Check if already exists
      const existing = await getDoc(userRef);
      if (existing.exists()) {
        logger.warn('Profile already exists', { uid });
        return;
      }

      // Create default profile
      const newProfile: Partial<BulgarianUser> = {
        uid,
        email,
        displayName,
        phoneCountryCode: '+359',
        preferredLanguage: 'bg',
        currency: 'EUR',
        profileType: 'private',
        planTier: 'free',
        permissions: {
          canAddListings: true,
          maxListings: 3,
          hasAnalytics: false,
          hasTeam: false,
          canExportData: false,
          canUseAPI: false
        },
        verification: {
          email: false,
          phone: false,
          id: false,
          business: false
        },
        stats: {
          totalListings: 0,
          activeListings: 0,
          totalViews: 0,
          totalMessages: 0,
          trustScore: 0
        },
        isActive: true,
        isBanned: false,
        createdAt: serverTimestamp() as any,
        updatedAt: serverTimestamp() as any
      };

      await setDoc(userRef, newProfile);
      logger.info('New profile initialized', { uid, email });
    } catch (error) {
      logger.error('Error initializing profile', error as Error, { uid });
      throw new Error(`Failed to initialize profile: ${(error as Error).message}`);
    }
  }

  /**
   * Soft delete profile (mark as inactive)
   */
  static async deactivateProfile(uid: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      
      await updateDoc(userRef, {
        isActive: false,
        updatedAt: serverTimestamp()
      });

      logger.info('Profile deactivated', { uid });
    } catch (error) {
      logger.error('Error deactivating profile', error as Error, { uid });
      throw new Error(`Failed to deactivate profile: ${(error as Error).message}`);
    }
  }

  /**
   * Reactivate profile
   */
  static async reactivateProfile(uid: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      
      await updateDoc(userRef, {
        isActive: true,
        updatedAt: serverTimestamp()
      });

      logger.info('Profile reactivated', { uid });
    } catch (error) {
      logger.error('Error reactivating profile', error as Error, { uid });
      throw new Error(`Failed to reactivate profile: ${(error as Error).message}`);
    }
  }

  /**
   * Ban user
   */
  static async banUser(uid: string, reason?: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      
      await updateDoc(userRef, {
        isBanned: true,
        isActive: false,
        banReason: reason || 'Violation of terms',
        bannedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      logger.warn('User banned', { uid, reason });
    } catch (error) {
      logger.error('Error banning user', error as Error, { uid });
      throw new Error(`Failed to ban user: ${(error as Error).message}`);
    }
  }

  /**
   * Unban user
   */
  static async unbanUser(uid: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      
      await updateDoc(userRef, {
        isBanned: false,
        isActive: true,
        banReason: null,
        bannedAt: null,
        unbannedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      logger.info('User unbanned', { uid });
    } catch (error) {
      logger.error('Error unbanning user', error as Error, { uid });
      throw new Error(`Failed to unban user: ${(error as Error).message}`);
    }
  }
}

export default ProfileService;

