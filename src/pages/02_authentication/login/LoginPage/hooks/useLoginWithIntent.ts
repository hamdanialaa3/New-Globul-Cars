// Enhanced useLogin Hook مع دعم Intent Preservation
// يتعامل مع حفظ واستعادة نية الدخول إلى صفحة البروفايل

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import { useProfileIntent } from '@/hooks/useProfileIntent';
import { SocialAuthService } from '@/firebase/social-auth-service';
import { bulgarianAuthService } from '@/firebase';
import { LoginFormData, LoginState, LoginActions, UseLoginReturn } from '../types';
import { logger } from '@/services/logger-service';

export const useLoginWithIntent = (): UseLoginReturn => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { returnToIntent } = useProfileIntent();

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  /**
   * الحصول على مسار العودة بعد النجاح
   * الأولوية:
   * 1. Intent المحفوظ (من محاولة دخول صفحة محمية)
   * 2. Query parameter ?redirect=
   * 3. Location state (من Navigate component)
   * 4. الصفحة الرئيسية
   */
  const getRedirectPath = (): string => {
    // الأولوية 1: تحقق من Intent المحفوظ
    const intentData = sessionStorage.getItem('profile_intent');
    if (intentData) {
      try {
        const intent = JSON.parse(intentData);
        if (intent.returnUrl) {
          logger.info(`[useLoginWithIntent] Found saved intent: ${intent.returnUrl}`);
          return intent.returnUrl;
        }
      } catch (err) {
        logger.error('[useLoginWithIntent] Failed to parse saved intent:', err);
      }
    }

    // الأولوية 2: تحقق من query parameter
    const redirectParam = searchParams.get('redirect');
    if (redirectParam) {
      return redirectParam;
    }

    // الأولوية 3: تحقق من location state
    const locationState = location.state as { from?: { pathname: string } } | null;
    if (locationState?.from?.pathname) {
      return locationState.from.pathname;
    }

    // افتراضي: الصفحة الرئيسية
    return '/';
  };

  const state: LoginState = {
    formData,
    showPassword,
    loading,
    error,
    success,
    validationErrors
  };

  // إعادة التوجيه إذا كان المستخدم مسجل دخول بالفعل
  useEffect(() => {
    if (user) {
      const redirectPath = getRedirectPath();
      logger.info(`[useLoginWithIntent] User authenticated, redirecting to: ${redirectPath}`);
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.email.trim()) {
      errors.email = t('auth.emailRequired', 'البريد الإلكتروني مطلوب');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = t('auth.emailInvalid', 'يرجى إدخال بريد إلكتروني صحيح');
    }

    if (!formData.password) {
      errors.password = t('auth.passwordRequired', 'كلمة المرور مطلوبة');
    } else if (formData.password.length < 6) {
      errors.password = t('auth.passwordTooShort', 'يجب أن تكون كلمة المرور 6 أحرف على الأقل');
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      logger.warn('[useLoginWithIntent] Form validation failed');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      logger.info('[useLoginWithIntent] Attempting email/password login');

      await bulgarianAuthService.loginWithEmail(formData.email, formData.password);

      setSuccess(t('auth.loginSuccess', 'تم تسجيل الدخول بنجاح'));
      logger.info('[useLoginWithIntent] Login successful');

      // لا تقم بالتنقل هنا - useEffect سيقوم به تلقائياً عند تحديث user context
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل تسجيل الدخول';
      setError(errorMessage);
      logger.error('[useLoginWithIntent] Login failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      logger.info('[useLoginWithIntent] Attempting Google login');
      await SocialAuthService.loginWithGoogle();
      setSuccess(t('auth.loginSuccess', 'تم تسجيل الدخول بنجاح'));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل تسجيل الدخول عبر Google';
      setError(errorMessage);
      logger.error('[useLoginWithIntent] Google login failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      logger.info('[useLoginWithIntent] Attempting Facebook login');
      await SocialAuthService.loginWithFacebook();
      setSuccess(t('auth.loginSuccess', 'تم تسجيل الدخول بنجاح'));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل تسجيل الدخول عبر Facebook';
      setError(errorMessage);
      logger.error('[useLoginWithIntent] Facebook login failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      logger.info('[useLoginWithIntent] Attempting Apple login');
      await SocialAuthService.loginWithApple();
      setSuccess(t('auth.loginSuccess', 'تم تسجيل الدخول بنجاح'));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل تسجيل الدخول عبر Apple';
      setError(errorMessage);
      logger.error('[useLoginWithIntent] Apple login failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      logger.info('[useLoginWithIntent] Attempting anonymous login');
      await bulgarianAuthService.signInAnonymously();
      setSuccess(t('auth.loginSuccess', 'تم تسجيل الدخول بنجاح'));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل تسجيل الدخول المجهول';
      setError(errorMessage);
      logger.error('[useLoginWithIntent] Anonymous login failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const actions: LoginActions = {
    handleInputChange,
    handleSubmit,
    handleGoogleLogin,
    handleFacebookLogin,
    handleAppleLogin,
    handleAnonymousLogin,
    setShowPassword
  };

  return { state, actions };
};

// Export الأصلية للتوافقية العكسية
export { useLoginWithIntent as useLogin };
