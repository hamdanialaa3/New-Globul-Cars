// src/components/Reviews/index.ts
// Reviews Components Index - ملف ربط مكونات المراجعات
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

/**
 * Reviews Components Module
 * 
 * مكونات المراجعات والتقييمات
 * Reviews and ratings components
 * 
 * Available Components:
 * 1. RatingDisplay - عرض التقييم بالنجوم
 * 2. RatingStats - إحصائيات التقييمات
 * 3. ReviewCard - كارت مراجعة واحدة
 * 4. ReviewsList - قائمة المراجعات
 * 5. ReviewForm - نموذج إضافة مراجعة
 */

// ==================== EXPORTS ====================

export { default as RatingDisplay } from './RatingDisplay';
export { default as RatingStats } from './RatingStats';
export { default as ReviewCard } from './ReviewCard';
export { default as ReviewsList } from './ReviewsList';
export { default as ReviewForm } from './ReviewForm';

// ==================== USAGE EXAMPLES ====================

/**
 * Example 1: Rating Display
 * 
 * import { RatingDisplay } from './components/Reviews';
 * 
 * <RatingDisplay
 *   rating={4.5}
 *   reviewCount={128}
 *   showNumber={true}
 *   showCount={true}
 *   size="medium"
 * />
 */

/**
 * Example 2: Rating Stats
 * 
 * import { RatingStats } from './components/Reviews';
 * 
 * <RatingStats stats={stats} />
 */

/**
 * Example 3: Review Card
 * 
 * import { ReviewCard } from './components/Reviews';
 * 
 * <ReviewCard
 *   review={review}
 *   onHelpful={(id, helpful) => console.log(id, helpful)}
 * />
 */

/**
 * Example 4: Reviews List
 * 
 * import { ReviewsList } from './components/Reviews';
 * 
 * <ReviewsList
 *   sellerId="user123"
 *   showStats={true}
 * />
 */

/**
 * Example 5: Review Form
 * 
 * import { ReviewForm } from './components/Reviews';
 * 
 * <ReviewForm
 *   sellerId="user123"
 *   carId="car456"
 *   onSuccess={() => console.log('Review submitted!')}
 * />
 */
