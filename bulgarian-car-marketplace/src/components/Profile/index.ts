// src/components/Profile/index.ts
// Profile Components Export - تصدير مكونات البروفايل
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

/**
 * Profile Components Module
 * 
 * هذا الملف يجمع جميع مكونات البروفايل للتصدير
 * This file consolidates all profile components for export
 * 
 * المكونات المتوفرة / Available Components:
 * 1. ProfileImageUploader - رفع الصورة الشخصية
 * 2. CoverImageUploader - رفع صورة الغلاف
 * 3. TrustBadge - عرض درجة الثقة والشارات
 */

// ==================== EXPORTS ====================

export { default as ProfileImageUploader } from './ProfileImageUploader';
export { default as CoverImageUploader } from './CoverImageUploader';
export { default as TrustBadge } from './TrustBadge';
export { default as ImageCropper } from './ImageCropper';
export { default as ProfileGallery } from './ProfileGallery';
export { default as VerificationPanel } from './VerificationPanel';
export { default as ProfileStats } from './ProfileStats';
export { default as ProfileCompletion } from './ProfileCompletion';
export { default as LoadingSkeleton } from './LoadingSkeleton';
export { default as EmptyState } from './EmptyState';
export { default as AnimatedCard } from './AnimatedCard';
export { default as IDReferenceHelper } from './IDReferenceHelper';
export { default as BusinessUpgradeCard } from './BusinessUpgradeCard';
export { default as BusinessBackground } from './BusinessBackground';
export { GarageSection } from './GarageSection';

// Export types
export type { GarageCar } from './GarageSection';

// ==================== USAGE EXAMPLES ====================

/**
 * Example 1: Profile Image
 * 
 * import { ProfileImageUploader } from './components/Profile';
 * 
 * <ProfileImageUploader
 *   currentImageUrl={user.profileImage?.url}
 *   onUploadSuccess={(url) => console.log('Uploaded:', url)}
 * />
 */

/**
 * Example 2: Cover Image
 * 
 * import { CoverImageUploader } from './components/Profile';
 * 
 * <CoverImageUploader
 *   currentImageUrl={user.coverImage?.url}
 *   onUploadSuccess={(url) => console.log('Cover uploaded:', url)}
 * />
 */

/**
 * Example 3: Trust Badge
 * 
 * import { TrustBadge } from './components/Profile';
 * 
 * <TrustBadge
 *   trustScore={user.verification.trustScore}
 *   level={user.verification.level}
 *   badges={user.verification.badges}
 * />
 */
