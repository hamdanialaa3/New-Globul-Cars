// src/firebase/auth-service.ts
// Bulgarian Authentication Service for Car Marketplace
// Phase -1: Updated to use canonical types

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  OAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  User,
  updateProfile,
  sendPasswordResetEmail,
  applyActionCode,
  sendEmailVerification,
  UserCredential
} from 'firebase/auth';
import { logger } from '../services/logger-service';
import { doc, setDoc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { auth, db, BulgarianFirebaseUtils } from './firebase-config';
import { TrustLevel, Badge } from '../services/profile/trust-score-service';
// ✅ Import and re-export from canonical source
import { BulgarianUser } from '../types/user/bulgarian-user.types';
export type { BulgarianUser };

/**
 * @deprecated Local BulgarianUser definition is deprecated
 * Use BulgarianUser from '../types/user/bulgarian-user.types' instead
 * This interface is kept only for migration period (will be removed in Phase 4)
 * 
 * OLD definition below - please use canonical type above
 */
export interface BulgarianUserLegacy {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  photoURL?: string;
  bio?: string;
  preferredLanguage: 'bg' | 'en';

  // Account Type (Legacy - keep for backward compatibility)
  accountType?: 'individual' | 'business';

  // NEW: Profile Type System (replaces accountType)
  profileType?: 'private' | 'dealer' | 'company';  // Default: 'private'

  // Personal Information (Individual)
  firstName?: string;
  lastName?: string;
  middleName?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  address?: string;
  postalCode?: string;

  // Business Information
  businessName?: string;
  bulstat?: string;
  vatNumber?: string;
  businessType?: 'dealership' | 'trader' | 'company';
  registrationNumber?: string;
  businessAddress?: string;
  businessCity?: string;
  businessPostalCode?: string;
  website?: string;
  businessPhone?: string;
  businessEmail?: string;
  workingHours?: string;
  businessDescription?: string;

  // Images
  profileImage?: {
    url: string;
    uploadedAt: Date;
    thumbnailUrl?: string;
  };
  coverImage?: {
    url: string;
    uploadedAt: Date;
    thumbnailUrl?: string;
  };
  gallery?: Array<{
    url: string;
    uploadedAt: Date;
    caption?: string;
  }>;

  // Verification System (Enhanced for Profile Types)
  verification?: {
    // Verification Level: none → basic → business → company
    level?: 'none' | 'basic' | 'business' | 'company';  // NEW
    status?: 'pending' | 'in_review' | 'approved' | 'rejected';  // NEW
    submittedAt?: Date;  // NEW
    reviewedAt?: Date;  // NEW
    reviewerId?: string;  // NEW - admin who reviewed
    notes?: string;  // NEW - admin notes

    email?: {
      verified: boolean;
      verifiedAt?: Date;
    };
    phone?: {
      verified: boolean;
      verifiedAt?: Date;
      phoneNumber?: string;
    };
    identity?: {
      verified: boolean;
      verifiedAt?: Date;
      documentType?: string;
    };
    business?: {
      verified: boolean;
      verifiedAt?: Date;
      documents?: string[];
    };

    // Documents (for verification workflow)
    documents?: Array<{  // NEW
      type: string;  // 'eik', 'vat', 'license', 'id'
      url: string;
      uploadedAt: Date;
      verifiedAt?: Date;
      status: 'pending' | 'approved' | 'rejected';
    }>;

    trustScore?: number;
    level_old?: TrustLevel;  // Renamed to avoid conflict
    badges?: Badge[];
  };

  // NEW: Subscription Plan
  plan?: {
    tier: 'free' | 'premium' | 'dealer_basic' | 'dealer_pro' | 'dealer_enterprise' |
    'company_starter' | 'company_pro' | 'company_enterprise' | 'custom';
    status: 'active' | 'trial' | 'past_due' | 'canceled';
    renewsAt?: Date;
    trialEndsAt?: Date;
  };

  // NEW: Trust Score (separate from verification)
  trust?: {
    score: number;  // 0-100
    reviewsCount: number;
    positivePercent: number;  // 0-1
  };

  // Statistics
  stats?: {
    carsListed?: number;
    carsSold?: number;
    totalViews?: number;
    responseTime?: number;
    responseRate?: number;
    totalMessages?: number;
    averageRating?: number;
    totalReviews?: number;
    followers?: number;
    following?: number;
  };

  // Rating (for sellers)
  rating?: {
    average: number;
    total: number;
  };

  location?: {
    city: string;
    region: string;
    postalCode: string;
  };

  profile: {
    isDealer: boolean;
    companyName?: string;
    taxNumber?: string;
    dealerLicense?: string;
    preferredCurrency: string;
    timezone: string;
  };

  preferences: {
    notifications: boolean;
    marketingEmails: boolean;
    language: 'bg' | 'en';
  };

  createdAt: Date;
  lastLoginAt: Date;
  isVerified: boolean;
  emailVerified?: boolean;
}

// Bulgarian Authentication Service
export class BulgarianAuthService {
  private static instance: BulgarianAuthService;

  private constructor() {
    // Initialize auth state listener
    this.initializeAuthStateListener();
  }

  // Helper method to safely extract error code
  private getErrorCode(error: unknown): string {
    // Firebase Auth errors have a 'code' property
    if (error && typeof error === 'object') {
      // Check for FirebaseError code property
      if ('code' in error && typeof (error as any).code === 'string') {
        return (error as any).code;
      }
      // Check for (error as Error).message which might contain the code
      if ('message' in error && typeof (error as any).message === 'string') {
        const message = (error as any).message;
        // Extract auth/xxx pattern from message
        const codeMatch = message.match(/auth\/[a-z-]+/i);
        if (codeMatch) {
          return codeMatch[0];
        }
      }
    }
    return 'unknown';
  }

  static getInstance(): BulgarianAuthService {
    if (!BulgarianAuthService.instance) {
      BulgarianAuthService.instance = new BulgarianAuthService();
    }
    return BulgarianAuthService.instance;
  }

  // Initialize auth state listener
  private initializeAuthStateListener(): void {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Update last login time
        await this.updateLastLogin(user.uid);
      }
    });
  }

  // Sign up with email and password
  async signUp(
    email: string,
    password: string,
    userData: Partial<BulgarianUser>
  ): Promise<UserCredential> {
    try {
      // Validate Bulgarian email format
      if (!this.validateBulgarianEmail(email)) {
        throw new Error('Невалиден имейл формат. Моля използвайте валиден български имейл адрес.');
      }

      // Validate password strength
      if (!this.validatePasswordStrength(password)) {
        throw new Error('Паролата трябва да съдържа поне 8 символа, главна буква, малка буква и цифра.');
      }

      // Create user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Create Bulgarian user profile
      const bulgarianUser: BulgarianUser = {
        uid: userCredential.user.uid,
        email: userCredential.user.email!,
        displayName: userData.displayName || '',
        phoneNumber: userData.phoneNumber,
        phoneCountryCode: '+359',
        preferredLanguage: userData.preferredLanguage || 'bg',
        currency: 'EUR',
        profileType: 'private', // Default for new signups
        planTier: 'free',
        permissions: {
          canAddListings: true,
          maxListings: 3,
          maxMonthlyListings: 3,
          canEditLockedFields: false,
          maxFlexEditsPerMonth: 0,
          canBulkUpload: false,
          bulkUploadLimit: 0,
          canCloneListing: false,
          hasAnalytics: false,
          hasAdvancedAnalytics: false,
          hasTeam: false,
          canExportData: false,
          hasPrioritySupport: false,
          canUseQuickReplies: false,
          canBulkEdit: false,
          canImportCSV: false,
          canUseAPI: false,
          themeMode: 'standard'
        },
        verification: {
          email: userCredential.user.emailVerified,
          phone: !!userData.phoneNumber,
          id: false,
          business: false
        },
        stats: {
          totalListings: 0,
          activeListings: 0,
          totalViews: 0,
          totalMessages: 0,
          trustScore: 10
        },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        lastLoginAt: Timestamp.now(),
        isActive: true,
        isBanned: false
      };

      // Save user profile to Firestore
      await this.saveUserProfile(bulgarianUser);

      // Send email verification
      await sendEmailVerification(userCredential.user, {
        url: `${window.location.origin}/verify-email`,
        handleCodeInApp: true
      });

      return userCredential;
    } catch (error: unknown) {
      throw this.handleAuthError(error);
    }
  }

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<UserCredential> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Update last login (non-blocking - don't fail login if this fails)
      try {
        await this.updateLastLogin(userCredential.user.uid);
      } catch (updateError) {
        // Log but don't throw - login was successful
        logger.warn('Failed to update last login timestamp', { error: updateError });
      }

      return userCredential;
    } catch (error: unknown) {
      logger.error('Sign in error:', error as Error);
      throw this.handleAuthError(error);
    }
  }

  // Sign in with Google
  async signInWithGoogle(): Promise<UserCredential> {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      const result = await signInWithPopup(auth, provider);

      // Check if user exists, if not create Bulgarian profile
      const userExists = await this.userExists(result.user.uid);
      if (!userExists) {
        await this.createUserFromSocialLogin(result.user, 'google');
      } else {
        await this.updateLastLogin(result.user.uid);
      }

      return result;
    } catch (error: unknown) {
      throw this.handleAuthError(error);
    }
  }

  // Sign in with Facebook
  async signInWithFacebook(): Promise<UserCredential> {
    try {
      const provider = new FacebookAuthProvider();
      provider.setCustomParameters({
        display: 'popup'
      });

      const result = await signInWithPopup(auth, provider);

      // Check if user exists, if not create Bulgarian profile
      const userExists = await this.userExists(result.user.uid);
      if (!userExists) {
        await this.createUserFromSocialLogin(result.user, 'facebook');
      } else {
        await this.updateLastLogin(result.user.uid);
      }

      return result;
    } catch (error: unknown) {
      throw this.handleAuthError(error);
    }
  }

  // Sign in with Twitter
  async signInWithTwitter(): Promise<UserCredential> {
    try {
      const provider = new TwitterAuthProvider();

      const result = await signInWithPopup(auth, provider);

      // Check if user exists, if not create Bulgarian profile
      const userExists = await this.userExists(result.user.uid);
      if (!userExists) {
        await this.createUserFromSocialLogin(result.user, 'twitter');
      } else {
        await this.updateLastLogin(result.user.uid);
      }

      return result;
    } catch (error: unknown) {
      throw this.handleAuthError(error);
    }
  }

  // Sign in with Microsoft
  async signInWithMicrosoft(): Promise<UserCredential> {
    try {
      const provider = new OAuthProvider('microsoft.com');
      provider.addScope('email');
      provider.addScope('profile');
      provider.addScope('openid');

      const result = await signInWithPopup(auth, provider);

      // Check if user exists, if not create Bulgarian profile
      const userExists = await this.userExists(result.user.uid);
      if (!userExists) {
        await this.createUserFromSocialLogin(result.user, 'microsoft');
      } else {
        await this.updateLastLogin(result.user.uid);
      }

      return result;
    } catch (error: unknown) {
      throw this.handleAuthError(error);
    }
  }

  // Sign in with Apple
  async signInWithApple(): Promise<UserCredential> {
    try {
      const provider = new OAuthProvider('apple.com');
      provider.addScope('email');
      provider.addScope('name');

      const result = await signInWithPopup(auth, provider);

      // Check if user exists, if not create Bulgarian profile
      const userExists = await this.userExists(result.user.uid);
      if (!userExists) {
        await this.createUserFromSocialLogin(result.user, 'apple');
      } else {
        await this.updateLastLogin(result.user.uid);
      }

      return result;
    } catch (error: unknown) {
      throw this.handleAuthError(error);
    }
  }

  // Sign in with iCloud
  async signInWithICloud(): Promise<UserCredential> {
    try {
      const provider = new OAuthProvider('apple.com');
      provider.addScope('email');
      provider.addScope('name');

      const result = await signInWithPopup(auth, provider);

      // Check if user exists, if not create Bulgarian profile
      const userExists = await this.userExists(result.user.uid);
      if (!userExists) {
        await this.createUserFromSocialLogin(result.user, 'icloud');
      } else {
        await this.updateLastLogin(result.user.uid);
      }

      return result;
    } catch (error: unknown) {
      throw this.handleAuthError(error);
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: unknown) {
      throw this.handleAuthError(error);
    }
  }

  // Get current user profile
  async getCurrentUserProfile(): Promise<BulgarianUser | null> {
    try {
      const user = auth.currentUser;
      if (!user) return null;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        return userDoc.data() as BulgarianUser;
      }
      return null;
    } catch (error: unknown) {
      throw this.handleAuthError(error);
    }
  }

  // Get any user profile by ID (for viewing other users' profiles)
  async getUserProfileById(userId: string): Promise<BulgarianUser | null> {
    try {
      if (!userId) return null;

      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data() as BulgarianUser;
      }
      return null;
    } catch (error: unknown) {
      logger.error('Error fetching user profile by ID', error as Error, { userId });
      throw this.handleAuthError(error);
    }
  }

  // Update user profile
  async updateUserProfile(updates: Partial<BulgarianUser>): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Няма активен потребител');

      // Validate Bulgarian phone if provided
      if (updates.phoneNumber && !BulgarianFirebaseUtils.validateBulgarianPhone(updates.phoneNumber)) {
        throw new Error('Невалиден български телефонен номер');
      }

      /*
      // Validate Bulgarian postal code if provided
      if (updates.location?.postalCode && !BulgarianFirebaseUtils.validateBulgarianPostalCode(updates.location.postalCode)) {
        throw new Error('Невалиден пощенски код');
      }
      */

      // Update Firebase Auth profile
      if (updates.displayName || updates.photoURL) {
        await updateProfile(user, {
          displayName: updates.displayName,
          photoURL: updates.photoURL
        });
      }

      // Update Firestore profile
      await updateDoc(doc(db, 'users', user.uid), {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error: unknown) {
      throw this.handleAuthError(error);
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/reset-password`,
        handleCodeInApp: true
      });
    } catch (error: unknown) {
      throw this.handleAuthError(error);
    }
  }

  // Verify email
  async verifyEmail(actionCode: string): Promise<void> {
    try {
      await applyActionCode(auth, actionCode);

      // Update user verification status
      const user = auth.currentUser;
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          isVerified: true,
          verifiedAt: new Date()
        });
      }
    } catch (error: unknown) {
      throw this.handleAuthError(error);
    }
  }

  // Private helper methods
  private async saveUserProfile(user: BulgarianUser): Promise<void> {
    await setDoc(doc(db, 'users', user.uid), user);
  }

  private async userExists(uid: string): Promise<boolean> {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists();
  }

  private async updateLastLogin(uid: string): Promise<void> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return; // Nothing to do

      const userRef = doc(db, 'users', uid);
      const snapshot = await getDoc(userRef);

      if (snapshot.exists()) {
        // Merge only mutable fields; avoid overwriting createdAt or other profile data
        await setDoc(userRef, {
          lastLoginAt: Timestamp.now(),
          verification: {
            ...((snapshot.data() as any).verification || {}),
            email: currentUser.emailVerified || false
          }
        }, { merge: true });
      } else {
        // Create minimal compliant doc
        await this.createUserFromSocialLogin(currentUser, 'system');
      }
    } catch (error) {
      logger.error('Error updating last login', error as Error, { uid });
      // Don't throw error to prevent breaking the auth flow
    }
  }

  private async createUserFromSocialLogin(user: User, provider: string): Promise<void> {
    const bulgarianUser: BulgarianUser = {
      uid: user.uid,
      email: user.email!,
      displayName: user.displayName || '',
      photoURL: user.photoURL || undefined,
      phoneCountryCode: '+359',
      preferredLanguage: 'bg',
      currency: 'EUR',
      profileType: 'private',
      planTier: 'free',
      permissions: {
        canAddListings: true,
        maxListings: 3,
        maxMonthlyListings: 3,
        canEditLockedFields: false,
        maxFlexEditsPerMonth: 0,
        canBulkUpload: false,
        bulkUploadLimit: 0,
        canCloneListing: false,
        hasAnalytics: false,
        hasAdvancedAnalytics: false,
        hasTeam: false,
        canExportData: false,
        hasPrioritySupport: false,
        canUseQuickReplies: false,
        canBulkEdit: false,
        canImportCSV: false,
        canUseAPI: false,
        themeMode: 'standard'
      },
      verification: {
        email: user.emailVerified,
        phone: !!user.phoneNumber,
        id: false,
        business: false
      },
      stats: {
        totalListings: 0,
        activeListings: 0,
        totalViews: 0,
        totalMessages: 0,
        trustScore: 10
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      lastLoginAt: Timestamp.now(),
      isActive: true,
      isBanned: false
    };

    // Save user profile first
    await this.saveUserProfile(bulgarianUser);
    
    // ✅ FIX: Assign numeric ID for social auth users
    // This fixes the missing numericId bug from all 4 audit reports
    const { ensureUserNumericId } = await import('../services/numeric-id-assignment.service');
    const numericId = await ensureUserNumericId(user.uid);
    
    if (!numericId) {
      logger.error('Failed to assign numeric ID to social auth user', new Error('numericId assignment failed'), {
        uid: user.uid,
        provider,
        email: user.email
      });
    } else {
      logger.info('Numeric ID assigned to social auth user', {
        uid: user.uid,
        numericId,
        provider
      });
    }
  }

  private validateBulgarianEmail(email: string): boolean {
    // Basic email validation with Bulgarian domain preference
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private validatePasswordStrength(password: string): boolean {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  private handleAuthError(error: unknown): Error {
    try {
      const errorCode = this.getErrorCode(error);
      const errorMessages: { [key: string]: string } = {
        'auth/email-already-in-use': 'Този имейл вече е регистриран',
        'auth/weak-password': 'Паролата е твърде слаба',
        'auth/invalid-email': 'Невалиден имейл адрес',
        'auth/user-disabled': 'Този потребител е деактивиран',
        'auth/user-not-found': 'Потребителят не е намерен',
        'auth/wrong-password': 'Грешна парола',
        'auth/invalid-credential': 'Грешен имейл или парола',
        'auth/invalid-verification-code': 'Невалиден код за верификация',
        'auth/code-expired': 'Кодът за верификация е изтекъл',
        'auth/too-many-requests': 'Твърде много опити. Моля опитайте по-късно',
        'auth/network-request-failed': 'Проблем с интернет връзката',
        'auth/popup-closed-by-user': 'Прозорецът за вход беше затворен',
        'auth/cancelled-popup-request': 'Заявката беше отменена',
        'auth/operation-not-allowed': 'Операцията не е разрешена',
        'auth/requires-recent-login': 'Изисква се повторен вход за тази операция'
      };

      // Log the original error for debugging (safely)
      try {
        const errorDetails = new Error(`Auth error: ${errorCode}`);
        logger.error('Auth error details:', errorDetails, {
          errorCode,
          errorType: error instanceof Error ? error.constructor.name : typeof error,
          errorMessage: error instanceof Error ? (error as Error).message : String(error)
        });
      } catch (logError) {
        // If logging fails, continue anyway (do not use console in production)
        // Swallow to avoid noisy logs in production ban-console
      }

      // Get message or use default
      let bulgarianMessage = errorMessages[errorCode];
      
      // If no specific message, try to extract from original error
      if (!bulgarianMessage && error instanceof Error) {
        bulgarianMessage = (error as Error).message;
      }
      
      // Final fallback
      if (!bulgarianMessage) {
        bulgarianMessage = 'Възникна грешка при вход';
      }
      
      // Create new error with the Bulgarian message
      const handledError = new Error(bulgarianMessage);
      // Preserve original error code if available
      if (errorCode !== 'unknown' && error && typeof error === 'object' && 'code' in error) {
        (handledError as any).code = errorCode;
      }
      
      return handledError;
    } catch (handlingError) {
      // If handleAuthError itself fails, return a safe error
      logger.error('Error in handleAuthError:', handlingError as Error);
      return new Error('Възникна грешка при вход');
    }
  }
}

// Export singleton instance
export const bulgarianAuthService = BulgarianAuthService.getInstance();
