/**
 * Analytics Service - Comprehensive user and business analytics
 * Location: Bulgaria | Languages: BG/EN | Currency: EUR
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  addDoc
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
import { db } from '../../firebase/firebase-config';
import { logger } from '../logger-service';
import { FacebookPixelTracker } from '../../utils/analytics/FacebookPixelTracker';

// ==================== INTERFACES ====================

export interface UserAnalytics {
  userId: string;
  period: 'day' | 'week' | 'month' | 'year';
  profileViews: number;
  postViews: number;
  postLikes: number;
  postComments: number;
  postShares: number;
  newFollowers: number;
  newMessages: number;
  engagementRate: number;
  topPosts: TopPost[];
  followerGrowth: DataPoint[];
  engagementTrend: DataPoint[];
}

export interface BusinessAnalytics {
  userId: string;
  period: 'day' | 'week' | 'month' | 'year';
  carListings: number;
  carViews: number;
  carSaves: number;
  carShares: number;
  inquiries: number;
  conversionRate: number;
  topPerformingCars: TopCar[];
  viewsTrend: DataPoint[];
  inquiriesTrend: DataPoint[];
}

export interface TopPost {
  postId: string;
  content: string;
  views: number;
  likes: number;
  comments: number;
  engagementRate: number;
}

export interface TopCar {
  carId: string;
  make: string;
  model: string;
  views: number;
  saves: number;
  inquiries: number;
  conversionRate: number;
}

export interface DataPoint {
  date: string;
  value: number;
}

// ==================== SERVICE CLASS ====================

class AnalyticsService {
  /**
   * Get user analytics for specified period
   */
  async getUserAnalytics(userId: string, period: UserAnalytics['period']): Promise<UserAnalytics> {
    try {
      const dateRange = this.getDateRange(period);

      const [
        profileViews,
        posts,
        followers,
        messages
      ] = await Promise.all([
        this.getProfileViews(userId, dateRange),
        this.getUserPosts(userId, dateRange),
        this.getNewFollowers(userId, dateRange),
        this.getNewMessages(userId, dateRange)
      ]);

      const postMetrics = this.calculatePostMetrics(posts);

      const followerGrowth = await this.getFollowerGrowth(userId, dateRange);
      const engagementTrend = this.calculateEngagementTrend(posts);

      return {
        userId,
        period,
        profileViews,
        postViews: postMetrics.totalViews,
        postLikes: postMetrics.totalLikes,
        postComments: postMetrics.totalComments,
        postShares: postMetrics.totalShares,
        newFollowers: followers.length,
        newMessages: messages.length,
        engagementRate: postMetrics.engagementRate,
        topPosts: postMetrics.topPosts,
        followerGrowth,
        engagementTrend
      };
    } catch (error) {
      logger.error('[ANALYTICS] Error getting user analytics:', error);
      throw new Error('Failed to load analytics');
    }
  }

  /**
   * Get business analytics for dealers/companies
   * ✅ ENHANCED: Complete aggregation implementation
   */
  async getBusinessAnalytics(userId: string, period: BusinessAnalytics['period']): Promise<BusinessAnalytics> {
    try {
      const dateRange = this.getDateRange(period);

      // ✅ DONE: Implement actual aggregation across user's cars
      const [cars, allUserCars] = await Promise.all([
        getDocs(
          query(
            collection(db, 'cars'),
            where('sellerId', '==', userId),
            where('createdAt', '>=', Timestamp.fromDate(dateRange.start)),
            where('createdAt', '<=', Timestamp.fromDate(dateRange.end))
          )
        ),
        getDocs(
          query(
            collection(db, 'cars'),
            where('sellerId', '==', userId)
          )
        )
      ]);

      let totalViews = 0;
      let totalSaves = 0;
      let totalShares = 0;
      let totalInquiries = 0;
      const topCars: TopCar[] = [];

      // Aggregate metrics from all user's cars (not just period cars)
      for (const carDoc of allUserCars.docs) {
        const car = carDoc.data();
        const views = car.analytics?.totalViews || car.views || 0;
        const saves = car.analytics?.totalSaves || car.saves || 0;
        const shares = car.analytics?.totalShares || car.shares || 0;
        const inquiries = car.analytics?.totalInquiries || car.inquiries || 0;

        totalViews += views;
        totalSaves += saves;
        totalShares += shares;
        totalInquiries += inquiries;

        const conversionRate = views > 0 ? (inquiries / views) * 100 : 0;

        topCars.push({
          carId: carDoc.id,
          make: car.make,
          model: car.model,
          views,
          saves,
          inquiries,
          conversionRate
        });
      }

      topCars.sort((a, b) => b.views - a.views);

      const viewsTrend = await this.getCarViewsTrend(userId, dateRange);
      const inquiriesTrend = await this.getInquiriesTrend(userId, dateRange);

      const conversionRate = totalViews > 0 ? (totalInquiries / totalViews) * 100 : 0;

      return {
        userId,
        period,
        carListings: cars.size,
        carViews: totalViews,
        carSaves: totalSaves,
        carShares: totalShares,
        inquiries: totalInquiries,
        conversionRate,
        topPerformingCars: topCars.slice(0, 5),
        viewsTrend,
        inquiriesTrend
      };
    } catch (error) {
      logger.error('[ANALYTICS] Error getting business analytics:', error);
      throw new Error('Failed to load business analytics');
    }
  }

  // ==================== PRIVATE HELPERS ====================

  private getDateRange(period: string): { start: Date; end: Date } {
    const end = new Date();
    const start = new Date();

    switch (period) {
      case 'day':
        start.setDate(start.getDate() - 1);
        break;
      case 'week':
        start.setDate(start.getDate() - 7);
        break;
      case 'month':
        start.setMonth(start.getMonth() - 1);
        break;
      case 'year':
        start.setFullYear(start.getFullYear() - 1);
        break;
    }

    return { start, end };
  }

  private async getProfileViews(userId: string, dateRange: { start: Date; end: Date }): Promise<number> {
    try {
      const viewsSnapshot = await getDocs(
        query(
          collection(db, 'analytics', 'profileViews', userId),
          where('timestamp', '>=', Timestamp.fromDate(dateRange.start)),
          where('timestamp', '<=', Timestamp.fromDate(dateRange.end))
        )
      );

      return viewsSnapshot.size;
    } catch (error) {
      return 0;
    }
  }

  private async getUserPosts(userId: string, dateRange: { start: Date; end: Date }) {
    const postsSnapshot = await getDocs(
      query(
        collection(db, 'posts'),
        where('authorId', '==', userId),
        where('createdAt', '>=', Timestamp.fromDate(dateRange.start)),
        where('createdAt', '<=', Timestamp.fromDate(dateRange.end))
      )
    );

    return postsSnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
  }

  private async getNewFollowers(userId: string, dateRange: { start: Date; end: Date }) {
    const followersSnapshot = await getDocs(
      query(
        collection(db, 'follows'),
        where('followingId', '==', userId),
        where('createdAt', '>=', Timestamp.fromDate(dateRange.start)),
        where('createdAt', '<=', Timestamp.fromDate(dateRange.end))
      )
    );

    return followersSnapshot.docs;
  }

  private async getNewMessages(userId: string, dateRange: { start: Date; end: Date }) {
    const messagesSnapshot = await getDocs(
      query(
        collection(db, 'messages'),
        where('recipientId', '==', userId),
        where('createdAt', '>=', Timestamp.fromDate(dateRange.start)),
        where('createdAt', '<=', Timestamp.fromDate(dateRange.end))
      )
    );

    return messagesSnapshot.docs;
  }

  private calculatePostMetrics(posts: unknown[]) {
    let totalViews = 0;
    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;

    const topPosts: TopPost[] = posts.map((post: any) => {
      const views = post.views || 0;
      const likes = post.likes || 0;
      const comments = post.comments || 0;

      totalViews += views;
      totalLikes += likes;
      totalComments += comments;
      totalShares += post.shares || 0;

      const engagementRate = views > 0 ? ((likes + comments) / views) * 100 : 0;

      return {
        postId: post.id,
        content: post.content?.substring(0, 100) || '',
        views,
        likes,
        comments,
        engagementRate
      };
    });

    topPosts.sort((a, b) => b.engagementRate - a.engagementRate);

    const engagementRate = totalViews > 0
      ? ((totalLikes + totalComments) / totalViews) * 100
      : 0;

    return {
      totalViews,
      totalLikes,
      totalComments,
      totalShares,
      engagementRate,
      topPosts: topPosts.slice(0, 5)
    };
  }

  private async getFollowerGrowth(userId: string, dateRange: { start: Date; end: Date }): Promise<DataPoint[]> {
    // ✅ DONE: Daily follower growth tracking
    const days = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
    const growth: DataPoint[] = [];

    for (let i = 0; i < days; i++) {
      const date = new Date(dateRange.start);
      date.setDate(date.getDate() + i);

      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      try {
        const followersSnapshot = await getDocs(
          query(
            collection(db, 'follows'),
            where('followingId', '==', userId),
            where('createdAt', '>=', Timestamp.fromDate(dayStart)),
            where('createdAt', '<=', Timestamp.fromDate(dayEnd))
          )
        );

        growth.push({
          date: date.toISOString().split('T')[0],
          value: followersSnapshot.size
        });
      } catch {
        growth.push({ date: date.toISOString().split('T')[0], value: 0 });
      }
    }

    return growth;
  }

  private calculateEngagementTrend(posts: unknown[]): DataPoint[] {
    // ✅ DONE: Engagement trend calculation
    const dailyEngagement = new Map<string, { views: number; interactions: number }>();

    posts.forEach(post => {
      const date = post.createdAt?.toDate?.()?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0];
      const views = post.views || 0;
      const interactions = (post.likes || 0) + (post.comments || 0);

      const existing = dailyEngagement.get(date) || { views: 0, interactions: 0 };
      dailyEngagement.set(date, {
        views: existing.views + views,
        interactions: existing.interactions + interactions
      });
    });

    return Array.from(dailyEngagement.entries()).map(([date, data]) => ({
      date,
      value: data.views > 0 ? (data.interactions / data.views) * 100 : 0
    })).sort((a, b) => a.date.localeCompare(b.date));
  }

  private async getCarViewsTrend(userId: string, dateRange: { start: Date; end: Date }): Promise<DataPoint[]> {
    // ✅ DONE: Car views trend tracking
    const days = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
    const trend: DataPoint[] = [];

    for (let i = 0; i < days; i++) {
      const date = new Date(dateRange.start);
      date.setDate(date.getDate() + i);

      try {
        const viewsSnapshot = await getDocs(
          query(
            collection(db, 'analytics', 'carViews', userId),
            where('date', '==', date.toISOString().split('T')[0])
          )
        );

        let totalViews = 0;
        viewsSnapshot.docs.forEach(doc => {
          totalViews += doc.data().views || 0;
        });

        trend.push({
          date: date.toISOString().split('T')[0],
          value: totalViews
        });
      } catch {
        trend.push({ date: date.toISOString().split('T')[0], value: 0 });
      }
    }

    return trend;
  }

  private async getInquiriesTrend(userId: string, dateRange: { start: Date; end: Date }): Promise<DataPoint[]> {
    // ✅ DONE: Inquiries trend tracking
    const days = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
    const trend: DataPoint[] = [];

    for (let i = 0; i < days; i++) {
      const date = new Date(dateRange.start);
      date.setDate(date.getDate() + i);

      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      try {
        const inquiriesSnapshot = await getDocs(
          query(
            collection(db, 'inquiries'),
            where('sellerId', '==', userId),
            where('createdAt', '>=', Timestamp.fromDate(dayStart)),
            where('createdAt', '<=', Timestamp.fromDate(dayEnd))
          )
        );

        trend.push({
          date: date.toISOString().split('T')[0],
          value: inquiriesSnapshot.size
        });
      } catch {
        trend.push({ date: date.toISOString().split('T')[0], value: 0 });
      }
    }

    return trend;
  }

  /**
   * ✅ NEW: Track analytics events
   */
  async trackEvent(eventName: string, properties: Record<string, any> = {}): Promise<void> {
    try {
      // Send to Google Analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', eventName, properties);
      }

      // Send to Facebook Pixel
      if (typeof window !== 'undefined' && (window as any).fbq) {
        // Map common events to standard Facebook events
        switch (eventName) {
          case 'page_view':
            (window as any).fbq('track', 'PageView', properties);
            break;
          case 'car_view':
            FacebookPixelTracker.viewContent(properties.car || properties);
            break;
          case 'search':
            FacebookPixelTracker.search(properties.searchTerm || '', properties);
            break;
          case 'inquiry':
          case 'lead':
            FacebookPixelTracker.lead(properties.car || properties);
            break;
          case 'signup':
            FacebookPixelTracker.completeRegistration();
            break;
          case 'login':
            FacebookPixelTracker.login(properties.method || 'unknown');
            break;
          default:
            (window as any).fbq('track', eventName, properties);
        }
      }

      // Store in Firestore for internal analytics
      await addDoc(collection(db, 'analytics_events'), {
        event: eventName,
        properties,
        timestamp: Timestamp.now(),
        userId: properties.userId || null,
        sessionId: this.getSessionId()
      });

      logger.info('[ANALYTICS] Event tracked:', { eventName, properties });
    } catch (error) {
      logger.error('[ANALYTICS] Error tracking event:', error);
    }
  }

  /**
   * ✅ NEW: Track page views
   */
  async trackPageView(page: string, userId?: string): Promise<void> {
    await this.trackEvent('page_view', {
      page,
      userId,
      timestamp: Date.now()
    });
  }

  /**
   * ✅ NEW: Track user interactions
   */
  async trackInteraction(type: string, target: string, userId?: string): Promise<void> {
    await this.trackEvent('user_interaction', {
      type,
      target,
      userId,
      timestamp: Date.now()
    });
  }

  /**
   * ✅ NEW: Get session ID for tracking
   */
  private getSessionId(): string {
    if (typeof window === 'undefined') return 'server';

    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }
}

export const analyticsService = new AnalyticsService();
