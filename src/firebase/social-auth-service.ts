// src/firebase/social-auth-service.ts
// Social Authentication Service for Bulgarian Car Marketplace

import { 
  GoogleAuthProvider, 
  FacebookAuthProvider, 
  OAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  User,
  UserCredential
} from 'firebase/auth';
import { auth } from './firebase-config';

// Provider configurations
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const appleProvider = new OAuthProvider('apple.com');

// Configure providers
googleProvider.addScope('email');
googleProvider.addScope('profile');

facebookProvider.addScope('email');
facebookProvider.addScope('public_profile');

// Configure Apple provider
appleProvider.addScope('email');
appleProvider.addScope('name');

// Social Auth Service Class
export class SocialAuthService {
  /**
   * Sign in with Google
   */
  static async signInWithGoogle(): Promise<UserCredential> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result;
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      throw new Error(this.getErrorMessage(error.code, 'Google'));
    }
  }

  /**
   * Sign in with Facebook
   */
  static async signInWithFacebook(): Promise<UserCredential> {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      return result;
    } catch (error: any) {
      console.error('Facebook sign-in error:', error);
      throw new Error(this.getErrorMessage(error.code, 'Facebook'));
    }
  }

  /**
   * Sign in with Apple/iCloud
   */
  static async signInWithApple(): Promise<UserCredential> {
    try {
      const result = await signInWithPopup(auth, appleProvider);
      return result;
    } catch (error: any) {
      console.error('Apple sign-in error:', error);
      throw new Error(this.getErrorMessage(error.code, 'Apple'));
    }
  }

  /**
   * Sign in with Google using redirect (for mobile)
   */
  static async signInWithGoogleRedirect(): Promise<void> {
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (error: any) {
      console.error('Google redirect sign-in error:', error);
      throw new Error(this.getErrorMessage(error.code, 'Google'));
    }
  }

  /**
   * Sign in with Apple using redirect (for mobile)
   */
  static async signInWithAppleRedirect(): Promise<void> {
    try {
      await signInWithRedirect(auth, appleProvider);
    } catch (error: any) {
      console.error('Apple redirect sign-in error:', error);
      throw new Error(this.getErrorMessage(error.code, 'Apple'));
    }
  }

  /**
   * Handle redirect result (call this on page load)
   */
  static async handleRedirectResult(): Promise<UserCredential | null> {
    try {
      const result = await getRedirectResult(auth);
      return result;
    } catch (error: any) {
      console.error('Redirect result error:', error);
      throw new Error(this.getErrorMessage(error.code, 'Redirect'));
    }
  }

  /**
   * Get user profile data from social provider
   */
  static getUserProfile(user: User) {
    const profile = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      provider: user.providerData[0]?.providerId || 'unknown',
      phoneNumber: user.phoneNumber,
      metadata: {
        creationTime: user.metadata.creationTime,
        lastSignInTime: user.metadata.lastSignInTime
      }
    };

    return profile;
  }

  /**
   * Check if user is signed in with social provider
   */
  static isSocialUser(user: User): boolean {
    return user.providerData.some(provider => 
      ['google.com', 'facebook.com', 'apple.com'].includes(provider.providerId)
    );
  }

  /**
   * Get the primary social provider
   */
  static getPrimaryProvider(user: User): string | null {
    const socialProvider = user.providerData.find(provider => 
      ['google.com', 'facebook.com', 'apple.com'].includes(provider.providerId)
    );
    return socialProvider?.providerId || null;
  }

  /**
   * Get error message based on error code
   */
  private static getErrorMessage(errorCode: string, provider: string): string {
    const errorMessages: { [key: string]: string } = {
      'auth/account-exists-with-different-credential': 
        'An account already exists with the same email address but different sign-in credentials.',
      'auth/auth-domain-config-required': 
        'Authentication domain configuration is required.',
      'auth/cancelled-popup-request': 
        'This operation has been cancelled due to another conflicting popup being opened.',
      'auth/operation-not-allowed': 
        'The given sign-in provider is disabled for this Firebase project.',
      'auth/operation-not-supported-in-this-environment': 
        'This operation is not supported in the current environment.',
      'auth/popup-blocked': 
        'Unable to establish a connection with the popup. It may have been blocked by the browser.',
      'auth/popup-closed-by-user': 
        'The popup has been closed by the user before finalizing the operation.',
      'auth/unauthorized-domain': 
        'This domain is not authorized for OAuth operations.',
      'auth/user-disabled': 
        'The user account has been disabled by an administrator.',
      'auth/user-not-found': 
        'There is no user record corresponding to this identifier.',
      'auth/wrong-password': 
        'The password is invalid or the user does not have a password.',
      'auth/invalid-email': 
        'The email address is not valid.',
      'auth/user-cancelled': 
        'The user did not grant your application the permissions it requested.',
      'auth/invalid-credential': 
        'The supplied auth credential is malformed or has expired.',
      'auth/credential-already-in-use': 
        'This credential is already associated with a different user account.',
      'auth/email-already-in-use': 
        'The email address is already in use by another account.',
      'auth/weak-password': 
        'The password provided is too weak.',
      'auth/network-request-failed': 
        'A network error has occurred.',
      'auth/too-many-requests': 
        'We have blocked all requests from this device due to unusual activity. Try again later.',
      'auth/requires-recent-login': 
        'This operation is sensitive and requires recent authentication. Please log in again before retrying this request.'
    };

    return errorMessages[errorCode] || `An error occurred during ${provider} sign-in. Please try again.`;
  }
}

export default SocialAuthService;


