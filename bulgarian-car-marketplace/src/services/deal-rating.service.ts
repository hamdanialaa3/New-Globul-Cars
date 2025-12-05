// Deal Rating Service
// نظام تقييم الصفقات - يحلل قيمة السيارة مقارنة بالسوق
// Inspired by: CarGurus Deal Rating Algorithm

import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { CarListing } from '../types/CarListing';
import { logger } from './logger-service';
import { queryAllCollections } from './multi-collection-helper';

/**
 * تقييم الصفقة
 */
export type DealRatingScore = 'Excellent' | 'Good' | 'Fair' | 'Overpriced' | 'Unknown';

/**
 * نتيجة تقييم الصفقة
 */
export interface DealRating {
  score: number; // 0-100
  rating: DealRatingScore;
  reasons: string[];
  confidence: number; // 0-1
  marketComparison: {
    averagePrice: number;
    yourPrice: number;
    savings: number; // موجب = توفير، سالب = زيادة
    percentageDiff: number; // نسبة الفرق
  };
  similarCarsCount: number;
  priceDistribution: {
    min: number;
    max: number;
    median: number;
    percentile25: number;
    percentile75: number;
  };
}

/**
 * معايير التقييم
 */
interface RatingCriteria {
  priceWeight: number;        // وزن السعر (40%)
  mileageWeight: number;       // وزن الكيلومترات (25%)
  conditionWeight: number;     // وزن الحالة (20%)
  yearWeight: number;          // وزن السنة (10%)
  featuresWeight: number;      // وزن التجهيزات (5%)
}

const DEFAULT_CRITERIA: RatingCriteria = {
  priceWeight: 0.40,
  mileageWeight: 0.25,
  conditionWeight: 0.20,
  yearWeight: 0.10,
  featuresWeight: 0.05
};

class DealRatingService {
  private static instance: DealRatingService;

  private constructor() {}

  static getInstance(): DealRatingService {
    if (!DealRatingService.instance) {
      DealRatingService.instance = new DealRatingService();
    }
    return DealRatingService.instance;
  }

  /**
   * تقييم صفقة سيارة
   */
  async rateDeal(car: CarListing): Promise<DealRating> {
    try {
      logger.info('🎯 Rating deal for car', { carId: car.id, make: car.make, model: car.model });

      // 1. البحث عن سيارات مشابهة
      const similarCars = await this.findSimilarCars(car, 50);

      if (similarCars.length < 5) {
        logger.warn('⚠️ Not enough similar cars for accurate rating', { count: similarCars.length });
        return this.getUnknownRating(car);
      }

      // 2. حساب إحصائيات السوق
      const marketStats = this.calculateMarketStats(similarCars);

      // 3. حساب النتيجة الكلية
      const score = this.calculateScore(car, similarCars, marketStats);

      // 4. تحديد التقييم
      const rating = this.getRatingFromScore(score);

      // 5. توليد الأسباب
      const reasons = this.generateReasons(car, similarCars, marketStats, rating);

      // 6. حساب الثقة
      const confidence = this.calculateConfidence(similarCars.length, marketStats);

      // 7. حساب المقارنة مع السوق
      const marketComparison = {
        averagePrice: marketStats.average,
        yourPrice: car.price,
        savings: marketStats.average - car.price,
        percentageDiff: ((marketStats.average - car.price) / marketStats.average) * 100
      };

      const result: DealRating = {
        score,
        rating,
        reasons,
        confidence,
        marketComparison,
        similarCarsCount: similarCars.length,
        priceDistribution: {
          min: marketStats.min,
          max: marketStats.max,
          median: marketStats.median,
          percentile25: marketStats.percentile25,
          percentile75: marketStats.percentile75
        }
      };

      logger.info('✅ Deal rating completed', { 
        carId: car.id, 
        rating, 
        score, 
        savings: marketComparison.savings 
      });

      return result;

    } catch (error) {
      logger.error('❌ Error rating deal', error as Error, { carId: car.id });
      return this.getUnknownRating(car);
    }
  }

  /**
   * البحث عن سيارات مشابهة
   */
  private async findSimilarCars(car: CarListing, maxResults: number): Promise<CarListing[]> {
    try {
      // البحث بنفس الماركة والموديل والسنة (±2 سنوات)
      const yearFrom = (car.year || 2020) - 2;
      const yearTo = (car.year || 2020) + 2;

      // البحث في جميع الـ collections
      const constraints = [
        where('status', '==', 'active'),
        where('make', '==', car.make),
        where('model', '==', car.model)
      ];

      const allCars = await queryAllCollections<CarListing>(...constraints);

      // فلترة حسب السنة
      const filtered = allCars.filter(c => 
        c.id !== car.id && // استبعاد السيارة نفسها
        c.year && c.year >= yearFrom && c.year <= yearTo &&
        c.price && c.price > 0
      );

      // ترتيب حسب التشابه
      const sorted = filtered.sort((a, b) => {
        const scoreA = this.calculateSimilarityScore(car, a);
        const scoreB = this.calculateSimilarityScore(car, b);
        return scoreB - scoreA;
      });

      return sorted.slice(0, maxResults);

    } catch (error) {
      logger.error('Error finding similar cars', error as Error);
      return [];
    }
  }

  /**
   * حساب درجة التشابه بين سيارتين
   */
  private calculateSimilarityScore(car1: CarListing, car2: CarListing): number {
    let score = 100;

    // نفس الماركة والموديل (أساسي)
    if (car1.make !== car2.make) score -= 50;
    if (car1.model !== car2.model) score -= 30;

    // اختلاف السنة
    const yearDiff = Math.abs((car1.year || 0) - (car2.year || 0));
    score -= yearDiff * 5;

    // اختلاف الكيلومترات (نسبي)
    if (car1.mileage && car2.mileage) {
      const mileageDiff = Math.abs(car1.mileage - car2.mileage);
      const mileageDiffPercent = (mileageDiff / Math.max(car1.mileage, car2.mileage)) * 100;
      score -= Math.min(mileageDiffPercent / 5, 20);
    }

    // نفس نوع الوقود
    if (car1.fuelType && car2.fuelType && car1.fuelType !== car2.fuelType) {
      score -= 10;
    }

    // نفس ناقل الحركة
    if (car1.transmission && car2.transmission && car1.transmission !== car2.transmission) {
      score -= 5;
    }

    return Math.max(0, score);
  }

  /**
   * حساب إحصائيات السوق
   */
  private calculateMarketStats(cars: CarListing[]): {
    average: number;
    median: number;
    min: number;
    max: number;
    percentile25: number;
    percentile75: number;
    stdDev: number;
  } {
    const prices = cars.map(c => c.price).filter(p => p > 0).sort((a, b) => a - b);

    if (prices.length === 0) {
      return {
        average: 0,
        median: 0,
        min: 0,
        max: 0,
        percentile25: 0,
        percentile75: 0,
        stdDev: 0
      };
    }

    const sum = prices.reduce((acc, p) => acc + p, 0);
    const average = sum / prices.length;

    const median = this.getPercentile(prices, 50);
    const percentile25 = this.getPercentile(prices, 25);
    const percentile75 = this.getPercentile(prices, 75);

    // حساب الانحراف المعياري
    const squaredDiffs = prices.map(p => Math.pow(p - average, 2));
    const avgSquaredDiff = squaredDiffs.reduce((acc, d) => acc + d, 0) / prices.length;
    const stdDev = Math.sqrt(avgSquaredDiff);

    return {
      average,
      median,
      min: prices[0],
      max: prices[prices.length - 1],
      percentile25,
      percentile75,
      stdDev
    };
  }

  /**
   * حساب المئوية (Percentile)
   */
  private getPercentile(sortedArray: number[], percentile: number): number {
    const index = (percentile / 100) * (sortedArray.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index % 1;

    if (lower === upper) {
      return sortedArray[lower];
    }

    return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
  }

  /**
   * حساب النتيجة الكلية (0-100)
   */
  private calculateScore(
    car: CarListing, 
    similarCars: CarListing[], 
    marketStats: any
  ): number {
    let score = 50; // نقطة البداية

    // 1. تقييم السعر (40%)
    const priceScore = this.evaluatePrice(car.price, marketStats);
    score += priceScore * DEFAULT_CRITERIA.priceWeight;

    // 2. تقييم الكيلومترات (25%)
    const mileageScore = this.evaluateMileage(car, similarCars);
    score += mileageScore * DEFAULT_CRITERIA.mileageWeight;

    // 3. تقييم الحالة (20%)
    const conditionScore = this.evaluateCondition(car);
    score += conditionScore * DEFAULT_CRITERIA.conditionWeight;

    // 4. تقييم السنة (10%)
    const yearScore = this.evaluateYear(car, similarCars);
    score += yearScore * DEFAULT_CRITERIA.yearWeight;

    // 5. تقييم التجهيزات (5%)
    const featuresScore = this.evaluateFeatures(car);
    score += featuresScore * DEFAULT_CRITERIA.featuresWeight;

    return Math.round(Math.max(0, Math.min(100, score)));
  }

  /**
   * تقييم السعر مقارنة بالسوق
   */
  private evaluatePrice(price: number, marketStats: any): number {
    const diff = marketStats.average - price;
    const percentDiff = (diff / marketStats.average) * 100;

    if (percentDiff >= 15) return 50;  // ممتاز: 15%+ أقل
    if (percentDiff >= 10) return 35;  // جيد جداً: 10-15% أقل
    if (percentDiff >= 5) return 20;   // جيد: 5-10% أقل
    if (percentDiff >= 0) return 10;   // عادل: 0-5% أقل
    if (percentDiff >= -5) return -5;  // مرتفع قليلاً: 0-5% أعلى
    if (percentDiff >= -10) return -15; // مرتفع: 5-10% أعلى
    return -30; // مبالغ فيه: 10%+ أعلى
  }

  /**
   * تقييم الكيلومترات
   */
  private evaluateMileage(car: CarListing, similarCars: CarListing[]): number {
    if (!car.mileage) return 0;

    const avgMileage = similarCars.reduce((sum, c) => sum + (c.mileage || 0), 0) / similarCars.length;
    const diff = avgMileage - car.mileage;
    const percentDiff = (diff / avgMileage) * 100;

    if (percentDiff >= 30) return 25;  // كيلومترات قليلة جداً
    if (percentDiff >= 15) return 15;  // كيلومترات قليلة
    if (percentDiff >= 0) return 5;    // عادي
    if (percentDiff >= -15) return -5; // كيلومترات كثيرة
    return -15; // كيلومترات كثيرة جداً
  }

  /**
   * تقييم حالة السيارة
   */
  private evaluateCondition(car: CarListing): number {
    const condition = car.condition?.toLowerCase();

    switch (condition) {
      case 'new':
      case 'excellent':
        return 20;
      case 'good':
      case 'very good':
        return 10;
      case 'fair':
        return 0;
      case 'poor':
        return -10;
      default:
        return 0;
    }
  }

  /**
   * تقييم السنة
   */
  private evaluateYear(car: CarListing, similarCars: CarListing[]): number {
    if (!car.year) return 0;

    const avgYear = similarCars.reduce((sum, c) => sum + (c.year || 0), 0) / similarCars.length;
    const yearDiff = car.year - avgYear;

    if (yearDiff >= 2) return 10;  // أحدث من المتوسط
    if (yearDiff >= 1) return 5;   // أحدث قليلاً
    if (yearDiff >= -1) return 0;  // نفس المتوسط
    if (yearDiff >= -2) return -3; // أقدم قليلاً
    return -5; // أقدم من المتوسط
  }

  /**
   * تقييم التجهيزات
   */
  private evaluateFeatures(car: CarListing): number {
    let score = 0;

    // التجهيزات الأساسية
    const features = [
      car.airConditioning,
      car.navigationSystem,
      car.bluetooth,
      car.parkingSensors,
      car.cruiseControl,
      car.leatherSeats,
      car.sunroof,
      car.heatedSeats
    ];

    const featureCount = features.filter(f => f === true || f === 'yes').length;
    score = (featureCount / features.length) * 5;

    return score;
  }

  /**
   * تحديد التقييم من النتيجة
   */
  private getRatingFromScore(score: number): DealRatingScore {
    if (score >= 80) return 'Excellent';  // 80-100: صفقة ممتازة
    if (score >= 60) return 'Good';       // 60-79: صفقة جيدة
    if (score >= 40) return 'Fair';       // 40-59: صفقة عادلة
    if (score >= 20) return 'Overpriced'; // 20-39: مرتفع السعر
    return 'Overpriced';                  // 0-19: مبالغ فيه
  }

  /**
   * توليد أسباب التقييم
   */
  private generateReasons(
    car: CarListing,
    similarCars: CarListing[],
    marketStats: any,
    rating: DealRatingScore
  ): string[] {
    const reasons: string[] = [];

    // السعر
    const priceDiff = marketStats.average - car.price;
    const percentDiff = (priceDiff / marketStats.average) * 100;

    if (percentDiff > 15) {
      reasons.push(`💰 السعر أقل من المتوسط بـ ${Math.round(percentDiff)}% (توفير ${Math.round(priceDiff)} лв)`);
    } else if (percentDiff > 5) {
      reasons.push(`💵 السعر أقل من المتوسط بـ ${Math.round(percentDiff)}%`);
    } else if (percentDiff < -10) {
      reasons.push(`⚠️ السعر أعلى من المتوسط بـ ${Math.abs(Math.round(percentDiff))}%`);
    }

    // الكيلومترات
    if (car.mileage) {
      const avgMileage = similarCars.reduce((sum, c) => sum + (c.mileage || 0), 0) / similarCars.length;
      if (car.mileage < avgMileage * 0.7) {
        reasons.push(`🚗 كيلومترات قليلة (${car.mileage.toLocaleString()} كم)`);
      } else if (car.mileage > avgMileage * 1.3) {
        reasons.push(`⚠️ كيلومترات كثيرة (${car.mileage.toLocaleString()} كم)`);
      }
    }

    // الحالة
    if (car.condition?.toLowerCase() === 'excellent' || car.condition?.toLowerCase() === 'new') {
      reasons.push('✨ حالة ممتازة');
    }

    // السنة
    if (car.year) {
      const currentYear = new Date().getFullYear();
      const age = currentYear - car.year;
      if (age <= 2) {
        reasons.push('🆕 سيارة حديثة');
      }
    }

    // البائع
    if ((car as any).sellerRating && (car as any).sellerRating >= 4.5) {
      reasons.push(`⭐ بائع موثوق (${(car as any).sellerRating}/5)`);
    }

    // عدد السيارات المشابهة
    reasons.push(`📊 بناءً على تحليل ${similarCars.length} سيارة مشابهة`);

    return reasons;
  }

  /**
   * حساب مستوى الثقة
   */
  private calculateConfidence(sampleSize: number, marketStats: any): number {
    let confidence = 0;

    // حجم العينة
    if (sampleSize >= 50) confidence += 0.4;
    else if (sampleSize >= 30) confidence += 0.3;
    else if (sampleSize >= 20) confidence += 0.2;
    else if (sampleSize >= 10) confidence += 0.15;
    else confidence += 0.1;

    // تباين البيانات (كلما قل التباين، زادت الثقة)
    const coefficientOfVariation = marketStats.stdDev / marketStats.average;
    if (coefficientOfVariation < 0.1) confidence += 0.3;
    else if (coefficientOfVariation < 0.2) confidence += 0.2;
    else if (coefficientOfVariation < 0.3) confidence += 0.1;

    // توزيع البيانات
    const iqr = marketStats.percentile75 - marketStats.percentile25;
    const iqrRatio = iqr / marketStats.median;
    if (iqrRatio < 0.3) confidence += 0.3;
    else if (iqrRatio < 0.5) confidence += 0.2;
    else confidence += 0.1;

    return Math.min(1, confidence);
  }

  /**
   * تقييم غير معروف (عندما لا توجد بيانات كافية)
   */
  private getUnknownRating(car: CarListing): DealRating {
    return {
      score: 50,
      rating: 'Unknown',
      reasons: [
        '⚠️ لا توجد بيانات كافية لتقييم هذه الصفقة',
        '📊 يُنصح بمقارنة السعر يدوياً مع سيارات مشابهة'
      ],
      confidence: 0,
      marketComparison: {
        averagePrice: car.price,
        yourPrice: car.price,
        savings: 0,
        percentageDiff: 0
      },
      similarCarsCount: 0,
      priceDistribution: {
        min: car.price,
        max: car.price,
        median: car.price,
        percentile25: car.price,
        percentile75: car.price
      }
    };
  }

  /**
   * تحليل السوق الشامل (لصفحة معينة)
   */
  async analyzeMarket(filters: {
    make?: string;
    model?: string;
    yearFrom?: number;
    yearTo?: number;
  }): Promise<{
    totalCars: number;
    averagePrice: number;
    medianPrice: number;
    priceRange: { min: number; max: number };
    topDeals: Array<{ car: CarListing; rating: DealRating }>;
  }> {
    try {
      // البحث عن السيارات حسب الفلاتر
      const constraints = [where('status', '==', 'active')];

      if (filters.make) {
        constraints.push(where('make', '==', filters.make));
      }
      if (filters.model) {
        constraints.push(where('model', '==', filters.model));
      }

      const cars = await queryAllCollections<CarListing>(...constraints);

      // فلترة حسب السنة
      let filteredCars = cars;
      if (filters.yearFrom || filters.yearTo) {
        filteredCars = cars.filter(car => {
          if (!car.year) return false;
          if (filters.yearFrom && car.year < filters.yearFrom) return false;
          if (filters.yearTo && car.year > filters.yearTo) return false;
          return true;
        });
      }

      const marketStats = this.calculateMarketStats(filteredCars);

      // تقييم أفضل الصفقات
      const dealsWithRating = await Promise.all(
        filteredCars.slice(0, 20).map(async car => ({
          car,
          rating: await this.rateDeal(car)
        }))
      );

      const topDeals = dealsWithRating
        .filter(d => d.rating.rating === 'Excellent' || d.rating.rating === 'Good')
        .sort((a, b) => b.rating.score - a.rating.score)
        .slice(0, 10);

      return {
        totalCars: filteredCars.length,
        averagePrice: marketStats.average,
        medianPrice: marketStats.median,
        priceRange: { min: marketStats.min, max: marketStats.max },
        topDeals
      };

    } catch (error) {
      logger.error('Error analyzing market', error as Error);
      throw error;
    }
  }
}

export const dealRatingService = DealRatingService.getInstance();
export default dealRatingService;
