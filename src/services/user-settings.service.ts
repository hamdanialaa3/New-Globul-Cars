// User Settings Service
// Manage user preferences, privacy, notifications, and account settings
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import { 
  collection,
  doc, 
  getDoc, 
  getDocs,
  query,
  setDoc, 
  updateDoc, 
  serverTimestamp,
  Timestamp,
  where 
} from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { serviceLogger } from './logger-service';
import { queryAllCollections } from './search/multi-collection-helper';

// ==================== INTERFACES ====================

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  marketing: boolean;
  newMessages: boolean;
  priceAlerts: boolean;
  favoriteUpdates: boolean;
  newListings: boolean;
  promotions: boolean;
  newsletter: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'registered' | 'private';
  showPhone: boolean;
  showEmail: boolean;
  showLastSeen: boolean;
  allowMessages: boolean;
  allowCallbacks: boolean;
  showActivity: boolean;
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'auto';
  currency: 'EUR';
  dateFormat: 'dd/mm/yyyy' | 'mm/dd/yyyy';
  compactView: boolean;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  loginAlerts: boolean;
  sessionTimeout: number; // minutes
}

export interface CarPreferences {
  favoriteMarks: string[];
  favoriteModels: string[];
  priceRange: { min: number; max: number };
  searchRadius: number; // km
}

export interface UserSettings {
  // Account Info
  email: string;
  phone: string;
  language: 'bg' | 'en';
  displayName: string;
  bio: string;
  
  // Preferences
  notifications: NotificationPreferences;
  privacy: PrivacySettings;
  appearance: AppearanceSettings;
  security: SecuritySettings;
  carPreferences: CarPreferences;
  
  // Metadata
  updatedAt?: Timestamp;
  createdAt?: Timestamp;
}

// Default settings
export const DEFAULT_USER_SETTINGS: Omit<UserSettings, 'email' | 'phone' | 'displayName'> = {
  language: 'bg',
  bio: '',
  notifications: {
    email: true,
    sms: false,
    push: true,
    marketing: false,
    newMessages: true,
    priceAlerts: true,
    favoriteUpdates: true,
    newListings: false,
    promotions: false,
    newsletter: false,
  },
  privacy: {
    profileVisibility: 'public',
    showPhone: true,
    showEmail: false,
    showLastSeen: true,
    allowMessages: true,
    allowCallbacks: true,
    showActivity: true,
  },
  appearance: {
    theme: 'dark',
    currency: 'EUR',
    dateFormat: 'dd/mm/yyyy',
    compactView: false,
  },
  security: {
    twoFactorEnabled: false,
    loginAlerts: true,
    sessionTimeout: 30,
  },
  carPreferences: {
    favoriteMarks: [],
    favoriteModels: [],
    priceRange: { min: 0, max: 100000 },
    searchRadius: 50,
  },
};

// ==================== SERVICE CLASS ====================

class UserSettingsService {
  private static instance: UserSettingsService;
  
  private constructor() {}
  
  public static getInstance(): UserSettingsService {
    if (!UserSettingsService.instance) {
      UserSettingsService.instance = new UserSettingsService();
    }
    return UserSettingsService.instance;
  }

  /**
   * Get user settings
   * استرجاع إعدادات المستخدم
   */
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    try {
      // ✅ CRITICAL FIX: Guard against null/undefined userId
      if (!userId || typeof userId !== 'string' || userId.trim() === '') {
        serviceLogger.warn('getUserSettings called with invalid userId', { userId });
        return null;
      }

      const settingsRef = doc(db, 'userSettings', userId);
      const settingsSnap = await getDoc(settingsRef);

      if (settingsSnap.exists()) {
        return settingsSnap.data() as UserSettings;
      }

      // If no settings exist, create default settings
      const defaultSettings: UserSettings = {
        ...DEFAULT_USER_SETTINGS,
        email: '',
        phone: '',
        displayName: '',
        createdAt: Timestamp.now(),
      };

      await this.saveUserSettings(userId, defaultSettings);
      return defaultSettings;
    } catch (error) {
      serviceLogger.error('Error getting user settings', error as Error, { userId });
      return null;
    }
  }

  /**
   * Save user settings
   * حفظ إعدادات المستخدم
   */
  async saveUserSettings(userId: string, settings: Partial<UserSettings>): Promise<boolean> {
    try {
      // ✅ CRITICAL FIX: Guard against null/undefined userId
      if (!userId || typeof userId !== 'string' || userId.trim() === '') {
        serviceLogger.warn('saveUserSettings called with invalid userId', { userId });
        return false;
      }

      const settingsRef = doc(db, 'userSettings', userId);
      const existingSettings = await this.getUserSettings(userId);

      if (existingSettings) {
        // Update existing settings
        await updateDoc(settingsRef, {
          ...settings,
          updatedAt: serverTimestamp(),
        });
      } else {
        // Create new settings
        await setDoc(settingsRef, {
          ...DEFAULT_USER_SETTINGS,
          ...settings,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      serviceLogger.info('User settings saved successfully', { userId });
      return true;
    } catch (error) {
      serviceLogger.error('Error saving user settings', error as Error, { userId });
      return false;
    }
  }

  /**
   * Update notification preferences
   * تحديث تفضيلات الإشعارات
   */
  async updateNotifications(
    userId: string, 
    notifications: Partial<NotificationPreferences>
  ): Promise<boolean> {
    try {
      if (!userId || typeof userId !== 'string' || userId.trim() === '') {
        serviceLogger.warn('updateNotifications called with invalid userId', { userId });
        return false;
      }

      const settingsRef = doc(db, 'userSettings', userId);
      await updateDoc(settingsRef, {
        notifications,
        updatedAt: serverTimestamp(),
      });

      serviceLogger.info('Notification preferences updated', { userId });
      return true;
    } catch (error) {
      serviceLogger.error('Error updating notification preferences', error as Error, { userId });
      return false;
    }
  }

  /**
   * Update privacy settings
   * تحديث إعدادات الخصوصية
   */
  async updatePrivacy(
    userId: string, 
    privacy: Partial<PrivacySettings>
  ): Promise<boolean> {
    try {
      if (!userId || typeof userId !== 'string' || userId.trim() === '') {
        serviceLogger.warn('updatePrivacy called with invalid userId', { userId });
        return false;
      }

      const settingsRef = doc(db, 'userSettings', userId);
      await updateDoc(settingsRef, {
        privacy,
        updatedAt: serverTimestamp(),
      });

      serviceLogger.info('Privacy settings updated', { userId });
      return true;
    } catch (error) {
      serviceLogger.error('Error updating privacy settings', error as Error, { userId });
      return false;
    }
  }

  /**
   * Update appearance settings
   * تحديث إعدادات المظهر
   */
  async updateAppearance(
    userId: string, 
    appearance: Partial<AppearanceSettings>
  ): Promise<boolean> {
    try {
      if (!userId || typeof userId !== 'string' || userId.trim() === '') {
        serviceLogger.warn('updateAppearance called with invalid userId', { userId });
        return false;
      }

      const settingsRef = doc(db, 'userSettings', userId);
      await updateDoc(settingsRef, {
        appearance,
        updatedAt: serverTimestamp(),
      });

      serviceLogger.info('Appearance settings updated', { userId });
      return true;
    } catch (error) {
      serviceLogger.error('Error updating appearance settings', error as Error, { userId });
      return false;
    }
  }

  /**
   * Update security settings
   * تحديث إعدادات الأمان
   */
  async updateSecurity(
    userId: string, 
    security: Partial<SecuritySettings>
  ): Promise<boolean> {
    try {
      if (!userId || typeof userId !== 'string' || userId.trim() === '') {
        serviceLogger.warn('updateSecurity called with invalid userId', { userId });
        return false;
      }

      const settingsRef = doc(db, 'userSettings', userId);
      await updateDoc(settingsRef, {
        security,
        updatedAt: serverTimestamp(),
      });

      serviceLogger.info('Security settings updated', { userId });
      return true;
    } catch (error) {
      serviceLogger.error('Error updating security settings', error as Error, { userId });
      return false;
    }
  }

  /**
   * Update car preferences
   * تحديث تفضيلات السيارات
   */
  async updateCarPreferences(
    userId: string, 
    carPreferences: Partial<CarPreferences>
  ): Promise<boolean> {
    try {
      if (!userId || typeof userId !== 'string' || userId.trim() === '') {
        serviceLogger.warn('updateCarPreferences called with invalid userId', { userId });
        return false;
      }

      const settingsRef = doc(db, 'userSettings', userId);
      await updateDoc(settingsRef, {
        carPreferences,
        updatedAt: serverTimestamp(),
      });

      serviceLogger.info('Car preferences updated', { userId });
      return true;
    } catch (error) {
      serviceLogger.error('Error updating car preferences', error as Error, { userId });
      return false;
    }
  }

  /**
   * Export user data (for GDPR compliance)
   * تصدير بيانات المستخدم
   */
  async exportUserData(userId: string): Promise<any> {
    try {
      if (!userId || typeof userId !== 'string' || userId.trim() === '') {
        serviceLogger.warn('exportUserData called with invalid userId', { userId });
        return null;
      }

      const settings = await this.getUserSettings(userId);

      const [carsSnapshot, favoritesSnapshot, messagesSent, messagesReceived, notificationsSnapshot, reviewsSnapshot] = await Promise.all([
        queryAllCollections(where('sellerId', '==', userId)).catch(() => ({ docs: [] })),
        getDocs(query(collection(db, 'favorites'), where('userId', '==', userId))).catch(() => ({ docs: [] })),
        getDocs(query(collection(db, 'messages'), where('senderId', '==', userId))).catch(() => ({ docs: [] })),
        getDocs(query(collection(db, 'messages'), where('recipientId', '==', userId))).catch(() => ({ docs: [] })),
        getDocs(query(collection(db, 'notifications'), where('userId', '==', userId))).catch(() => ({ docs: [] })),
        getDocs(query(collection(db, 'reviews'), where('authorId', '==', userId))).catch(() => ({ docs: [] }))
      ]);

      const exportData = {
        settings,
        listings: carsSnapshot.docs?.map((doc: any) => ({ id: doc.id, ...doc.data() })) || [],
        favorites: favoritesSnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })),
        messages: [
          ...messagesSent.docs.map((doc: any) => ({ id: doc.id, direction: 'sent', ...doc.data() })),
          ...messagesReceived.docs.map((doc: any) => ({ id: doc.id, direction: 'received', ...doc.data() }))
        ],
        notifications: notificationsSnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })),
        reviewsAuthored: reviewsSnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })),
        exportDate: new Date().toISOString(),
        exportVersion: '1.1',
      };

      serviceLogger.info('User data exported', { userId });
      return exportData;
    } catch (error) {
      serviceLogger.error('Error exporting user data', error as Error, { userId });
      return null;
    }
  }
}

// Export singleton instance
export const userSettingsService = UserSettingsService.getInstance();
export default userSettingsService;
