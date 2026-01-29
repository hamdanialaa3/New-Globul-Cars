import { serviceLogger } from './logger-service';
import { MarketAnalysis, ResaleRecommendation, ResaleStrategy } from './autonomous-resale-types';
import {
  calculateStrategyPrices,
  analyzeOptimalTiming,
  analyzeMarketConditions,
  generateRecommendation
} from './autonomous-resale-analysis';

/**
 * Resale Recommendations Manager
 * Handles generation and management of resale recommendations
 */
export class ResaleRecommendationsManager {
  private static instance: ResaleRecommendationsManager;

  private constructor() {}

  static getInstance(): ResaleRecommendationsManager {
    if (!ResaleRecommendationsManager.instance) {
      ResaleRecommendationsManager.instance = new ResaleRecommendationsManager();
    }
    return ResaleRecommendationsManager.instance;
  }

  /**
   * Generate comprehensive resale recommendations
   */
  async generateResaleRecommendations(analysis: MarketAnalysis): Promise<ResaleRecommendation[]> {
    try {
      serviceLogger.info('Generating resale recommendations', {
        make: analysis.car.make,
        model: analysis.car.model
      });

      const recommendations: ResaleRecommendation[] = [];

      // Analyze optimal timing
      const timing = await analyzeOptimalTiming(analysis);

      // Analyze market conditions
      const conditions = await analyzeMarketConditions(analysis);

      // Generate main recommendation
      const mainRecommendation = generateRecommendation(analysis, timing, conditions);

      recommendations.push({
        id: 'main-recommendation',
        type: 'timing',
        title: 'توصية البيع الرئيسية',
        description: this.getRecommendationDescription(mainRecommendation.action),
        action: mainRecommendation.action,
        confidence: mainRecommendation.confidence,
        reasoning: mainRecommendation.reasoning,
        alternatives: mainRecommendation.alternatives,
        expectedPrice: analysis.marketValue,
        timeFrame: this.getTimeFrame(mainRecommendation.action),
        marketConditions: conditions
      });

      // Add strategy-based recommendations
      const strategies: ResaleStrategy[] = ['balanced', 'aggressive', 'conservative'];

      strategies.forEach(strategy => {
        const prices = calculateStrategyPrices(analysis, strategy);
        recommendations.push({
          id: `strategy-${strategy}`,
          type: 'pricing',
          title: `استراتيجية ${this.getStrategyName(strategy)}`,
          description: this.getStrategyDescription(strategy),
          action: 'price',
          confidence: this.getStrategyConfidence(strategy, analysis.confidence),
          reasoning: [this.getStrategyReasoning(strategy)],
          alternatives: [],
          expectedPrice: prices.target,
          minimumPrice: prices.minimum,
          timeFrame: 'immediate',
          marketConditions: conditions
        });
      });

      // Add timing recommendation if not current month
      if (timing.bestMonth !== new Date().toLocaleString('en', { month: 'long' })) {
        recommendations.push({
          id: 'timing-optimization',
          type: 'timing',
          title: 'تحسين التوقيت',
          description: `أفضل شهر للبيع هو ${timing.bestMonth} مع زيادة متوقعة ${timing.expectedPriceIncrease.toFixed(1)}%`,
          action: 'wait',
          confidence: 75,
          reasoning: ['التوقيت الموسمي يؤثر على أسعار السيارات'],
          alternatives: ['البيع الفوري', 'الانتظار للموسم التالي'],
          expectedPrice: analysis.marketValue * (1 + timing.expectedPriceIncrease / 100),
          timeFrame: `حتى ${timing.bestMonth}`,
          marketConditions: conditions
        });
      }

      serviceLogger.info('Resale recommendations generated', {
        make: analysis.car.make,
        model: analysis.car.model,
        recommendationsCount: recommendations.length
      });

      return recommendations;

    } catch (error) {
      serviceLogger.error('Resale recommendations generation failed', error as Error, {
        make: analysis.car.make,
        model: analysis.car.model
      });
      throw error;
    }
  }

  /**
   * Create analysis summary
   */
  createAnalysisSummary(
    analysis: MarketAnalysis,
    recommendations: ResaleRecommendation[]
  ): {
    optimalPrice: number;
    confidence: number;
    recommendedAction: string;
    timeFrame: string;
  } {
    const bestRecommendation = recommendations.find(r => r.confidence === Math.max(...recommendations.map(r => r.confidence)));
    return {
      optimalPrice: bestRecommendation?.expectedPrice || analysis.marketValue,
      confidence: bestRecommendation?.confidence || analysis.confidence,
      recommendedAction: this.getActionDescription(bestRecommendation?.action || 'hold'),
      timeFrame: bestRecommendation?.timeFrame || 'flexible'
    };
  }

  /**
   * Get recommendation description
   */
  private getRecommendationDescription(action: string): string {
    switch (action) {
      case 'sell_now':
        return 'السوق مواتية للبيع الفوري - الطلب مرتفع والأسعار جيدة';
      case 'wait':
        return 'انتظر توقيت أفضل لتحقيق سعر أعلى';
      case 'hold':
      default:
        return 'احتفظ بالسيارة حتى تحسن الظروف السوقية';
    }
  }

  /**
   * Get time frame description
   */
  private getTimeFrame(action: string): string {
    switch (action) {
      case 'sell_now':
        return 'فوري (أسبوعين)';
      case 'wait':
        return '1-3 أشهر';
      case 'hold':
      default:
        return 'مرن';
    }
  }

  /**
   * Get strategy name in Arabic
   */
  private getStrategyName(strategy: string): string {
    switch (strategy) {
      case 'aggressive':
        return 'هجومية';
      case 'conservative':
        return 'حذرة';
      case 'balanced':
      default:
        return 'متوازنة';
    }
  }

  /**
   * Get strategy description
   */
  private getStrategyDescription(strategy: string): string {
    switch (strategy) {
      case 'aggressive':
        return 'استراتيجية عالية المخاطر لتحقيق أقصى ربح';
      case 'conservative':
        return 'استراتيجية آمنة لضمان البيع السريع';
      case 'balanced':
      default:
        return 'استراتيجية متوازنة بين الربح والسرعة';
    }
  }

  /**
   * Get strategy confidence
   */
  private getStrategyConfidence(strategy: string, baseConfidence: number): number {
    switch (strategy) {
      case 'aggressive':
        return Math.min(100, baseConfidence - 10);
      case 'conservative':
        return Math.min(100, baseConfidence + 5);
      case 'balanced':
      default:
        return baseConfidence;
    }
  }

  /**
   * Get strategy reasoning
   */
  private getStrategyReasoning(strategy: string): string {
    switch (strategy) {
      case 'aggressive':
        return 'محاولة تحقيق أعلى سعر ممكن مع قبول مخاطر أطول وقت بيع';
      case 'conservative':
        return 'ضمان البيع السريع بقبول سعر أقل قليلاً';
      case 'balanced':
      default:
        return 'توازن بين الربح والسرعة في البيع';
    }
  }

  /**
   * Get action description in Arabic
   */
  private getActionDescription(action: string): string {
    switch (action) {
      case 'sell_now':
        return 'بيع فوري';
      case 'wait':
        return 'انتظار أفضل توقيت';
      case 'hold':
      default:
        return 'الاحتفاظ بالسيارة';
    }
  }
}

// Export singleton instance
export const resaleRecommendationsManager = ResaleRecommendationsManager.getInstance();