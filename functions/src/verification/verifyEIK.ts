// functions/src/verification/verifyEIK.ts
// Cloud Function: Verify Bulgarian company EIK/BULSTAT number

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { EIKVerificationResult } from './types';
import { verifyEIKWithCache } from './eikAPI';

/**
 * Verify Bulgarian company EIK/BULSTAT number
 * 
 * NOW INTEGRATED WITH REAL EIK API (with fallback to mock)
 * 
 * @param eik - The EIK/BULSTAT number to verify (9 or 13 digits)
 * @param businessName - Optional business name for cross-validation
 * 
 * @returns EIKVerificationResult with validation status and company data
 */
export const verifyEIK = onCall<{
  eik: string;
  businessName?: string;
}>(async (request) => {
  const { eik, businessName } = request.data;

  // 1. Check authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  logger.info('EIK verification started', { 
    eik: eik?.substring(0, 4) + '***',
    userId: request.auth.uid 
  });

  // 2. Validate EIK format
  if (!eik || typeof eik !== 'string') {
    throw new HttpsError('invalid-argument', 'EIK number is required');
  }

  const cleanEIK = eik.replace(/\s/g, '');
  
  // Bulgarian EIK can be 9 digits (old format) or 13 digits (new format)
  const eikPattern = /^[0-9]{9}$|^[0-9]{13}$/;
  
  if (!eikPattern.test(cleanEIK)) {
    logger.warn('Invalid EIK format', { eik: cleanEIK.substring(0, 4) + '***' });
    
    const result: EIKVerificationResult = {
      valid: false,
      message: 'Invalid EIK format. Must be 9 or 13 digits',
      eik: cleanEIK,
    };
    return result;
  }

  try {
    // 3. Use NEW EIK API Integration (with cache)
    logger.info('Verifying EIK via API...');
    const apiResult = await verifyEIKWithCache(cleanEIK);

    if (apiResult.success) {
      logger.info('EIK verification successful', { 
        eik: cleanEIK.substring(0, 4) + '***',
        source: apiResult.source,
      });

      // Cross-validate business name if provided
      let nameMatch = true;
      if (businessName && apiResult.companyName) {
        const providedLower = businessName.toLowerCase();
        const registeredLower = apiResult.companyName.toLowerCase();
        nameMatch = registeredLower.includes(providedLower) || providedLower.includes(registeredLower);
        
        if (!nameMatch) {
          logger.warn('Business name mismatch', {
            provided: businessName,
            registered: apiResult.companyName,
          });
        }
      }

      const result: EIKVerificationResult = {
        valid: true,
        eik: cleanEIK,
        companyName: apiResult.companyName,
        address: apiResult.address,
        status: apiResult.status,
        legalForm: apiResult.legalForm,
        registrationDate: apiResult.registrationDate,
        message: apiResult.source === 'mock' 
          ? 'EIK verified (using mock data - real API not configured)'
          : 'EIK successfully verified via Bulgarian Registry',
      };

      return result;
    } else {
      logger.warn('EIK verification failed', {
        eik: cleanEIK.substring(0, 4) + '***',
        error: apiResult.error,
      });

      const result: EIKVerificationResult = {
        valid: false,
        eik: cleanEIK,
        message: apiResult.error || 'EIK verification failed',
      };

      return result;
    }

  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('EIK verification error', { error: err.message });
    
    throw new HttpsError(
      'internal',
      `Failed to verify EIK: ${err.message}`
    );
  }
});
