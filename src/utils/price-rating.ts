/**
 * Price Rating Algorithm - خوارزمية تقييم السعر
 * Determines if a car's price is a good deal compared to market average
 * 
 * Used to show badges: "Super Deal" (green), "Fair Price", "Overpriced" (red)
 * 
 * @since December 2025
 */

import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';

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
 * Queries all vehicle collections and computes averages.
 */
export async function getMarketStats(
  make: string,
  model: string,
  year: number
): Promise<MarketStats> {
  const collections = ['passenger_cars', 'suvs', 'vans', 'motorcycles', 'trucks', 'buses'];
  const yearLower = year - 1;
  const yearUpper = year + 1;

  const samples: { price: number; mileage: number }[] = [];

  // Query each collection in parallel, limited to avoid heavy reads
  await Promise.all(
    collections.map(async (colName) => {
      try {
        const ref = collection(db, colName);
        const q = query(
          ref,
          where('make', '==', make),
          where('model', '==', model),
          where('year', '>=', yearLower),
          where('year', '<=', yearUpper),
          limit(60)
        );

        const snapshot = await getDocs(q);
        snapshot.forEach((docSnap) => {
          const data: any = docSnap.data();
          const price = Number(data.price) || 0;
          const mileage = Number(data.mileage || data.kilometers || data.km) || 0;
          if (price > 0 && mileage > 0) {
            samples.push({ price, mileage });
          }
        });
      } catch (error) {
        // Log silently to avoid breaking price rating; other collections will still contribute
        // logger-service not imported here to keep utility light
      }
    })
  );

  if (samples.length === 0) {
    // Fallback to conservative defaults if no market data available
    return {
      averagePrice: 15000,
      avgMileage: 120000,
      sampleSize: 0,
      stdDeviation: undefined
    };
  }

  const sampleSize = samples.length;
  const sumPrice = samples.reduce((sum, s) => sum + s.price, 0);
  const sumMileage = samples.reduce((sum, s) => sum + s.mileage, 0);
  const averagePrice = Math.round(sumPrice / sampleSize);
  const avgMileage = Math.round(sumMileage / sampleSize);

  // Population standard deviation for price
  const variance =
    samples.reduce((sum, s) => sum + Math.pow(s.price - averagePrice, 2), 0) /
    sampleSize;
  const stdDeviation = Math.round(Math.sqrt(variance));

  return {
    averagePrice,
    avgMileage,
    sampleSize,
    stdDeviation
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
