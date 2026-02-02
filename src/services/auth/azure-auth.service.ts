// src/services/auth/azure-auth.service.ts
// Azure Authentication Service Adapter
// Delegates all logic to the central BulgarianAuthService (Firebase)

import { logger } from '../logger-service';
import { BulgarianAuthService } from '@/firebase/auth-service';

/**
 * AzureAuthService (Adapter)
 * 
 * This service previously attempted to use raw MSAL.js.
 * It has been refactored to wrap the robust `BulgarianAuthService` which uses
 * Firebase's native `OAuthProvider` for Microsoft/Azure login.
 * 
 * This ensures:
 * 1. Consistent user creation (with numeric IDs)
 * 2. Proper error handling
 * 3. No "split-brain" auth state
 */
class AzureAuthService {

  /**
   * Login with Azure AD using Firebase Popup
   */
  async loginWithPopup() {
    try {
      logger.info('Initiating Azure login via Firebase Adapter');
      const result = await BulgarianAuthService.getInstance().signInWithMicrosoft();

      return {
        success: true,
        user: result.user,
        // Map Firebase user to structure expected by some old consumers if any,
        // but primarily we return the UserCredential
        account: {
          username: result.user.email,
          name: result.user.displayName,
          homeAccountId: result.user.uid
        }
      };
    } catch (error) {
      logger.error('Azure login adapter failed', error as Error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  /**
   * @deprecated logic delegated to Firebase Auth
   */
  async initialize(): Promise<void> {
    // No-op: Firebase is initialized globally
    logger.debug('AzureAuthService adapter ready (Firebase backed)');
  }

  async loginWithRedirect(): Promise<void> {
    logger.warn('loginWithRedirect is deprecated in this adapter. Using Popup flow is recommended.');
    await this.loginWithPopup();
  }

  isAuthenticated(): boolean {
    // This is a rough check; real source of truth is onAuthStateChanged in UI
    const user = BulgarianAuthService.getInstance().getCurrentUserProfile();
    return !!user;
  }
}

export const azureAuthService = new AzureAuthService();
export default azureAuthService;
