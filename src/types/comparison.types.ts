// src/types/comparison.types.ts
// Car Comparison Types - أنواع مقارنة السيارات
// الهدف: نظام مقارنة متقدم للسيارات (Battle Mode)

export interface CarComparison {
  /** السيارات المقارنة */
  cars: ComparisonCar[];
  
  /** النتائج */
  results: ComparisonResults;
  
  /** تاريخ المقارنة */
  createdAt: number;
}

export interface ComparisonCar {
  /** معرف السيارة */
  id: string;
  
  /** الماركة */
  make: string;
  
  /** الموديل */
  model: string;
  
  /** السنة */
  year: number;
  
  /** السعر */
  price: number;
  
  /** الكيلومترات */
  mileage: number;
  
  /** القوة (حصان) */
  power?: number;
  
  /** نوع الوقود */
  fuelType?: string;
  
  /** نوع ناقل الحركة */
  transmission?: string;
  
  /** المميزات */
  features?: string[];
  
  /** الصورة */
  imageUrl?: string;
}

export interface ComparisonResults {
  /** الفروقات */
  differences: CarDifferences;
  
  /** الفائز في كل فئة */
  winners: ComparisonWinners;
  
  /** النتيجة الإجمالية */
  overallWinner?: 'A' | 'B' | 'tie';
  
  /** النصيحة */
  recommendation?: string;
}

export interface CarDifferences {
  /** فرق السعر */
  priceDelta: number;
  
  /** فرق السنة */
  yearDelta: number;
  
  /** فرق الكيلومترات */
  mileageDelta: number;
  
  /** فرق القوة */
  powerDelta?: number;
  
  /** المميزات الفريدة للسيارة A */
  uniqueFeaturesA: string[];
  
  /** المميزات الفريدة للسيارة B */
  uniqueFeaturesB: string[];
}

export interface ComparisonWinners {
  /** الفائز في السعر (الأقل هو الأفضل) */
  price: 'A' | 'B';
  
  /** الفائز في السنة (الأحدث هو الأفضل) */
  year: 'A' | 'B';
  
  /** الفائز في الكيلومترات (الأقل هو الأفضل) */
  mileage: 'A' | 'B';
  
  /** الفائز في القوة (الأكثر هو الأفضل) */
  power?: 'A' | 'B';
  
  /** الفائز في المميزات (الأكثر هو الأفضل) */
  features: 'A' | 'B' | 'tie';
}

