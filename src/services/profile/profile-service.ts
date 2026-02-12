// Profile Service - Business logic for seller profiles
// خدمة البروفايل - منطق الأعمال لملفات البائعين

import { doc, getDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';
import { logger } from '@/services/logger-service';
import type { SellerProfile } from '@/types/profile.types';

/**
 * Service for managing seller profiles
 * Handles fetching, calculating metrics, and profile enrichment
 */
class ProfileService {
  private readonly PROFILES_COLLECTION = 'seller_profiles';
  private readonly USERS_COLLECTION = 'users';

  /**
   * Get profile by numeric ID (URL-safe)
   * 1. Query users collection to find UID by numericId
   * 2. Fetch seller_profiles/{uid} document
   * 3. Enrich with computed metrics
   * 
   * @param numericId - Numeric ID of seller (from URL)
   * @returns Complete seller profile
   */
  async getProfileByNumericId(numericId: number): Promise<SellerProfile> {
    try {
      logger.info(`[Profile] Fetching profile for numericId: ${numericId}`);

      // Step 1: Get UID from users collection
      const usersRef = collection(db, this.USERS_COLLECTION);
      const q = query(usersRef, where('numericId', '==', numericId));
      const userSnapshot = await getDocs(q);

      if (userSnapshot.empty) {
        logger.warn(`[Profile] No user found for numericId: ${numericId}`);
        throw new Error(`Profile not found for numericId: ${numericId}`);
      }

      const userDoc = userSnapshot.docs[0];
      const uid = userDoc.id;
      const userData = userDoc.data();

      // Step 2: Fetch seller profile document
      const profileRef = doc(db, this.PROFILES_COLLECTION, uid);
      const profileSnap = await getDoc(profileRef);

      if (!profileSnap.exists()) {
        logger.warn(`[Profile] Profile doc not found for uid: ${uid}`);
        // Build basic profile from user data if seller_profiles doc doesn't exist
        return this.buildProfileFromUserData(userData, uid, numericId);
      }

      const profileData = profileSnap.data() as Omit<SellerProfile, 'id' | 'sellerId' | 'numericId'>;

      // Step 3: Build complete profile
      const profile: SellerProfile = {
        id: profileSnap.id,
        sellerId: uid,
        numericId,
        ...profileData,
        createdAt: profileData.createdAt instanceof Timestamp 
          ? profileData.createdAt.toDate() 
          : new Date(profileData.createdAt),
        updatedAt: profileData.updatedAt instanceof Timestamp 
          ? profileData.updatedAt.toDate() 
          : new Date(profileData.updatedAt),
      };

      logger.info(`[Profile] Successfully fetched profile for ${profile.name} (${profile.profileType})`);
      return profile;
    } catch (err) {
      logger.error('[Profile] Error fetching profile by numericId:', err);
      throw err;
    }
  }

  /**
   * Get profile by Firebase UID
   * @param uid - Firebase authentication UID
   * @returns Complete seller profile
   */
  async getProfileByUid(uid: string): Promise<SellerProfile> {
    try {
      logger.info(`[Profile] Fetching profile for uid: ${uid}`);

      // Get user data first
      const userRef = doc(db, this.USERS_COLLECTION, uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        logger.warn(`[Profile] User not found for uid: ${uid}`);
        throw new Error(`User not found for uid: ${uid}`);
      }

      const userData = userSnap.data();
      const numericId = userData.numericId;

      // Get profile document
      const profileRef = doc(db, this.PROFILES_COLLECTION, uid);
      const profileSnap = await getDoc(profileRef);

      if (!profileSnap.exists()) {
        logger.warn(`[Profile] Profile doc not found for uid: ${uid}`);
        return this.buildProfileFromUserData(userData, uid, numericId);
      }

      const profileData = profileSnap.data() as Omit<SellerProfile, 'id' | 'sellerId' | 'numericId'>;

      const profile: SellerProfile = {
        id: profileSnap.id,
        sellerId: uid,
        numericId,
        ...profileData,
        createdAt: profileData.createdAt instanceof Timestamp 
          ? profileData.createdAt.toDate() 
          : new Date(profileData.createdAt),
        updatedAt: profileData.updatedAt instanceof Timestamp 
          ? profileData.updatedAt.toDate() 
          : new Date(profileData.updatedAt),
      };

      logger.info(`[Profile] Successfully fetched profile for ${profile.name}`);
      return profile;
    } catch (err) {
      logger.error('[Profile] Error fetching profile by uid:', err);
      throw err;
    }
  }

  /**
   * Build minimal profile from user data
   * Used when seller_profiles document doesn't exist yet
   */
  private buildProfileFromUserData(userData: any, uid: string, numericId: number): SellerProfile {
    return {
      id: uid,
      sellerId: uid,
      numericId,
      profileType: userData.profileType || 'private',
      name: userData.displayName || userData.name || 'Unnamed Seller',
      logo: userData.photoURL,
      description: userData.description,
      location: {
        city: userData.location?.city || '',
        region: userData.location?.region || '',
        coordinates: userData.location?.coordinates,
      },
      phone: userData.phoneNumber || '',
      email: userData.email || '',
      badges: userData.badges || [],
      stats: {
        totalListings: userData.totalListings || 0,
        avgResponseTime: userData.avgResponseTime || 0,
        responseRate: userData.responseRate || 0,
        trustScore: this.calculateTrustScore(userData),
        totalReviews: userData.totalReviews || 0,
        averageRating: userData.averageRating || 0,
      },
      gallery: userData.gallery || [],
      createdAt: userData.createdAt instanceof Timestamp 
        ? userData.createdAt.toDate() 
        : new Date(userData.createdAt || Date.now()),
      updatedAt: userData.updatedAt instanceof Timestamp 
        ? userData.updatedAt.toDate() 
        : new Date(userData.updatedAt || Date.now()),
      isActive: userData.isActive !== false,
      verificationStatus: userData.verificationStatus || 'pending',
    };
  }

  /**
   * Calculate trust score based on verification badges and metrics
   * Scoring:
   * - phone_verified: +10
   * - identity_verified: +15
   * - dealer_verified: +20
   * - company_certified: +25
   * - Each positive review: +2 (max 50)
   * - response_rate > 80%: +15
   * - Registered since 1+ year: +10
   * Max: 100
   */
  calculateTrustScore(userData: any): number {
    let score = 0;

    // Badge points
    const badges = userData.badges || [];
    if (badges.includes('phone_verified')) score += 10;
    if (badges.includes('identity_verified')) score += 15;
    if (badges.includes('dealer_verified')) score += 20;
    if (badges.includes('company_certified')) score += 25;

    // Response rate
    const responseRate = userData.responseRate || 0;
    if (responseRate > 80) score += 15;
    else if (responseRate > 60) score += 10;
    else if (responseRate > 40) score += 5;

    // Reviews (capped at 50 points)
    const reviewBonus = Math.min((userData.totalReviews || 0) * 2, 50);
    score += reviewBonus;

    // Membership duration
    const createdAt = userData.createdAt instanceof Timestamp
      ? userData.createdAt.toDate()
      : new Date(userData.createdAt || Date.now());
    const monthsActive = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30));
    if (monthsActive >= 12) score += 10;
    else if (monthsActive >= 6) score += 5;

    return Math.min(score, 100);
  }

  /**
   * Get seller's cars from other services
   * Note: This is a placeholder that integrates with UnifiedCarService
   */
  async getSellerCars(sellerId: string, limit: number = 50) {
    try {
      logger.info(`[Profile] Fetching cars for seller: ${sellerId}`);

      // Dynamic import to avoid circular dependencies
      const { UnifiedCarService } = await import('@/services/car/unified-car-service');
      
      if (!UnifiedCarService) {
        logger.warn('[Profile] UnifiedCarService not available');
        return [];
      }

      const cars = await UnifiedCarService.getUserCars(sellerId);
      return cars.slice(0, limit);
    } catch (err) {
      logger.error('[Profile] Error fetching seller cars:', err);
      return [];
    }
  }

  /**
   * Check if profile needs completion
   * Returns missing required fields
   */
  validateProfile(profile: SellerProfile): {
    isComplete: boolean;
    missingFields: string[];
  } {
    const missing: string[] = [];

    if (!profile.name) missing.push('name');
    if (!profile.phone) missing.push('phone');
    if (!profile.email) missing.push('email');
    if (!profile.location.city) missing.push('location.city');
    if (!profile.location.region) missing.push('location.region');
    if (!profile.gallery || profile.gallery.length === 0) missing.push('gallery');

    // Profile type specific validation
    if (profile.profileType === 'dealer' && !profile.businessName) {
      missing.push('businessName');
    }
    if (profile.profileType === 'corporate' && !profile.officeLocations) {
      missing.push('officeLocations');
    }

    return {
      isComplete: missing.length === 0,
      missingFields: missing,
    };
  }

  /**
   * Refresh profile metrics (response rate, trust score, etc.)
   * Called periodically or after important events
   */
  async refreshProfileMetrics(uid: string): Promise<Partial<SellerProfile>> {
    try {
      logger.info(`[Profile] Refreshing metrics for uid: ${uid}`);

      const userRef = doc(db, this.USERS_COLLECTION, uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        logger.warn(`[Profile] User not found for metrics refresh: ${uid}`);
        return {};
      }

      const userData = userSnap.data();
      const trustScore = this.calculateTrustScore(userData);

      return {
        stats: {
          totalListings: userData.totalListings || 0,
          avgResponseTime: userData.avgResponseTime || 0,
          responseRate: userData.responseRate || 0,
          trustScore,
          totalReviews: userData.totalReviews || 0,
          averageRating: userData.averageRating || 0,
        },
      };
    } catch (err) {
      logger.error('[Profile] Error refreshing profile metrics:', err);
      return {};
    }
  }
}

export const profileService = new ProfileService();
export default profileService;
