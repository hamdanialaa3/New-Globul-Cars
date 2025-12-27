// src/types/pricing.types.ts
// Pricing Intelligence Types - أنواع ذكاء الأسعار
// الهدف: تحليل الأسعار للسوق البلغاري

// ==================== CAR SPECS ====================

/**
 * مواصفات السيارة للتحليل
 */
export interface CarSpecs {
  make: string;
  model: string;
  year: number;
  mileage: number;
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'lpg';
  transmission: 'manual' | 'automatic';
  engineSize?: number;
  power?: number;
  location: string;
  condition?: 'excellent' | 'very_good' | 'good' | 'fair';
  bodyType?: string;
  color?: string;
}

// ==================== PRICE ANALYSIS ====================

/**
 * تحليل السعر المقترح
 */
export interface PriceAnalysis {
  /** السعر المقترح */
  suggestedPrice: number;
  
  /** متوسط السوق */
  marketAverage: number;
  
  /** نطاق الأسعار */
  priceRange: {
    min: number;
    max: number;
  };
  
  /** التوصيات */
  recommendations: string[];
  
  /** مستوى الثقة في التحليل (0-100) */
  confidence: number;
  
  /** عوامل التأثير */
  factors: BulgarianFactors;
  
  /** السيارات المشابهة */
  similarCars: SimilarCar[];
}

/**
 * العوامل البلغارية المؤثرة على السعر
 */
export interface BulgarianFactors {
  /** ضريبة الاستيراد */
  importTax: number;
  
  /** الطلب الإقليمي */
  marketDemand: number; // 0-100
  
  /** التعديل الموسمي */
  seasonalAdjustment: number; // نسبة مئوية
  
  /** تأثير العملة (EUR to BGN) */
  currencyImpact: number;
  
  /** عامل الصدأ (ръжда) - مهم جداً في بلغاريا */
  rustFactor?: number;
  
  /** عامل الموقع */
  locationFactor: number;
}

/**
 * سيارة مشابهة
 */
export interface SimilarCar {
  id: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  location: string;
  similarityScore: number; // 0-100
}

// ==================== PRICING STRATEGY ====================

/**
 * استراتيجية التسعير
 */
export type PricingStrategy = 
  | 'competitive'  // تنافسي
  | 'premium'      // مميز
  | 'quick_sale'   // بيع سريع
  | 'market_average'; // متوسط السوق

/**
 * نتيجة التحليل التفصيلية
 */
export interface DetailedPriceAnalysis extends PriceAnalysis {
  /** الاستراتيجية المقترحة */
  recommendedStrategy: PricingStrategy;
  
  /** التفصيل حسب العوامل */
  breakdown: {
    basePrice: number;
    factorsAdjustment: number;
    finalPrice: number;
  };
  
  /** التنبؤات */
  predictions: {
    timeToSell: number; // أيام متوقعة للبيع
    buyerInterest: number; // 0-100
    negotiationRoom: number; // هامش التفاوض (%)
  };
}

