// src/services/verification/eik-verification-service.ts
// Cloud Functions Integration for EIK Verification
// Integration with Backend P2.4 Features

import { httpsCallable } from 'firebase/functions';
import { functions } from '@globul-cars/services/firebase/firebase-config';
import { logger } from '../logger-service';

// ==================== TYPES ====================

export interface EIKVerificationResult {
  valid: boolean;
  eik: string;
  companyName?: string;
  companyNameEn?: string;
  address?: string;
  registrationDate?: string;
  status?: 'active' | 'inactive' | 'liquidation';
  legalForm?: string;
  message: string;
}

// ==================== EIK VERIFICATION FUNCTION ====================

export const verifyEIK = async (
  eik: string,
  businessName?: string
): Promise<{
  valid: boolean;
  eik: string;
  companyName?: string;
  companyNameEn?: string;
  address?: string;
  registrationDate?: string;
  status?: 'active' | 'inactive' | 'liquidation';
  legalForm?: string;
  message: string;
}> => {
  try {
    const verifyEIKFn = httpsCallable(functions, 'verifyEIK');
    const result = await verifyEIKFn({ eik, businessName });
    return result.data as any;
  } catch (error: any) {
    logger.error('Error verifying EIK', error as Error, { eik, businessName });
    return {
      valid: false,
      eik: eik,
      message: error.message || 'Failed to verify EIK',
    };
  }
};

// ==================== HELPER FUNCTIONS ====================

export const validateEIKFormat = (eik: string): { valid: boolean; error?: string } => {
  if (!eik) {
    return { valid: false, error: 'EIK е задължителен' };
  }

  const cleanEIK = eik.replace(/\s/g, '');

  // Bulgarian EIK can be 9 or 13 digits
  const eikPattern = /^[0-9]{9}$|^[0-9]{13}$/;

  if (!eikPattern.test(cleanEIK)) {
    return {
      valid: false,
      error: 'EIK трябва да бъде 9 или 13 цифри',
    };
  }

  return { valid: true };
};

export const formatEIK = (eik: string): string => {
  // Remove spaces and format EIK for display
  const cleanEIK = eik.replace(/\s/g, '');

  if (cleanEIK.length === 9) {
    // Format: 123456789
    return cleanEIK;
  } else if (cleanEIK.length === 13) {
    // Format: 123456789-0123
    return `${cleanEIK.substring(0, 9)}-${cleanEIK.substring(9)}`;
  }

  return cleanEIK;
};

export const cleanEIK = (eik: string): string => {
  // Remove all non-digit characters
  return eik.replace(/\D/g, '');
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'active':
      return '#4caf50';
    case 'inactive':
      return '#ff9800';
    case 'liquidation':
      return '#f44336';
    default:
      return '#757575';
  }
};

export const getStatusText = (status: string, language: 'bg' | 'en' = 'bg'): string => {
  const translations: Record<string, { bg: string; en: string }> = {
    active: { bg: 'Активна', en: 'Active' },
    inactive: { bg: 'Неактивна', en: 'Inactive' },
    liquidation: { bg: 'В ликвидация', en: 'In Liquidation' },
  };

  return translations[status]?.[language] || status;
};

export const getLegalFormText = (legalForm: string, language: 'bg' | 'en' = 'bg'): string => {
  const translations: Record<string, { bg: string; en: string }> = {
    'ЕООД': { bg: 'ЕООД (Еднолично дружество с ограничена отговорност)', en: 'EOOD (Single-Member LLC)' },
    'ООД': { bg: 'ООД (Дружество с ограничена отговорност)', en: 'OOD (Limited Liability Company)' },
    'АД': { bg: 'АД (Акционерно дружество)', en: 'AD (Joint Stock Company)' },
    'ЕТ': { bg: 'ЕТ (Едноличен търговец)', en: 'ET (Sole Trader)' },
    'КД': { bg: 'КД (Командитно дружество)', en: 'KD (Limited Partnership)' },
    'СД': { bg: 'СД (Събирателно дружество)', en: 'SD (General Partnership)' },
  };

  return translations[legalForm]?.[language] || legalForm;
};

export const isValidEIKChecksum = (eik: string): boolean => {
  const cleanedEIK = cleanEIK(eik);

  if (cleanedEIK.length !== 9 && cleanedEIK.length !== 13) {
    return false;
  }

  // For 9-digit EIK
  if (cleanedEIK.length === 9) {
    const weights = [1, 2, 3, 4, 5, 6, 7, 8];
    const alternativeWeights = [3, 4, 5, 6, 7, 8, 9, 10];

    let sum = 0;
    for (let i = 0; i < 8; i++) {
      sum += parseInt(cleanedEIK[i]) * weights[i];
    }

    let checkDigit = sum % 11;

    if (checkDigit === 10) {
      sum = 0;
      for (let i = 0; i < 8; i++) {
        sum += parseInt(cleanedEIK[i]) * alternativeWeights[i];
      }
      checkDigit = sum % 11;
      if (checkDigit === 10) {
        checkDigit = 0;
      }
    }

    return checkDigit === parseInt(cleanedEIK[8]);
  }

  // For 13-digit EIK (extended validation)
  if (cleanedEIK.length === 13) {
    // First 9 digits should pass 9-digit validation
    const firstNine = cleanedEIK.substring(0, 9);
    if (!isValidEIKChecksum(firstNine)) {
      return false;
    }

    // Additional validation for digits 10-13
    const weights = [2, 7, 3, 5];
    const alternativeWeights = [4, 9, 5, 7];

    let sum = 0;
    for (let i = 0; i < 4; i++) {
      sum += parseInt(cleanedEIK[i + 8]) * weights[i];
    }

    let checkDigit = sum % 11;

    if (checkDigit === 10) {
      sum = 0;
      for (let i = 0; i < 4; i++) {
        sum += parseInt(cleanedEIK[i + 8]) * alternativeWeights[i];
      }
      checkDigit = sum % 11;
      if (checkDigit === 10) {
        checkDigit = 0;
      }
    }

    return checkDigit === parseInt(cleanedEIK[12]);
  }

  return false;
};

// ==================== VALIDATION MESSAGES ====================

export const getValidationMessages = (language: 'bg' | 'en' = 'bg') => {
  return {
    required: language === 'bg' ? 'EIK е задължителен' : 'EIK is required',
    invalidFormat: language === 'bg' ? 'EIK трябва да бъде 9 или 13 цифри' : 'EIK must be 9 or 13 digits',
    invalidChecksum: language === 'bg' ? 'Невалиден EIK (грешна контролна сума)' : 'Invalid EIK (checksum failed)',
    verificationFailed: language === 'bg' ? 'Грешка при проверка на EIK' : 'EIK verification failed',
    verificationSuccess: language === 'bg' ? 'EIK е валиден и верифициран' : 'EIK is valid and verified',
    companyNotFound: language === 'bg' ? 'Фирма не е намерена' : 'Company not found',
  };
};
