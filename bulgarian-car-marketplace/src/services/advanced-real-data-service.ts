import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { logger } from './logger-service';

// Advanced Real Data Service for 100% real data
class AdvancedRealDataService {
  private static instance: AdvancedRealDataService;

  private constructor() {}

  public static getInstance(): AdvancedRealDataService {
    if (!AdvancedRealDataService.instance) {
      AdvancedRealDataService.instance = new AdvancedRealDataService();
    }
    return AdvancedRealDataService.instance;
  }

  // Get real-time analytics with 100% real Firebase data
  public async getRealTimeAnalytics(): Promise<any> {
    try {
      logger.debug('Fetching real analytics data...');
      
      // Get all collections in parallel
      const [
        usersSnapshot,
        carsSnapshot,
        messagesSnapshot,
        viewsSnapshot,
        userActivitySnapshot
      ] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'cars')),
        getDocs(collection(db, 'messages')),
        getDocs(collection(db, 'views')),
        getDocs(collection(db, 'user_activity'))
      ]);

      const users = usersSnapshot.docs.map(doc => doc.data());
      const cars = carsSnapshot.docs.map(doc => doc.data());
      const messages = messagesSnapshot.docs.map(doc => doc.data());
      const views = viewsSnapshot.docs.map(doc => doc.data());
      const userActivity = userActivitySnapshot.docs.map(doc => doc.data());

      // Calculate real analytics
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

      const activeUsers = users.filter(user => {
        const lastLogin = user.lastLogin?.toDate ? user.lastLogin.toDate() : new Date(user.lastLogin);
        return lastLogin > yesterday;
      }).length;

      const newUsersToday = users.filter(user => {
        const createdAt = user.createdAt?.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
        return createdAt > today;
      }).length;

      const activeCars = cars.filter(car => car.isActive).length;
      const carsListedToday = cars.filter(car => {
        const createdAt = car.createdAt?.toDate ? car.createdAt.toDate() : new Date(car.createdAt);
        return createdAt > today;
      }).length;

      const messagesSentToday = messages.filter(msg => {
        const timestamp = msg.timestamp?.toDate ? msg.timestamp.toDate() : new Date(msg.timestamp);
        return timestamp > today;
      }).length;

      const viewsToday = views.filter(view => {
        const timestamp = view.timestamp?.toDate ? view.timestamp.toDate() : new Date(view.timestamp);
        return timestamp > today;
      }).length;

      // Calculate revenue (example: 5% commission on car sales)
      const totalRevenue = cars.reduce((sum, car) => {
        if (car.isSold) {
          return sum + (car.price * 0.05); // 5% commission
        }
        return sum;
      }, 0);

      // Calculate traffic sources from user activity
      const trafficSources = userActivity.reduce((sources, activity) => {
        const source = activity.trafficSource || 'direct';
        sources[source] = (sources[source] || 0) + 1;
        return sources;
      }, {} as Record<string, number>);

      // Calculate geo distribution
      const geoDistribution = users.reduce((geo, user) => {
        const city = user.location?.city || 'Unknown';
        geo[city] = (geo[city] || 0) + 1;
        return geo;
      }, {} as Record<string, number>);

      // Calculate device usage
      const deviceUsage = userActivity.reduce((devices, activity) => {
        const device = activity.device || 'Unknown';
        devices[device] = (devices[device] || 0) + 1;
        return devices;
      }, {} as Record<string, number>);

      // Calculate page views
      const pageViews = userActivity.reduce((pages, activity) => {
        const page = activity.page || 'home';
        pages[page] = (pages[page] || 0) + 1;
        return pages;
      }, {} as Record<string, number>);

      // Get top countries
      const topCountries = users.reduce((countries, user) => {
        const country = user.location?.country || 'Bulgaria';
        const existing = countries.find((c: { country: string; count: number }) => c.country === country);
        if (existing) {
          existing.count += 1;
        } else {
          countries.push({ country, count: 1 });
        }
        return countries;
      }, [] as Array<{ country: string; count: number }>).sort((a: { country: string; count: number }, b: { country: string; count: number }) => b.count - a.count);

      // Get top cities
      const topCities = users.reduce((cities, user) => {
        const city = user.location?.city || 'Unknown';
        const existing = cities.find((c: { city: string; count: number }) => c.city === city);
        if (existing) {
          existing.count += 1;
        } else {
          cities.push({ city, count: 1 });
        }
        return cities;
      }, [] as Array<{ city: string; count: number }>).sort((a: { city: string; count: number }, b: { city: string; count: number }) => b.count - a.count);

      const realAnalytics = {
        totalUsers: users.length,
        activeUsers,
        newUsersToday,
        totalCars: cars.length,
        activeCars,
        carsListedToday,
        totalMessages: messages.length,
        messagesSentToday,
        totalViews: views.length,
        viewsToday,
        revenue: totalRevenue,
        trafficSources,
        geoDistribution,
        deviceUsage,
        pageViews,
        topCountries: topCountries.slice(0, 10),
        topCities: topCities.slice(0, 10),
        userGrowth: [], // Will be calculated separately
        carListings: [], // Will be calculated separately
        lastUpdated: new Date()
      };

      logger.info('Real analytics data fetched successfully', {
        totalUsers: realAnalytics.totalUsers,
        totalCars: realAnalytics.totalCars,
        totalMessages: realAnalytics.totalMessages,
        totalViews: realAnalytics.totalViews
      });
      return realAnalytics;

    } catch (error) {
      logger.error('Error fetching real analytics', error as Error);
      throw error;
    }
  }

  // Get real user activity
  public async getRealUserActivity(): Promise<any[]> {
    try {
      logger.debug('Fetching real user activity...');
      
      const q = query(
        collection(db, 'user_activity'),
        orderBy('timestamp', 'desc'),
        limit(50)
      );
      
      const snapshot = await getDocs(q);
      const activities = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          activity: data.activity,
          details: data.details,
          timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp),
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          device: data.device,
          browser: data.browser,
          trafficSource: data.trafficSource
        };
      });

      logger.info('Real user activity fetched successfully', { count: activities.length });
      return activities;

    } catch (error) {
      logger.error('Error fetching real user activity', error as Error);
      throw error;
    }
  }

  // Get real content moderation data
  public async getRealContentModeration(): Promise<any> {
    try {
      logger.debug('Fetching real content moderation...');
      
      const [
        reportedCarsSnapshot,
        pendingReviewsSnapshot,
        bannedUsersSnapshot,
        deletedContentSnapshot,
        flaggedMessagesSnapshot
      ] = await Promise.all([
        getDocs(query(collection(db, 'cars'), where('isReported', '==', true))),
        getDocs(query(collection(db, 'reviews'), where('status', '==', 'pending'))),
        getDocs(query(collection(db, 'users'), where('status', '==', 'banned'))),
        getDocs(query(collection(db, 'cars'), where('isDeleted', '==', true))),
        getDocs(query(collection(db, 'messages'), where('isFlagged', '==', true)))
      ]);

      const moderation = {
        reportedCars: reportedCarsSnapshot.docs.length,
        pendingReviews: pendingReviewsSnapshot.docs.length,
        bannedUsers: bannedUsersSnapshot.docs.length,
        deletedContent: deletedContentSnapshot.docs.length,
        flaggedMessages: flaggedMessagesSnapshot.docs.length
      };

      logger.info('Real content moderation fetched successfully', moderation);
      return moderation;

    } catch (error) {
      logger.error('Error fetching real content moderation', error as Error);
      throw error;
    }
  }

  // Get real users list
  public async getRealUsers(): Promise<any[]> {
    try {
      logger.debug('Fetching real users...');
      
      const snapshot = await getDocs(collection(db, 'users'));
      const users = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          email: data.email,
          displayName: data.displayName,
          phoneNumber: data.phoneNumber,
          location: data.location,
          isOnline: data.isOnline,
          lastLogin: data.lastLogin?.toDate ? data.lastLogin.toDate() : new Date(data.lastLogin),
          loginCount: data.loginCount,
          device: data.device,
          browser: data.browser,
          lastActivity: data.lastActivity?.toDate ? data.lastActivity.toDate() : new Date(data.lastActivity),
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
          isVerified: data.isVerified,
          profile: data.profile
        };
      });

      logger.info('Real users fetched successfully', { count: users.length });
      return users;

    } catch (error) {
      logger.error('Error fetching real users', error as Error);
      throw error;
    }
  }

  // Get real cars list
  public async getRealCars(): Promise<any[]> {
    try {
      logger.debug('Fetching real cars...');
      
      const snapshot = await getDocs(collection(db, 'cars'));
      const cars = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          make: data.make,
          model: data.model,
          year: data.year,
          price: data.price,
          currency: data.currency,
          mileage: data.mileage,
          fuelType: data.fuelType,
          transmission: data.transmission,
          condition: data.condition,
          location: data.location,
          sellerId: data.sellerId,
          isActive: data.isActive,
          views: data.views,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
          images: data.images,
          features: data.features,
          description: data.description
        };
      });

      logger.info('Real cars fetched successfully', { count: cars.length });
      return cars;

    } catch (error) {
      logger.error('Error fetching real cars', error as Error);
      throw error;
    }
  }

  // Get real messages list
  public async getRealMessages(): Promise<any[]> {
    try {
      logger.debug('Fetching real messages...');
      
      const snapshot = await getDocs(collection(db, 'messages'));
      const messages = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          senderId: data.senderId,
          receiverId: data.receiverId,
          carId: data.carId,
          content: data.content,
          timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp),
          isRead: data.isRead,
          type: data.type
        };
      });

      logger.info('Real messages fetched successfully', { count: messages.length });
      return messages;

    } catch (error) {
      logger.error('Error fetching real messages', error as Error);
      throw error;
    }
  }

  // Subscribe to real-time updates
  public subscribeToRealTimeUpdates(callback: (data: any) => void): () => void {
    const unsubscribe = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const users = snapshot.docs.map(doc => doc.data());
        callback({ users, timestamp: new Date() });
      }
    );

    return unsubscribe;
  }

  // Get real-time statistics with live updates
  public async getLiveStatistics(): Promise<any> {
    try {
      logger.debug('Fetching live statistics...');
      
      const [usersSnapshot, carsSnapshot, messagesSnapshot] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'cars')),
        getDocs(collection(db, 'messages'))
      ]);

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thisMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const users = usersSnapshot.docs.map(doc => doc.data());
      const cars = carsSnapshot.docs.map(doc => doc.data());
      const messages = messagesSnapshot.docs.map(doc => doc.data());

      // Calculate live statistics
      const liveStats = {
        totalUsers: users.length,
        newUsersToday: users.filter(user => {
          const createdAt = user.createdAt?.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
          return createdAt > today;
        }).length,
        newUsersThisWeek: users.filter(user => {
          const createdAt = user.createdAt?.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
          return createdAt > thisWeek;
        }).length,
        newUsersThisMonth: users.filter(user => {
          const createdAt = user.createdAt?.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
          return createdAt > thisMonth;
        }).length,
        totalCars: cars.length,
        activeCars: cars.filter(car => car.isActive).length,
        newCarsToday: cars.filter(car => {
          const createdAt = car.createdAt?.toDate ? car.createdAt.toDate() : new Date(car.createdAt);
          return createdAt > today;
        }).length,
        totalMessages: messages.length,
        messagesToday: messages.filter(msg => {
          const timestamp = msg.timestamp?.toDate ? msg.timestamp.toDate() : new Date(msg.timestamp);
          return timestamp > today;
        }).length,
        lastUpdated: new Date()
      };

      logger.info('Live statistics fetched successfully', liveStats);
      return liveStats;

    } catch (error) {
      logger.error('Error fetching live statistics', error as Error);
      throw error;
    }
  }

  // Get user engagement metrics
  public async getUserEngagementMetrics(): Promise<any> {
    try {
      logger.debug('Fetching user engagement metrics...');
      
      const [usersSnapshot, userActivitySnapshot] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'user_activity'))
      ]);

      const users = usersSnapshot.docs.map(doc => doc.data());
      const activities = userActivitySnapshot.docs.map(doc => doc.data());

      // Calculate engagement metrics
      const engagementMetrics = {
        averageLoginCount: users.reduce((sum, user) => sum + (user.loginCount || 0), 0) / users.length || 0,
        mostActiveUsers: users
          .sort((a, b) => (b.loginCount || 0) - (a.loginCount || 0))
          .slice(0, 10)
          .map(user => ({
            name: user.displayName,
            email: user.email,
            loginCount: user.loginCount || 0,
            lastLogin: user.lastLogin?.toDate ? user.lastLogin.toDate() : new Date(user.lastLogin)
          })),
        activityTypes: activities.reduce((types, activity) => {
          const type = activity.activity || 'unknown';
          types[type] = (types[type] || 0) + 1;
          return types;
        }, {} as Record<string, number>),
        deviceDistribution: activities.reduce((devices, activity) => {
          const device = activity.device || 'Unknown';
          devices[device] = (devices[device] || 0) + 1;
          return devices;
        }, {} as Record<string, number>),
        browserDistribution: activities.reduce((browsers, activity) => {
          const browser = activity.browser || 'Unknown';
          browsers[browser] = (browsers[browser] || 0) + 1;
          return browsers;
        }, {} as Record<string, number>)
      };

      logger.info('User engagement metrics fetched successfully', {
        averageLoginCount: engagementMetrics.averageLoginCount,
        mostActiveUsersCount: engagementMetrics.mostActiveUsers.length
      });
      return engagementMetrics;

    } catch (error) {
      logger.error('Error fetching user engagement metrics', error as Error);
      throw error;
    }
  }

  // Get revenue analytics
  public async getRevenueAnalytics(): Promise<any> {
    try {
      logger.debug('Fetching revenue analytics...');
      
      const carsSnapshot = await getDocs(collection(db, 'cars'));
      const cars = carsSnapshot.docs.map(doc => doc.data());

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thisMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Calculate revenue metrics
      const revenueAnalytics = {
        totalRevenue: cars.reduce((sum, car) => {
          if (car.isSold) {
            return sum + (car.price * 0.05); // 5% commission
          }
          return sum;
        }, 0),
        revenueToday: cars.filter(car => {
          const soldAt = car.soldAt?.toDate ? car.soldAt.toDate() : new Date(car.soldAt);
          return car.isSold && soldAt > today;
        }).reduce((sum, car) => sum + (car.price * 0.05), 0),
        revenueThisWeek: cars.filter(car => {
          const soldAt = car.soldAt?.toDate ? car.soldAt.toDate() : new Date(car.soldAt);
          return car.isSold && soldAt > thisWeek;
        }).reduce((sum, car) => sum + (car.price * 0.05), 0),
        revenueThisMonth: cars.filter(car => {
          const soldAt = car.soldAt?.toDate ? car.soldAt.toDate() : new Date(car.soldAt);
          return car.isSold && soldAt > thisMonth;
        }).reduce((sum, car) => sum + (car.price * 0.05), 0),
        averageCarPrice: cars.reduce((sum, car) => sum + car.price, 0) / cars.length || 0,
        totalCarsSold: cars.filter(car => car.isSold).length,
        conversionRate: cars.length > 0 ? (cars.filter(car => car.isSold).length / cars.length) * 100 : 0
      };

      logger.info('Revenue analytics fetched successfully', {
        totalRevenue: revenueAnalytics.totalRevenue,
        totalCarsSold: revenueAnalytics.totalCarsSold
      });
      return revenueAnalytics;

    } catch (error) {
      logger.error('Error fetching revenue analytics', error as Error);
      throw error;
    }
  }
}

export const advancedRealDataService = AdvancedRealDataService.getInstance();
