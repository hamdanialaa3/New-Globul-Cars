import { logger } from './logger-service';
// src/services/bulgarian-profile-service.ts
// Comprehensive Bulgarian User Profile Service
// Phase -1: Updated to use canonical types

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import {
  updateProfile,
  updateEmail,
  updatePassword,
  sendEmailVerification,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { auth, db, storage } from '../firebase/firebase-config';
import { serviceLogger } from './logger-service';

// ✅ NEW: Import from canonical types file
import type { BulgarianUser, ProfilePermissions } from '../types/user/bulgarian-user.types';
import type { DealershipInfo } from '../types/dealership/dealership.types';

/**
 * @deprecated Use DealershipInfo from '../types/dealership/dealership.types' instead
 * This interface is kept only for backward compatibility
 * Will be removed in Phase 4 (Week 8)
 */
export type DealerProfile = DealershipInfo;

export interface UserPreferences {
  language: 'bg' | 'en';
  theme: 'light' | 'dark' | 'auto';
  currency: 'EUR';
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    marketing: boolean;
    newMessages: boolean;
    priceAlerts: boolean;
    favoriteUpdates: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'dealers' | 'private';
    showPhone: boolean;
    showEmail: boolean;
    allowMessages: boolean;
    allowCallbacks: boolean;
  };
  carPreferences: {
    favoriteMarks: string[];
    favoriteModels: string[];
    priceRange: { min: number; max: number };
    fuelTypes: string[];
    transmissionTypes: string[];
    bodyTypes: string[];
    yearRange: { min: number; max: number };
  };
}

export interface UserActivity {
  searchHistory: Array<{
    query: string;
    filters: any;
    timestamp: Date;
    resultsCount: number;
  }>;
  viewedCars: Array<{
    carId: string;
    viewedAt: Date;
    timeSpent: number; // in seconds
    source: string; // 'search', 'featured', 'direct'
  }>;
  favoritesCars: Array<{
    carId: string;
    addedAt: Date;
    priceWhenAdded: number;
    currentPrice?: number;
    soldStatus?: boolean;
  }>;
  inquiries: Array<{
    carId: string;
    inquiryDate: Date;
    dealerResponse?: Date;
    status: 'pending' | 'responded' | 'closed';
    inquiryType: 'question' | 'price-negotiation' | 'test-drive' | 'purchase-intent';
  }>;
  purchases: Array<{
    carId: string;
    purchaseDate: Date;
    finalPrice: number;
    dealerId: string;
    status: 'completed' | 'cancelled' | 'refunded';
  }>;
}

export class BulgarianProfileService {
  /**
   * Create a complete Bulgarian user profile
   * ✅ CRITICAL FIX: Now assigns numericId ATOMICALLY via transaction
   */
  static async createCompleteProfile(
    userId: string,
    profileData: Partial<BulgarianUser>,
    dealerData?: DealerProfile
  ): Promise<BulgarianUser> {
    const { runTransaction, doc, serverTimestamp } = await import('firebase/firestore');

    try {
      const result = await runTransaction(db, async (transaction) => {
        // 1. Get next numeric ID
        const counterRef = doc(db, 'counters', 'users');
        const counterDoc = await transaction.get(counterRef);

        let currentCount = 0;
        if (counterDoc.exists()) {
          currentCount = counterDoc.data()?.count || 0;
        }
        const numericId = currentCount + 1;

        // 2. Prepare Profile Data
        const now = Timestamp.now();
        const resolvedProfileType = profileData.profileType || (dealerData ? 'dealer' : 'private');
        const resolvedPlanTier = resolvedProfileType === 'company'
          ? 'company'
          : resolvedProfileType === 'dealer'
            ? 'dealer'
            : 'free';
        const defaultPermissions: ProfilePermissions = {
          canAddListings: true,
          maxListings: resolvedPlanTier === 'free' ? 3 : resolvedPlanTier === 'dealer' ? 30 : 200,
          maxMonthlyListings: resolvedPlanTier === 'free' ? 3 : resolvedPlanTier === 'dealer' ? 30 : 200,
          canEditLockedFields: resolvedPlanTier !== 'free',
          maxFlexEditsPerMonth: resolvedPlanTier === 'dealer' ? 5 : 0,
          canBulkUpload: resolvedPlanTier !== 'free',
          bulkUploadLimit: resolvedPlanTier === 'dealer' ? 5 : resolvedPlanTier === 'company' ? 20 : 0,
          canCloneListing: resolvedPlanTier !== 'free',
          hasAnalytics: resolvedPlanTier !== 'free',
          hasAdvancedAnalytics: resolvedPlanTier === 'company',
          hasTeam: resolvedPlanTier !== 'free',
          canExportData: resolvedPlanTier !== 'free',
          hasPrioritySupport: resolvedPlanTier !== 'free',
          canUseQuickReplies: resolvedPlanTier !== 'free',
          canBulkEdit: resolvedPlanTier !== 'free',
          canImportCSV: resolvedPlanTier !== 'free',
          canUseAPI: resolvedPlanTier === 'company',
          themeMode: resolvedPlanTier === 'company' ? 'company-led' : resolvedPlanTier === 'dealer' ? 'dealer-led' : 'standard'
        };
        const baseProfile = {
          uid: userId,
          numericId, // ✨ Assigned atomically
          email: profileData.email || null,
          displayName: profileData.displayName || null,
          firstName: profileData.firstName || '',
          lastName: profileData.lastName || '',
          photoURL: profileData.photoURL || null,
          phoneNumber: profileData.phoneNumber || null,
          verification: {
            email: profileData.verification?.email ?? false,
            phone: profileData.verification?.phone ?? false,
            id: profileData.verification?.id ?? false,
            business: profileData.verification?.business ?? false
          },

          location: {
            city: profileData.location?.city || '',
            region: profileData.location?.region || '',
            country: 'Bulgaria' as const
          },
          preferredLanguage: profileData.preferredLanguage || 'bg',
          currency: 'EUR' as const,
          phoneCountryCode: '+359' as const,

          permissions: profileData.permissions || defaultPermissions,
          dealershipRef: dealerData ? (`dealerships/${userId}` as `dealerships/${string}`) : undefined,
          dealerSnapshot: dealerData ? {
            nameBG: dealerData.dealershipNameBG || '',
            nameEN: dealerData.dealershipNameEN || '',
            logo: dealerData.media?.logo,
            status: 'pending' as const
          } : undefined,
          lastLoginAt: now,
          createdAt: now,
          updatedAt: now,

          stats: {
            totalListings: 0,
            activeListings: 0,
            totalViews: 0,
            totalMessages: 0,
            trustScore: 0
          },

          isActive: true,
          isBanned: false,
        };

        const completeProfile: BulgarianUser = resolvedProfileType === 'dealer'
          ? { ...baseProfile, profileType: 'dealer', planTier: 'dealer' }
          : resolvedProfileType === 'company'
            ? { ...baseProfile, profileType: 'company', planTier: 'company' }
            : { ...baseProfile, profileType: 'private', planTier: resolvedPlanTier };

        // 3. Update counter and user doc in same transaction
        transaction.set(counterRef, { count: numericId, updatedAt: serverTimestamp() }, { merge: true });

        const userRef = doc(db, 'users', userId);
        transaction.set(userRef, {
          ...completeProfile,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          numericIdAssignedAt: serverTimestamp()
        });

        return completeProfile;
      });

      serviceLogger.info('✅ Profile created with atomic numeric ID', { userId, numericId: result.numericId });
      return result;
    } catch (error) {
      serviceLogger.error('[SERVICE] Error creating complete profile atomically', error as Error, { userId });
      throw new Error('Failed to create user profile');
    }
  }

  /**
   * Update user profile with enhanced validation
   */
  static async updateUserProfile(userId: string, updates: Partial<BulgarianUser>): Promise<void> {
    try {
      // Validate Bulgarian phone number
      if (updates.phoneNumber) {
        if (!this.validateBulgarianPhone(updates.phoneNumber)) {
          throw new Error('Invalid Bulgarian phone number format');
        }
      }

      // Validate email if provided
      if (updates.email) {
        if (!this.validateEmail(updates.email)) {
          throw new Error('Invalid email format');
        }
      }

      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      // Update Firebase Auth profile if needed
      if (auth.currentUser && (updates.displayName || updates.photoURL)) {
        await updateProfile(auth.currentUser, {
          displayName: updates.displayName || auth.currentUser.displayName,
          photoURL: updates.photoURL || auth.currentUser.photoURL
        });
      }
    } catch (error) {
      serviceLogger.error('[SERVICE] Error updating user profile', error as Error, { userId });
      throw error;
    }
  }

  /**
   * Upload and update profile picture
   */
  static async uploadProfilePicture(userId: string, file: File): Promise<string> {
    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('Image size must be less than 5MB');
      }

      // Create reference
      const imageRef = ref(storage, `profile-pictures/${userId}/${Date.now()}-${file.name}`);

      // Upload file
      const snapshot = await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Update profile
      await this.updateUserProfile(userId, { photoURL: downloadURL });

      return downloadURL;
    } catch (error) {
      serviceLogger.error('[SERVICE] Error uploading profile picture', error as Error, { userId, fileName: file.name });
      throw new Error('Failed to upload profile picture');
    }
  }

  /**
   * Create or update dealer profile
   * 
   * @deprecated Use DealershipRepository.createOrUpdate() instead
   * This method will be removed in Phase 4 (Week 8)
   * 
   * Migration: import { DealershipRepository } from '@/repositories/DealershipRepository'
   *            await DealershipRepository.createOrUpdate(userId, dealershipData)
   */
  static async setupDealerProfile(userId: string, dealerData: DealershipInfo): Promise<void> {
    serviceLogger.warn('[DEPRECATED] setupDealerProfile() called. Use DealershipRepository instead', { userId });

    try {
      // ✅ FIXED: Now writes to 'dealerships' collection (not 'dealers')
      const dealershipRef = doc(db, 'dealerships', userId);
      await setDoc(dealershipRef, {
        uid: userId,
        ...dealerData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });

      // Update user profile with new structure
      await this.updateUserProfile(userId, {
        profileType: 'dealer' as any,
        dealershipRef: `dealerships/${userId}` as any,
        dealerSnapshot: {
          nameBG: (dealerData as any).dealershipNameBG || (dealerData as any).companyName || '',
          nameEN: (dealerData as any).dealershipNameEN || (dealerData as any).companyName || '',
          logo: (dealerData as any).logo,
          status: 'pending'
        } as any
      });
    } catch (error) {
      serviceLogger.error('[SERVICE] Error setting up dealer profile', error as Error, { userId });
      throw error;
    }
  }

  /**
   * Track user activity
   */
  static async trackUserActivity(userId: string, activity: {
    type: 'search' | 'view' | 'inquiry' | 'favorite';
    data: any;
  }): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      const activityRef = doc(collection(db, 'user-activity'), `${userId}-${Date.now()}`);

      // Store detailed activity
      await setDoc(activityRef, {
        userId,
        type: activity.type,
        data: activity.data,
        timestamp: serverTimestamp()
      });

      // Update user profile with summary
      const updateData: Record<string, unknown> = {};

      switch (activity.type) {
        case 'search':
          updateData[`searchHistory`] = [...(activity.data.searchHistory || []), {
            query: activity.data.query,
            timestamp: new Date(),
            resultsCount: activity.data.resultsCount
          }].slice(-50); // Keep last 50 searches
          break;

        case 'view':
          updateData[`viewedCars`] = [...(activity.data.viewedCars || []), activity.data.carId].slice(-100);
          break;

        case 'inquiry':
          updateData[`inquiredCars`] = [...(activity.data.inquiredCars || []), activity.data.carId];
          break;
      }

      if (Object.keys(updateData).length > 0) {
        await updateDoc(userRef, {
          ...updateData,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      serviceLogger.error('[SERVICE] Error tracking user activity', error as Error, { userId, activityType: activity.type });
      // Don't throw error for tracking failures
    }
  }

  /**
   * Get user's favorite cars with current status
   */
  static async getUserFavorites(userId: string): Promise<Array<{
    carId: string;
    addedAt: Date;
    currentStatus: 'available' | 'sold' | 'removed';
    priceChange: { original: number; current: number; change: number };
  }>> {
    try {
      const user = await this.getUserProfile(userId);
      if (!user) return [];

      // This would need to be implemented with actual car data
      // For now, return the structure
      return [];
    } catch (error) {
      serviceLogger.error('[SERVICE] Error getting user favorites', error as Error, { userId });
      return [];
    }
  }

  /**
   * Update user preferences
   */
  static async updatePreferences(userId: string, preferences: Partial<UserPreferences>): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...preferences,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      serviceLogger.error('[SERVICE] Error updating preferences', error as Error, { userId });
      throw new Error('Failed to update preferences');
    }
  }

  /**
   * Get user profile with real-time updates
   */
  static getUserProfileRealtime(userId: string | null | undefined, callback: (profile: BulgarianUser | null) => void): () => void {
    // ✅ FIX: Guard against null/undefined userId BEFORE constructing query
    if (!userId) {
      serviceLogger.warn('[SERVICE] getUserProfileRealtime called with null/undefined userId - returning no-op unsubscribe');
      callback(null);
      return () => { }; // Return no-op unsubscribe function
    }

    const userRef = doc(db, 'users', userId);

    let isActive = true;
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (!isActive) return;
      if (doc.exists()) {
        callback(doc.data() as BulgarianUser);
      } else {
        callback(null);
      }
    }, (error) => {
      if (!isActive) return;
      serviceLogger.error('[SERVICE] Error in real-time profile listener', error as Error, { userId });
      callback(null);
    });
    return () => { isActive = false; unsubscribe(); };
  }

  /**
   * Get user profile
   */
  static async getUserProfile(userId: string): Promise<BulgarianUser | null> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        return userDoc.data() as BulgarianUser;
      }

      return null;
    } catch (error) {
      serviceLogger.error('[SERVICE] Error getting user profile', error as Error, { userId });
      throw new Error('Failed to get user profile');
    }
  }

  /**
   * Delete user profile and all associated data
   */
  static async deleteUserProfile(userId: string): Promise<void> {
    // ✅ CRITICAL FIX: Guard against null/undefined userId
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      logger.warn('[BulgarianProfileService] deleteUserProfile called with invalid userId', { userId });
      throw new Error('Invalid userId provided to deleteUserProfile');
    }

    try {
      // Delete main profile
      await deleteDoc(doc(db, 'users', userId));

      // Delete dealer profile if exists
      try {
        await deleteDoc(doc(db, 'dealers', userId));
      } catch (error) {
        // Dealer profile might not exist
      }

      // Delete activity data
      const activityQuery = query(
        collection(db, 'user-activity'),
        where('userId', '==', userId)
      );

      const activityDocs = await getDocs(activityQuery);
      activityDocs.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });

      // Delete profile picture if exists
      try {
        const profilePicRef = ref(storage, `profile-pictures/${userId}`);
        await deleteObject(profilePicRef);
      } catch (error) {
        // Profile picture might not exist
      }

    } catch (error) {
      serviceLogger.error('[SERVICE] Error deleting user profile', error as Error, { userId });
      throw new Error('Failed to delete user profile');
    }
  }

  // Utility methods
  private static validateBulgarianPhone(phone: string): boolean {
    // Bulgarian phone number validation
    const bulgarianPhoneRegex = /^(\+359|0)([87][0-9]{8}|2[0-9]{7})$/;
    return bulgarianPhoneRegex.test(phone);
  }

  private static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Update user's email address with proper verification
   */
  static async updateUserEmail(newEmail: string, currentPassword: string): Promise<void> {
    if (!auth.currentUser) {
      throw new Error('No user is currently signed in');
    }

    try {
      // Reauthenticate user
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email!,
        currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Update email
      await updateEmail(auth.currentUser, newEmail);

      // Send verification email
      await sendEmailVerification(auth.currentUser);

      // Update Firestore profile
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        email: newEmail,
        'verification.email': false,
        updatedAt: serverTimestamp()
      });

    } catch (error) {
      serviceLogger.error('[SERVICE] Error updating email', error as Error, { newEmail });
      throw error;
    }
  }

  /**
   * Update user's password
   */
  static async updateUserPassword(currentPassword: string, newPassword: string): Promise<void> {
    if (!auth.currentUser) {
      throw new Error('No user is currently signed in');
    }

    try {
      // Reauthenticate user
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email!,
        currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Update password
      await updatePassword(auth.currentUser, newPassword);

    } catch (error) {
      serviceLogger.error('[SERVICE] Error updating password', error as Error);
      throw error;
    }
  }
}

export default BulgarianProfileService;
