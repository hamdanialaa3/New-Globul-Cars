/**
 * 🎯 Recommendation Engine Types
 * أنواع محرك التوصيات الذكي
 * 
 * @description Type definitions for the Koli One Smart Recommendation System
 * @version 1.0.0
 */

// ============================================================================
// BEHAVIOR TRACKING TYPES
// ============================================================================

/**
 * Search Event - تسجيل عملية البحث
 */
export interface SearchEvent {
  brand?: string;
  model?: string;
  priceMin?: number;
  priceMax?: number;
  fuel?: string;
  gearbox?: string;
  bodyType?: string;
  yearMin?: number;
  yearMax?: number;
  timestamp: number;
}

/**
 * View Event - تسجيل مشاهدة سيارة
 */
export interface ViewEvent {
  carId: string;
  brand: string;
  model: string;
  price: number;
  fuel?: string;
  bodyType?: string;
  viewDuration?: number; // seconds
  scrollDepth?: number; // 0-100%
  timestamp: number;
}

/**
 * Interaction Event - تسجيل تفاعل
 */
export interface InteractionEvent {
  carId: string;
  type: 'favorite' | 'contact' | 'share' | 'compare' | 'print';
  timestamp: number;
}

/**
 * Brand Affinity - ولاء للماركة
 */
export interface BrandAffinity {
  brand: string;
  score: number; // 0-100
  signals: Array<{
    type: 'view' | 'favorite' | 'contact' | 'search';
    count: number;
    weight: number;
  }>;
  lastUpdated: number;
}

// ============================================================================
// USER BEHAVIOR TYPES
// ============================================================================

/**
 * User Behavior Profile - ملف سلوك المستخدم
 */
export interface UserBehavior {
  userId?: string;
  sessionId: string;
  
  // Event History
  searches: SearchEvent[];      // Max 20
  views: ViewEvent[];           // Max 50
  favorites: string[];          // Car IDs
  interactions: InteractionEvent[];
  
  // Computed Affinities
  brandAffinity: BrandAffinity[];
  
  // Preferences (computed)
  preferences: {
    preferredBrands: string[];
    priceRange: { min: number; max: number } | null;
    yearRange: { min: number; max: number } | null;
    fuelTypes: string[];
    bodyTypes: string[];
    gearboxTypes: string[];
  };
  
  // Context
  geo?: {
    city?: string;
    region?: string;
    country: string;
  };
  preferredLanguage: 'bg' | 'en' | 'ar';
  
  // Timestamps
  firstSeen: number;
  lastActive: number;
  sessionCount: number;
}

/**
 * Session Behavior (for anonymous users) - سلوك الجلسة للزوار
 */
export interface SessionBehavior {
  sessionId: string;
  filtersUsed: SearchEvent[];
  viewedCars: ViewEvent[];
  landingIntent?: string; // URL parameter that brought user
  referrer?: string;
  startTime: number;
  lastActivity: number;
}

// ============================================================================
// CAR METADATA TYPES
// ============================================================================

/**
 * Car Metadata for Recommendations - بيانات السيارة للتوصيات
 */
export interface CarMetadata {
  carId: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  fuel: string;
  gearbox: string;
  km: number;
  bodyType: string;
  color?: string;
  
  // Quality Metrics
  imagesCount: number;
  hasVideo: boolean;
  descriptionLength: number;
  qualityScore: number; // 0-100
  
  // Popularity Metrics
  viewsTotal: number;
  viewsToday: number;
  favoritesCount: number;
  contactsCount: number;
  popularityScore: number; // 0-100
  
  // Listing Info
  thumbnailUrl: string;
  createdAt: number;
  updatedAt: number;
  
  // Pricing
  priceDropped?: boolean;
  priceDropAmount?: number;
  priceDropDate?: number;
  marketPriceComparison?: 'below' | 'average' | 'above';
  
  // Seller
  sellerId: string;
  sellerNumericId?: number;
  carNumericId?: number;
  sellerType: 'private' | 'dealer';
  sellerVerified: boolean;
}

// ============================================================================
// MARKET TRENDS TYPES
// ============================================================================

/**
 * Market Trends - اتجاهات السوق
 */
export interface MarketTrends {
  // Trending Cars (most viewed in last 24h)
  trendingCars: Array<{
    carId: string;
    viewsToday: number;
    trend: 'rising' | 'stable' | 'declining';
  }>;
  
  // Trending Brands (Bulgarian market)
  trendingBrands: Array<{
    brand: string;
    searchVolume: number;
    trend: 'rising' | 'stable' | 'declining';
  }>;
  
  // Trending Body Types
  trendingBodyTypes: Array<{
    bodyType: string;
    searchVolume: number;
  }>;
  
  // Fast Selling (sold within 7 days)
  fastSellingModels: Array<{
    brand: string;
    model: string;
    avgDaysToSell: number;
  }>;
  
  // Updated timestamp
  updatedAt: number;
}

// ============================================================================
// SCORING TYPES
// ============================================================================

/**
 * Score Breakdown - تفاصيل النتيجة
 */
export interface ScoreBreakdown {
  userMatchScore: number;     // 0-100 (weight: 0.45)
  behavioralScore: number;    // 0-100 (weight: 0.35)
  marketScore: number;        // 0-100 (weight: 0.20)
  brandAffinityBonus: number; // 0-100 (additional)
  
  finalScore: number;         // Weighted total
  
  // Debug info
  factors: Array<{
    name: string;
    value: number;
    reason: string;
  }>;
}

/**
 * Recommendation Reason - سبب التوصية
 */
export interface RecommendationReason {
  key: string;
  params?: Record<string, string | number>;
  text: {
    bg: string;
    en: string;
    ar?: string;
  };
  priority: number; // Higher = more important
}

// ============================================================================
// RECOMMENDATION RESULT TYPES
// ============================================================================

/**
 * Recommended Car - سيارة موصى بها
 */
export interface RecommendedCar {
  carId: string;
  score: number;
  scoreBreakdown: ScoreBreakdown;
  
  // Primary reason for recommendation
  reason: RecommendationReason;
  
  // Additional reasons
  additionalReasons?: RecommendationReason[];
  
  // Car metadata
  metadata: CarMetadata;
  
  // Recommendation category
  category: 'high_match' | 'exploration' | 'discovery' | 'affinity_boost';
  
  // Position info
  position: number;
  isAffinityBoosted: boolean;
}

/**
 * Recommendation Response - استجابة التوصيات
 */
export interface RecommendationResponse {
  cars: RecommendedCar[];
  
  // Context
  userId?: string;
  sessionId: string;
  
  // Algorithm info
  algorithmVersion: string;
  generatedAt: number;
  expiresAt: number;
  
  // Stats
  stats: {
    totalCarsConsidered: number;
    highMatchCount: number;
    explorationCount: number;
    discoveryCount: number;
    affinityBoostCount: number;
  };
  
  // Dominant brand (if any)
  dominantBrand?: {
    brand: string;
    affinityScore: number;
  };
  
  // Cache info
  cached: boolean;
  cacheKey?: string;
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

/**
 * Scoring Weights Configuration - إعدادات الأوزان
 */
export interface ScoringConfig {
  weights: {
    userMatch: number;      // Default: 0.45
    behavioral: number;     // Default: 0.35
    market: number;         // Default: 0.20
  };
  
  brandBoosts: {
    german: number;         // BMW, Mercedes, Audi, VW
    japanese: number;       // Toyota, Honda, Mazda
    french: number;         // Peugeot, Renault, Citroën
    korean: number;         // Hyundai, Kia
    american: number;       // Ford, Chevrolet
  };
  
  affinityThreshold: number; // Score needed for affinity boost (default: 60)
  maxAffinityBoost: number;  // Cap for affinity bonus (default: 100)
  
  diversification: {
    highMatch: number;      // Default: 0.60
    exploration: number;    // Default: 0.25
    discovery: number;      // Default: 0.15
  };
}

/**
 * Recommendation Request - طلب التوصيات
 */
export interface RecommendationRequest {
  userId?: string;
  sessionId: string;
  
  // Optional filters
  filters?: {
    maxPrice?: number;
    minYear?: number;
    brands?: string[];
    bodyTypes?: string[];
    fuels?: string[];
  };
  
  // Pagination
  limit?: number; // Default: 12
  offset?: number;
  
  // Options
  includeScoreBreakdown?: boolean;
  forceRefresh?: boolean;
}

// ============================================================================
// CACHE TYPES
// ============================================================================

/**
 * Recommendation Cache Entry - إدخال ذاكرة التخزين المؤقت
 */
export interface RecommendationCache {
  key: string;
  response: RecommendationResponse;
  createdAt: number;
  expiresAt: number;
  hitCount: number;
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

/**
 * Recommendation Analytics - تحليلات التوصيات
 */
export interface RecommendationAnalytics {
  // Performance
  impressions: number;
  clicks: number;
  ctr: number; // Click-through rate
  
  // Engagement
  avgViewDuration: number;
  contactRate: number;
  favoriteRate: number;
  
  // Algorithm
  diversityScore: number;
  accuracyScore: number;
  
  // Time
  avgResponseTime: number;
  cacheHitRate: number;
  
  // Period
  periodStart: number;
  periodEnd: number;
}
