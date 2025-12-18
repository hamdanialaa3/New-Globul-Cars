import { collection, doc, getDoc, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { serviceLogger } from './logger-service';
import {
  MarketAnalysis,
  MarketComparable,
  ResaleRecommendation
} from './autonomous-resale-types';
import { BULGARIAN_MARKET_DATA, BASE_MARKET_VALUES } from './autonomous-resale-data';

/**
 * Find comparable sales for market analysis
 */
export async function findComparableSales(car: { make: string; model: string; year: number; mileage: number; price?: number }): Promise<MarketComparable[]> {
  try {
    const comparableQuery = query(
      collection(db, 'soldCars'),
      where('make', '==', car.make),
      where('model', '==', car.model),
      orderBy('saleDate', 'desc'),
      limit(20)
    );

    const comparableSnapshot = await getDocs(comparableQuery);
    const comparables: MarketComparable[] = [];

    comparableSnapshot.forEach((doc) => {
      const soldCar = doc.data();
      const similarity = calculateSimilarity(car, soldCar);

      if (similarity > 60) { // فقط السيارات المشابهة جداً
        comparables.push({
          id: doc.id,
          make: soldCar.make,
          model: soldCar.model,
          year: soldCar.year,
          mileage: soldCar.mileage,
          price: soldCar.salePrice,
          saleDate: soldCar.saleDate,
          location: soldCar.location || 'Bulgaria',
          condition: soldCar.condition,
          similarity
        });
      }
    });

    return comparables.sort((a, b) => b.similarity - a.similarity).slice(0, 5);

  } catch (error) {
    serviceLogger.error('Market comparables search failed', error as Error);
    return [];
  }
}

/**
 * Calculate market value based on comparables and adjustments
 */
export function calculateMarketValue(car: { year: number; mileage: number }, comparables: MarketComparable[]): number {
  if (comparables.length === 0) {
    return calculateBaseMarketValue(car);
  }

  let totalWeightedPrice = 0;
  let totalWeight = 0;

  comparables.forEach(comp => {
    const weight = comp.similarity / 100;
    totalWeightedPrice += comp.price * weight;
    totalWeight += weight;
  });

  const averagePrice = totalWeightedPrice / totalWeight;
  const ageAdjustment = calculateAgeAdjustment(car.year);
  const mileageAdjustment = calculateMileageAdjustment(car.mileage);

  return averagePrice * ageAdjustment * mileageAdjustment;
}

/**
 * Calculate base market value when no comparables available
 */
export function calculateBaseMarketValue(car: { make: string; model: string; year: number }): number {
  const key = `${car.make} ${car.model}`;
  const baseValue = BASE_MARKET_VALUES[key] || 15000; // قيمة افتراضية

  const currentYear = new Date().getFullYear();
  const age = currentYear - car.year;

  let depreciation = 0;
  if (age <= 1) depreciation = BULGARIAN_MARKET_DATA.depreciation['1_year'];
  else if (age <= 2) depreciation = BULGARIAN_MARKET_DATA.depreciation['2_years'];
  else if (age <= 3) depreciation = BULGARIAN_MARKET_DATA.depreciation['3_years'];
  else if (age <= 4) depreciation = BULGARIAN_MARKET_DATA.depreciation['4_years'];
  else depreciation = BULGARIAN_MARKET_DATA.depreciation['5+_years'];

  return baseValue * (1 - depreciation);
}

/**
 * Calculate similarity between two cars
 */
export function calculateSimilarity(
  car1: { year: number; mileage: number; price?: number },
  car2: { year: number; mileage: number; price?: number }
): number {
  let similarity = 100;

  const yearDiff = Math.abs(car1.year - car2.year);
  similarity -= yearDiff * 10;

  const mileageDiff = Math.abs(car1.mileage - car2.mileage) / 10000;
  similarity -= mileageDiff * 5;

  if (car2.price) {
    const priceDiff = Math.abs(car1.price - car2.price) / 1000;
    similarity -= priceDiff * 2;
  }

  return Math.max(0, Math.min(100, similarity));
}

/**
 * Assess car condition based on age and mileage
 */
export function assessCondition(car: { year: number; mileage: number }): 'excellent' | 'good' | 'fair' | 'poor' {
  const currentYear = new Date().getFullYear();
  const age = currentYear - car.year;

  if (age <= 2 && car.mileage < 30000) return 'excellent';
  if (age <= 4 && car.mileage < 60000) return 'good';
  if (age <= 6 && car.mileage < 100000) return 'fair';
  return 'poor';
}

/**
 * Calculate confidence level based on number of comparables
 */
export function calculateConfidence(comparables: MarketComparable[]): number {
  if (comparables.length === 0) return 30;
  if (comparables.length < 3) return 50;
  if (comparables.length < 5) return 70;
  return 85;
}

/**
 * Analyze market trends for a specific make/model
 */
export async function analyzeMarketTrends(make: string, model: string): Promise<'increasing' | 'stable' | 'decreasing'> {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const trendQuery = query(
      collection(db, 'soldCars'),
      where('make', '==', make),
      where('model', '==', model),
      where('saleDate', '>=', Timestamp.fromDate(sixMonthsAgo)),
      orderBy('saleDate', 'asc')
    );

    const trendSnapshot = await getDocs(trendQuery);

    if (trendSnapshot.size < 5) return 'stable';

    const prices = trendSnapshot.docs.map(doc => doc.data().salePrice);
    const recentAvg = prices.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const olderAvg = prices.slice(0, 3).reduce((a, b) => a + b, 0) / 3;

    const change = (recentAvg - olderAvg) / olderAvg;

    if (change > 0.05) return 'increasing';
    if (change < -0.05) return 'decreasing';
    return 'stable';

  } catch (error) {
    serviceLogger.error('Market trend analysis failed', error as Error, { make, model });
    return 'stable';
  }
}

/**
 * Calculate demand level based on recent comparable sales
 */
export function calculateDemandLevel(comparables: MarketComparable[]): 'high' | 'medium' | 'low' {
  const recentComparables = comparables.filter(comp =>
    comp.saleDate.toDate() > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  );

  if (recentComparables.length >= 3) return 'high';
  if (recentComparables.length >= 1) return 'medium';
  return 'low';
}

/**
 * Calculate strategy-based prices
 */
export function calculateStrategyPrices(
  analysis: MarketAnalysis,
  strategy: string
): { target: number; minimum: number } {
  const basePrice = analysis.marketValue;

  switch (strategy) {
    case 'aggressive':
      return {
        target: basePrice * 1.05,
        minimum: basePrice * 0.90
      };
    case 'conservative':
      return {
        target: basePrice * 0.95,
        minimum: basePrice * 0.85
      };
    case 'balanced':
    default:
      return {
        target: basePrice,
        minimum: basePrice * 0.88
      };
  }
}

/**
 * Analyze optimal timing for sale
 */
export async function analyzeOptimalTiming(analysis: MarketAnalysis): Promise<{ bestMonth: string; expectedPriceIncrease: number }> {
  const currentMonth = new Date().toLocaleString('en', { month: 'long' });

  let bestMonth = currentMonth;
  let maxIncrease = 0;

  Object.entries(BULGARIAN_MARKET_DATA.seasonalFactors).forEach(([month, factor]) => {
    const increase = (factor - 1) * 100;
    if (increase > maxIncrease) {
      maxIncrease = increase;
      bestMonth = month;
    }
  });

  return {
    bestMonth,
    expectedPriceIncrease: maxIncrease
  };
}

/**
 * Analyze current market conditions
 */
export async function analyzeMarketConditions(analysis: MarketAnalysis): Promise<{ demand: number; inventory: number; seasonalFactor: number }> {
  const currentMonth = new Date().toLocaleString('en', { month: 'long' });
  const seasonalFactors = BULGARIAN_MARKET_DATA.seasonalFactors as Record<string, number>;
  const seasonalFactor = (seasonalFactors[currentMonth] || 1) * 100;

  return {
    demand: analysis.demandLevel === 'high' ? 80 : analysis.demandLevel === 'medium' ? 50 : 20,
    inventory: 60, // نسبة مئوية
    seasonalFactor
  };
}

/**
 * Generate resale recommendation
 */
export function generateRecommendation(
  analysis: MarketAnalysis,
  timing: { bestMonth: string; expectedPriceIncrease: number },
  conditions: { demand: number; inventory: number; seasonalFactor: number }
): { action: 'sell_now' | 'wait' | 'hold'; confidence: number; reasoning: string[]; alternatives: string[] } {
  const reasons = [];
  let action: 'sell_now' | 'wait' | 'hold' = 'hold';
  let confidence = 50;

  if (conditions.demand > 70 && analysis.marketTrend === 'increasing') {
    action = 'sell_now';
    confidence = 80;
    reasons.push('الطلب مرتفع والسوق في ارتفاع');
  } else if (conditions.seasonalFactor < 95) {
    action = 'wait';
    confidence = 70;
    reasons.push('التوقيت غير مثالي - انتظار موسم أفضل');
  } else {
    action = 'hold';
    confidence = 60;
    reasons.push('السوق مستقر - الاحتفاظ بالسيارة');
  }

  return {
    action,
    confidence,
    reasoning: reasons,
    alternatives: [
      'تحسين حالة السيارة لزيادة القيمة',
      'إضافة ميزات إضافية',
      'انتظار انخفاض المخزون'
    ]
  };
}

/**
 * Calculate age-based adjustment factor
 */
export function calculateAgeAdjustment(year: number): number {
  const currentYear = new Date().getFullYear();
  const age = currentYear - year;

  if (age <= 1) return 0.95;
  if (age <= 2) return 0.88;
  if (age <= 3) return 0.82;
  if (age <= 4) return 0.75;
  return 0.68;
}

/**
 * Calculate mileage-based adjustment factor
 */
export function calculateMileageAdjustment(mileage: number): number {
  if (mileage < 20000) return 1.05;
  if (mileage < 50000) return 1.00;
  if (mileage < 80000) return 0.95;
  if (mileage < 120000) return 0.90;
  return 0.85;
}