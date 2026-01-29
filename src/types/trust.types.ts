// src/types/trust.types.ts
// Bulgarian Trust Matrix Types - أنواع نظام الثقة البلغاري
// الهدف: نظام شامل للثقة مخصص للسوق البلغاري

import { Timestamp } from 'firebase/firestore';

// ==================== TRUST SYSTEM INTERFACE ====================

/**
 * Bulgarian Trust Matrix - النظام الشامل للثقة
 * يشمل: درجة الثقة، مستوى التحقق، الشارات، التقييمات، مقاييس الاستجابة
 */
export interface TrustSystem {
  /** درجة الثقة من 0 إلى 100 */
  sellerScore: number;
  
  /** مستوى التحقق: basic | verified | premium */
  verificationLevel: 'basic' | 'verified' | 'premium';
  
  /** الشارات المكتسبة */
  badges: TrustBadge[];
  
  /** معلومات التقييمات */
  reviews: ReviewSummary;
  
  /** مقاييس الاستجابة */
  responseMetrics: ResponseMetrics;
  
  /** رقم الهوية الوطنية البلغارية (EGN/EIK) */
  egnEik?: EGN_EIK_Info;
  
  /** تاريخ آخر تحديث */
  lastUpdated?: Timestamp;
}

// ==================== BADGE TYPES ====================

/**
 * شارة الثقة - أنواع مختلفة من الشارات
 */
export interface TrustBadge {
  /** نوع الشارة */
  type: BadgeType;
  
  /** تاريخ التحقق */
  verifiedAt: Timestamp;
  
  /** تاريخ انتهاء الصلاحية (اختياري) */
  expiresAt?: Timestamp;
  
  /** اسم الشارة بالبلغارية */
  nameBg?: string;
  
  /** اسم الشارة بالإنجليزية */
  nameEn?: string;
  
  /** أيقونة الشارة */
  icon?: string;
  
  /** أولوية العرض */
  priority?: number;
}

/**
 * أنواع الشارات المتاحة
 */
export type BadgeType = 
  | 'phone'           // تحقق الهاتف
  | 'id'              // تحقق الهوية (EGN)
  | 'business'        // تحقق العمل التجاري (EIK)
  | 'garage'          // معرض سيارات معتمد
  | 'premium_dealer'  // تاجر مميز
  | 'guaranteed_seller' // Гарантиран Продавач (بائع مضمون)
  | 'quick_responder'   // مستجيب سريع
  | 'top_rated';        // الأعلى تقييماً

// ==================== REVIEW TYPES ====================

/**
 * ملخص التقييمات
 */
export interface ReviewSummary {
  /** عدد التقييمات */
  count: number;
  
  /** المعدل من 5 */
  average: number;
  
  /** أحدث التقييمات */
  recent: Review[];
  
  /** التوزيع (1-5 نجوم) */
  distribution?: {
    one: number;
    two: number;
    three: number;
    four: number;
    five: number;
  };
}

/**
 * تقييم فردي
 */
export interface Review {
  /** معرف التقييم */
  id: string;
  
  /** معرف المستخدم الذي أضاف التقييم */
  reviewerId: string;
  
  /** اسم المراجع */
  reviewerName: string;
  
  /** الصورة الرمزية للمراجع */
  reviewerAvatar?: string;
  
  /** التقييم (1-5) */
  rating: number;
  
  /** نص التقييم */
  comment?: string;
  
  /** تاريخ التقييم */
  createdAt: Timestamp;
  
  /** نوع التقييم */
  type?: 'sale' | 'listing' | 'service';
  
  /** معرف السيارة المتعلقة (إن وجدت) */
  carId?: string;
  
  /** تم التحقق منه */
  verified?: boolean;
}

// ==================== RESPONSE METRICS ====================

/**
 * مقاييس الاستجابة - لقياس جودة التواصل
 */
export interface ResponseMetrics {
  /** متوسط وقت الاستجابة بالدقائق */
  avgResponseTime: number;
  
  /** معدل الاستجابة (نسبة الردود) */
  responseRate: number;
  
  /** عدد الرسائل المستلمة */
  messagesReceived?: number;
  
  /** عدد الرسائل المجابة */
  messagesResponded?: number;
  
  /** آخر مرة تم الرد فيها */
  lastResponseAt?: Timestamp;
  
  /** متوسط وقت الاستجابة في آخر 7 أيام */
  avgResponseTime7Days?: number;
  
  /** متوسط وقت الاستجابة في آخر 30 يوماً */
  avgResponseTime30Days?: number;
}

// ==================== EGN/EIK VERIFICATION ====================

/**
 * معلومات التحقق من الهوية الوطنية البلغارية
 * EGN (Единен граждански номер) للأفراد
 * EIK (Единен идентификационен код) للشركات
 */
export interface EGN_EIK_Info {
  /** الرقم الوطني (EGN أو EIK) */
  number: string;
  
  /** النوع: EGN للأفراد، EIK للشركات */
  type: 'EGN' | 'EIK';
  
  /** حالة التحقق */
  status: 'pending' | 'verified' | 'rejected' | 'expired';
  
  /** تاريخ التحقق */
  verifiedAt?: Timestamp;
  
  /** تاريخ انتهاء الصلاحية */
  expiresAt?: Timestamp;
  
  /** معرف المختبر (admin) */
  verifiedBy?: string;
  
  /** ملاحظات التحقق */
  notes?: string;
  
  /** مستندات التحقق */
  documents?: VerificationDocument[];
}

/**
 * مستند التحقق
 */
export interface VerificationDocument {
  /** نوع المستند */
  type: 'id_card' | 'passport' | 'business_registration' | 'vat_certificate';
  
  /** رابط المستند */
  url: string;
  
  /** حالة التحقق */
  status: 'pending' | 'approved' | 'rejected';
  
  /** تاريخ الرفع */
  uploadedAt: Timestamp;
  
  /** تاريخ التحقق */
  verifiedAt?: Timestamp;
}

// ==================== TRUST CALCULATION INPUT ====================

/**
 * مدخلات حساب درجة الثقة
 */
export interface TrustCalculationInput {
  /** التحقق من البريد الإلكتروني */
  emailVerified: boolean;
  
  /** التحقق من الهاتف */
  phoneVerified: boolean;
  
  /** التحقق من الهوية (EGN) */
  idVerified: boolean;
  
  /** التحقق من العمل التجاري (EIK) */
  businessVerified: boolean;
  
  /** اكتمال الملف الشخصي */
  profileCompletion: number; // 0-100
  
  /** عدد التقييمات */
  reviewsCount: number;
  
  /** متوسط التقييمات */
  reviewsAverage: number;
  
  /** عدد السيارات المعروضة */
  carsListed: number;
  
  /** عدد السيارات المباعة */
  carsSold: number;
  
  /** معدل الاستجابة */
  responseRate: number;
  
  /** متوسط وقت الاستجابة (دقائق) */
  avgResponseTime: number;
  
  /** عمر الحساب (أيام) */
  accountAge: number;
  
  /** نوع الملف الشخصي */
  profileType: 'private' | 'dealer' | 'company';
}

// ==================== TRUST LEVEL ENUM ====================

/**
 * مستويات الثقة
 */
export enum TrustLevel {
  UNVERIFIED = 'unverified',   // 0-20
  BASIC = 'basic',              // 21-40
  TRUSTED = 'trusted',          // 41-60
  VERIFIED = 'verified',        // 61-80
  PREMIUM = 'premium'           // 81-100
}

// ==================== HELPER TYPES ====================

/**
 * نتيجة حساب درجة الثقة
 */
export interface TrustScoreResult {
  /** درجة الثقة النهائية */
  score: number;
  
  /** المستوى */
  level: TrustLevel;
  
  /** التفاصيل */
  breakdown: {
    verification: number;
    reviews: number;
    activity: number;
    response: number;
  };
  
  /** الشارات المقترحة */
  suggestedBadges: BadgeType[];
  
  /** رسائل التحسين */
  improvementSuggestions: string[];
}

