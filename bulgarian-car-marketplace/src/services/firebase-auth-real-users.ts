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
      
      // If function not deployed, return 0
      if (error.code === 'functions/not-found') {
        console.warn('⚠️ Cloud Function not deployed yet. Deploy with: firebase deploy --only functions');
        return 0;
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
      const getAuthUsers = httpsCallable<{}, AuthUsersResponse>(
        this.functions, 
        'getAuthUsersCount'
      );
      
      const result = await getAuthUsers();
      return result.data.users;
      
    } catch (error: any) {
      console.error('❌ Error getting auth users list:', error);
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

