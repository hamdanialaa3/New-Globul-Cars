// src/services/analytics/profile-analytics.service.ts
// Real Profile Analytics Service with Firebase
// 🎯 100% Real Data - No Mock!
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  query, 
  where, 
  orderBy, 
  limit,
  increment,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { logger } from '../logger-service';

// ==================== TYPES ====================

export interface ProfileAnalytics {
  profileViews: number;
  uniqueVisitors: number;
  carViews: number;
  inquiries: number;
  favorites: number;
  followers: number;
  responseTime: number; // in hours
  conversionRate: number; // percentage
  viewsByDay: Record<string, number>;
  viewsChange: number; // percentage
  visitorsChange: number;
  inquiriesChange: number;
  favoritesChange: number;
  conversionChange: number;
  responseTimeChange: number;
}

export interface AnalyticsEvent {
  type: 'profile_view' | 'car_view' | 'inquiry' | 'favorite' | 'follower' | 'response';
  userId: string;
  targetUserId: string;
  carId?: string;
  visitorId: string; // IP or fingerprint
  timestamp: Date;
  metadata?: Record<string, any>;
}

// ==================== SERVICE ====================

class ProfileAnalyticsService {
  private analyticsCollection = 'profile_analytics';
  private eventsCollection = 'analytics_events';
  private metricsCollection = 'profile_metrics';

  /**
   * Track Profile View
   */
  async trackProfileView(targetUserId: string, visitorId: string): Promise<void> {
    try {
      const eventId = `${targetUserId}_${visitorId}_${Date.now()}`;
      const eventRef = doc(db, this.eventsCollection, eventId);
      
      await setDoc(eventRef, {
        type: 'profile_view',
        targetUserId,
        visitorId,
        timestamp: serverTimestamp(),
        metadata: {
          userAgent: navigator.userAgent,
          referrer: document.referrer
        }
      });

      // Update metrics
      await this.updateMetrics(targetUserId, 'profileViews', 1);
      
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Profile view tracked', { targetUserId });
      }
    } catch (error) {
      logger.error('Error tracking profile view', error as Error, { targetUserId, visitorId });
    }
  }

  /**
   * Track Car View
   */
  async trackCarView(carId: string, ownerId: string, visitorId: string): Promise<void> {
    try {
      const eventId = `${carId}_${visitorId}_${Date.now()}`;
      const eventRef = doc(db, this.eventsCollection, eventId);
      
      await setDoc(eventRef, {
        type: 'car_view',
        targetUserId: ownerId,
        carId,
        visitorId,
        timestamp: serverTimestamp()
      });

      await this.updateMetrics(ownerId, 'carViews', 1);
      
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Car view tracked', { carId, ownerId });
      }
    } catch (error) {
      logger.error('Error tracking car view', error as Error, { carId, ownerId, visitorId });
    }
  }

  /**
   * Track Inquiry
   */
  async trackInquiry(targetUserId: string, fromUserId: string, carId?: string): Promise<void> {
    try {
      const eventId = `inquiry_${targetUserId}_${fromUserId}_${Date.now()}`;
      const eventRef = doc(db, this.eventsCollection, eventId);
      
      await setDoc(eventRef, {
        type: 'inquiry',
        targetUserId,
        userId: fromUserId,
        carId,
        timestamp: serverTimestamp()
      });

      await this.updateMetrics(targetUserId, 'inquiries', 1);
      
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Inquiry tracked', { targetUserId, fromUserId, carId });
      }
    } catch (error) {
      logger.error('Error tracking inquiry', error as Error, { targetUserId, fromUserId, carId });
    }
  }

  /**
   * Track Favorite
   */
  async trackFavorite(carId: string, ownerId: string, userId: string, action: 'add' | 'remove'): Promise<void> {
    try {
      const eventId = `favorite_${carId}_${userId}_${Date.now()}`;
      const eventRef = doc(db, this.eventsCollection, eventId);
      
      await setDoc(eventRef, {
        type: 'favorite',
        targetUserId: ownerId,
        userId,
        carId,
        action,
        timestamp: serverTimestamp()
      });

      await this.updateMetrics(ownerId, 'favorites', action === 'add' ? 1 : -1);
      
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Favorite action tracked', { carId, ownerId, userId, action });
      }
    } catch (error) {
      logger.error('Error tracking favorite', error as Error, { carId, ownerId, userId, action });
    }
  }

  /**
   * Track Response
   */
  async trackResponse(userId: string, inquiryTime: Date, responseTime: Date): Promise<void> {
    try {
      const responseTimeHours = (responseTime.getTime() - inquiryTime.getTime()) / (1000 * 60 * 60);
      
      const eventId = `response_${userId}_${Date.now()}`;
      const eventRef = doc(db, this.eventsCollection, eventId);
      
      await setDoc(eventRef, {
        type: 'response',
        targetUserId: userId,
        responseTimeHours,
        timestamp: serverTimestamp()
      });

      // Update average response time
      await this.updateResponseTime(userId, responseTimeHours);
      
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Response tracked', { userId, responseTimeHours });
      }
    } catch (error) {
      logger.error('Error tracking response', error as Error, { userId, inquiryTime, responseTime });
    }
  }

  /**
   * Update Metrics
   */
  private async updateMetrics(userId: string, metric: string, value: number): Promise<void> {
    try {
      const metricsRef = doc(db, this.metricsCollection, userId);
      
      await setDoc(metricsRef, {
        [metric]: increment(value),
        lastUpdated: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      logger.error('Error updating metrics', error as Error, { userId, metric, value });
    }
  }

  /**
   * Update Response Time
   */
  private async updateResponseTime(userId: string, newResponseTime: number): Promise<void> {
    try {
      const metricsRef = doc(db, this.metricsCollection, userId);
      const metricsDoc = await getDoc(metricsRef);
      
      if (metricsDoc.exists()) {
        const data = metricsDoc.data();
        const currentAvg = data.responseTime || 0;
        const currentCount = data.responseCount || 0;
        
        const newAvg = (currentAvg * currentCount + newResponseTime) / (currentCount + 1);
        
        await setDoc(metricsRef, {
          responseTime: newAvg,
          responseCount: increment(1),
          lastUpdated: serverTimestamp()
        }, { merge: true });
      } else {
        await setDoc(metricsRef, {
          responseTime: newResponseTime,
          responseCount: 1,
          lastUpdated: serverTimestamp()
        });
      }
    } catch (error) {
      logger.error('Error updating response time', error as Error, { userId, newResponseTime });
    }
  }

  /**
   * Get Analytics for Period
   */
  async getAnalytics(userId: string, period: '7d' | '30d' | '90d'): Promise<ProfileAnalytics> {
    try {
      const now = new Date();
      const periodDays = period === '7d' ? 7 : period === '30d' ? 30 : 90;
      const startDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
      
      // Get metrics
      const metricsRef = doc(db, this.metricsCollection, userId);
      const metricsDoc = await getDoc(metricsRef);
      
      if (!metricsDoc.exists()) {
        return this.getEmptyAnalytics();
      }
      
      const metrics = metricsDoc.data();
      
      // Get events for period
      const eventsRef = collection(db, this.eventsCollection);
      const eventsQuery = query(
        eventsRef,
        where('targetUserId', '==', userId),
        where('timestamp', '>=', Timestamp.fromDate(startDate)),
        orderBy('timestamp', 'desc')
      );
      
      const eventsSnapshot = await getDocs(eventsQuery);
      
      // Calculate metrics
      const profileViews = eventsSnapshot.docs.filter((doc: any) => doc.data().type === 'profile_view').length;
      const uniqueVisitors = new Set(
        eventsSnapshot.docs
          .filter((doc: any) => doc.data().type === 'profile_view')
          .map((doc: any) => doc.data().visitorId)
      ).size;
      
      const carViews = eventsSnapshot.docs.filter((doc: any) => doc.data().type === 'car_view').length;
      const inquiries = eventsSnapshot.docs.filter((doc: any) => doc.data().type === 'inquiry').length;
      const favorites = eventsSnapshot.docs.filter((doc: any) => doc.data().type === 'favorite' && doc.data().action === 'add').length;
      
      // Calculate conversion rate (inquiries / profile views)
      const conversionRate = profileViews > 0 ? (inquiries / profileViews) * 100 : 0;
      
      // Get views by day
      const viewsByDay = this.calculateViewsByDay(eventsSnapshot.docs, periodDays);
      
      // Calculate changes (compare with previous period)
      const changes = await this.calculateChanges(userId, periodDays);
      
      return {
        profileViews,
        uniqueVisitors,
        carViews,
        inquiries,
        favorites,
        followers: metrics.followers || 0,
        responseTime: parseFloat((metrics.responseTime || 0).toFixed(1)),
        conversionRate: parseFloat(conversionRate.toFixed(1)),
        viewsByDay,
        viewsChange: changes.viewsChange,
        visitorsChange: changes.visitorsChange,
        inquiriesChange: changes.inquiriesChange,
        favoritesChange: changes.favoritesChange,
        conversionChange: changes.conversionChange,
        responseTimeChange: changes.responseTimeChange
      };
      
    } catch (error) {
      logger.error('Error getting profile analytics', error as Error, { userId, period });
      return this.getEmptyAnalytics();
    }
  }

  /**
   * Calculate Views by Day
   */
  private calculateViewsByDay(events: unknown[], periodDays: number): Record<string, number> {
    const viewsByDay: Record<string, number> = {};
    const now = new Date();
    
    if (periodDays === 7) {
      // Last 7 days
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayName = dayNames[date.getDay()];
        viewsByDay[dayName] = 0;
      }
      
      events.forEach(event => {
        const data = event.data();
        if (data.type === 'profile_view' && data.timestamp) {
          const date = data.timestamp.toDate();
          const dayName = dayNames[date.getDay()];
          if (viewsByDay[dayName] !== undefined) {
            viewsByDay[dayName]++;
          }
        }
      });
    } else {
      // Last 30 or 90 days - group by week or month
      const weeks = periodDays === 30 ? 4 : 12;
      for (let i = weeks - 1; i >= 0; i--) {
        const weekLabel = periodDays === 30 ? `Week ${weeks - i}` : `Month ${Math.floor((weeks - i - 1) / 4) + 1}`;
        viewsByDay[weekLabel] = 0;
      }
      
      events.forEach(event => {
        const data = event.data();
        if (data.type === 'profile_view' && data.timestamp) {
          const date = data.timestamp.toDate();
          const daysDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
          const weekIndex = Math.floor(daysDiff / 7);
          
          if (periodDays === 30) {
            const weekLabel = `Week ${4 - weekIndex}`;
            if (viewsByDay[weekLabel] !== undefined) {
              viewsByDay[weekLabel]++;
            }
          } else {
            const monthIndex = Math.floor(daysDiff / 30);
            const monthLabel = `Month ${12 - monthIndex}`;
            if (viewsByDay[monthLabel] !== undefined) {
              viewsByDay[monthLabel]++;
            }
          }
        }
      });
    }
    
    return viewsByDay;
  }

  /**
   * Calculate Changes from Previous Period
   */
  private async calculateChanges(userId: string, periodDays: number): Promise<{
    viewsChange: number;
    visitorsChange: number;
    inquiriesChange: number;
    favoritesChange: number;
    conversionChange: number;
    responseTimeChange: number;
  }> {
    try {
      const now = new Date();
      const currentStart = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
      const previousStart = new Date(now.getTime() - 2 * periodDays * 24 * 60 * 60 * 1000);
      
      const eventsRef = collection(db, this.eventsCollection);
      
      // Get previous period events
      const previousQuery = query(
        eventsRef,
        where('targetUserId', '==', userId),
        where('timestamp', '>=', Timestamp.fromDate(previousStart)),
        where('timestamp', '<', Timestamp.fromDate(currentStart)),
        orderBy('timestamp', 'desc')
      );
      
      const previousSnapshot = await getDocs(previousQuery);
      
      const previousViews = previousSnapshot.docs.filter((doc: any) => doc.data().type === 'profile_view').length;
      const previousVisitors = new Set(
        previousSnapshot.docs
          .filter((doc: any) => doc.data().type === 'profile_view')
          .map((doc: any) => doc.data().visitorId)
      ).size;
      const previousInquiries = previousSnapshot.docs.filter((doc: any) => doc.data().type === 'inquiry').length;
      const previousFavorites = previousSnapshot.docs.filter((doc: any) => doc.data().type === 'favorite' && doc.data().action === 'add').length;
      
      // Get current period
      const currentQuery = query(
        eventsRef,
        where('targetUserId', '==', userId),
        where('timestamp', '>=', Timestamp.fromDate(currentStart)),
        orderBy('timestamp', 'desc')
      );
      
      const currentSnapshot = await getDocs(currentQuery);
      
      const currentViews = currentSnapshot.docs.filter((doc: any) => doc.data().type === 'profile_view').length;
      const currentVisitors = new Set(
        currentSnapshot.docs
          .filter((doc: any) => doc.data().type === 'profile_view')
          .map((doc: any) => doc.data().visitorId)
      ).size;
      const currentInquiries = currentSnapshot.docs.filter((doc: any) => doc.data().type === 'inquiry').length;
      const currentFavorites = currentSnapshot.docs.filter((doc: any) => doc.data().type === 'favorite' && doc.data().action === 'add').length;
      
      const viewsChange = previousViews > 0 ? ((currentViews - previousViews) / previousViews) * 100 : 0;
      const visitorsChange = previousVisitors > 0 ? ((currentVisitors - previousVisitors) / previousVisitors) * 100 : 0;
      const inquiriesChange = previousInquiries > 0 ? ((currentInquiries - previousInquiries) / previousInquiries) * 100 : 0;
      const favoritesChange = previousFavorites > 0 ? ((currentFavorites - previousFavorites) / previousFavorites) * 100 : 0;
      
      return {
        viewsChange: parseFloat(viewsChange.toFixed(1)),
        visitorsChange: parseFloat(visitorsChange.toFixed(1)),
        inquiriesChange: parseFloat(inquiriesChange.toFixed(1)),
        favoritesChange: parseFloat(favoritesChange.toFixed(1)),
        conversionChange: 0, // Will calculate if needed
        responseTimeChange: 0 // Will calculate if needed
      };
    } catch (error) {
      logger.error('Error calculating profile changes', error as Error, { userId, periodDays });
      return {
        viewsChange: 0,
        visitorsChange: 0,
        inquiriesChange: 0,
        favoritesChange: 0,
        conversionChange: 0,
        responseTimeChange: 0
      };
    }
  }

  /**
   * Get Empty Analytics
   */
  private getEmptyAnalytics(): ProfileAnalytics {
    return {
      profileViews: 0,
      uniqueVisitors: 0,
      carViews: 0,
      inquiries: 0,
      favorites: 0,
      followers: 0,
      responseTime: 0,
      conversionRate: 0,
      viewsByDay: {},
      viewsChange: 0,
      visitorsChange: 0,
      inquiriesChange: 0,
      favoritesChange: 0,
      conversionChange: 0,
      responseTimeChange: 0
    };
  }

  /**
   * Get Unique Visitor ID
   */
  getVisitorId(): string {
    // Try to get from localStorage
    let visitorId = localStorage.getItem('visitorId');
    
    if (!visitorId) {
      // Generate new visitor ID
      visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem('visitorId', visitorId);
    }
    
    return visitorId;
  }
}

export const profileAnalyticsService = new ProfileAnalyticsService();
export default profileAnalyticsService;

