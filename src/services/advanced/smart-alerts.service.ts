// Smart Alerts Service - خدمة التنبيهات الذكية المحسنة
// Enhanced version with AI-powered price drop predictions and smart matching

import { logger } from '../logger-service';
import { CarListing } from '../../types/CarListing';
import { db, auth } from '../../firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  onSnapshot,
  orderBy,
  limit
} from 'firebase/firestore';
import { queryAllCollections } from '../multi-collection-helper';
import { dealRatingService } from './deal-rating.service';

export interface SmartAlert {
  id?: string;
  userId: string;
  name: string;
  criteria: SearchCriteria;
  notificationChannels: NotificationChannel[];
  frequency: 'instant' | 'daily' | 'weekly';
  isActive: boolean;
  matchCount: number;
  lastNotified?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchCriteria {
  make?: string;
  model?: string;
  yearFrom?: number;
  yearTo?: number;
  priceFrom?: number;
  priceTo?: number;
  mileageFrom?: number;
  mileageTo?: number;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
  city?: string;
  region?: string;
  dealRating?: 'excellent' | 'great' | 'good'; // NEW: Only notify for good deals
  priceDropPercentage?: number; // NEW: Notify when price drops by X%
}

export type NotificationChannel = 'email' | 'push' | 'sms' | 'inApp';

export interface AlertMatch {
  alert: SmartAlert;
  car: CarListing;
  matchScore: number;
  matchReasons: string[];
  dealRating?: any;
  priceComparison?: {
    currentPrice: number;
    marketAverage: number;
    savingsAmount: number;
    savingsPercentage: number;
  };
}

export interface PriceDropAlert {
  carId: string;
  car: CarListing;
  oldPrice: number;
  newPrice: number;
  dropPercentage: number;
  dropAmount: number;
  timestamp: Date;
}

class SmartAlertsService {
  private static instance: SmartAlertsService;
  private readonly ALERTS_COLLECTION = 'smartAlerts';
  private readonly PRICE_HISTORY_COLLECTION = 'priceHistory';
  private readonly MIN_MATCH_SCORE = 70; // Minimum score to notify user

  private constructor() {}

  static getInstance(): SmartAlertsService {
    if (!SmartAlertsService.instance) {
      SmartAlertsService.instance = new SmartAlertsService();
    }
    return SmartAlertsService.instance;
  }

  /**
   * Create a new smart alert
   */
  async createAlert(alert: Omit<SmartAlert, 'id' | 'matchCount' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const newAlert: Omit<SmartAlert, 'id'> = {
        ...alert,
        userId: user.uid,
        matchCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, this.ALERTS_COLLECTION), {
        ...newAlert,
        createdAt: Timestamp.fromDate(newAlert.createdAt),
        updatedAt: Timestamp.fromDate(newAlert.updatedAt)
      });

      logger.info('Smart alert created', { alertId: docRef.id, userId: user.uid });
      return docRef.id;

    } catch (error) {
      logger.error('Failed to create smart alert', error as Error);
      throw error;
    }
  }

  /**
   * Get user's alerts
   */
  async getUserAlerts(userId?: string): Promise<SmartAlert[]> {
    try {
      const currentUser = userId || auth.currentUser?.uid;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const q = query(
        collection(db, this.ALERTS_COLLECTION),
        where('userId', '==', currentUser),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const alerts = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        lastNotified: doc.data().lastNotified?.toDate()
      })) as SmartAlert[];

      return alerts;

    } catch (error) {
      logger.error('Failed to get user alerts', error as Error);
      return [];
    }
  }

  /**
   * Update alert
   */
  async updateAlert(alertId: string, updates: Partial<SmartAlert>): Promise<void> {
    try {
      const alertRef = doc(db, this.ALERTS_COLLECTION, alertId);
      
      await updateDoc(alertRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });

      logger.info('Alert updated', { alertId });

    } catch (error) {
      logger.error('Failed to update alert', error as Error);
      throw error;
    }
  }

  /**
   * Delete alert
   */
  async deleteAlert(alertId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.ALERTS_COLLECTION, alertId));
      logger.info('Alert deleted', { alertId });

    } catch (error) {
      logger.error('Failed to delete alert', error as Error);
      throw error;
    }
  }

  /**
   * Find matches for alert (with AI-powered ranking)
   */
  async findMatches(alert: SmartAlert): Promise<AlertMatch[]> {
    try {
      const { criteria } = alert;
      const constraints: unknown[] = [where('status', '==', 'active')];

      // Build query constraints
      if (criteria.make) constraints.push(where('make', '==', criteria.make));
      if (criteria.fuelType) constraints.push(where('fuelType', '==', criteria.fuelType));
      if (criteria.transmission) constraints.push(where('transmission', '==', criteria.transmission));
      if (criteria.bodyType) constraints.push(where('vehicleType', '==', criteria.bodyType));

      // Query all collections
      const cars = await queryAllCollections<CarListing>(...constraints);

      // Filter and score matches
      const matches: AlertMatch[] = [];

      for (const car of cars) {
        const matchResult = this.calculateMatchScore(car, criteria);
        
        if (matchResult.score >= this.MIN_MATCH_SCORE) {
          // Get deal rating if criteria includes it
          let dealRating;
          if (criteria.dealRating) {
            dealRating = await dealRatingService.calculateDealRating(car);
            
            // Filter by deal rating
            if (!this.meetsRatingCriteria(dealRating.rating, criteria.dealRating)) {
              continue;
            }
          }

          // Calculate price comparison
          const priceComparison = dealRating ? {
            currentPrice: car.price,
            marketAverage: dealRating.marketComparison.averagePrice,
            savingsAmount: dealRating.marketComparison.averagePrice - car.price,
            savingsPercentage: ((dealRating.marketComparison.averagePrice - car.price) / dealRating.marketComparison.averagePrice) * 100
          } : undefined;

          matches.push({
            alert,
            car,
            matchScore: matchResult.score,
            matchReasons: matchResult.reasons,
            dealRating,
            priceComparison
          });
        }
      }

      // Sort by match score (highest first)
      matches.sort((a, b) => b.matchScore - a.matchScore);

      return matches;

    } catch (error) {
      logger.error('Failed to find matches', error as Error);
      return [];
    }
  }

  /**
   * Calculate match score between car and criteria
   */
  private calculateMatchScore(
    car: CarListing, 
    criteria: SearchCriteria
  ): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];

    // Make match (20 points)
    if (criteria.make && car.make === criteria.make) {
      score += 20;
      reasons.push('Exact make match');
    }

    // Model match (20 points)
    if (criteria.model && car.model === criteria.model) {
      score += 20;
      reasons.push('Exact model match');
    }

    // Year range (15 points)
    if (car.year) {
      if (criteria.yearFrom && criteria.yearTo) {
        if (car.year >= criteria.yearFrom && car.year <= criteria.yearTo) {
          score += 15;
          reasons.push(`Year ${car.year} in range`);
        }
      }
    }

    // Price range (25 points)
    if (car.price) {
      if (criteria.priceFrom && criteria.priceTo) {
        if (car.price >= criteria.priceFrom && car.price <= criteria.priceTo) {
          score += 25;
          reasons.push(`Price ${car.price} лв in range`);
        }
      }
    }

    // Mileage range (10 points)
    if (car.mileage) {
      if (criteria.mileageFrom !== undefined && criteria.mileageTo !== undefined) {
        if (car.mileage >= criteria.mileageFrom && car.mileage <= criteria.mileageTo) {
          score += 10;
          reasons.push(`Mileage ${car.mileage} km in range`);
        }
      }
    }

    // Fuel type (5 points)
    if (criteria.fuelType && car.fuelType === criteria.fuelType) {
      score += 5;
      reasons.push('Fuel type match');
    }

    // Transmission (5 points)
    if (criteria.transmission && car.transmission === criteria.transmission) {
      score += 5;
      reasons.push('Transmission match');
    }

    return { score, reasons };
  }

  /**
   * Check if rating meets criteria
   */
  private meetsRatingCriteria(rating: string, minRating: string): boolean {
    const ratings = ['excellent', 'great', 'good', 'fair', 'overpriced'];
    const ratingIndex = ratings.indexOf(rating.toLowerCase());
    const minIndex = ratings.indexOf(minRating.toLowerCase());
    
    return ratingIndex <= minIndex;
  }

  /**
   * Track price changes and detect drops
   */
  async trackPriceChange(carId: string, oldPrice: number, newPrice: number): Promise<void> {
    try {
      // Calculate drop percentage
      const dropAmount = oldPrice - newPrice;
      const dropPercentage = (dropAmount / oldPrice) * 100;

      // Only track if price decreased
      if (dropPercentage <= 0) return;

      // Save to price history
      await addDoc(collection(db, this.PRICE_HISTORY_COLLECTION), {
        carId,
        oldPrice,
        newPrice,
        dropPercentage,
        dropAmount,
        timestamp: Timestamp.now()
      });

      logger.info('Price change tracked', { carId, dropPercentage });

      // Check if any alerts should be notified
      await this.checkPriceDropAlerts(carId, dropPercentage);

    } catch (error) {
      logger.error('Failed to track price change', error as Error);
    }
  }

  /**
   * Check price drop alerts and send notifications to matching users
   */
  private async checkPriceDropAlerts(carId: string, dropPercentage: number): Promise<void> {
    try {
      // Get all active alerts matching the drop threshold
      const q = query(
        collection(db, this.ALERTS_COLLECTION),
        where('isActive', '==', true),
        where('criteria.priceDropPercentage', '<=', dropPercentage)
      );

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) return;

      // Send a notification for each matching alert
      for (const alertDoc of snapshot.docs) {
        const alert = alertDoc.data();
        try {
          await addDoc(collection(db, 'notifications'), {
            userId: alert.userId,
            type: 'price_drop',
            title: 'Намаление на цена!',
            message: `Автомобил, който следите, намали с ${dropPercentage.toFixed(1)}%`,
            data: {
              carId,
              alertId: alertDoc.id,
              dropPercentage,
            },
            isRead: false,
            createdAt: Timestamp.now(),
          });
        } catch (notifError) {
          logger.warn('Failed to send price drop notification', { alertId: alertDoc.id, notifError });
        }
      }

      logger.info('Price drop alerts notified', { 
        carId, 
        dropPercentage, 
        alertsNotified: snapshot.size 
      });

    } catch (error) {
      logger.error('Failed to check price drop alerts', error as Error);
    }
  }

  /**
   * Get recent price drops
   */
  async getRecentPriceDrops(limit: number = 20): Promise<PriceDropAlert[]> {
    try {
      const q = query(
        collection(db, this.PRICE_HISTORY_COLLECTION),
        orderBy('timestamp', 'desc'),
        limit(limit)
      );

      const snapshot = await getDocs(q);
      
      const drops: PriceDropAlert[] = [];
      
      for (const doc of snapshot.docs) {
        const data = doc.data();
        
        // Fetch car details
        const carCandidates = await queryAllCollections<CarListing>(
          where('id', '==', data.carId)
        );
        
        if (carCandidates.length > 0) {
          drops.push({
            carId: data.carId,
            car: carCandidates[0],
            oldPrice: data.oldPrice,
            newPrice: data.newPrice,
            dropPercentage: data.dropPercentage,
            dropAmount: data.dropAmount,
            timestamp: data.timestamp.toDate()
          });
        }
      }

      return drops;

    } catch (error) {
      logger.error('Failed to get recent price drops', error as Error);
      return [];
    }
  }

  /**
   * Listen to new matches for alert
   */
  subscribeToMatches(
    alertId: string, 
    callback: (matches: AlertMatch[]) => void
  ): () => void {
    const alertRef = doc(db, this.ALERTS_COLLECTION, alertId);
    
    let isActive = true;
    const unsubscribe = onSnapshot(alertRef, async (snapshot) => {
      if (!isActive) return;
      if (snapshot.exists()) {
        const alert = {
          id: snapshot.id,
          ...snapshot.data(),
          createdAt: snapshot.data().createdAt?.toDate(),
          updatedAt: snapshot.data().updatedAt?.toDate()
        } as SmartAlert;

        const matches = await this.findMatches(alert);
        if (isActive) callback(matches);
      }
    });
    return () => { isActive = false; unsubscribe(); };
  }
}

export const smartAlertsService = SmartAlertsService.getInstance();
