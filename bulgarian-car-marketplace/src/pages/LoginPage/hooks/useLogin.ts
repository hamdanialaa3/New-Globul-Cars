import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../../hooks/useTranslation';
import { useAuth } from '../../../hooks/useAuth';
import { SocialAuthService } from '../../../firebase/social-auth-service';
import { LoginFormData, LoginState, LoginActions, UseLoginReturn } from '../types';
import { logger } from '../../../services/logger-service';

export const useLogin = (): UseLoginReturn => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

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

  const state: LoginState = {
    formData,
    showPassword,
    loading,
    error,
    success,
    validationErrors
  };

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/profile');  // Changed from /dashboard to /profile
    }
  }, [user, navigate]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.email.trim()) {
      errors.email = t('auth.emailRequired', 'Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = t('auth.emailInvalid', 'Please enter a valid email');
    }

    if (!formData.password) {
      errors.password = t('auth.passwordRequired', 'Password is required');
    } else if (formData.password.length < 6) {
      errors.password = t('auth.passwordTooShort', 'Password must be at least 6 characters');
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

    // (Comment removed - was in Arabic)
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
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await SocialAuthService.signInWithEmailAndPassword(
        formData.email,
        formData.password
      );

      if (result && result.user) {
        setSuccess(t('auth.loginSuccess', 'Login successful! Redirecting...'));
        setTimeout(() => {
          navigate('/profile');  // Changed from /dashboard to /profile
        }, 1000);
      } else {
        setError(t('auth.loginFailed', 'Login failed. Please try again.'));
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(t('auth.unexpectedError', 'An unexpected error occurred. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Initiating Google login');
      }
      
      const result = await SocialAuthService.signInWithGoogle();
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Google login successful', { userId: result.user.uid });
      }
      setSuccess(t('auth.loginSuccess', 'تم تسجيل الدخول بنجاح! جاري التوجيه...'));
      setTimeout(() => {
        navigate('/profile');  // Changed from /dashboard to /profile
      }, 1000);
    } catch (err: any) {
      logger.error('Google login error', err as Error, {
        errorCode: err?.code,
        currentURL: window.location.href,
        protocol: window.location.protocol,
        host: window.location.host,
        hasApiKey: !!process.env.REACT_APP_FIREBASE_API_KEY,
        hasAuthDomain: !!process.env.REACT_APP_FIREBASE_AUTH_DOMAIN
      });

      // User-friendly error message
      const userMessage = err?.message || 'حدث خطأ أثناء تسجيل الدخول مع Google. يرجى المحاولة مرة أخرى.';
      setError(userMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Initiating Facebook login');
      }
      const result = await SocialAuthService.signInWithFacebook();
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Facebook login successful', { userId: result.user.uid });
      }
      setSuccess(t('auth.loginSuccess', 'تم تسجيل الدخول بنجاح! جاري التوجيه...'));
      setTimeout(() => {
        navigate('/profile');  // Changed from /dashboard to /profile
      }, 1000);
    } catch (err: any) {
      logger.error('Facebook login error', err as Error, { errorCode: err?.code });
      const userMessage = err?.message || 'حدث خطأ أثناء تسجيل الدخول مع Facebook. يرجى المحاولة مرة أخرى.';
      setError(userMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Initiating Apple login');
      }
      const result = await SocialAuthService.signInWithApple();
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Apple login successful', { userId: result.user.uid });
      }
      setSuccess(t('auth.loginSuccess', 'تم تسجيل الدخول بنجاح! جاري التوجيه...'));
      setTimeout(() => {
        navigate('/profile');  // Changed from /dashboard to /profile
      }, 1000);
    } catch (err: any) {
      console.error('❌ Apple login error:', err);
      const userMessage = err?.message || 'حدث خطأ أثناء تسجيل الدخول مع Apple. يرجى المحاولة مرة أخرى.';
      setError(userMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneLogin = async () => {
    // Phone login will be handled by PhoneAuthModal
    // This is just a placeholder
    return;
  };

  const handleAnonymousLogin = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('👤 Initiating anonymous login...');
      const result = await SocialAuthService.signInAnonymously();
      console.log('✅ Anonymous login successful:', result.user);
      setSuccess(t('auth.loginSuccess', 'تم الدخول كضيف بنجاح! جاري التوجيه...'));
      setTimeout(() => {
        navigate('/profile');  // Changed from /dashboard to /profile
      }, 1000);
    } catch (err: any) {
      console.error('❌ Anonymous login error:', err);
      const userMessage = err?.message || 'حدث خطأ أثناء الدخول كضيف. يرجى المحاولة مرة أخرى.';
      setError(userMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLoginError = (error: string) => {
    setError(error);
  };

  const actions: LoginActions = {
    setFormData,
    setShowPassword,
    setLoading,
    setError,
    setSuccess,
    setValidationErrors,
    handleInputChange,
    handleSubmit,
    handleGoogleLogin,
    handleFacebookLogin,
    handleAppleLogin,
    handlePhoneLogin,
    handleAnonymousLogin,
    handleSocialLoginError,
    validateForm
  };

  return {
    state,
    actions
  };
};