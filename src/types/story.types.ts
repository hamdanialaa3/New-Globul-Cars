// src/types/story.types.ts
// Car Story Types - أنواع قصص السيارات
// الهدف: قصص Instagram-style للسيارات (صوت المحرك، الداخلية، إلخ)

export interface CarStory {
  /** معرف القصة */
  id: string;
  
  /** نوع القصة */
  type: StoryType;
  
  /** رابط الفيديو */
  videoUrl: string;
  
  /** رابط الصورة المصغرة */
  thumbnailUrl: string;
  
  /** مدة الفيديو بالثواني */
  durationSec: number;
  
  /** تاريخ الإنشاء */
  createdAt: number;
  
  /** معرف السيارة */
  carId: string;
  
  /** ترتيب العرض */
  order?: number;
}

/**
 * أنواع القصص المتاحة
 */
export type StoryType = 
  | 'engine_start'      // تشغيل المحرك
  | 'interior_360'      // 360 درجة داخلية
  | 'exterior_walk'     // جولة خارجية
  | 'exhaust_sound'     // صوت العادم
  | 'test_drive'        // تجربة قيادة
  | 'features_showcase'; // عرض المميزات

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

