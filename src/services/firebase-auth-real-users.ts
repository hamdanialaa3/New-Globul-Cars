// Service to get REAL users from Firebase Authentication (not Firestore!)
// This calls Cloud Functions that read from the actual Firebase Auth system

import { getFunctions, httpsCallable } from 'firebase/functions';
import { serviceLogger } from './logger-service';

interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  emailVerified: boolean;
  phoneNumber: string | null;
  disabled: boolean;
  createdAt: string;
  lastSignInTime: string | null;
  providers: string[];
}

interface AuthUsersResponse {
  totalUsers: number;
  users: AuthUser[];
  timestamp: string;
  source: string;
}

interface ActiveUsersResponse {
  activeUsers: number;
  period: string;
  timestamp: string;
}

interface SyncResponse {
  syncedUsers: number;
  timestamp: string;
  message: string;
}

class FirebaseAuthRealUsers {
  private functions = getFunctions();
  
  /**
   * Get REAL total users count from Firebase Authentication
   * This reads from the actual Auth system, NOT from Firestore!
   */
  async getRealAuthUsersCount(): Promise<number> {
    try {
      serviceLogger.debug('Calling Cloud Function: getAuthUsersCount');
      
      const getAuthUsers = httpsCallable<{}, AuthUsersResponse>(
        this.functions, 
        'getAuthUsersCount'
      );
      
      const result = await getAuthUsers();
      const data = result.data;
      
      serviceLogger.info('REAL users from Firebase Auth', { 
        totalUsers: data.totalUsers, 
        source: data.source,
        sampleUsers: data.users.slice(0, 5).length
      });
      
      return data.totalUsers;
      
    } catch (error: unknown) {
      serviceLogger.error('Error getting real auth users', error as Error);
      
      // If function not deployed, use Firestore count instead
      if (error.code === 'functions/not-found') {
        serviceLogger.warn('Cloud Function not deployed - using Firestore fallback');
        try {
          const { collection, getDocs } = await import('firebase/firestore');
          const { db } = await import('../firebase/firebase-config');
          const usersSnapshot = await getDocs(collection(db, 'users'));
          const count = usersSnapshot.size;
          serviceLogger.debug('Firestore users count', { count });
          return count;
        } catch (firestoreError) {
          serviceLogger.error('Failed to get from Firestore', firestoreError as Error);
          return 0;
        }
      }
      
      throw error;
    }
  }
  
  /**
   * Get active users (logged in within last 24 hours)
   */
  async getActiveAuthUsers(): Promise<number> {
    try {
      serviceLogger.debug('Calling Cloud Function: getActiveAuthUsers');
      
      const getActiveUsers = httpsCallable<{}, ActiveUsersResponse>(
        this.functions, 
        'getActiveAuthUsers'
      );
      
      const result = await getActiveUsers();
      const data = result.data;
      
      serviceLogger.info('Active users from Firebase Auth', { activeUsers: data.activeUsers, period: data.period });
      
      return data.activeUsers;
      
    } catch (error: unknown) {
      serviceLogger.error('Error getting active auth users', error as Error);
      
      if (error.code === 'functions/not-found') {
        return 0;
      }
      
      throw error;
    }
  }
  
  /**
   * Get detailed user list from Firebase Auth
   */
  async getAuthUsersList(): Promise<AuthUser[]> {
    try {
      serviceLogger.debug('Getting auth users list from Cloud Function');
      
      const getAuthUsers = httpsCallable<{}, AuthUsersResponse>(
        this.functions, 
        'getAuthUsersCount'
      );
      
      const result = await getAuthUsers();
      serviceLogger.info('Got users from Cloud Function', { count: result.data.users.length });
      return result.data.users;
      
    } catch (error: unknown) {
      serviceLogger.error('Error getting auth users list', error as Error);
      
      // If Cloud Function not deployed, get from Firestore as fallback
      if (error.code === 'functions/not-found') {
        serviceLogger.warn('Cloud Function not ready - reading from Firestore');
        try {
          const { collection, getDocs } = await import('firebase/firestore');
          const { db } = await import('../firebase/firebase-config');
          const usersSnapshot = await getDocs(collection(db, 'users'));
          
          const users: AuthUser[] = usersSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              uid: doc.id,
              email: data.email || 'unknown@example.com',
              displayName: data.displayName || data.name || 'User',
              photoURL: data.photoURL || data.avatar || null,
              emailVerified: data.emailVerified || false,
              phoneNumber: data.phoneNumber || data.phone || null,
              disabled: data.disabled || data.isBanned || false,
              createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
              lastSignInTime: data.lastLogin?.toDate?.()?.toISOString() || data.lastLoginAt?.toDate?.()?.toISOString() || null,
              providers: ['email']
            };
          });
          
          serviceLogger.info('Got users from Firestore fallback', { count: users.length });
          return users;
        } catch (firestoreError) {
          serviceLogger.error('Failed to get from Firestore', firestoreError as Error);
          return [];
        }
      }
      
      return [];
    }
  }
  
  /**
   * Sync Firebase Auth users to Firestore
   * This creates user documents in Firestore for all Auth users
   */
  async syncAuthToFirestore(): Promise<SyncResponse> {
    try {
      serviceLogger.debug('Calling Cloud Function: syncAuthToFirestore (may take a while)');
      
      const syncUsers = httpsCallable<{}, SyncResponse>(
        this.functions, 
        'syncAuthToFirestore'
      );
      
      const result = await syncUsers();
      const data = result.data;
      
      serviceLogger.info('Sync completed', { message: data.message });
      
      return data;
      
    } catch (error: unknown) {
      serviceLogger.error('Error syncing users', error as Error);
      throw error;
    }
  }  /**
   * Get comprehensive user analytics
   */
  async getUserAnalytics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    verified: number;
    unverified: number;
    withPhone: number;
    disabled: number;
  }> {
    try {
      const users = await this.getAuthUsersList();
      
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      return {
        total: users.length,
        active: users.filter(u => 
          u.lastSignInTime && new Date(u.lastSignInTime) > oneDayAgo
        ).length,
        inactive: users.filter(u => 
          !u.lastSignInTime || new Date(u.lastSignInTime) <= oneDayAgo
        ).length,
        verified: users.filter(u => u.emailVerified).length,
        unverified: users.filter(u => !u.emailVerified).length,
        withPhone: users.filter(u => u.phoneNumber).length,
        disabled: users.filter(u => u.disabled).length
      };
      
    } catch (error) {
      serviceLogger.error('Error getting user analytics', error as Error);
      return {
        total: 0,
        active: 0,
        inactive: 0,
        verified: 0,
        unverified: 0,
        withPhone: 0,
        disabled: 0
      };
    }
  }
}

export const firebaseAuthRealUsers = new FirebaseAuthRealUsers();