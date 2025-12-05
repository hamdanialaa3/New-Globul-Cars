/**
 * BULGARIAN PROFILE SERVICE FACADE
 * 
 * TEMPORARY BACKWARD COMPATIBILITY LAYER
 * 
 * This facade maintains the old API while delegating to the new canonical service.
 * Allows gradual migration without breaking existing code.
 * 
 * @deprecated This entire file will be removed in Phase 4
 * Migrate to canonical-user.service.ts instead
 * 
 * Migration Guide:
 * OLD: BulgarianProfileService.getUserProfile(userId)
 * NEW: userService.getUserProfile(userId)
 * 
 * @since 2025-11-03 (Refactoring Phase 1.1)
 */

import { userService } from '@globul-cars/services/user/canonical-user.service';
import { BulgarianUser } from '@globul-cars/core/typesuser/bulgarian-user.types';
import { logger } from '@globul-cars/services';

export class BulgarianProfileServiceFacade {
  /**
   * @deprecated Use userService.getUserProfile() instead
   */
  static async getUserProfile(userId: string): Promise<BulgarianUser | null> {
    logger.warn('DEPRECATED: BulgarianProfileService.getUserProfile() - Use userService.getUserProfile()');
    return userService.getUserProfile(userId);
  }
  
  /**
   * @deprecated Use userService.updateUserProfile() instead
   */
  static async updateUserProfile(userId: string, updates: Partial<BulgarianUser>): Promise<void> {
    logger.warn('DEPRECATED: BulgarianProfileService.updateUserProfile() - Use userService.updateUserProfile()');
    return userService.updateUserProfile(userId, updates);
  }
  
  /**
   * @deprecated Use userService.getUserActivity() instead
   */
  static async getUserActivity(userId: string) {
    logger.warn('DEPRECATED: BulgarianProfileService.getUserActivity() - Use userService.getUserActivity()');
    return userService.getUserActivity(userId);
  }
}

// Re-export as default for backward compatibility
export default BulgarianProfileServiceFacade;

// Named export for migration
export { BulgarianProfileServiceFacade as BulgarianProfileService };

