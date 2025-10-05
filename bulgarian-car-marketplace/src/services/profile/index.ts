// src/services/profile/index.ts
// Profile Services Index - ملف الربط الرئيسي
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

/**
 * Profile Services Module
 * 
 * هذا الملف يجمع جميع خدمات البروفايل في مكان واحد
 * This file consolidates all profile services in one place
 * 
 * الخدمات المتوفرة / Available Services:
 * 1. imageProcessingService - معالجة الصور
 * 2. trustScoreService - نظام درجة الثقة
 * 3. profileStatsService - إحصائيات البروفايل
 */

// ==================== EXPORTS ====================

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

// ==================== CONSOLIDATED SERVICE ====================

import { imageProcessingService } from './image-processing-service';
import { trustScoreService } from './trust-score-service';
import { profileStatsService } from './profile-stats-service';

/**
 * Main Profile Service
 * خدمة البروفايل الرئيسية
 * 
 * استخدم هذه الخدمة للوصول لجميع وظائف البروفايل
 * Use this service to access all profile functionality
 */
export const ProfileService = {
  // Image operations
  image: imageProcessingService,
  
  // Trust & verification
  trust: trustScoreService,
  
  // Statistics
  stats: profileStatsService
};

// ==================== USAGE EXAMPLES ====================

/**
 * Example 1: Upload profile image
 * 
 * const file = event.target.files[0];
 * const processed = await ProfileService.image.processProfileImage(file);
 * const urls = await ProfileService.image.uploadProfileVariants(userId, file, variants);
 */

/**
 * Example 2: Calculate trust score
 * 
 * const score = await ProfileService.trust.calculateTrustScore(userId);
 * console.log(`Trust score: ${score}/100`);
 */

/**
 * Example 3: Award badge
 * 
 * await ProfileService.trust.awardBadge(userId, 'EMAIL_VERIFIED');
 */

/**
 * Example 4: Update stats
 * 
 * await ProfileService.stats.incrementCarsSold(userId);
 * await ProfileService.stats.updateResponseTime(userId, 30);
 */

// ==================== TYPE DEFINITIONS ====================

export interface CompleteProfile {
  // User info
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  bio?: string;
  
  // Images
  profileImage?: ProfileImage;
  coverImage?: ProfileImage;
  gallery: ProfileImage[];
  
  // Verification
  verification: VerificationStatus;
  
  // Stats
  stats: ProfileStats;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// Default export
export default ProfileService;
