// Car Comparison Service
// Compare up to 4 cars side by side

import { db } from '../../firebase/firebase-config';
import { collection, doc, getDoc, addDoc, getDocs, query, where, deleteDoc, Timestamp } from 'firebase/firestore';
import { CarListing } from '../../types/CarListing';
import { logger } from '../logger-service';

export interface ComparisonItem {
  carId: string;
  car: CarListing;
}

export interface Comparison {
  id?: string;
  userId?: string;
  cars: ComparisonItem[];
  createdAt: Date;
  updatedAt: Date;
  name?: string;
  isPublic: boolean;
  shareUrl?: string;
}

export interface ComparisonResult {
  comparison: Comparison;
  highlights: {
    bestPrice: string; // carId
    lowestMileage: string;
    newest: string;
    mostEquipped: string;
    bestCondition: string;
  };
  differences: ComparisonDifference[];
}

export interface ComparisonDifference {
  field: string;
  label: string;
  values: { [carId: string]: any };
  significant: boolean; // true if values differ significantly
}

class CarComparisonService {
  private static instance: CarComparisonService;
  private readonly MAX_CARS = 4;
  private readonly COMPARISON_COLLECTION = 'comparisons';

  private constructor() {}

  static getInstance(): CarComparisonService {
    if (!CarComparisonService.instance) {
      CarComparisonService.instance = new CarComparisonService();
    }
    return CarComparisonService.instance;
  }

  /**
   * Create a new comparison
   */
  async createComparison(
    carIds: string[],
    userId?: string,
    name?: string
  ): Promise<ComparisonResult> {
    try {
      if (carIds.length < 2) {
        throw new Error('Need at least 2 cars to compare');
      }

      if (carIds.length > this.MAX_CARS) {
        throw new Error(`Maximum ${this.MAX_CARS} cars allowed`);
      }

      logger.info('Creating comparison', { carIds, userId });

      // Fetch all cars
      const cars: ComparisonItem[] = [];
      for (const carId of carIds) {
        const car = await this.getCarById(carId);
        if (car) {
          cars.push({ carId, car });
        }
      }

      if (cars.length < 2) {
        throw new Error('Could not find enough cars');
      }

      // Create comparison object
      const comparison: Comparison = {
        userId,
        cars,
        createdAt: new Date(),
        updatedAt: new Date(),
        name,
        isPublic: false
      };

      // Save to database if user is logged in
      if (userId) {
        const docRef = await addDoc(collection(db, this.COMPARISON_COLLECTION), {
          ...comparison,
          createdAt: Timestamp.fromDate(comparison.createdAt),
          updatedAt: Timestamp.fromDate(comparison.updatedAt)
        });
        comparison.id = docRef.id;
        comparison.shareUrl = `/compare/${docRef.id}`;
      }

      // Analyze comparison
      const result = this.analyzeComparison(comparison);

      logger.info('Comparison created', { comparisonId: comparison.id });
      return result;

    } catch (error) {
      logger.error('Failed to create comparison', error as Error, { carIds });
      throw error;
    }
  }

  /**
   * Get comparison by ID
   */
  async getComparison(comparisonId: string): Promise<ComparisonResult | null> {
    try {
      const docRef = doc(db, this.COMPARISON_COLLECTION, comparisonId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      const comparison: Comparison = {
        id: docSnap.id,
        userId: data.userId,
        cars: data.cars,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        name: data.name,
        isPublic: data.isPublic,
        shareUrl: `/compare/${docSnap.id}`
      };

      return this.analyzeComparison(comparison);

    } catch (error) {
      logger.error('Failed to get comparison', error as Error, { comparisonId });
      return null;
    }
  }

  /**
   * Get all comparisons for a user
   */
  async getUserComparisons(userId: string): Promise<Comparison[]> {
    try {
      const q = query(
        collection(db, this.COMPARISON_COLLECTION),
        where('userId', '==', userId)
      );

      const snapshot = await getDocs(q);
      const comparisons: Comparison[] = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        comparisons.push({
          id: doc.id,
          userId: data.userId,
          cars: data.cars,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          name: data.name,
          isPublic: data.isPublic,
          shareUrl: `/compare/${doc.id}`
        });
      });

      // Sort by most recent first
      comparisons.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

      return comparisons;

    } catch (error) {
      logger.error('Failed to get user comparisons', error as Error, { userId });
      return [];
    }
  }

  /**
   * Delete a comparison
   */
  async deleteComparison(comparisonId: string, userId: string): Promise<boolean> {
    try {
      const docRef = doc(db, this.COMPARISON_COLLECTION, comparisonId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return false;
      }

      const data = docSnap.data();
      if (data.userId !== userId) {
        throw new Error('Unauthorized');
      }

      await deleteDoc(docRef);
      logger.info('Comparison deleted', { comparisonId });
      return true;

    } catch (error) {
      logger.error('Failed to delete comparison', error as Error, { comparisonId });
      return false;
    }
  }

  /**
   * Analyze comparison and find highlights
   */
  private analyzeComparison(comparison: Comparison): ComparisonResult {
    const { cars } = comparison;

    // Find highlights
    const highlights = {
      bestPrice: this.findBestPrice(cars),
      lowestMileage: this.findLowestMileage(cars),
      newest: this.findNewest(cars),
      mostEquipped: this.findMostEquipped(cars),
      bestCondition: this.findBestCondition(cars)
    };

    // Generate comparison differences
    const differences = this.generateDifferences(cars);

    return {
      comparison,
      highlights,
      differences
    };
  }

  /**
   * Find car with best (lowest) price
   */
  private findBestPrice(cars: ComparisonItem[]): string {
    return cars.reduce((best, current) => 
      current.car.price < best.car.price ? current : best
    ).carId;
  }

  /**
   * Find car with lowest mileage
   */
  private findLowestMileage(cars: ComparisonItem[]): string {
    return cars.reduce((best, current) => {
      const currentMileage = current.car.mileage || Infinity;
      const bestMileage = best.car.mileage || Infinity;
      return currentMileage < bestMileage ? current : best;
    }).carId;
  }

  /**
   * Find newest car
   */
  private findNewest(cars: ComparisonItem[]): string {
    return cars.reduce((newest, current) => {
      const currentYear = current.car.year || 0;
      const newestYear = newest.car.year || 0;
      return currentYear > newestYear ? current : newest;
    }).carId;
  }

  /**
   * Find car with most equipment
   */
  private findMostEquipped(cars: ComparisonItem[]): string {
    return cars.reduce((best, current) => {
      const currentEquipment = this.countEquipment(current.car);
      const bestEquipment = this.countEquipment(best.car);
      return currentEquipment > bestEquipment ? current : best;
    }).carId;
  }

  /**
   * Find car with best condition
   */
  private findBestCondition(cars: ComparisonItem[]): string {
    const conditionScores: Record<string, number> = {
      'new': 100,
      'excellent': 90,
      'very-good': 80,
      'good': 70,
      'fair': 50,
      'poor': 30
    };

    return cars.reduce((best, current) => {
      const currentScore = conditionScores[current.car.condition?.toLowerCase() || ''] || 0;
      const bestScore = conditionScores[best.car.condition?.toLowerCase() || ''] || 0;
      return currentScore > bestScore ? current : best;
    }).carId;
  }

  /**
   * Count total equipment features
   */
  private countEquipment(car: CarListing): number {
    return (
      (car.safetyEquipment?.length || 0) +
      (car.comfortEquipment?.length || 0) +
      (car.infotainmentEquipment?.length || 0) +
      (car.extras?.length || 0)
    );
  }

  /**
   * Generate detailed differences between cars
   */
  private generateDifferences(cars: ComparisonItem[]): ComparisonDifference[] {
    const differences: ComparisonDifference[] = [];

    // Define fields to compare
    const fieldsToCompare = [
      { field: 'price', label: 'Price', type: 'number' },
      { field: 'year', label: 'Year', type: 'number' },
      { field: 'mileage', label: 'Mileage', type: 'number' },
      { field: 'fuelType', label: 'Fuel Type', type: 'string' },
      { field: 'transmission', label: 'Transmission', type: 'string' },
      { field: 'power', label: 'Power (HP)', type: 'number' },
      { field: 'engineSize', label: 'Engine Size (L)', type: 'number' },
      { field: 'doors', label: 'Doors', type: 'number' },
      { field: 'seats', label: 'Seats', type: 'number' },
      { field: 'color', label: 'Color', type: 'string' },
      { field: 'condition', label: 'Condition', type: 'string' },
      { field: 'warranty', label: 'Warranty', type: 'boolean' },
      { field: 'serviceHistory', label: 'Service History', type: 'boolean' }
    ];

    fieldsToCompare.forEach(({ field, label, type }) => {
      const values: { [carId: string]: any } = {};
      let hasSignificantDifference = false;

      cars.forEach(({ carId, car }) => {
        const value = (car as any)[field];
        values[carId] = value;
      });

      // Check if values differ significantly
      const uniqueValues = new Set(Object.values(values));
      if (uniqueValues.size > 1) {
        hasSignificantDifference = true;
      }

      differences.push({
        field,
        label,
        values,
        significant: hasSignificantDifference
      });
    });

    // Add equipment comparison
    differences.push({
      field: 'totalEquipment',
      label: 'Total Equipment',
      values: cars.reduce((acc, { carId, car }) => {
        acc[carId] = this.countEquipment(car);
        return acc;
      }, {} as { [carId: string]: number }),
      significant: true
    });

    return differences;
  }

  /**
   * Get car by ID (helper method)
   */
  private async getCarById(carId: string): Promise<CarListing | null> {
    try {
      // Search in all vehicle collections
      const collections = ['cars', 'passenger_cars', 'suvs', 'vans', 'motorcycles', 'trucks', 'buses'];
      
      for (const collectionName of collections) {
        const docRef = doc(db, collectionName, carId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          return {
            id: docSnap.id,
            ...docSnap.data()
          } as CarListing;
        }
      }

      return null;

    } catch (error) {
      logger.error('Failed to get car', error as Error, { carId });
      return null;
    }
  }

  /**
   * Export comparison as shareable URL
   */
  async makePublic(comparisonId: string, userId: string): Promise<string | null> {
    try {
      const docRef = doc(db, this.COMPARISON_COLLECTION, comparisonId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      if (data.userId !== userId) {
        throw new Error('Unauthorized');
      }

      // Update to public
      await docRef.update({ isPublic: true });

      return `/compare/${comparisonId}`;

    } catch (error) {
      logger.error('Failed to make comparison public', error as Error, { comparisonId });
      return null;
    }
  }
}

export const carComparisonService = CarComparisonService.getInstance();
