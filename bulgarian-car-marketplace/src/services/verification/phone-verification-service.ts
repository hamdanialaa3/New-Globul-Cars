// src/services/verification/phone-verification-service.ts
// Phone Verification Service - خدمة التحقق من الهاتف
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  ConfirmationResult,
  PhoneAuthProvider,
  linkWithCredential
} from 'firebase/auth';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase/firebase-config';
import { trustScoreService } from '../profile/trust-score-service';

// ==================== INTERFACES ====================

export interface PhoneVerificationResult {
  success: boolean;
  message: string;
  verificationId?: string;
}

export interface OTPVerificationResult {
  success: boolean;
  message: string;
  phoneNumber?: string;
}

// ==================== SERVICE CLASS ====================

export class PhoneVerificationService {
  private static instance: PhoneVerificationService;
  private recaptchaVerifier: RecaptchaVerifier | null = null;
  private confirmationResult: ConfirmationResult | null = null;

  private constructor() {}

  public static getInstance(): PhoneVerificationService {
    if (!PhoneVerificationService.instance) {
      PhoneVerificationService.instance = new PhoneVerificationService();
    }
    return PhoneVerificationService.instance;
  }

  // ==================== PUBLIC METHODS ====================

  /**
   * Initialize reCAPTCHA verifier
   * تهيئة reCAPTCHA
   */
  initializeRecaptcha(containerId: string = 'recaptcha-container'): void {
    if (this.recaptchaVerifier) {
      this.recaptchaVerifier.clear();
    }

    this.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        console.log('✅ reCAPTCHA solved');
      },
      'expired-callback': () => {
        console.warn('⚠️ reCAPTCHA expired');
      }
    });
  }

  /**
   * Send verification code to Bulgarian phone number
   * إرسال رمز التحقق لرقم بلغاري
   */
  async sendVerificationCode(phoneNumber: string): Promise<PhoneVerificationResult> {
    try {
      // 1. Validate Bulgarian phone format
      const formattedPhone = this.formatBulgarianPhone(phoneNumber);
      
      if (!this.isValidBulgarianPhone(formattedPhone)) {
        return {
          success: false,
          message: 'Невалиден български номер / Invalid Bulgarian number'
        };
      }

      // 2. Initialize reCAPTCHA if not done
      if (!this.recaptchaVerifier) {
        this.initializeRecaptcha();
      }

      // 3. Send SMS
      console.log('📱 Sending SMS to:', formattedPhone);
      
      this.confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        this.recaptchaVerifier!
      );

      console.log('✅ SMS sent successfully');

      return {
        success: true,
        message: 'Код изпратен / Code sent',
        verificationId: this.confirmationResult.verificationId
      };

    } catch (error: any) {
      console.error('❌ SMS send failed:', error);
      return {
        success: false,
        message: this.getErrorMessage(error.code)
      };
    }
  }

  /**
   * Verify OTP code
   * التحقق من رمز OTP
   */
  async verifyCode(code: string): Promise<OTPVerificationResult> {
    try {
      if (!this.confirmationResult) {
        return {
          success: false,
          message: 'Моля, първо поискайте код / Please request code first'
        };
      }

      // 1. Verify code
      console.log('🔐 Verifying code...');
      const result = await this.confirmationResult.confirm(code);

      // 2. Update user verification status in Firestore
      const userId = result.user.uid;
      await updateDoc(doc(db, 'users', userId), {
        'verification.phone.verified': true,
        'verification.phone.verifiedAt': serverTimestamp(),
        'verification.phone.number': result.user.phoneNumber,
        updatedAt: serverTimestamp()
      });

      // 3. Award badge
      await trustScoreService.awardBadge(userId, 'PHONE_VERIFIED');

      // 4. Recalculate trust score
      await trustScoreService.calculateTrustScore(userId);

      console.log('✅ Phone verified successfully');

      return {
        success: true,
        message: 'Телефонът е потвърден / Phone verified',
        phoneNumber: result.user.phoneNumber || undefined
      };

    } catch (error: any) {
      console.error('❌ Verification failed:', error);
      return {
        success: false,
        message: this.getErrorMessage(error.code)
      };
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Format Bulgarian phone number to E.164
   * تنسيق رقم بلغاري إلى E.164
   */
  private formatBulgarianPhone(phone: string): string {
    // Remove all non-digits
    let digits = phone.replace(/\D/g, '');

    // Handle different formats
    if (digits.startsWith('359')) {
      // Already has country code
      return `+${digits}`;
    } else if (digits.startsWith('0')) {
      // Local format: 0888123456 → +359888123456
      return `+359${digits.substring(1)}`;
    } else {
      // No prefix: 888123456 → +359888123456
      return `+359${digits}`;
    }
  }

  /**
   * Validate Bulgarian phone number
   * التحقق من رقم بلغاري
   */
  private isValidBulgarianPhone(phone: string): boolean {
    // Bulgarian mobile: +359 8X XXX XXXX or +359 9X XXX XXXX
    const regex = /^\+359[89]\d{8}$/;
    return regex.test(phone);
  }

  /**
   * Get user-friendly error message
   * الحصول على رسالة خطأ مفهومة
   */
  private getErrorMessage(code: string): string {
    const messages: { [key: string]: string } = {
      'auth/invalid-phone-number': 'Невалиден телефонен номер / Invalid phone number',
      'auth/too-many-requests': 'Твърде много опити. Опитайте по-късно / Too many attempts',
      'auth/quota-exceeded': 'Квотата е изчерпана / Quota exceeded',
      'auth/invalid-verification-code': 'Невалиден код / Invalid code',
      'auth/code-expired': 'Кодът е изтекъл / Code expired',
      'auth/missing-phone-number': 'Липсва телефонен номер / Missing phone number'
    };

    return messages[code] || 'Грешка при верификация / Verification error';
  }

  /**
   * Clean up verifier
   * تنظيف المُحقق
   */
  cleanup(): void {
    if (this.recaptchaVerifier) {
      this.recaptchaVerifier.clear();
      this.recaptchaVerifier = null;
    }
    this.confirmationResult = null;
  }
}

// Export singleton instance
export const phoneVerificationService = PhoneVerificationService.getInstance();
