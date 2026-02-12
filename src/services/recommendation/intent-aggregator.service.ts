/**
 * 🧠 Intent Aggregator Service
 * Combines all intent signals into unified user preferences
 * 
 * @description Aggregates:
 * - External intent (Google, Bing, social, ads)
 * - Cross-platform tracking (GA4, Meta Pixel)
 * - Internal behavior (searches, views, favorites, contacts)
 * - Session behavior (real-time actions)
 * 
 * @version 1.0.0
 */

import { logger } from '../logger-service';

import { externalIntentService, ExternalIntentPreferences } from './external-intent.service';
import { crossPlatformTracker } from './cross-platform.service';
import { behaviorService } from './behavior.service';
import { UserBehavior } from './types';

// ============================================================================
// TYPES
// ============================================================================

export interface UnifiedIntent {
  // Brand preferences (weighted by source)
  brands: BrandPreference[];
  
  // Body type preferences
  bodyTypes: Array<{ type: string; weight: number; sources: string[] }>;
  
  // Price range (aggregated from all sources)
  priceRange: {
    min?: number;
    max?: number;
    confidence: 'low' | 'medium' | 'high';
  };
  
  // Year range
  yearRange: {
    min?: number;
    max?: number;
    confidence: 'low' | 'medium' | 'high';
  };
  
  // Technical preferences
  preferredFuel?: string;
  preferredGearbox?: string;
  preferredColor?: string;
  
  // Keywords from all sources
  keywords: Array<{ word: string; weight: number; sources: string[] }>;
  
  // Intent strength (how confident we are in the preferences)
  confidence: number; // 0-100
  
  // Data freshness
  lastUpdated: number;
  dataPoints: number;
}

export interface BrandPreference {
  brand: string;
  weight: number;           // 0-100 normalized
  sources: string[];        // ['external', 'internal', 'crossPlatform']
  breakdown: {
    externalSearches: number;
    adClicks: number;
    internalViews: number;
    internalClicks: number;
    favorites: number;
    contacts: number;
  };
}

// ============================================================================
// CONSTANTS
// ============================================================================

// Weight multipliers for different signal sources
const SOURCE_WEIGHTS = {
  // External signals (Google, Bing, etc.)
  externalSearch: 2.5,      // High intent - they searched externally
  adClick: 3.0,             // Very high - clicked an ad
  socialReferral: 1.5,      // Medium - came from social
  
  // Cross-platform signals
  pageView: 0.3,            // Low - just viewed
  carView: 1.0,             // Medium - viewed a car
  carClick: 2.0,            // High - clicked for details
  favorite: 4.0,            // Very high - saved
  contact: 6.0,             // Highest - wants to buy
  
  // Internal search
  internalSearch: 1.5,      // Medium - searched on site
  filterApply: 1.2          // Medium - applied filters
};

// Decay rate for older signals (per day)
const DECAY_RATE = 0.95;

// Minimum weight threshold to include preference
const MIN_WEIGHT_THRESHOLD = 0.5;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate time-based decay
 */
const calculateDecay = (timestamp: number): number => {
  const daysSince = (Date.now() - timestamp) / (24 * 60 * 60 * 1000);
  return Math.pow(DECAY_RATE, daysSince);
};

/**
 * Normalize brand name
 */
const normalizeBrand = (brand: string): string => {
  const mapping: Record<string, string> = {
    'vw': 'volkswagen',
    'bmw': 'bmw',
    'mb': 'mercedes-benz',
    'merc': 'mercedes-benz',
    'mercedes': 'mercedes-benz',
    'chevy': 'chevrolet'
  };
  
  const lower = brand.toLowerCase().trim();
  return mapping[lower] || lower;
};

/**
 * Normalize body type
 */
const normalizeBodyType = (type: string): string => {
  const mapping: Record<string, string> = {
    'suv': 'suv',
    'jeep': 'suv',
    '4x4': 'suv',
    'sedan': 'sedan',
    'saloon': 'sedan',
    'limo': 'sedan',
    'hatchback': 'hatchback',
    'hatch': 'hatchback',
    'estate': 'estate',
    'wagon': 'estate',
    'kombi': 'estate',
    'coupe': 'coupe',
    'cabrio': 'cabrio',
    'convertible': 'cabrio',
    'van': 'van',
    'minivan': 'van',
    'pickup': 'pickup',
    'truck': 'pickup'
  };
  
  const lower = type.toLowerCase().trim();
  return mapping[lower] || lower;
};

// ============================================================================
// MAIN SERVICE CLASS
// ============================================================================

class IntentAggregatorService {
  private cachedIntent: UnifiedIntent | null = null;
  private cacheExpiry = 0;
  private readonly CACHE_TTL = 2 * 60 * 1000; // 2 minutes
  
  /**
   * Get unified intent from all sources
   */
  async getUnifiedIntent(forceRefresh = false): Promise<UnifiedIntent> {
    // Check cache
    if (!forceRefresh && this.cachedIntent && Date.now() < this.cacheExpiry) {
      return this.cachedIntent;
    }
    
    const startTime = performance.now();
    
    try {
      // Gather all intent signals
      const [externalPrefs, crossPlatformPrefs, internalBehavior] = await Promise.all([
        this.getExternalPreferences(),
        this.getCrossPlatformPreferences(),
        this.getInternalBehavior()
      ]);
      
      // Aggregate brand preferences
      const brands = this.aggregateBrandPreferences(
        externalPrefs,
        crossPlatformPrefs,
        internalBehavior
      );
      
      // Aggregate body types
      const bodyTypes = this.aggregateBodyTypes(externalPrefs, internalBehavior);
      
      // Aggregate price range
      const priceRange = this.aggregatePriceRange(externalPrefs, internalBehavior);
      
      // Aggregate year range
      const yearRange = this.aggregateYearRange(externalPrefs, internalBehavior);
      
      // Aggregate keywords
      const keywords = this.aggregateKeywords(externalPrefs, internalBehavior);
      
      // Calculate confidence
      const dataPoints = 
        externalPrefs.brands.length +
        crossPlatformPrefs.length +
        (internalBehavior?.viewedBrands.size || 0);
      
      const confidence = Math.min(100, Math.round(dataPoints * 5));
      
      // Build unified intent
      this.cachedIntent = {
        brands,
        bodyTypes,
        priceRange,
        yearRange,
        preferredFuel: externalPrefs.preferredFuel || internalBehavior?.preferredFuel,
        preferredGearbox: externalPrefs.preferredGearbox || internalBehavior?.preferredGearbox,
        keywords,
        confidence,
        lastUpdated: Date.now(),
        dataPoints
      };
      
      this.cacheExpiry = Date.now() + this.CACHE_TTL;
      
      const elapsed = performance.now() - startTime;
      logger.info('[IntentAggregator] Unified intent computed', {
        brandsCount: brands.length,
        confidence,
        dataPoints,
        elapsed: `${elapsed.toFixed(2)}ms`
      });
      
      return this.cachedIntent;
      
    } catch (err) {
      logger.error('[IntentAggregator] Failed to aggregate intent:', err);
      
      // Return empty intent
      return this.getEmptyIntent();
    }
  }
  
  /**
   * Get external preferences (wrapped for error handling)
   */
  private async getExternalPreferences(): Promise<ExternalIntentPreferences> {
    try {
      return externalIntentService.getAggregatedPreferences();
    } catch {
      return {
        brands: [],
        bodyTypes: [],
        keywords: []
      };
    }
  }
  
  /**
   * Get cross-platform preferences
   */
  private async getCrossPlatformPreferences(): Promise<Array<{ brand: string; score: number }>> {
    try {
      return crossPlatformTracker.getBrandPreferences();
    } catch {
      return [];
    }
  }
  
  /**
   * Get internal behavior
   */
  private async getInternalBehavior(): Promise<UserBehavior | null> {
    try {
      return behaviorService.getUserBehavior();
    } catch {
      return null;
    }
  }
  
  /**
   * Aggregate brand preferences from all sources
   */
  private aggregateBrandPreferences(
    external: ExternalIntentPreferences,
    crossPlatform: Array<{ brand: string; score: number; views?: number; clicks?: number; favorites?: number; contacts?: number }>,
    internal: UserBehavior | null
  ): BrandPreference[] {
    const brandScores: Record<string, {
      weight: number;
      sources: Set<string>;
      breakdown: BrandPreference['breakdown'];
    }> = {};
    
    // Process external brands
    for (const item of external.brands) {
      const brand = normalizeBrand(item.brand);
      if (!brandScores[brand]) {
        brandScores[brand] = {
          weight: 0,
          sources: new Set(),
          breakdown: { externalSearches: 0, adClicks: 0, internalViews: 0, internalClicks: 0, favorites: 0, contacts: 0 }
        };
      }
      
      const decayedWeight = item.frequency * SOURCE_WEIGHTS.externalSearch * calculateDecay(item.recency);
      brandScores[brand].weight += decayedWeight;
      brandScores[brand].sources.add('external');
      brandScores[brand].breakdown.externalSearches += item.frequency;
    }
    
    // Process cross-platform brands
    for (const item of crossPlatform) {
      const brand = normalizeBrand(item.brand);
      if (!brandScores[brand]) {
        brandScores[brand] = {
          weight: 0,
          sources: new Set(),
          breakdown: { externalSearches: 0, adClicks: 0, internalViews: 0, internalClicks: 0, favorites: 0, contacts: 0 }
        };
      }
      
      brandScores[brand].weight += item.score;
      brandScores[brand].sources.add('crossPlatform');
      brandScores[brand].breakdown.internalViews += item.views || 0;
      brandScores[brand].breakdown.internalClicks += item.clicks || 0;
      brandScores[brand].breakdown.favorites += item.favorites || 0;
      brandScores[brand].breakdown.contacts += item.contacts || 0;
    }
    
    // Process internal behavior
    if (internal) {
      // Viewed brands
      for (const [brand, count] of internal.viewedBrands.entries()) {
        const normalized = normalizeBrand(brand);
        if (!brandScores[normalized]) {
          brandScores[normalized] = {
            weight: 0,
            sources: new Set(),
            breakdown: { externalSearches: 0, adClicks: 0, internalViews: 0, internalClicks: 0, favorites: 0, contacts: 0 }
          };
        }
        
        brandScores[normalized].weight += count * SOURCE_WEIGHTS.carView;
        brandScores[normalized].sources.add('internal');
        brandScores[normalized].breakdown.internalViews += count;
      }
      
      // Contacted brands
      for (const [brand, count] of internal.contactedBrands.entries()) {
        const normalized = normalizeBrand(brand);
        if (!brandScores[normalized]) {
          brandScores[normalized] = {
            weight: 0,
            sources: new Set(),
            breakdown: { externalSearches: 0, adClicks: 0, internalViews: 0, internalClicks: 0, favorites: 0, contacts: 0 }
          };
        }
        
        brandScores[normalized].weight += count * SOURCE_WEIGHTS.contact;
        brandScores[normalized].sources.add('internal');
        brandScores[normalized].breakdown.contacts += count;
      }
      
      // Favorite brands
      for (const [brand, count] of internal.favoriteBrands.entries()) {
        const normalized = normalizeBrand(brand);
        if (!brandScores[normalized]) {
          brandScores[normalized] = {
            weight: 0,
            sources: new Set(),
            breakdown: { externalSearches: 0, adClicks: 0, internalViews: 0, internalClicks: 0, favorites: 0, contacts: 0 }
          };
        }
        
        brandScores[normalized].weight += count * SOURCE_WEIGHTS.favorite;
        brandScores[normalized].sources.add('internal');
        brandScores[normalized].breakdown.favorites += count;
      }
    }
    
    // Normalize weights and convert to array
    const maxWeight = Math.max(...Object.values(brandScores).map(b => b.weight), 1);
    
    return Object.entries(brandScores)
      .filter(([, data]) => data.weight >= MIN_WEIGHT_THRESHOLD)
      .map(([brand, data]) => ({
        brand,
        weight: Math.round((data.weight / maxWeight) * 100),
        sources: Array.from(data.sources),
        breakdown: data.breakdown
      }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 10); // Top 10 brands
  }
  
  /**
   * Aggregate body type preferences
   */
  private aggregateBodyTypes(
    external: ExternalIntentPreferences,
    internal: UserBehavior | null
  ): UnifiedIntent['bodyTypes'] {
    const bodyTypeScores: Record<string, { weight: number; sources: Set<string> }> = {};
    
    // External body types
    for (const item of external.bodyTypes) {
      const type = normalizeBodyType(item.bodyType);
      if (!bodyTypeScores[type]) {
        bodyTypeScores[type] = { weight: 0, sources: new Set() };
      }
      bodyTypeScores[type].weight += item.frequency * SOURCE_WEIGHTS.externalSearch;
      bodyTypeScores[type].sources.add('external');
    }
    
    // Internal body types
    if (internal?.viewedBodyTypes) {
      for (const [type, count] of internal.viewedBodyTypes.entries()) {
        const normalized = normalizeBodyType(type);
        if (!bodyTypeScores[normalized]) {
          bodyTypeScores[normalized] = { weight: 0, sources: new Set() };
        }
        bodyTypeScores[normalized].weight += count * SOURCE_WEIGHTS.carView;
        bodyTypeScores[normalized].sources.add('internal');
      }
    }
    
    return Object.entries(bodyTypeScores)
      .map(([type, data]) => ({
        type,
        weight: data.weight,
        sources: Array.from(data.sources)
      }))
      .sort((a, b) => b.weight - a.weight);
  }
  
  /**
   * Aggregate price range
   */
  private aggregatePriceRange(
    external: ExternalIntentPreferences,
    internal: UserBehavior | null
  ): UnifiedIntent['priceRange'] {
    const prices: { min?: number; max?: number; source: string }[] = [];
    
    if (external.priceRange) {
      prices.push({ ...external.priceRange, source: 'external' });
    }
    
    if (internal?.preferredPriceRange) {
      prices.push({ ...internal.preferredPriceRange, source: 'internal' });
    }
    
    if (prices.length === 0) {
      return { confidence: 'low' };
    }
    
    // Average all sources
    const mins = prices.filter(p => p.min !== undefined).map(p => p.min as number);
    const maxs = prices.filter(p => p.max !== undefined).map(p => p.max as number);
    
    return {
      min: mins.length > 0 ? Math.round(mins.reduce((a, b) => a + b, 0) / mins.length) : undefined,
      max: maxs.length > 0 ? Math.round(maxs.reduce((a, b) => a + b, 0) / maxs.length) : undefined,
      confidence: prices.length >= 2 ? 'high' : 'medium'
    };
  }
  
  /**
   * Aggregate year range
   */
  private aggregateYearRange(
    external: ExternalIntentPreferences,
    internal: UserBehavior | null
  ): UnifiedIntent['yearRange'] {
    const years: { min?: number; max?: number; source: string }[] = [];
    
    if (external.yearRange) {
      years.push({ ...external.yearRange, source: 'external' });
    }
    
    if (internal?.preferredYearRange) {
      years.push({ ...internal.preferredYearRange, source: 'internal' });
    }
    
    if (years.length === 0) {
      return { confidence: 'low' };
    }
    
    const mins = years.filter(y => y.min !== undefined).map(y => y.min as number);
    const maxs = years.filter(y => y.max !== undefined).map(y => y.max as number);
    
    return {
      min: mins.length > 0 ? Math.round(mins.reduce((a, b) => a + b, 0) / mins.length) : undefined,
      max: maxs.length > 0 ? Math.round(maxs.reduce((a, b) => a + b, 0) / maxs.length) : undefined,
      confidence: years.length >= 2 ? 'high' : 'medium'
    };
  }
  
  /**
   * Aggregate keywords from all sources
   */
  private aggregateKeywords(
    external: ExternalIntentPreferences,
    internal: UserBehavior | null
  ): UnifiedIntent['keywords'] {
    const keywordScores: Record<string, { weight: number; sources: Set<string> }> = {};
    
    // External keywords
    for (const item of external.keywords) {
      const word = item.keyword.toLowerCase();
      if (!keywordScores[word]) {
        keywordScores[word] = { weight: 0, sources: new Set() };
      }
      keywordScores[word].weight += item.frequency * SOURCE_WEIGHTS.externalSearch;
      keywordScores[word].sources.add('external');
    }
    
    // Internal search terms
    if (internal?.searchTerms) {
      for (const term of internal.searchTerms) {
        const words = term.toLowerCase().split(/\s+/).filter(w => w.length > 2);
        for (const word of words) {
          if (!keywordScores[word]) {
            keywordScores[word] = { weight: 0, sources: new Set() };
          }
          keywordScores[word].weight += SOURCE_WEIGHTS.internalSearch;
          keywordScores[word].sources.add('internal');
        }
      }
    }
    
    return Object.entries(keywordScores)
      .map(([word, data]) => ({
        word,
        weight: data.weight,
        sources: Array.from(data.sources)
      }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 20); // Top 20 keywords
  }
  
  /**
   * Get empty intent (fallback)
   */
  private getEmptyIntent(): UnifiedIntent {
    return {
      brands: [],
      bodyTypes: [],
      priceRange: { confidence: 'low' },
      yearRange: { confidence: 'low' },
      keywords: [],
      confidence: 0,
      lastUpdated: Date.now(),
      dataPoints: 0
    };
  }
  
  /**
   * Get top brand preferences
   */
  async getTopBrands(limit = 5): Promise<string[]> {
    const intent = await this.getUnifiedIntent();
    return intent.brands.slice(0, limit).map(b => b.brand);
  }
  
  /**
   * Get brand affinity score (0-100)
   */
  async getBrandAffinity(brand: string): Promise<number> {
    const intent = await this.getUnifiedIntent();
    const normalized = normalizeBrand(brand);
    const pref = intent.brands.find(b => b.brand === normalized);
    return pref?.weight || 0;
  }
  
  /**
   * Check if user has any intent signals
   */
  async hasIntentSignals(): Promise<boolean> {
    const intent = await this.getUnifiedIntent();
    return intent.dataPoints > 0;
  }
  
  /**
   * Force refresh cache
   */
  invalidateCache(): void {
    this.cachedIntent = null;
    this.cacheExpiry = 0;
    logger.debug('[IntentAggregator] Cache invalidated');
  }
}

// Export singleton
export const intentAggregator = new IntentAggregatorService();

// Named exports
export { IntentAggregatorService };
