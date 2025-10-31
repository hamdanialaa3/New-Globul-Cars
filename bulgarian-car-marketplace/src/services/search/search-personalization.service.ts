// Search Personalization Service - Smart Ranking Algorithm
// خدمة التخصيص الذكي للبحث - خوارزمية ترتيب ذكية
// 🎯 100% Real - Based on User Behavior in Firestore

import {
  collection,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  getDocs,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { CarListing } from '../../types/CarListing';
import { BulgarianCar } from '../../firebase/car-service';
import { serviceLogger } from '../logger-wrapper';

interface UserPreferences {
  favoritesBrands: string[];
  favoritesFuelTypes: string[];
  avgPriceRange: { min: number; max: number };
  avgMileageRange: { min: number; max: number };
  preferredTransmission: string[];
  viewedBrands: string[];
  searchedBrands: string[];
}

class SearchPersonalizationService {
  
  /**
   * Personalize search results based on user behavior
   * تخصيص نتائج البحث بناءً على سلوك المستخدم
   */
  async personalizeResults(
    cars: (CarListing | BulgarianCar)[],
    userId: string
  ): Promise<(CarListing | BulgarianCar)[]> {
    try {
      // 1. Get user preferences
      const preferences = await this.getUserPreferences(userId);
      
      // 2. Calculate score for each car
      const scoredCars = cars.map(car => ({
        car,
        score: this.calculateRelevanceScore(car, preferences)
      }));
      
      // 3. Sort by score (highest first)
      scoredCars.sort((a, b) => b.score - a.score);
      
      // 4. Return sorted cars
      return scoredCars.map(item => item.car);
      
    } catch (error) {
      serviceLogger.warn('Personalization failed, returning original order', { error: (error as Error).message });
      return cars;
    }
  }

  /**
   * Calculate relevance score for a car
   * حساب نقاط الصلة للسيارة
   */
  private calculateRelevanceScore(
    car: CarListing | BulgarianCar,
    preferences: UserPreferences
  ): number {
    let score = 0;
    
    // 1. Brand preference (weight: 30%)
    if (preferences.favoritesBrands.includes(car.make)) {
      score += 30;
    } else if (preferences.viewedBrands.includes(car.make)) {
      score += 20;
    } else if (preferences.searchedBrands.includes(car.make)) {
      score += 10;
    }
    
    // 2. Price range preference (weight: 25%)
    const carPrice = car.price || 0;
    if (carPrice >= preferences.avgPriceRange.min && 
        carPrice <= preferences.avgPriceRange.max) {
      score += 25;
    } else {
      // Partial score if close to range
      const distance = Math.min(
        Math.abs(carPrice - preferences.avgPriceRange.min),
        Math.abs(carPrice - preferences.avgPriceRange.max)
      );
      const maxDistance = preferences.avgPriceRange.max - preferences.avgPriceRange.min;
      const proximity = 1 - (distance / maxDistance);
      score += proximity * 15;
    }
    
    // 3. Fuel type preference (weight: 20%)
    if (preferences.favoritesFuelTypes.includes(car.fuelType)) {
      score += 20;
    }
    
    // 4. Transmission preference (weight: 15%)
    if (preferences.preferredTransmission.includes(car.transmission || '')) {
      score += 15;
    }
    
    // 5. Mileage preference (weight: 10%)
    const carMileage = car.mileage || 0;
    if (carMileage >= preferences.avgMileageRange.min && 
        carMileage <= preferences.avgMileageRange.max) {
      score += 10;
    }
    
    return score;
  }

  /**
   * Get user preferences from their history
   * الحصول على تفضيلات المستخدم من تاريخه
   */
  private async getUserPreferences(userId: string): Promise<UserPreferences> {
    try {
      const preferences: UserPreferences = {
        favoritesBrands: [],
        favoritesFuelTypes: [],
        avgPriceRange: { min: 0, max: 100000 },
        avgMileageRange: { min: 0, max: 300000 },
        preferredTransmission: [],
        viewedBrands: [],
        searchedBrands: []
      };
      
      // 1. Get favorites
      const favoritesSnapshot = await getDocs(
        query(
          collection(db, 'favorites'),
          where('userId', '==', userId),
          firestoreLimit(50)
        )
      );
      
      const favoriteBrands: string[] = [];
      const favoriteFuelTypes: string[] = [];
      const favoritePrices: number[] = [];
      
      for (const favoriteDoc of favoritesSnapshot.docs) {
        const carId = favoriteDoc.data().carId;
        try {
          const carDoc = await getDoc(doc(db, 'cars', carId));
          if (carDoc.exists()) {
            const carData = carDoc.data();
            if (carData.make) favoriteBrands.push(carData.make);
            if (carData.fuelType) favoriteFuelTypes.push(carData.fuelType);
            if (carData.price) favoritePrices.push(carData.price);
          }
        } catch (err) {
          // Skip invalid car references
        }
      }
      
      preferences.favoritesBrands = [...new Set(favoriteBrands)];
      preferences.favoritesFuelTypes = [...new Set(favoriteFuelTypes)];
      
      // Calculate average price range from favorites
      if (favoritePrices.length > 0) {
        const avg = favoritePrices.reduce((a, b) => a + b, 0) / favoritePrices.length;
        preferences.avgPriceRange = {
          min: avg * 0.7,
          max: avg * 1.3
        };
      }
      
      // 2. Get viewed cars (recent 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const viewedSnapshot = await getDocs(
        query(
          collection(db, 'viewedCars'),
          where('userId', '==', userId),
          where('timestamp', '>=', Timestamp.fromDate(thirtyDaysAgo)),
          firestoreLimit(50)
        )
      );
      
      const viewedBrands: string[] = [];
      for (const viewDoc of viewedSnapshot.docs) {
        const carId = viewDoc.data().carId;
        try {
          const carDoc = await getDoc(doc(db, 'cars', carId));
          if (carDoc.exists() && carDoc.data().make) {
            viewedBrands.push(carDoc.data().make);
          }
        } catch (err) {
          // Skip
        }
      }
      
      preferences.viewedBrands = [...new Set(viewedBrands)];
      
      // 3. Get search history brands
      const searchHistorySnapshot = await getDocs(
        query(
          collection(db, 'searchHistory'),
          where('userId', '==', userId),
          orderBy('timestamp', 'desc'),
          firestoreLimit(20)
        )
      );
      
      const searchedBrands: string[] = [];
      searchHistorySnapshot.docs.forEach(doc => {
        const filters = doc.data().filters;
        if (filters && filters.brands) {
          searchedBrands.push(...filters.brands);
        }
      });
      
      preferences.searchedBrands = [...new Set(searchedBrands)];
      
      return preferences;
      
    } catch (error) {
      serviceLogger.warn('Failed to get user preferences', { error: (error as Error).message });
      // Return default preferences
      return {
        favoritesBrands: [],
        favoritesFuelTypes: [],
        avgPriceRange: { min: 0, max: 100000 },
        avgMileageRange: { min: 0, max: 300000 },
        preferredTransmission: [],
        viewedBrands: [],
        searchedBrands: []
      };
    }
  }

  /**
   * Track car view for personalization
   * تتبع مشاهدة السيارة للتخصيص
   */
  async trackCarView(userId: string, carId: string): Promise<void> {
    try {
      await addDoc(collection(db, 'viewedCars'), {
        userId,
        carId,
        timestamp: serverTimestamp()
      });
      
      serviceLogger.debug('Car view tracked', { userId, carId });
      
    } catch (error) {
      serviceLogger.warn('Failed to track car view', { error: (error as Error).message });
      // Don't throw - tracking is not critical
    }
  }
}

export const searchPersonalizationService = new SearchPersonalizationService();
export default searchPersonalizationService;

