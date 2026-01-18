/**
 * خدمة حساب السعر النهائي
 * Price Calculator Service
 */

import { CarSpecs, PriceRange, MarketPrice, AIAnalysis } from '../types/pricing.types';

export class PriceCalculatorService {
  /**
   * حساب السعر النهائي من AI Analysis و Market Data
   */
  calculateFinalPrice(
    aiAnalysis: AIAnalysis,
    marketPrices: MarketPrice[]
  ): PriceRange {
    if (marketPrices.length === 0) {
      return aiAnalysis.estimatedPrice;
    }

    // تحويل جميع الأسعار إلى EUR
    const prices = marketPrices
      .map(p => this.convertToEUR(p.price, p.currency))
      .filter(p => p > 0)
      .sort((a, b) => a - b);

    if (prices.length === 0) {
      return aiAnalysis.estimatedPrice;
    }

    // حساب الإحصائيات
    const low = prices[0];
    const high = prices[prices.length - 1];
    const average = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const median = this.calculateMedian(prices);

    // دمج AI Analysis مع Market Data
    const aiLow = aiAnalysis.estimatedPrice.low;
    const aiHigh = aiAnalysis.estimatedPrice.high;
    const aiAverage = aiAnalysis.estimatedPrice.average;

    // Weighted average (70% market data, 30% AI)
    const finalLow = Math.min(low, aiLow);
    const finalHigh = Math.max(high, aiHigh);
    const finalAverage = (average * 0.7) + (aiAverage * 0.3);

    return {
      low: Math.round(finalLow),
      average: Math.round(finalAverage),
      high: Math.round(finalHigh),
      currency: 'EUR',
    };
  }

  /**
   * حساب الوسيط
   */
  private calculateMedian(numbers: number[]): number {
    const sorted = [...numbers].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    }

    return sorted[middle];
  }

  /**
   * تحويل العملة إلى EUR
   */
  private convertToEUR(amount: number, currency: 'EUR' | 'BGN'): number {
    if (currency === 'EUR') {
      return amount;
    }

    // BGN to EUR conversion rate (approximate)
    // في Production، استخدم API حقيقي
    const BGN_TO_EUR = 0.51;
    return amount * BGN_TO_EUR;
  }

  /**
   * حساب انحراف السعر عن المتوسط
   */
  calculatePriceDeviation(price: number, range: PriceRange): number {
    const deviation = ((price - range.average) / range.average) * 100;
    return Math.round(deviation * 100) / 100;
  }

  /**
   * تقييم السعر (جيد/متوسط/سيء)
   */
  evaluatePrice(price: number, range: PriceRange): 'good' | 'fair' | 'high' {
    const deviation = this.calculatePriceDeviation(price, range);

    if (deviation < -10) {
      return 'good'; // أقل من المتوسط بـ 10%
    } else if (deviation > 10) {
      return 'high'; // أعلى من المتوسط بـ 10%
    }

    return 'fair';
  }

  /**
   * حساب تأثير المسافة على السعر
   */
  calculateMileageImpact(mileage: number, basePrice: number): number {
    // كل 10,000 km تقلل السعر بنسبة 3%
    const mileageFactor = (mileage / 10000) * 0.03;
    return basePrice * (1 - Math.min(mileageFactor, 0.5)); // Max 50% reduction
  }

  /**
   * حساب تأثير العمر على السعر
   */
  calculateAgeImpact(year: number, basePrice: number): number {
    const currentYear = new Date().getFullYear();
    const age = currentYear - year;
    
    // كل سنة تقلل السعر بنسبة 12%
    const ageFactor = age * 0.12;
    return basePrice * (1 - Math.min(ageFactor, 0.8)); // Max 80% reduction
  }
}

export const priceCalculatorService = new PriceCalculatorService();
