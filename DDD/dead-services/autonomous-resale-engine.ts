import { serviceLogger } from './logger-service';
import {
  MarketAnalysis,
  ResaleRecommendation
} from './autonomous-resale-types';
import {
  findComparableSales,
  calculateMarketValue,
  assessCondition,
  calculateConfidence,
  analyzeMarketTrends,
  calculateDemandLevel
} from './autonomous-resale-analysis';
import { autonomousSaleStrategyManager } from './autonomous-resale-strategy';
import { resaleRecommendationsManager } from './autonomous-resale-recommendations';

/**
 * Autonomous Resale Engine - Main orchestrator for car resale analysis
 * Provides comprehensive market analysis and resale recommendations
 */
export class AutonomousResaleEngine {
  private static instance: AutonomousResaleEngine;

  private constructor() {}

  static getInstance(): AutonomousResaleEngine {
    if (!AutonomousResaleEngine.instance) {
      AutonomousResaleEngine.instance = new AutonomousResaleEngine();
    }
    return AutonomousResaleEngine.instance;
  }

  /**
   * Perform comprehensive market analysis for a car
   */
  async analyzeCarResale(car: {
    make: string;
    model: string;
    year: number;
    mileage: number;
    price?: number;
    location?: string;
    condition?: string;
  }): Promise<MarketAnalysis> {
    try {
      serviceLogger.info('Starting autonomous resale analysis', { make: car.make, model: car.model, year: car.year });

      // Find comparable sales
      const comparables = await findComparableSales(car);

      // Calculate market value
      const marketValue = calculateMarketValue(car, comparables);

      // Assess condition
      const condition = assessCondition(car);

      // Calculate confidence
      const confidence = calculateConfidence(comparables);

      // Analyze market trends
      const marketTrend = await analyzeMarketTrends(car.make, car.model);

      // Calculate demand level
      const demandLevel = calculateDemandLevel(comparables);

      const analysis: MarketAnalysis = {
        car: {
          make: car.make,
          model: car.model,
          year: car.year,
          mileage: car.mileage,
          price: car.price,
          location: car.location || 'Bulgaria',
          condition
        },
        marketValue,
        comparables,
        confidence,
        marketTrend,
        demandLevel,
        analysisDate: new Date(),
        recommendations: []
      };

      serviceLogger.info('Market analysis completed', {
        make: car.make,
        model: car.model,
        marketValue,
        confidence,
        comparablesCount: comparables.length
      });

      return analysis;

    } catch (error) {
      serviceLogger.error('Autonomous resale analysis failed', error as Error, {
        make: car.make,
        model: car.model,
        year: car.year
      });
      throw error;
    }
  }

  /**
   * Create autonomous sale strategy for a car
   */
  async createAutonomousSaleStrategy(
    vin: string,
    userId: string,
    strategy: 'aggressive' | 'conservative' | 'balanced'
  ): Promise<string> {
    try {
      serviceLogger.info('Creating autonomous sale strategy', { vin, userId, strategy });

      // First perform market analysis
      const marketAnalysis = await this.analyzeCarResale({
        make: '', model: '', year: 0, mileage: 0, location: 'Bulgaria'
      });

      // Create strategy using manager
      return await autonomousSaleStrategyManager.createAutonomousSaleStrategy(
        vin,
        userId,
        marketAnalysis.marketValue,
        strategy
      );

    } catch (error) {
      serviceLogger.error('Sale strategy creation failed', error as Error, { vin, userId, strategy });
      throw new Error('فشل في إنشاء استراتيجية البيع');
    }
  }

  /**
   * Process sale offer
   */
  async processSaleOffer(strategyId: string, offer: any): Promise<void> {
    return await autonomousSaleStrategyManager.processSaleOffer(strategyId, offer);
  }

  /**
   * Generate resale recommendations based on market analysis
   */
  async generateResaleRecommendations(analysis: MarketAnalysis): Promise<ResaleRecommendation[]> {
    return await resaleRecommendationsManager.generateResaleRecommendations(analysis);
  }

  /**
   * Get comprehensive resale analysis with recommendations
   */
  async getCompleteResaleAnalysis(car: {
    make: string;
    model: string;
    year: number;
    mileage: number;
    price?: number;
    location?: string;
    condition?: string;
  }): Promise<{
    analysis: MarketAnalysis;
    recommendations: ResaleRecommendation[];
    summary: {
      optimalPrice: number;
      confidence: number;
      recommendedAction: string;
      timeFrame: string;
    };
  }> {
    try {
      serviceLogger.info('Starting complete resale analysis', {
        make: car.make,
        model: car.model,
        year: car.year
      });

      // Perform market analysis
      const analysis = await this.analyzeCarResale(car);

      // Generate recommendations
      const recommendations = await this.generateResaleRecommendations(analysis);

      // Create summary
      const summary = resaleRecommendationsManager.createAnalysisSummary(analysis, recommendations);

      serviceLogger.info('Complete resale analysis finished', {
        make: car.make,
        model: car.model,
        optimalPrice: summary.optimalPrice,
        confidence: summary.confidence
      });

      return {
        analysis,
        recommendations,
        summary
      };

    } catch (error) {
      serviceLogger.error('Complete resale analysis failed', error as Error, {
        make: car.make,
        model: car.model,
        year: car.year
      });
      throw error;
    }
  }
}

// Export singleton instance
export const autonomousResaleEngine = AutonomousResaleEngine.getInstance();