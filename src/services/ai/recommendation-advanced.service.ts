/**
 * Advanced Recommendation Engine
 * محرك التوصيات المتقدم
 */

import { logger } from '@/services/logger-service';
import { db } from '@/firebase/firebase-config';

interface UserPreferences {
  userId: string;
  favoredMakes: { [make: string]: number };
  priceRange: { min: number; max: number };
  preferredBodyTypes: string[];
  preferredFuelTypes: string[];
  preferredTransmissions: string[];
  locationPreferences: string[];
  agePreferences: { min: number; max: number };
  mileagePreferences: { min: number; max: number };
}

interface CarRecommendation {
  carId: string;
  make: string;
  model: string;
  year: number;
  price: number;
  matchScore: number; // 0-100
  matchReasons: string[];
  sellerId: string;
  image: string;
  location: string;
}

interface UserBehavior {
  viewedCars: string[];
  savedCars: string[];
  inquiredCars: string[];
  viewHistory: Array<{
    carId: string;
    timestamp: number;
    duration: number; // seconds
  }>;
  inquiryHistory: Array<{
    carId: string;
    timestamp: number;
  }>;
}

interface CollaborativeFilteringResult {
  similarUsers: Array<{
    userId: string;
    similarity: number;
  }>;
  recommendedCars: CarRecommendation[];
}

class AdvancedRecommendationEngine {
  private static instance: AdvancedRecommendationEngine;
  private userPreferences: Map<string, UserPreferences> = new Map();
  private userBehavior: Map<string, UserBehavior> = new Map();

  private constructor() {}

  static getInstance(): AdvancedRecommendationEngine {
    if (!this.instance) {
      this.instance = new AdvancedRecommendationEngine();
    }
    return this.instance;
  }

  /**
   * Get personalized recommendations for user
   */
  async getPersonalizedRecommendations(
    userId: string,
    availableCars: any[],
    limit = 10
  ): Promise<CarRecommendation[]> {
    try {
      logger.info('Getting personalized recommendations', { userId, carsAvailable: availableCars.length });

      // Get or build user preferences
      let preferences = this.userPreferences.get(userId);
      if (!preferences) {
        preferences = this.buildUserPreferences(userId);
      }

      // Get user behavior
      let behavior = this.userBehavior.get(userId);
      if (!behavior) {
        behavior = {
          viewedCars: [],
          savedCars: [],
          inquiredCars: [],
          viewHistory: [],
          inquiryHistory: []
        };
      }

      // Score each car
      const scoredCars = availableCars.map((car: any) => ({
        ...car,
        score: this.calculateMatchScore(car, preferences, behavior)
      }));

      // Sort by score
      const recommendations = scoredCars
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((car: any) => ({
          carId: car.id,
          make: car.make,
          model: car.model,
          year: car.year,
          price: car.price,
          matchScore: car.score,
          matchReasons: this.getMatchReasons(car, preferences),
          sellerId: car.sellerId,
          image: car.images?.[0] || '',
          location: car.location
        }));

      logger.info('Recommendations generated', { userId, count: recommendations.length });

      return recommendations;
    } catch (error) {
      logger.error('Recommendation generation failed', error as Error);
      return [];
    }
  }

  /**
   * Content-based recommendation (similar to saved cars)
   */
  async getContentBasedRecommendations(
    userId: string,
    availableCars: any[],
    limit = 10
  ): Promise<CarRecommendation[]> {
    try {
      const behavior = this.userBehavior.get(userId);
      if (!behavior || behavior.savedCars.length === 0) {
        return [];
      }

      // Find cars similar to saved cars
      const savedCarFeatures = this.extractCommonFeatures(behavior.savedCars, availableCars);

      const recommendations = availableCars
        .filter((car: any) => !behavior.savedCars.includes(car.id))
        .map((car: any) => ({
          ...car,
          similarity: this.calculateSimilarity(car, savedCarFeatures)
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit)
        .map((car: any) => ({
          carId: car.id,
          make: car.make,
          model: car.model,
          year: car.year,
          price: car.price,
          matchScore: car.similarity,
          matchReasons: [`Similar to cars you saved`],
          sellerId: car.sellerId,
          image: car.images?.[0] || '',
          location: car.location
        }));

      return recommendations;
    } catch (error) {
      logger.error('Content-based recommendation failed', error as Error);
      return [];
    }
  }

  /**
   * Collaborative filtering (popular cars liked by similar users)
   */
  async getCollaborativeRecommendations(
    userId: string,
    allUsers: any[],
    availableCars: any[],
    limit = 10
  ): Promise<CollaborativeFilteringResult> {
    try {
      const userBehavior = this.userBehavior.get(userId);
      if (!userBehavior) {
        return { similarUsers: [], recommendedCars: [] };
      }

      // Find similar users
      const similarUsers = this.findSimilarUsers(userId, allUsers, userBehavior);

      // Get cars liked by similar users (but not by current user)
      const likedBySimilar = this.getCarLikedBySimilarUsers(
        similarUsers,
        userBehavior,
        availableCars
      );

      const recommendations = likedBySimilar
        .slice(0, limit)
        .map((car: any) => ({
          carId: car.id,
          make: car.make,
          model: car.model,
          year: car.year,
          price: car.price,
          matchScore: car.popularity,
          matchReasons: [`Popular among users with similar interests`],
          sellerId: car.sellerId,
          image: car.images?.[0] || '',
          location: car.location
        }));

      return {
        similarUsers,
        recommendedCars: recommendations
      };
    } catch (error) {
      logger.error('Collaborative recommendation failed', error as Error);
      return { similarUsers: [], recommendedCars: [] };
    }
  }

  /**
   * Get trending cars for user's market
   */
  async getTrendingRecommendations(
    userId: string,
    userLocation: string,
    availableCars: any[],
    limit = 10
  ): Promise<CarRecommendation[]> {
    try {
      const preferences = this.userPreferences.get(userId);

      // Filter by location and user preferences
      const localCars = availableCars.filter((car: any) =>
        car.location === userLocation &&
        (!preferences?.preferredBodyTypes.length ||
          preferences.preferredBodyTypes.includes(car.bodyType)) &&
        (!preferences?.priceRange ||
          (car.price >= preferences.priceRange.min &&
            car.price <= preferences.priceRange.max))
      );

      // Score by view count, inquiry count, and recency
      const scored = localCars.map((car: any) => ({
        ...car,
        trendScore: this.calculateTrendScore(car)
      }));

      const recommendations = scored
        .sort((a, b) => b.trendScore - a.trendScore)
        .slice(0, limit)
        .map((car: any) => ({
          carId: car.id,
          make: car.make,
          model: car.model,
          year: car.year,
          price: car.price,
          matchScore: car.trendScore,
          matchReasons: ['Trending in your area'],
          sellerId: car.sellerId,
          image: car.images?.[0] || '',
          location: car.location
        }));

      return recommendations;
    } catch (error) {
      logger.error('Trending recommendations failed', error as Error);
      return [];
    }
  }

  /**
   * Hybrid recommendation (combines multiple strategies)
   */
  async getHybridRecommendations(
    userId: string,
    allUsers: any[],
    availableCars: any[],
    userLocation: string,
    limit = 10
  ): Promise<CarRecommendation[]> {
    try {
      logger.info('Generating hybrid recommendations', { userId });

      // Get recommendations from different strategies
      const [personalized, contentBased, trending] = await Promise.all([
        this.getPersonalizedRecommendations(userId, availableCars, 20),
        this.getContentBasedRecommendations(userId, availableCars, 20),
        this.getTrendingRecommendations(userId, userLocation, availableCars, 20)
      ]);

      // Combine and deduplicate
      const scoreMap = new Map<string, { car: CarRecommendation; totalScore: number; count: number }>();

      [personalized, contentBased, trending].forEach((recs, index) => {
        recs.forEach((car, position) => {
          const weight = 1 / (position + 1); // Higher weight for better ranking
          const key = car.carId;
          
          if (scoreMap.has(key)) {
            const entry = scoreMap.get(key)!;
            entry.totalScore += car.matchScore * weight;
            entry.count += 1;
          } else {
            scoreMap.set(key, { car, totalScore: car.matchScore * weight, count: 1 });
          }
        });
      });

      // Calculate final scores and sort
      const final = Array.from(scoreMap.values())
        .map(entry => ({
          ...entry.car,
          matchScore: entry.totalScore / entry.count
        }))
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, limit);

      return final;
    } catch (error) {
      logger.error('Hybrid recommendation failed', error as Error);
      return [];
    }
  }

  /**
   * Record user view
   */
  recordCarView(userId: string, carId: string, duration: number = 0): void {
    let behavior = this.userBehavior.get(userId);
    if (!behavior) {
      behavior = {
        viewedCars: [],
        savedCars: [],
        inquiredCars: [],
        viewHistory: [],
        inquiryHistory: []
      };
    }

    if (!behavior.viewedCars.includes(carId)) {
      behavior.viewedCars.push(carId);
    }

    behavior.viewHistory.push({
      carId,
      timestamp: Date.now(),
      duration
    });

    this.userBehavior.set(userId, behavior);
  }

  /**
   * Record user inquiry
   */
  recordCarInquiry(userId: string, carId: string): void {
    let behavior = this.userBehavior.get(userId);
    if (!behavior) {
      behavior = {
        viewedCars: [],
        savedCars: [],
        inquiredCars: [],
        viewHistory: [],
        inquiryHistory: []
      };
    }

    if (!behavior.inquiredCars.includes(carId)) {
      behavior.inquiredCars.push(carId);
    }

    behavior.inquiryHistory.push({
      carId,
      timestamp: Date.now()
    });

    this.userBehavior.set(userId, behavior);
  }

  /**
   * Build user preferences from behavior
   */
  private buildUserPreferences(userId: string): UserPreferences {
    const preferences: UserPreferences = {
      userId,
      favoredMakes: {},
      priceRange: { min: 5000, max: 50000 },
      preferredBodyTypes: [],
      preferredFuelTypes: [],
      preferredTransmissions: [],
      locationPreferences: [],
      agePreferences: { min: 5, max: 15 },
      mileagePreferences: { min: 0, max: 300000 }
    };

    return preferences;
  }

  /**
   * Calculate match score for a car
   */
  private calculateMatchScore(car: any, preferences: UserPreferences, behavior: UserBehavior): number {
    let score = 50; // Base score

    // Price match
    if (car.price >= preferences.priceRange.min && car.price <= preferences.priceRange.max) {
      score += 15;
    }

    // Body type match
    if (preferences.preferredBodyTypes.includes(car.bodyType)) {
      score += 10;
    }

    // Make preference
    if (preferences.favoredMakes[car.make]) {
      score += 10 * preferences.favoredMakes[car.make];
    }

    // Not recently viewed
    if (!behavior.viewedCars.includes(car.id)) {
      score += 5;
    }

    // Age preference
    const carAge = new Date().getFullYear() - car.year;
    if (carAge >= preferences.agePreferences.min && carAge <= preferences.agePreferences.max) {
      score += 10;
    }

    // Mileage preference
    if (car.mileage >= preferences.mileagePreferences.min &&
        car.mileage <= preferences.mileagePreferences.max) {
      score += 10;
    }

    // Cap score at 100
    return Math.min(score, 100);
  }

  /**
   * Calculate similarity between cars
   */
  private calculateSimilarity(car: any, features: any): number {
    let similarity = 50;

    if (car.make === features.commonMakes?.[0]) similarity += 20;
    if (car.bodyType === features.commonBodyTypes?.[0]) similarity += 15;
    if (Math.abs(car.price - features.avgPrice) < 5000) similarity += 15;

    return Math.min(similarity, 100);
  }

  /**
   * Get match reasons
   */
  private getMatchReasons(car: any, preferences: UserPreferences): string[] {
    const reasons: string[] = [];

    if (car.price >= preferences.priceRange.min && car.price <= preferences.priceRange.max) {
      reasons.push('Matches your price range');
    }

    if (preferences.preferredBodyTypes.includes(car.bodyType)) {
      reasons.push(`${car.bodyType} body type`);
    }

    if (preferences.favoredMakes[car.make]) {
      reasons.push(`${car.make} - a brand you like`);
    }

    const carAge = new Date().getFullYear() - car.year;
    if (carAge <= 5) {
      reasons.push('Recent model');
    }

    if (car.mileage < 100000) {
      reasons.push('Low mileage');
    }

    return reasons;
  }

  /**
   * Find similar users
   */
  private findSimilarUsers(userId: string, allUsers: any[], userBehavior: UserBehavior): Array<{
    userId: string;
    similarity: number;
  }> {
    return [];
  }

  /**
   * Get cars liked by similar users
   */
  private getCarLikedBySimilarUsers(
    similarUsers: any[],
    userBehavior: UserBehavior,
    availableCars: any[]
  ): any[] {
    return [];
  }

  /**
   * Calculate trend score
   */
  private calculateTrendScore(car: any): number {
    let score = 50;
    
    // Higher scores for recent listings
    const listingAge = Date.now() - (car.createdAt || 0);
    if (listingAge < 24 * 60 * 60 * 1000) score += 20; // Listed today
    if (listingAge < 7 * 24 * 60 * 60 * 1000) score += 10; // Listed this week

    // View count
    score += Math.min((car.viewCount || 0) / 100, 20);

    // Inquiry count
    score += Math.min((car.inquiryCount || 0) / 10, 10);

    return Math.min(score, 100);
  }

  /**
   * Extract common features from cars
   */
  private extractCommonFeatures(carIds: string[], availableCars: any[]): any {
    return {
      commonMakes: [],
      commonBodyTypes: [],
      avgPrice: 0
    };
  }
}

export const recommendationEngine = AdvancedRecommendationEngine.getInstance();
