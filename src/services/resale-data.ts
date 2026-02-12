/**
 * RESALE ANALYSIS DATA
 */

/**
 * Bulgarian market data
 */
export const BULGARIAN_MARKET_DATA = {
  depreciation: {
    '1_year': 0.15,   // 15% in the first year
    '2_years': 0.25,  // 25% in first two years
    '3_years': 0.35,  // 35% in 3 years
    '4_years': 0.45,  // 45% in 4 years
    '5+_years': 0.55  // 55% after 5 years
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
 */
export const SIMILARITY_THRESHOLDS = {
  MIN_SIMILARITY: 60,
  YEAR_PENALTY: 10,
  MILEAGE_PENALTY: 5,
  PRICE_PENALTY: 2
};

/**
 * Confidence levels
 */
export const CONFIDENCE_LEVELS = {
  NO_COMPARABLES: 30,
  FEW_COMPARABLES: 50,
  SOME_COMPARABLES: 70,
  MANY_COMPARABLES: 85
};

/**
 * Age adjustment factors
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
 * Recommendation reasoning templates
 */
export const RECOMMENDATION_REASONS = {
  HIGH_DEMAND: 'High demand and rising market',
  WAIT_SEASON: 'Timing is not ideal - wait for a better season',
  STABLE_MARKET: 'Market is stable - keep the car'
};

/**
 * Alternative actions
 */
export const ALTERNATIVE_ACTIONS = [
  'Improve car condition to increase value',
  'Add extra features',
  'Wait for inventory to decrease'
];

/**
 * Default values
 */
export const DEFAULTS = {
  BASE_PRICE: 15000, // Default base price in BGN
  MAX_COMPARABLES: 5,
  QUERY_LIMIT: 20,
  TREND_MONTHS: 6,
  MIN_TREND_SALES: 5,
  RECENT_DAYS: 30
};
