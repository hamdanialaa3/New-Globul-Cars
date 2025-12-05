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

import { BulgarianUser } from '../../types/user/bulgarian-user.types';
import { DealershipInfo } from '../../types/dealership/dealership.types';
import { db, storage } from '../../firebase/firebase-config';
import { userService } from '../../services/user/canonical-user.service';
import { logger } from '../../services/logger-service';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
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
   * Merges functionality from bulgarian-profile-service.setupDealerProfile()
   * and dealership.service.saveDealershipInfo()
   */
  async setupDealerProfile(userId: string, dealershipData: DealershipInfo): Promise<void> {
    try {
      logger.info('Setting up dealer profile', { userId });
      
      // 1. Create dealership document in 'dealerships' collection
      const dealershipRef = doc(db, 'dealerships', userId);
      await setDoc(dealershipRef, {
        uid: userId,
        ownerId: userId,
        ...dealershipData,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      // 2. Update user profile to dealer type
      await userService.updateUserProfile(userId, {
        profileType: 'dealer',
        dealershipRef: userId,
        dealerSnapshot: {
          nameBG: dealershipData.dealershipNameBG || '',
          nameEN: dealershipData.dealershipNameEN || '',
          logo: dealershipData.logo,
          status: 'pending'
        }
      });
      
      logger.info('Dealer profile setup complete', { userId });
      
    } catch (error) {
      logger.error('Error setting up dealer profile', error as Error, { userId });
      throw error;
    }
  }
  
  /**
   * Get dealership information
   * Merged from dealership.service.getDealershipInfo()
   */
  async getDealershipInfo(dealershipId: string): Promise<DealershipInfo | null> {
    try {
      const dealershipRef = doc(db, 'dealerships', dealershipId);
      const dealershipDoc = await getDoc(dealershipRef);
      
      if (!dealershipDoc.exists()) {
        logger.warn('Dealership not found', { dealershipId });
        return null;
      }
      
      return dealershipDoc.data() as DealershipInfo;
      
    } catch (error) {
      logger.error('Error fetching dealership info', error as Error, { dealershipId });
      throw error;
    }
  }
  
  /**
   * Update dealership information
   * Merged from dealership.service.saveDealershipInfo()
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
        updatedAt: serverTimestamp()
      });
      
      // Sync snapshot to user profile
      const user = await userService.getUserProfile(dealershipId);
      if (user && user.dealershipRef === dealershipId) {
        await userService.updateUserProfile(dealershipId, {
          dealerSnapshot: {
            nameBG: updates.dealershipNameBG || user.dealerSnapshot?.nameBG || '',
            nameEN: updates.dealershipNameEN || user.dealerSnapshot?.nameEN || '',
            logo: updates.logo || user.dealerSnapshot?.logo,
            status: user.dealerSnapshot?.status || 'pending'
          }
        });
      }
      
      logger.info('Dealership info updated', { dealershipId });
      
    } catch (error) {
      logger.error('Error updating dealership info', error as Error, { dealershipId });
      throw error;
    }
  }
  
  /**
   * Upload profile picture
   * Merged from bulgarian-profile-service.uploadProfilePicture()
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
      const imageRef = ref(storage, `profile-pictures/${userId}/${Date.now()}-${file.name}`);
      
      // Upload file
      const snapshot = await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // Update user profile
      await userService.updateUserProfile(userId, { photoURL: downloadURL });
      
      logger.info('Profile picture uploaded', { userId });
      return downloadURL;
      
    } catch (error) {
      logger.error('Error uploading profile picture', error as Error, { userId });
      throw error;
    }
  }
  
  /**
   * Upload dealership logo
   */
  async uploadDealershipLogo(dealershipId: string, file: File): Promise<string> {
    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }
      
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Logo size must be less than 5MB');
      }
      
      // Create storage reference
      const logoRef = ref(storage, `dealerships/${dealershipId}/logo-${Date.now()}`);
      
      // Upload file
      const snapshot = await uploadBytes(logoRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // Update dealership info
      await this.updateDealershipInfo(dealershipId, { logo: downloadURL });
      
      logger.info('Dealership logo uploaded', { dealershipId });
      return downloadURL;
      
    } catch (error) {
      logger.error('Error uploading dealership logo', error as Error, { dealershipId });
      throw error;
    }
  }
  
  /**
   * Setup company profile (similar to dealer but for companies)
   */
  async setupCompanyProfile(userId: string, companyData: any): Promise<void> {
    try {
      // Similar to dealer setup but for companies
      await userService.updateUserProfile(userId, {
        profileType: 'company',
        companyRef: userId
      });
      
      // Create company document
      const companyRef = doc(db, 'companies', userId);
      await setDoc(companyRef, {
        uid: userId,
        ...companyData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      logger.info('Company profile setup complete', { userId });
      
    } catch (error) {
      logger.error('Error setting up company profile', error as Error, { userId });
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
    additionalData?: DealershipInfo | any
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
        await this.setupDealerProfile(userId, additionalData);
      } else if (newType === 'company' && additionalData) {
        await this.setupCompanyProfile(userId, additionalData);
      } else if (newType === 'private') {
        await userService.updateUserProfile(userId, {
          profileType: 'private',
          dealershipRef: undefined,
          companyRef: undefined
        });
      }
      
      logger.info('Profile type switched', { userId, from: currentProfile.profileType, to: newType });
      
    } catch (error) {
      logger.error('Error switching profile type', error as Error, { userId, newType });
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
}

// Export singleton
export const profileService = UnifiedProfileService.getInstance();

// Backward compatibility exports
/** @deprecated Use profileService.setupDealerProfile() */
export const setupDealerProfile = profileService.setupDealerProfile.bind(profileService);

/** @deprecated Use profileService.getDealershipInfo() */
export const getDealershipInfo = profileService.getDealershipInfo.bind(profileService);

/** @deprecated Use profileService.updateDealershipInfo() */
export const updateDealershipInfo = profileService.updateDealershipInfo.bind(profileService);

