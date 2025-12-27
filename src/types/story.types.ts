// src/types/story.types.ts
// Car Story Types - أنواع قصص السيارات
// الهدف: قصص Instagram-style للسيارات (صوت المحرك، الداخلية، إلخ)
// ✅ CONSTITUTIONAL COMPLIANCE: Numeric ID System enforced

/**
 * أنواع القصص المتاحة
 * Story types for immersive vehicle content
 */
export type StoryType = 
  | 'engine_sound'        // صوت المحرك - Engine sound recording
  | 'interior_360'        // 360 درجة داخلية - Interior 360° view
  | 'exterior_walkaround' // جولة خارجية - Exterior walkaround
  | 'defect_highlight';   // عيوب واضحة - Defect/damage highlight

/**
 * Car Story - Instagram-style short video content
 * 
 * ✅ CONSTITUTIONAL COMPLIANCE:
 * - Uses carNumericId (not UUID)
 * - Uses sellerNumericId (not Firebase UID)
 * - Links directly to /car/{sellerNumericId}/{carNumericId}
 * 
 * @interface CarStory
 * @since Phase 4.1 - Visual Immersion Protocol
 */
export interface CarStory {
  /** معرف القصة الفريد - Unique story ID */
  id: string;
  
  /** ✅ معرف السيارة الرقمي - Car's numeric ID (per seller) */
  carNumericId: number;
  
  /** ✅ معرف البائع الرقمي - Seller's numeric ID */
  sellerNumericId: number;
  
  /** نوع القصة - Story category */
  type: StoryType;
  
  /** رابط الفيديو - Firebase Storage video URL */
  videoUrl: string;
  
  /** رابط الصورة المصغرة - Thumbnail preview URL */
  thumbnailUrl: string;
  
  /** مدة الفيديو بالثواني (حد أقصى 15 ثانية) - Duration in seconds (max 15s) */
  durationSec: number;
  
  /** تاريخ الإنشاء - Creation timestamp */
  createdAt: number;
  
  /** عدد المشاهدات - View count */
  views: number;
  
  /** ترتيب العرض (اختياري) - Display order */
  order?: number;
}

/**
 * Story Viewer Props
 */
export interface StoryViewerProps {
  /** القصص المعروضة */
  stories: CarStory[];
  
  /** الفهرس الأولي */
  initialIndex?: number;
  
  /** دالة الإغلاق */
  onClose: () => void;
  
  /** اللغة */
  language?: 'bg' | 'en';
}

