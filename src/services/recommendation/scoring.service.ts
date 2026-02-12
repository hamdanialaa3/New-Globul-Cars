/**
 * 🎯 Scoring Algorithm Service
 * Bulgarian Market Optimized Scoring
 * 
 * @description Calculates recommendation scores based on user preferences,
 *              behavioral signals, and market trends
 * @version 1.0.0
 */

import { logger } from '../logger-service';

import { 
  UserBehavior, 
  SessionBehavior,
  CarMetadata, 
  MarketTrends,
  ScoreBreakdown,
  ScoringConfig,
  BrandAffinity
} from './types';

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const DEFAULT_CONFIG: ScoringConfig = {
  weights: {
    userMatch: 0.45,
    behavioral: 0.35,
    market: 0.20
  },
  brandBoosts: {
    german: 15,    // BMW, Mercedes, Audi, VW
    japanese: 10,  // Toyota, Honda, Mazda
    french: -10,   // Peugeot, Renault, Citroën (less popular in Bulgaria)
    korean: 5,     // Hyundai, Kia
    american: 0    // Ford, Chevrolet
  },
  affinityThreshold: 60,
  maxAffinityBoost: 100,
  diversification: {
    highMatch: 0.60,
    exploration: 0.25,
    discovery: 0.15
  }
};

// ============================================================================
// BRAND CATEGORIES (Bulgarian Market)
// ============================================================================

const GERMAN_BRANDS = ['bmw', 'mercedes', 'mercedes-benz', 'audi', 'volkswagen', 'vw', 'porsche', 'opel'];
const JAPANESE_BRANDS = ['toyota', 'honda', 'mazda', 'nissan', 'mitsubishi', 'suzuki', 'subaru', 'lexus'];
const FRENCH_BRANDS = ['peugeot', 'renault', 'citroën', 'citroen', 'dacia'];
const KOREAN_BRANDS = ['hyundai', 'kia', 'genesis'];
// American brands kept for future use
// const AMERICAN_BRANDS = ['ford', 'chevrolet', 'jeep', 'dodge', 'cadillac'];

// Popular year range in Bulgaria (2014-2020 sweet spot)
const POPULAR_YEAR_MIN = 2014;
const POPULAR_YEAR_MAX = 2020;

// ============================================================================
// SCORING FUNCTIONS
// ============================================================================

/**
 * Calculate User Match Score (0-100)
 * How well the car matches user's explicit preferences
 */
const calculateUserMatchScore = (
  car: CarMetadata,
  behavior: UserBehavior | SessionBehavior,
  config: ScoringConfig
): { score: number; factors: Array<{ name: string; value: number; reason: string }> } => {
  let score = 0;
  const factors: Array<{ name: string; value: number; reason: string }> = [];
  
  // Get preferences
  const preferences = 'preferences' in behavior ? behavior.preferences : null;
  const searches = 'searches' in behavior ? behavior.searches : behavior.filtersUsed;
  
  // Brand match
  if (preferences?.preferredBrands?.length) {
    const brandLower = car.brand.toLowerCase();
    if (preferences.preferredBrands.some(b => b.toLowerCase() === brandLower)) {
      score += 30;
      factors.push({ name: 'brand_match', value: 30, reason: 'Matches preferred brand' });
    }
  }
  
  // Search history brand match
  const searchedBrands = searches
    .filter((s): s is typeof s & { brand: string } => Boolean(s.brand))
    .map(s => s.brand.toLowerCase());
  if (searchedBrands.includes(car.brand.toLowerCase())) {
    score += 10;
    factors.push({ name: 'searched_brand', value: 10, reason: 'Previously searched brand' });
  }
  
  // Price range match
  if (preferences?.priceRange) {
    const { min, max } = preferences.priceRange;
    if (car.price >= min * 0.8 && car.price <= max * 1.2) {
      score += 20;
      factors.push({ name: 'price_match', value: 20, reason: 'Within price range' });
    }
  }
  
  // Fuel type match
  if (preferences?.fuelTypes?.length) {
    if (preferences.fuelTypes.some(f => f.toLowerCase() === car.fuel.toLowerCase())) {
      score += 15;
      factors.push({ name: 'fuel_match', value: 15, reason: 'Matches fuel preference' });
    }
  }
  
  // Gearbox match
  if (preferences?.gearboxTypes?.length) {
    if (preferences.gearboxTypes.some(g => g.toLowerCase() === car.gearbox.toLowerCase())) {
      score += 10;
      factors.push({ name: 'gearbox_match', value: 10, reason: 'Matches gearbox preference' });
    }
  }
  
  // Body type match
  if (preferences?.bodyTypes?.length) {
    if (preferences.bodyTypes.some(b => b.toLowerCase() === car.bodyType.toLowerCase())) {
      score += 15;
      factors.push({ name: 'body_match', value: 15, reason: 'Matches body type' });
    }
  }
  
  // Bulgarian market brand boost
  const brandLower = car.brand.toLowerCase();
  if (GERMAN_BRANDS.includes(brandLower)) {
    score += config.brandBoosts.german;
    if (config.brandBoosts.german > 0) {
      factors.push({ name: 'german_boost', value: config.brandBoosts.german, reason: 'German brand (popular in BG)' });
    }
  } else if (JAPANESE_BRANDS.includes(brandLower)) {
    score += config.brandBoosts.japanese;
    if (config.brandBoosts.japanese > 0) {
      factors.push({ name: 'japanese_boost', value: config.brandBoosts.japanese, reason: 'Japanese brand (reliable)' });
    }
  } else if (FRENCH_BRANDS.includes(brandLower)) {
    score += config.brandBoosts.french;
    // No factor for negative boost
  } else if (KOREAN_BRANDS.includes(brandLower)) {
    score += config.brandBoosts.korean;
    if (config.brandBoosts.korean > 0) {
      factors.push({ name: 'korean_boost', value: config.brandBoosts.korean, reason: 'Korean brand (good value)' });
    }
  }
  
  return { score: Math.min(Math.max(score, 0), 100), factors };
};

/**
 * Calculate Behavioral Score (0-100)
 * Based on user's interaction history
 */
const calculateBehavioralScore = (
  car: CarMetadata,
  behavior: UserBehavior | SessionBehavior
): { score: number; factors: Array<{ name: string; value: number; reason: string }> } => {
  let score = 0;
  const factors: Array<{ name: string; value: number; reason: string }> = [];
  
  const views = 'views' in behavior ? behavior.views : behavior.viewedCars;
  const favorites = 'favorites' in behavior ? behavior.favorites : [];
  const interactions = 'interactions' in behavior ? behavior.interactions : [];
  
  // Similar car views
  const similarViews = views.filter(v => 
    v.brand.toLowerCase() === car.brand.toLowerCase() ||
    (v.bodyType && v.bodyType.toLowerCase() === car.bodyType.toLowerCase())
  );
  
  if (similarViews.length > 0) {
    const viewScore = Math.min(similarViews.length * 10, 40);
    score += viewScore;
    factors.push({ name: 'similar_views', value: viewScore, reason: `Viewed ${similarViews.length} similar cars` });
  }
  
  // Same brand repeated views (3+ in 24h)
  const brandViews = views.filter(v => 
    v.brand.toLowerCase() === car.brand.toLowerCase() &&
    Date.now() - v.timestamp < 24 * 60 * 60 * 1000
  );
  
  if (brandViews.length >= 3) {
    score += 30;
    factors.push({ name: 'brand_interest', value: 30, reason: 'High interest in this brand' });
  }
  
  // Favorited similar cars
  const favoritedBrands = favorites.map(carId => {
    const view = views.find(v => v.carId === carId);
    return view?.brand?.toLowerCase();
  }).filter(Boolean);
  
  if (favoritedBrands.includes(car.brand.toLowerCase())) {
    score += 30;
    factors.push({ name: 'favorited_brand', value: 30, reason: 'Favorited cars from this brand' });
  }
  
  // Contacted similar cars
  const contactedBrands = interactions
    .filter(i => i.type === 'contact')
    .map(i => {
      const view = views.find(v => v.carId === i.carId);
      return view?.brand?.toLowerCase();
    })
    .filter(Boolean);
  
  if (contactedBrands.includes(car.brand.toLowerCase())) {
    score += 30;
    factors.push({ name: 'contacted_brand', value: 30, reason: 'Contacted about this brand' });
  }
  
  return { score: Math.min(Math.max(score, 0), 100), factors };
};

/**
 * Calculate Market Score (0-100)
 * Based on market trends and popularity
 */
const calculateMarketScore = (
  car: CarMetadata,
  trends: MarketTrends | null
): { score: number; factors: Array<{ name: string; value: number; reason: string }> } => {
  let score = 0;
  const factors: Array<{ name: string; value: number; reason: string }> = [];
  
  // Trending car
  if (trends?.trendingCars) {
    const trending = trends.trendingCars.find(t => t.carId === car.carId);
    if (trending) {
      score += 40;
      factors.push({ name: 'trending', value: 40, reason: 'Trending car' });
    }
  }
  
  // Trending brand
  if (trends?.trendingBrands) {
    const trendingBrand = trends.trendingBrands.find(
      b => b.brand.toLowerCase() === car.brand.toLowerCase()
    );
    if (trendingBrand) {
      score += 30;
      factors.push({ name: 'trending_brand', value: 30, reason: 'Trending brand' });
    }
  }
  
  // Fast selling model
  if (trends?.fastSellingModels) {
    const fastSelling = trends.fastSellingModels.find(
      m => m.brand.toLowerCase() === car.brand.toLowerCase() &&
           m.model.toLowerCase() === car.model.toLowerCase()
    );
    if (fastSelling) {
      score += 20;
      factors.push({ name: 'fast_selling', value: 20, reason: 'Fast selling model' });
    }
  }
  
  // Popular year range (2014-2020 in Bulgaria)
  if (car.year >= POPULAR_YEAR_MIN && car.year <= POPULAR_YEAR_MAX) {
    score += 10;
    factors.push({ name: 'popular_year', value: 10, reason: 'Popular year range' });
  }
  
  // Popularity score from car metadata
  if (car.popularityScore > 70) {
    score += 15;
    factors.push({ name: 'high_popularity', value: 15, reason: 'High popularity score' });
  }
  
  // Quality score bonus
  if (car.qualityScore > 80) {
    score += 10;
    factors.push({ name: 'high_quality', value: 10, reason: 'High quality listing' });
  }
  
  // Price drop bonus
  if (car.priceDropped && car.priceDropAmount && car.priceDropAmount > 500) {
    score += 15;
    factors.push({ name: 'price_drop', value: 15, reason: 'Recent price drop' });
  }
  
  // New listing bonus
  const hoursSinceCreation = (Date.now() - car.createdAt) / (1000 * 60 * 60);
  if (hoursSinceCreation < 24) {
    score += 20;
    factors.push({ name: 'new_listing', value: 20, reason: 'New listing' });
  } else if (hoursSinceCreation < 72) {
    score += 10;
    factors.push({ name: 'recent_listing', value: 10, reason: 'Recent listing' });
  }
  
  return { score: Math.min(Math.max(score, 0), 100), factors };
};

/**
 * Calculate Brand Affinity Bonus (0-100)
 */
const calculateAffinityBonus = (
  car: CarMetadata,
  affinities: BrandAffinity[],
  config: ScoringConfig
): { bonus: number; isAffinityBoosted: boolean } => {
  const brandLower = car.brand.toLowerCase();
  const affinity = affinities.find(a => a.brand.toLowerCase() === brandLower);
  
  if (affinity && affinity.score >= config.affinityThreshold) {
    return {
      bonus: Math.min(affinity.score, config.maxAffinityBoost),
      isAffinityBoosted: true
    };
  }
  
  return { bonus: 0, isAffinityBoosted: false };
};

// ============================================================================
// MAIN SCORING FUNCTION
// ============================================================================

/**
 * Calculate final score for a car
 */
export const calculateScore = (
  car: CarMetadata,
  behavior: UserBehavior | SessionBehavior,
  affinities: BrandAffinity[],
  trends: MarketTrends | null,
  config: ScoringConfig = DEFAULT_CONFIG
): ScoreBreakdown => {
  // Calculate component scores
  const userMatch = calculateUserMatchScore(car, behavior, config);
  const behavioral = calculateBehavioralScore(car, behavior);
  const market = calculateMarketScore(car, trends);
  const affinity = calculateAffinityBonus(car, affinities, config);
  
  // Calculate weighted final score
  const weightedScore = 
    userMatch.score * config.weights.userMatch +
    behavioral.score * config.weights.behavioral +
    market.score * config.weights.market;
  
  // Add affinity bonus (additive, not weighted)
  const finalScore = Math.min(weightedScore + affinity.bonus * 0.3, 100);
  
  // Combine all factors
  const allFactors = [
    ...userMatch.factors,
    ...behavioral.factors,
    ...market.factors
  ];
  
  if (affinity.isAffinityBoosted) {
    allFactors.push({
      name: 'affinity_boost',
      value: affinity.bonus,
      reason: 'Brand affinity bonus'
    });
  }
  
  return {
    userMatchScore: userMatch.score,
    behavioralScore: behavioral.score,
    marketScore: market.score,
    brandAffinityBonus: affinity.bonus,
    finalScore,
    factors: allFactors
  };
};

/**
 * Score multiple cars and sort by score
 */
export const scoreAndRankCars = (
  cars: CarMetadata[],
  behavior: UserBehavior | SessionBehavior,
  affinities: BrandAffinity[],
  trends: MarketTrends | null,
  config: ScoringConfig = DEFAULT_CONFIG
): Array<{ car: CarMetadata; breakdown: ScoreBreakdown }> => {
  const scored = cars.map(car => ({
    car,
    breakdown: calculateScore(car, behavior, affinities, trends, config)
  }));
  
  // Sort by final score descending
  scored.sort((a, b) => b.breakdown.finalScore - a.breakdown.finalScore);
  
  logger.debug('[ScoringService] Scored and ranked cars', {
    total: cars.length,
    topScore: scored[0]?.breakdown.finalScore,
    bottomScore: scored[scored.length - 1]?.breakdown.finalScore
  });
  
  return scored;
};

export { DEFAULT_CONFIG };
export default { calculateScore, scoreAndRankCars, DEFAULT_CONFIG };
