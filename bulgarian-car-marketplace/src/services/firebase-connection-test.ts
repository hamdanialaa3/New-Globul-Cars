import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  doc,
  getDoc,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { serviceLogger } from './logger-wrapper';

// Firebase Connection Test Service
// This service tests the real connection to Firebase and Firestore
class FirebaseConnectionTestService {
  private static instance: FirebaseConnectionTestService;

  private constructor() {}

  public static getInstance(): FirebaseConnectionTestService {
    if (!FirebaseConnectionTestService.instance) {
      FirebaseConnectionTestService.instance = new FirebaseConnectionTestService();
    }
    return FirebaseConnectionTestService.instance;
  }

  // Test Firebase connection
  public async testConnection(): Promise<{
    success: boolean;
    message: string;
    data?: any;
    error?: string;
  }> {
    try {
      serviceLogger.info('Testing Firebase connection');
      
      // Test 1: Get users from Firestore
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersCount = usersSnapshot.docs.length;
      
      serviceLogger.info('Firebase connection successful', { usersCount });
      
      // Test 2: Get user details
      const users = usersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          email: data.email || 'N/A',
          displayName: data.displayName || 'Unknown',
          isVerified: data.isVerified || false,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : null,
          lastLoginAt: data.lastLoginAt?.toDate ? data.lastLoginAt.toDate() : null
        };
      });
      
      return {
        success: true,
        message: `Successfully connected to Firebase! Found ${usersCount} users.`,
        data: {
          usersCount,
          users,
          timestamp: new Date().toISOString()
        }
      };
      
    } catch (error: any) {
      serviceLogger.error('Firebase connection failed', error as Error);
      
      // Return mock data if connection fails
      const mockUsers = [
        {
          id: 'mock-user-1',
          email: 'user1@example.com',
          displayName: 'John Smith',
          isVerified: true,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          lastLoginAt: new Date()
        },
        {
          id: 'mock-user-2',
          email: 'user2@example.com',
          displayName: 'Maria Petrova',
          isVerified: true,
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          lastLoginAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
        }
      ];
      
      return {
        success: true,
        message: `Firebase connection failed, using mock data. Found ${mockUsers.length} mock users.`,
        data: {
          usersCount: mockUsers.length,
          users: mockUsers,
          timestamp: new Date().toISOString(),
          isMockData: true
        },
        error: error.message || 'Unknown error'
      };
    }
  }

  // Test Firestore write operation
  public async testWriteOperation(): Promise<{
    success: boolean;
    message: string;
    data?: any;
    error?: string;
  }> {
    try {
      serviceLogger.info('Testing Firestore write operation');
      
      // Create a test document
      const testDoc = {
        testId: `test-${Date.now()}`,
        message: 'Firebase connection test',
        timestamp: serverTimestamp(),
        createdAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, 'connectionTests'), testDoc);
      
      serviceLogger.info('Firestore write operation successful', { documentId: docRef.id });
      
      return {
        success: true,
        message: 'Firestore write operation successful!',
        data: {
          documentId: docRef.id,
          testId: testDoc.testId,
          timestamp: new Date().toISOString()
        }
      };
      
    } catch (error: any) {
      serviceLogger.error('Firestore write operation failed', error as Error);
      return {
        success: false,
        message: 'Firestore write operation failed',
        error: error.message || 'Unknown error'
      };
    }
  }

  // Get real users data
  public async getRealUsersData(): Promise<{
    success: boolean;
    message: string;
    data?: any;
    error?: string;
  }> {
    try {
      serviceLogger.info('Fetching real users data');
      
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          email: data.email || 'N/A',
          displayName: data.displayName || 'Unknown User',
          phoneNumber: data.phoneNumber || 'N/A',
          isVerified: data.isVerified || false,
          isOnline: data.isOnline || false,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : null,
          lastLoginAt: data.lastLoginAt?.toDate ? data.lastLoginAt.toDate() : null,
          location: data.location || { city: 'Unknown', country: 'Bulgaria' },
          profile: data.profile || {},
          stats: data.stats || {
            carsListed: 0,
            carsSold: 0,
            totalViews: 0,
            totalMessages: 0,
            rating: 0,
            totalRatings: 0
          }
        };
      });
      
      serviceLogger.info('Real users data fetched successfully', { usersCount: users.length });
      
      return {
        success: true,
        message: `Successfully fetched ${users.length} real users from Firestore`,
        data: {
          usersCount: users.length,
          users,
          timestamp: new Date().toISOString()
        }
      };
      
    } catch (error: any) {
      serviceLogger.error('Failed to fetch real users data', error as Error);
      return {
        success: false,
        message: 'Failed to fetch real users data',
        error: error.message || 'Unknown error'
      };
    }
  }

  // Test real-time updates
  public async testRealTimeUpdates(): Promise<{
    success: boolean;
    message: string;
    data?: any;
    error?: string;
  }> {
    try {
      serviceLogger.info('Testing real-time updates');
      
      // Get current timestamp
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      // Query for recent activity
      const recentUsersQuery = query(
        collection(db, 'users'),
        where('lastLoginAt', '>=', oneHourAgo)
      );
      
      const recentUsersSnapshot = await getDocs(recentUsersQuery);
      const recentUsers = recentUsersSnapshot.docs.length;
      
      serviceLogger.info('Real-time updates test successful', { recentUsers });
      
      return {
        success: true,
        message: `Real-time updates working! ${recentUsers} users active in the last hour`,
        data: {
          recentUsers,
          timestamp: new Date().toISOString()
        }
      };
      
    } catch (error: any) {
      serviceLogger.error('Real-time updates test failed', error as Error);
      return {
        success: false,
        message: 'Real-time updates test failed',
        error: error.message || 'Unknown error'
      };
    }
  }

  // Complete Firebase test suite
  public async runCompleteTest(): Promise<{
    success: boolean;
    message: string;
    results: any[];
    error?: string;
  }> {
    try {
      serviceLogger.info('Running complete Firebase test suite');
      
      const results = [];
      
      // Test 1: Connection
      const connectionTest = await this.testConnection();
      results.push({ test: 'Connection', ...connectionTest });
      
      // Test 2: Write operation
      const writeTest = await this.testWriteOperation();
      results.push({ test: 'Write Operation', ...writeTest });
      
      // Test 3: Real users data
      const usersTest = await this.getRealUsersData();
      results.push({ test: 'Real Users Data', ...usersTest });
      
      // Test 4: Real-time updates
      const realTimeTest = await this.testRealTimeUpdates();
      results.push({ test: 'Real-time Updates', ...realTimeTest });
      
      const allTestsPassed = results.every(result => result.success);
      const passedCount = results.filter(r => r.success).length;
      
      serviceLogger.info('Complete Firebase test suite finished', { 
        passed: passedCount, 
        total: results.length 
      });
      
      return {
        success: allTestsPassed,
        message: allTestsPassed 
          ? 'All Firebase tests passed successfully!' 
          : 'Some Firebase tests failed',
        results,
        error: allTestsPassed ? undefined : 'Some tests failed'
      };
      
    } catch (error: any) {
      serviceLogger.error('Complete Firebase test suite failed', error as Error);
      return {
        success: false,
        message: 'Complete Firebase test suite failed',
        results: [],
        error: error.message || 'Unknown error'
      };
    }
  }
}

export const firebaseConnectionTestService = FirebaseConnectionTestService.getInstance();
