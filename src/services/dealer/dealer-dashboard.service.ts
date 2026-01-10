// src/services/dealer/dealer-dashboard.service.ts
// Dealer Dashboard Service - خدمة لوحة تحكم التاجر
// الهدف: جمع البيانات المطلوبة لـ Dealer Dashboard Widgets

import { collection, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { unifiedCarService } from '../car/unified-car-service';
import { serviceLogger } from '../logger-service';
import { VEHICLE_COLLECTIONS } from '../car/unified-car-types';

// ==================== TYPES ====================

export interface DealerDashboardStats {
  totalListings: number;
  activeListings: number;
  soldListings: number;
  draftListings: number;
  totalViews: number;
  totalViewsThisWeek: number;
  totalViewsThisMonth: number;
  totalLeads: number;
  leadsThisWeek: number;
  leadsThisMonth: number;
  totalMessages: number;
  unreadMessages: number;
  averageResponseTime: number; // in minutes
  responseRate: number; // percentage
  conversionRate: number; // percentage (leads / views)
  totalRevenue: number;
  averagePrice: number;
}

export interface TopListing {
  id: string;
  make: string;
  model: string;
  year?: number;
  price: number;
  views: number;
  messages: number;
  leads: number;
  status: string;
  createdAt: Timestamp;
  url: string; // Numeric URL
}

export interface DashboardAlert {
  id: string;
  type: 'missing_images' | 'missing_description' | 'price_too_high' | 'price_too_low' | 'no_activity' | 'needs_update';
  severity: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  carId?: string;
  carTitle?: string;
  actionUrl?: string;
  createdAt: Timestamp;
}

export interface DashboardTask {
  id: string;
  type: 'add_images' | 'update_price' | 'add_description' | 'respond_message' | 'update_listing';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  carId?: string;
  carTitle?: string;
  actionUrl?: string;
  createdAt: Timestamp;
  dueDate?: Timestamp;
}

export interface DealerDashboardData {
  stats: DealerDashboardStats;
  topListings: TopListing[];
  alerts: DashboardAlert[];
  tasks: DashboardTask[];
}

// ==================== SERVICE ====================

class DealerDashboardService {
  private static instance: DealerDashboardService;

  private constructor() {}

  static getInstance(): DealerDashboardService {
    if (!DealerDashboardService.instance) {
      DealerDashboardService.instance = new DealerDashboardService();
    }
    return DealerDashboardService.instance;
  }

  /**
   * Get complete dashboard data for dealer
   */
  async getDashboardData(userId: string): Promise<DealerDashboardData> {
    try {
      const [stats, topListings, alerts, tasks] = await Promise.all([
        this.getStats(userId),
        this.getTopListings(userId, 5),
        this.getAlerts(userId),
        this.getTasks(userId)
      ]);

      return {
        stats,
        topListings,
        alerts,
        tasks
      };
    } catch (error) {
      serviceLogger.error('Error getting dashboard data', error as Error, { userId });
      throw error;
    }
  }

  /**
   * Get dashboard statistics
   */
  async getStats(userId: string): Promise<DealerDashboardStats> {
    try {
      // Get all user cars
      const userCars = await unifiedCarService.getUserCars(userId);

      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      let totalViews = 0;
      let viewsThisWeek = 0;
      let viewsThisMonth = 0;
      let totalLeads = 0;
      let leadsThisWeek = 0;
      let leadsThisMonth = 0;
      let totalMessages = 0;
      let unreadMessages = 0;

      const activeCars = userCars.filter(c => c.isActive && !c.isSold);
      const soldCars = userCars.filter(c => c.isSold);
      const draftCars = userCars.filter(c => !c.isActive && !c.isSold);

      // Calculate views and leads from car data
      for (const car of userCars) {
        const views = car.views || 0;
        const messages = (car as any).messageCount || 0;
        const leads = messages; // For now, consider messages as leads

        totalViews += views;
        totalLeads += leads;
        totalMessages += messages;

        // Check dates for week/month calculations
        if (car.createdAt) {
          const carDate = (car.createdAt as any).toDate ? (car.createdAt as any).toDate() : new Date(car.createdAt);
          if (carDate >= weekAgo) {
            viewsThisWeek += views;
            leadsThisWeek += leads;
          }
          if (carDate >= monthAgo) {
            viewsThisMonth += views;
            leadsThisMonth += leads;
          }
        }
      }

      // Calculate response metrics (simplified - should be from messages collection)
      const averageResponseTime = 42; // minutes - should be calculated from messages
      const responseRate = 85; // percentage - should be calculated from messages

      // Calculate conversion rate
      const conversionRate = totalViews > 0 ? (totalLeads / totalViews) * 100 : 0;

      // Calculate revenue (simplified)
      const totalRevenue = soldCars.reduce((sum, car) => sum + (car.price || car.netPrice || 0), 0);

      // Calculate average price
      const prices = activeCars.map(c => c.price || c.netPrice || 0).filter(p => p > 0);
      const averagePrice = prices.length > 0
        ? prices.reduce((a, b) => a + b, 0) / prices.length
        : 0;

      return {
        totalListings: userCars.length,
        activeListings: activeCars.length,
        soldListings: soldCars.length,
        draftListings: draftCars.length,
        totalViews,
        totalViewsThisWeek: viewsThisWeek,
        totalViewsThisMonth: viewsThisMonth,
        totalLeads,
        leadsThisWeek,
        leadsThisMonth,
        totalMessages,
        unreadMessages,
        averageResponseTime,
        responseRate,
        conversionRate,
        totalRevenue,
        averagePrice
      };
    } catch (error) {
      serviceLogger.error('Error getting stats', error as Error, { userId });
      throw error;
    }
  }

  /**
   * Get top performing listings
   */
  async getTopListings(userId: string, limitCount: number = 5): Promise<TopListing[]> {
    try {
      const userCars = await unifiedCarService.getUserCars(userId);
      const activeCars = userCars.filter(c => c.isActive && !c.isSold);

      // Sort by views (or combined metric)
      const sorted = activeCars
        .map(car => ({
          id: car.id || '',
          make: car.make || '',
          model: car.model || '',
          year: car.firstRegistration || car.year,
          price: car.price || car.netPrice || 0,
          views: car.views || 0,
          messages: (car as any).messageCount || 0,
          leads: (car as any).messageCount || 0,
          status: car.isActive ? 'active' : 'draft',
          createdAt: car.createdAt as Timestamp,
          // ✅ CONSTITUTION: Use numeric URL pattern
          url: car.sellerNumericId && car.carNumericId
            ? `/car/${car.sellerNumericId}/${car.carNumericId}`
            : '/cars' // Fallback to cars list
        }))
        .sort((a, b) => {
          // Sort by combined score: views * 0.6 + messages * 0.4
          const scoreA = a.views * 0.6 + a.messages * 0.4;
          const scoreB = b.views * 0.6 + b.messages * 0.4;
          return scoreB - scoreA;
        })
        .slice(0, limitCount);

      return sorted;
    } catch (error) {
      serviceLogger.error('Error getting top listings', error as Error, { userId });
      return [];
    }
  }

  /**
   * Get intelligent alerts
   */
  async getAlerts(userId: string): Promise<DashboardAlert[]> {
    try {
      const userCars = await unifiedCarService.getUserCars(userId);
      const activeCars = userCars.filter(c => c.isActive && !c.isSold);
      const alerts: DashboardAlert[] = [];

      // Get average price for price comparisons
      const prices = activeCars.map(c => c.price || c.netPrice || 0).filter(p => p > 0);
      const averagePrice = prices.length > 0
        ? prices.reduce((a, b) => a + b, 0) / prices.length
        : 0;

      for (const car of activeCars) {
        const carId = car.id || '';
        const carTitle = `${car.make || ''} ${car.model || ''} ${car.firstRegistration || car.year || ''}`.trim();
        // ✅ CONSTITUTION: Use numeric URL pattern
        const carUrl = car.sellerNumericId && car.carNumericId
          ? `/car/${car.sellerNumericId}/${car.carNumericId}`
          : '/cars'; // Fallback to cars list

        // Check for missing images
        const images = car.images || [];
        if (images.length < 3) {
          alerts.push({
            id: `alert-${carId}-images`,
            type: 'missing_images',
            severity: images.length === 0 ? 'high' : 'medium',
            title: 'Missing Images',
            message: `${carTitle} has only ${images.length} image(s). Add more images to improve visibility.`,
            carId,
            carTitle,
            actionUrl: `${carUrl}?edit=true`,
            createdAt: car.createdAt as Timestamp
          });
        }

        // Check for missing description
        const description = car.description || '';
        if (description.length < 100) {
          alerts.push({
            id: `alert-${carId}-description`,
            type: 'missing_description',
            severity: description.length === 0 ? 'high' : 'medium',
            title: 'Missing Description',
            message: `${carTitle} has a short description (${description.length} chars). Add more details.`,
            carId,
            carTitle,
            actionUrl: `${carUrl}?edit=true`,
            createdAt: car.createdAt as Timestamp
          });
        }

        // Check for price anomalies
        const carPrice = car.price || car.netPrice || 0;
        if (averagePrice > 0) {
          const priceDiff = ((carPrice - averagePrice) / averagePrice) * 100;
          if (priceDiff > 30) {
            alerts.push({
              id: `alert-${carId}-price-high`,
              type: 'price_too_high',
              severity: priceDiff > 50 ? 'high' : 'medium',
              title: 'Price Above Average',
              message: `${carTitle} is priced ${priceDiff.toFixed(0)}% above market average.`,
              carId,
              carTitle,
              actionUrl: `${carUrl}?edit=true`,
              createdAt: car.createdAt as Timestamp
            });
          } else if (priceDiff < -30) {
            alerts.push({
              id: `alert-${carId}-price-low`,
              type: 'price_too_low',
              severity: 'low',
              title: 'Price Below Average',
              message: `${carTitle} is priced ${Math.abs(priceDiff).toFixed(0)}% below market average.`,
              carId,
              carTitle,
              actionUrl: `${carUrl}?edit=true`,
              createdAt: car.createdAt as Timestamp
            });
          }
        }

        // Check for no activity (no views in last 30 days)
        const views = car.views || 0;
        if (views === 0 && car.createdAt) {
          const carDate = (car.createdAt as any).toDate ? (car.createdAt as any).toDate() : new Date(car.createdAt);
          const daysSinceCreation = (Date.now() - carDate.getTime()) / (1000 * 60 * 60 * 24);
          if (daysSinceCreation > 30) {
            alerts.push({
              id: `alert-${carId}-no-activity`,
              type: 'no_activity',
              severity: 'medium',
              title: 'No Activity',
              message: `${carTitle} has no views in the last 30 days. Consider updating the listing.`,
              carId,
              carTitle,
              actionUrl: `${carUrl}?edit=true`,
              createdAt: car.createdAt as Timestamp
            });
          }
        }
      }

      // Sort by severity (high -> medium -> low)
      const severityOrder = { high: 3, medium: 2, low: 1 };
      alerts.sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]);

      return alerts.slice(0, 10); // Return top 10 alerts
    } catch (error) {
      serviceLogger.error('Error getting alerts', error as Error, { userId });
      return [];
    }
  }

  /**
   * Get actionable tasks
   */
  async getTasks(userId: string): Promise<DashboardTask[]> {
    try {
      const alerts = await this.getAlerts(userId);
      const tasks: DashboardTask[] = [];

      // Convert high-priority alerts to tasks
      for (const alert of alerts) {
        if (alert.severity === 'high' && alert.carId) {
          let taskType: DashboardTask['type'] = 'update_listing';
          if (alert.type === 'missing_images') taskType = 'add_images';
          else if (alert.type === 'missing_description') taskType = 'add_description';
          else if (alert.type === 'price_too_high' || alert.type === 'price_too_low') taskType = 'update_price';

          tasks.push({
            id: `task-${alert.id}`,
            type: taskType,
            priority: 'high',
            title: alert.title,
            description: alert.message,
            carId: alert.carId,
            carTitle: alert.carTitle,
            actionUrl: alert.actionUrl,
            createdAt: alert.createdAt
          });
        }
      }

      // Add recurring tasks (e.g., update old listings)
      const userCars = await unifiedCarService.getUserCars(userId);
      const activeCars = userCars.filter(c => c.isActive && !c.isSold);
      const now = new Date();

      for (const car of activeCars) {
        if (car.createdAt) {
          const carDate = (car.createdAt as any).toDate ? (car.createdAt as any).toDate() : new Date(car.createdAt);
          const daysSinceCreation = (Date.now() - carDate.getTime()) / (1000 * 60 * 60 * 24);

          if (daysSinceCreation > 90) {
            const carTitle = `${car.make || ''} ${car.model || ''} ${car.firstRegistration || car.year || ''}`.trim();
            // ✅ CONSTITUTION: Use numeric URL pattern
            const carUrl = car.sellerNumericId && car.carNumericId
              ? `/car/${car.sellerNumericId}/${car.carNumericId}`
              : '/cars'; // Fallback to cars list

            tasks.push({
              id: `task-${car.id}-update`,
              type: 'update_listing',
              priority: 'medium',
              title: 'Update Old Listing',
              description: `${carTitle} hasn't been updated in ${Math.floor(daysSinceCreation)} days. Consider refreshing the listing.`,
              carId: car.id,
              carTitle,
              actionUrl: `${carUrl}?edit=true`,
              createdAt: car.createdAt as Timestamp,
              dueDate: Timestamp.fromDate(new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)) // 7 days from now
            });
          }
        }
      }

      // Sort by priority and due date
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      tasks.sort((a, b) => {
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        if (a.dueDate && b.dueDate) {
          return a.dueDate.toMillis() - b.dueDate.toMillis();
        }
        return 0;
      });

      return tasks.slice(0, 10); // Return top 10 tasks
    } catch (error) {
      serviceLogger.error('Error getting tasks', error as Error, { userId });
      return [];
    }
  }
}

export const dealerDashboardService = DealerDashboardService.getInstance();

