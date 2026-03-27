// Firebase Health Check Utility
// للتحقق من صحة إعداد Firebase وتشخيص المشاكل

import { auth, db } from '../firebase/firebase-config';
import { logger } from '../services/logger-service';

export class FirebaseHealthCheck {
  static async checkAuth(): Promise<boolean> {
    try {
      if (!auth) {
        logger.error('Firebase Auth is not initialized');
        return false;
      }
      
      // Check if auth is ready
      const currentUser = auth.currentUser;
      logger.info('Firebase Auth status', { 
        isInitialized: !!auth,
        hasCurrentUser: !!currentUser,
        userEmail: currentUser?.email || 'No user'
      });
      
      return true;
    } catch (error) {
      logger.error('Firebase Auth health check failed', error as Error);
      return false;
    }
  }
  
  static async checkFirestore(): Promise<boolean> {
    try {
      if (!db) {
        logger.error('Firestore is not initialized');
        return false;
      }
      
      logger.info('Firestore status', { 
        isInitialized: !!db
      });
      
      return true;
    } catch (error) {
      logger.error('Firestore health check failed', error as Error);
      return false;
    }
  }
  
  static async runFullCheck(): Promise<{ auth: boolean; firestore: boolean }> {
    logger.info('Running Firebase health check...');
    
    const authStatus = await this.checkAuth();
    const firestoreStatus = await this.checkFirestore();
    
    const result = {
      auth: authStatus,
      firestore: firestoreStatus
    };
    
    logger.info('Firebase health check completed', result);
    
    return result;
  }
  
  static logEnvironmentInfo(): void {
    logger.info('Firebase Environment Info', {
      nodeEnv: process.env.NODE_ENV,
      hasApiKey: !!import.meta.env.VITE_GOOGLE_FIREBASE_WEB_KEY,
      hasProjectId: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
      hasAuthDomain: !!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server'
    });
  }
}
