/**
 * Profile Migration Service
 * Phase 2B: Integration Services
 * 
 * Handles migration of legacy data to new structure.
 * Supports dual-write strategy during transition period.
 * 
 * File: src/services/profile/ProfileMigrationService.ts
 */

import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  writeBatch,
  collection,
  query,
  where,
  getDocs,
  limit,
  serverTimestamp,
  deleteField
} from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { logger } from '../logger-service';
import { DealershipRepository } from '../../repositories/DealershipRepository';
import { CompanyRepository } from '../../repositories/CompanyRepository';
import type { BulgarianUser, DealerProfile } from '@globul-cars/core/typesuser/bulgarian-user.types';
import type { DealershipInfo } from '@globul-cars/core/typesdealership/dealership.types';

export interface MigrationResult {
  success: boolean;
  migratedCount: number;
  skippedCount: number;
  errorCount: number;
  errors: Array<{ uid: string; error: string }>;
}

export class ProfileMigrationService {
  /**
   * Migrate single user from legacy structure to new structure
   */
  static async migrateUser(uid: string): Promise<boolean> {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        logger.warn('User not found for migration', { uid });
        return false;
      }

      const userData = userSnap.data() as any;

      // Skip if already migrated
      if (userData.dealershipRef || userData.companyRef) {
        logger.debug('User already migrated', { uid });
        return true;
      }

      // Migrate if has legacy dealerInfo
      if (userData.dealerInfo && (userData.isDealer || userData.profileType === 'dealer')) {
        await this.migrateDealerUser(uid, userData);
        return true;
      }

      // Set default profileType if missing
      if (!userData.profileType) {
        await updateDoc(userRef, {
          profileType: 'private',
          planTier: 'free',
          updatedAt: serverTimestamp()
        });
        logger.info('Set default profileType for user', { uid });
        return true;
      }

      return true;
    } catch (error) {
      logger.error('Error migrating user', error as Error, { uid });
      return false;
    }
  }

  /**
   * Migrate dealer user (dealerInfo → dealerships collection)
   */
  private static async migrateDealerUser(uid: string, userData: any): Promise<void> {
    try {
      const dealerInfo = userData.dealerInfo;

      // Create dealership document
      const dealershipData: Partial<DealershipInfo> = {
        uid,
        dealershipNameBG: dealerInfo.companyName || dealerInfo.dealershipNameBG || 'Unknown',
        dealershipNameEN: dealerInfo.dealershipNameEN || dealerInfo.companyName,
        eik: dealerInfo.licenseNumber || dealerInfo.eik || '000000000',
        vatNumber: dealerInfo.vatNumber,
        licenseNumber: dealerInfo.licenseNumber,
        address: {
          street: dealerInfo.address?.street || '',
          city: dealerInfo.address?.city || userData.location?.city || 'София',
          region: dealerInfo.address?.region || userData.location?.region || 'София',
          postalCode: dealerInfo.address?.postalCode || '1000',
          country: 'Bulgaria'
        },
        contact: {
          phone: dealerInfo.contactInfo?.phone || userData.phoneNumber || '+359000000000',
          phoneCountryCode: '+359',
          email: dealerInfo.contactInfo?.email || userData.email,
          website: dealerInfo.contactInfo?.website
        },
        workingHours: this.getDefaultWorkingHours(),
        services: {
          newCarSales: true,
          usedCarSales: true,
          carImport: false,
          tradeIn: false,
          financing: false,
          leasing: false,
          insurance: false,
          maintenance: false,
          repairs: false,
          warranty: false,
          carWash: false,
          detailing: false,
          homeDelivery: false,
          testDrive: true,
          onlineReservation: false,
          specializations: dealerInfo.specializations || [],
          brands: []
        },
        certifications: {
          brandCertifications: [],
          industryCertifications: []
        },
        media: {
          logo: dealerInfo.logo,
          galleryImages: []
        },
        settings: {
          displayLanguages: ['bg'],
          currency: 'EUR',
          privacySettings: {
            showPhoneNumber: true,
            showEmail: true,
            showAddress: true,
            showWorkingHours: true,
            allowDirectMessages: true,
            allowCalls: true
          },
          notifications: {
            newInquiries: true,
            newReviews: true,
            weeklyReport: true,
            monthlyReport: true
          },
          businessRules: {
            autoReplyEnabled: false
          }
        },
        verification: {
          status: dealerInfo.verificationStatus || 'pending',
          submittedAt: userData.createdAt
        }
      } as any;

      // Save to dealerships collection
      await DealershipRepository.createOrUpdate(uid, dealershipData as any);

      // Update user document
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        profileType: 'dealer',
        dealershipRef: `dealerships/${uid}`,
        dealerSnapshot: {
          nameBG: dealershipData.dealershipNameBG,
          nameEN: dealershipData.dealershipNameEN,
          logo: dealershipData.media?.logo,
          status: dealershipData.verification?.status || 'pending'
        },
        // Keep legacy fields for backward compatibility (Phase 2-3)
        // Will be removed in Phase 4
        isDealer: true,
        dealerInfo: dealerInfo,
        updatedAt: serverTimestamp()
      });

      logger.info('Dealer user migrated successfully', { uid });
    } catch (error) {
      logger.error('Error migrating dealer user', error as Error, { uid });
      throw error;
    }
  }

  /**
   * Batch migrate users
   */
  static async batchMigrate(batchSize: number = 100): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: true,
      migratedCount: 0,
      skippedCount: 0,
      errorCount: 0,
      errors: []
    };

    try {
      // Find users with dealerInfo but no dealershipRef
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('dealerInfo', '!=', null),
        limit(batchSize)
      );

      const snapshot = await getDocs(q);
      logger.info('Starting batch migration', { totalUsers: snapshot.size });

      for (const docSnap of snapshot.docs) {
        const uid = docSnap.id;
        const userData = docSnap.data();

        // Skip if already has dealershipRef
        if (userData.dealershipRef) {
          result.skippedCount++;
          continue;
        }

        try {
          await this.migrateUser(uid);
          result.migratedCount++;
        } catch (error) {
          result.errorCount++;
          result.errors.push({
            uid,
            error: (error as Error).message
          });
          logger.error('Error in batch migration for user', error as Error, { uid });
        }
      }

      logger.info('Batch migration complete', result);
      return result;
    } catch (error) {
      logger.error('Error in batch migration', error as Error);
      result.success = false;
      return result;
    }
  }

  /**
   * Cleanup legacy fields (after migration complete)
   */
  static async cleanupLegacyFields(uid: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      
      await updateDoc(userRef, {
        isDealer: deleteField(),
        dealerInfo: deleteField(),
        updatedAt: serverTimestamp()
      });

      logger.info('Legacy fields cleaned up', { uid });
    } catch (error) {
      logger.error('Error cleaning up legacy fields', error as Error, { uid });
      throw new Error(`Failed to cleanup legacy fields: ${(error as Error).message}`);
    }
  }

  /**
   * Batch cleanup legacy fields
   */
  static async batchCleanup(batchSize: number = 100): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: true,
      migratedCount: 0,
      skippedCount: 0,
      errorCount: 0,
      errors: []
    };

    try {
      // Find users with dealershipRef (migrated) but still have legacy fields
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('dealershipRef', '!=', null),
        limit(batchSize)
      );

      const snapshot = await getDocs(q);

      for (const docSnap of snapshot.docs) {
        const uid = docSnap.id;
        const userData = docSnap.data();

        // Skip if already cleaned
        if (!userData.isDealer && !userData.dealerInfo) {
          result.skippedCount++;
          continue;
        }

        try {
          await this.cleanupLegacyFields(uid);
          result.migratedCount++;
        } catch (error) {
          result.errorCount++;
          result.errors.push({
            uid,
            error: (error as Error).message
          });
        }
      }

      logger.info('Batch cleanup complete', result);
      return result;
    } catch (error) {
      logger.error('Error in batch cleanup', error as Error);
      result.success = false;
      return result;
    }
  }

  /**
   * Get default working hours
   */
  private static getDefaultWorkingHours(): any {
    const defaultDay = {
      isOpen: true,
      openTime: '09:00',
      closeTime: '18:00'
    };

    const closedDay = {
      isOpen: false
    };

    return {
      monday: defaultDay,
      tuesday: defaultDay,
      wednesday: defaultDay,
      thursday: defaultDay,
      friday: defaultDay,
      saturday: { ...defaultDay, closeTime: '14:00' },
      sunday: closedDay
    };
  }

  /**
   * Validate migration readiness
   */
  static async validateMigrationReadiness(): Promise<{
    ready: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    try {
      // Check if dealerships collection exists
      const dealershipsRef = collection(db, 'dealerships');
      const dealershipsSnap = await getDocs(query(dealershipsRef, limit(1)));
      
      if (!dealershipsSnap.empty) {
        issues.push('Dealerships collection already has data - verify before migration');
      }

      // Count users with dealerInfo
      const usersWithDealerInfo = await getDocs(
        query(collection(db, 'users'), where('dealerInfo', '!=', null), limit(1000))
      );

      if (usersWithDealerInfo.size > 500) {
        issues.push(`Large migration needed: ${usersWithDealerInfo.size} users to migrate`);
      }

      logger.info('Migration readiness check', {
        usersToMigrate: usersWithDealerInfo.size,
        issuesCount: issues.length
      });

      return {
        ready: issues.length === 0,
        issues
      };
    } catch (error) {
      logger.error('Error checking migration readiness', error as Error);
      return {
        ready: false,
        issues: ['Error checking readiness: ' + (error as Error).message]
      };
    }
  }
}

export default ProfileMigrationService;

