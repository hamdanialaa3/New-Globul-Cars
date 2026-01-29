// src/services/comparison/comparison.service.ts
// Car Comparison Service - خدمة مقارنة السيارات
// الهدف: نظام مقارنة متقدم (Battle Mode)
// الموقع: بلغاريا | اللغات: BG/EN

import {
  ComparisonCar,
  ComparisonResults,
  CarDifferences,
  ComparisonWinners
} from '../../types/comparison.types';
import { serviceLogger } from '../logger-service';

// ==================== SERVICE CLASS ====================

/**
 * Car Comparison Service
 * خدمة مقارنة السيارات المتقدمة
 */
export class ComparisonService {
  private static instance: ComparisonService;

  private constructor() {}

  public static getInstance(): ComparisonService {
    if (!ComparisonService.instance) {
      ComparisonService.instance = new ComparisonService();
    }
    return ComparisonService.instance;
  }

  // ==================== PUBLIC METHODS ====================

  /**
   * Compare two cars and get detailed differences
   * مقارنة سيارتين والحصول على الفروقات التفصيلية
   */
  compareCars(carA: ComparisonCar, carB: ComparisonCar): ComparisonResults {
    try {
      const differences = this.calculateDifferences(carA, carB);
      const winners = this.determineWinners(carA, carB, differences);
      const overallWinner = this.determineOverallWinner(winners);
      const recommendation = this.generateRecommendation(carA, carB, differences, winners, overallWinner);

      return {
        differences,
        winners,
        overallWinner,
        recommendation
      };
    } catch (error) {
      serviceLogger.error('Error comparing cars', error as Error, { carA: carA.id, carB: carB.id });
      throw error;
    }
  }

  /**
   * Calculate differences between two cars
   * حساب الفروقات بين سيارتين
   */
  calculateDifferences(carA: ComparisonCar, carB: ComparisonCar): CarDifferences {
    const priceDelta = carA.price - carB.price;
    const yearDelta = carA.year - carB.year;
    const mileageDelta = carA.mileage - carB.mileage;
    const powerDelta = (carA.power || 0) - (carB.power || 0);

    // Find unique features
    const featuresA = carA.features || [];
    const featuresB = carB.features || [];
    
    const uniqueFeaturesA = featuresA.filter(f => !featuresB.includes(f));
    const uniqueFeaturesB = featuresB.filter(f => !featuresA.includes(f));

    return {
      priceDelta,
      yearDelta,
      mileageDelta,
      powerDelta: powerDelta !== 0 ? powerDelta : undefined,
      uniqueFeaturesA,
      uniqueFeaturesB
    };
  }

  /**
   * Determine winners in each category
   * تحديد الفائز في كل فئة
   */
  determineWinners(
    carA: ComparisonCar,
    carB: ComparisonCar,
    differences: CarDifferences
  ): ComparisonWinners {
    return {
      price: carA.price < carB.price ? 'A' : 'B',
      year: carA.year > carB.year ? 'A' : 'B',
      mileage: carA.mileage < carB.mileage ? 'A' : 'B',
      power: carA.power && carB.power
        ? (carA.power > carB.power ? 'A' : 'B')
        : undefined,
      features: differences.uniqueFeaturesA.length > differences.uniqueFeaturesB.length
        ? 'A'
        : differences.uniqueFeaturesB.length > differences.uniqueFeaturesA.length
        ? 'B'
        : 'tie'
    };
  }

  /**
   * Determine overall winner
   * تحديد الفائز الإجمالي
   */
  determineOverallWinner(winners: ComparisonWinners): 'A' | 'B' | 'tie' {
    let scoreA = 0;
    let scoreB = 0;

    // Count wins (weighted by importance)
    if (winners.price === 'A') scoreA += 3; else if (winners.price === 'B') scoreB += 3;
    if (winners.year === 'A') scoreA += 2; else if (winners.year === 'B') scoreB += 2;
    if (winners.mileage === 'A') scoreA += 2; else if (winners.mileage === 'B') scoreB += 2;
    if (winners.power === 'A') scoreA += 1; else if (winners.power === 'B') scoreB += 1;
    if (winners.features === 'A') scoreA += 1; else if (winners.features === 'B') scoreB += 1;

    if (scoreA > scoreB) return 'A';
    if (scoreB > scoreA) return 'B';
    return 'tie';
  }

  /**
   * Generate recommendation text
   * توليد نص التوصية
   */
  generateRecommendation(
    carA: ComparisonCar,
    carB: ComparisonCar,
    differences: CarDifferences,
    winners: ComparisonWinners,
    overallWinner: 'A' | 'B' | 'tie'
  ): string {
    const recommendations: string[] = [];

    // Price recommendation
    if (Math.abs(differences.priceDelta) > 5000) {
      const cheaper = differences.priceDelta < 0 ? 'A' : 'B';
      const savings = Math.abs(differences.priceDelta);
      recommendations.push(
        `Car ${cheaper} is ${savings.toLocaleString()} BGN cheaper, offering better value`
      );
      recommendations.push(
        `Кола ${cheaper} е с ${savings.toLocaleString()} лв. по-евтина, предлага по-добра стойност`
      );
    }

    // Year recommendation
    if (Math.abs(differences.yearDelta) >= 2) {
      const newer = differences.yearDelta > 0 ? 'A' : 'B';
      recommendations.push(
        `Car ${newer} is ${Math.abs(differences.yearDelta)} years newer, likely with better technology`
      );
      recommendations.push(
        `Кола ${newer} е с ${Math.abs(differences.yearDelta)} години по-нова, вероятно с по-добра технология`
      );
    }

    // Mileage recommendation
    if (Math.abs(differences.mileageDelta) > 50000) {
      const lowerMileage = differences.mileageDelta < 0 ? 'A' : 'B';
      const diff = Math.abs(differences.mileageDelta / 1000);
      recommendations.push(
        `Car ${lowerMileage} has ${diff.toFixed(0)}k km less, potentially longer lifespan`
      );
      recommendations.push(
        `Кола ${lowerMileage} има с ${diff.toFixed(0)}k км по-малко, потенциално по-дълъг живот`
      );
    }

    // Overall recommendation
    if (overallWinner !== 'tie') {
      recommendations.push(
        `Overall, Car ${overallWinner} appears to be the better choice based on the comparison`
      );
      recommendations.push(
        `Като цяло, Кола ${overallWinner} изглежда по-добър избор въз основа на сравнението`
      );
    } else {
      recommendations.push(
        'Both cars are very similar. Choose based on your personal preferences and test drive experience'
      );
      recommendations.push(
        'Двете коли са много сходни. Изберете въз основа на личните си предпочитания и опита от тест драйв'
      );
    }

    return recommendations.join('\n');
  }

  /**
   * Format comparison summary for display
   * تنسيق ملخص المقارنة للعرض
   */
  formatComparisonSummary(results: ComparisonResults): string {
    const { differences, winners, overallWinner } = results;
    
    const summary: string[] = [];
    summary.push(`Price Difference: ${Math.abs(differences.priceDelta).toLocaleString()} BGN (${winners.price} wins)`);
    summary.push(`Year Difference: ${Math.abs(differences.yearDelta)} years (${winners.year} wins)`);
    summary.push(`Mileage Difference: ${Math.abs(differences.mileageDelta).toLocaleString()} km (${winners.mileage} wins)`);
    
    if (overallWinner) {
      summary.push(`Overall Winner: Car ${overallWinner}`);
    }
    
    return summary.join('\n');
  }
}

// Export singleton instance
export const comparisonService = ComparisonService.getInstance();

