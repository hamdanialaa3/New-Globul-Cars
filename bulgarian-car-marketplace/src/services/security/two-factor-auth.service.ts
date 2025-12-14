// src/services/security/two-factor-auth.service.ts
// Two-Factor Authentication Service
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import { 
  RecaptchaVerifier,
  PhoneAuthProvider,
  signInWithPhoneNumber,
  ConfirmationResult,
  multiFactor,
  PhoneMultiFactorGenerator
} from 'firebase/auth';
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/firebase-config';
import { logger } from '../logger-service';

interface TwoFactorSetup {
  success: boolean;
  message: string;
  verificationId?: string;
}

interface TwoFactorVerification {
  success: boolean;
  message: string;
}

class TwoFactorAuthService {
  private static instance: TwoFactorAuthService;
  private recaptchaVerifier: RecaptchaVerifier | null = null;
  private confirmationResult: ConfirmationResult | null = null;
  
  private constructor() {}
  
  static getInstance(): TwoFactorAuthService {
    if (!this.instance) {
      this.instance = new TwoFactorAuthService();
    }
    return this.instance;
  }

  /**
   * Initialize reCAPTCHA verifier
   */
  initializeRecaptcha(containerId: string): void {
    if (this.recaptchaVerifier) {
      this.recaptchaVerifier.clear();
    }

    this.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      'size': 'invisible',
      'callback': () => {
        if (process.env.NODE_ENV === 'development') {
          logger.debug('reCAPTCHA solved');
        }
      }
    });
  }

  /**
   * Send OTP to phone number
   */
  async sendOTP(phoneNumber: string): Promise<TwoFactorSetup> {
    try {
      if (!this.recaptchaVerifier) {
        return {
          success: false,
          message: 'reCAPTCHA не е инициализиран / reCAPTCHA not initialized'
        };
      }

      // Format Bulgarian phone number
      const formattedPhone = this.formatBulgarianPhone(phoneNumber);
      
      this.confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        this.recaptchaVerifier
      );

      if (process.env.NODE_ENV === 'development') {
        logger.debug('OTP sent to phone', { formattedPhone });
      }

      return {
        success: true,
        message: 'Кодът е изпратен / Code sent',
        verificationId: this.confirmationResult.verificationId
      };
    } catch (error: unknown) {
      logger.error('Send OTP error', error as Error, { errorCode: error.code });
      return {
        success: false,
        message: this.getErrorMessage(error.code)
      };
    }
  }

  /**
   * Verify OTP code
   */
  async verifyOTP(code: string, userId: string): Promise<TwoFactorVerification> {
    try {
      if (!this.confirmationResult) {
        return {
          success: false,
          message: 'Няма активна верификация / No active verification'
        };
      }

      await this.confirmationResult.confirm(code);

      // Update user's 2FA status
      await updateDoc(doc(db, 'users', userId), {
        'security.twoFactorEnabled': true,
        'security.twoFactorEnabledAt': serverTimestamp(),
        'security.twoFactorMethod': 'sms'
      });

      if (process.env.NODE_ENV === 'development') {
        logger.debug('2FA enabled for user', { userId });
      }

      return {
        success: true,
        message: 'Двуфакторната автентикация е активирана / 2FA enabled'
      };
    } catch (error: unknown) {
      logger.error('Verify OTP error', error as Error, { userId });
      return {
        success: false,
        message: 'Невалиден код / Invalid code'
      };
    }
  }

  /**
   * Disable 2FA
   */
  async disable2FA(userId: string): Promise<TwoFactorVerification> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        'security.twoFactorEnabled': false,
        'security.twoFactorDisabledAt': serverTimestamp()
      });

      return {
        success: true,
        message: '2FA деактивирана / 2FA disabled'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Грешка / Error'
      };
    }
  }

  /**
   * Generate backup codes
   */
  generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      codes.push(this.generateRandomCode(8));
    }
    return codes;
  }

  /**
   * Save backup codes to Firestore
   */
  async saveBackupCodes(userId: string, codes: string[]): Promise<void> {
    const hashedCodes = codes.map(code => this.hashCode(code));
    
    await updateDoc(doc(db, 'users', userId), {
      'security.backupCodes': hashedCodes,
      'security.backupCodesGeneratedAt': serverTimestamp()
    });
  }

  /**
   * Verify backup code
   */
  async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();
      const backupCodes = userData?.security?.backupCodes || [];
      
      const hashedCode = this.hashCode(code);
      const index = backupCodes.indexOf(hashedCode);
      
      if (index === -1) return false;
      
      // Remove used code
      backupCodes.splice(index, 1);
      await updateDoc(doc(db, 'users', userId), {
        'security.backupCodes': backupCodes
      });
      
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Format Bulgarian phone number
   */
  private formatBulgarianPhone(phone: string): string {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // If starts with 0, replace with +359
    if (cleaned.startsWith('0')) {
      cleaned = '359' + cleaned.substring(1);
    }
    
    // Add + if not present
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }
    
    return cleaned;
  }

  /**
   * Generate random code
   */
  private generateRandomCode(length: number): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Simple hash function for backup codes
   */
  private hashCode(code: string): string {
    let hash = 0;
    for (let i = 0; i < code.length; i++) {
      const char = code.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  /**
   * Get user-friendly error message
   */
  private getErrorMessage(code: string): string {
    const messages: Record<string, string> = {
      'auth/invalid-phone-number': 'Невалиден телефонен номер / Invalid phone number',
      'auth/too-many-requests': 'Твърде много опити. Опитайте по-късно / Too many attempts',
      'auth/quota-exceeded': 'Квотата е изчерпана / Quota exceeded'
    };
    
    return messages[code] || 'Неизвестна грешка / Unknown error';
  }

  /**
   * Clean up
   */
  cleanup(): void {
    if (this.recaptchaVerifier) {
      this.recaptchaVerifier.clear();
      this.recaptchaVerifier = null;
    }
    this.confirmationResult = null;
  }
}

export const twoFactorAuthService = TwoFactorAuthService.getInstance();

