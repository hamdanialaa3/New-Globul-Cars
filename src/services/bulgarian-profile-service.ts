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
import type { BulgarianUser, DealerProfile as DealerUserProfile } from '../types/user/bulgarian-user.types';
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
   */
  static async createCompleteProfile(
    userId: string, 
    profileData: Partial<BulgarianUserProfile>,
    dealerData?: DealerProfile
  ): Promise<BulgarianUserProfile> {
    try {
      const now = new Date();
      
      const completeProfile: BulgarianUserProfile = {
        uid: userId,
        email: profileData.email || null,
        displayName: profileData.displayName || null,
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        photoURL: profileData.photoURL || null,
        phoneNumber: profileData.phoneNumber || null,
        emailVerified: profileData.emailVerified || false,
        
        // Bulgarian specific
        location: {
          city: profileData.location?.city || '',
          region: profileData.location?.region || '',
          country: 'Bulgaria'
        },
        preferredLanguage: profileData.preferredLanguage || 'bg',
        currency: 'EUR',
        phoneCountryCode: '+359',
        
        // ✅ FIXED: Use profileType instead of isDealer
        profileType: profileData.profileType || (dealerData ? 'dealer' : 'private'),
        dealershipRef: dealerData ? `dealerships/${userId}` : undefined,
        dealerSnapshot: dealerData ? {
          nameBG: dealerData.dealershipNameBG || dealerData.companyName || '',
          nameEN: dealerData.dealershipNameEN || '',
          logo: dealerData.logo,
          status: 'pending'
        } : undefined,
        
        // Social providers
        linkedProviders: profileData.linkedProviders || [],
        
        // Activity tracking
        lastLoginAt: now,
        createdAt: now,
        updatedAt: now,
        
        // Preferences
        notifications: {
          email: true,
          sms: false,
          push: true,
          marketing: false
        },
        
        // Car marketplace
        favoriteCarBrands: [],
        searchHistory: [],
        viewedCars: [],
        inquiredCars: [],
        
        // Privacy
        profileVisibility: 'dealers',
        showPhone: false,
        showEmail: false
      };

      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        ...completeProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      });

      return completeProfile;
    } catch (error) {
      serviceLogger.error('[SERVICE] Error creating complete profile', error as Error, { userId });
      throw new Error('Failed to create user profile');
    }
  }

  /**
   * Update user profile with enhanced validation
   */
  static async updateUserProfile(userId: string, updates: Partial<BulgarianUserProfile>): Promise<void> {
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
  static getUserProfileRealtime(userId: string | null | undefined, callback: (profile: BulgarianUserProfile | null) => void): () => void {
    // ✅ FIX: Guard against null/undefined userId BEFORE constructing query
    if (!userId) {
      serviceLogger.warn('[SERVICE] getUserProfileRealtime called with null/undefined userId - returning no-op unsubscribe');
      callback(null);
      return () => {}; // Return no-op unsubscribe function
    }

    let isActive = true; // Prevent callback execution after unsubscribe

    const userRef = doc(db, 'users', userId);

    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (!isActive) return; // Check before processing

      if (doc.exists()) {
        callback(doc.data() as BulgarianUserProfile);
      } else {
        callback(null);
      }
    }, (error) => {
      if (!isActive) return; // Check before error callback
      serviceLogger.error('[SERVICE] Error in real-time profile listener', error as Error, { userId });
      callback(null);
    });

    return () => {
      isActive = false; // Disable callback first
      unsubscribe(); // Then unsubscribe
    };
  }

  /**
   * Get user profile
   */
  static async getUserProfile(userId: string): Promise<BulgarianUserProfile | null> {
    try {
      const userRef = doc(db, 'users', userId);
      
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
      await this.updateUserProfile(auth.currentUser.uid, {
        email: newEmail,
        emailVerified: false
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