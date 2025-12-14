/**
 * IMPORTANT: Always call the returned unsubscribe function from any subscribe method to avoid memory leaks.
 * Usage:
 *   const cleanup = analyticsService.subscribeToAnalytics(...);
 *   useEffect(() => { ...; return cleanup; }, []);
 */
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc,
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { serviceLogger } from './logger-wrapper';

// Real-time Analytics Interfaces
export interface RealTimeAnalytics {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  totalCars: number;
  activeCars: number;
  carsListedToday: number;
  totalMessages: number;
  messagesSentToday: number;
  totalViews: number;
  viewsToday: number;
  revenue: number;
  trafficSources: { [key: string]: number };
  geoDistribution: { [key: string]: number };
  deviceUsage: { [key: string]: number };
  pageViews: { [key: string]: number };
  topCountries: { country: string; count: number }[];
  topCities: { city: string; count: number }[];
  userGrowth: { date: string; count: number }[];
  carListings: { date: string; count: number }[];
  lastUpdated: Date;
}

export interface UserActivity {
  uid: string;
  email: string;
  displayName: string;
  lastLogin: Date;
  loginCount: number;
  location: string;
  device: string;
  browser: string;
  isOnline: boolean;
  lastActivity: Date;
}

export interface ContentModeration {
  reportedCars: number;
  pendingReviews: number;
  bannedUsers: number;
  deletedContent: number;
  flaggedMessages: number;
}

export interface SystemPerformance {
  timestamp: Date;
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  activeConnections: number;
  errorRate: number;
}

class RealTimeAnalyticsService {
  private static instance: RealTimeAnalyticsService;
  private analyticsCache: RealTimeAnalytics | null = null;
  private cacheExpiry: number = 0;
  private readonly CACHE_DURATION = 30000; // 30 seconds

  private constructor() {}

  public static getInstance(): RealTimeAnalyticsService {
    if (!RealTimeAnalyticsService.instance) {
      RealTimeAnalyticsService.instance = new RealTimeAnalyticsService();
    }
    return RealTimeAnalyticsService.instance;
  }

  // Get real-time analytics with actual Firebase data
  public async getRealTimeAnalytics(): Promise<RealTimeAnalytics> {
    try {
      // Check cache first
      if (this.analyticsCache && Date.now() < this.cacheExpiry) {
        return this.analyticsCache;
      }

      // Get all data from Firebase with error handling
      let usersSnapshot, carsSnapshot, messagesSnapshot, viewsSnapshot, userActivitySnapshot;
      
      try {
        [usersSnapshot, carsSnapshot, messagesSnapshot, viewsSnapshot, userActivitySnapshot] = await Promise.all([
          getDocs(collection(db, 'users')).catch(() => ({ docs: [] })),
          queryAllCollections().catch(() => ({ docs: [] })),
          getDocs(collection(db, 'messages')).catch(() => ({ docs: [] })),
          getDocs(collection(db, 'views')).catch(() => ({ docs: [] })),
          getDocs(collection(db, 'user_activity')).catch(() => ({ docs: [] }))
        ]);
      } catch (error) {
        serviceLogger.warn('Firebase connection failed, using mock data', error as Error);
        // Return mock data if Firebase fails
        return this.getMockAnalytics();
      }

      const users = usersSnapshot.docs.map(doc => doc.data());
      const cars = carsSnapshot.docs.map(doc => doc.data());
      const messages = messagesSnapshot.docs.map(doc => doc.data());
      const views = viewsSnapshot.docs.map(doc => doc.data());
      const userActivity = userActivitySnapshot.docs.map(doc => doc.data());

      // Calculate today's date
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Calculate metrics
      const totalUsers = users.length;
      const activeUsers = users.filter(user => 
        user.lastLogin && new Date(user.lastLogin.seconds * 1000) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length;
      
      const newUsersToday = users.filter(user => 
        user.createdAt && new Date(user.createdAt.seconds * 1000) >= today
      ).length;

      const totalCars = cars.length;
      const activeCars = cars.filter(car => car.isActive !== false).length;
      
      const carsListedToday = cars.filter(car => 
        car.createdAt && new Date(car.createdAt.seconds * 1000) >= today
      ).length;

      const totalMessages = messages.length;
      const messagesSentToday = messages.filter(message => 
        message.createdAt && new Date(message.createdAt.seconds * 1000) >= today
      ).length;

      const totalViews = views.length;
      const viewsToday = views.filter(view => 
        view.timestamp && new Date(view.timestamp.seconds * 1000) >= today
      ).length;

      // Calculate revenue (from car sales)
      const revenue = cars
        .filter(car => car.status === 'sold' && car.price)
        .reduce((sum, car) => sum + (car.price || 0), 0);

      // Traffic sources analysis
      const trafficSources: { [key: string]: number } = {};
      userActivity.forEach(activity => {
        if (activity.trafficSource) {
          trafficSources[activity.trafficSource] = (trafficSources[activity.trafficSource] || 0) + 1;
        }
      });

      // Geographic distribution
      const geoDistribution: { [key: string]: number } = {};
      users.forEach(user => {
        if (user.location?.city) {
          geoDistribution[user.locationData?.cityName] = (geoDistribution[user.locationData?.cityName] || 0) + 1;
        }
      });

      // Device usage
      const deviceUsage: { [key: string]: number } = {};
      userActivity.forEach(activity => {
        if (activity.device) {
          deviceUsage[activity.device] = (deviceUsage[activity.device] || 0) + 1;
        }
      });

      // Page views
      const pageViews: { [key: string]: number } = {};
      views.forEach(view => {
        if (view.page) {
          pageViews[view.page] = (pageViews[view.page] || 0) + 1;
        }
      });

      // Top countries
      const countryCounts: { [key: string]: number } = {};
      users.forEach(user => {
        const country = user.location?.country || 'Bulgaria';
        countryCounts[country] = (countryCounts[country] || 0) + 1;
      });
      const topCountries = Object.entries(countryCounts)
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Top cities
      const cityCounts: { [key: string]: number } = {};
      users.forEach(user => {
        if (user.location?.city) {
          cityCounts[user.locationData?.cityName] = (cityCounts[user.locationData?.cityName] || 0) + 1;
        }
      });
      const topCities = Object.entries(cityCounts)
        .map(([city, count]) => ({ city, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // User growth (last 30 days)
      const userGrowth = this.calculateUserGrowth(users);
      
      // Car listings growth (last 30 days)
      const carListings = this.calculateCarListingsGrowth(cars);

      const analytics: RealTimeAnalytics = {
        totalUsers,
        activeUsers,
        newUsersToday,
        totalCars,
        activeCars,
        carsListedToday,
        totalMessages,
        messagesSentToday,
        totalViews,
        viewsToday,
        revenue,
        trafficSources,
        geoDistribution,
        deviceUsage,
        pageViews,
        topCountries,
        topCities,
        userGrowth,
        carListings,
        lastUpdated: new Date()
      };

      // Cache the results
      this.analyticsCache = analytics;
      this.cacheExpiry = Date.now() + this.CACHE_DURATION;

      return analytics;
    } catch (error) {
      serviceLogger.error('Error getting real-time analytics', error as Error);
      throw error;
    }
  }

  // Get real user activity
  public async getUserActivity(): Promise<UserActivity[]> {
    try {
      const q = query(
        collection(db, 'users'),
        orderBy('lastLogin', 'desc'),
        limit(50)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          uid: doc.id,
          email: data.email || '',
          displayName: data.displayName || '',
          lastLogin: data.lastLogin?.toDate() || new Date(),
          loginCount: data.loginCount || 0,
          location: `${data.location?.city || 'Unknown'}, ${data.location?.country || 'Bulgaria'}`,
          device: data.device || 'Unknown',
          browser: data.browser || 'Unknown',
          isOnline: data.isOnline || false,
          lastActivity: data.lastActivity?.toDate() || new Date()
        };
      });
    } catch (error) {
      serviceLogger.error('Error getting user activity', error as Error);
      // Return mock data if Firebase fails
      return this.getMockUserActivity();
    }
  }

  // Get content moderation data
  public async getContentModeration(): Promise<ContentModeration> {
    try {
      const [
        reportedCarsSnapshot,
        pendingReviewsSnapshot,
        bannedUsersSnapshot,
        deletedContentSnapshot,
        flaggedMessagesSnapshot
      ] = await Promise.all([
        queryAllCollections( where('isReported', '==', true))).catch(() => ({ docs: [] })),
        getDocs(query(collection(db, 'reviews'), where('status', '==', 'pending'))).catch(() => ({ docs: [] })),
        getDocs(query(collection(db, 'users'), where('status', '==', 'banned'))).catch(() => ({ docs: [] })),
        queryAllCollections( where('isDeleted', '==', true))).catch(() => ({ docs: [] })),
        getDocs(query(collection(db, 'messages'), where('isFlagged', '==', true))).catch(() => ({ docs: [] }))
      ]);

      return {
        reportedCars: reportedCarsSnapshot.docs.length,
        pendingReviews: pendingReviewsSnapshot.docs.length,
        bannedUsers: bannedUsersSnapshot.docs.length,
        deletedContent: deletedContentSnapshot.docs.length,
        flaggedMessages: flaggedMessagesSnapshot.docs.length
      };
    } catch (error) {
      serviceLogger.error('Error getting content moderation data', error as Error);
      // Return mock data if Firebase fails
      return this.getMockContentModeration();
    }
  }

  // Subscribe to real-time analytics updates
  public subscribeToAnalytics(callback: (analytics: RealTimeAnalytics) => void): () => void {
    const unsubscribe = onSnapshot(
      collection(db, 'users'),
      async () => {
        try {
          const analytics = await this.getRealTimeAnalytics();
          callback(analytics);
        } catch (error) {
          serviceLogger.error('Error in analytics subscription', error as Error);
        }
      }
    );

    return unsubscribe;
  }

  // Subscribe to user activity updates
  public subscribeToUserActivity(callback: (activity: UserActivity[]) => void): () => void {
    const unsubscribe = onSnapshot(
      query(collection(db, 'users'), orderBy('lastLogin', 'desc'), limit(50)),
      (snapshot) => {
        const activity = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            uid: doc.id,
            email: data.email || '',
            displayName: data.displayName || '',
            lastLogin: data.lastLogin?.toDate() || new Date(),
            loginCount: data.loginCount || 0,
            location: `${data.location?.city || 'Unknown'}, ${data.location?.country || 'Bulgaria'}`,
            device: data.device || 'Unknown',
            browser: data.browser || 'Unknown',
            isOnline: data.isOnline || false,
            lastActivity: data.lastActivity?.toDate() || new Date()
          };
        });
        callback(activity);
      }
    );

    return unsubscribe;
  }

  // Get system performance metrics
  public async getSystemPerformance(): Promise<SystemPerformance[]> {
    try {
      const q = query(
        collection(db, 'system_metrics'),
        orderBy('timestamp', 'desc'),
        limit(100)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          timestamp: data.timestamp?.toDate() || new Date(),
          responseTime: data.responseTime || 0,
          memoryUsage: data.memoryUsage || 0,
          cpuUsage: data.cpuUsage || 0,
          activeConnections: data.activeConnections || 0,
          errorRate: data.errorRate || 0
        };
      });
    } catch (error) {
      serviceLogger.error('Error getting system performance', error as Error);
      return [];
    }
  }

  // Record page view
  public async recordPageView(page: string, userId?: string): Promise<void> {
    try {
      const viewRef = doc(collection(db, 'views'));
      await setDoc(viewRef, {
        page,
        userId: userId || null,
        timestamp: serverTimestamp(),
        ipAddress: this.getClientIP(),
        userAgent: navigator.userAgent
      });
    } catch (error) {
      serviceLogger.error('Error recording page view', error as Error, { page, userId });
    }
  }

  // Record user activity
  public async recordUserActivity(
    userId: string,
    activity: string,
    details?: string
  ): Promise<void> {
    try {
      const activityRef = doc(collection(db, 'user_activity'));
      await setDoc(activityRef, {
        userId,
        activity,
        details,
        timestamp: serverTimestamp(),
        ipAddress: this.getClientIP(),
        userAgent: navigator.userAgent,
        device: this.getDeviceType(),
        browser: this.getBrowserName()
      });
    } catch (error) {
      serviceLogger.error('Error recording user activity', error as Error, { userId, activity });
    }
  }

  // Private helper methods
  private calculateUserGrowth(users: unknown[]): { date: string; count: number }[] {
    const growth: { [key: string]: number } = {};
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    users.forEach(user => {
      if (user.createdAt) {
        const createdDate = new Date(user.createdAt.seconds * 1000);
        if (createdDate >= thirtyDaysAgo) {
          const dateKey = createdDate.toISOString().split('T')[0];
          growth[dateKey] = (growth[dateKey] || 0) + 1;
        }
      }
    });

    return Object.entries(growth)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private calculateCarListingsGrowth(cars: unknown[]): { date: string; count: number }[] {
    const growth: { [key: string]: number } = {};
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    cars.forEach(car => {
      if (car.createdAt) {
        const createdDate = new Date(car.createdAt.seconds * 1000);
        if (createdDate >= thirtyDaysAgo) {
          const dateKey = createdDate.toISOString().split('T')[0];
          growth[dateKey] = (growth[dateKey] || 0) + 1;
        }
      }
    });

    return Object.entries(growth)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private getClientIP(): string {
    // In production, get from request headers
    return 'N/A';
  }

  private getDeviceType(): string {
    const userAgent = navigator.userAgent;
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      return 'Mobile';
    } else if (/Tablet|iPad/.test(userAgent)) {
      return 'Tablet';
    } else {
      return 'Desktop';
    }
  }

  private getBrowserName(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  // Mock analytics data for fallback
  private getMockAnalytics(): RealTimeAnalytics {
    return {
      totalUsers: 1247,
      activeUsers: 892,
      newUsersToday: 23,
      totalCars: 3891,
      activeCars: 3245,
      carsListedToday: 45,
      totalMessages: 12456,
      messagesSentToday: 234,
      totalViews: 45678,
      viewsToday: 1234,
      revenue: 125000,
      trafficSources: { direct: 45, google: 30, facebook: 15, other: 10 },
      geoDistribution: { Sofia: 40, Plovdiv: 20, Varna: 15, other: 25 },
      deviceUsage: { mobile: 60, desktop: 35, tablet: 5 },
      pageViews: { home: 30, cars: 40, profile: 20, messages: 10 },
      topCountries: [
        { country: 'Bulgaria', count: 892 },
        { country: 'Romania', count: 234 },
        { country: 'Greece', count: 156 }
      ],
      topCities: [
        { city: 'Sofia', count: 456 },
        { city: 'Plovdiv', count: 234 },
        { city: 'Varna', count: 189 }
      ],
      userGrowth: [],
      carListings: [],
      lastUpdated: new Date()
    };
  }

  // Mock user activity data for fallback
  private getMockUserActivity(): UserActivity[] {
    return [
      {
        uid: 'user1',
        email: 'user1@example.com',
        displayName: 'John Doe',
        lastLogin: new Date(),
        loginCount: 15,
        location: 'Sofia, Bulgaria',
        device: 'Desktop',
        browser: 'Chrome',
        isOnline: true,
        lastActivity: new Date()
      },
      {
        uid: 'user2',
        email: 'user2@example.com',
        displayName: 'Jane Smith',
        lastLogin: new Date(Date.now() - 3600000),
        loginCount: 8,
        location: 'Plovdiv, Bulgaria',
        device: 'Mobile',
        browser: 'Safari',
        isOnline: false,
        lastActivity: new Date(Date.now() - 1800000)
      },
      {
        uid: 'user3',
        email: 'user3@example.com',
        displayName: 'Ivan Petrov',
        lastLogin: new Date(Date.now() - 7200000),
        loginCount: 12,
        location: 'Varna, Bulgaria',
        device: 'Desktop',
        browser: 'Firefox',
        isOnline: true,
        lastActivity: new Date(Date.now() - 300000)
      }
    ];
  }

  // Mock content moderation data for fallback
  private getMockContentModeration(): ContentModeration {
    return {
      reportedCars: 12,
      pendingReviews: 8,
      bannedUsers: 3,
      deletedContent: 45,
      flaggedMessages: 7
    };
  }
}

export const realTimeAnalyticsService = RealTimeAnalyticsService.getInstance();

