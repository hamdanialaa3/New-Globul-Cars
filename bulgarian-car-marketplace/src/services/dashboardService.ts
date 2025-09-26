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
  Timestamp,
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
      console.error('Error fetching dashboard stats:', error);
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
      console.error('Error fetching recent cars:', error);
      throw error;
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
      console.error('Error fetching recent messages:', error);
      throw error;
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
      console.error('Error fetching notifications:', error);
      throw error;
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
    // Subscribe to cars changes
    const carsQuery = query(
      collection(db, 'cars'),
      where('sellerId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    
    const carsUnsubscribe = onSnapshot(carsQuery, async (snapshot) => {
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
      
      // Recalculate stats
      const stats = await this.calculateStatsFromCars(cars);
      onStatsUpdate(stats);
    });

    // Subscribe to messages changes
    const messagesQuery = query(
      collection(db, 'messages'),
      where('receiverId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(5)
    );
    
    const messagesUnsubscribe = onSnapshot(messagesQuery, async (snapshot) => {
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
    });

    // Subscribe to notifications changes
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(5)
    );
    
    const notificationsUnsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
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
    });

    // Store unsubscribe functions
    this.unsubscribeFunctions = [carsUnsubscribe, messagesUnsubscribe, notificationsUnsubscribe];

    // Return cleanup function
    return () => {
      this.unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
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
      console.error('Error marking message as read:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, { isRead: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }
}

export const dashboardService = new DashboardService();
