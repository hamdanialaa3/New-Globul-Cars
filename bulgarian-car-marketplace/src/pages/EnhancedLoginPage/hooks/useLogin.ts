import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../../hooks/useTranslation';
import { useAuth } from '../../../hooks/useAuth';
import { SocialAuthService } from '../../../firebase/social-auth-service';
import { LoginFormData, LoginState, LoginActions, UseLoginReturn } from '../types';

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

  // (Comment removed - was in Arabic)
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
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

        // (Comment removed - was in Arabic)
        setTimeout(() => {
          navigate('/dashboard');
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

  const handleSocialLoginSuccess = () => {
    setSuccess(t('auth.loginSuccess', 'Login successful! Redirecting...'));
    setTimeout(() => {
      navigate('/dashboard');
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