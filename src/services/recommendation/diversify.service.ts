/**
 * 🎲 Diversification Service
 * Ensures recommendation variety
 * 
 * @description Prevents filter bubbles by ensuring diverse recommendations
 * @features
 * - 60% High Match (personalized)
 * - 25% Exploration (slightly different)
 * - 15% Discovery (completely new)
 * - Brand affinity enforcement
 * - Anti-repetition logic
 * 
 * @version 1.0.0
 */

import { logger } from '../logger-service';

import { 
  CarMetadata, 
  ScoreBreakdown,
  BrandAffinity,
  ScoringConfig
} from './types';

// ============================================================================
// CONFIGURATION
// ============================================================================

const DEFAULT_DIVERSIFICATION = {
  highMatch: 0.60,
  exploration: 0.25,
  discovery: 0.15
};

const ANTI_BUBBLE_CONFIG = {
  maxSameBrand: 3,           // Max cars from same brand
  maxSameBodyType: 4,        // Max cars of same body type
  maxSamePriceRange: 5,      // Max cars in same price range (±20%)
  freshListingBoost: 1.5,    // Boost for listings < 24h old
  recentlyShownPenalty: 0.5, // Penalty for recently shown cars
  recentlyShownWindow: 3 * 24 * 60 * 60 * 1000 // 3 days
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get price range category
 */
const getPriceRange = (price: number): string => {
  if (price < 5000) return 'budget';
  if (price < 15000) return 'economy';
  if (price < 30000) return 'mid-range';
  if (price < 50000) return 'premium';
  return 'luxury';
};

/**
 * Check if car was recently shown
 */
const wasRecentlyShown = (carId: string): boolean => {
  try {
    const shown = localStorage.getItem('koli_one_recently_shown');
    if (!shown) return false;
    
    const shownCars: Array<{ carId: string; timestamp: number }> = JSON.parse(shown);
    const now = Date.now();
    
    return shownCars.some(
      s => s.carId === carId && (now - s.timestamp) < ANTI_BUBBLE_CONFIG.recentlyShownWindow
    );
  } catch {
    return false;
  }
};

/**
 * Mark car as shown
 */
const markAsShown = (carIds: string[]): void => {
  try {
    const shown = localStorage.getItem('koli_one_recently_shown');
    let shownCars: Array<{ carId: string; timestamp: number }> = shown ? JSON.parse(shown) : [];
    
    const now = Date.now();
    
    // Add new cars
    carIds.forEach(carId => {
      if (!shownCars.some(s => s.carId === carId)) {
        shownCars.push({ carId, timestamp: now });
      }
    });
    
    // Remove old entries (older than window)
    shownCars = shownCars.filter(
      s => (now - s.timestamp) < ANTI_BUBBLE_CONFIG.recentlyShownWindow
    );
    
    // Keep only last 100
    shownCars = shownCars.slice(-100);
    
    localStorage.setItem('koli_one_recently_shown', JSON.stringify(shownCars));
  } catch (err) {
    logger.error('[DiversifyService] Failed to mark cars as shown:', err);
  }
};

// ============================================================================
// DIVERSIFICATION FUNCTIONS
// ============================================================================

/**
 * Categorize cars by match type
 */
const categorizeCars = (
  scoredCars: Array<{ car: CarMetadata; breakdown: ScoreBreakdown }>,
  _config: typeof DEFAULT_DIVERSIFICATION = DEFAULT_DIVERSIFICATION
): {
  highMatch: Array<{ car: CarMetadata; breakdown: ScoreBreakdown }>;
  exploration: Array<{ car: CarMetadata; breakdown: ScoreBreakdown }>;
  discovery: Array<{ car: CarMetadata; breakdown: ScoreBreakdown }>;
} => {
  // Calculate thresholds based on score distribution
  const scores = scoredCars.map(s => s.breakdown.finalScore);
  const maxScore = Math.max(...scores);
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  
  const highMatchThreshold = avgScore + (maxScore - avgScore) * 0.3;
  const explorationThreshold = avgScore * 0.7;
  
  const highMatch = scoredCars.filter(s => s.breakdown.finalScore >= highMatchThreshold);
  const exploration = scoredCars.filter(
    s => s.breakdown.finalScore < highMatchThreshold && s.breakdown.finalScore >= explorationThreshold
  );
  const discovery = scoredCars.filter(s => s.breakdown.finalScore < explorationThreshold);
  
  logger.debug('[DiversifyService] Categorized cars', {
    highMatch: highMatch.length,
    exploration: exploration.length,
    discovery: discovery.length,
    thresholds: { highMatchThreshold, explorationThreshold }
  });
  
  return { highMatch, exploration, discovery };
};

/**
 * Apply anti-bubble filtering
 */
const applyAntiBubble = (
  cars: Array<{ car: CarMetadata; breakdown: ScoreBreakdown }>
): Array<{ car: CarMetadata; breakdown: ScoreBreakdown }> => {
  const result: Array<{ car: CarMetadata; breakdown: ScoreBreakdown }> = [];
  const brandCounts: Record<string, number> = {};
  const bodyTypeCounts: Record<string, number> = {};
  const priceRangeCounts: Record<string, number> = {};
  
  for (const item of cars) {
    const brand = item.car.brand.toLowerCase();
    const bodyType = item.car.bodyType.toLowerCase();
    const priceRange = getPriceRange(item.car.price);
    
    // Check limits
    const brandCount = brandCounts[brand] || 0;
    const bodyCount = bodyTypeCounts[bodyType] || 0;
    const priceCount = priceRangeCounts[priceRange] || 0;
    
    // Skip if too many of same type
    if (brandCount >= ANTI_BUBBLE_CONFIG.maxSameBrand) continue;
    if (bodyCount >= ANTI_BUBBLE_CONFIG.maxSameBodyType) continue;
    if (priceCount >= ANTI_BUBBLE_CONFIG.maxSamePriceRange) continue;
    
    // Apply recently shown penalty
    if (wasRecentlyShown(item.car.carId)) {
      item.breakdown.finalScore *= ANTI_BUBBLE_CONFIG.recentlyShownPenalty;
    }
    
    // Add to result
    result.push(item);
    
    // Update counts
    brandCounts[brand] = brandCount + 1;
    bodyTypeCounts[bodyType] = bodyCount + 1;
    priceRangeCounts[priceRange] = priceCount + 1;
  }
  
  return result;
};

/**
 * Apply brand affinity enforcement
 * Ensures dominant brand appears in top positions
 */
const applyAffinityEnforcement = (
  cars: Array<{ car: CarMetadata; breakdown: ScoreBreakdown; category: string }>,
  affinities: BrandAffinity[],
  affinityThreshold = 60
): Array<{ car: CarMetadata; breakdown: ScoreBreakdown; category: string; isAffinityBoosted: boolean }> => {
  // Find dominant brand(s)
  const dominantBrands = affinities
    .filter(a => a.score >= affinityThreshold)
    .slice(0, 2)
    .map(a => a.brand.toLowerCase());
  
  if (dominantBrands.length === 0) {
    return cars.map(c => ({ ...c, isAffinityBoosted: false }));
  }
  
  logger.debug('[DiversifyService] Applying affinity enforcement', {
    dominantBrands,
    affinityScores: affinities.slice(0, 3).map(a => ({ brand: a.brand, score: a.score }))
  });
  
  // Separate dominant brand cars
  const dominantCars = cars.filter(
    c => dominantBrands.includes(c.car.brand.toLowerCase())
  );
  const otherCars = cars.filter(
    c => !dominantBrands.includes(c.car.brand.toLowerCase())
  );
  
  // Take top 2-3 dominant cars for the front
  const frontCars = dominantCars.slice(0, dominantBrands.length === 2 ? 3 : 2);
  const remainingDominant = dominantCars.slice(frontCars.length);
  
  // Mark affinity boosted cars
  const boostedFront = frontCars.map(c => ({ ...c, isAffinityBoosted: true }));
  const boostedRemaining = remainingDominant.map(c => ({ ...c, isAffinityBoosted: true }));
  const unboostedOther = otherCars.map(c => ({ ...c, isAffinityBoosted: false }));
  
  // Merge: front dominant + interleaved others + remaining dominant
  const result: Array<{ car: CarMetadata; breakdown: ScoreBreakdown; category: string; isAffinityBoosted: boolean }> = [];
  
  // Add front dominant cars
  result.push(...boostedFront);
  
  // Interleave remaining
  const remaining = [...boostedRemaining, ...unboostedOther];
  remaining.sort((a, b) => b.breakdown.finalScore - a.breakdown.finalScore);
  result.push(...remaining);
  
  return result;
};

// ============================================================================
// MAIN DIVERSIFICATION FUNCTION
// ============================================================================

/**
 * Diversify recommendations
 * Applies all diversification rules and returns final list
 */
export const diversifyRecommendations = (
  scoredCars: Array<{ car: CarMetadata; breakdown: ScoreBreakdown }>,
  affinities: BrandAffinity[],
  targetCount = 12,
  config: ScoringConfig['diversification'] = DEFAULT_DIVERSIFICATION
): {
  cars: Array<{
    car: CarMetadata;
    breakdown: ScoreBreakdown;
    category: 'high_match' | 'exploration' | 'discovery' | 'affinity_boost';
    isAffinityBoosted: boolean;
    position: number;
  }>;
  stats: {
    highMatchCount: number;
    explorationCount: number;
    discoveryCount: number;
    affinityBoostCount: number;
  };
} => {
  // Step 1: Categorize by match type
  const { highMatch, exploration, discovery } = categorizeCars(scoredCars, config);
  
  // Step 2: Calculate target counts for each category
  const highMatchTarget = Math.round(targetCount * config.highMatch);
  const explorationTarget = Math.round(targetCount * config.exploration);
  const discoveryTarget = targetCount - highMatchTarget - explorationTarget;
  
  // Step 3: Apply anti-bubble to each category
  const filteredHighMatch = applyAntiBubble(highMatch).slice(0, highMatchTarget);
  const filteredExploration = applyAntiBubble(exploration).slice(0, explorationTarget);
  const filteredDiscovery = applyAntiBubble(discovery).slice(0, discoveryTarget);
  
  // Step 4: Combine with categories
  const combined = [
    ...filteredHighMatch.map(c => ({ ...c, category: 'high_match' as const })),
    ...filteredExploration.map(c => ({ ...c, category: 'exploration' as const })),
    ...filteredDiscovery.map(c => ({ ...c, category: 'discovery' as const }))
  ];
  
  // Step 5: Apply affinity enforcement
  const withAffinity = applyAffinityEnforcement(combined, affinities);
  
  // Step 6: Add positions
  const final = withAffinity.slice(0, targetCount).map((c, index) => ({
    ...c,
    category: c.isAffinityBoosted && index < 3 ? 'affinity_boost' as const : c.category,
    position: index + 1
  }));
  
  // Step 7: Mark as shown for anti-repetition
  markAsShown(final.map(c => c.car.carId));
  
  // Calculate stats
  const stats = {
    highMatchCount: final.filter(c => c.category === 'high_match').length,
    explorationCount: final.filter(c => c.category === 'exploration').length,
    discoveryCount: final.filter(c => c.category === 'discovery').length,
    affinityBoostCount: final.filter(c => c.isAffinityBoosted).length
  };
  
  logger.info('[DiversifyService] Diversified recommendations', {
    input: scoredCars.length,
    output: final.length,
    stats
  });
  
  return { cars: final, stats };
};

export default { diversifyRecommendations };
