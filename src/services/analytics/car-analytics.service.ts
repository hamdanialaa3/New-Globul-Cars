// src/services/analytics/car-analytics.service.ts
// Real Car Analytics Service
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  increment,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { logger } from '../logger-service';
import { queryAllCollections } from '../search/multi-collection-helper';

// All vehicle collections to search
const VEHICLE_COLLECTIONS = ['passenger_cars', 'suvs', 'vans', 'motorcycles', 'trucks', 'buses', 'cars', 'listings'];

interface CarView {
  carId: string;
  userId?: string;
  viewedAt: Timestamp;
  userAgent: string;
  referrer: string;
  duration?: number; // How long they viewed (seconds)
}

// Note: Inquiry details persisted in car_inquiries collection; typed inline when queried

interface CarPerformance {
  views: number;
  uniqueViews: number;
  inquiries: number;
  favorites: number;
  conversionRate: number;
  avgViewDuration: number;
  popularTimes: Record<string, number>;
  viewsByDay: Record<string, number>;
}

class CarAnalyticsService {
  private static instance: CarAnalyticsService;

  private constructor() { }

  static getInstance(): CarAnalyticsService {
    if (!this.instance) {
      this.instance = new CarAnalyticsService();
    }
    return this.instance;
  }

  /**
   * Find which collection a car belongs to
   * Returns the collection name or null if not found
   */
  private async findCarCollection(carId: string): Promise<string | null> {
    for (const collectionName of VEHICLE_COLLECTIONS) {
      try {
        const carRef = doc(db, collectionName, carId);
        const snap = await getDoc(carRef);
        if (snap.exists()) {
          return collectionName;
        }
      } catch {
        // Continue to next collection
      }
    }
    return null;
  }

  /**
   * Track car view
   */
  async trackView(carId: string, userId?: string): Promise<void> {
    try {
      // Add view record
      await addDoc(collection(db, 'car_views'), {
        carId,
        userId: userId || 'anonymous',
        viewedAt: serverTimestamp(),
        userAgent: navigator.userAgent,
        referrer: document.referrer || 'direct',
        sessionId: this.getSessionId()
      });

      // Find the correct collection for this car
      const collectionName = await this.findCarCollection(carId);
      if (!collectionName) {
        logger.warn('Car not found in any collection for view tracking', { carId });
        return;
      }

      // Update car view count
      await updateDoc(doc(db, collectionName, carId), {
        views: increment(1),
        lastViewedAt: serverTimestamp()
      });

      if (process.env.NODE_ENV === 'development') {
        logger.debug('Car view tracked', { carId });
      }
    } catch (error) {
      logger.error('Track view error', error as Error, { carId, userId });
    }
  }

  /**
   * Track car inquiry/message
   */
  async trackInquiry(
    carId: string,
    fromUserId: string,
    toUserId: string,
    message: string
  ): Promise<void> {
    try {
      // Add inquiry record
      await addDoc(collection(db, 'car_inquiries'), {
        carId,
        fromUserId,
        toUserId,
        message,
        createdAt: serverTimestamp(),
        status: 'pending'
      });

      // Find the correct collection for this car
      const collectionName = await this.findCarCollection(carId);
      if (collectionName) {
        // Update car inquiry count
        await updateDoc(doc(db, collectionName, carId), {
          inquiries: increment(1)
        });
      }

      if (process.env.NODE_ENV === 'development') {
        logger.debug('Car inquiry tracked', { carId, fromUserId, toUserId });
      }
    } catch (error) {
      logger.error('Track inquiry error', error as Error, { carId, fromUserId, toUserId });
    }
  }

  /**
   * Track car favorite
   */
  async trackFavorite(carId: string, userId: string, added: boolean): Promise<void> {
    try {
      // Find the correct collection for this car
      const collectionName = await this.findCarCollection(carId);
      if (collectionName) {
        await updateDoc(doc(db, collectionName, carId), {
          favorites: increment(added ? 1 : -1)
        });
      }

      if (process.env.NODE_ENV === 'development') {
        logger.debug('Car favorite tracked', { carId, action: added ? 'added' : 'removed' });
      }
    } catch (error) {
      logger.error('Track favorite error', error as Error, { carId, userId, added });
    }
  }

  /**
   * Get car performance analytics
   */
  async getCarPerformance(carId: string, days: number = 30): Promise<CarPerformance> {
    try {
      const startDate = Timestamp.fromDate(
        new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      );

      // Get views
      const viewsQuery = query(
        collection(db, 'car_views'),
        where('carId', '==', carId),
        where('viewedAt', '>=', startDate)
      );
      const viewsSnapshot = await getDocs(viewsQuery);
      const views = viewsSnapshot.docs.map((doc: any) => doc.data() as CarView);

      // Get inquiries
      const inquiriesQuery = query(
        collection(db, 'car_inquiries'),
        where('carId', '==', carId),
        where('createdAt', '>=', startDate)
      );
      const inquiriesSnapshot = await getDocs(inquiriesQuery);

      // Get favorites count
      // Using queryAllCollections to be safe if car is not in 'cars'
      const carResults = await queryAllCollections(where('__name__', '==', carId));
      // queryAllCollections returns array of data objects, NOT snapshot with .docs
      // But queryAllCollections returns T[]

      const carData = carResults[0];
      const favorites = carData?.favorites || 0;

      // Calculate metrics
      const uniqueViewers = new Set(views.map((v: any) => v.userId)).size;
      const totalViews = views.length;
      const totalInquiries = inquiriesSnapshot.size;
      const conversionRate = totalViews > 0 ? (totalInquiries / totalViews) * 100 : 0;

      return {
        views: totalViews,
        uniqueViews: uniqueViewers,
        inquiries: totalInquiries,
        favorites,
        conversionRate,
        avgViewDuration: this.calculateAvgDuration(views),
        popularTimes: this.calculatePopularTimes(views),
        viewsByDay: this.groupByDay(views)
      };
    } catch (error) {
      logger.error('Get car performance error', error as Error, { carId, days });
      return {
        views: 0,
        uniqueViews: 0,
        inquiries: 0,
        favorites: 0,
        conversionRate: 0,
        avgViewDuration: 0,
        popularTimes: {},
        viewsByDay: {}
      };
    }
  }

  /**
   * Get user's total car analytics
   * ✅ DONE: Implement actual aggregation across user's cars
   */
  async getUserCarAnalytics(userId: string): Promise<{
    totalViews: number;
    totalInquiries: number;
    totalFavorites: number;
    avgResponseTime: number;
  }> {
    let result = {
      totalViews: 0,
      totalInquiries: 0,
      totalFavorites: 0,
      avgResponseTime: 0
    };

    try {
      // Get all cars owned by the user
      const userCarsQuery = query(
        collection(db, 'cars'),
        where('sellerId', '==', userId)
      );
      const userCarsSnapshot = await getDocs(userCarsQuery);
      const carIds = userCarsSnapshot.docs.map((doc: any) => doc.id);

      if (carIds.length === 0) {
        return result;
      }

      // Aggregate views across all user's cars
      let totalViews = 0;
      let totalFavorites = 0;

      for (const carId of carIds) {
        const viewsQuery = query(
          collection(db, 'car_views'),
          where('carId', '==', carId)
        );
        const viewsSnapshot = await getDocs(viewsQuery);
        totalViews += viewsSnapshot.size;
      }

      // Aggregate from car documents (faster for favorites)
      userCarsSnapshot.docs.forEach(doc => {
        const carData = doc.data();
        totalViews += carData.views || 0;
        totalFavorites += carData.favorites || 0;
      });

      // Get inquiries for all user's cars
      const inquiriesQuery = query(
        collection(db, 'car_inquiries'),
        where('toUserId', '==', userId)
      );
      const inquiriesSnapshot = await getDocs(inquiriesQuery);
      const totalInquiries = inquiriesSnapshot.size;

      // Calculate average response time (simplified)
      const inquiries = inquiriesSnapshot.docs.map((doc: any) => doc.data());
      const responseTimes = inquiries
        .filter(inq => inq.respondedAt && inq.createdAt)
        .map(inq => {
          const created = inq.createdAt.toDate();
          const responded = inq.respondedAt.toDate();
          return (responded.getTime() - created.getTime()) / (1000 * 60 * 60); // hours
        });

      const avgResponseTime = responseTimes.length > 0
        ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
        : 0;

      result = {
        totalViews,
        totalInquiries,
        totalFavorites,
        avgResponseTime: Math.round(avgResponseTime * 100) / 100
      };

      logger.debug('User car analytics calculated', { userId, result });
    } catch (error) {
      logger.error('Get user analytics error', error as Error, { userId });
    }

    return result;
  }

  /**
   * Helper: Get session ID
   */
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Helper: Calculate average view duration
   */
  private calculateAvgDuration(views: CarView[]): number {
    const durationsWithData = views.filter(v => v.duration);
    if (durationsWithData.length === 0) return 0;

    const total = durationsWithData.reduce((sum, v) => sum + (v.duration || 0), 0);
    return Math.round(total / durationsWithData.length);
  }

  /**
   * Helper: Calculate popular viewing times
   */
  private calculatePopularTimes(views: CarView[]): Record<string, number> {
    const times: Record<string, number> = {};

    views.forEach(view => {
      const hour = view.viewedAt.toDate().getHours();
      const timeRange = `${hour}:00-${hour + 1}:00`;
      times[timeRange] = (times[timeRange] || 0) + 1;
    });

    return times;
  }

  /**
   * Helper: Group views by day
   */
  private groupByDay(views: CarView[]): Record<string, number> {
    const groups: Record<string, number> = {};

    views.forEach(view => {
      const date = view.viewedAt.toDate().toISOString().split('T')[0];
      groups[date] = (groups[date] || 0) + 1;
    });

    return groups;
  }
}

export const carAnalyticsService = CarAnalyticsService.getInstance();
