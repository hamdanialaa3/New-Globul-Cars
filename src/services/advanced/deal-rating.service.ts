// Deal Rating Service
// Analyzes price compared to market and rates the deal

import { db } from '../../firebase/firebase-config';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { CarListing } from '../../types/CarListing';
import { logger } from '../logger-service';
import { queryAllCollections } from '../multi-collection-helper';

export interface DealRating {
  score: number; // 0-100
  rating: 'Excellent' | 'Great' | 'Good' | 'Fair' | 'Overpriced' | 'Unknown';
  confidence: number; // 0-1
  reasons: string[];
  marketComparison: {
    averagePrice: number;
    medianPrice: number;
    lowestPrice: number;
    highestPrice: number;
    yourPrice: number;
    savings: number; // positive = saving, negative = overpaying
    savingsPercentage: number;
    sampleSize: number;
  };
  factors: {
    priceScore: number; // 0-100
    mileageScore: number; // 0-100
    conditionScore: number; // 0-100
    ageScore: number; // 0-100
    equipmentScore: number; // 0-100
    sellerScore: number; // 0-100
  };
  recommendations: string[];
}

export interface SimilarCarsQuery {
  make: string;
  model?: string;
  year?: number;
  yearRange?: number; // ±2 years default
  fuelType?: string;
  transmission?: string;
  excludeCarId?: string;
  limit?: number;
}

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
   * Calculate deal rating for a car
   */
  async calculateDealRating(car: CarListing): Promise<DealRating> {
    try {
      logger.info('Calculating deal rating', { carId: car.id });

      // 1. Find similar cars
      const similarCars = await this.findSimilarCars({
        make: car.make,
        model: car.model,
        year: car.year,
        yearRange: 2,
        fuelType: car.fuelType,
        excludeCarId: car.id,
        limit: 50
      });

      if (similarCars.length < 3) {
        logger.warn('Not enough similar cars for accurate rating', { count: similarCars.length });
        return this.createUnknownRating(car);
      }

      // 2. Calculate market statistics
      const marketStats = this.calculateMarketStats(similarCars, car.price);

      // 3. Calculate individual factor scores
      const factors = await this.calculateFactorScores(car, similarCars);

      // 4. Calculate overall score (weighted average)
      const weights = {
        priceScore: 0.35,
        mileageScore: 0.20,
        conditionScore: 0.15,
        ageScore: 0.10,
        equipmentScore: 0.10,
        sellerScore: 0.10
      };

      const score = Math.round(
        factors.priceScore * weights.priceScore +
        factors.mileageScore * weights.mileageScore +
        factors.conditionScore * weights.conditionScore +
        factors.ageScore * weights.ageScore +
        factors.equipmentScore * weights.equipmentScore +
        factors.sellerScore * weights.sellerScore
      );

      // 5. Determine rating category
      const rating = this.getRatingCategory(score);

      // 6. Generate reasons and recommendations
      const reasons = this.generateReasons(car, marketStats, factors);
      const recommendations = this.generateRecommendations(car, marketStats, factors);

      // 7. Calculate confidence based on sample size
      const confidence = Math.min(1, similarCars.length / 20);

      return {
        score,
        rating,
        confidence,
        reasons,
        marketComparison: marketStats,
        factors,
        recommendations
      };

    } catch (error) {
      logger.error('Failed to calculate deal rating', error as Error, { carId: car.id });
      return this.createUnknownRating(car);
    }
  }

  /**
   * Find similar cars in the market
   */
  private async findSimilarCars(params: SimilarCarsQuery): Promise<CarListing[]> {
    const {
      make,
      model,
      year,
      yearRange = 2,
      fuelType,
      transmission,
      excludeCarId,
      limit: maxResults = 50
    } = params;

    try {
      // Build constraints
      const constraints: unknown[] = [
        where('status', '==', 'active'),
        where('make', '==', make)
      ];

      if (model) {
        constraints.push(where('model', '==', model));
      }

      if (fuelType) {
        constraints.push(where('fuelType', '==', fuelType));
      }

      if (transmission) {
        constraints.push(where('transmission', '==', transmission));
      }

      // Query all vehicle collections
      const allCars = await queryAllCollections<CarListing>(...constraints);

      // Filter by year range and exclude current car
      let filtered = allCars.filter(c => {
        if (excludeCarId && c.id === excludeCarId) return false;
        if (year && c.year) {
          const yearDiff = Math.abs(c.year - year);
          if (yearDiff > yearRange) return false;
        }
        return true;
      });

      // Sort by similarity (exact model match first, then by year closeness)
      filtered.sort((a, b) => {
        // Exact model match gets priority
        const aModelMatch = model && a.model === model ? 1 : 0;
        const bModelMatch = model && b.model === model ? 1 : 0;
        if (aModelMatch !== bModelMatch) return bModelMatch - aModelMatch;

        // Then by year closeness
        if (year && a.year && b.year) {
          const aYearDiff = Math.abs(a.year - year);
          const bYearDiff = Math.abs(b.year - year);
          return aYearDiff - bYearDiff;
        }

        return 0;
      });

      return filtered.slice(0, maxResults);

    } catch (error) {
      logger.error('Failed to find similar cars', error as Error, { params });
      return [];
    }
  }

  /**
   * Calculate market statistics
   */
  private calculateMarketStats(
    similarCars: CarListing[],
    yourPrice: number
  ): DealRating['marketComparison'] {
    const prices = similarCars.map(c => c.price).filter(p => p > 0).sort((a, b) => a - b);

    if (prices.length === 0) {
      return {
        averagePrice: yourPrice,
        medianPrice: yourPrice,
        lowestPrice: yourPrice,
        highestPrice: yourPrice,
        yourPrice,
        savings: 0,
        savingsPercentage: 0,
        sampleSize: 0
      };
    }

    const averagePrice = Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length);
    const medianPrice = prices[Math.floor(prices.length / 2)];
    const lowestPrice = prices[0];
    const highestPrice = prices[prices.length - 1];
    const savings = averagePrice - yourPrice;
    const savingsPercentage = Math.round((savings / averagePrice) * 100);

    return {
      averagePrice,
      medianPrice,
      lowestPrice,
      highestPrice,
      yourPrice,
      savings,
      savingsPercentage,
      sampleSize: prices.length
    };
  }

  /**
   * Calculate individual factor scores
   */
  private async calculateFactorScores(
    car: CarListing,
    similarCars: CarListing[]
  ): Promise<DealRating['factors']> {
    // Price score (0-100, higher = better deal)
    const priceScore = this.calculatePriceScore(car.price, similarCars);

    // Mileage score (0-100, lower mileage = higher score)
    const mileageScore = this.calculateMileageScore(car.mileage || 0, similarCars);

    // Condition score
    const conditionScore = this.calculateConditionScore(car.condition);

    // Age score (newer = higher score)
    const ageScore = this.calculateAgeScore(car.year || new Date().getFullYear());

    // Equipment score
    const equipmentScore = this.calculateEquipmentScore(car);

    // Seller score
    const sellerScore = await this.calculateSellerScore(car.sellerId);

    return {
      priceScore,
      mileageScore,
      conditionScore,
      ageScore,
      equipmentScore,
      sellerScore
    };
  }

  /**
   * Calculate price score
   */
  private calculatePriceScore(price: number, similarCars: CarListing[]): number {
    if (similarCars.length === 0) return 50;

    const prices = similarCars.map(c => c.price).filter(p => p > 0);
    const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;

    // Calculate how much below/above average
    const percentDiff = ((avgPrice - price) / avgPrice) * 100;

    // Convert to 0-100 score
    // -30% or more below average = 100 (excellent deal)
    // At average = 50
    // +30% or more above average = 0 (bad deal)
    const score = 50 + (percentDiff * 1.67); // Scale to 0-100

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Calculate mileage score
   */
  private calculateMileageScore(mileage: number, similarCars: CarListing[]): number {
    const mileages = similarCars.map(c => c.mileage || 0).filter(m => m > 0);
    if (mileages.length === 0) return 50;

    const avgMileage = mileages.reduce((sum, m) => sum + m, 0) / mileages.length;
    
    // Lower mileage than average = higher score
    const percentDiff = ((avgMileage - mileage) / avgMileage) * 100;
    const score = 50 + (percentDiff * 1.67);

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Calculate condition score
   */
  private calculateConditionScore(condition?: string): number {
    const conditionScores: Record<string, number> = {
      'new': 100,
      'excellent': 90,
      'very-good': 80,
      'good': 70,
      'fair': 50,
      'poor': 30,
      'damaged': 10
    };

    return conditionScores[condition?.toLowerCase() || ''] || 50;
  }

  /**
   * Calculate age score
   */
  private calculateAgeScore(year: number): number {
    const currentYear = new Date().getFullYear();
    const age = currentYear - year;

    // 0 years = 100, 15+ years = 0
    const score = Math.max(0, 100 - (age * 6.67));
    return Math.round(score);
  }

  /**
   * Calculate equipment score
   */
  private calculateEquipmentScore(car: CarListing): number {
    let score = 50; // Base score

    // Check for valuable equipment
    const valuableFeatures = [
      'navigation',
      'leather-seats',
      'sunroof',
      'parking-sensors',
      'rear-camera',
      'adaptive-cruise',
      'lane-assist',
      'heated-seats',
      'climate-control'
    ];

    const equipment = [
      ...(car.safetyEquipment || []),
      ...(car.comfortEquipment || []),
      ...(car.infotainmentEquipment || []),
      ...(car.extras || [])
    ];

    const valuableFeaturesCount = equipment.filter(e => 
      valuableFeatures.some(vf => e.toLowerCase().includes(vf))
    ).length;

    // +5 points per valuable feature, max +50
    score += Math.min(50, valuableFeaturesCount * 5);

    return Math.round(score);
  }

  /**
   * Calculate seller score
   */
  private async calculateSellerScore(sellerId: string): number {
    try {
      // Get seller ratings, reviews, verification status, etc.
      // For now, return base score
      return 70; // TODO: Implement seller reputation system
    } catch (error) {
      return 50;
    }
  }

  /**
   * Determine rating category from score
   */
  private getRatingCategory(score: number): DealRating['rating'] {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Great';
    if (score >= 55) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Overpriced';
  }

  /**
   * Generate reasons for the rating
   */
  private generateReasons(
    car: CarListing,
    marketStats: DealRating['marketComparison'],
    factors: DealRating['factors']
  ): string[] {
    const reasons: string[] = [];

    // Price reasons
    if (marketStats.savingsPercentage > 15) {
      reasons.push(`${marketStats.savingsPercentage}% below market average (saving ${marketStats.savings} лв)`);
    } else if (marketStats.savingsPercentage < -15) {
      reasons.push(`${Math.abs(marketStats.savingsPercentage)}% above market average`);
    } else {
      reasons.push(`Price is close to market average`);
    }

    // Mileage reasons
    if (factors.mileageScore >= 70 && car.mileage) {
      reasons.push(`Low mileage (${car.mileage.toLocaleString()} km)`);
    } else if (factors.mileageScore < 40 && car.mileage) {
      reasons.push(`High mileage (${car.mileage.toLocaleString()} km)`);
    }

    // Condition reasons
    if (factors.conditionScore >= 80) {
      reasons.push(`Excellent condition`);
    }

    // Age reasons
    if (factors.ageScore >= 80) {
      reasons.push(`Recent model (${car.year})`);
    }

    // Equipment reasons
    if (factors.equipmentScore >= 70) {
      reasons.push(`Rich equipment`);
    }

    return reasons;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    car: CarListing,
    marketStats: DealRating['marketComparison'],
    factors: DealRating['factors']
  ): string[] {
    const recommendations: string[] = [];

    if (factors.priceScore >= 70) {
      recommendations.push('Good deal - negotiate quickly');
    } else if (factors.priceScore < 40) {
      recommendations.push('Try to negotiate the price by 10-15%');
    }

    if (marketStats.sampleSize < 10) {
      recommendations.push('Compare with more similar options');
    }

    if (factors.mileageScore < 50) {
      recommendations.push('Check the service history carefully');
    }

    if (factors.sellerScore < 60) {
      recommendations.push('Check the seller reputation and ratings');
    }

    return recommendations;
  }

  /**
   * Create unknown rating (not enough data)
   */
  private createUnknownRating(car: CarListing): DealRating {
    return {
      score: 50,
      rating: 'Unknown',
      confidence: 0,
      reasons: ['Not enough data to rate this deal'],
      marketComparison: {
        averagePrice: car.price,
        medianPrice: car.price,
        lowestPrice: car.price,
        highestPrice: car.price,
        yourPrice: car.price,
        savings: 0,
        savingsPercentage: 0,
        sampleSize: 0
      },
      factors: {
        priceScore: 50,
        mileageScore: 50,
        conditionScore: 50,
        ageScore: 50,
        equipmentScore: 50,
        sellerScore: 50
      },
      recommendations: ['Search for more similar cars to compare']
    };
  }

  /**
   * Get best deals in the market
   */
  async getBestDeals(limit: number = 20): Promise<{ car: CarListing; rating: DealRating }[]> {
    try {
      // Get all active cars
      const allCars = await queryAllCollections<CarListing>(
        where('status', '==', 'active')
      );

      // Calculate rating for each
      const carsWithRatings = await Promise.all(
        allCars.slice(0, 100).map(async car => ({
          car,
          rating: await this.calculateDealRating(car)
        }))
      );

      // Sort by score (highest first) and filter only good deals
      const bestDeals = carsWithRatings
        .filter(({ rating }) => rating.score >= 70)
        .sort((a, b) => b.rating.score - a.rating.score)
        .slice(0, limit);

      return bestDeals;

    } catch (error) {
      logger.error('Failed to get best deals', error as Error);
      return [];
    }
  }
}

export const dealRatingService = DealRatingService.getInstance();
