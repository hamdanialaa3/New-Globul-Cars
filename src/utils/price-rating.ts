/**
 * Price Rating Algorithm - خوارزمية تقييم السعر
 * Determines if a car's price is a good deal compared to market average
 * 
 * Used to show badges: "Super Deal" (green), "Fair Price", "Overpriced" (red)
 * 
 * @since December 2025
 */

export interface MarketStats {
  averagePrice: number;
  avgMileage: number;
  sampleSize: number;
  stdDeviation?: number;
}

export type DealRating = 'SUPER_DEAL' | 'FAIR' | 'OVERPRICED';

export interface PriceRatingResult {
  rating: DealRating;
  deviation: number;          // Percentage difference from expected price
  expectedPrice: number;      // What the car should cost based on market
  actualPrice: number;        // What the seller is asking
  savingsAmount?: number;     // How much you save (if SUPER_DEAL)
  overchargeAmount?: number;  // How much over market (if OVERPRICED)
}

/**
 * Calculate if a car's price is a good deal
 * حساب ما إذا كان السعر صفقة جيدة
 * 
 * Algorithm:
 * 1. Start with market average price
 * 2. Adjust for mileage difference (€50 per 1000km)
 * 3. Calculate deviation percentage
 * 4. Apply thresholds: -15% = SUPER_DEAL, +20% = OVERPRICED
 */
export function calculateDealRating(
  carPrice: number,
  carMileage: number,
  marketStats: MarketStats
): PriceRatingResult {
  // Adjust expected price based on mileage difference
  const mileageDiff = carMileage - marketStats.avgMileage;
  const mileageAdjustment = (mileageDiff / 1000) * 50; // €50 per 1000km difference
  
  const expectedPrice = marketStats.averagePrice - mileageAdjustment;
  const priceDiff = carPrice - expectedPrice;
  const deviation = (priceDiff / expectedPrice) * 100;

  let rating: DealRating;
  if (deviation < -15) {
    rating = 'SUPER_DEAL';   // 15% or more cheaper than expected
  } else if (deviation > 20) {
    rating = 'OVERPRICED';    // 20% or more expensive than expected
  } else {
    rating = 'FAIR';
  }

  const result: PriceRatingResult = {
    rating,
    deviation: Math.round(deviation * 10) / 10, // Round to 1 decimal
    expectedPrice: Math.round(expectedPrice),
    actualPrice: carPrice
  };

  if (rating === 'SUPER_DEAL') {
    result.savingsAmount = Math.round(expectedPrice - carPrice);
  } else if (rating === 'OVERPRICED') {
    result.overchargeAmount = Math.round(carPrice - expectedPrice);
  }

  return result;
}

/**
 * Get market stats for a specific make/model/year
 * (Placeholder - should query Firestore for actual market data)
 */
export async function getMarketStats(
  make: string,
  model: string,
  year: number
): Promise<MarketStats> {
  // TODO: Implement actual Firestore query
  // This is a placeholder that returns mock data
  // In production, this should:
  // 1. Query Firestore for similar cars (same make/model, year +/- 1)
  // 2. Calculate average price, mileage, and standard deviation
  // 3. Return real market statistics
  
  return {
    averagePrice: 15000,
    avgMileage: 120000,
    sampleSize: 50,
    stdDeviation: 3000
  };
}

/**
 * Get display badge text for a rating
 */
export function getRatingBadgeText(rating: DealRating): string {
  switch (rating) {
    case 'SUPER_DEAL':
      return '🔥 Super Deal';
    case 'OVERPRICED':
      return '⚠️ High Price';
    case 'FAIR':
      return '✓ Fair Price';
  }
}

/**
 * Get badge color class for styling
 */
export function getRatingBadgeColor(rating: DealRating): string {
  switch (rating) {
    case 'SUPER_DEAL':
      return 'green';
    case 'OVERPRICED':
      return 'red';
    case 'FAIR':
      return 'blue';
  }
}

/**
 * Format price with currency
 */
export function formatPrice(price: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('en-BG', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
}
