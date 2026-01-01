/**
 * Business Registration Service
 * Handles Bulgarian business registration and legal compliance
 * 
 * Features:
 * - Business registration tracking
 * - Legal entity management
 * - Commercial Register integration
 * - Document management
 * 
 * @compliance Bulgarian Commercial Act
 * @location Bulgaria
 */

import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  query, 
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { serviceLogger } from '../logger-service';

export interface BusinessRegistration {
  id: string;
  businessName: string;
  businessNameBg: string;
  registrationNumber: string;
  vatNumber: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: 'Bulgaria';
  };
  businessType: 'sole_proprietorship' | 'partnership' | 'limited_company' | 'joint_stock_company';
  registrationDate: Date;
  isActive: boolean;
  documents: string[];
}

export class BusinessRegistrationService {
  private static instance: BusinessRegistrationService;

  private constructor() {}

  public static getInstance(): BusinessRegistrationService {
    if (!BusinessRegistrationService.instance) {
      BusinessRegistrationService.instance = new BusinessRegistrationService();
    }
    return BusinessRegistrationService.instance;
  }

  /**
   * Get business registration
   */
  public async getBusinessRegistration(): Promise<BusinessRegistration | null> {
    try {
      const q = query(collection(db, 'business_registration'), limit(1));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      const data = doc.data();
      
      return {
        id: doc.id,
        businessName: data.businessName || '',
        businessNameBg: data.businessNameBg || '',
        registrationNumber: data.registrationNumber || '',
        vatNumber: data.vatNumber || '',
        address: {
          street: data.address?.street || '',
          city: data.address?.city || '',
          postalCode: data.address?.postalCode || '',
          country: 'Bulgaria'
        },
        businessType: data.businessType || 'limited_company',
        registrationDate: data.registrationDate?.toDate() || new Date(),
        isActive: data.isActive || false,
        documents: data.documents || []
      };
    } catch (error) {
      serviceLogger.error('Error getting business registration', error as Error);
      return null;
    }
  }

  /**
   * Update business registration
   */
  public async updateBusinessRegistration(
    registrationData: Partial<BusinessRegistration>,
    updatedBy: string
  ): Promise<void> {
    try {
      const registrationRef = doc(collection(db, 'business_registration'));
      const businessRegistration: Omit<BusinessRegistration, 'id'> = {
        businessName: '',
        businessNameBg: '',
        registrationNumber: '',
        vatNumber: '',
        address: {
          street: '',
          city: '',
          postalCode: '',
          country: 'Bulgaria'
        },
        businessType: 'limited_company',
        registrationDate: new Date(),
        isActive: false,
        documents: [],
        ...registrationData
      };

      await setDoc(registrationRef, {
        ...businessRegistration,
        updatedBy,
        updatedAt: serverTimestamp()
      });

      await this.logComplianceAction(
        'BUSINESS_REGISTRATION_UPDATED',
        registrationRef.id,
        'Business registration information updated',
        updatedBy
      );
    } catch (error) {
      serviceLogger.error('Error updating business registration', error as Error);
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

export const businessRegistrationService = BusinessRegistrationService.getInstance();
