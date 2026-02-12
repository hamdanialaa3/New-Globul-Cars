// src/services/security/two-factor-auth.service.ts
// Two-Factor Authentication Service
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import {
  RecaptchaVerifier,
  PhoneAuthProvider,
  signInWithPhoneNumber,
  ConfirmationResult,
  multiFactor,
  PhoneMultiFactorGenerator,
  MultiFactorSession,
  MultiFactorResolver,
  User,
  getMultiFactorResolver,
  PhoneMultiFactorAssertion
} from 'firebase/auth';
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/firebase-config';
import { logger } from '../logger-service';

interface TwoFactorSetup {
  success: boolean;
  message: string;
  verificationId?: string;
  resolver?: MultiFactorResolver; // Added resolver
}

interface TwoFactorVerification {
  success: boolean;
  message: string;
  user?: User; // Return user object on successful sign-in
}

class TwoFactorAuthService {
  private static instance: TwoFactorAuthService;
  private recaptchaVerifier: RecaptchaVerifier | null = null;
  private confirmationResult: ConfirmationResult | null = null;
  private verificationId: string | null = null;
  private resolver: MultiFactorResolver | null = null;

  private constructor() { }

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
      try {
        this.recaptchaVerifier.clear();
      } catch (e) {
        // ignore
      }
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
   * Start 2FA Enrollment (Native Firebase MFA)
   * This prepares the verification code to be sent to the user
   */
  async startEnrollment(user: User, phoneNumber: string): Promise<TwoFactorSetup> {
    try {
      if (!this.recaptchaVerifier) {
        throw new Error('reCAPTCHA not initialized');
      }

      const formattedPhone = this.formatBulgarianPhone(phoneNumber);
      const session = await multiFactor(user).getSession();

      const phoneOptions = {
        phoneNumber: formattedPhone,
        session: session
      };

      const phoneAuthProvider = new PhoneAuthProvider(auth);
      this.verificationId = await phoneAuthProvider.verifyPhoneNumber(
        phoneOptions,
        this.recaptchaVerifier
      );

      return {
        success: true,
        message: 'Кодът е изпратен / Code sent',
        verificationId: this.verificationId
      };
    } catch (error: any) {
      logger.error('MFA Enrollment error', error);
      return {
        success: false,
        message: this.getErrorMessage(error.code || error.message)
      };
    }
  }

  /**
   * Complete 2FA Enrollment
   */
  async finishEnrollment(user: User, code: string, displayName?: string): Promise<TwoFactorVerification> {
    try {
      if (!this.verificationId) {
        throw new Error('No verification ID found');
      }

      const cred = PhoneAuthProvider.credential(this.verificationId, code);
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);

      await multiFactor(user).enroll(multiFactorAssertion, displayName || 'SMS');

      // Also update firestore for consistency with legacy system
      await updateDoc(doc(db, 'users', user.uid), {
        'security.twoFactorEnabled': true,
        'security.twoFactorEnabledAt': serverTimestamp(),
        'security.twoFactorMethod': 'sms'
      });

      return {
        success: true,
        message: '2FA успешно активирана / 2FA successfully enabled'
      };
    } catch (error: any) {
      logger.error('MFA Finalize error', error);
      return {
        success: false,
        message: this.getErrorMessage(error.code || 'enrollment-failed')
      };
    }
  }

  /**
   * Handle MFA Challenge during Sign-In
   * This is called when signInWithEmailAndPassword fails with auth/multi-factor-auth-required
   */
  async handleMFAChallenge(error: any, selectedIndex: number = 0): Promise<TwoFactorSetup> {
    try {
      if (!this.recaptchaVerifier) {
        throw new Error('reCAPTCHA not initialized');
      }

      const resolver = getMultiFactorResolver(auth, error);
      this.resolver = resolver;

      if (resolver.hints.length === 0) {
        throw new Error('No 2FA methods enrolled');
      }

      // Automatically select the first hint usually, or let user choose
      const hint = resolver.hints[selectedIndex];
      const sessionId = resolver.session;

      const phoneAuthProvider = new PhoneAuthProvider(auth);

      const phoneInfoOptions = {
        multiFactorHint: hint,
        session: sessionId
      };

      this.verificationId = await phoneAuthProvider.verifyPhoneNumber(
        phoneInfoOptions,
        this.recaptchaVerifier
      );

      return {
        success: true,
        message: 'Кодът е изпратен / Code sent',
        verificationId: this.verificationId,
        resolver: resolver
      };
    } catch (err: any) {
      logger.error('MFA Challenge error', err);
      return {
        success: false,
        message: this.getErrorMessage(err.code || 'challenge-failed')
      };
    }
  }

  /**
   * Verify MFA Challenge Code and Finish Sign-In
   */
  async verifyMFAChallenge(code: string): Promise<TwoFactorVerification> {
    try {
      if (!this.verificationId || !this.resolver) {
        throw new Error('No active MFA challenge');
      }

      const cred = PhoneAuthProvider.credential(this.verificationId, code);
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);

      const userCredential = await this.resolver.resolveSignIn(multiFactorAssertion);

      return {
        success: true,
        message: 'Успешен вход / Successful sign-in',
        user: userCredential.user
      };
    } catch (error: any) {
      logger.error('MFA Verify error', error);
      return {
        success: false,
        message: this.getErrorMessage(error.code || 'verification-failed')
      };
    }
  }

  /**
   * Legacy: Send OTP to phone number (Keep for backward compatibility or simple phone auth)
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
    } catch (error: any) {
      logger.error('Send OTP error', error as Error, { errorCode: (error as any).code });
      return {
        success: false,
        message: this.getErrorMessage(error.code)
      };
    }
  }

  /**
   * Legacy: Verify OTP code
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
   * Note: This only disables the Firestore flag. 
   * To truly disable Firebase MFA, we need to unenroll using the SDK, but that requires re-authentication.
   */
  async disable2FA(user: User | string): Promise<TwoFactorVerification> {
    try {
      // Handle backward compatibility where userId: string passed
      let uid = '';
      let firebaseUser: User | null = null;

      if (typeof user === 'string') {
        uid = user;
        if (auth.currentUser && auth.currentUser.uid === uid) {
          firebaseUser = auth.currentUser;
        }
      } else {
        uid = user.uid;
        firebaseUser = user;
      }

      if (firebaseUser) {
        const enrolledFactors = multiFactor(firebaseUser).enrolledFactors;
        if (enrolledFactors.length > 0) {
          // Unenroll from all SMS factors
          /* Note: Unenrollment requires recent login. 
             In a real scenario, we would loop through and user.unenroll(factor.uid)
          */
          for (const factor of enrolledFactors) {
            await multiFactor(firebaseUser).unenroll(factor);
          }
        }
      }

      await updateDoc(doc(db, 'users', uid), {
        'security.twoFactorEnabled': false,
        'security.twoFactorDisabledAt': serverTimestamp()
      });

      return {
        success: true,
        message: '2FA деактивирана / 2FA disabled'
      };
    } catch (error) {
      logger.error('Disable 2FA error', error as Error);
      return {
        success: false,
        message: 'Грешка при деактивиране / Error disabling 2FA'
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
      'auth/quota-exceeded': 'Квотата е изчерпана / Quota exceeded',
      'auth/multi-factor-auth-required': 'Изисква се двуфакторна автентикация / MFA Required',
      'auth/code-expired': 'Кодът е изтекъл / Code expired',
      'auth/invalid-verification-code': 'Невалиден код / Invalid code'
    };

    return messages[code] || `Грешка / Error: ${code}`;
  }

  /**
   * Clean up
   */
  cleanup(): void {
    if (this.recaptchaVerifier) {
      try {
        this.recaptchaVerifier.clear();
      } catch (e) {
        // ignore
      }
      this.recaptchaVerifier = null;
    }
    this.confirmationResult = null;
    this.verificationId = null;
    this.resolver = null;
  }
}

export const twoFactorAuthService = TwoFactorAuthService.getInstance();
