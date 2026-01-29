import { logger } from '../../../../../services/logger-service';
import React, { useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useTranslation } from '../../../../../hooks/useTranslation';
import { useAuth } from '../../../../../hooks/useAuth';
import { SocialAuthService } from '../../../../../firebase/social-auth-service';
import { bulgarianAuthService } from '../../../../../firebase';
import { LoginFormData, LoginState, LoginActions, UseLoginReturn } from '../types';

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
  React.useEffect(() => {
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
    } catch (err: any) {
      logger.error('Login error:', err);
      // Use the error message from handleAuthError (already translated to Bulgarian)
      const errorMessage = err instanceof Error ? err.message : (err?.message || t('auth.unexpectedError', 'An unexpected error occurred. Please try again.'));
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLoginSuccess = () => {
    setSuccess(t('auth.loginSuccess', 'Login successful! Redirecting...'));
    const redirectPath = getRedirectPath();
    setTimeout(() => {
      navigate(redirectPath, { replace: true });
    }, 1000);
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
    handleSocialLoginSuccess,
    validateForm
  };

  return {
    state,
    actions
  };
};