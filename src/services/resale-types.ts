/**
 * RESALE ANALYSIS TYPES
 * أنواع تحليل إعادة البيع
 */

import { Timestamp } from 'firebase/firestore';

/**
 * Market comparable car
 * سيارة مماثلة في السوق
 */
export interface MarketComparable {
  id: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  saleDate: Timestamp;
  location: string;
  condition: string;
  similarity: number;
}

/**
 * Market analysis result
 * نتيجة تحليل السوق
 */
export interface MarketAnalysis {
  marketValue: number;
  confidence: number;
  comparables: MarketComparable[];
  demandLevel: 'high' | 'medium' | 'low';
  marketTrend: 'increasing' | 'stable' | 'decreasing';
  seasonalFactor: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
}

/**
 * Resale recommendation
 * توصية إعادة البيع
 */
export interface ResaleRecommendation {
  action: 'sell_now' | 'wait' | 'hold';
  confidence: number;
  reasoning: string[];
  alternatives: string[];
  optimalTiming: {
    bestMonth: string;
    expectedPriceIncrease: number;
  };
  pricing: {
    target: number;
    minimum: number;
    strategy: string;
  };
  marketConditions: {
    demand: number;
    inventory: number;
    seasonalFactor: number;
  };
}

/**
 * Car condition assessment
 * تقييم حالة السيارة
 */
export type CarCondition = 'excellent' | 'good' | 'fair' | 'poor';

/**
 * Market trend direction
 * اتجاه السوق
 */
export type MarketTrend = 'increasing' | 'stable' | 'decreasing';

/**
 * Demand level
 * مستوى الطلب
 */
export type DemandLevel = 'high' | 'medium' | 'low';

/**
 * Sale action recommendation
 * توصية إجراء البيع
 */
export type SaleAction = 'sell_now' | 'wait' | 'hold';

/**
 * Pricing strategy
 * استراتيجية التسعير
 */
export type PricingStrategy = 'aggressive' | 'balanced' | 'conservative';
