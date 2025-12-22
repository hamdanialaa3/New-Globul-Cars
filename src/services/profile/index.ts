import { logger } from '../logger-service';
// src/services/profile/index.ts
// Profile Services Index - ملف الربط الرئيسي الموحد
// ✅ Phase 3.2: Unified Profile Services Export
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

/**
 * Profile Services Module - Unified Export
 * 
 * هذا الملف يجمع جميع خدمات البروفايل في مكان واحد
 * This file consolidates all profile services in one place
 * 
 * ✅ FIXED: Phase 3.2 - Service Unification
 * - UnifiedProfileService: Main service for profile operations
 * - ProfileService: Legacy service (kept for backward compatibility)
 * - All sub-services: Image, Trust, Stats
 * 
 * الخدمات المتوفرة / Available Services:
 * 1. unifiedProfileService - الخدمة الموحدة الرئيسية (RECOMMENDED)
 * 2. ProfileService - خدمة البروفايل (Legacy, use unifiedProfileService)
 * 3. imageProcessingService - معالجة الصور
 * 4. trustScoreService - نظام درجة الثقة
 * 5. profileStatsService - إحصائيات البروفايل
 */

// ==================== IMPORTS ====================

import { imageProcessingService } from './image-processing-service';
import { trustScoreService } from './trust-score-service';
// ✅ Phase 3.2.2: Unified Stats Service - Use profile-stats.service.ts (more advanced)
import { profileStatsService } from './profile-stats.service';
import { UnifiedProfileService } from './UnifiedProfileService';
import { ProfileService as LegacyProfileService } from './ProfileService';

// ==================== UNIFIED PROFILE SERVICE (RECOMMENDED) ====================

/**
 * Unified Profile Service - RECOMMENDED
 * الخدمة الموحدة للبروفايل - موصى بها
 * 
 * ✅ Use this service for all new code
 * ✅ This is the canonical service for profile operations
 * 
 * @example
 * import { unifiedProfileService } from '../../services/profile';
 * await unifiedProfileService.setupDealerProfile(userId, dealerData);
 */
export const unifiedProfileService = UnifiedProfileService.getInstance();

// Re-export UnifiedProfileService class for advanced usage
export { UnifiedProfileService } from './UnifiedProfileService';

// ==================== LEGACY PROFILE SERVICE (Backward Compatibility) ====================

/**
 * Legacy Profile Service - For backward compatibility only
 * ⚠️ DEPRECATED: Use unifiedProfileService instead
 * 
 * This service is kept for backward compatibility.
 * All new code should use unifiedProfileService.
 */
export const ProfileService = {
  // Legacy static methods (from ProfileService.ts)
  ...LegacyProfileService,
  
  // Sub-services
  image: imageProcessingService,
  trust: trustScoreService,
  stats: profileStatsService
};

// Re-export LegacyProfileService class
export { ProfileService as LegacyProfileService } from './ProfileService';

// ==================== SUB-SERVICES EXPORTS ====================

// Image Processing
export {
  imageProcessingService,
  ImageProcessingService
} from './image-processing-service';

export type { ProfileImage, ImageVariants } from './image-processing-service';

// Trust Score
export {
  trustScoreService,
  TrustScoreService,
  TrustLevel,
  BADGE_DEFINITIONS
} from './trust-score-service';

export type { Badge, VerificationStatus } from './trust-score-service';

// Profile Stats
export {
  profileStatsService,
  ProfileStatsService
} from './profile-stats-service';

export type { ProfileStats } from './profile-stats-service';

// ==================== USAGE EXAMPLES ====================

/**
 * ✅ RECOMMENDED: Use unifiedProfileService
 * 
 * import { unifiedProfileService } from '../../services/profile';
 * 
 * // Setup dealer profile
 * await unifiedProfileService.setupDealerProfile(userId, {
 *   dealershipNameBG: 'Авто София',
 *   address: 'Sofia, Bulgaria'
 * });
 * 
 * // Get dealership info
 * const dealer = await unifiedProfileService.getDealershipInfo(userId);
 */

/**
 * Legacy: Use ProfileService (for backward compatibility)
 * 
 * import { ProfileService } from '../../services/profile';
 * 
 * // Upload profile image
 * const file = event.target.files[0];
 * const processed = await ProfileService.image.processProfileImage(file);
 * 
 * // Calculate trust score
 * const score = await ProfileService.trust.calculateTrustScore(userId);
 */

// Default export (unifiedProfileService)
export default unifiedProfileService;
