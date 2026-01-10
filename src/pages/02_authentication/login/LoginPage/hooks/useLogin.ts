import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useTranslation } from '../../../../../hooks/useTranslation';
import { useAuth } from '../../../../../hooks/useAuth';
import { SocialAuthService } from '../../../../../firebase/social-auth-service';
import { bulgarianAuthService } from '../../../../../firebase';
import { LoginFormData, LoginState, LoginActions, UseLoginReturn } from '../types';
import { logger } from '../../../../../services/logger-service';

export const useLogin = (): UseLoginReturn => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
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

  // Get redirect URL from query params or location state
  const getRedirectPath = (): string => {
    // Priority 1: Check URL query parameter
    const redirectParam = searchParams.get('redirect');
    if (redirectParam) {
      return redirectParam;
    }

    // Priority 2: Check location state (from Navigate component)
    const locationState = location.state as { from?: { pathname: string } } | null;
    if (locationState?.from?.pathname) {
      return locationState.from.pathname;
    }

    // Default: Home page
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

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      const redirectPath = getRedirectPath();
      navigate(redirectPath, { replace: true });
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
      const result = await bulgarianAuthService.signIn(
        formData.email,
        formData.password
      );

      if (result && result.user) {
        setSuccess(t('auth.loginSuccess', 'Login successful! Redirecting...'));
        const redirectPath = getRedirectPath();
        setTimeout(() => {
          navigate(redirectPath, { replace: true });
        }, 1000);
      } else {
        setError(t('auth.loginFailed', 'Login failed. Please try again.'));
      }
    } catch (err) {
      logger.error('Login error:', err instanceof Error ? err : new Error(String(err)));
      // Use the error message from handleAuthError (already translated to Bulgarian)
      const errorMessage = err instanceof Error ? err.message : t('auth.unexpectedError', 'An unexpected error occurred. Please try again.');
      setError(errorMessage);
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

      // PERSIST REDIRECT URL
      const intentRedirectPath = getRedirectPath();
      sessionStorage.setItem('auth_redirect_url', intentRedirectPath);

      const result = await SocialAuthService.signInWithGoogle();
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Google login successful', { userId: result.user.uid });
      }
      setSuccess(t('auth.loginSuccess', 'Login successful! Redirecting...'));
      const redirectPath = getRedirectPath();
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 1000);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const errorWithCode = error as Error & { code?: string; message?: string };

      // Handle redirect case (especially for Cursor browser)
      if (error.message === 'REDIRECT_INITIATED' || error.message.includes('REDIRECT')) {
        if (process.env.NODE_ENV === 'development') {
          logger.debug('OAuth redirect initiated - waiting for redirect result');
        }
        setSuccess(t('auth.redirecting', 'Redirecting to login...'));
        setLoading(true); // Keep loading state during redirect
        // Don't set error - redirect is expected behavior
        return; // Exit early, redirect will be handled by AuthProvider
      }

      logger.error('Google login error', error, {
        errorCode: errorWithCode?.code,
        currentURL: window.location.href,
        protocol: window.location.protocol,
        host: window.location.host,
        hasApiKey: !!process.env.REACT_APP_FIREBASE_API_KEY,
        hasAuthDomain: !!process.env.REACT_APP_FIREBASE_AUTH_DOMAIN
      });

      // User-friendly error message
      const userMessage = errorWithCode?.message || t('auth.googleLoginError', 'An error occurred during Google login. Please try again.');
      setError(userMessage);
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

      // PERSIST REDIRECT URL
      const intentRedirectPath = getRedirectPath();
      sessionStorage.setItem('auth_redirect_url', intentRedirectPath);

      const result = await SocialAuthService.signInWithFacebook();
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Facebook login successful', { userId: result.user.uid });
      }
      setSuccess(t('auth.loginSuccess', 'Login successful! Redirecting...'));
      const redirectPath = getRedirectPath();
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 1000);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const errorWithCode = error as Error & { code?: string; message?: string };
      logger.error('Facebook login error', error, { errorCode: errorWithCode?.code });
      const userMessage = errorWithCode?.message || t('auth.facebookLoginError', 'An error occurred during Facebook login. Please try again.');
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

      // PERSIST REDIRECT URL
      const intentRedirectPath = getRedirectPath();
      sessionStorage.setItem('auth_redirect_url', intentRedirectPath);

      const result = await SocialAuthService.signInWithApple();
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Apple login successful', { userId: result.user.uid });
      }
      setSuccess(t('auth.loginSuccess', 'Login successful! Redirecting...'));
      const redirectPath = getRedirectPath();
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 1000);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const errorWithCode = error as Error & { message?: string };
      logger.error('❌ Apple login error:', error);
      const userMessage = errorWithCode?.message || t('auth.appleLoginError', 'An error occurred during Apple login. Please try again.');
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
      logger.info('👤 Initiating anonymous login...');
      const result = await SocialAuthService.signInAnonymously();
      logger.info('✅ Anonymous login successful:', result.user);
      setSuccess(t('auth.loginSuccess', 'Guest login successful! Redirecting...'));
      const redirectPath = getRedirectPath();
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 1000);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const errorWithCode = error as Error & { message?: string };
      logger.error('❌ Anonymous login error:', error);
      const userMessage = errorWithCode?.message || t('auth.anonymousLoginError', 'An error occurred during guest login. Please try again.');
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