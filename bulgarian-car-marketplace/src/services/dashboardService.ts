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
import { CarListing } from '../types/CarListing';

export interface DashboardStats {
  totalListings: number;
  activeListings: number;
  soldListings: number;
  pendingListings: number;
  totalViews: number;
  potentialSales: number;
  weeklyViews: number;
}

export interface DashboardMessage {
  id: string;
  senderId: string;
  senderName: string;
  carId: string;
  carTitle: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
}

export interface DashboardNotification {
  id: string;
  type: 'listing_approved' | 'new_inquiry' | 'price_update' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  carId?: string;
}

export interface DashboardCar {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  price: number;
  status: 'active' | 'pending' | 'sold' | 'draft';
  views: number;
  inquiries: number;
  createdAt: Date;
  updatedAt: Date;
  imageUrl?: string;
}

class DashboardService {
  private unsubscribeFunctions: Unsubscribe[] = [];

  // Get dashboard statistics
  async getDashboardStats(userId: string): Promise<DashboardStats> {
    try {
      // Get user's cars
      const carsQuery = query(
        collection(db, 'cars'),
        where('sellerId', '==', userId)
      );
      const carsSnapshot = await getDocs(carsQuery);
      
      const cars = carsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CarListing[];

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
      console.error('[SERVICE] Error fetching dashboard stats:', error);
      throw error;
    }
  }

  // Get recent cars
  async getRecentCars(userId: string, limitCount: number = 5): Promise<DashboardCar[]> {
    try {
      const carsQuery = query(
        collection(db, 'cars'),
        where('sellerId', '==', userId),
        orderBy('updatedAt', 'desc'),
        limit(limitCount)
      );
      
      const carsSnapshot = await getDocs(carsQuery);
      
      return carsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || `${data.make} ${data.model}`,
          make: data.make || '',
          model: data.model || '',
          year: data.year || 0,
          price: data.price || 0,
          status: data.status || 'draft',
          views: data.views || 0,
          inquiries: data.inquiries || 0,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          imageUrl: data.images?.[0] || undefined
        };
      });
    } catch (error) {
      const code = (error as { code?: string })?.code;
      if (code === 'permission-denied') {
        console.warn('[DashboardService] permission denied for recent cars – returning empty list (check Firestore rules)');
        return [];
      }
      if (code === 'failed-precondition') {
        console.warn('[DashboardService] recent cars index building in progress – returning empty list temporarily');
        return [];
      }
      console.error('[SERVICE] Error fetching recent cars:', error);
      return [];
    }
  }

  // Get recent messages
  async getRecentMessages(userId: string, limitCount: number = 5): Promise<DashboardMessage[]> {
    try {
      const messagesQuery = query(
        collection(db, 'messages'),
        where('receiverId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const messagesSnapshot = await getDocs(messagesQuery);
      
      const messages = await Promise.all(
        messagesSnapshot.docs.map(async (messageDoc) => {
          const data = messageDoc.data();
          
          // Get sender info
          const senderRef = doc(db, 'users', data.senderId);
          const senderDoc = await getDoc(senderRef);
          const senderData = senderDoc.data();
          
          // Get car info
          const carRef = doc(db, 'cars', data.carId);
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
      if (code === 'permission-denied') {
        console.warn('[DashboardService] permission denied for recent messages – returning empty list (check Firestore rules)');
        return [];
      }
      if (code === 'failed-precondition') {
        console.warn('[DashboardService] recent messages index building – returning empty list temporarily');
        return [];
      }
      console.error('[SERVICE] Error fetching recent messages:', error);
      return [];
    }
  }

  // Get notifications
  async getNotifications(userId: string, limitCount: number = 5): Promise<DashboardNotification[]> {
    try {
      const notificationsQuery = query(
        collection(db, 'notifications'),
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
      if (code === 'permission-denied') {
        console.warn('[DashboardService] permission denied for notifications – returning empty list (check Firestore rules)');
        return [];
      }
      if (code === 'failed-precondition') {
        console.warn('[DashboardService] notifications index building – returning empty list temporarily');
        return [];
      }
      console.error('[SERVICE] Error fetching notifications:', error);
      return [];
    }
  }

  // Real-time updates
  subscribeToDashboardUpdates(
    userId: string,
    onStatsUpdate: (stats: DashboardStats) => void,
    onCarsUpdate: (cars: DashboardCar[]) => void,
    onMessagesUpdate: (messages: DashboardMessage[]) => void,
    onNotificationsUpdate: (notifications: DashboardNotification[]) => void
  ): () => void {
    // Preflight: wait for indexes to be ready before attaching realtime listeners (reduces console spam)
    const carsQueryRef = query(
      collection(db, 'cars'),
      where('sellerId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    const messagesQueryRef = query(
      collection(db, 'messages'),
      where('receiverId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(5)
    );
    const notificationsQueryRef = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(5)
    );

    const preflightCheck = async () => {
      try {
        await Promise.all([
          getDocs(carsQueryRef),
          getDocs(messagesQueryRef),
          getDocs(notificationsQueryRef)
        ]);
        return true;
      } catch (err: any) {
        const code = err?.code;
        if (code === 'failed-precondition') {
          console.warn('[DashboardService] Firestore indexes still building – retrying listener attachment shortly');
          return false;
        }
        if (code === 'permission-denied') {
          console.warn('[DashboardService] permission denied during preflight – listeners will retry (check rules)');
          return false;
        }
        console.error('[SERVICE] [DashboardService] unexpected preflight error, will retry:', err);
        return false;
      }
    };

    let cancelled = false;
    const attachListeners = () => {
      if (cancelled) return;
      const carsUnsub = onSnapshot(carsQueryRef, async (snapshot) => {
        const cars = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || `${data.make} ${data.model}`,
            make: data.make || '',
            model: data.model || '',
            year: data.year || 0,
            price: data.price || 0,
            status: data.status || 'draft',
            views: data.views || 0,
            inquiries: data.inquiries || 0,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            imageUrl: data.images?.[0] || undefined
          };
        });
        onCarsUpdate(cars);
        const stats = await this.calculateStatsFromCars(cars);
        onStatsUpdate(stats);
      }, (err) => {
        console.warn('[DashboardService] cars snapshot error:', err);
      });

      const messagesUnsub = onSnapshot(messagesQueryRef, async (snapshot) => {
        const messages = await Promise.all(
          snapshot.docs.map(async (messageDoc) => {
            const data = messageDoc.data();
            const senderRef = doc(db, 'users', data.senderId);
            const senderDoc = await getDoc(senderRef);
            const senderData = senderDoc.data();
            const carRef = doc(db, 'cars', data.carId);
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
        console.warn('[DashboardService] messages snapshot error:', err);
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
        console.warn('[DashboardService] notifications snapshot error:', err);
      });

      this.unsubscribeFunctions = [carsUnsub, messagesUnsub, notificationsUnsub];
    };

    // Retry loop with exponential-ish backoff (fixed step + cap)
    let attempt = 0;
    const tryAttach = async () => {
      if (cancelled) return;
      const ready = await preflightCheck();
      if (ready) {
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
      this.unsubscribeFunctions.forEach(u => u && u());
      this.unsubscribeFunctions = [];
    };
  }

  private async calculateStatsFromCars(cars: DashboardCar[]): Promise<DashboardStats> {
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

  // Mark message as read
  async markMessageAsRead(messageId: string): Promise<void> {
    try {
      const messageRef = doc(db, 'messages', messageId);
      await updateDoc(messageRef, { isRead: true });
    } catch (error) {
      console.error('[SERVICE] Error marking message as read:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, { isRead: true });
    } catch (error) {
      console.error('[SERVICE] Error marking notification as read:', error);
      throw error;
    }
  }
}

export const dashboardService = new DashboardService();
