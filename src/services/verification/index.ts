// src/services/verification/index.ts
// Verification Services Index - ملف ربط خدمات التحقق
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

/**
 * Verification Services Module
 * 
 * خدمات التحقق المتقدمة للمستخدمين البلغاريين
 * Advanced verification services for Bulgarian users
 * 
 * Available Services:
 * 1. phoneVerificationService - التحقق من الهاتف
 * 2. idVerificationService - التحقق من الهوية
 */

// ==================== IMPORTS ====================

import { phoneVerificationService } from './phone-verification-service';
import { idVerificationService } from './id-verification-service';

// ==================== EXPORTS ====================

// Phone Verification
export {
  phoneVerificationService,
  PhoneVerificationService
} from './phone-verification-service';

export type {
  PhoneVerificationResult,
  OTPVerificationResult
} from './phone-verification-service';

// ID Verification
export {
  idVerificationService,
  IDVerificationService
} from './id-verification-service';

export type {
  IDVerificationRequest,
  SubmitIDResult
} from './id-verification-service';

// ==================== CONSOLIDATED SERVICE ====================

/**
 * Main Verification Service
 * خدمة التحقق الموحدة
 */
export const VerificationService = {
  phone: phoneVerificationService,
  id: idVerificationService
};

// Default export
export default VerificationService;
