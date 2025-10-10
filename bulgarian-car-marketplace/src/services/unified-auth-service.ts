// Unified Authentication Service
// Handles all 3 auth methods: Email/Password, Google, Facebook
// Auto-syncs to Firestore for ALL methods

import { SocialAuthService } from '../firebase/social-auth-service';
import { User, UserCredential } from 'firebase/auth';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';

export interface AuthMethod {
  type: 'email' | 'google' | 'facebook';
  providerId: string;
  displayName: string;
}

export interface UnifiedAuthResult {
  user: User;
  credential: UserCredential;
  isNewUser: boolean;
  authMethod: AuthMethod;
  firestoreSynced: boolean;
}

class UnifiedAuthService {
  private static instance: UnifiedAuthService;

  public static getInstance(): UnifiedAuthService {
    if (!UnifiedAuthService.instance) {
      UnifiedAuthService.instance = new UnifiedAuthService();
    }
    return UnifiedAuthService.instance;
  }

  /**
   * Register with Email/Password
   * Auto-syncs to Firestore
   */
  async registerWithEmail(
    email: string, 
    password: string, 
    displayName?: string
  ): Promise<UnifiedAuthResult> {
    try {
      console.log('📧 Registering with Email/Password...');
      
      // Create Firebase Auth user
      const credential = await SocialAuthService.createUserWithEmailAndPassword(email, password);
      
      // Update display name if provided
      if (displayName) {
        await SocialAuthService.updateUserProfile({ displayName });
      }
      
      // Firestore sync happens automatically in SocialAuthService
      
      return {
        user: credential.user,
        credential,
        isNewUser: true,
        authMethod: {
          type: 'email',
          providerId: 'password',
          displayName: 'Email/Password'
        },
        firestoreSynced: true
      };
    } catch (error: any) {
      console.error('❌ Email registration failed:', error);
      throw error;
    }
  }

  /**
   * Login with Email/Password
   * Auto-syncs to Firestore
   */
  async loginWithEmail(email: string, password: string): Promise<UnifiedAuthResult> {
    try {
      console.log('📧 Logging in with Email/Password...');
      
      const credential = await SocialAuthService.signInWithEmailAndPassword(email, password);
      
      // Firestore sync happens automatically in SocialAuthService
      
      return {
        user: credential.user,
        credential,
        isNewUser: false,
        authMethod: {
          type: 'email',
          providerId: 'password',
          displayName: 'Email/Password'
        },
        firestoreSynced: true
      };
    } catch (error: any) {
      console.error('❌ Email login failed:', error);
      throw error;
    }
  }

  /**
   * Login with Google
   * Auto-syncs to Firestore
   */
  async loginWithGoogle(): Promise<UnifiedAuthResult> {
    try {
      console.log('🔴 Logging in with Google...');
      
      const credential = await SocialAuthService.signInWithGoogle();
      
      // Check if new user
      const userDoc = await getDoc(doc(db, 'users', credential.user.uid));
      const isNewUser = !userDoc.exists();
      
      // Firestore sync happens automatically in SocialAuthService
      
      return {
        user: credential.user,
        credential,
        isNewUser,
        authMethod: {
          type: 'google',
          providerId: 'google.com',
          displayName: 'Google'
        },
        firestoreSynced: true
      };
    } catch (error: any) {
      console.error('❌ Google login failed:', error);
      throw error;
    }
  }

  /**
   * Login with Facebook
   * Auto-syncs to Firestore
   */
  async loginWithFacebook(): Promise<UnifiedAuthResult> {
    try {
      console.log('🔵 Logging in with Facebook...');
      
      const credential = await SocialAuthService.signInWithFacebook();
      
      // Check if new user
      const userDoc = await getDoc(doc(db, 'users', credential.user.uid));
      const isNewUser = !userDoc.exists();
      
      // Firestore sync happens automatically in SocialAuthService
      
      return {
        user: credential.user,
        credential,
        isNewUser,
        authMethod: {
          type: 'facebook',
          providerId: 'facebook.com',
          displayName: 'Facebook'
        },
        firestoreSynced: true
      };
    } catch (error: any) {
      console.error('❌ Facebook login failed:', error);
      throw error;
    }
  }

  /**
   * Get user authentication methods
   */
  async getUserAuthMethods(userId: string): Promise<AuthMethod[]> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (!userDoc.exists()) {
        return [];
      }
      
      const userData = userDoc.data();
      const providers = userData.linkedProviders || [];
      
      return providers.map((provider: any) => ({
        type: this.getAuthTypeFromProvider(provider.providerId),
        providerId: provider.providerId,
        displayName: this.getProviderDisplayName(provider.providerId)
      }));
    } catch (error) {
      console.error('Error getting auth methods:', error);
      return [];
    }
  }

  /**
   * Update last login time
   */
  async updateLastLogin(userId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.warn('Could not update last login:', error);
    }
  }

  /**
   * Get user statistics from Firestore
   */
  async getUserStats(userId: string): Promise<any> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (!userDoc.exists()) {
        return null;
      }
      
      const userData = userDoc.data();
      
      return {
        totalLogins: userData.loginCount || 0,
        lastLogin: userData.lastLoginAt?.toDate() || null,
        createdAt: userData.createdAt?.toDate() || null,
        emailVerified: userData.emailVerified || false,
        phoneVerified: userData.verification?.phone || false,
        linkedProviders: userData.linkedProviders || [],
        isDealer: userData.isDealer || false
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return null;
    }
  }

  // Helper methods
  private getAuthTypeFromProvider(providerId: string): 'email' | 'google' | 'facebook' {
    if (providerId.includes('google')) return 'google';
    if (providerId.includes('facebook')) return 'facebook';
    return 'email';
  }

  private getProviderDisplayName(providerId: string): string {
    const map: { [key: string]: string } = {
      'password': 'Email/Password',
      'google.com': 'Google',
      'facebook.com': 'Facebook',
      'apple.com': 'Apple'
    };
    return map[providerId] || providerId;
  }
}

export const unifiedAuthService = UnifiedAuthService.getInstance();

