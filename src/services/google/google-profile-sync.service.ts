// src/services/google/google-profile-sync.service.ts
// Google Profile Auto-Sync Service
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import { User } from 'firebase/auth';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { serviceLogger } from '../logger-service';

interface GoogleProfileData {
  id: string;
  email: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
  verified_email: boolean;
}

class GoogleProfileSyncService {
  private static instance: GoogleProfileSyncService;
  
  private constructor() {}
  
  static getInstance(): GoogleProfileSyncService {
    if (!this.instance) {
      this.instance = new GoogleProfileSyncService();
    }
    return this.instance;
  }

  /**
   * Sync Google profile data to Firestore
   * مزامنة بيانات ملف Google الشخصي مع Firestore
   */
  async syncGoogleProfile(user: User): Promise<void> {
    try {
      if (process.env.NODE_ENV === 'development') {
        serviceLogger.info('Starting Google profile sync for user', { uid: user.uid });
      }
      
      // Get Google profile data
      const googleData = await this.getGoogleProfileData(user);
      
      if (!googleData) {
        serviceLogger.warn('No Google profile data available', { uid: user.uid });
        return;
      }

      // Update Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        // Profile image with high-res version
        profileImage: {
          url: googleData.picture,
          uploadedAt: new Date(),
          source: 'google',
          // Get higher resolution by replacing size parameter
          thumbnailUrl: googleData.picture.replace('=s96-c', '=s200-c'),
          highResUrl: googleData.picture.replace('=s96-c', '=s500-c')
        },
        
        // Personal info
        firstName: googleData.given_name,
        lastName: googleData.family_name,
        displayName: googleData.name,
        
        // Email verification status from Google
        'verification.email': {
          verified: googleData.verified_email,
          verifiedAt: googleData.verified_email ? new Date() : null,
          source: 'google'
        },
        
        // Language preference from Google
        preferredLanguage: this.mapGoogleLocale(googleData.locale),
        
        // Google sync metadata
        googleSync: {
          lastSyncAt: serverTimestamp(),
          googleId: googleData.id,
          locale: googleData.locale,
          syncVersion: '1.0'
        },
        
        // Update timestamp
        updatedAt: serverTimestamp()
      });

      if (process.env.NODE_ENV === 'development') {
        serviceLogger.info('Google profile synced successfully', { uid: user.uid });
      }
    } catch (error) {
      serviceLogger.error('Google profile sync error', error as Error, { uid: user.uid });
      throw error;
    }
  }

  /**
   * Get Google profile data using OAuth token
   */
  private async getGoogleProfileData(user: User): Promise<GoogleProfileData | null> {
    try {
      const token = await user.getIdToken();
      
      const response = await fetch(
        'https://www.googleapis.com/oauth2/v1/userinfo?alt=json',
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Google API error: ${response.status}`);
      }

      const data: GoogleProfileData = await response.json();
      return data;
    } catch (error) {
      serviceLogger.error('Error fetching Google profile data', error as Error);
      return null;
    }
  }

  /**
   * Check if profile needs sync (call this periodically)
   */
  async shouldSync(userId: string): Promise<boolean> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();
      
      if (!userData?.googleSync?.lastSyncAt) {
        return true; // Never synced
      }

      const lastSync = userData.googleSync.lastSyncAt.toDate();
      const daysSinceSync = (Date.now() - lastSync.getTime()) / (1000 * 60 * 60 * 24);
      
      // Sync every 7 days
      return daysSinceSync > 7;
    } catch (error) {
      serviceLogger.error('Error checking sync status', error as Error, { userId });
      return false;
    }
  }

  /**
   * Force sync profile
   */
  async forceSyncProfile(user: User): Promise<void> {
    await this.syncGoogleProfile(user);
  }

  /**
   * Map Google locale to our supported languages
   */
  private mapGoogleLocale(locale: string): 'bg' | 'en' {
    if (locale.startsWith('bg')) return 'bg';
    return 'en';
  }
}

export const googleProfileSyncService = GoogleProfileSyncService.getInstance();

