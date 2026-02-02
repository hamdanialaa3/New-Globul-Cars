/**
 * 🚀 Main Recommendation Service
 * Orchestrates the entire recommendation pipeline
 * 
 * @description Main entry point for getting personalized car recommendations
 * @pipeline
 * 1. Check cache
 * 2. Get user behavior + external intent
 * 3. Fetch candidate cars
 * 4. Apply intent-based boosting
 * 5. Score cars
 * 6. Diversify results
 * 7. Generate reasons
 * 8. Cache and return
 * 
 * @version 2.0.0 - Now with external intent integration
 */

import { logger } from '../logger-service';

import { 
  RecommendationRequest, 
  RecommendationResponse, 
  RecommendedCar,
  CarMetadata,
  MarketTrends
} from './types';
import { behaviorService } from './behavior.service';
import { scoreAndRankCars, DEFAULT_CONFIG } from './scoring.service';
import { generatePrimaryReason, generateAdditionalReasons } from './reasons.service';
import { diversifyRecommendations } from './diversify.service';
import { cacheService } from './cache.service';
import { intentAggregator, UnifiedIntent } from './intent-aggregator.service';
import { crossPlatformTracker } from './cross-platform.service';

// ============================================================================
// CONFIGURATION
// ============================================================================

const ALGORITHM_VERSION = '2.0.0';
const DEFAULT_LIMIT = 12;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// Intent boost weights
const INTENT_BOOST_WEIGHTS = {
  externalBrandMatch: 15,     // Brand from Google/external search
  externalBodyTypeMatch: 10,  // Body type from external search
  adClickBrand: 20,           // User clicked an ad for this brand
  crossPlatformHigh: 12,      // High engagement across platforms
  keywordMatch: 8             // Matches external keyword
};

// ============================================================================
// MARKET TRENDS (Static for now, can be fetched from Firestore)
// ============================================================================

const getMarketTrends = async (): Promise<MarketTrends> => {
  // In production, this would fetch from Firestore
  // For now, return Bulgarian market defaults
  return {
    trendingCars: [],
    trendingBrands: [
      { brand: 'BMW', searchVolume: 1500, trend: 'stable' },
      { brand: 'Mercedes', searchVolume: 1400, trend: 'rising' },
      { brand: 'Audi', searchVolume: 1200, trend: 'stable' },
      { brand: 'Volkswagen', searchVolume: 1100, trend: 'stable' },
      { brand: 'Toyota', searchVolume: 800, trend: 'rising' }
    ],
    trendingBodyTypes: [
      { bodyType: 'SUV', searchVolume: 2000 },
      { bodyType: 'Sedan', searchVolume: 1500 },
      { bodyType: 'Hatchback', searchVolume: 1000 }
    ],
    fastSellingModels: [
      { brand: 'BMW', model: '3 Series', avgDaysToSell: 14 },
      { brand: 'Mercedes', model: 'C-Class', avgDaysToSell: 16 },
      { brand: 'Volkswagen', model: 'Golf', avgDaysToSell: 12 }
    ],
    updatedAt: Date.now()
  };
};

// ============================================================================
// CAR FETCHING (Mock for now, integrate with Firestore)
// ============================================================================

const fetchCandidateCars = async (
  filters?: RecommendationRequest['filters'],
  candidateLimit = 100
): Promise<CarMetadata[]> => {
  // In production, this would query Firestore with filters
  // For now, return empty - will be connected to existing car service
  
  try {
    // Import dynamically to avoid circular dependencies
    const { default: carService } = await import('../car/car-listing.service');
    
    // Fetch cars from Firestore
    const queryFilters: Record<string, unknown> = {};
    
    if (filters?.maxPrice) queryFilters.maxPrice = filters.maxPrice;
    if (filters?.minYear) queryFilters.minYear = filters.minYear;
    if (filters?.brands?.length) queryFilters.brands = filters.brands;
    if (filters?.bodyTypes?.length) queryFilters.bodyTypes = filters.bodyTypes;
    if (filters?.fuels?.length) queryFilters.fuels = filters.fuels;
    
    // Get cars (limit to 100 for scoring)
    const cars = await carService.getCars({
      ...queryFilters,
      limit: candidateLimit,
      status: 'active'
    });
    
    // Transform to CarMetadata
    return cars.map((car: Record<string, unknown>) => {
      const images = car.images as string[] | undefined;
      const description = car.description as string | undefined;
      const createdAtValue = car.createdAt as { toMillis?: () => number } | number | undefined;
      const updatedAtValue = car.updatedAt as { toMillis?: () => number } | number | undefined;
      
      return {
        carId: (car.id || car.carId || '') as string,
        brand: (car.brand || 'Unknown') as string,
        model: (car.model || 'Unknown') as string,
        year: (car.year || new Date().getFullYear()) as number,
        price: (car.price || 0) as number,
        fuel: (car.fuel || car.fuelType || 'Unknown') as string,
        gearbox: (car.gearbox || car.transmission || 'Unknown') as string,
        km: (car.km || car.mileage || 0) as number,
        bodyType: (car.bodyType || 'Unknown') as string,
        color: car.color as string | undefined,
        imagesCount: images?.length || 0,
        hasVideo: !!car.videoUrl,
        descriptionLength: description?.length || 0,
        qualityScore: calculateQualityScore(car),
        viewsTotal: (car.views || 0) as number,
        viewsToday: (car.viewsToday || 0) as number,
        favoritesCount: (car.favorites || 0) as number,
        contactsCount: (car.contacts || 0) as number,
        popularityScore: calculatePopularityScore(car),
        thumbnailUrl: (images?.[0] || car.thumbnail || '') as string,
        createdAt: (typeof createdAtValue === 'object' && createdAtValue?.toMillis) 
          ? createdAtValue.toMillis() 
          : (createdAtValue as number) || Date.now(),
        updatedAt: (typeof updatedAtValue === 'object' && updatedAtValue?.toMillis)
          ? updatedAtValue.toMillis()
          : (updatedAtValue as number) || Date.now(),
        priceDropped: (car.priceDropped || false) as boolean,
        priceDropAmount: car.priceDropAmount as number | undefined,
        priceDropDate: car.priceDropDate as number | undefined,
        marketPriceComparison: car.marketPriceComparison as number | undefined,
        sellerId: (car.sellerId || car.userId || '') as string,
        sellerNumericId: (car.sellerNumericId || car.ownerNumericId) as number | undefined,
        carNumericId: (car.carNumericId || car.numericId) as number | undefined,
        sellerType: (car.sellerType || 'private') as 'private' | 'dealer',
        sellerVerified: (car.sellerVerified || false) as boolean
      };
    });
  } catch (err) {
    logger.error('[RecommendationService] Failed to fetch cars:', err);
    return [];
  }
};

/**
 * Calculate quality score for a car listing
 */
const calculateQualityScore = (car: Record<string, unknown>): number => {
  let score = 0;
  
  // Images (max 30 points)
  const images = car.images as string[] | undefined;
  const imageCount = images?.length || 0;
  score += Math.min(imageCount * 5, 30);
  
  // Description (max 20 points)
  const description = car.description as string | undefined;
  const descLength = description?.length || 0;
  if (descLength > 500) score += 20;
  else if (descLength > 200) score += 15;
  else if (descLength > 50) score += 10;
  
  // Video (10 points)
  if (car.videoUrl) score += 10;
  
  // Price (10 points)
  const price = car.price as number | undefined;
  if (price && price > 0) score += 10;
  
  // Complete info (max 30 points)
  if (car.year) score += 5;
  if (car.km || car.mileage) score += 5;
  if (car.fuel || car.fuelType) score += 5;
  if (car.gearbox || car.transmission) score += 5;
  if (car.color) score += 5;
  if (car.bodyType) score += 5;
  
  return Math.min(score, 100);
};

/**
 * Calculate popularity score for a car
 */
const calculatePopularityScore = (car: Record<string, unknown>): number => {
  let score = 0;
  
  // Views (max 40 points)
  const views = (car.views as number) || 0;
  if (views > 1000) score += 40;
  else if (views > 500) score += 30;
  else if (views > 100) score += 20;
  else if (views > 50) score += 10;
  
  // Favorites (max 30 points)
  const favorites = (car.favorites as number) || 0;
  if (favorites > 50) score += 30;
  else if (favorites > 20) score += 20;
  else if (favorites > 5) score += 10;
  
  // Contacts (max 30 points)
  const contacts = (car.contacts as number) || 0;
  if (contacts > 20) score += 30;
  else if (contacts > 10) score += 20;
  else if (contacts > 3) score += 10;
  
  return Math.min(score, 100);
};

// ============================================================================
// FALLBACK RECOMMENDATIONS
// ============================================================================

const getFallbackRecommendations = async (
  limit: number = DEFAULT_LIMIT
): Promise<CarMetadata[]> => {
  // Return trending/popular cars when no personalization is available
  try {
    const cars = await fetchCandidateCars(undefined, limit);
    
    // Sort by popularity + recency
    return cars.sort((a, b) => {
      const scoreA = a.popularityScore + (a.createdAt > Date.now() - 24 * 60 * 60 * 1000 ? 20 : 0);
      const scoreB = b.popularityScore + (b.createdAt > Date.now() - 24 * 60 * 60 * 1000 ? 20 : 0);
      return scoreB - scoreA;
    }).slice(0, limit);
  } catch (err) {
    logger.error('[RecommendationService] Fallback failed:', err);
    return [];
  }
};

// ============================================================================
// INTENT BOOST FUNCTION
// ============================================================================

/**
 * Apply external intent boosts to car scores
 * This modifies the qualityScore based on external signals
 */
const applyIntentBoosts = (
  cars: CarMetadata[],
  intent: UnifiedIntent
): CarMetadata[] => {
  if (intent.dataPoints === 0) {
    return cars; // No external intent, return as-is
  }
  
  // Create lookup maps for fast matching
  const intentBrands = new Set(intent.brands.map(b => b.brand.toLowerCase()));
  const intentBodyTypes = new Set(intent.bodyTypes.map(b => b.type.toLowerCase()));
  const intentKeywords = new Set(intent.keywords.slice(0, 10).map(k => k.word.toLowerCase()));
  
  return cars.map(car => {
    let boost = 0;
    
    // Brand match from external intent
    const carBrand = car.brand.toLowerCase();
    if (intentBrands.has(carBrand)) {
      const brandPref = intent.brands.find(b => b.brand.toLowerCase() === carBrand);
      if (brandPref) {
        // Higher weight if from multiple sources
        const sourceMultiplier = brandPref.sources.length >= 2 ? 1.5 : 1;
        boost += INTENT_BOOST_WEIGHTS.externalBrandMatch * (brandPref.weight / 100) * sourceMultiplier;
        
        // Extra boost if from ad click
        if (brandPref.breakdown.adClicks > 0) {
          boost += INTENT_BOOST_WEIGHTS.adClickBrand;
        }
      }
    }
    
    // Body type match
    const carBodyType = car.bodyType.toLowerCase();
    if (intentBodyTypes.has(carBodyType)) {
      boost += INTENT_BOOST_WEIGHTS.externalBodyTypeMatch;
    }
    
    // Keyword match (brand + model)
    const carText = `${car.brand} ${car.model}`.toLowerCase();
    for (const keyword of intentKeywords) {
      if (carText.includes(keyword)) {
        boost += INTENT_BOOST_WEIGHTS.keywordMatch;
        break; // Only apply once
      }
    }
    
    // Price range match
    if (intent.priceRange.confidence !== 'low') {
      const { min, max } = intent.priceRange;
      if (min && max && car.price >= min && car.price <= max) {
        boost += 5; // Bonus for being in preferred price range
      } else if (min && car.price >= min && !max) {
        boost += 3;
      } else if (max && car.price <= max && !min) {
        boost += 3;
      }
    }
    
    // Year range match
    if (intent.yearRange.confidence !== 'low') {
      const { min, max } = intent.yearRange;
      if (min && max && car.year >= min && car.year <= max) {
        boost += 5;
      }
    }
    
    // Fuel type match
    if (intent.preferredFuel && car.fuel.toLowerCase() === intent.preferredFuel.toLowerCase()) {
      boost += 5;
    }
    
    // Gearbox match
    if (intent.preferredGearbox && car.gearbox.toLowerCase() === intent.preferredGearbox.toLowerCase()) {
      boost += 5;
    }
    
    // Apply boost to quality score
    if (boost > 0) {
      return {
        ...car,
        qualityScore: Math.min(100, car.qualityScore + boost),
        // Store boost for debugging
        _intentBoost: boost
      } as CarMetadata;
    }
    
    return car;
  });
};

// ============================================================================
// MAIN RECOMMENDATION FUNCTION
// ============================================================================

/**
 * Get personalized recommendations for homepage
 */
export const getRecommendations = async (
  request: RecommendationRequest
): Promise<RecommendationResponse> => {
  const startTime = Date.now();
  const { userId, sessionId, filters, limit = DEFAULT_LIMIT, forceRefresh = false } = request;
  
  logger.info('[RecommendationService] Getting recommendations', {
    userId: userId || 'anonymous',
    sessionId,
    limit,
    hasFilters: !!filters
  });
  
  // Step 1: Check cache (unless force refresh)
  if (!forceRefresh) {
    const cached = cacheService.get(userId, sessionId, filters);
    if (cached) {
      logger.info('[RecommendationService] Returning cached recommendations', {
        cacheKey: cached.cacheKey,
        cars: cached.cars.length
      });
      return cached;
    }
  }
  
  try {
    // Step 2: Get user behavior + external intent (parallel fetch)
    const [behavior, affinities, externalIntent] = await Promise.all([
      Promise.resolve(behaviorService.getBehavior()),
      Promise.resolve(behaviorService.getBrandAffinities()),
      intentAggregator.getUnifiedIntent(forceRefresh)
    ]);
    
    // Track page view for cross-platform analytics
    crossPlatformTracker.trackPageView({ section: 'recommendations' });
    
    logger.info('[RecommendationService] Intent collected', {
      internalBrands: affinities.length,
      externalBrands: externalIntent.brands.length,
      intentConfidence: externalIntent.confidence,
      dataPoints: externalIntent.dataPoints
    });
    
    // Step 3: Fetch candidate cars
    const candidateCars = await fetchCandidateCars(filters, 100);
    
    if (candidateCars.length === 0) {
      logger.warn('[RecommendationService] No candidate cars found, using fallback');
      const fallbackCars = await getFallbackRecommendations(limit);
      
      return buildFallbackResponse(fallbackCars, sessionId, userId);
    }
    
    // Step 4: Get market trends
    const trends = await getMarketTrends();
    
    // Step 4.5: Apply external intent boosts to cars
    const carsWithIntentBoost = applyIntentBoosts(candidateCars, externalIntent);
    
    // Step 5: Score all cars
    const scoredCars = scoreAndRankCars(carsWithIntentBoost, behavior, affinities, trends);
    
    // Step 6: Diversify results
    const { cars: diversifiedCars, stats } = diversifyRecommendations(
      scoredCars,
      affinities,
      limit,
      DEFAULT_CONFIG.diversification
    );
    
    // Step 7: Generate reasons and build response
    const recommendedCars: RecommendedCar[] = diversifiedCars.map((item, index) => {
      const primaryReason = generatePrimaryReason(item.breakdown, item.car);
      const additionalReasons = generateAdditionalReasons(
        item.breakdown,
        item.car,
        primaryReason.key,
        2
      );
      
      return {
        carId: item.car.carId,
        score: item.breakdown.finalScore,
        scoreBreakdown: request.includeScoreBreakdown ? item.breakdown : item.breakdown,
        reason: primaryReason,
        additionalReasons,
        metadata: item.car,
        category: item.category,
        position: index + 1,
        isAffinityBoosted: item.isAffinityBoosted
      };
    });
    
    // Build response
    const response: RecommendationResponse = {
      cars: recommendedCars,
      userId,
      sessionId,
      algorithmVersion: ALGORITHM_VERSION,
      generatedAt: Date.now(),
      expiresAt: Date.now() + CACHE_TTL,
      stats: {
        totalCarsConsidered: candidateCars.length,
        ...stats
      },
      cached: false
    };
    
    // Add dominant brand if exists
    if (affinities.length > 0 && affinities[0].score >= 60) {
      response.dominantBrand = {
        brand: affinities[0].brand,
        affinityScore: affinities[0].score
      };
    }
    
    // Step 8: Cache response
    cacheService.set(response, userId, sessionId, filters, CACHE_TTL);
    
    const duration = Date.now() - startTime;
    logger.info('[RecommendationService] Recommendations generated', {
      cars: recommendedCars.length,
      duration: `${duration}ms`,
      dominantBrand: response.dominantBrand?.brand
    });
    
    return response;
    
  } catch (err) {
    logger.error('[RecommendationService] Error generating recommendations:', err);
    
    // Return fallback on error
    const fallbackCars = await getFallbackRecommendations(limit);
    return buildFallbackResponse(fallbackCars, sessionId, userId);
  }
};

/**
 * Build fallback response
 */
const buildFallbackResponse = (
  cars: CarMetadata[],
  sessionId: string,
  userId?: string
): RecommendationResponse => {
  const recommendedCars: RecommendedCar[] = cars.map((car, index) => ({
    carId: car.carId,
    score: car.popularityScore || 50,
    scoreBreakdown: {
      userMatchScore: 0,
      behavioralScore: 0,
      marketScore: car.popularityScore || 50,
      brandAffinityBonus: 0,
      finalScore: car.popularityScore || 50,
      factors: [{ name: 'fallback', value: car.popularityScore || 50, reason: 'Trending' }]
    },
    reason: {
      key: 'trending',
      text: {
        bg: 'Популярен автомобил',
        en: 'Trending car'
      },
      priority: 50
    },
    metadata: car,
    category: 'discovery' as const,
    position: index + 1,
    isAffinityBoosted: false
  }));
  
  return {
    cars: recommendedCars,
    userId,
    sessionId,
    algorithmVersion: ALGORITHM_VERSION,
    generatedAt: Date.now(),
    expiresAt: Date.now() + CACHE_TTL,
    stats: {
      totalCarsConsidered: cars.length,
      highMatchCount: 0,
      explorationCount: 0,
      discoveryCount: cars.length,
      affinityBoostCount: 0
    },
    cached: false
  };
};

/**
 * Refresh recommendations (invalidate cache and regenerate)
 */
export const refreshRecommendations = async (
  request: RecommendationRequest
): Promise<RecommendationResponse> => {
  cacheService.invalidate(request.userId, request.sessionId);
  return getRecommendations({ ...request, forceRefresh: true });
};

/**
 * Track car view for recommendations
 */
export const trackCarView = (
  carId: string,
  brand: string,
  model: string,
  price: number,
  fuel?: string,
  bodyType?: string
): void => {
  behaviorService.trackView({
    carId,
    brand,
    model,
    price,
    fuel,
    bodyType
  });
  
  // Invalidate cache since behavior changed
  cacheService.invalidate(undefined, behaviorService.getSessionId());
};

/**
 * Track search for recommendations
 */
export const trackSearch = (search: {
  brand?: string;
  model?: string;
  priceMin?: number;
  priceMax?: number;
  fuel?: string;
  gearbox?: string;
  bodyType?: string;
  yearMin?: number;
  yearMax?: number;
}): void => {
  behaviorService.trackSearch(search);
};

/**
 * Track interaction for recommendations
 */
export const trackInteraction = (
  carId: string,
  type: 'favorite' | 'contact' | 'share' | 'compare' | 'print'
): void => {
  behaviorService.trackInteraction(carId, type);
  
  // Invalidate cache for significant interactions
  if (type === 'favorite' || type === 'contact') {
    cacheService.invalidate(undefined, behaviorService.getSessionId());
  }
};

// ============================================================================
// EXPORT
// ============================================================================

export default {
  getRecommendations,
  refreshRecommendations,
  trackCarView,
  trackSearch,
  trackInteraction
};
