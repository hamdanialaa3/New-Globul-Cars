// Hook لحفظ واستعادة نية المستخدم عند الدخول إلى صفحة البروفايل
// Intent Preservation Pattern - يحفظ الـ URL ويعود إليه بعد Login

import { useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { logger } from '@/services/logger-service';

const INTENT_STORAGE_KEY = 'profile_intent';

interface ProfileIntent {
  returnUrl: string;
  timestamp: number;
}

/**
 * Hook لإدارة نية الدخول إلى صفحة البروفايل
 * 
 * الاستخدام:
 * 1. في صفحة البروفايل: حفظ النية عند محاولة دخول بدون تسجيل
 * 2. في صفحة Login: استرجاع النية والعودة بعد النجاح
 */
export const useProfileIntent = () => {
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * حفظ نية الدخول (عندما لم يكن المستخدم مسجل دخول)
   */
  const saveIntent = useCallback((returnUrl: string) => {
    const intent: ProfileIntent = {
      returnUrl,
      timestamp: Date.now(),
    };

    try {
      sessionStorage.setItem(INTENT_STORAGE_KEY, JSON.stringify(intent));
      logger.info(`[ProfileIntent] Saved intent to return to: ${returnUrl}`);
    } catch (err) {
      logger.error('[ProfileIntent] Failed to save intent:', err);
    }
  }, []);

  /**
   * استرجاع النية (بعد تسجيل الدخول بنجاح)
   * Returns the intent and automatically clears it
   */
  const getIntent = useCallback(() => {
    try {
      const intentData = sessionStorage.getItem(INTENT_STORAGE_KEY);
      
      if (!intentData) {
        logger.info('[ProfileIntent] No saved intent found');
        return null;
      }

      const intent: ProfileIntent = JSON.parse(intentData);
      
      // تحقق من أن النية لا تزال حديثة (أقل من ساعة)
      const isExpired = Date.now() - intent.timestamp > 60 * 60 * 1000;
      if (isExpired) {
        logger.warn('[ProfileIntent] Intent has expired');
        clearIntent();
        return null;
      }

      logger.info(`[ProfileIntent] Restored intent, returning to: ${intent.returnUrl}`);
      clearIntent();
      return intent;
    } catch (err) {
      logger.error('[ProfileIntent] Failed to restore intent:', err);
      clearIntent();
      return null;
    }
  }, []);

  /**
   * حذف النية بعد استخدامها
   */
  const clearIntent = useCallback(() => {
    try {
      sessionStorage.removeItem(INTENT_STORAGE_KEY);
      logger.info('[ProfileIntent] Intent cleared');
    } catch (err) {
      logger.error('[ProfileIntent] Failed to clear intent:', err);
    }
  }, []);

  /**
   * العودة إلى الـ URL المحفوظ
   */
  const returnToIntent = useCallback(() => {
    const intent = getIntent();
    if (intent?.returnUrl) {
      navigate(intent.returnUrl, { replace: true });
      return true;
    }
    return false;
  }, [navigate, getIntent]);

  return {
    saveIntent,
    getIntent,
    clearIntent,
    returnToIntent,
  };
};
