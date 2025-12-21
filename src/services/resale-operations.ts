/**
 * RESALE ANALYSIS OPERATIONS
 * عمليات تحليل إعادة البيع
 */

import { collection, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { serviceLogger } from './logger-service';
import { MarketComparable, MarketAnalysis } from './resale-types';
import {
  BULGARIAN_MARKET_DATA,
  BASE_MARKET_VALUES,
  SIMILARITY_THRESHOLDS,
  CONFIDENCE_LEVELS,
  AGE_ADJUSTMENTS,
  MILEAGE_ADJUSTMENTS,
  PRICING_STRATEGIES,
  RECOMMENDATION_REASONS,
  ALTERNATIVE_ACTIONS,
  DEFAULTS
} from './resale-data';

/**
 * Find comparable sales for market analysis
 * البحث عن مبيعات مماثلة لتحليل السوق
 */
export async function findComparableSales(
  car: { make: string; model: string; year: number; mileage: number; price?: number }
): Promise<MarketComparable[]> {
  try {
    const comparableQuery = query(
      collection(db, 'soldCars'),
      where('make', '==', car.make),
      where('model', '==', car.model),
      orderBy('saleDate', 'desc'),
      limit(DEFAULTS.QUERY_LIMIT)
    );

    const comparableSnapshot = await getDocs(comparableQuery);
    const comparables: MarketComparable[] = [];

    comparableSnapshot.forEach((doc) => {
      const soldCar = doc.data();
      const similarity = calculateSimilarity(car, soldCar);

      if (similarity > SIMILARITY_THRESHOLDS.MIN_SIMILARITY) {
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

    return comparables
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, DEFAULTS.MAX_COMPARABLES);

  } catch (error) {
    serviceLogger.error('Market comparables search failed', error as Error);
    return [];
  }
}

/**
 * Calculate market value based on comparables and adjustments
 * حساب القيمة السوقية بناءً على المقارنات والتعديلات
 */
export function calculateMarketValue(
  car: { year: number; mileage: number },
  comparables: MarketComparable[]
): number {
  if (comparables.length === 0) {
    return calculateBaseMarketValue(car as { make: string; model: string; year: number });
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
 * حساب القيمة السوقية الأساسية عند عدم وجود مقارنات
 */
export function calculateBaseMarketValue(car: { make: string; model: string; year: number }): number {
  const key = `${car.make} ${car.model}`;
  const baseValue = BASE_MARKET_VALUES[key] || DEFAULTS.BASE_PRICE;

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
 * حساب التشابه بين سيارتين
 */
export function calculateSimilarity(
  car1: { year: number; mileage: number; price?: number },
  car2: { year: number; mileage: number; price?: number }
): number {
  let similarity = 100;

  const yearDiff = Math.abs(car1.year - car2.year);
  similarity -= yearDiff * SIMILARITY_THRESHOLDS.YEAR_PENALTY;

  const mileageDiff = Math.abs(car1.mileage - car2.mileage) / 10000;
  similarity -= mileageDiff * SIMILARITY_THRESHOLDS.MILEAGE_PENALTY;

  if (car1.price && car2.price) {
    const priceDiff = Math.abs(car1.price - car2.price) / 1000;
    similarity -= priceDiff * SIMILARITY_THRESHOLDS.PRICE_PENALTY;
  }

  return Math.max(0, Math.min(100, similarity));
}

/**
 * Assess car condition based on age and mileage
 * تقييم حالة السيارة بناءً على العمر والمسافة
 */
export function assessCondition(
  car: { year: number; mileage: number }
): 'excellent' | 'good' | 'fair' | 'poor' {
  const currentYear = new Date().getFullYear();
  const age = currentYear - car.year;

  if (age <= 2 && car.mileage < 30000) return 'excellent';
  if (age <= 4 && car.mileage < 60000) return 'good';
  if (age <= 6 && car.mileage < 100000) return 'fair';
  return 'poor';
}

/**
 * Calculate confidence level based on number of comparables
 * حساب مستوى الثقة بناءً على عدد المقارنات
 */
export function calculateConfidence(comparables: MarketComparable[]): number {
  if (comparables.length === 0) return CONFIDENCE_LEVELS.NO_COMPARABLES;
  if (comparables.length < 3) return CONFIDENCE_LEVELS.FEW_COMPARABLES;
  if (comparables.length < 5) return CONFIDENCE_LEVELS.SOME_COMPARABLES;
  return CONFIDENCE_LEVELS.MANY_COMPARABLES;
}

/**
 * Analyze market trends for a specific make/model
 * تحليل اتجاهات السوق لماركة/موديل معين
 */
export async function analyzeMarketTrends(
  make: string,
  model: string
): Promise<'increasing' | 'stable' | 'decreasing'> {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - DEFAULTS.TREND_MONTHS);

    const trendQuery = query(
      collection(db, 'soldCars'),
      where('make', '==', make),
      where('model', '==', model),
      where('saleDate', '>=', Timestamp.fromDate(sixMonthsAgo)),
      orderBy('saleDate', 'asc')
    );

    const trendSnapshot = await getDocs(trendQuery);

    if (trendSnapshot.size < DEFAULTS.MIN_TREND_SALES) return 'stable';

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
 * حساب مستوى الطلب بناءً على المبيعات المماثلة الأخيرة
 */
export function calculateDemandLevel(comparables: MarketComparable[]): 'high' | 'medium' | 'low' {
  const recentComparables = comparables.filter(comp =>
    comp.saleDate.toDate() > new Date(Date.now() - DEFAULTS.RECENT_DAYS * 24 * 60 * 60 * 1000)
  );

  if (recentComparables.length >= 3) return 'high';
  if (recentComparables.length >= 1) return 'medium';
  return 'low';
}

/**
 * Calculate strategy-based prices
 * حساب الأسعار بناءً على الاستراتيجية
 */
export function calculateStrategyPrices(
  analysis: MarketAnalysis,
  strategy: string
): { target: number; minimum: number } {
  const basePrice = analysis.marketValue;
  const strategyKey = strategy as keyof typeof PRICING_STRATEGIES;
  const strategyData = PRICING_STRATEGIES[strategyKey] || PRICING_STRATEGIES.balanced;

  return {
    target: basePrice * strategyData.targetMultiplier,
    minimum: basePrice * strategyData.minimumMultiplier
  };
}

/**
 * Analyze optimal timing for sale
 * تحليل التوقيت الأمثل للبيع
 */
export function analyzeOptimalTiming(): { bestMonth: string; expectedPriceIncrease: number } {
  let bestMonth = 'May';
  let maxIncrease = 0;

  Object.entries(BULGARIAN_MARKET_DATA.seasonalFactors).forEach(([month, factor]) => {
    const increase = (factor - 1) * 100;
    if (increase > maxIncrease) {
      maxIncrease = increase;
      bestMonth = month;
    }
  });

  return { bestMonth, expectedPriceIncrease: maxIncrease };
}

/**
 * Analyze current market conditions
 * تحليل ظروف السوق الحالية
 */
export function analyzeMarketConditions(
  analysis: MarketAnalysis
): { demand: number; inventory: number; seasonalFactor: number } {
  const currentMonth = new Date().toLocaleString('en', { month: 'long' });
  const seasonalFactors = BULGARIAN_MARKET_DATA.seasonalFactors as Record<string, number>;
  const seasonalFactor = (seasonalFactors[currentMonth] || 1) * 100;

  return {
    demand: analysis.demandLevel === 'high' ? 80 : analysis.demandLevel === 'medium' ? 50 : 20,
    inventory: 60,
    seasonalFactor
  };
}

/**
 * Generate resale recommendation
 * إنشاء توصية إعادة البيع
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
    reasons.push(RECOMMENDATION_REASONS.HIGH_DEMAND);
  } else if (conditions.seasonalFactor < 95) {
    action = 'wait';
    confidence = 70;
    reasons.push(RECOMMENDATION_REASONS.WAIT_SEASON);
  } else {
    action = 'hold';
    confidence = 60;
    reasons.push(RECOMMENDATION_REASONS.STABLE_MARKET);
  }

  return {
    action,
    confidence,
    reasoning: reasons,
    alternatives: ALTERNATIVE_ACTIONS
  };
}

/**
 * Calculate age-based adjustment factor
 * حساب عامل التعديل بناءً على العمر
 */
export function calculateAgeAdjustment(year: number): number {
  const currentYear = new Date().getFullYear();
  const age = currentYear - year;

  if (age <= 1) return AGE_ADJUSTMENTS['1_year'];
  if (age <= 2) return AGE_ADJUSTMENTS['2_years'];
  if (age <= 3) return AGE_ADJUSTMENTS['3_years'];
  if (age <= 4) return AGE_ADJUSTMENTS['4_years'];
  return AGE_ADJUSTMENTS['5+_years'];
}

/**
 * Calculate mileage-based adjustment factor
 * حساب عامل التعديل بناءً على المسافة المقطوعة
 */
export function calculateMileageAdjustment(mileage: number): number {
  if (mileage < MILEAGE_ADJUSTMENTS.VERY_LOW.max) return MILEAGE_ADJUSTMENTS.VERY_LOW.factor;
  if (mileage < MILEAGE_ADJUSTMENTS.LOW.max) return MILEAGE_ADJUSTMENTS.LOW.factor;
  if (mileage < MILEAGE_ADJUSTMENTS.MEDIUM.max) return MILEAGE_ADJUSTMENTS.MEDIUM.factor;
  if (mileage < MILEAGE_ADJUSTMENTS.HIGH.max) return MILEAGE_ADJUSTMENTS.HIGH.factor;
  return MILEAGE_ADJUSTMENTS.VERY_HIGH.factor;
}
