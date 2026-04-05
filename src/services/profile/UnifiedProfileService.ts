/**
 * UNIFIED PROFILE SERVICE
 *
 * Consolidates 3 duplicate profile services into one canonical source:
 * - bulgarian-profile-service.ts (558 lines) → DDD
 * - dealership.service.ts (474 lines) → DDD
 * - ProfileService.ts → Merged here
 *
 * Total Lines Saved: 1,032 duplicate lines
 *
 * This is the SOLE SOURCE for all profile and dealership operations.
 *
 * @example
 * import { profileService } from '../../services/profile/UnifiedProfileService';
 * await profileService.setupDealerProfile(userId, dealerData);
 *
 * @since 2025-11-03 (Phase 1.2)
 * @version 1.0.0
 */

import {
  BulgarianUser,
  BulgarianUserUpdate,
  DealerProfile,
  CompanyProfile,
  isDealerProfile,
  isCompanyProfile,
} from '../../types/user/bulgarian-user.types';
import {
  DealershipInfo,
  PrivacySettings,
} from '../../types/dealership/dealership.types';
import { CompanyInfo } from '../../types/company/company.types';
import { db, storage } from '@/firebase/firebase-config';
import { userService } from '../../services/user/canonical-user.service';
import { logger } from '../../services/logger-service';
import {
  doc,
  setDoc,
  getDoc,
  getDocFromServer,
  updateDoc,
  serverTimestamp,
  runTransaction,
  Transaction,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export class UnifiedProfileService {
  private static instance: UnifiedProfileService;

  private constructor() {
    logger.info('UnifiedProfileService initialized');
  }

  static getInstance(): UnifiedProfileService {
    if (!this.instance) {
      this.instance = new UnifiedProfileService();
    }
    return this.instance;
  }

  /**
   * Setup dealer profile
   * Creates a dealership document and updates user profile to dealer type
   * Merges functionality from bulgarian-profile-service.setupDealerProfile()
   * and dealership.service.saveDealershipInfo()
   *
   * @param userId - Firebase UID of the user
   * @param dealershipData - Dealership information (name, address, license, etc.)
   * @returns Promise that resolves when setup is complete
   * @throws Error if validation fails or database write fails
   *
   * @example
   * await profileService.setupDealerProfile('user-123', {
   *   dealershipNameBG: 'Автосалон БГ',
   *   dealershipNameEN: 'BG Auto Dealer',
   *   address: 'Sofia, Bulgaria',
   *   licenseNumber: 'BG-12345'
   * });
   */
  async setupDealerProfile(
    userId: string,
    dealershipData: DealershipInfo
  ): Promise<void> {
    try {
      logger.info('Setting up dealer profile', { userId });

      // 1. Create dealership document in 'dealerships' collection
      const dealershipRef = doc(db, 'dealerships', userId);
      // uid is in dealershipData usually, but safer to merge cleanly or ensure it matches
      const { uid: _, ...restDealerData } = dealershipData as any;
      await setDoc(
        dealershipRef,
        {
          uid: userId,
          ownerId: userId,
          ...restDealerData,
          status: 'pending',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // 2. Update user profile to dealer type
      const userUpdate: Partial<DealerProfile> = {
        profileType: 'dealer',
        accountType: 'dealer',
        dealershipRef: `dealerships/${userId}`,
        dealerSnapshot: {
          nameBG: dealershipData.dealershipNameBG || '',
          nameEN: dealershipData.dealershipNameEN || '',
          logo: dealershipData.media?.logo,
          status: 'pending',
        },
      };

      await userService.updateUserProfile(userId, userUpdate as any);

      logger.info('Dealer profile setup complete', { userId });
    } catch (error) {
      logger.error('Error setting up dealer profile', error as Error, {
        userId,
      });
      throw error;
    }
  }

  /**
   * Get dealership information
   * Retrieves dealership data from the dealerships collection
   * Merged from dealership.service.getDealershipInfo()
   *
   * @param dealershipId - Firebase UID of the dealership owner
   * @returns Promise resolving to dealership info or null if not found
   * @throws Error if database query fails
   *
   * @example
   * const dealer = await profileService.getDealershipInfo('user-123');
   * if (dealer) {
   *   logger.info(`Dealership: ${dealer.dealershipNameBG}`);
   * }
   */
  async getDealershipInfo(
    dealershipId: string
  ): Promise<DealershipInfo | null> {
    try {
      const dealershipRef = doc(db, 'dealerships', dealershipId);
      const dealershipDoc = await getDoc(dealershipRef);

      if (!dealershipDoc.exists()) {
        logger.warn('Dealership not found', { dealershipId });
        return null;
      }

      return dealershipDoc.data() as DealershipInfo;
    } catch (error) {
      logger.error('Error fetching dealership info', error as Error, {
        dealershipId,
      });
      throw error;
    }
  }

  /**
   * Update dealership information
   * Updates dealership document and syncs changes to user profile snapshot
   * Merged from dealership.service.saveDealershipInfo()
   *
   * @param dealershipId - Firebase UID of the dealership owner
   * @param updates - Partial dealership data to update
   * @returns Promise that resolves when update is complete
   * @throws Error if dealership not found or database write fails
   *
   * @example
   * await profileService.updateDealershipInfo('user-123', {
   *   dealershipNameBG: 'Ново име',
   *   address: 'New address'
   * });
   */
  async updateDealershipInfo(
    dealershipId: string,
    updates: Partial<DealershipInfo>
  ): Promise<void> {
    try {
      // Update dealership document
      const dealershipRef = doc(db, 'dealerships', dealershipId);
      await updateDoc(dealershipRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      // Sync snapshot to user profile
      const user = await userService.getUserProfile(dealershipId);
      if (
        user &&
        isDealerProfile(user) &&
        user.dealershipRef === `dealerships/${dealershipId}`
      ) {
        const userUpdate: Partial<DealerProfile> = {
          dealerSnapshot: {
            nameBG:
              updates.dealershipNameBG || user.dealerSnapshot?.nameBG || '',
            nameEN:
              updates.dealershipNameEN || user.dealerSnapshot?.nameEN || '',
            logo: updates.media?.logo || user.dealerSnapshot?.logo,
            status: user.dealerSnapshot?.status || 'pending',
          },
        };
        await userService.updateUserProfile(dealershipId, userUpdate as any);
      }

      logger.info('Dealership info updated', { dealershipId });
    } catch (error) {
      logger.error('Error updating dealership info', error as Error, {
        dealershipId,
      });
      throw error;
    }
  }

  /**
   * Upload profile picture
   * Uploads a user's profile picture to Firebase Storage and updates profile
   * Merged from bulgarian-profile-service.uploadProfilePicture()
   *
   * @param userId - Firebase UID of the user
   * @param file - Image file to upload (max 5MB, must be image type)
   * @returns Promise resolving to the download URL of the uploaded image
   * @throws Error if file validation fails, upload fails, or profile update fails
   *
   * @example
   * const url = await profileService.uploadProfilePicture('user-123', imageFile);
   * logger.info(`Profile picture URL: ${url}`);
   */
  async uploadProfilePicture(userId: string, file: File): Promise<string> {
    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size must be less than 5MB');
      }

      // Create storage reference
      const imageRef = ref(
        storage,
        `profile-pictures/${userId}/${Date.now()}-${file.name}`
      );

      // Upload file
      const snapshot = await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Update user profile
      await userService.updateUserProfile(userId, { photoURL: downloadURL });

      logger.info('Profile picture uploaded', { userId });
      return downloadURL;
    } catch (error) {
      logger.error('Error uploading profile picture', error as Error, {
        userId,
      });
      throw error;
    }
  }

  /**
   * Upload dealership logo
   */
  async uploadDealershipLogo(
    dealershipId: string,
    file: File
  ): Promise<string> {
    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Logo size must be less than 5MB');
      }

      // Create storage reference
      const logoRef = ref(
        storage,
        `dealerships/${dealershipId}/logo-${Date.now()}`
      );

      // Upload file
      const snapshot = await uploadBytes(logoRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Update dealership info - Logo is in Media object
      // We need to fetch current media to not overwrite other media fields if using merge/update
      // But updateDealershipInfo handles partials.
      // However, Firestore update with 'media.logo' dot notation requires flat object or explicit map
      // Here we assume updateDealershipInfo handles standard partials.
      // Since media is an object, passing { media: { logo: url } } might replace the whole object if not merged carefully in firestore.
      // Firestore updateDoc does MERGE fields if dot notation is used, but if we pass object it replaces map.
      // Let's use dot notation key for safety if possible, or fetch-read-write pattern.
      // Safe approach:

      const current = await this.getDealershipInfo(dealershipId);
      const currentMedia = current?.media || {};

      await this.updateDealershipInfo(dealershipId, {
        media: { ...currentMedia, logo: downloadURL },
      });

      logger.info('Dealership logo uploaded', { dealershipId });
      return downloadURL;
    } catch (error) {
      logger.error('Error uploading dealership logo', error as Error, {
        dealershipId,
      });
      throw error;
    }
  }

  /**
   * Upload dealer document (license, VAT, etc.)
   */
  async uploadDealerDocument(
    userId: string,
    file: File,
    type: 'license' | 'vat'
  ): Promise<string> {
    try {
      // Validate file
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB');
      }

      const docPath = type === 'license' ? 'licenses' : 'vat-docs';
      const docRef = ref(
        storage,
        `dealerships/${userId}/documents/${docPath}/${Date.now()}-${file.name}`
      );

      const snapshot = await uploadBytes(docRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Update dealership record with document URL
      // We need to store this somewhere in DealershipInfo.
      // Looking at DealershipInfo, we have 'certifications.dealerLicense', maybe there?
      // Or we can add it to a generic documents field if it exists.
      // DealershipInfo has 'certifications.dealerLicense.documentUrl' (BrandCertification) but for general license?
      // Let's assume we update the 'certifications' or 'verification' notes for now or specific fields if they existed.
      // The Type definition shows `licenseNumber` but not explicitly `licenseDocumentUrl`.
      // I will update `certifications` as it seems most appropriate place or extend the type later.
      // For now, to satisfy the requirement, I will just log it and maybe put it in `settings` or `notes` if available?
      // Actually, I'll update `verification` notes with the URL.

      const current = await this.getDealershipInfo(userId);
      const currentVerification = current?.verification || {
        status: 'pending',
      };

      await this.updateDealershipInfo(userId, {
        verification: {
          ...currentVerification,
          notes:
            (currentVerification.notes || '') +
            `\n[${type.toUpperCase()}] Document: ${downloadURL}`,
        },
      });

      logger.info(`Dealer ${type} document uploaded`, { userId });
      return downloadURL;
    } catch (error) {
      logger.error(`Error uploading dealer ${type} document`, error as Error, {
        userId,
      });
      throw error;
    }
  }

  /**
   * Setup company profile (similar to dealer but for companies)
   */
  async setupCompanyProfile(
    userId: string,
    companyData: CompanyInfo
  ): Promise<void> {
    try {
      // Similar to dealer setup but for companies
      const userUpdate: Partial<CompanyProfile> = {
        profileType: 'company',
        accountType: 'company',
        companyRef: `companies/${userId}`,
      };

      await userService.updateUserProfile(userId, userUpdate as any);

      // Create company document
      const companyRef = doc(db, 'companies', userId);
      const { uid: _, ...restCompanyData } = companyData as any;
      await setDoc(companyRef, {
        uid: userId,
        ...restCompanyData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      logger.info('Company profile setup complete', { userId });
    } catch (error) {
      logger.error('Error setting up company profile', error as Error, {
        userId,
      });
      throw error;
    }
  }

  /**
   * Switch profile type (private ↔ dealer ↔ company)
   * with validation
   */
  async switchProfileType(
    userId: string,
    newType: 'private' | 'dealer' | 'company',
    additionalData?: DealershipInfo | CompanyInfo
  ): Promise<void> {
    try {
      const currentProfile = await userService.getUserProfile(userId);
      if (!currentProfile) {
        throw new Error('User profile not found');
      }

      // Validate switch is allowed
      this.validateProfileTypeSwitch(currentProfile, newType);

      // Perform the switch
      if (newType === 'dealer' && additionalData) {
        await this.setupDealerProfile(userId, additionalData as DealershipInfo);
      } else if (newType === 'company' && additionalData) {
        await this.setupCompanyProfile(userId, additionalData as CompanyInfo);
      } else if (newType === 'private') {
        await userService.updateUserProfile(userId, {
          profileType: 'private',
          accountType: 'private',
          dealershipRef: undefined,
          companyRef: undefined,
        } as any);
      }

      logger.info('Profile type switched', {
        userId,
        from: currentProfile.profileType,
        to: newType,
      });
    } catch (error) {
      logger.error('Error switching profile type', error as Error, {
        userId,
        newType,
      });
      throw error;
    }
  }

  private validateProfileTypeSwitch(
    currentProfile: BulgarianUser,
    newType: 'private' | 'dealer' | 'company'
  ): void {
    // Add validation logic
    if (currentProfile.profileType === newType) {
      throw new Error('Already using this profile type');
    }

    // Additional validation can be added here
  }

  /**
   * Update user profile
   * Wrapper around userService.updateUserProfile for consistency
   * Merged from ProfileService.updateUserProfile()
   */
  async updateUserProfile(
    userId: string,
    updates: BulgarianUserUpdate
  ): Promise<void> {
    try {
      await userService.updateUserProfile(userId, updates as any);
      logger.info('User profile updated via UnifiedProfileService', {
        userId,
        fields: Object.keys(updates),
      });
    } catch (error) {
      logger.error('Error updating user profile', error as Error, { userId });
      throw error;
    }
  }

  /**
   * Get user profile
   * Wrapper around userService.getUserProfile for consistency
   */
  async getUserProfile(userId: string): Promise<BulgarianUser | null> {
    try {
      return await userService.getUserProfile(userId);
    } catch (error) {
      logger.error('Error fetching user profile', error as Error, { userId });
      throw error;
    }
  }

  /**
   * Get complete profile (user + dealership/company data if applicable)
   * Merged from ProfileService.getCompleteProfile()
   */
  async getCompleteProfile(uid: string): Promise<{
    user: BulgarianUser;
    dealership?: DealershipInfo;
    company?: CompanyInfo;
  }> {
    try {
      const user = await this.getUserProfile(uid);
      if (!user) {
        throw new Error('User not found');
      }

      const result: {
        user: BulgarianUser;
        dealership?: DealershipInfo;
        company?: CompanyInfo;
      } = { user };

      // Load additional data based on profile type
      if (isDealerProfile(user)) {
        const dealership = await this.getDealershipInfo(uid);
        if (dealership) {
          result.dealership = dealership;
        }
      } else if (isCompanyProfile(user)) {
        const companyRef = doc(db, 'companies', uid);
        const companyDoc = await getDoc(companyRef);
        if (companyDoc.exists()) {
          result.company = companyDoc.data() as CompanyInfo;
        }
      }

      return result;
    } catch (error) {
      logger.error('Error fetching complete profile', error as Error, { uid });
      throw error;
    }
  }

  /**
   * Save dealership info (alias for updateDealershipInfo for backward compatibility)
   * Merged from dealership.service.saveDealershipInfo()
   */
  async saveDealershipInfo(
    userId: string,
    dealershipData: Partial<DealershipInfo>
  ): Promise<void> {
    return this.updateDealershipInfo(userId, dealershipData);
  }

  /**
   * Get privacy settings
   * Merged from dealership.service.getPrivacySettings()
   */
  async getPrivacySettings(userId: string): Promise<PrivacySettings | null> {
    try {
      const dealership = await this.getDealershipInfo(userId);
      if (!dealership) {
        return null;
      }
      return dealership.settings.privacySettings || null;
    } catch (error) {
      logger.error('Error getting privacy settings', error as Error, {
        userId,
      });
      return null;
    }
  }

  /**
   * Save privacy settings
   * Merged from dealership.service.savePrivacySettings()
   */
  async savePrivacySettings(
    userId: string,
    privacySettings: PrivacySettings
  ): Promise<void> {
    try {
      // Privacy settings are in DealershipInfo.settings.privacySettings
      const current = await this.getDealershipInfo(userId);
      const currentSettings =
        current?.settings ||
        ({
          displayLanguages: ['bg'],
          currency: 'EUR',
          notifications: {
            newInquiries: true,
            newReviews: true,
            weeklyReport: true,
            monthlyReport: true,
          },
          businessRules: { autoReplyEnabled: false },
        } as any);

      await this.updateDealershipInfo(userId, {
        settings: {
          ...currentSettings,
          privacySettings: privacySettings,
        },
      });

      logger.info('Privacy settings saved', { userId });
    } catch (error) {
      logger.error('Error saving privacy settings', error as Error, { userId });
      throw error;
    }
  }

  /**
   * ✅ SELF-HEALING: Ensure user has a numeric ID
   * Assigns one atomically if missing.
   */
  async ensureNumericId(userId: string): Promise<number | null> {
    try {
      const userRef = doc(db, 'users', userId);

      // ✅ FIX: Check if user already has numericId BEFORE starting transaction
      // This prevents unnecessary transaction.verify() failures
      // ✅ Use getDocFromServer to avoid Firestore watch stream bug (ca9) in React Strict Mode
      const userSnapshot = await getDocFromServer(userRef);
      if (!userSnapshot.exists()) return null;

      const existingData = userSnapshot.data();
      if (existingData.numericId) {
        logger.debug('User already has numeric ID, skipping transaction', {
          userId,
          numericId: existingData.numericId,
        });
        return existingData.numericId;
      }

      // User needs numericId - Start transaction
      const result = await runTransaction(
        db,
        async (transaction: Transaction) => {
          const userDoc = await transaction.get(userRef);

          if (!userDoc.exists()) return null;

          const userData = userDoc.data();
          // Double-check inside transaction in case another process assigned it
          if (userData.numericId) return userData.numericId;

          // Missing ID - Assign one
          const counterRef = doc(db, 'counters', 'users');
          const counterDoc = await transaction.get(counterRef);

          let currentCount = 0;
          if (counterDoc.exists()) {
            currentCount = counterDoc.data()?.count || 0;
          }
          const numericId = currentCount + 1;

          // Update counter and user
          // 🚨 FIX: Use set() with merge instead of update() to avoid precondition failures
          transaction.set(
            counterRef,
            { count: numericId, updatedAt: serverTimestamp() },
            { merge: true }
          );
          transaction.set(
            userRef,
            {
              numericId,
              numericIdAssignedAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          ); // ✅ merge: true prevents precondition errors

          return numericId;
        }
      );

      if (result) {
        logger.info('✨ Self-healed numeric ID for user', {
          userId,
          numericId: result,
        });
      }
      return result;
    } catch (error) {
      logger.error('❌ Failed to ensure numeric ID', error as Error, {
        userId,
      });
      return null;
    }
  }
}

// Export singleton
export const profileService = UnifiedProfileService.getInstance();

// Backward compatibility exports
/** @deprecated Use profileService.setupDealerProfile() */
export const setupDealerProfile =
  profileService.setupDealerProfile.bind(profileService);

/** @deprecated Use profileService.getDealershipInfo() */
export const getDealershipInfo =
  profileService.getDealershipInfo.bind(profileService);

/** @deprecated Use profileService.updateDealershipInfo() */
export const updateDealershipInfo =
  profileService.updateDealershipInfo.bind(profileService);
