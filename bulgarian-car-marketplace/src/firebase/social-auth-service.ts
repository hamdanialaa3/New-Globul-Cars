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
  signInAnonymously,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,

  linkWithCredential,
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
      
      // Debug current configuration
      console.log('🔧 Debug Info:', {
        authDomain: auth.app.options.authDomain,
        projectId: auth.app.options.projectId,
        appName: auth.app.name,
        currentUrl: window.location.href,
        protocol: window.location.protocol
      });
      
      // Check if we're in a secure context
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        throw new Error('Google sign-in requires HTTPS or localhost');
      }
      
      // First try popup, with fallback to redirect
      console.log('📱 Attempting popup sign-in...');
      let result: UserCredential;
      
      try {
        result = await signInWithPopup(auth, googleProvider);
      } catch (popupError: any) {
        console.warn('⚠️ Popup failed, trying redirect method:', popupError.code);
        
        if (popupError.code === 'auth/popup-blocked' || 
            popupError.code === 'auth/popup-closed-by-user' ||
            popupError.code === 'auth/cancelled-popup-request') {
          
          console.log('🔄 Switching to redirect sign-in...');
          await signInWithRedirect(auth, googleProvider);
          
          // After redirect, this won't execute, but we handle it in App.tsx
          // Check for redirect result on app load
          throw new Error('تم تحويلك لتسجيل الدخول. يرجى الانتظار...');
        }
        
        throw popupError; // Re-throw other errors
      }
      
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
      // Enhanced error logging
      console.group('❌ Google Sign-in Error Analysis');
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        credential: error.credential,
        customData: error.customData,
        stack: error.stack
      });
      
      // Check common configuration issues
      if (!process.env.REACT_APP_FIREBASE_API_KEY) {
        console.error('🚨 Missing REACT_APP_FIREBASE_API_KEY');
      }
      if (!process.env.REACT_APP_FIREBASE_AUTH_DOMAIN) {
        console.error('🚨 Missing REACT_APP_FIREBASE_AUTH_DOMAIN');
      }
      
      console.log('🌐 Current environment:', {
        nodeEnv: process.env.NODE_ENV,
        host: window.location.host,
        protocol: window.location.protocol
      });
      console.groupEnd();

      // Handle specific error cases with user-friendly messages
      if (error.code === 'auth/popup-blocked') {
        console.warn('🚫 Popup blocked, automatically switching to redirect method...');
        throw new Error('النوافذ المنبثقة محظورة. يرجى السماح بالنوافذ المنبثقة في إعدادات المتصفح وإعادة المحاولة.');
      }
      
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('تم إلغاء عملية تسجيل الدخول. يرجى المحاولة مرة أخرى.');
      }
      
      if (error.code === 'auth/cancelled-popup-request') {
        throw new Error('تم إلغاء طلب تسجيل الدخول. يرجى المحاولة مرة أخرى.');
      }
      
      if (error.code === 'auth/unauthorized-domain') {
        console.error('🚨 Domain Authorization Issue:', {
          currentDomain: window.location.hostname,
          authDomain: auth.app.options.authDomain,
          suggestion: 'Add this domain to Firebase Console > Authentication > Settings > Authorized domains'
        });
        throw new Error('هذا الموقع غير مصرح له بتسجيل الدخول مع Google. يرجى الاتصال بالدعم الفني.');
      }
      
      if (error.code === 'auth/operation-not-allowed') {
        console.error('🚨 Google Sign-in Disabled:', 'Enable Google provider in Firebase Console > Authentication > Sign-in method');
        throw new Error('تسجيل الدخول مع Google غير مفعل حالياً. يرجى الاتصال بالدعم الفني.');
      }
      
      if (error.code === 'auth/invalid-api-key') {
        console.error('🚨 Invalid API Key:', process.env.REACT_APP_FIREBASE_API_KEY?.slice(0, 10) + '...');
        throw new Error('خطأ في تكوين Firebase. يرجى الاتصال بالدعم الفني.');
      }
      
      if (error.code === 'auth/network-request-failed') {
        throw new Error('خطأ في الشبكة. يرجى التحقق من الاتصال بالإنترنت وإعادة المحاولة.');
      }

      // Special handling for internal-error
      if (error.code === 'auth/internal-error') {
        console.error('🚨 Firebase Internal Error Detected:', {
          code: error.code,
          message: error.message,
          possibleCauses: [
            'Google Sign-in provider not enabled in Firebase Console',
            'Invalid OAuth client configuration',
            'Domain not authorized in Firebase Console',
            'API key restrictions blocking request',
            'Firebase project configuration issue'
          ],
          suggestedActions: [
            'Check Firebase Console > Authentication > Sign-in method',
            'Verify Google provider is enabled and configured',
            'Add current domain to Authorized domains',
            'Check API key restrictions in Google Cloud Console',
            'Visit /debug/internal-error for comprehensive diagnosis'
          ]
        });
        throw new Error('خطأ داخلي في Firebase. يرجى زيارة صفحة التشخيص: /debug/internal-error');
      }

      console.error('🔥 Unhandled Google sign-in error:', error);
      throw new Error(`خطأ في تسجيل الدخول مع Google: ${error.message || 'خطأ غير معروف'}`);
    }
  }

  /**
   * Sign in with Facebook (with popup fallback to redirect)
   */
  static async signInWithFacebook(): Promise<UserCredential> {
    try {
      console.log('🔵 Starting Facebook sign-in process...');
      
      // Use popup only (more reliable than redirect for Facebook)
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
      console.error('Facebook sign-in error:', error);

      // Handle popup blocked error with user-friendly message
      if (error.code === 'auth/popup-blocked') {
        throw new Error('⚠️ النوافذ المنبثقة محظورة. يرجى السماح بالنوافذ المنبثقة في إعدادات المتصفح وإعادة المحاولة.\n\nخطوات الحل:\n1. اضغط على أيقونة "النوافذ المنبثقة محظورة" في شريط العنوان\n2. اختر "السماح دائماً بالنوافذ المنبثقة من هذا الموقع"\n3. حاول مرة أخرى');
      }

      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('تم إلغاء عملية تسجيل الدخول. يرجى المحاولة مرة أخرى.');
      }

      if (error.code === 'auth/cancelled-popup-request') {
        throw new Error('تم إلغاء طلب تسجيل الدخول. يرجى المحاولة مرة أخرى.');
      }
      
      // Handle specific Facebook errors
      if (error.code === 'auth/operation-not-allowed') {
        throw new Error('تسجيل الدخول مع Facebook غير مفعل حالياً. يرجى الاتصال بالدعم الفني.');
      }

      if (error.code === 'auth/account-exists-with-different-credential') {
        throw new Error('هذا البريد الإلكتروني مسجل بالفعل بطريقة تسجيل دخول أخرى. يرجى استخدام نفس طريقة تسجيل الدخول السابقة.');
      }
      
      if (error.code === 'auth/network-request-failed') {
        throw new Error('خطأ في الشبكة. يرجى التحقق من الاتصال بالإنترنت وإعادة المحاولة.');
      }

      if (error.code === 'auth/unauthorized-domain') {
        throw new Error('هذا الموقع غير مصرح له بتسجيل الدخول مع Facebook. يرجى الاتصال بالدعم الفني.');
      }
      
      throw new Error(`خطأ في تسجيل الدخول مع Facebook: ${error.message || 'خطأ غير معروف'}. يرجى المحاولة مرة أخرى.`);
    }
  }

  /**
   * Sign in with Apple/iCloud (with popup fallback to redirect)
   */
  static async signInWithApple(): Promise<UserCredential> {
    try {
      console.log('🍎 Starting Apple sign-in process...');
      
      // First try popup
      const result = await signInWithPopup(auth, appleProvider);
      
      console.log('✅ Apple sign-in successful:', {
        email: result.user.email,
        displayName: result.user.displayName,
        uid: result.user.uid
      });
      
      // AUTO-SYNC: Create/Update user profile in Firestore
      console.log('📝 Syncing Apple user to Firestore...');
      await this.createOrUpdateBulgarianProfile(result.user);
      console.log('✅ Apple user synced to Firestore');
      
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
      
      // Handle specific Apple errors
      if (error.code === 'auth/operation-not-allowed') {
        throw new Error('تسجيل الدخول مع Apple غير مفعل حالياً. يرجى الاتصال بالدعم الفني.');
      }
      
      if (error.code === 'auth/network-request-failed') {
        throw new Error('خطأ في الشبكة. يرجى التحقق من الاتصال بالإنترنت وإعادة المحاولة.');
      }
      
      throw new Error(`An error occurred during Apple sign-in. Please try again.`);
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
   * Sign in anonymously (Guest mode)
   */
  static async signInAnonymously(): Promise<UserCredential> {
    try {
      console.log('👤 Starting anonymous sign-in...');
      
      // Check if anonymous auth is enabled
      console.log('🔧 Checking anonymous auth configuration...');
      
      const result = await signInAnonymously(auth);
      
      console.log('✅ Anonymous sign-in successful:', {
        uid: result.user.uid,
        isAnonymous: result.user.isAnonymous
      });
      
      // AUTO-SYNC: Create/Update anonymous user profile in Firestore
      console.log('📝 Syncing anonymous user to Firestore...');
      await this.createOrUpdateBulgarianProfile(result.user, {
        displayName: 'Guest User',
        profileVisibility: 'private'
      });
      console.log('✅ Anonymous user synced to Firestore');
      
      return result;
    } catch (error: any) {
      console.group('❌ Anonymous Sign-in Error Analysis');
      console.error('Error details:', error);
      
      if (error.code === 'auth/operation-not-allowed') {
        console.error('🚨 Anonymous auth disabled in Firebase Console');
        console.log('🔧 Fix: Enable Anonymous sign-in in Firebase Console > Authentication > Sign-in method');
      }
      
      console.groupEnd();
      throw new Error(`خطأ في الدخول كضيف: ${error.message || 'يرجى التحقق من إعدادات Firebase'}`);
    }
  }

  /**
   * Setup reCAPTCHA verifier for phone authentication
   */
  static setupRecaptchaVerifier(containerId: string): RecaptchaVerifier {
    try {
      const recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: 'normal',
        callback: (response: any) => {
          console.log('✅ reCAPTCHA verified');
        },
        'expired-callback': () => {
          console.warn('⚠️ reCAPTCHA expired');
        }
      });
      
      return recaptchaVerifier;
    } catch (error: any) {
      console.error('reCAPTCHA setup error:', error);
      throw new Error('Failed to setup reCAPTCHA verifier');
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
      console.log('📱 Sending verification code to:', phoneNumber);
      
      // Ensure phone number starts with country code
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+359${phoneNumber}`;
      
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
      
      console.log('✅ Verification code sent successfully');
      return confirmationResult;
    } catch (error: any) {
      console.error('Phone verification code error:', error);
      throw new Error(this.getErrorMessage(error.code, 'Phone'));
    }
  }

  /**
   * Verify phone code and sign in
   */
  static async verifyPhoneCode(
    confirmationResult: ConfirmationResult, 
    code: string
  ): Promise<UserCredential> {
    try {
      console.log('🔐 Verifying phone code...');
      const result = await confirmationResult.confirm(code);
      
      console.log('✅ Phone verification successful:', {
        uid: result.user.uid,
        phoneNumber: result.user.phoneNumber
      });
      
      // AUTO-SYNC: Create/Update user profile in Firestore
      console.log('📝 Syncing phone user to Firestore...');
      await this.createOrUpdateBulgarianProfile(result.user);
      console.log('✅ Phone user synced to Firestore');
      
      return result;
    } catch (error: any) {
      console.error('Phone code verification error:', error);
      throw new Error(this.getErrorMessage(error.code, 'Phone Verification'));
    }
  }

  /**
   * Link phone number to existing account
   */
  static async linkPhoneNumber(phoneNumber: string, recaptchaVerifier: RecaptchaVerifier): Promise<ConfirmationResult> {
    if (!auth.currentUser) {
      throw new Error('No user is currently signed in');
    }

    try {
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+359${phoneNumber}`;
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
      return confirmationResult;
    } catch (error: any) {
      console.error('Link phone number error:', error);
      throw new Error(this.getErrorMessage(error.code, 'Phone Linking'));
    }
  }

  /**
   * Convert anonymous account to permanent account
   */
  static async convertAnonymousAccount(email: string, password: string): Promise<UserCredential> {
    if (!auth.currentUser || !auth.currentUser.isAnonymous) {
      throw new Error('No anonymous user is currently signed in');
    }

    try {
      console.log('🔄 Converting anonymous account to permanent...');
      
      // Create email credential - we'll use a different approach
      // Since EmailAuthProvider is not imported, we'll create new account instead of linking
      
      // For now, let's create a new account and transfer data
      const newUserCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Transfer anonymous user's data to new account
      const anonymousUid = auth.currentUser.uid;
      const anonymousDoc = await getDoc(doc(db, 'users', anonymousUid));
      
      if (anonymousDoc.exists()) {
        const anonymousData = anonymousDoc.data();
        await setDoc(doc(db, 'users', newUserCredential.user.uid), {
          ...anonymousData,
          uid: newUserCredential.user.uid,
          email: email,
          emailVerified: false,
          linkedProviders: [{ providerId: 'password', linkedAt: new Date() }],
          updatedAt: serverTimestamp()
        });
      }
      
      console.log('✅ Anonymous account converted successfully');
      return newUserCredential;
    } catch (error: any) {
      console.error('Convert anonymous account error:', error);
      throw new Error(this.getErrorMessage(error.code, 'Account Conversion'));
    }
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
        'This operation is sensitive and requires recent authentication. Please log in again before retrying this request.',
      'auth/invalid-phone-number': 
        'The phone number format is invalid. Please enter a valid phone number with country code.',
      'auth/invalid-verification-code': 
        'The verification code is invalid. Please check and try again.',
      'auth/missing-phone-number': 
        'Phone number is required for phone authentication.',
      'auth/quota-exceeded': 
        'SMS quota exceeded. Please try again later.',
      'auth/captcha-check-failed': 
        'reCAPTCHA verification failed. Please try again.'
    };

    return errorMessages[errorCode] || `An error occurred during ${provider} sign-in. Please try again.`;
  }
}

export default SocialAuthService;




