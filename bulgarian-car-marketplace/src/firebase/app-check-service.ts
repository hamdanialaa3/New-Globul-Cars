// src/firebase/app-check-service.ts
// App Check Service for Bulgarian Car Marketplace

import { getToken, AppCheckTokenResult } from 'firebase/app-check';
import { appCheck } from './firebase-config';
import { logger } from '@/services/logger-service';

export class BulgarianAppCheckService {
  /**
   * Get App Check token for API requests
   */
  static async getToken(): Promise<string | null> {
    try {
      if (!appCheck) {
        logger.warn('App Check not initialized');
        return null;
      }

      const tokenResult: AppCheckTokenResult = await getToken(appCheck, false);
      return tokenResult.token;
    } catch (error) {
      logger.error('Error getting App Check token', error as Error);
      return null;
    }
  }

  /**
   * Get App Check token with force refresh
   */
  static async getFreshToken(): Promise<string | null> {
    try {
      if (!appCheck) {
        logger.warn('App Check not initialized');
        return null;
      }

      const tokenResult: AppCheckTokenResult = await getToken(appCheck, true);
      return tokenResult.token;
    } catch (error) {
      logger.error('Error getting fresh App Check token', error as Error);
      return null;
    }
  }

  /**
   * Check if App Check is properly configured
   */
  static isConfigured(): boolean {
    return appCheck !== null && typeof window !== 'undefined';
  }

  /**
   * Validate App Check token format
   */
  static isValidToken(token: string): boolean {
    // Basic validation - Firebase App Check tokens are JWTs
    return typeof token === 'string' && token.split('.').length === 3;
  }
}

export default BulgarianAppCheckService;