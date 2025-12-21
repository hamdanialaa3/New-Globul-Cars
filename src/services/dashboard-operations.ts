// dashboard-operations.ts
// Business logic operations for dashboard service

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { serviceLogger } from './logger-service';
import { queryAllCollections } from './search/multi-collection-helper';

import {
  DashboardStats,
  DashboardCar,
  DashboardMessage,
  DashboardNotification,
  DashboardUpdateCallbacks,
  PreflightCheckResult
} from './dashboard-types';
import {
  DEFAULT_DASHBOARD_STATS,
  COLLECTIONS,
  QUERY_LIMITS,
  DEFAULT_CAR_DATA,
  DEFAULT_MESSAGE_DATA,
  DEFAULT_NOTIFICATION_DATA,
  GRACEFUL_ERROR_CODES
} from './dashboard-data';

// Stats operations
export class StatsOperations {
  // Calculate dashboard stats from cars data
  static calculateStatsFromCars(cars: DashboardCar[]): DashboardStats {
    const totalListings = cars.length;
    const activeListings = cars.filter(car => car.status === 'active').length;
    const soldListings = cars.filter(car => car.status === 'sold').length;
    const pendingListings = cars.filter(car => car.status === 'pending').length;

    const totalViews = cars.reduce((sum, car) => sum + car.views, 0);
    const potentialSales = cars
      .filter(car => car.status === 'active')
      .reduce((sum, car) => sum + car.price, 0);

    // Get weekly stats (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyCars = cars.filter(car => car.createdAt >= oneWeekAgo);
    const weeklyViews = weeklyCars.reduce((sum, car) => sum + car.views, 0);

    return {
      totalListings,
      activeListings,
      soldListings,
      pendingListings,
      totalViews,
      potentialSales,
      weeklyViews
    };
  }

  // Get comprehensive dashboard stats
  static async getDashboardStats(userId: string): Promise<DashboardStats> {
    try {
      // Get user's cars - ALL COLLECTIONS
      const cars = await queryAllCollections(
        where('sellerId', '==', userId)
      );

      // Calculate stats
      const totalListings = cars.length;
      const activeListings = cars.filter(car => car.status === 'active').length;
      const soldListings = cars.filter(car => car.status === 'sold').length;
      const pendingListings = cars.filter(car => car.status === 'draft').length;

      const totalViews = cars.reduce((sum, car) => sum + (car.views || 0), 0);
      const potentialSales = cars
        .filter(car => car.status === 'active')
        .reduce((sum, car) => sum + car.price, 0);

      // Get weekly stats (last 7 days)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const weeklyCars = cars.filter(car =>
        car.createdAt && car.createdAt >= oneWeekAgo
      );

      const weeklyViews = weeklyCars.reduce((sum, car) => sum + (car.views || 0), 0);

      return {
        totalListings,
        activeListings,
        soldListings,
        pendingListings,
        totalViews,
        potentialSales,
        weeklyViews
      };
    } catch (error) {
      serviceLogger.error('[StatsOperations] Error fetching dashboard stats', error as Error, { userId });
      throw error;
    }
  }
}

// Cars operations
export class CarsOperations {
  // Get recent cars for dashboard
  static async getRecentCars(userId: string, limitCount: number = QUERY_LIMITS.RECENT_CARS): Promise<DashboardCar[]> {
    try {
      // Get user's cars - ALL COLLECTIONS
      const cars = await queryAllCollections(
        where('sellerId', '==', userId),
        orderBy('updatedAt', 'desc'),
        limit(limitCount)
      ) as DashboardCar[];

      return cars.map(car => ({
        id: car.id,
        title: car.title || `${car.make} ${car.model}`,
        make: car.make || '',
        model: car.model || '',
        year: car.year || 0,
        price: car.price || 0,
        status: car.status || 'draft',
        views: car.views || 0,
        inquiries: car.inquiries || 0,
        createdAt: car.createdAt || new Date(),
        updatedAt: car.updatedAt || new Date(),
        imageUrl: car.imageUrl
      }));
    } catch (error) {
      const code = (error as { code?: string })?.code;
      if (code === GRACEFUL_ERROR_CODES.PERMISSION_DENIED) {
        serviceLogger.warn('[CarsOperations] Permission denied for recent cars - check Firestore rules');
        return [];
      }
      if (code === GRACEFUL_ERROR_CODES.FAILED_PRECONDITION) {
        serviceLogger.warn('[CarsOperations] Recent cars index building in progress');
        return [];
      }
      serviceLogger.error('[CarsOperations] Error fetching recent cars', error as Error, { userId });
      return [];
    }
  }
}

// Messages operations
export class MessagesOperations {
  // Get recent messages for dashboard
  static async getRecentMessages(userId: string, limitCount: number = QUERY_LIMITS.RECENT_MESSAGES): Promise<DashboardMessage[]> {
    try {
      const messagesQuery = query(
        collection(db, COLLECTIONS.MESSAGES),
        where('receiverId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const messagesSnapshot = await getDocs(messagesQuery);

      const messages = await Promise.all(
        messagesSnapshot.docs.map(async (messageDoc) => {
          const data = messageDoc.data();

          // Get sender info
          const senderRef = doc(db, COLLECTIONS.USERS, data.senderId);
          const senderDoc = await getDoc(senderRef);
          const senderData = senderDoc.data();

          // Get car info
          const carRef = doc(db, COLLECTIONS.CARS, data.carId);
          const carDoc = await getDoc(carRef);
          const carData = carDoc.data();

          return {
            id: messageDoc.id,
            senderId: data.senderId,
            senderName: senderData?.displayName || senderData?.email || 'Unknown',
            carId: data.carId,
            carTitle: carData?.title || `${carData?.make} ${carData?.model}` || 'Unknown Car',
            message: data.text || '',
            timestamp: data.timestamp?.toDate() || new Date(),
            isRead: data.isRead || false
          };
        })
      );

      return messages;
    } catch (error) {
      const code = (error as { code?: string })?.code;
      if (code === GRACEFUL_ERROR_CODES.PERMISSION_DENIED) {
        serviceLogger.warn('[MessagesOperations] Permission denied for recent messages - check Firestore rules');
        return [];
      }
      if (code === GRACEFUL_ERROR_CODES.FAILED_PRECONDITION) {
        serviceLogger.warn('[MessagesOperations] Recent messages index building');
        return [];
      }
      serviceLogger.error('[MessagesOperations] Error fetching recent messages', error as Error, { userId });
      return [];
    }
  }

  // Mark message as read
  static async markMessageAsRead(messageId: string): Promise<void> {
    try {
      const messageRef = doc(db, COLLECTIONS.MESSAGES, messageId);
      await updateDoc(messageRef, { isRead: true });
    } catch (error) {
      serviceLogger.error('[MessagesOperations] Error marking message as read', error as Error, { messageId });
      throw error;
    }
  }
}

// Notifications operations
export class NotificationsOperations {
  // Get recent notifications for dashboard
  static async getNotifications(userId: string, limitCount: number = QUERY_LIMITS.RECENT_NOTIFICATIONS): Promise<DashboardNotification[]> {
    try {
      const notificationsQuery = query(
        collection(db, COLLECTIONS.NOTIFICATIONS),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const notificationsSnapshot = await getDocs(notificationsQuery);

      return notificationsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          type: data.type || 'system',
          title: data.title || 'Notification',
          message: data.message || '',
          timestamp: data.timestamp?.toDate() || new Date(),
          isRead: data.isRead || false,
          carId: data.carId || undefined
        };
      });
    } catch (error) {
      const code = (error as { code?: string })?.code;
      if (code === GRACEFUL_ERROR_CODES.PERMISSION_DENIED) {
        serviceLogger.warn('[NotificationsOperations] Permission denied for notifications - check Firestore rules');
        return [];
      }
      if (code === GRACEFUL_ERROR_CODES.FAILED_PRECONDITION) {
        serviceLogger.warn('[NotificationsOperations] Notifications index building');
        return [];
      }
      serviceLogger.error('[NotificationsOperations] Error fetching notifications', error as Error, { userId });
      return [];
    }
  }

  // Mark notification as read
  static async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, COLLECTIONS.NOTIFICATIONS, notificationId);
      await updateDoc(notificationRef, { isRead: true });
    } catch (error) {
      serviceLogger.error('[NotificationsOperations] Error marking notification as read', error as Error, { notificationId });
      throw error;
    }
  }
}

// Real-time operations
export class RealtimeOperations {
  private static unsubscribeFunctions: Unsubscribe[] = [];

  // Preflight check for real-time listeners
  static async preflightCheck(userId: string): Promise<PreflightCheckResult> {
    try {
      const messagesQueryRef = query(
        collection(db, COLLECTIONS.MESSAGES),
        where('receiverId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(QUERY_LIMITS.RECENT_MESSAGES)
      );
      const notificationsQueryRef = query(
        collection(db, COLLECTIONS.NOTIFICATIONS),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(QUERY_LIMITS.RECENT_NOTIFICATIONS)
      );

      await Promise.all([
        getDocs(messagesQueryRef),
        getDocs(notificationsQueryRef)
      ]);
      return { ready: true };
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      const code = firebaseError?.code;
      if (code === GRACEFUL_ERROR_CODES.FAILED_PRECONDITION) {
        serviceLogger.warn('[RealtimeOperations] Firestore indexes still building - retrying listener attachment');
        return { ready: false, error: 'Indexes building' };
      }
      if (code === GRACEFUL_ERROR_CODES.PERMISSION_DENIED) {
        serviceLogger.warn('[RealtimeOperations] Permission denied during preflight - check rules');
        return { ready: false, error: 'Permission denied' };
      }
      serviceLogger.error('[RealtimeOperations] Unexpected preflight error', err as Error);
      return { ready: false, error: 'Unexpected error' };
    }
  }

  // Subscribe to dashboard updates with polling for cars
  static subscribeToDashboardUpdates(
    userId: string,
    callbacks: DashboardUpdateCallbacks
  ): () => void {
    const { onStatsUpdate, onCarsUpdate, onMessagesUpdate, onNotificationsUpdate } = callbacks;

    // Note: Multi-collection queries don't support onSnapshot, so we'll poll for cars
    // and use real-time listeners only for messages/notifications
    const messagesQueryRef = query(
      collection(db, COLLECTIONS.MESSAGES),
      where('receiverId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(QUERY_LIMITS.RECENT_MESSAGES)
    );
    const notificationsQueryRef = query(
      collection(db, COLLECTIONS.NOTIFICATIONS),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(QUERY_LIMITS.RECENT_NOTIFICATIONS)
    );

    let cancelled = false;
    let carsPollingInterval: NodeJS.Timeout | null = null;

    const attachListeners = () => {
      if (cancelled) return;

      // Poll cars data every 10 seconds (can't use onSnapshot with multi-collection)
      const pollCars = async () => {
        try {
          const cars = await CarsOperations.getRecentCars(userId, QUERY_LIMITS.RECENT_CARS);
          onCarsUpdate(cars);
          const stats = StatsOperations.calculateStatsFromCars(cars);
          onStatsUpdate(stats);
        } catch (error) {
          serviceLogger.error('[RealtimeOperations] Error polling cars', error as Error);
        }
      };
      pollCars(); // Initial fetch
      carsPollingInterval = setInterval(pollCars, 10000);

      const messagesUnsub = onSnapshot(messagesQueryRef, async (snapshot) => {
        const messages = await Promise.all(
          snapshot.docs.map(async (messageDoc) => {
            const data = messageDoc.data();
            const senderRef = doc(db, COLLECTIONS.USERS, data.senderId);
            const senderDoc = await getDoc(senderRef);
            const senderData = senderDoc.data();
            const carRef = doc(db, COLLECTIONS.CARS, data.carId);
            const carDoc = await getDoc(carRef);
            const carData = carDoc.data();
            return {
              id: messageDoc.id,
              senderId: data.senderId,
              senderName: senderData?.displayName || senderData?.email || 'Unknown',
              carId: data.carId,
              carTitle: carData?.title || `${carData?.make} ${carData?.model}` || 'Unknown Car',
              message: data.text || '',
              timestamp: data.timestamp?.toDate() || new Date(),
              isRead: data.isRead || false
            };
          })
        );
        onMessagesUpdate(messages);
      }, (err) => {
        serviceLogger.warn('[RealtimeOperations] Messages snapshot error', { error: err });
      });

      const notificationsUnsub = onSnapshot(notificationsQueryRef, (snapshot) => {
        const notifications = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            type: data.type || 'system',
            title: data.title || 'Notification',
            message: data.message || '',
            timestamp: data.timestamp?.toDate() || new Date(),
            isRead: data.isRead || false,
            carId: data.carId || undefined
          };
        });
        onNotificationsUpdate(notifications);
      }, (err) => {
        serviceLogger.warn('[RealtimeOperations] Notifications snapshot error', { error: err });
      });

      this.unsubscribeFunctions = [messagesUnsub, notificationsUnsub];
    };

    // Retry loop with exponential-ish backoff
    let attempt = 0;
    const tryAttach = async () => {
      if (cancelled) return;
      const result = await this.preflightCheck(userId);
      if (result.ready) {
        attachListeners();
      } else {
        attempt++;
        const delay = Math.min(5000, 1000 + attempt * 1000);
        setTimeout(tryAttach, delay);
      }
    };
    tryAttach();

    return () => {
      cancelled = true;
      if (carsPollingInterval) clearInterval(carsPollingInterval);
      this.unsubscribeFunctions.forEach(u => u && u());
      this.unsubscribeFunctions = [];
    };
  }
}