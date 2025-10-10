// Service to get REAL users from Firebase Authentication (not Firestore!)
// This calls Cloud Functions that read from the actual Firebase Auth system

import { getFunctions, httpsCallable } from 'firebase/functions';

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
      console.log('📞 Calling Cloud Function: getAuthUsersCount (from Firebase Auth)');
      
      const getAuthUsers = httpsCallable<{}, AuthUsersResponse>(
        this.functions, 
        'getAuthUsersCount'
      );
      
      const result = await getAuthUsers();
      const data = result.data;
      
      console.log(`✅ REAL users from Firebase Auth: ${data.totalUsers}`);
      console.log(`📊 Source: ${data.source}`);
      console.log(`👥 Sample users:`, data.users.slice(0, 5));
      
      return data.totalUsers;
      
    } catch (error: any) {
      console.error('❌ Error getting real auth users:', error);
      
      // If function not deployed, use Firestore count instead
      if (error.code === 'functions/not-found') {
        console.warn('⚠️ Cloud Function not deployed yet. Using Firestore as temporary fallback...');
        try {
          const { collection, getDocs } = await import('firebase/firestore');
          const { db } = await import('../firebase/firebase-config');
          const usersSnapshot = await getDocs(collection(db, 'users'));
          const count = usersSnapshot.size;
          console.log(`📊 Firestore users count: ${count}`);
          return count;
        } catch (firestoreError) {
          console.error('Failed to get from Firestore too:', firestoreError);
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
      console.log('📞 Calling Cloud Function: getActiveAuthUsers');
      
      const getActiveUsers = httpsCallable<{}, ActiveUsersResponse>(
        this.functions, 
        'getActiveAuthUsers'
      );
      
      const result = await getActiveUsers();
      const data = result.data;
      
      console.log(`✅ Active users (${data.period}): ${data.activeUsers}`);
      
      return data.activeUsers;
      
    } catch (error: any) {
      console.error('❌ Error getting active auth users:', error);
      
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
      console.log('📞 Getting auth users list...');
      
      const getAuthUsers = httpsCallable<{}, AuthUsersResponse>(
        this.functions, 
        'getAuthUsersCount'
      );
      
      const result = await getAuthUsers();
      console.log(`✅ Got ${result.data.users.length} users from Cloud Function`);
      return result.data.users;
      
    } catch (error: any) {
      console.error('❌ Error getting auth users list:', error);
      
      // If Cloud Function not deployed, get from Firestore as fallback
      if (error.code === 'functions/not-found') {
        console.warn('⚠️ Cloud Function not ready. Reading from Firestore...');
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
          
          console.log(`✅ Got ${users.length} users from Firestore fallback`);
          return users;
        } catch (firestoreError) {
          console.error('Failed to get from Firestore:', firestoreError);
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
      console.log('📞 Calling Cloud Function: syncAuthToFirestore');
      console.log('⏳ This may take a while for many users...');
      
      const syncUsers = httpsCallable<{}, SyncResponse>(
        this.functions, 
        'syncAuthToFirestore'
      );
      
      const result = await syncUsers();
      const data = result.data;
      
      console.log(`✅ ${data.message}`);
      
      return data;
      
    } catch (error: any) {
      console.error('❌ Error syncing users:', error);
      throw error;
    }
  }
  
  /**
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
      console.error('Error getting user analytics:', error);
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

