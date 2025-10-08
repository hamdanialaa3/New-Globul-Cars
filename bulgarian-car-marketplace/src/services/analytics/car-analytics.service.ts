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
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';

interface CarView {
  carId: string;
  userId?: string;
  viewedAt: Timestamp;
  userAgent: string;
  referrer: string;
  duration?: number; // How long they viewed (seconds)
}

interface CarInquiry {
  carId: string;
  fromUserId: string;
  toUserId: string;
  message: string;
  createdAt: Timestamp;
  status: 'pending' | 'replied' | 'archived';
}

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
  
  private constructor() {}
  
  static getInstance(): CarAnalyticsService {
    if (!this.instance) {
      this.instance = new CarAnalyticsService();
    }
    return this.instance;
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

      // Update car view count
      await updateDoc(doc(db, 'cars', carId), {
        views: increment(1),
        lastViewedAt: serverTimestamp()
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Car view tracked:', carId);
      }
    } catch (error) {
      console.error('❌ Track view error:', error);
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

      // Update car inquiry count
      await updateDoc(doc(db, 'cars', carId), {
        inquiries: increment(1)
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('💬 Car inquiry tracked:', carId);
      }
    } catch (error) {
      console.error('❌ Track inquiry error:', error);
    }
  }

  /**
   * Track car favorite
   */
  async trackFavorite(carId: string, userId: string, added: boolean): Promise<void> {
    try {
      await updateDoc(doc(db, 'cars', carId), {
        favorites: increment(added ? 1 : -1)
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('⭐ Car favorite tracked:', carId, added ? 'added' : 'removed');
      }
    } catch (error) {
      console.error('❌ Track favorite error:', error);
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
      const views = viewsSnapshot.docs.map(doc => doc.data() as CarView);

      // Get inquiries
      const inquiriesQuery = query(
        collection(db, 'car_inquiries'),
        where('carId', '==', carId),
        where('createdAt', '>=', startDate)
      );
      const inquiriesSnapshot = await getDocs(inquiriesQuery);

      // Get favorites count
      const carDoc = await getDocs(query(collection(db, 'cars'), where('__name__', '==', carId)));
      const carData = carDoc.docs[0]?.data();
      const favorites = carData?.favorites || 0;

      // Calculate metrics
      const uniqueViewers = new Set(views.map(v => v.userId)).size;
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
      console.error('❌ Get performance error:', error);
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
   */
  async getUserCarAnalytics(userId: string): Promise<{
    totalViews: number;
    totalInquiries: number;
    totalFavorites: number;
    avgResponseTime: number;
  }> {
    try {
      // This would aggregate all cars owned by the user
      // For now, return placeholder data
      return {
        totalViews: 0,
        totalInquiries: 0,
        totalFavorites: 0,
        avgResponseTime: 0
      };
    } catch (error) {
      console.error('❌ Get user analytics error:', error);
      return {
        totalViews: 0,
        totalInquiries: 0,
        totalFavorites: 0,
        avgResponseTime: 0
      };
    }
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

