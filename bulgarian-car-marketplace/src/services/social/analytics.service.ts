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
  Timestamp
} from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';

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
      console.error('[ANALYTICS] Error getting user analytics:', error);
      throw new Error('Failed to load analytics');
    }
  }

  /**
   * Get business analytics for dealers/companies
   */
  async getBusinessAnalytics(userId: string, period: BusinessAnalytics['period']): Promise<BusinessAnalytics> {
    try {
      const dateRange = this.getDateRange(period);
      
      const cars = await getDocs(
        query(
          collection(db, 'cars'),
          where('sellerId', '==', userId),
          where('createdAt', '>=', Timestamp.fromDate(dateRange.start)),
          where('createdAt', '<=', Timestamp.fromDate(dateRange.end))
        )
      );
      
      let totalViews = 0;
      let totalSaves = 0;
      let totalShares = 0;
      let totalInquiries = 0;
      const topCars: TopCar[] = [];
      
      for (const carDoc of cars.docs) {
        const car = carDoc.data();
        const views = car.views || 0;
        const saves = car.saves || 0;
        const inquiries = car.inquiries || 0;
        
        totalViews += views;
        totalSaves += saves;
        totalShares += car.shares || 0;
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
      console.error('[ANALYTICS] Error getting business analytics:', error);
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
    
    return postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

  private calculatePostMetrics(posts: any[]) {
    let totalViews = 0;
    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;
    
    const topPosts: TopPost[] = posts.map(post => {
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
    // TODO: Implement daily follower growth tracking
    return [];
  }

  private calculateEngagementTrend(posts: any[]): DataPoint[] {
    // TODO: Implement engagement trend calculation
    return [];
  }

  private async getCarViewsTrend(userId: string, dateRange: { start: Date; end: Date }): Promise<DataPoint[]> {
    // TODO: Implement car views trend tracking
    return [];
  }

  private async getInquiriesTrend(userId: string, dateRange: { start: Date; end: Date }): Promise<DataPoint[]> {
    // TODO: Implement inquiries trend tracking
    return [];
  }
}

export const analyticsService = new AnalyticsService();
