// src/services/pricing/pricing-intelligence.service.ts
// Pricing Intelligence Service - خدمة ذكاء الأسعار
// الهدف: تحليل الأسعار للسوق البلغاري مع عوامل محلية محددة
// الموقع: بلغاريا | اللغات: BG/EN

import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { serviceLogger } from '../logger-service';
import { VEHICLE_COLLECTIONS } from '../car/unified-car-types';
import { mapDocToCar } from '../car/unified-car-queries';
import {
  CarSpecs,
  PriceAnalysis,
  BulgarianFactors,
  SimilarCar,
  DetailedPriceAnalysis,
  PricingStrategy
} from '../../types/pricing.types';

// ==================== SERVICE CLASS ====================

/**
 * Pricing Intelligence Service
 * خدمة تحليل الأسعار للسيارات في السوق البلغاري
 */
export class PricingIntelligenceService {
  private static instance: PricingIntelligenceService;

  private constructor() {}

  public static getInstance(): PricingIntelligenceService {
    if (!PricingIntelligenceService.instance) {
      PricingIntelligenceService.instance = new PricingIntelligenceService();
    }
    return PricingIntelligenceService.instance;
  }

  // ==================== PUBLIC METHODS ====================

  /**
   * Get market price analysis for car specs
   * تحليل سعر السوق للمواصفات المحددة
   */
  async getMarketPrice(specs: CarSpecs): Promise<PriceAnalysis> {
    try {
      // 1. Find similar cars in Bulgarian market
      const similarCars = await this.findSimilarInBulgaria(specs);
      
      // 2. Calculate Bulgarian-specific factors
      const bulgarianFactors = this.calculateBulgarianFactors(specs);
      
      // 3. Calculate suggested price
      const suggestedPrice = this.calculateSuggestedPrice(similarCars, bulgarianFactors, specs);
      
      // 4. Generate recommendations
      const recommendations = this.generateBulgarianRecommendations(suggestedPrice, specs, bulgarianFactors);
      
      // 5. Calculate confidence
      const confidence = this.calculateConfidence(similarCars.length);
      
      // Calculate market average and range
      const prices = similarCars.map(c => c.price).filter(p => p > 0);
      const marketAverage = prices.length > 0
        ? prices.reduce((a, b) => a + b, 0) / prices.length
        : suggestedPrice;
      
      const priceRange = {
        min: prices.length > 0 ? Math.min(...prices) : suggestedPrice * 0.8,
        max: prices.length > 0 ? Math.max(...prices) : suggestedPrice * 1.2
      };

      return {
        suggestedPrice,
        marketAverage,
        priceRange,
        recommendations,
        confidence,
        factors: bulgarianFactors,
        similarCars: similarCars.slice(0, 10)
      };
    } catch (error) {
      serviceLogger.error('Error calculating market price', error as Error, { specs });
      throw error;
    }
  }

  /**
   * Get detailed price analysis with predictions
   * تحليل تفصيلي للأسعار مع التنبؤات
   */
  async getDetailedAnalysis(specs: CarSpecs, currentPrice?: number): Promise<DetailedPriceAnalysis> {
    const basicAnalysis = await this.getMarketPrice(specs);
    
    const recommendedStrategy = this.recommendPricingStrategy(basicAnalysis, currentPrice);
    const predictions = this.predictMarketBehavior(basicAnalysis, specs);
    
    const breakdown = {
      basePrice: basicAnalysis.marketAverage,
      factorsAdjustment: basicAnalysis.suggestedPrice - basicAnalysis.marketAverage,
      finalPrice: basicAnalysis.suggestedPrice
    };

    return {
      ...basicAnalysis,
      recommendedStrategy,
      predictions,
      breakdown
    };
  }

  // ==================== PRIVATE METHODS ====================

  /**
   * Find similar cars in Bulgarian market
   */
  private async findSimilarInBulgaria(specs: CarSpecs): Promise<SimilarCar[]> {
    const allCars: SimilarCar[] = [];

    // Query each collection
    const queryPromises = VEHICLE_COLLECTIONS.map(async (collectionName) => {
      try {
        const constraints = [
          where('make', '==', specs.make),
          where('isActive', '==', true),
          where('isSold', '==', false)
        ];

        if (specs.model) {
          constraints.push(where('model', '==', specs.model));
        }

        if (specs.fuelType) {
          constraints.push(where('fuelType', '==', specs.fuelType));
        }

        const q = query(
          collection(db, collectionName),
          ...constraints,
          orderBy('createdAt', 'desc'),
          limit(50)
        );

        const snapshot = await getDocs(q).catch(() => null);
        if (!snapshot || snapshot.empty) return [];

        return snapshot.docs
          .map(doc => {
            const car = mapDocToCar(doc);
            const similarityScore = this.calculateSimilarityScore(specs, car);
            return {
              id: car.id || doc.id,
              make: car.make,
              model: car.model || '',
              year: car.year || 0,
              mileage: car.mileage || 0,
              price: car.price || 0,
              location: car.location || '',
              similarityScore
            };
          })
          .filter(c => c.similarityScore > 30 && c.price > 0);
      } catch (error) {
        serviceLogger.warn(`Error querying ${collectionName}`, { error });
        return [];
      }
    });

    const results = await Promise.all(queryPromises);
    results.forEach(cars => allCars.push(...cars));

    // Sort by similarity and remove duplicates
    const uniqueCars = Array.from(
      new Map(allCars.map(car => [car.id, car])).values()
    );

    return uniqueCars
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, 20);
  }

  /**
   * Calculate similarity score between specs and car
   */
  private calculateSimilarityScore(specs: CarSpecs, car: any): number {
    let score = 0;
    const maxScore = 100;

    // Make match: 30 points
    if (car.make === specs.make) score += 30;

    // Model match: 25 points
    if (car.model === specs.model) score += 25;

    // Year proximity: 20 points (within 2 years = full, each year beyond = -5)
    if (car.year && specs.year) {
      const yearDiff = Math.abs(car.year - specs.year);
      if (yearDiff <= 2) score += 20;
      else score += Math.max(0, 20 - (yearDiff - 2) * 5);
    }

    // Fuel type match: 10 points
    if (car.fuelType === specs.fuelType) score += 10;

    // Transmission match: 5 points
    if (car.transmission === specs.transmission) score += 5;

    // Mileage proximity: 10 points (within 20% = full)
    if (car.mileage && specs.mileage) {
      const mileageDiff = Math.abs(car.mileage - specs.mileage) / specs.mileage;
      if (mileageDiff <= 0.2) score += 10;
      else score += Math.max(0, 10 - mileageDiff * 50);
    }

    return Math.min(score, maxScore);
  }

  /**
   * Calculate Bulgarian-specific factors
   */
  private calculateBulgarianFactors(specs: CarSpecs): BulgarianFactors {
    return {
      importTax: this.calculateImportTax(specs.year),
      marketDemand: this.getRegionalDemand(specs.location),
      seasonalAdjustment: this.getSeasonalAdjustment(),
      currencyImpact: this.getEurToBgnImpact(),
      rustFactor: this.getRustFactor(specs),
      locationFactor: this.getLocationFactor(specs.location)
    };
  }

  /**
   * Calculate import tax based on year
   */
  private calculateImportTax(year: number): number {
    // Older cars (pre-2010) have lower import tax
    if (year < 2010) return 0;
    if (year < 2015) return 5;
    if (year < 2020) return 10;
    return 15;
  }

  /**
   * Get regional demand (0-100)
   * الطلب الإقليمي بناءً على السوق البلغاري
   */
  private getRegionalDemand(location: string): number {
    const locationLower = location.toLowerCase();
    
    // Sofia (العاصمة) - أعلى طلب
    if (locationLower.includes('софия') || locationLower.includes('sofia')) {
      return 95;
    }
    
    // المدن الكبيرة - طلب عالٍ
    if (locationLower.includes('пловдив') || locationLower.includes('plovdiv') ||
        locationLower.includes('варна') || locationLower.includes('varna') ||
        locationLower.includes('бургас') || locationLower.includes('burgas')) {
      return 85;
    }
    
    // مدن متوسطة - طلب متوسط
    if (locationLower.includes('русе') || locationLower.includes('ruse') ||
        locationLower.includes('стара загора') || locationLower.includes('stara zagora')) {
      return 70;
    }
    
    // مدن صغيرة وقرى - طلب منخفض
    return 55;
  }

  /**
   * Get seasonal adjustment (%)
   */
  private getSeasonalAdjustment(): number {
    const month = new Date().getMonth() + 1;
    // Spring/Summer (3-8) higher demand, Winter lower
    if (month >= 3 && month <= 8) return 5; // +5% in warm months
    return -3; // -3% in cold months
  }

  /**
   * Get EUR to BGN impact
   */
  private getEurToBgnImpact(): number {
    // Assume 1 EUR = 1.96 BGN (approximate)
    // This affects pricing psychology
    return 1.96;
  }

  /**
   * Get rust factor (important in Bulgaria)
   */
  private getRustFactor(specs: CarSpecs): number {
    // Older cars or those from import countries (Austria/Germany) may have rust issues
    if (specs.year && specs.year < 2010) return -10; // Lower value
    if (specs.year && specs.year < 2015) return -5;
    return 0;
  }

  /**
   * Get location factor
   */
  private getLocationFactor(location: string): number {
    const premiumLocations = ['София', 'Sofia'];
    const isPremium = premiumLocations.some(city => 
      location.toLowerCase().includes(city.toLowerCase())
    );
    return isPremium ? 1.05 : 1.0; // 5% premium in Sofia
  }

  /**
   * Calculate suggested price
   */
  private calculateSuggestedPrice(
    similarCars: SimilarCar[],
    factors: BulgarianFactors,
    specs: CarSpecs
  ): number {
    if (similarCars.length === 0) {
      // Fallback calculation if no similar cars
      return this.estimateBasePrice(specs);
    }

    // Calculate weighted average from similar cars
    const weights = similarCars.map(c => c.similarityScore / 100);
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    
    const weightedAverage = similarCars.reduce((sum, car, i) => {
      return sum + (car.price * weights[i]);
    }, 0) / totalWeight;

    // Apply Bulgarian factors
    let adjustedPrice = weightedAverage;

    // Seasonal adjustment
    adjustedPrice *= (1 + factors.seasonalAdjustment / 100);

    // Location factor
    adjustedPrice *= factors.locationFactor;

    // Rust factor (negative impact)
    adjustedPrice += (adjustedPrice * factors.rustFactor! / 100);

    // Market demand adjustment
    adjustedPrice *= (0.9 + (factors.marketDemand / 100) * 0.2);

    return Math.round(adjustedPrice);
  }

  /**
   * Estimate base price when no similar cars found
   */
  private estimateBasePrice(specs: CarSpecs): number {
    // Very basic estimation - should be improved with real market data
    const basePrice = 10000;
    const ageDepreciation = (2025 - specs.year) * 1000;
    const mileageDepreciation = specs.mileage * 0.1;
    
    return Math.max(1000, basePrice - ageDepreciation - mileageDepreciation);
  }

  /**
   * Generate Bulgarian-specific recommendations
   */
  private generateBulgarianRecommendations(
    price: number,
    specs: CarSpecs,
    factors: BulgarianFactors
  ): string[] {
    const recommendations: string[] = [];

    // Diesel preference in Bulgarian cities
    if (specs.fuelType === 'diesel') {
      recommendations.push(
        'Дизелът е предпочитан в българските градове - може да увеличите цената с 5%'
      );
      recommendations.push(
        'Diesel is preferred in Bulgarian cities - you can increase the price by 5%'
      );
    }

    // Sofia demand
    if (specs.location.includes('София') || specs.location.includes('Sofia')) {
      recommendations.push(
        'Търсенето е високо в София - бърза продажба е гарантирана'
      );
      recommendations.push(
        'Demand is high in Sofia - quick sale is guaranteed'
      );
    }

    // Financing eligibility
    if (specs.year && specs.year > 2015 && specs.mileage && specs.mileage < 80000) {
      recommendations.push(
        'Отлично за програма "Кола на изплащане" - интерес от банките'
      );
      recommendations.push(
        'Excellent for "Car on Installment" program - interest from banks'
      );
    }

    // Rust warning for older imports
    if (specs.year && specs.year < 2015) {
      recommendations.push(
        'Внимание: По-старите коли могат да имат проблеми с ръжда - бъдете честни в описанието'
      );
      recommendations.push(
        'Warning: Older cars may have rust issues - be honest in description'
      );
    }

    return recommendations;
  }

  /**
   * Calculate confidence level (0-100)
   */
  private calculateConfidence(similarCarsCount: number): number {
    if (similarCarsCount >= 10) return 90;
    if (similarCarsCount >= 5) return 75;
    if (similarCarsCount >= 3) return 60;
    if (similarCarsCount >= 1) return 40;
    return 20;
  }

  /**
   * Recommend pricing strategy
   */
  private recommendPricingStrategy(
    analysis: PriceAnalysis,
    currentPrice?: number
  ): PricingStrategy {
    if (!currentPrice) return 'market_average';

    const diff = ((currentPrice - analysis.suggestedPrice) / analysis.suggestedPrice) * 100;

    if (diff > 15) return 'quick_sale'; // Overpriced
    if (diff < -10) return 'premium'; // Underpriced
    if (Math.abs(diff) < 5) return 'competitive'; // Well-priced

    return 'market_average';
  }

  /**
   * Predict market behavior
   */
  private predictMarketBehavior(
    analysis: PriceAnalysis,
    specs: CarSpecs
  ): DetailedPriceAnalysis['predictions'] {
    // Simple prediction logic - can be enhanced with ML
    const timeToSell = analysis.confidence > 70 ? 14 : 30; // days
    const buyerInterest = Math.min(100, analysis.confidence + 20);
    const negotiationRoom = analysis.confidence > 70 ? 5 : 10; // percentage

    return {
      timeToSell,
      buyerInterest,
      negotiationRoom
    };
  }
}

// Export singleton instance
export const pricingIntelligenceService = PricingIntelligenceService.getInstance();

