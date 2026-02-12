// src/services/eik-verification-service.ts
// EIK verification service for company profiles

import { httpsCallable } from 'firebase/functions';
import { functions } from '@/firebase';
import { logger } from './logger-service';

export interface EIKVerificationResult {
  success: boolean;
  eik: string;
  companyName?: string;
  address?: string;
  status?: 'active' | 'inactive' | 'liquidated';
  error?: string;
  source: 'api' | 'mock';
}

export const eikVerificationService = {
  /**
   * Verify company EIK with Bulgarian Trade Registry
   */
  async verifyEIK(eik: string): Promise<EIKVerificationResult> {
    try {
      logger.info('Verifying EIK', { eik: eik.substring(0, 4) + '...' });

      const callable = httpsCallable(functions, 'verifyEIK');
      const result = await callable({ eik }) as any;

      return result.data;
    } catch (error: unknown) {
      logger.error('EIK verification failed', error);
      throw new Error(error.message || 'Failed to verify EIK');
    }
  },

  /**
   * Format EIK display (add spacing for readability)
   * Example: 123456789 → 1234567-89
   */
  formatEIK(eik: string): string {
    const clean = eik.replace(/\D/g, '');
    if (clean.length === 9) {
      return `${clean.substring(0, 7)}-${clean.substring(7)}`;
    }
    return clean;
  },

  /**
   * Validate EIK format
   */
  isValidEIK(eik: string): boolean {
    const clean = eik.replace(/\D/g, '');
    return /^\d{9}(\d{4})?$/.test(clean);
  },
};

export default eikVerificationService;
