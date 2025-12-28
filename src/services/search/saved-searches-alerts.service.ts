/**
 * Saved Searches & Alerts Service
 * Handles saved searches, email notifications, and push alerts
 * 
 * Features:
 * - Save search criteria for future use
 * - Email notifications when matching cars appear
 * - Push notifications for saved searches
 * - Search history management
 */

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  getDocs,
  serverTimestamp,
  Timestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';
import { logger } from '@/services/logger-service';

// ====================================
// Types & Interfaces
// ====================================

export interface SavedSearch {
  id?: string;
  userId: string;
  name: string;
  searchQuery: SearchCriteria;
  notificationEnabled: boolean;
  emailNotification: boolean;
  pushNotification: boolean;
  lastNotificationSent?: Timestamp;
  matchCount?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface SearchCriteria {
  make?: string;
  model?: string;
  yearFrom?: number;
  yearTo?: number;
  priceFrom?: number;
  priceTo?: number;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
  city?: string;
  mileageMax?: number;
  keywords?: string;
}

export interface SearchAlert {
  id?: string;
  savedSearchId: string;
  userId: string;
  carId: string;
  carTitle: string;
  carPrice: number;
  carImage?: string;
  notificationSent: boolean;
  emailSent: boolean;
  pushSent: boolean;
  createdAt: Timestamp;
  sentAt?: Timestamp;
}

export interface NotificationPreferences {
  userId: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  frequency: 'instant' | 'daily' | 'weekly';
  quietHoursEnabled: boolean;
  quietHoursStart?: string; // "22:00"
  quietHoursEnd?: string; // "08:00"
  maxAlertsPerDay: number;
}

// ====================================
// Service Class
// ====================================

class SavedSearchesAlertsService {
  private static instance: SavedSearchesAlertsService;

  private constructor() {}

  static getInstance(): SavedSearchesAlertsService {
    if (!this.instance) {
      this.instance = new SavedSearchesAlertsService();
    }
    return this.instance;
  }

  // ====================================
  // Saved Searches Management
  // ====================================

  /**
   * Save a new search for future use
   */
  async saveSearch(
    userId: string,
    name: string,
    searchCriteria: SearchCriteria,
    notificationEnabled: boolean = false,
    emailNotification: boolean = false,
    pushNotification: boolean = false
  ): Promise<string> {
    try {
      logger.info('Saving search', { userId, name, searchCriteria });

      const savedSearch: Omit<SavedSearch, 'id'> = {
        userId,
        name,
        searchQuery: searchCriteria,
        notificationEnabled,
        emailNotification,
        pushNotification,
        matchCount: 0,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp
      };

      const docRef = await addDoc(collection(db, 'saved_searches'), savedSearch);
      
      logger.info('Search saved successfully', { searchId: docRef.id });
      return docRef.id;
    } catch (error) {
      logger.error('Failed to save search', error as Error, { userId, name });
      throw error;
    }
  }

  /**
   * Get all saved searches for a user
   */
  async getUserSavedSearches(userId: string): Promise<SavedSearch[]> {
    try {
      const q = query(
        collection(db, 'saved_searches'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const searches: SavedSearch[] = [];

      snapshot.forEach((doc) => {
        searches.push({
          id: doc.id,
          ...doc.data()
        } as SavedSearch);
      });

      logger.info('Retrieved saved searches', { userId, count: searches.length });
      return searches;
    } catch (error) {
      logger.error('Failed to get saved searches', error as Error, { userId });
      throw error;
    }
  }

  /**
   * Update a saved search
   */
  async updateSavedSearch(
    searchId: string,
    updates: Partial<SavedSearch>
  ): Promise<void> {
    try {
      const searchRef = doc(db, 'saved_searches', searchId);
      await updateDoc(searchRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      logger.info('Saved search updated', { searchId, updates });
    } catch (error) {
      logger.error('Failed to update saved search', error as Error, { searchId });
      throw error;
    }
  }

  /**
   * Delete a saved search
   */
  async deleteSavedSearch(searchId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'saved_searches', searchId));
      logger.info('Saved search deleted', { searchId });
    } catch (error) {
      logger.error('Failed to delete saved search', error as Error, { searchId });
      throw error;
    }
  }

  /**
   * Toggle notifications for a saved search
   */
  async toggleNotifications(
    searchId: string,
    enabled: boolean,
    emailEnabled?: boolean,
    pushEnabled?: boolean
  ): Promise<void> {
    try {
      const updates: any = {
        notificationEnabled: enabled,
        updatedAt: serverTimestamp()
      };

      if (emailEnabled !== undefined) {
        updates.emailNotification = emailEnabled;
      }
      if (pushEnabled !== undefined) {
        updates.pushNotification = pushEnabled;
      }

      await this.updateSavedSearch(searchId, updates);
      logger.info('Notifications toggled', { searchId, enabled });
    } catch (error) {
      logger.error('Failed to toggle notifications', error as Error, { searchId });
      throw error;
    }
  }

  // ====================================
  // Alerts Management
  // ====================================

  /**
   * Create a new alert for a saved search match
   */
  async createAlert(
    savedSearchId: string,
    userId: string,
    carId: string,
    carTitle: string,
    carPrice: number,
    carImage?: string
  ): Promise<string> {
    try {
      const alert: Omit<SearchAlert, 'id'> = {
        savedSearchId,
        userId,
        carId,
        carTitle,
        carPrice,
        carImage,
        notificationSent: false,
        emailSent: false,
        pushSent: false,
        createdAt: serverTimestamp() as Timestamp
      };

      const docRef = await addDoc(collection(db, 'search_alerts'), alert);
      logger.info('Alert created', { alertId: docRef.id, carId });
      return docRef.id;
    } catch (error) {
      logger.error('Failed to create alert', error as Error, { savedSearchId, carId });
      throw error;
    }
  }

  /**
   * Get alerts for a user
   */
  async getUserAlerts(userId: string, limitCount: number = 50): Promise<SearchAlert[]> {
    try {
      const q = query(
        collection(db, 'search_alerts'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const alerts: SearchAlert[] = [];

      snapshot.forEach((doc) => {
        alerts.push({
          id: doc.id,
          ...doc.data()
        } as SearchAlert);
      });

      return alerts;
    } catch (error) {
      logger.error('Failed to get alerts', error as Error, { userId });
      throw error;
    }
  }

  /**
   * Mark alert as sent
   */
  async markAlertAsSent(
    alertId: string,
    emailSent: boolean = false,
    pushSent: boolean = false
  ): Promise<void> {
    try {
      const alertRef = doc(db, 'search_alerts', alertId);
      await updateDoc(alertRef, {
        notificationSent: true,
        emailSent,
        pushSent,
        sentAt: serverTimestamp()
      });

      logger.info('Alert marked as sent', { alertId });
    } catch (error) {
      logger.error('Failed to mark alert as sent', error as Error, { alertId });
      throw error;
    }
  }

  // ====================================
  // Notification Preferences
  // ====================================

  /**
   * Get user notification preferences
   */
  async getNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      const q = query(
        collection(db, 'notification_preferences'),
        where('userId', '==', userId)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return null;
      }

      return snapshot.docs[0].data() as NotificationPreferences;
    } catch (error) {
      logger.error('Failed to get notification preferences', error as Error, { userId });
      throw error;
    }
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<void> {
    try {
      const q = query(
        collection(db, 'notification_preferences'),
        where('userId', '==', userId)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        // Create new preferences
        await addDoc(collection(db, 'notification_preferences'), {
          userId,
          emailEnabled: true,
          pushEnabled: true,
          frequency: 'instant',
          quietHoursEnabled: false,
          maxAlertsPerDay: 10,
          ...preferences
        });
      } else {
        // Update existing preferences
        const docRef = snapshot.docs[0].ref;
        await updateDoc(docRef, preferences);
      }

      logger.info('Notification preferences updated', { userId });
    } catch (error) {
      logger.error('Failed to update notification preferences', error as Error, { userId });
      throw error;
    }
  }

  // ====================================
  // Utility Methods
  // ====================================

  /**
   * Check if search criteria matches a car
   */
  matchesCriteria(car: any, criteria: SearchCriteria): boolean {
    // Make match
    if (criteria.make && car.make !== criteria.make) {
      return false;
    }

    // Model match
    if (criteria.model && car.model !== criteria.model) {
      return false;
    }

    // Year range
    if (criteria.yearFrom && car.year < criteria.yearFrom) {
      return false;
    }
    if (criteria.yearTo && car.year > criteria.yearTo) {
      return false;
    }

    // Price range
    if (criteria.priceFrom && car.price < criteria.priceFrom) {
      return false;
    }
    if (criteria.priceTo && car.price > criteria.priceTo) {
      return false;
    }

    // Fuel type
    if (criteria.fuelType && car.fuelType !== criteria.fuelType) {
      return false;
    }

    // Transmission
    if (criteria.transmission && car.transmission !== criteria.transmission) {
      return false;
    }

    // Body type
    if (criteria.bodyType && car.bodyType !== criteria.bodyType) {
      return false;
    }

    // City
    if (criteria.city && car.city !== criteria.city) {
      return false;
    }

    // Mileage
    if (criteria.mileageMax && car.mileage > criteria.mileageMax) {
      return false;
    }

    // Keywords (simple search in make/model)
    if (criteria.keywords) {
      const searchText = `${car.make} ${car.model}`.toLowerCase();
      const keywords = criteria.keywords.toLowerCase();
      if (!searchText.includes(keywords)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Format search criteria as readable text
   */
  formatSearchCriteria(criteria: SearchCriteria, language: 'bg' | 'en' = 'bg'): string {
    const parts: string[] = [];

    if (criteria.make) parts.push(criteria.make);
    if (criteria.model) parts.push(criteria.model);
    if (criteria.yearFrom || criteria.yearTo) {
      parts.push(`${criteria.yearFrom || ''}${criteria.yearTo ? '-' + criteria.yearTo : '+'}`);
    }
    if (criteria.priceFrom || criteria.priceTo) {
      const priceText = language === 'bg' ? 'Цена' : 'Price';
      parts.push(`${priceText}: €${criteria.priceFrom || 0}-${criteria.priceTo || '∞'}`);
    }
    if (criteria.fuelType) parts.push(criteria.fuelType);
    if (criteria.transmission) parts.push(criteria.transmission);
    if (criteria.city) parts.push(criteria.city);

    return parts.join(', ') || (language === 'bg' ? 'Всички автомобили' : 'All cars');
  }
}

// ====================================
// Export Singleton Instance
// ====================================

export const savedSearchesAlertsService = SavedSearchesAlertsService.getInstance();
export default savedSearchesAlertsService;
