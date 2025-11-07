/**
 * Dealership Service Adapter
 * 
 * DEPRECATED: This is a compatibility wrapper around UnifiedProfileService.
 * 
 * Migration Path:
 * - Old code: import { dealershipService } from '@/services/dealership/dealership.service';
 * - New code: import { profileService } from '@/services/profile/UnifiedProfileService';
 * 
 * This adapter allows gradual migration without breaking existing code.
 * 
 * @deprecated Use UnifiedProfileService directly instead
 * @since 2025-11-07
 */

import { UnifiedProfileService } from '../profile/UnifiedProfileService';
// Use LEGACY type to match old service interface
import type { DealershipInfo as LegacyDealershipInfo, PrivacySettings } from '@/types/dealership.types';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';
import { logger } from '../logger-service';

class DealershipServiceAdapter {
  private profileService: UnifiedProfileService;
  
  constructor() {
    this.profileService = UnifiedProfileService.getInstance();
    logger.warn('DealershipServiceAdapter: Using deprecated adapter. Migrate to UnifiedProfileService.');
  }
  
  /**
   * @deprecated Use profileService.updateDealershipInfo() instead
   */
  async saveDealershipInfo(
    userId: string, 
    dealershipData: Partial<LegacyDealershipInfo>
  ): Promise<void> {
    // First call: setup if new, otherwise update
    const existing = await this.profileService.getDealershipInfo(userId);
    
    // Transform legacy data to new canonical format
    const transformedData = this.transformLegacyToCanonical(dealershipData);
    
    if (!existing) {
      // New dealership - call setup (skip if not enough data)
      if (transformedData.uid && transformedData.eik) {
        await this.profileService.setupDealerProfile(userId, transformedData as any);
      }
    } else {
      // Existing - just update
      await this.profileService.updateDealershipInfo(userId, transformedData);
    }
  }
  
  /**
   * @deprecated Use profileService.getDealershipInfo() instead
   */
  async getDealershipInfo(userId: string): Promise<LegacyDealershipInfo | null> {
    const canonical = await this.profileService.getDealershipInfo(userId);
    if (!canonical) return null;
    
    // Transform canonical back to legacy format for compatibility
    return this.transformCanonicalToLegacy(canonical);
  }
  
  /**
   * @deprecated Use profileService.updateDealershipInfo() instead
   */
  async updateDealershipInfo(
    userId: string,
    updates: Partial<LegacyDealershipInfo>
  ): Promise<void> {
    const transformed = this.transformLegacyToCanonical(updates);
    return this.profileService.updateDealershipInfo(userId, transformed);
  }
  
  /**
   * Transform legacy dealership data to canonical format
   */
  private transformLegacyToCanonical(legacy: Partial<LegacyDealershipInfo>): any {
    // Simple pass-through for now - types are compatible enough
    // Add field mapping here if needed in the future
    return {
      ...legacy,
      // Ensure country field if address exists
      address: legacy.address ? {
        ...legacy.address,
        country: (legacy.address as any).country || 'Bulgaria'
      } : undefined
    };
  }
  
  /**
   * Transform canonical dealership data to legacy format
   */
  private transformCanonicalToLegacy(canonical: any): LegacyDealershipInfo {
    // Simple pass-through for now
    return canonical as LegacyDealershipInfo;
  }
  
  /**
   * Save privacy settings
   * @deprecated Use userService directly for privacy settings
   */
  async savePrivacySettings(
    userId: string, 
    privacySettings: PrivacySettings
  ): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        privacySettings,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      logger.error('Error saving privacy settings via adapter', error as Error, { userId });
      throw new Error('Failed to save privacy settings');
    }
  }
  
  /**
   * Get privacy settings
   * @deprecated Use userService directly for privacy settings
   */
  async getPrivacySettings(userId: string): Promise<PrivacySettings | null> {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        return null;
      }
      
      return userSnap.data().privacySettings || null;
    } catch (error) {
      logger.error('Error getting privacy settings via adapter', error as Error, { userId });
      return null;
    }
  }
}

// Export singleton instance with same interface as old service
export const dealershipService = new DealershipServiceAdapter();

// Also export the class for type references
export { DealershipServiceAdapter };

