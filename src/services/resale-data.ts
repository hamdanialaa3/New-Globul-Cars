/**
 * RESALE ANALYSIS DATA
 * بيانات تحليل إعادة البيع
 */

/**
 * Bulgarian market data
 * بيانات السوق البلغاري
 */
export const BULGARIAN_MARKET_DATA = {
  depreciation: {
    '1_year': 0.15,   // 15% في السنة الأولى
    '2_years': 0.25,  // 25% في السنتين الأولى
    '3_years': 0.35,  // 35% في 3 سنوات
    '4_years': 0.45,  // 45% في 4 سنوات
    '5+_years': 0.55  // 55% بعد 5 سنوات
  },
  seasonalFactors: {
    January: 0.90,
    February: 0.92,
    March: 1.05,
    April: 1.10,
    May: 1.15,
    June: 1.12,
    July: 1.08,
    August: 1.05,
    September: 1.10,
    October: 1.08,
    November: 0.95,
    December: 0.88
  }
};

/**
 * Base market values for popular models (in BGN)
 * القيم السوقية الأساسية للنماذج الشائعة (بالليف البلغاري)
 */
export const BASE_MARKET_VALUES: Record<string, number> = {
  'BMW 3 Series': 35000,
  'BMW 5 Series': 50000,
  'Mercedes-Benz C-Class': 40000,
  'Mercedes-Benz E-Class': 55000,
  'Audi A4': 38000,
  'Audi A6': 48000,
  'Volkswagen Golf': 25000,
  'Volkswagen Passat': 30000,
  'Skoda Octavia': 28000,
  'Skoda Superb': 35000,
  'Toyota Corolla': 22000,
  'Toyota RAV4': 35000,
  'Ford Focus': 20000,
  'Ford Mondeo': 25000,
  'Opel Astra': 18000,
  'Opel Insignia': 22000,
  'Renault Megane': 17000,
  'Renault Clio': 15000,
  'Hyundai i30': 20000,
  'Hyundai Tucson': 28000
};

/**
 * Similarity thresholds
 * عتبات التشابه
 */
export const SIMILARITY_THRESHOLDS = {
  MIN_SIMILARITY: 60,
  YEAR_PENALTY: 10,
  MILEAGE_PENALTY: 5,
  PRICE_PENALTY: 2
};

/**
 * Confidence levels
 * مستويات الثقة
 */
export const CONFIDENCE_LEVELS = {
  NO_COMPARABLES: 30,
  FEW_COMPARABLES: 50,
  SOME_COMPARABLES: 70,
  MANY_COMPARABLES: 85
};

/**
 * Age adjustment factors
 * عوامل تعديل العمر
 */
export const AGE_ADJUSTMENTS = {
  '1_year': 0.95,
  '2_years': 0.88,
  '3_years': 0.82,
  '4_years': 0.75,
  '5+_years': 0.68
};

/**
 * Mileage adjustment factors
 * عوامل تعديل المسافة المقطوعة
 */
export const MILEAGE_ADJUSTMENTS = {
  VERY_LOW: { max: 20000, factor: 1.05 },
  LOW: { max: 50000, factor: 1.00 },
  MEDIUM: { max: 80000, factor: 0.95 },
  HIGH: { max: 120000, factor: 0.90 },
  VERY_HIGH: { max: Infinity, factor: 0.85 }
};

/**
 * Pricing strategies
 * استراتيجيات التسعير
 */
export const PRICING_STRATEGIES = {
  aggressive: {
    targetMultiplier: 1.05,
    minimumMultiplier: 0.90
  },
  balanced: {
    targetMultiplier: 1.00,
    minimumMultiplier: 0.88
  },
  conservative: {
    targetMultiplier: 0.95,
    minimumMultiplier: 0.85
  }
};

/**
 * Recommendation reasoning templates (Bulgarian)
 * قوالب أسباب التوصية (بالبلغارية)
 */
export const RECOMMENDATION_REASONS = {
  HIGH_DEMAND: 'الطلب مرتفع والسوق في ارتفاع',
  WAIT_SEASON: 'التوقيت غير مثالي - انتظار موسم أفضل',
  STABLE_MARKET: 'السوق مستقر - الاحتفاظ بالسيارة'
};

/**
 * Alternative actions (Bulgarian)
 * الإجراءات البديلة (بالبلغارية)
 */
export const ALTERNATIVE_ACTIONS = [
  'تحسين حالة السيارة لزيادة القيمة',
  'إضافة ميزات إضافية',
  'انتظار انخفاض المخزون'
];

/**
 * Default values
 * القيم الافتراضية
 */
export const DEFAULTS = {
  BASE_PRICE: 15000, // Default base price in BGN
  MAX_COMPARABLES: 5,
  QUERY_LIMIT: 20,
  TREND_MONTHS: 6,
  MIN_TREND_SALES: 5,
  RECENT_DAYS: 30
};
