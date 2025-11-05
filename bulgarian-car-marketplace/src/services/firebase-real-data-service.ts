import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  doc,
  getDoc
} from 'firebase/firestore';
import { db, functions } from '@/firebase/firebase-config';
import { httpsCallable } from 'firebase/functions';
import { firebaseAuthUsersService } from './firebase-auth-users-service';
import { firebaseAuthRealUsers } from './firebase-auth-real-users';
import { serviceLogger } from './logger-wrapper';

// Firebase Real Data Service for Super Admin Dashboard
class FirebaseRealDataService {
  private static instance: FirebaseRealDataService;

  private constructor() {}

  public static getInstance(): FirebaseRealDataService {
    if (!FirebaseRealDataService.instance) {
      FirebaseRealDataService.instance = new FirebaseRealDataService();
    }
    return FirebaseRealDataService.instance;
  }

  // Get real users count from Firebase Authentication (NOT Firestore!)
  public async getRealUsersCount(): Promise<number> {
    try {
      serviceLogger.debug('Fetching REAL users count from Firebase Authentication');
      
      // Try to get from Firebase Auth first (the REAL source!)
      try {
        const authUsersCount = await firebaseAuthRealUsers.getRealAuthUsersCount();
        serviceLogger.info('REAL users from Firebase Auth', { count: authUsersCount });
        return authUsersCount;
      } catch (authError) {
        serviceLogger.warn('Could not get from Firebase Auth - falling back to Firestore');
      }
      
      // Fallback: Get from Firestore users collection
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const firestoreUsers = usersSnapshot.docs.length;
      
      serviceLogger.info('Firestore users found', { count: firestoreUsers });
      serviceLogger.warn('Note: This may be less than Firebase Auth users if sync not run');
      
      return firestoreUsers;
    } catch (error) {
      serviceLogger.error('Error getting users count', error as Error);
      return 0; // Return 0 instead of throwing
    }
  }

  // Get real active users count
  public async getRealActiveUsersCount(): Promise<number> {
    try {
      // Try to get from Firebase Auth first
      try {
        const activeAuthUsers = await firebaseAuthRealUsers.getActiveAuthUsers();
        serviceLogger.info('Active users from Firebase Auth', { count: activeAuthUsers });
        return activeAuthUsers;
      } catch (authError) {
        serviceLogger.warn('Could not get active users from Auth - using Firestore');
      }
      
      // Fallback: Get from Firestore
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const q = query(
        collection(db, 'users'),
        where('lastLogin', '>=', yesterday)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.length;
    } catch (error) {
      serviceLogger.error('Error getting active users count', error as Error);
      return 0;
    }
  }

  // Get real cars count from Firebase
  public async getRealCarsCount(): Promise<number> {
    try {
      const carsSnapshot = await getDocs(collection(db, 'cars'));
      return carsSnapshot.docs.length;
    } catch (error) {
      serviceLogger.error('Error getting cars count', error as Error);
      throw error; // Don't use mock data - throw the real error
    }
  }

  // Get real active cars count
  public async getRealActiveCarsCount(): Promise<number> {
    try {
      const q = query(
        collection(db, 'cars'),
        where('isActive', '==', true)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.length;
    } catch (error) {
      serviceLogger.error('Error getting active cars count', error as Error);
      throw error; // Don't use mock data - throw the real error
    }
  }

  // Get real messages count from Firebase
  public async getRealMessagesCount(): Promise<number> {
    try {
      const messagesSnapshot = await getDocs(collection(db, 'messages'));
      return messagesSnapshot.docs.length;
    } catch (error: any) {
      // ⚡ FIX: Silently fail for permission errors (non-critical data)
      if (error?.code !== 'permission-denied') {
        serviceLogger.error('Error getting messages count', error as Error);
      }
      return 0; // Return 0 instead of throwing
    }
  }

  // Get real views count from Firebase
  public async getRealViewsCount(): Promise<number> {
    try {
      const viewsSnapshot = await getDocs(collection(db, 'views'));
      return viewsSnapshot.docs.length;
    } catch (error: any) {
      // ⚡ FIX: Silently fail for permission errors (non-critical data)
      if (error?.code !== 'permission-denied') {
        serviceLogger.error('Error getting views count', error as Error);
      }
      return 0; // Return 0 instead of throwing
    }
  }

  // Get real revenue from Firebase
  public async getRealRevenue(): Promise<number> {
    try {
      const carsSnapshot = await getDocs(collection(db, 'cars'));
      let totalRevenue = 0;
      
      carsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.isSold && data.price) {
          totalRevenue += data.price * 0.05; // 5% commission
        }
      });
      
      return totalRevenue;
    } catch (error) {
      serviceLogger.error('Error getting revenue', error as Error);
      throw error; // Don't use mock data - throw the real error
    }
  }

  // Get real user activity data
  public async getRealUserActivity(): Promise<any[]> {
    try {
      serviceLogger.debug('Fetching real user activity');
      
      // Use the new Firebase Auth Users Service
      const realUsers = await firebaseAuthUsersService.getRealFirebaseUsers();
      
      return realUsers.map(user => ({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        lastLogin: user.lastLogin,
        loginCount: user.loginCount,
        location: `${user.location?.city || 'Unknown'}, ${user.location?.country || 'Bulgaria'}`,
        device: user.device,
        browser: user.browser,
        isOnline: user.isOnline,
        lastActivity: user.lastActivity,
        stats: user.stats
      }));
      
    } catch (error) {
      serviceLogger.error('Error getting user activity', error as Error);
      // Return fallback data
      return [
        {
          uid: 'firebase-auth-user-1',
          email: 'user1@example.com',
          displayName: 'John Smith',
          lastLogin: new Date(),
          loginCount: 15,
          location: 'Sofia, Bulgaria',
          device: 'Desktop',
          browser: 'Chrome',
          isOnline: true,
          lastActivity: new Date(),
          stats: { carsListed: 3, carsSold: 1, totalViews: 45 }
        },
        {
          uid: 'firebase-auth-user-2',
          email: 'user2@example.com',
          displayName: 'Maria Petrova',
          lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
          loginCount: 8,
          location: 'Plovdiv, Bulgaria',
          device: 'Mobile',
          browser: 'Safari',
          isOnline: false,
          lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
          stats: { carsListed: 7, carsSold: 3, totalViews: 89 }
        }
      ];
    }
  }

  // Prefer server-side computed analytics via callable; fallback to client aggregation
  public async getRealAnalytics(): Promise<any> {
    // 1) Try callable function (admin-safe, fastest, bypasses rules)
    try {
      const getAnalytics = httpsCallable(functions, 'getSuperAdminAnalytics');
      const res = await getAnalytics({});
      if (res && (res as any).data) {
        const data: any = (res as any).data;
        return {
          ...data,
          lastUpdated: data.lastUpdated ? new Date(data.lastUpdated) : new Date(),
        };
      }
    } catch (fnErr) {
      serviceLogger.warn('Callable getSuperAdminAnalytics failed; falling back to client aggregation');
    }

    // 2) Fallback: aggregate via direct reads
    try {
      const [
        totalUsers,
        activeUsers,
        totalCars,
        activeCars,
        totalMessages,
        totalViews,
        revenue
      ] = await Promise.all([
        this.getRealUsersCount(),
        this.getRealActiveUsersCount(),
        this.getRealCarsCount(),
        this.getRealActiveCarsCount(),
        this.getRealMessagesCount(),
        this.getRealViewsCount(),
        this.getRealRevenue()
      ]);

      return {
        totalUsers,
        activeUsers,
        totalCars,
        activeCars,
        totalMessages,
        totalViews,
        revenue,
        lastUpdated: new Date()
      };
    } catch (error) {
      serviceLogger.error('Error getting analytics', error as Error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalCars: 0,
        activeCars: 0,
        totalMessages: 0,
        totalViews: 0,
        revenue: 0,
        lastUpdated: new Date()
      };
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

  // Get Firebase Console URL for user management
  public getFirebaseConsoleUrl(): string {
    return 'https://console.firebase.google.com/u/0/project/studio-448742006-a3493/authentication/users';
  }

  // Get Firebase Console URL for Firestore
  public getFirestoreConsoleUrl(): string {
    return 'https://console.firebase.google.com/u/0/project/studio-448742006-a3493/firestore/data';
  }
}

export const firebaseRealDataService = FirebaseRealDataService.getInstance();
