/**
 * Platform Types
 * أنواع المنصة الموحدة
 */

/**
 * AWS Services Interface
 * واجهة خدمات AWS
 */
export interface AWSServices {
  rekognition?: Record<string, unknown>;
  personalize?: Record<string, unknown>;
  comprehend?: Record<string, unknown>;
  quicksight?: Record<string, unknown>;
  kinesis?: Record<string, unknown>;
  waf?: Record<string, unknown>;
  macie?: Record<string, unknown>;
}

/**
 * Car Analysis Result
 * نتيجة تحليل السيارة
 */
export interface CarAnalysisResult {
  // Firebase Data
  basicInfo: {
    make: string;
    model: string;
    year: number;
    price: number;
  };

  // AI Analysis (Gemini + AWS Rekognition)
  aiAnalysis: {
    condition: string;
    confidence: number;
    damages: string[];
    marketValue: number;
  };

  // IoT Data (AWS IoT Core)
  telemetry?: {
    location: { lat: number; lng: number };
    fuel: number;
    mileage: number;
    lastUpdate: Date;
  };

  // Search Optimization (Algolia)
  searchTags: string[];

  // Market Intelligence
  marketInsights: {
    demandScore: number;
    priceRecommendation: number;
    competitorCount: number;
  };
}

/**
 * Market Trend
 * اتجاه السوق
 */
export interface MarketTrend {
  trend: string;
  percentage: number;
}

/**
 * User Recommendations
 * توصيات المستخدم
 */
export interface UserRecommendations {
  cars: unknown[];
  confidence: number;
  reasons: string[];
  marketTrends: MarketTrend[];
}

/**
 * User Behavior Analysis
 * تحليل سلوك المستخدم
 */
export interface UserBehavior {
  preferredBrands: string[];
  priceRange: { min: number; max: number };
  searchHistory: string[];
}

/**
 * Market Analysis
 * تحليل السوق
 */
export interface MarketAnalysis {
  demandScore: number;
  priceRecommendation: number;
  competitorCount: number;
}

/**
 * Security Scan Result
 * نتيجة فحص الأمان
 */
export interface SecurityScanResult {
  safe: boolean;
  risks: string[];
  recommendations: string[];
}

/**
 * Payment Intent
 * نية الدفع
 */
export interface PaymentIntent {
  paymentId: string;
  amount: number;
  status: string;
  clientSecret?: string;
}

/**
 * Search Filters
 * فلاتر البحث
 */
export interface SearchFilters {
  make?: string;
  model?: string;
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  condition?: string;
  location?: string;
  [key: string]: unknown;
}

/**
 * Search Results
 * نتائج البحث
 */
export interface SearchResults {
  hits: unknown[];
  nbHits: number;
  page: number;
  nbPages: number;
  hitsPerPage: number;
  processingTimeMS: number;
}

/**
 * Service Status
 * حالة الخدمات
 */
export interface ServiceStatus {
  initialized: boolean;
  services: {
    firebase: boolean;
    gemini: boolean;
    algolia: boolean;
    stripe: boolean;
    iot: boolean;
    aws: boolean;
  };
}

/**
 * AI Analysis Result
 * نتيجة تحليل الذكاء الاصطناعي
 */
export interface AIAnalysisResult {
  index: number;
  gemini: {
    make?: string;
    model?: string;
    year?: number;
    condition?: string;
    confidence?: number;
    damages?: string[];
    suggestedPrice?: number;
    color?: string;
    [key: string]: unknown;
  };
  rekognition?: Record<string, unknown>;
}

/**
 * Behavior Analysis
 * تحليل السلوك
 */
export interface BehaviorAnalysis {
  suspicious: boolean;
  score: number;
  patterns?: string[];
  anomalies?: string[];
}

/**
 * Security Rules Result
 * نتيجة قواعد الأمان
 */
export interface SecurityRulesResult {
  safe: boolean;
  risks: string[];
  recommendations: string[];
  violations?: string[];
}
