/**
 * CANONICAL USER SERVICE
 * 
 * This is the SOLE SOURCE OF TRUTH for all user data operations.
 * 
 * CRITICAL: All other services, components, and pages MUST import from here.
 * 
 * Replaces 50+ duplicate getUserProfile functions across the codebase.
 * 
 * @example
 * import { userService } from '@globul-cars/services/user/canonical-user.service';
 * const user = await userService.getUserProfile(userId);
 * 
 * @since 2025-11-03
 * @version 1.0.0
 * @author Backend Refactoring Team
 */

import { BulgarianUser } from '@globul-cars/core/typesuser/bulgarian-user.types';
import { db } from '@globul-cars/services';
import { logger } from '@globul-cars/services';

export class CanonicalUserService {
  private static instance: CanonicalUserService;
  private cache = new Map<string, { data: BulgarianUser; timestamp: number }>();
  private CACHE_TTL = 5 * 60 * 1000;
  
  private constructor() {
    logger.info('CanonicalUserService initialized');
  }
  
  static getInstance(): CanonicalUserService {
    if (!this.instance) {
      this.instance = new CanonicalUserService();
    }
    return this.instance;
  }
  
  /**
   * Get user profile by ID
   * 
   * This is the CANONICAL method for fetching user data.
   * Uses caching to reduce Firestore reads.
   * 
   * @param userId - User ID
   * @param options - Fetch options
   * @returns User profile or null if not found
   * @throws Error if Firestore operation fails
   */
  async getUserProfile(
    userId: string,
    options: { skipCache?: boolean } = {}
  ): Promise<BulgarianUser | null> {
    if (!userId || typeof userId !== 'string') {
      logger.error('Invalid userId provided to getUserProfile', null, { userId });
      throw new Error('Invalid userId parameter');
    }
    
    if (!options.skipCache) {
      const cached = this.getFromCache(userId);
      if (cached) {
        logger.debug('User profile loaded from cache', { userId });
        return cached;
      }
    }
    
    try {
      logger.debug('Fetching user profile from Firestore', { userId });
      
      const userDoc = await db.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        logger.warn('User not found', { userId });
        return null;
      }
      
      const userData = userDoc.data() as BulgarianUser;
      
      this.validateUserData(userData);
      
      this.setCache(userId, userData);
      
      logger.info('User profile loaded successfully', { userId });
      return userData;
      
    } catch (error) {
      logger.error('Error fetching user profile', error as Error, { userId });
      throw error;
    }
  }
  
  /**
   * Get multiple user profiles in batch
   * More efficient than calling getUserProfile multiple times
   * 
   * @param userIds - Array of user IDs
   * @returns Map of userId to user profile
   */
  async getUserProfilesBatch(userIds: string[]): Promise<Map<string, BulgarianUser>> {
    const results = new Map<string, BulgarianUser>();
    
    if (!userIds || userIds.length === 0) {
      return results;
    }
    
    const uniqueIds = [...new Set(userIds)];
    
    try {
      const BATCH_SIZE = 10;
      
      for (let i = 0; i < uniqueIds.length; i += BATCH_SIZE) {
        const batch = uniqueIds.slice(i, i + BATCH_SIZE);
        const docs = await Promise.all(
          batch.map(id => db.collection('users').doc(id).get())
        );
        
        docs.forEach((doc, index) => {
          if (doc.exists) {
            const userId = batch[index];
            const userData = doc.data() as BulgarianUser;
            results.set(userId, userData);
            this.setCache(userId, userData);
          }
        });
      }
      
      logger.info('Batch user profiles loaded', { count: results.size });
      return results;
      
    } catch (error) {
      logger.error('Error fetching user profiles batch', error as Error, { userIds });
      throw error;
    }
  }
  
  /**
   * Update user profile
   * Validates data before update and clears cache
   * 
   * @param userId - User ID  
   * @param updates - Partial user data to update
   */
  async updateUserProfile(
    userId: string,
    updates: Partial<BulgarianUser>
  ): Promise<void> {
    if (!userId) {
      throw new Error('userId is required');
    }
    
    try {
      this.validateUpdates(updates);
      
      const updateData = {
        ...updates,
        updatedAt: new Date()
      };
      
      await db.collection('users').doc(userId).update(updateData);
      
      this.clearCache(userId);
      
      logger.info('User profile updated', { 
        userId, 
        fields: Object.keys(updates)
      });
      
    } catch (error) {
      logger.error('Error updating user profile', error as Error, { userId });
      throw error;
    }
  }
  
  /**
   * Get user activity statistics
   * Useful for profile statistics dashboard
   * 
   * @param userId - User ID
   * @returns Activity statistics
   */
  async getUserActivity(userId: string): Promise<{
    totalListings: number;
    activeListings: number;
    totalViews: number;
    totalMessages: number;
  }> {
    try {
      const [listings, views, messages] = await Promise.all([
        db.collection('cars').where('userId', '==', userId).get(),
        db.collection('analytics').doc(userId).get(),
        db.collection('conversations').where('participants', 'array-contains', userId).get()
      ]);
      
      const activeListings = listings.docs.filter(doc => 
        doc.data().status === 'active'
      ).length;
      
      const analyticsData = views.data();
      
      return {
        totalListings: listings.size,
        activeListings,
        totalViews: analyticsData?.totalViews || 0,
        totalMessages: messages.size
      };
      
    } catch (error) {
      logger.error('Error fetching user activity', error as Error, { userId });
      throw error;
    }
  }
  
  /**
   * Check if user exists
   * Lightweight check without loading full profile
   * 
   * @param userId - User ID
   * @returns true if user exists
   */
  async userExists(userId: string): Promise<boolean> {
    try {
      const doc = await db.collection('users').doc(userId).get();
      return doc.exists;
    } catch (error) {
      logger.error('Error checking user existence', error as Error, { userId });
      return false;
    }
  }
  
  private validateUserData(userData: any): void {
    if (!userData.uid) {
      throw new Error('Invalid user data: missing uid');
    }
    
    if (!userData.email) {
      throw new Error('Invalid user data: missing email');
    }
  }
  
  private validateUpdates(updates: Partial<BulgarianUser>): void {
    const immutableFields = ['uid', 'email', 'createdAt'];
    immutableFields.forEach(field => {
      if (field in updates) {
        throw new Error(`Cannot update immutable field: ${field}`);
      }
    });
    
    if (updates.profileType) {
      const validTypes = ['private', 'dealer', 'company'];
      if (!validTypes.includes(updates.profileType)) {
        throw new Error(`Invalid profile type: ${updates.profileType}`);
      }
    }
  }
  
  private getFromCache(userId: string): BulgarianUser | null {
    const cached = this.cache.get(userId);
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > this.CACHE_TTL) {
      this.cache.delete(userId);
      return null;
    }
    
    return cached.data;
  }
  
  private setCache(userId: string, data: BulgarianUser): void {
    this.cache.set(userId, {
      data,
      timestamp: Date.now()
    });
  }
  
  private clearCache(userId: string): void {
    this.cache.delete(userId);
  }
  
  /**
   * Clear all cached data
   * Useful for testing or force refresh
   */
  clearAllCache(): void {
    this.cache.clear();
    logger.info('User service cache cleared');
  }
}

export const userService = CanonicalUserService.getInstance();

/** @deprecated Use userService.getUserProfile() - will be removed in v2.0 */
export const getUserProfile = userService.getUserProfile.bind(userService);

/** @deprecated Use userService.updateUserProfile() - will be removed in v2.0 */
export const updateUserProfile = userService.updateUserProfile.bind(userService);

