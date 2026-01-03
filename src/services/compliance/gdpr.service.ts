/**
 * GDPR Compliance Service
 * Handles EU General Data Protection Regulation compliance
 * 
 * Features:
 * - User consent management
 * - Right to be forgotten (data deletion)
 * - Right to data portability (data export)
 * - Privacy policy enforcement
 * - Cookie consent management
 * 
 * @compliance GDPR Articles 17, 20
 * @location Bulgaria (EU)
 */

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { serviceLogger } from '../logger-service';

export interface DataProtectionCompliance {
  id: string;
  gdprCompliant: boolean;
  dataProcessingAgreement: boolean;
  privacyPolicy: boolean;
  cookiePolicy: boolean;
  dataRetentionPolicy: boolean;
  userConsent: boolean;
  dataBreachProcedure: boolean;
  dpoAppointed: boolean;
  lastReview: Date;
  nextReview: Date;
}

export class GDPRService {
  private static instance: GDPRService;

  private constructor() {}

  public static getInstance(): GDPRService {
    if (!GDPRService.instance) {
      GDPRService.instance = new GDPRService();
    }
    return GDPRService.instance;
  }

  /**
   * Get data protection compliance status
   */
  public async getDataProtectionCompliance(): Promise<DataProtectionCompliance | null> {
    try {
      const complianceDoc = await getDoc(doc(db, 'data_protection_compliance', 'main'));
      
      if (!complianceDoc.exists()) {
        return null;
      }

      const data = complianceDoc.data();
      return {
        id: complianceDoc.id,
        gdprCompliant: data.gdprCompliant || false,
        dataProcessingAgreement: data.dataProcessingAgreement || false,
        privacyPolicy: data.privacyPolicy || false,
        cookiePolicy: data.cookiePolicy || false,
        dataRetentionPolicy: data.dataRetentionPolicy || false,
        userConsent: data.userConsent || false,
        dataBreachProcedure: data.dataBreachProcedure || false,
        dpoAppointed: data.dpoAppointed || false,
        lastReview: data.lastReview?.toDate() || new Date(),
        nextReview: data.nextReview?.toDate() || new Date()
      };
    } catch (error) {
      serviceLogger.error('Error getting data protection compliance', error as Error);
      return null;
    }
  }

  /**
   * Update data protection compliance
   */
  public async updateDataProtectionCompliance(
    complianceData: Partial<DataProtectionCompliance>,
    updatedBy: string
  ): Promise<void> {
    try {
      const complianceRef = doc(db, 'data_protection_compliance', 'main');
      const dataProtectionCompliance: Omit<DataProtectionCompliance, 'id'> = {
        gdprCompliant: false,
        dataProcessingAgreement: false,
        privacyPolicy: false,
        cookiePolicy: false,
        dataRetentionPolicy: false,
        userConsent: false,
        dataBreachProcedure: false,
        dpoAppointed: false,
        lastReview: new Date(),
        nextReview: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        ...complianceData
      };

      await setDoc(complianceRef, {
        ...dataProtectionCompliance,
        updatedBy,
        updatedAt: serverTimestamp()
      });

      await this.logComplianceAction(
        'DATA_PROTECTION_COMPLIANCE_UPDATED',
        complianceRef.id,
        'Data protection compliance information updated',
        updatedBy
      );
    } catch (error) {
      serviceLogger.error('Error updating data protection compliance', error as Error);
      throw error;
    }
  }

  /**
   * ✅ GDPR Article 17: Right to Erasure ("Right to be Forgotten")
   * Deletes ALL user data across the entire system
   */
  public async deleteAllUserData(userId: string, reason: string = 'User request'): Promise<{
    success: boolean;
    deletedCollections: string[];
    errors: string[];
  }> {
    const deletedCollections: string[] = [];
    const errors: string[] = [];
    const batch = writeBatch(db);

    try {
      serviceLogger.info('🗑️ GDPR Data Deletion Request', { userId, reason });

      // 1. Delete user profile
      try {
        const userRef = doc(db, 'users', userId);
        batch.delete(userRef);
        deletedCollections.push('users');
      } catch (err) {
        errors.push(`users: ${(err as Error).message}`);
      }

      // 2. Delete all car listings
      const vehicleCollections = ['passenger_cars', 'suvs', 'vans', 'motorcycles', 'trucks', 'buses'];
      for (const collectionName of vehicleCollections) {
        try {
          const carsQuery = query(collection(db, collectionName), where('sellerId', '==', userId));
          const carsSnapshot = await getDocs(carsQuery);
          carsSnapshot.docs.forEach(carDoc => batch.delete(carDoc.ref));
          if (carsSnapshot.size > 0) {
            deletedCollections.push(`${collectionName} (${carsSnapshot.size} items)`);
          }
        } catch (err) {
          errors.push(`${collectionName}: ${(err as Error).message}`);
        }
      }

      // 3. Delete messages
      try {
        const sentMessages = query(collection(db, 'messages'), where('senderId', '==', userId));
        const receivedMessages = query(collection(db, 'messages'), where('recipientId', '==', userId));
        const [sentSnapshot, receivedSnapshot] = await Promise.all([
          getDocs(sentMessages),
          getDocs(receivedMessages)
        ]);
        [...sentSnapshot.docs, ...receivedSnapshot.docs].forEach(msgDoc => batch.delete(msgDoc.ref));
        deletedCollections.push(`messages (${sentSnapshot.size + receivedSnapshot.size} items)`);
      } catch (err) {
        errors.push(`messages: ${(err as Error).message}`);
      }

      // 4. Delete favorites, saved searches, notifications, analytics
      const userDataCollections = ['favorites', 'saved_searches', 'notifications', 'analytics'];
      for (const collectionName of userDataCollections) {
        try {
          const dataQuery = query(collection(db, collectionName), where('userId', '==', userId));
          const dataSnapshot = await getDocs(dataQuery);
          dataSnapshot.docs.forEach(dataDoc => batch.delete(dataDoc.ref));
          if (dataSnapshot.size > 0) {
            deletedCollections.push(`${collectionName} (${dataSnapshot.size} items)`);
          }
        } catch (err) {
          errors.push(`${collectionName}: ${(err as Error).message}`);
        }
      }

      // Commit batch deletion
      await batch.commit();

      // ✅ NEW: Request Google Analytics data deletion
      try {
        const gaDataDeletionService = (await import('../analytics/google-analytics-data-deletion.service')).default;
        const userDoc = await getDoc(doc(db, 'users', userId));
        const userEmail = userDoc.data()?.email;
        
        await gaDataDeletionService.requestDataDeletion(userId, userEmail, reason);
        deletedCollections.push('google_analytics (requested)');
        
        // Clear user tracking immediately
        gaDataDeletionService.clearUserTracking();
      } catch (err) {
        errors.push(`google_analytics: ${(err as Error).message}`);
      }

      await this.logComplianceAction(
        'GDPR_USER_DATA_DELETED',
        userId,
        `All user data deleted. Reason: ${reason}. Collections: ${deletedCollections.join(', ')}`,
        userId
      );

      serviceLogger.info('✅ GDPR Data Deletion Completed', {
        userId,
        deletedCollections,
        errors: errors.length > 0 ? errors : 'None'
      });

      return { success: errors.length === 0, deletedCollections, errors };

    } catch (error) {
      serviceLogger.error('❌ GDPR Data Deletion Failed', error as Error, { userId });
      return {
        success: false,
        deletedCollections,
        errors: [...errors, (error as Error).message]
      };
    }
  }

  /**
   * ✅ GDPR Article 20: Right to Data Portability
   * Exports all user data in JSON format
   */
  public async exportAllUserData(userId: string): Promise<{
    success: boolean;
    data: Record<string, any>;
    exportedAt: Date;
  }> {
    try {
      serviceLogger.info('📦 GDPR Data Export Request', { userId });

      const exportData: Record<string, any> = {
        userId,
        exportedAt: new Date().toISOString(),
        profile: null,
        cars: [],
        messages: [],
        favorites: [],
        savedSearches: [],
        notifications: []
      };

      // Export user profile
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        exportData.profile = userDoc.data();
      }

      // Export car listings
      const vehicleCollections = ['passenger_cars', 'suvs', 'vans', 'motorcycles', 'trucks', 'buses'];
      for (const collectionName of vehicleCollections) {
        const carsQuery = query(collection(db, collectionName), where('sellerId', '==', userId));
        const carsSnapshot = await getDocs(carsQuery);
        exportData.cars.push(...carsSnapshot.docs.map(d => ({ collection: collectionName, ...d.data() })));
      }

      // Export messages, favorites, saved searches, notifications
      const sentMessages = query(collection(db, 'messages'), where('senderId', '==', userId));
      const receivedMessages = query(collection(db, 'messages'), where('recipientId', '==', userId));
      const [sentSnapshot, receivedSnapshot] = await Promise.all([
        getDocs(sentMessages),
        getDocs(receivedMessages)
      ]);
      exportData.messages = [
        ...sentSnapshot.docs.map(d => ({ type: 'sent', ...d.data() })),
        ...receivedSnapshot.docs.map(d => ({ type: 'received', ...d.data() }))
      ];

      const favoritesQuery = query(collection(db, 'favorites'), where('userId', '==', userId));
      const favoritesSnapshot = await getDocs(favoritesQuery);
      exportData.favorites = favoritesSnapshot.docs.map(d => d.data());

      const searchesQuery = query(collection(db, 'saved_searches'), where('userId', '==', userId));
      const searchesSnapshot = await getDocs(searchesQuery);
      exportData.savedSearches = searchesSnapshot.docs.map(d => d.data());

      const notificationsQuery = query(collection(db, 'notifications'), where('userId', '==', userId));
      const notificationsSnapshot = await getDocs(notificationsQuery);
      exportData.notifications = notificationsSnapshot.docs.map(d => d.data());

      serviceLogger.info('✅ GDPR Data Export Completed', {
        userId,
        profileFound: !!exportData.profile,
        cars: exportData.cars.length,
        messages: exportData.messages.length
      });

      return { success: true, data: exportData, exportedAt: new Date() };

    } catch (error) {
      serviceLogger.error('❌ GDPR Data Export Failed', error as Error, { userId });
      throw error;
    }
  }

  /**
   * Log compliance action
   */
  private async logComplianceAction(
    action: string,
    resourceId: string,
    details: string,
    actorId: string
  ): Promise<void> {
    try {
      const logRef = doc(collection(db, 'compliance_logs'));
      await setDoc(logRef, {
        action,
        resourceId,
        details,
        actorId,
        timestamp: serverTimestamp(),
        ipAddress: 'N/A',
        userAgent: navigator.userAgent
      });
    } catch (error) {
      serviceLogger.error('Error logging compliance action', error as Error, { action, resourceId });
    }
  }
}

export const gdprService = GDPRService.getInstance();
