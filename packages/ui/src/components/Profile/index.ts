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
export { LEDProgressAvatar } from './LEDProgressAvatar';  // NEW: LED Progress System
export { default as SimpleProfileAvatar } from './SimpleProfileAvatar';  // Simple avatar without LED ring
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
export { default as ProfileTypeConfirmModal } from './ProfileTypeConfirmModal';  // ⚡ NEW
export { default as BusinessBackground } from './BusinessBackground';
export { GarageSectionPro as GarageSection } from './GarageSection_Pro';
export { GarageCarousel } from './GarageCarousel';  // ⚡ NEW: Circular Garage Carousel
export { FollowButton } from './FollowButton';
export { default as CommunityFeedWidget } from './CommunityFeedWidget';
export { default as UserPostsFeed } from './UserPostsFeed';  // ⚡ NEW: User Posts Feed

// Export types
export type { GarageCar } from './GarageSection_Pro';
export type { CarouselCar } from './GarageCarousel';

// ==================== USAGE EXAMPLES ====================

/**
 * Example 1: Profile Image
 * 
 * import { ProfileImageUploader } from '@globul-cars/ui/componentsProfile';
 * 
 * <ProfileImageUploader
 *   currentImageUrl={user.profileImage?.url}
 *   onUploadSuccess={(url) => console.log('Uploaded:', url)}
 * />
 */

/**
 * Example 2: Cover Image
 * 
 * import { CoverImageUploader } from '@globul-cars/ui/componentsProfile';
 * 
 * <CoverImageUploader
 *   currentImageUrl={user.coverImage?.url}
 *   onUploadSuccess={(url) => console.log('Cover uploaded:', url)}
 * />
 */

/**
 * Example 3: Trust Badge
 * 
 * import { TrustBadge } from '@globul-cars/ui/componentsProfile';
 * 
 * <TrustBadge
 *   trustScore={user.verification.trustScore}
 *   level={user.verification.level}
 *   badges={user.verification.badges}
 * />
 */
