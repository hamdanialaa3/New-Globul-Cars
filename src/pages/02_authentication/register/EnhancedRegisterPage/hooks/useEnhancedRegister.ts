import { logger } from '../../../../../services/logger-service';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../../../../hooks/useTranslation';
import { useAuth } from '../../../../../hooks/useAuth';
import { SocialAuthService } from '../../../../../firebase/social-auth-service';
import { ensureUserNumericId } from '../../../../../services/numeric-id-assignment.service';
import { userService } from '../../../../../services/user/canonical-user.service';
import { RegisterFormData, ValidationErrors } from '../types';

export const useEnhancedRegister = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [currentStep] = useState(1);
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    location: '',
    agreeToTerms: false,
    subscribeToNewsletter: true
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Redirect authenticated users
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Calculate password strength
  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return strength;
  };

  const getPasswordStrengthText = (strength: number): string => {
    switch (strength) {
      case 0:
      case 1:
        return t('auth.passwordWeak', 'Weak');
      case 2:
        return t('auth.passwordFair', 'Fair');
      case 3:
        return t('auth.passwordGood', 'Good');
      case 4:
        return t('auth.passwordStrong', 'Strong');
      default:
        return '';
    }
  };

  // Form validation
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = t('auth.firstNameRequired', 'First name is required');
    }

    if (!formData.lastName.trim()) {
      errors.lastName = t('auth.lastNameRequired', 'Last name is required');
    }

    if (!formData.email.trim()) {
      errors.email = t('auth.emailRequired', 'Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = t('auth.emailInvalid', 'Please enter a valid email');
    }

    if (!formData.password) {
      errors.password = t('auth.passwordRequired', 'Password is required');
    } else if (formData.password.length < 8) {
      errors.password = t('auth.passwordTooShort', 'Password must be at least 8 characters');
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = t('auth.confirmPasswordRequired', 'Please confirm your password');
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = t('auth.passwordMismatch', 'Passwords do not match');
    }

    if (!formData.phone.trim()) {
      errors.phone = t('auth.phoneRequired', 'Phone number is required');
    } else if (!/^(\+359|0)[0-9]{8,9}$/.test(formData.phone)) {
      errors.phone = t('auth.phoneInvalid', 'Please enter a valid Bulgarian phone number');
    }

    if (!formData.location) {
      errors.location = t('auth.locationRequired', 'Please select your location');
    }

    if (!formData.agreeToTerms) {
      errors.agreeToTerms = t('auth.termsRequired', 'You must agree to the terms and conditions');
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev: RegisterFormData) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Calculate password strength
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    // Clear validation errors on change
    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors((prev: ValidationErrors) => ({
        ...prev,
        [name]: ''
      }));
    }
    setError(null);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Create account
      const result = await SocialAuthService.createUserWithEmailAndPassword(
        formData.email,
        formData.password
      );
      // Assign numericId immediately after registration (constitution enforcement)
      if (result?.user?.uid) {
        const { ensureUserNumericId } = await import('../../../../../services/numeric-id-assignment.service');
        await ensureUserNumericId(result.user.uid);
      }
      if (result?.user?.uid) {
        await ensureUserNumericId(result.user.uid);
      }

      if (result && result.user) {
        // Create Bulgarian profile
        await BulgarianProfileService.updateUserProfile(result.user.uid, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phone,
          location: {
            city: formData.location,
            region: '',
            country: 'Bulgaria'
          },
          preferredLanguage: 'bg',
          currency: 'EUR'
        });

        setSuccess(t('auth.registerSuccess', 'Registration successful! Redirecting to dashboard...'));

        // Wait for success message display
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setError(t('auth.registerFailed', 'Registration failed. Please try again.'));
      }
    } catch (err: any) {
      logger.error('Registration error:', err);
      setError(t('auth.unexpectedError', 'An unexpected error occurred. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  // Handle social login success
  const handleSocialLoginSuccess = async () => {
    setSuccess(t('auth.loginSuccess', 'Login successful! Redirecting...'));
    setTimeout(() => {
      navigate('/dashboard');
    }, 1000);
  };

  // Handle social login error
  const handleSocialLoginError = (error: string) => {
    setError(error);
  };

  return {
    // State
    currentStep,
    formData,
    showPassword,
    showConfirmPassword,
    loading,
    error,
    success,
    validationErrors,
    passwordStrength,

    // Actions
    setShowPassword,
    setShowConfirmPassword,
    handleInputChange,
    handleSubmit,
    handleSocialLoginSuccess,
    handleSocialLoginError,

    // Utilities
    getPasswordStrengthText
  };
};
