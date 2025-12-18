// src/services/email-verification.ts
// Email Verification Service for Bulgarian Car Marketplace

import { 
  sendEmailVerification, 
  applyActionCode,
  checkActionCode,
  verifyBeforeUpdateEmail,
  User
} from 'firebase/auth';
import { auth } from '../firebase/firebase-config';
import { serviceLogger } from './logger-service';

export interface EmailVerificationResult {
  success: boolean;
  message: string;
  code?: string;
}

export interface ActionCodeInfo {
  email: string;
  previousEmail?: string;
}

export class EmailVerificationService {
  /**
   * Send email verification to current user
   * @param user - Firebase user object
   * @param language - Language for email template ('bg' | 'en' | 'ar')
   * @returns Promise with verification result
   */
  static async sendVerificationEmail(
    user: User, 
    language: 'bg' | 'en' | 'ar' = 'bg'
  ): Promise<EmailVerificationResult> {
    try {
      if (!user) {
        return {
          success: false,
          message: language === 'bg' 
            ? 'Потребителят не е намерен'
            : language === 'ar'
            ? 'لم يتم العثور على المستخدم'
            : 'User not found'
        };
      }

      if (user.emailVerified) {
        return {
          success: false,
          message: language === 'bg'
            ? 'Имейлът вече е потвърден'
            : language === 'ar'
            ? 'تم التحقق من الإيميل بالفعل'
            : 'Email is already verified'
        };
      }

      // Configure action code settings for custom email templates
      const actionCodeSettings = {
        url: `${window.location.origin}/email-verified?lang=${language}`,
        handleCodeInApp: true,
        iOS: {
          bundleId: 'bg.globulcars.app'
        },
        android: {
          packageName: 'bg.globulcars.app',
          installApp: true,
          minimumVersion: '1.0'
        },
        dynamicLinkDomain: 'globulcars.page.link'
      };

      await sendEmailVerification(user, actionCodeSettings);

      return {
        success: true,
        message: language === 'bg'
          ? `Имейл за потвърждение е изпратен на ${user.email}`
          : language === 'ar'
          ? `تم إرسال رسالة التحقق إلى ${user.email}`
          : `Verification email sent to ${user.email}`
      };

    } catch (error: unknown) {
      serviceLogger.error('Email verification error', error as Error, { email: user?.email });
      
      let errorMessage: string;
      
      switch (error.code) {
        case 'auth/too-many-requests':
          errorMessage = language === 'bg'
            ? 'Твърде много заявки. Моля, опитайте отново по-късно'
            : language === 'ar'
            ? 'طلبات كثيرة جداً. يرجى المحاولة لاحقاً'
            : 'Too many requests. Please try again later';
          break;
        case 'auth/user-disabled':
          errorMessage = language === 'bg'
            ? 'Акаунтът е деактивиран'
            : language === 'ar'
            ? 'تم إلغاء تفعيل الحساب'
            : 'Account has been disabled';
          break;
        case 'auth/user-not-found':
          errorMessage = language === 'bg'
            ? 'Потребителят не е намерен'
            : language === 'ar'
            ? 'لم يتم العثور على المستخدم'
            : 'User not found';
          break;
        default:
          errorMessage = language === 'bg'
            ? 'Грешка при изпращане на имейл за потвърждение'
            : language === 'ar'
            ? 'خطأ في إرسال رسالة التحقق'
            : 'Error sending verification email';
      }

      return {
        success: false,
        message: errorMessage,
        code: error.code
      };
    }
  }

  /**
   * Verify email with action code
   * @param actionCode - Action code from email link
   * @returns Promise with verification result
   */
  static async verifyEmailWithCode(actionCode: string): Promise<EmailVerificationResult> {
    try {
      // Check if the action code is valid first
      await checkActionCode(auth, actionCode);
      
      // Apply the action code to verify the email
      await applyActionCode(auth, actionCode);

      return {
        success: true,
        message: 'Email verified successfully'
      };

    } catch (error: unknown) {
      serviceLogger.error('Email verification with code error', error as Error, { actionCode });
      
      let errorMessage: string;
      
      switch (error.code) {
        case 'auth/expired-action-code':
          errorMessage = 'Verification link has expired. Please request a new one.';
          break;
        case 'auth/invalid-action-code':
          errorMessage = 'Invalid verification link. Please request a new one.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Account has been disabled.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'User not found.';
          break;
        default:
          errorMessage = 'Error verifying email. Please try again.';
      }

      return {
        success: false,
        message: errorMessage,
        code: error.code
      };
    }
  }

  /**
   * Get action code info (useful for checking what the code is for)
   * @param actionCode - Action code from email link
   * @returns Promise with action code information
   */
  static async getActionCodeInfo(actionCode: string): Promise<ActionCodeInfo | null> {
    try {
      const info = await checkActionCode(auth, actionCode);
      return {
        email: info.data.email || '',
        previousEmail: info.data.previousEmail || undefined
      };
    } catch (error: unknown) {
      serviceLogger.error('Get action code info error', error as Error, { actionCode });
      return null;
    }
  }

  /**
   * Send verification email before changing user's email
   * @param user - Firebase user object
   * @param newEmail - New email address
   * @param language - Language for email template
   * @returns Promise with verification result
   */
  static async verifyBeforeEmailUpdate(
    user: User,
    newEmail: string,
    language: 'bg' | 'en' | 'ar' = 'bg'
  ): Promise<EmailVerificationResult> {
    try {
      const actionCodeSettings = {
        url: `${window.location.origin}/email-update-verified?lang=${language}`,
        handleCodeInApp: true
      };

      await verifyBeforeUpdateEmail(user, newEmail, actionCodeSettings);

      return {
        success: true,
        message: language === 'bg'
          ? `Имейл за потвърждение е изпратен на ${newEmail}`
          : language === 'ar'
          ? `تم إرسال رسالة التحقق إلى ${newEmail}`
          : `Verification email sent to ${newEmail}`
      };

    } catch (error: unknown) {
      serviceLogger.error('Email update verification error', error as Error, { newEmail });
      
      let errorMessage: string;
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = language === 'bg'
            ? 'Този имейл вече се използва'
            : language === 'ar'
            ? 'هذا الإيميل مستخدم بالفعل'
            : 'Email is already in use';
          break;
        case 'auth/invalid-email':
          errorMessage = language === 'bg'
            ? 'Невалиден имейл адрес'
            : language === 'ar'
            ? 'عنوان إيميل غير صالح'
            : 'Invalid email address';
          break;
        case 'auth/requires-recent-login':
          errorMessage = language === 'bg'
            ? 'Моля, влезте отново за да промените имейла'
            : language === 'ar'
            ? 'يرجى تسجيل الدخول مرة أخرى لتغيير الإيميل'
            : 'Please sign in again to change email';
          break;
        default:
          errorMessage = language === 'bg'
            ? 'Грешка при промяна на имейл'
            : language === 'ar'
            ? 'خطأ في تغيير الإيميل'
            : 'Error changing email';
      }

      return {
        success: false,
        message: errorMessage,
        code: error.code
      };
    }
  }

  /**
   * Check if current user's email is verified
   * @param user - Firebase user object
   * @returns boolean indicating if email is verified
   */
  static isEmailVerified(user: User | null): boolean {
    return user ? user.emailVerified : false;
  }

  /**
   * Reload user to get latest verification status
   * @param user - Firebase user object
   * @returns Promise with updated user
   */
  static async reloadUser(user: User): Promise<void> {
    try {
      await user.reload();
    } catch (error) {
      serviceLogger.error('Error reloading user', error as Error, { email: user?.email });
    }
  }
}

export default EmailVerificationService;