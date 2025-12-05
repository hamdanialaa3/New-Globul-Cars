// src/hooks/useEmailVerification.ts
// Custom hook for email verification functionality

import { useState, useEffect, useCallback } from 'react';
import { EmailVerificationService } from '@globul-cars/services/email-verification';
import { useAuth } from '@globul-cars/core/contextsAuthProvider';
import { useTranslation } from './useTranslation';

interface UseEmailVerificationResult {
  isVerified: boolean;
  isLoading: boolean;
  error: string | null;
  sendVerification: () => Promise<void>;
  checkStatus: () => Promise<void>;
  canResend: boolean;
  countdown: number;
}

export const useEmailVerification = (): UseEmailVerificationResult => {
  const { currentUser } = useAuth();
  const { language } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Auto-check verification status periodically
  useEffect(() => {
    if (!currentUser || currentUser.emailVerified) return;

    const interval = setInterval(async () => {
      if (!isLoading) {
        await EmailVerificationService.reloadUser(currentUser);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [currentUser, isLoading]);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const sendVerification = useCallback(async () => {
    if (!currentUser || countdown > 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await EmailVerificationService.sendVerificationEmail(
        currentUser,
        language as 'bg' | 'en'
      );

      if (!result.success) {
        setError(result.message);
      } else {
        setCountdown(60); // 60 seconds cooldown
      }
    } catch (err: any) {
      setError(
        language === 'bg'
          ? 'Грешка при изпращане на имейл за потвърждение'
          : 'Error sending verification email'
      );
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, language, countdown]);

  const checkStatus = useCallback(async () => {
    if (!currentUser) return;

    setIsLoading(true);
    setError(null);

    try {
      await EmailVerificationService.reloadUser(currentUser);
      
      if (!currentUser.emailVerified) {
        setError(
          language === 'bg'
            ? 'Имейлът все още не е потвърден'
            : 'Email not yet verified'
        );
      }
    } catch (err: any) {
      setError(
        language === 'bg'
          ? 'Грешка при проверка на статуса'
          : 'Error checking status'
      );
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, language]);

  return {
    isVerified: currentUser?.emailVerified ?? false,
    isLoading,
    error,
    sendVerification,
    checkStatus,
    canResend: countdown === 0 && !isLoading,
    countdown
  };
};

export default useEmailVerification;