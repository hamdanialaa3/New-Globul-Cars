/**
 * Financial Compliance Service
 * Handles Bulgarian financial regulations, VAT, and accounting compliance
 * 
 * Features:
 * - VAT registration tracking
 * - Tax number validation (EIK with full checksum)
 * - Financial audit management
 * - Currency compliance (EUR)
 * 
 * @compliance Bulgarian Tax Law
 * @location Bulgaria
 */

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  query, 
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { serviceLogger } from '../logger-service';
import { isValidEIKChecksum, cleanEIK } from '../verification/eik-verification-service';

export interface FinancialCompliance {
  id: string;
  currency: 'EUR';
  taxRate: number;
  vatRate: number;
  businessRegistration: string;
  taxNumber: string;
  bankAccount: string;
  lastAudit: Date;
  nextAudit: Date;
  complianceStatus: 'compliant' | 'non_compliant' | 'pending';
}

export class FinancialComplianceService {
  private static instance: FinancialComplianceService;

  private constructor() {}

  public static getInstance(): FinancialComplianceService {
    if (!FinancialComplianceService.instance) {
      FinancialComplianceService.instance = new FinancialComplianceService();
    }
    return FinancialComplianceService.instance;
  }

  /**
   * Get financial compliance status
   */
  public async getFinancialCompliance(): Promise<FinancialCompliance | null> {
    try {
      const q = query(collection(db, 'financial_compliance'), limit(1));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      const data = doc.data();
      
      return {
        id: doc.id,
        currency: 'EUR',
        taxRate: data.taxRate || 0,
        vatRate: data.vatRate || 20,
        businessRegistration: data.businessRegistration || '',
        taxNumber: data.taxNumber || '',
        bankAccount: data.bankAccount || '',
        lastAudit: data.lastAudit?.toDate() || new Date(),
        nextAudit: data.nextAudit?.toDate() || new Date(),
        complianceStatus: data.complianceStatus || 'pending'
      };
    } catch (error) {
      serviceLogger.error('Error getting financial compliance', error as Error);
      return null;
    }
  }

  /**
   * Update financial compliance
   */
  public async updateFinancialCompliance(
    complianceData: Partial<FinancialCompliance>,
    updatedBy: string
  ): Promise<void> {
    try {
      const complianceRef = doc(collection(db, 'financial_compliance'));
      const financialCompliance: Omit<FinancialCompliance, 'id'> = {
        currency: 'EUR',
        taxRate: 10,
        vatRate: 20,
        businessRegistration: '',
        taxNumber: '',
        bankAccount: '',
        lastAudit: new Date(),
        nextAudit: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        complianceStatus: 'pending',
        ...complianceData
      };

      await setDoc(complianceRef, {
        ...financialCompliance,
        updatedBy,
        updatedAt: serverTimestamp()
      });

      await this.logComplianceAction(
        'FINANCIAL_COMPLIANCE_UPDATED',
        complianceRef.id,
        'Financial compliance information updated',
        updatedBy
      );
    } catch (error) {
      serviceLogger.error('Error updating financial compliance', error as Error);
      throw error;
    }
  }

  /**
   * Validate Bulgarian VAT number (9 or 10 digits)
   */
  public validateVATNumber(vatNumber: string): { valid: boolean; message: string } {
    // Remove spaces and convert to uppercase
    const cleaned = vatNumber.replace(/\s/g, '').toUpperCase();
    
    // Check if it starts with BG (optional)
    const hasBGPrefix = cleaned.startsWith('BG');
    const number = hasBGPrefix ? cleaned.substring(2) : cleaned;
    
    // Must be 9 or 10 digits
    if (!/^\d{9,10}$/.test(number)) {
      return {
        valid: false,
        message: 'Bulgarian VAT number must be 9 or 10 digits'
      };
    }
    
    // Additional validation can be added here (checksum algorithm)
    // For now, basic format validation
    
    return {
      valid: true,
      message: 'Valid Bulgarian VAT number format'
    };
  }

  /**
   * Validate Bulgarian EIK - Unified Identification Code (9 or 13 digits)
   * Uses complete checksum validation algorithm
   */
  public validateEIK(eik: string): { valid: boolean; message: string } {
    const cleaned = cleanEIK(eik);
    
    if (!/^\d{9}$|^\d{13}$/.test(cleaned)) {
      return {
        valid: false,
        message: 'EIK must be 9 or 13 digits'
      };
    }
    
    // Use the complete EIK checksum validation
    if (!isValidEIKChecksum(cleaned)) {
      return {
        valid: false,
        message: 'Invalid EIK checksum - number may be incorrect'
      };
    }
    
    return {
      valid: true,
      message: 'Valid EIK with correct checksum'
    };
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

export const financialComplianceService = FinancialComplianceService.getInstance();
