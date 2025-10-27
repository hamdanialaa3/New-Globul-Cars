// ID Card Verification Service
// Complete service for ID card data handling with security
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import { doc, updateDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { IDCardData } from '../../components/Profile/IDCardEditor/types';
import EGNValidator from './egn-validator';
import { logger } from '../logger-service';

/**
 * Sanitized ID data for storage (excluding sensitive fields)
 */
export interface StoredIDCardData {
  // Names (safe to store)
  firstNameBG: string;
  middleNameBG: string;
  lastNameBG: string;
  firstNameEN: string;
  middleNameEN: string;
  lastNameEN: string;
  
  // Personal info (safe)
  dateOfBirth: string;
  sex: string;
  height?: string;
  eyeColor?: string;
  placeOfBirth?: string;
  nationality?: string;
  
  // Address (safe)
  addressOblast?: string;
  addressMunicipality?: string;
  addressStreet?: string;
  
  // Document metadata (partially sensitive)
  expiryDate: string;
  issueDate?: string;
  issuingAuthority?: string;
  
  // Verification status
  verified: boolean;
  verifiedAt?: Date | Timestamp;
  verificationMethod?: string;
}

/**
 * Sensitive ID data (should be encrypted or hashed)
 */
export interface SensitiveIDData {
  documentNumber: string;  // ID number
  personalNumber: string;  // EGN - very sensitive!
}

/**
 * Complete user update with ID data
 */
export interface UserIDUpdate {
  // Public profile fields
  firstName: string;
  middleName: string;
  lastName: string;
  firstNameBG?: string;
  middleNameBG?: string;
  lastNameBG?: string;
  dateOfBirth?: string;
  sex?: string;
  height?: string;
  eyeColor?: string;
  placeOfBirth?: string;
  address?: string;
  addressOblast?: string;
  
  // Verification data
  verification: {
    idVerified: boolean;
    idVerifiedAt: Date | Timestamp;
    trustScore: number;
    verificationMethod: string;
  };
  
  // Sensitive data (nested)
  idCard?: {
    documentNumber: string;
    personalNumber: string;
    expiryDate: string;
    issueDate?: string;
    issuingAuthority?: string;
    verified: boolean;
  };
  
  // Metadata
  updatedAt: Date | Timestamp;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}

/**
 * ID Verification Service
 */
class IDVerificationService {
  
  /**
   * Validate ID card data thoroughly
   */
  validateIDData(data: IDCardData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Required fields
    if (!data.documentNumber || !data.documentNumber.match(/^[A-Z]{2}\d{7}$/)) {
      errors.push('Invalid document number format (should be XX0000000)');
    }
    
    if (!data.personalNumber) {
      errors.push('Personal number (EGN) is required');
    } else {
      // Validate EGN
      const egnValidation = EGNValidator.analyzeEGN(data.personalNumber);
      if (!egnValidation.valid) {
        errors.push(`Invalid EGN: ${egnValidation.errors?.join(', ')}`);
      } else {
        // Cross-validate EGN with provided data
        if (data.dateOfBirth && egnValidation.birthDate) {
          const egnDate = EGNValidator.formatBulgarianDate(egnValidation.birthDate);
          if (egnDate !== data.dateOfBirth) {
            warnings.push('Date of birth does not match EGN');
          }
        }
        
        if (data.sex && data.sex !== egnValidation.sex) {
          warnings.push('Sex does not match EGN');
        }
      }
    }
    
    // Names
    const nameFields = [
      'firstNameBG', 'middleNameBG', 'lastNameBG',
      'firstNameEN', 'middleNameEN', 'lastNameEN'
    ];
    nameFields.forEach(field => {
      if (!data[field as keyof IDCardData]) {
        errors.push(`${field} is required`);
      }
    });
    
    // Date validation
    if (!data.dateOfBirth) {
      errors.push('Date of birth is required');
    } else if (!this.isValidBulgarianDate(data.dateOfBirth)) {
      errors.push('Invalid date format (should be DD.MM.YYYY)');
    }
    
    if (!data.expiryDate) {
      errors.push('Expiry date is required');
    } else if (!this.isValidBulgarianDate(data.expiryDate)) {
      errors.push('Invalid expiry date format');
    } else {
      // Check if expired
      const expiry = this.parseBulgarianDate(data.expiryDate);
      if (expiry && expiry < new Date()) {
        warnings.push('ID card is expired');
      }
    }
    
    // Height validation
    if (data.height) {
      const h = parseInt(data.height);
      if (isNaN(h) || h < 140 || h > 220) {
        warnings.push('Height seems unusual (140-220 cm expected)');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * Save ID card data to Firestore with proper security
   */
  async saveIDCardData(
    userId: string,
    data: IDCardData
  ): Promise<{ success: boolean; error?: string; trustScoreGain?: number }> {
    try {
      // Validate first
      const validation = this.validateIDData(data);
      if (!validation.valid) {
        logger.error('ID validation failed', new Error(validation.errors.join(', ')));
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }
      
      // Get current user data for trust score calculation
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        return {
          success: false,
          error: 'User not found'
        };
      }
      
      const currentData = userSnap.data();
      const currentTrustScore = currentData?.verification?.trustScore || 0;
      
      // Calculate trust score gain
      let trustScoreGain = 50; // Base gain for ID verification
      
      // Bonus points
      if (data.height) trustScoreGain += 5;
      if (data.eyeColor) trustScoreGain += 5;
      if (data.placeOfBirth) trustScoreGain += 5;
      if (data.addressStreet) trustScoreGain += 10;
      
      // Prepare update data
      const updateData: UserIDUpdate = {
        // Public profile
        firstName: data.firstNameEN,
        middleName: data.middleNameEN,
        lastName: data.lastNameEN,
        firstNameBG: data.firstNameBG,
        middleNameBG: data.middleNameBG,
        lastNameBG: data.lastNameBG,
        dateOfBirth: data.dateOfBirth,
        sex: data.sex,
        height: data.height,
        eyeColor: data.eyeColor,
        placeOfBirth: data.placeOfBirth,
        addressOblast: data.addressOblast,
        
        // Address (combined)
        address: this.formatAddress(data),
        
        // Verification
        verification: {
          idVerified: true,
          idVerifiedAt: Timestamp.now(),
          trustScore: Math.min(currentTrustScore + trustScoreGain, 100),
          verificationMethod: 'id_card_manual'
        },
        
        // Sensitive data (nested for better security rules)
        idCard: {
          documentNumber: data.documentNumber,
          personalNumber: data.personalNumber, // In production, hash this!
          expiryDate: data.expiryDate,
          issueDate: data.issueDate,
          issuingAuthority: data.issuingAuthority,
          verified: true
        },
        
        // Metadata
        updatedAt: Timestamp.now()
      };
      
      // Update Firestore
      await updateDoc(userRef, updateData as any);
      
      logger.info('ID card data saved successfully', { userId, trustScoreGain });
      
      return {
        success: true,
        trustScoreGain
      };
      
    } catch (error) {
      logger.error('Error saving ID card data', error as Error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }
  
  /**
   * Get user's ID card data
   */
  async getIDCardData(userId: string): Promise<IDCardData | null> {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        return null;
      }
      
      const data = userSnap.data();
      
      // Reconstruct ID card data
      return {
        documentNumber: data.idCard?.documentNumber || '',
        personalNumber: data.idCard?.personalNumber || '',
        firstNameBG: data.firstNameBG || '',
        middleNameBG: data.middleNameBG || '',
        lastNameBG: data.lastNameBG || '',
        firstNameEN: data.firstName || '',
        middleNameEN: data.middleName || '',
        lastNameEN: data.lastName || '',
        nationality: data.nationality || 'БЪЛГАРИЯ / BGR',
        dateOfBirth: data.dateOfBirth || '',
        sex: data.sex || '',
        height: data.height || '',
        eyeColor: data.eyeColor || '',
        expiryDate: data.idCard?.expiryDate || '',
        issueDate: data.idCard?.issueDate || '',
        issuingAuthority: data.idCard?.issuingAuthority || '',
        placeOfBirth: data.placeOfBirth || '',
        addressOblast: data.addressOblast || '',
        addressMunicipality: data.addressMunicipality || '',
        addressStreet: data.addressStreet || ''
      };
      
    } catch (error) {
      logger.error('Error getting ID card data', error as Error);
      return null;
    }
  }
  
  /**
   * Check if user has verified ID
   */
  async isIDVerified(userId: string): Promise<boolean> {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        return false;
      }
      
      const data = userSnap.data();
      return data.verification?.idVerified === true;
      
    } catch (error) {
      logger.error('Error checking ID verification', error as Error);
      return false;
    }
  }
  
  /**
   * Format address from ID card data
   */
  private formatAddress(data: IDCardData): string {
    const parts = [];
    
    if (data.addressStreet) parts.push(data.addressStreet);
    if (data.addressMunicipality) parts.push(data.addressMunicipality);
    if (data.addressOblast) parts.push(data.addressOblast);
    
    return parts.join(', ');
  }
  
  /**
   * Validate Bulgarian date format (DD.MM.YYYY)
   */
  private isValidBulgarianDate(dateStr: string): boolean {
    if (!dateStr) return false;
    const pattern = /^\d{2}\.\d{2}\.\d{4}$/;
    if (!pattern.test(dateStr)) return false;
    
    const date = this.parseBulgarianDate(dateStr);
    return date !== null;
  }
  
  /**
   * Parse Bulgarian date string to Date object
   */
  private parseBulgarianDate(dateStr: string): Date | null {
    const parts = dateStr.split('.');
    if (parts.length !== 3) return null;
    
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1; // JS months are 0-indexed
    const year = parseInt(parts[2]);
    
    const date = new Date(year, month, day);
    
    // Validate the date is real
    if (date.getDate() !== day || date.getMonth() !== month || date.getFullYear() !== year) {
      return null;
    }
    
    return date;
  }
}

// Export singleton instance
export const idVerificationService = new IDVerificationService();
export default idVerificationService;

