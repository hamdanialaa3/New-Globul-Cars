// src/firebase/social-auth-service.ts
// Enhanced Social Authentication Service for Bulgarian Car Marketplace

import { 
  GoogleAuthProvider, 
  FacebookAuthProvider, 
  OAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  User,
  UserCredential,
  linkWithPopup,
  unlink,
  reauthenticateWithPopup,
  updateProfile,
  deleteUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from './firebase-config';

// Enhanced Bulgarian User Profile Interface
export interface BulgarianUserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  firstName?: string;
  lastName?: string;
  photoURL: string | null;
  phoneNumber: string | null;
  emailVerified: boolean;
  
  // Bulgarian specific fields
  location: {
    city?: string;
    region?: string;
    country: string; // Always 'Bulgaria'
  };
  preferredLanguage: 'bg' | 'en';
  currency: 'EUR';
  phoneCountryCode: '+359';
  
  // User preferences
  isDealer: boolean;
  dealerInfo?: {
    companyName: string;
    licenseNumber: string;
    address: {
      street: string;
      city: string;
      postalCode: string;
      region: string;
    };
    contactInfo?: {
      phone: string;
      email: string;
      website?: string;
    };
    businessHours?: any;
    specializations?: string[];
    rating?: {
      average: number;
      totalReviews: number;
    };
    verificationStatus?: 'pending' | 'verified' | 'rejected';
  };
  
  // Social providers
  linkedProviders: Array<{
    providerId: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
    linkedAt: Date;
  }>;
  
  // Activity tracking
  lastLoginAt: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Preferences
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    marketing: boolean;
  };
  
  // Car marketplace specific
  favoriteCarBrands: string[];
  searchHistory: Array<{
    query: string;
    timestamp: Date;
  }>;
  viewedCars: string[];
  inquiredCars: string[];
  
  // Privacy settings
  profileVisibility: 'public' | 'dealers' | 'private';
  showPhone: boolean;
  showEmail: boolean;
}

// Provider configurations
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const appleProvider = new OAuthProvider('apple.com');
const microsoftProvider = new OAuthProvider('microsoft.com');
const samsungProvider = new OAuthProvider('accounts.samsung.com');

// Configure providers
googleProvider.addScope('email');
googleProvider.addScope('profile');

facebookProvider.addScope('email');
facebookProvider.addScope('public_profile');

// Configure Apple provider
appleProvider.addScope('email');
appleProvider.addScope('name');

// Configure Microsoft provider
microsoftProvider.addScope('email');
microsoftProvider.addScope('profile');
microsoftProvider.addScope('openid');

// Configure Samsung provider (using OAuth)
samsungProvider.addScope('email');
samsungProvider.addScope('profile');

// Social Auth Service Class
export class SocialAuthService {
  /**
   * Sign in with email and password
   */
  static async signInWithEmailAndPassword(email: string, password: string): Promise<UserCredential> {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // AUTO-SYNC: Update user profile in Firestore
      console.log('✅ Email/Password login successful, syncing to Firestore...');
      await this.createOrUpdateBulgarianProfile(result.user);
      
      return result;
    } catch (error: any) {
      console.error('Email/Password sign-in error:', error);
      throw new Error(this.getErrorMessage(error.code, 'Email/Password'));
    }
  }

  /**
   * Create user with email and password
   */
  static async createUserWithEmailAndPassword(email: string, password: string): Promise<UserCredential> {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // AUTO-SYNC: Create user profile in Firestore
      console.log('✅ Email/Password registration successful, creating Firestore profile...');
      await this.createOrUpdateBulgarianProfile(result.user);
      
      return result;
    } catch (error: any) {
      console.error('Email/Password registration error:', error);
      throw new Error(this.getErrorMessage(error.code, 'Email/Password'));
    }
  }

  /**
   * Sign in with Google (with popup fallback to redirect)
   */
  static async signInWithGoogle(): Promise<UserCredential> {
    try {
      console.log('🔐 Starting Google sign-in process...');
      console.log('Auth domain:', auth.config.authDomain);
      console.log('Firebase app:', auth.app.name);
      
      // First try popup
      console.log('📱 Attempting popup sign-in...');
      const result = await signInWithPopup(auth, googleProvider);
      
      console.log('✅ Google sign-in successful:', {
        email: result.user.email,
        displayName: result.user.displayName,
        uid: result.user.uid
      });
      
      // AUTO-SYNC: Create/Update user profile in Firestore
      console.log('📝 Syncing Google user to Firestore...');
      await this.createOrUpdateBulgarianProfile(result.user);
      console.log('✅ Google user synced to Firestore');
      
      return result;
    } catch (error: any) {
      console.error('❌ Google sign-in error details:', {
        code: error.code,
        message: error.message,
        credential: error.credential,
        customData: error.customData
      });

      // Handle specific error cases with user-friendly messages
      if (error.code === 'auth/popup-blocked') {
        console.warn('🚫 Popup blocked, automatically switching to redirect method...');
        
        try {
          console.log('🔄 Starting redirect sign-in...');
          await signInWithRedirect(auth, googleProvider);
          
          // The redirect will happen, and the result will be handled by handleRedirectResult on page load
          // We don't return here as the page will redirect
          throw new Error('REDIRECT_INITIATED'); // Special error to indicate redirect started
        } catch (redirectError: any) {
          if (redirectError.message === 'REDIRECT_INITIATED') {
            throw redirectError; // Re-throw our special indicator
          }
          console.error('❌ Redirect also failed:', redirectError);
          throw new Error('تعذر تسجيل الدخول مع Google. يرجى المحاولة مرة أخرى أو تفعيل النوافذ المنبثقة.');
        }
      }
      
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in was cancelled. Please try again.');
      }
      
      if (error.code === 'auth/cancelled-popup-request') {
        throw new Error('Sign-in request was cancelled. Please try again.');
      }
      
      if (error.code === 'auth/unauthorized-domain') {
        throw new Error('This domain is not authorized for Google sign-in. Please contact support.');
      }
      
      if (error.code === 'auth/operation-not-allowed') {
        throw new Error('Google sign-in is not enabled for this app. Please contact support.');
      }
      
      if (error.code === 'auth/invalid-api-key') {
        throw new Error('Invalid API key configuration. Please contact support.');
      }
      
      if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error occurred. Please check your connection and try again.');
      }

      console.error('🔥 Unhandled Google sign-in error:', error);
      throw new Error(this.getErrorMessage(error.code, 'Google'));
    }
  }

  /**
   * Sign in with Facebook (with popup fallback to redirect)
   */
  static async signInWithFacebook(): Promise<UserCredential> {
    try {
      console.log('🔵 Starting Facebook sign-in process...');
      
      // First try popup
      const result = await signInWithPopup(auth, facebookProvider);
      
      console.log('✅ Facebook sign-in successful:', {
        email: result.user.email,
        displayName: result.user.displayName,
        uid: result.user.uid
      });
      
      // AUTO-SYNC: Create/Update user profile in Firestore
      console.log('📝 Syncing Facebook user to Firestore...');
      await this.createOrUpdateBulgarianProfile(result.user);
      console.log('✅ Facebook user synced to Firestore');
      
      return result;
    } catch (error: any) {
      console.warn('Facebook popup failed, trying redirect:', error.code);

      // If popup is blocked, try redirect
      if (error.code === 'auth/popup-blocked' ||
          error.code === 'auth/popup-closed-by-user' ||
          error.code === 'auth/cancelled-popup-request') {

        console.log('Popup blocked, using redirect method...');
        await signInWithRedirect(auth, facebookProvider);

        // This will redirect the user, so we return a promise that never resolves
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            reject(new Error('Redirect timeout - please check if popup blocker is enabled'));
          }, 5000);
        });
      }

      console.error('Facebook sign-in error:', error);
      throw new Error(this.getErrorMessage(error.code, 'Facebook'));
    }
  }

  /**
   * Sign in with Apple/iCloud (with popup fallback to redirect)
   */
  static async signInWithApple(): Promise<UserCredential> {
    try {
      // First try popup
      const result = await signInWithPopup(auth, appleProvider);
      return result;
    } catch (error: any) {
      console.warn('Apple popup failed, trying redirect:', error.code);

      // If popup is blocked, try redirect
      if (error.code === 'auth/popup-blocked' ||
          error.code === 'auth/popup-closed-by-user' ||
          error.code === 'auth/cancelled-popup-request') {

        console.log('Popup blocked, using redirect method...');
        await signInWithRedirect(auth, appleProvider);

        // This will redirect the user, so we return a promise that never resolves
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            reject(new Error('Redirect timeout - please check if popup blocker is enabled'));
          }, 5000);
        });
      }

      console.error('Apple sign-in error:', error);
      throw new Error(this.getErrorMessage(error.code, 'Apple'));
    }
  }

  /**
   * Sign in with Microsoft (with popup fallback to redirect)
   */
  static async signInWithMicrosoft(): Promise<UserCredential> {
    try {
      // First try popup
      const result = await signInWithPopup(auth, microsoftProvider);
      return result;
    } catch (error: any) {
      console.warn('Microsoft popup failed, trying redirect:', error.code);

      // If popup is blocked, try redirect
      if (error.code === 'auth/popup-blocked' ||
          error.code === 'auth/popup-closed-by-user' ||
          error.code === 'auth/cancelled-popup-request') {

        console.log('Popup blocked, using redirect method...');
        await signInWithRedirect(auth, microsoftProvider);

        // This will redirect the user, so we return a promise that never resolves
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            reject(new Error('Redirect timeout - please check if popup blocker is enabled'));
          }, 5000);
        });
      }

      console.error('Microsoft sign-in error:', error);
      throw new Error(this.getErrorMessage(error.code, 'Microsoft'));
    }
  }

  /**
   * Sign in with Samsung (with popup fallback to redirect)
   */
  static async signInWithSamsung(): Promise<UserCredential> {
    try {
      // First try popup
      const result = await signInWithPopup(auth, samsungProvider);
      return result;
    } catch (error: any) {
      console.warn('Samsung popup failed, trying redirect:', error.code);

      // If popup is blocked, try redirect
      if (error.code === 'auth/popup-blocked' ||
          error.code === 'auth/popup-closed-by-user' ||
          error.code === 'auth/cancelled-popup-request') {

        console.log('Popup blocked, using redirect method...');
        await signInWithRedirect(auth, samsungProvider);

        // This will redirect the user, so we return a promise that never resolves
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            reject(new Error('Redirect timeout - please check if popup blocker is enabled'));
          }, 5000);
        });
      }

      console.error('Samsung sign-in error:', error);
      throw new Error(this.getErrorMessage(error.code, 'Samsung'));
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
   * Sign in with Facebook using redirect (for mobile)
   */
  static async signInWithFacebookRedirect(): Promise<void> {
    try {
      await signInWithRedirect(auth, facebookProvider);
    } catch (error: any) {
      console.error('Facebook redirect sign-in error:', error);
      throw new Error(this.getErrorMessage(error.code, 'Facebook'));
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
   * Sign in with Microsoft using redirect (for mobile)
   */
  static async signInWithMicrosoftRedirect(): Promise<void> {
    try {
      await signInWithRedirect(auth, microsoftProvider);
    } catch (error: any) {
      console.error('Microsoft redirect sign-in error:', error);
      throw new Error(this.getErrorMessage(error.code, 'Microsoft'));
    }
  }

  /**
   * Sign in with Samsung using redirect (for mobile)
   */
  static async signInWithSamsungRedirect(): Promise<void> {
    try {
      await signInWithRedirect(auth, samsungProvider);
    } catch (error: any) {
      console.error('Samsung redirect sign-in error:', error);
      throw new Error(this.getErrorMessage(error.code, 'Samsung'));
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
   * Create or update Bulgarian user profile in Firestore
   */
  static async createOrUpdateBulgarianProfile(user: User, additionalData?: Partial<BulgarianUserProfile>): Promise<BulgarianUserProfile> {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    const now = new Date();
    const linkedProviders = user.providerData.map(provider => ({
      providerId: provider.providerId,
      displayName: provider.displayName,
      email: provider.email,
      photoURL: provider.photoURL,
      linkedAt: now
    }));

    if (userDoc.exists()) {
      // Update existing profile
      const existingProfile = userDoc.data() as BulgarianUserProfile;
      const updatedProfile: Partial<BulgarianUserProfile> = {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        phoneNumber: user.phoneNumber,
        emailVerified: user.emailVerified,
        linkedProviders: linkedProviders,
        lastLoginAt: now,
        updatedAt: now,
        ...additionalData
      };

      await updateDoc(userRef, {
        ...updatedProfile,
        updatedAt: serverTimestamp()
      });

      return { ...existingProfile, ...updatedProfile } as BulgarianUserProfile;
    } else {
      // Create new profile
      const newProfile: BulgarianUserProfile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        firstName: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
        photoURL: user.photoURL,
        phoneNumber: user.phoneNumber,
        emailVerified: user.emailVerified,
        
        // Bulgarian defaults
        location: {
          country: 'Bulgaria'
        },
        preferredLanguage: 'bg',
        currency: 'EUR',
        phoneCountryCode: '+359',
        
        // User type
        isDealer: false,
        
        // Social providers
        linkedProviders: linkedProviders,
        
        // Activity tracking
        lastLoginAt: now,
        createdAt: now,
        updatedAt: now,
        
        // Default preferences
        notifications: {
          email: true,
          sms: false,
          push: true,
          marketing: false
        },
        
        // Car marketplace defaults
        favoriteCarBrands: [],
        searchHistory: [],
        viewedCars: [],
        inquiredCars: [],
        
        // Privacy defaults
        profileVisibility: 'dealers',
        showPhone: false,
        showEmail: false,
        
        ...additionalData
      };

      await setDoc(userRef, {
        ...newProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      });

      return newProfile;
    }
  }

  /**
   * Link additional social provider to existing account
   */
  static async linkSocialProvider(providerType: 'google' | 'facebook' | 'apple'): Promise<UserCredential> {
    if (!auth.currentUser) {
      throw new Error('No user is currently signed in');
    }

    let provider;
    switch (providerType) {
      case 'google':
        provider = googleProvider;
        break;
      case 'facebook':
        provider = facebookProvider;
        break;
      case 'apple':
        provider = appleProvider;
        break;
      default:
        throw new Error('Unsupported provider type');
    }

    try {
      const result = await linkWithPopup(auth.currentUser, provider);
      
      // Update user profile with new linked provider
      await this.createOrUpdateBulgarianProfile(result.user);
      
      return result;
    } catch (error: any) {
      console.error(`Error linking ${providerType} provider:`, error);
      throw new Error(this.getErrorMessage(error.code, providerType));
    }
  }

  /**
   * Unlink social provider from account
   */
  static async unlinkSocialProvider(providerId: string): Promise<User> {
    if (!auth.currentUser) {
      throw new Error('No user is currently signed in');
    }

    try {
      const result = await unlink(auth.currentUser, providerId);
      
      // Update user profile to remove unlinked provider
      await this.createOrUpdateBulgarianProfile(result);
      
      return result;
    } catch (error: any) {
      console.error(`Error unlinking provider ${providerId}:`, error);
      throw new Error(this.getErrorMessage(error.code, 'unlink'));
    }
  }

  /**
   * Reauthenticate user with social provider
   */
  static async reauthenticateWithSocial(providerType: 'google' | 'facebook' | 'apple'): Promise<UserCredential> {
    if (!auth.currentUser) {
      throw new Error('No user is currently signed in');
    }

    let provider;
    switch (providerType) {
      case 'google':
        provider = googleProvider;
        break;
      case 'facebook':
        provider = facebookProvider;
        break;
      case 'apple':
        provider = appleProvider;
        break;
      default:
        throw new Error('Unsupported provider type');
    }

    try {
      const result = await reauthenticateWithPopup(auth.currentUser, provider);
      return result;
    } catch (error: any) {
      console.error(`Error reauthenticating with ${providerType}:`, error);
      throw new Error(this.getErrorMessage(error.code, providerType));
    }
  }

  /**
   * Update user profile information
   */
  static async updateUserProfile(updates: {
    displayName?: string;
    photoURL?: string;
  }): Promise<void> {
    if (!auth.currentUser) {
      throw new Error('No user is currently signed in');
    }

    try {
      await updateProfile(auth.currentUser, updates);
      
      // Also update Firestore profile
      await this.createOrUpdateBulgarianProfile(auth.currentUser, updates);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      throw new Error(this.getErrorMessage(error.code, 'update-profile'));
    }
  }

  /**
   * Delete user account completely
   */
  static async deleteUserAccount(): Promise<void> {
    if (!auth.currentUser) {
      throw new Error('No user is currently signed in');
    }

    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      
      // Delete user document from Firestore
      await updateDoc(userRef, {
        deleted: true,
        deletedAt: serverTimestamp()
      });
      
      // Delete Firebase Auth user
      await deleteUser(auth.currentUser);
    } catch (error: any) {
      console.error('Error deleting user account:', error);
      throw new Error(this.getErrorMessage(error.code, 'delete-account'));
    }
  }

  /**
   * Get Bulgarian user profile from Firestore
   */
  static async getBulgarianUserProfile(uid: string): Promise<BulgarianUserProfile | null> {
    try {
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        return userDoc.data() as BulgarianUserProfile;
      }
      
      return null;
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      throw new Error('Failed to fetch user profile');
    }
  }

  /**
   * Update specific Bulgarian user profile fields
   */
  static async updateBulgarianProfile(uid: string, updates: Partial<BulgarianUserProfile>): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error: any) {
      console.error('Error updating Bulgarian profile:', error);
      throw new Error('Failed to update profile');
    }
  }

  /**
   * Search for users by criteria (for admin/dealer purposes)
   */
  static async searchUsers(criteria: {
    email?: string;
    displayName?: string;
    location?: string;
    isDealer?: boolean;
    limit?: number;
  }): Promise<BulgarianUserProfile[]> {
    try {
      const usersRef = collection(db, 'users');
      let q = query(usersRef);
      
      if (criteria.email) {
        q = query(q, where('email', '==', criteria.email));
      }
      if (criteria.isDealer !== undefined) {
        q = query(q, where('isDealer', '==', criteria.isDealer));
      }
      if (criteria.location) {
        q = query(q, where('location.city', '==', criteria.location));
      }
      
      const querySnapshot = await getDocs(q);
      const users: BulgarianUserProfile[] = [];
      
      querySnapshot.forEach((doc) => {
        users.push(doc.data() as BulgarianUserProfile);
      });
      
      return users.slice(0, criteria.limit || 50);
    } catch (error: any) {
      console.error('Error searching users:', error);
      throw new Error('Failed to search users');
    }
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




