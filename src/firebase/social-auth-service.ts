import { logger } from '../services/logger-service';
import { auth, db } from './firebase-config';
import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  signInWithPhoneNumber,
  signInAnonymously,
  RecaptchaVerifier,
  ConfirmationResult,
  getRedirectResult,
  User,
  UserCredential
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Service for handling social authentication
 */
export class SocialAuthService {
  // Guard against concurrent profile sync calls (React Strict Mode / double-fire)
  private static _syncInProgress = false;

  /**
   * Sign in with Google
   */
  static async signInWithGoogle() {
    try {
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Starting Google sign-in...');
      }

      const provider = new GoogleAuthProvider();
      // Add scopes if needed
      provider.addScope('profile');
      provider.addScope('email');

      const result = await signInWithPopup(auth, provider);

      if (process.env.NODE_ENV === 'development') {
        const user = result.user;
        logger.debug('Google sign-in successful', { uid: user.uid, email: user.email });
      }

      return result;
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        logger.warn('Google sign-in cancelled by user');
      } else {
        logger.error('Google sign-in error', error as Error);
      }
      throw error;
    }
  }

  /**
   * Sign in with Facebook
   */
  static async signInWithFacebook() {
    try {
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Starting Facebook sign-in...');
      }

      const provider = new FacebookAuthProvider();
      provider.addScope('public_profile');
      provider.addScope('email');

      const result = await signInWithPopup(auth, provider);

      if (process.env.NODE_ENV === 'development') {
        const user = result.user;
        logger.debug('Facebook sign-in successful', { uid: user.uid, email: user.email });
      }

      return result;
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        logger.warn('Facebook sign-in cancelled by user');
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        logger.warn('Account exists with different credential');
        throw new Error('An account already exists with the same email address but different sign-in credentials. Sign in using a Google account.');
      } else {
        logger.error('Facebook sign-in error', error as Error);
      }
      throw error;
    }
  }

  /**
   * Handle redirect result (for OAuth flows like Google/Facebook on mobile/redirect)
   */
  static async handleRedirectResult(): Promise<UserCredential | null> {
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        if (process.env.NODE_ENV === 'development') {
          logger.debug('Redirect result handled successfully', { uid: result.user.uid });
        }
        return result;
      }
      return null;
    } catch (error) {
      logger.error('Error handling redirect result', error as Error);
      throw error;
    }
  }

  /**
   * Wait for Firestore to be ready with auth token attached
   * This prevents permission-denied errors on getDoc/setDoc calls
   */
  private static async waitForFirestoreReady(maxRetries = 5): Promise<void> {
    for (let i = 0; i < maxRetries; i++) {
      // Small delay to let Firestore attach auth token
      await new Promise(resolve => setTimeout(resolve, 50 * (i + 1)));
      
      // Firestore will be ready once it has the auth token
      // We can verify by checking if auth is properly initialized
      if (auth.currentUser) {
        return;
      }
    }
  }

  /**
   * Create or update user profile in Firestore with retry logic
   */
  static async createOrUpdateBulgarianProfile(user: User): Promise<void> {
    if (!user) return;

    // Prevent concurrent calls (React Strict Mode double-invoke)
    if (SocialAuthService._syncInProgress) {
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Profile sync already in progress, skipping duplicate call');
      }
      return;
    }

    SocialAuthService._syncInProgress = true;
    try {
      // ✅ CRITICAL: Wait for Firestore to be ready with auth token
      await SocialAuthService.waitForFirestoreReady();

      const userRef = doc(db, 'users', user.uid);
      
      // Retry logic for getDoc in case of temporary permission-denied
      let userSnap: any = null;
      let lastError: Error | null = null;
      
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          userSnap = await getDoc(userRef);
          break; // Success, exit retry loop
        } catch (error: any) {
          lastError = error;
          if (error.code === 'permission-denied' && attempt < 2) {
            // Retry on permission-denied (likely due to auth token not being attached yet)
            if (process.env.NODE_ENV === 'development') {
              logger.debug(`Retrying getDoc after permission-denied (attempt ${attempt + 1}/3)`, {
                userId: user.uid
              });
            }
            await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)));
            continue;
          }
          throw error; // Re-throw on non-permission-denied errors
        }
      }

      if (!userSnap) {
        throw lastError || new Error('Failed to read user document after retries');
      }

      const isNewUser =!userSnap.exists();
      const userData: Record<string, any> = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        lastLogin: serverTimestamp(),
      };

      // Add default Bulgarian settings only for new users
      if (isNewUser) {
        userData.createdAt = serverTimestamp();
        userData.role = 'user';
        userData.preferences = {
          language: 'bg',
          currency: 'BGN',
          notifications: true
        };
      }

      await setDoc(userRef, userData, { merge: true });

      // ✅ SELF-HEALING: Ensure numeric ID is assigned immediately
      const { profileService } = await import('../services/profile/UnifiedProfileService');
      await profileService.ensureNumericId(user.uid);
    } catch (error) {
      logger.error('Error syncing user profile to Firestore', error as Error);
      // Non-blocking error
    } finally {
      SocialAuthService._syncInProgress = false;
    }
  }

  /**
   * Set up reCAPTCHA verifier
   * @param containerId The ID of the DOM element to render reCAPTCHA in (for visible/invisible)
   */
  static setupRecaptchaVerifier(containerId: string): RecaptchaVerifier {
    // Clear existing if any
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {
        // ignore
      }
    }

    try {
      // ✅ Back to 'invisible' as user requested to remove the manual check experience
      const size = 'invisible';

      const recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: size,
        // 'badge': 'bottomleft', // Only relevant for invisible
        callback: (response: any) => {
          if (process.env.NODE_ENV === 'development') {
            logger.debug('reCAPTCHA verified', { response }); // Log for debug
          }
        },
        'expired-callback': () => {
          logger.warn('reCAPTCHA expired');
        }
      });

      // Store in window for global access/cleanup if needed
      window.recaptchaVerifier = recaptchaVerifier;

      // Render immediately to ensure it's ready
      recaptchaVerifier.render().then((widgetId) => {
        logger.debug('reCAPTCHA rendered', { widgetId });
      });

      return recaptchaVerifier;
    } catch (error) {
      logger.error('Error setting up reCAPTCHA', error as Error);
      throw error;
    }
  }

  /**
   * Send phone verification code
   */
  static async sendPhoneVerificationCode(
    phoneNumber: string,
    recaptchaVerifier: RecaptchaVerifier
  ): Promise<ConfirmationResult> {
    try {
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Sending verification code', { phoneNumber });
      }

      // Ensure phone number starts with country code
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+359${phoneNumber}`;

      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);

      if (process.env.NODE_ENV === 'development') {
        logger.debug('Verification code sent successfully');
      }
      return confirmationResult;
    } catch (error: any) {
      logger.error('Phone verification code error', error as Error);
      throw error;
    }
  }

  /**
   * Verify phone code and sign in
   */
  static async verifyPhoneCode(
    confirmationResult: ConfirmationResult,
    code: string
  ) {
    try {
      const result = await confirmationResult.confirm(code);

      if (process.env.NODE_ENV === 'development') {
        logger.debug('Phone verified successfully', { uid: result.user.uid });
      }

      return result;
    } catch (error: any) {
      logger.error('Phone code verification error', error as Error);
      throw error;
    }
  }

  /**
   * Sign in anonymously (Guest Mode)
   * 
   * Persistent Guest Identity:
   * 1. Check Cookie/localStorage for existing guest UID
   * 2. If found -> restore via custom token (same account)
   * 3. If not found -> create new anonymous account
   * 4. Save identity to Cookie + localStorage for next visit
   */
  static async signInAnonymously() {
    try {
      logger.info('[Guest] Initiating guest sign-in...');

      // Step 1: Check for existing guest identity
      const { guestIdentityService } = await import('../services/guest-identity.service');
      const storedUid = guestIdentityService.getStoredUid();

      if (storedUid) {
        // Step 2: Try to restore existing guest account
        try {
          const restored = await SocialAuthService.restoreGuestAccount(storedUid);
          if (restored) {
            logger.info('[Guest] Restored existing account', { uid: storedUid });
            return restored;
          }
        } catch (restoreErr) {
          logger.warn('[Guest] Failed to restore, creating new account', {
            storedUid, error: String(restoreErr)
          });
          // Clear stale identity and fall through to create new
          guestIdentityService.clearIdentity();
        }
      }

      // Step 3: Create new anonymous account
      const result = await signInAnonymously(auth);

      const guestProfile = {
        uid: result.user.uid,
        email: null,
        displayName: 'Guest User',
        phoneNumber: null,
        isAnonymous: true,
        profileType: 'private' as const,
        photoURL: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { doc, setDoc } = await import('firebase/firestore');
      const { db } = await import('./index');
      await setDoc(doc(db, 'users', result.user.uid), guestProfile, { merge: true });

      // Step 4: Save identity for future visits
      guestIdentityService.saveIdentity(result.user.uid);

      logger.info('[Guest] New account created', { uid: result.user.uid });
      return result;
    } catch (error) {
      logger.error('[Guest] Sign-in error', error as Error);
      throw error;
    }
  }

  /**
   * Restore an existing guest account via Cloud Function custom token
   */
  private static async restoreGuestAccount(
    guestUid: string
  ): Promise<UserCredential | null> {
    const { getFunctions, httpsCallable } = await import('firebase/functions');
    const { signInWithCustomToken } = await import('firebase/auth');

    const functions = getFunctions(undefined, 'europe-west1');
    const getToken = httpsCallable(functions, 'getGuestCustomToken');

    const response = await getToken({ guestUid });
    const { token, numericId } = response.data as {
      token: string; numericId: number | null
    };

    if (!token) return null;

    // Sign in with the custom token -> restores the same Firebase user
    const credential = await signInWithCustomToken(auth, token);

    // Update stored identity with numericId if available
    const { guestIdentityService } = await import('../services/guest-identity.service');
    guestIdentityService.saveIdentity(guestUid, numericId ?? undefined);

    return credential;
  }
}

// Add type definition
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}
