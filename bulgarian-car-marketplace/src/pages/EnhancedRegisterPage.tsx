import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useTranslation } from '../hooks/useTranslation';
import SocialLogin from '../components/SocialLogin';
import { SocialAuthService } from '../firebase/social-auth-service';
import BulgarianProfileService from '../services/bulgarian-profile-service';
import { useAuth } from '../hooks/useAuth';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User,
  Phone,
  MapPin,
  AlertCircle, 
  CheckCircle, 
  Loader,
  ArrowRight,
  Shield,
  Globe,
  Check
} from 'lucide-react';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const RegisterContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, 
    #667eea 0%, 
    #764ba2 25%, 
    #f093fb 50%, 
    #f5576c 75%, 
    #4facfe 100%
  );
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
  padding: ${({ theme }) => theme.spacing.lg};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(1px);
  }

  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

const RegisterCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing['3xl']};
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 550px;
  animation: ${fadeIn} 0.8s ease-out;
  position: relative;
  z-index: 1;
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-height: 90vh;
  overflow-y: auto;
  
  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.xl};
    margin: ${({ theme }) => theme.spacing.md};
    max-height: 95vh;
  }
`;

const RegisterHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const RegisterTitle = styled.h1`
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${slideIn} 0.6s ease-out 0.2s both;
`;

const RegisterSubtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  animation: ${slideIn} 0.6s ease-out 0.4s both;
`;

const BulgarianInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: #b45309;
  animation: ${slideIn} 0.6s ease-out 0.6s both;
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  gap: ${({ theme }) => theme.spacing.md};
`;

const Step = styled.div<{ active?: boolean; completed?: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  transition: all 0.3s ease;
  
  ${({ active, completed, theme }) => {
    if (completed) {
      return `
        background: ${theme.colors.success.main};
        color: white;
        animation: ${pulse} 0.5s ease-out;
      `;
    }
    if (active) {
      return `
        background: ${theme.colors.primary.main};
        color: white;
        box-shadow: 0 0 0 3px ${theme.colors.primary.main}30;
      `;
    }
    return `
      background: ${theme.colors.grey[300]};
      color: ${theme.colors.text.secondary};
    `;
  }}
`;

const RegisterForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  position: relative;
  
  .form-icon {
    position: absolute;
    left: ${({ theme }) => theme.spacing.md};
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.colors.text.secondary};
    z-index: 1;
  }
  
  .password-toggle {
    position: absolute;
    right: ${({ theme }) => theme.spacing.md};
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: ${({ theme }) => theme.colors.text.secondary};
    cursor: pointer;
    padding: ${({ theme }) => theme.spacing.xs};
    border-radius: ${({ theme }) => theme.borderRadius.full};
    transition: all 0.2s ease;
    
    &:hover {
      color: ${({ theme }) => theme.colors.primary.main};
      background: rgba(102, 126, 234, 0.1);
    }
    
    &:focus {
      outline: 2px solid ${({ theme }) => theme.colors.primary.main}50;
    }
  }
`;

const Label = styled.label`
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  display: block;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const Input = styled.input<{ hasError?: boolean }>`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  padding-left: ${({ theme }) => theme.spacing['2xl']};
  padding-right: ${({ theme }) => theme.spacing['2xl']};
  border: 2px solid ${({ hasError, theme }) => 
    hasError ? theme.colors.error.main : theme.colors.grey[300]
  };
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  transition: all 0.3s ease;
  background: white;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary.main}20;
    transform: translateY(-1px);
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.secondary};
  }
  
  &:disabled {
    background: ${({ theme }) => theme.colors.grey[100]};
    cursor: not-allowed;
  }
`;

const Select = styled.select<{ hasError?: boolean }>`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  padding-left: ${({ theme }) => theme.spacing['2xl']};
  border: 2px solid ${({ hasError, theme }) => 
    hasError ? theme.colors.error.main : theme.colors.grey[300]
  };
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  transition: all 0.3s ease;
  background: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary.main}20;
    transform: translateY(-1px);
  }
  
  &:disabled {
    background: ${({ theme }) => theme.colors.grey[100]};
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.error.main};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin-top: ${({ theme }) => theme.spacing.sm};
  animation: ${fadeIn} 0.3s ease-out;
  background: ${({ theme }) => theme.colors.error.light}20;
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border-left: 3px solid ${({ theme }) => theme.colors.error.main};
`;

const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.success.main};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  animation: ${fadeIn} 0.3s ease-out;
  background: ${({ theme }) => theme.colors.success.light}20;
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border-left: 3px solid ${({ theme }) => theme.colors.success.main};
`;

const PasswordStrengthIndicator = styled.div<{ strength: number }>`
  height: 4px;
  background: ${({ theme }) => theme.colors.grey[200]};
  border-radius: 2px;
  margin-top: ${({ theme }) => theme.spacing.sm};
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: ${({ strength }) => (strength / 4) * 100}%;
    background: ${({ strength, theme }) => {
      if (strength <= 1) return theme.colors.error.main;
      if (strength <= 2) return '#fbbf24';
      if (strength <= 3) return '#3b82f6';
      return theme.colors.success.main;
    }};
    border-radius: 2px;
    transition: all 0.3s ease;
  }
`;

const PasswordStrengthText = styled.div<{ strength: number }>`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  margin-top: ${({ theme }) => theme.spacing.xs};
  color: ${({ strength, theme }) => {
    if (strength <= 1) return theme.colors.error.main;
    if (strength <= 2) return '#d97706';
    if (strength <= 3) return '#2563eb';
    return theme.colors.success.main;
  }};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const CheckboxContainer = styled.label`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.sm};
  cursor: pointer;
  user-select: none;
  margin: ${({ theme }) => theme.spacing.lg} 0;
  
  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: ${({ theme }) => theme.colors.primary.main};
    cursor: pointer;
    margin-top: 2px;
    flex-shrink: 0;
  }
  
  span {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.text.secondary};
    line-height: 1.4;
    
    a {
      color: ${({ theme }) => theme.colors.primary.main};
      text-decoration: none;
      font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
`;

const RegisterButton = styled.button<{ loading?: boolean }>`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.lg};
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.lg};
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
  
  ${({ loading }) => loading && `
    pointer-events: none;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      animation: shimmer 2s infinite;
    }
    
    @keyframes shimmer {
      0% { left: -100%; }
      100% { left: 100%; }
    }
  `}
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: ${({ theme }) => theme.spacing.xl} 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.colors.grey[300]};
  }
  
  span {
    padding: 0 ${({ theme }) => theme.spacing.lg};
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    background: white;
  }
`;

const LoginPrompt = styled.div`
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.xl};
  padding-top: ${({ theme }) => theme.spacing.xl};
  border-top: 1px solid ${({ theme }) => theme.colors.grey[200]};
  
  span {
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
  }
  
  a {
    color: ${({ theme }) => theme.colors.primary.main};
    text-decoration: none;
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    margin-left: ${({ theme }) => theme.spacing.sm};
    transition: all 0.3s ease;
    padding: ${({ theme }) => theme.spacing.xs};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    
    &:hover {
      text-decoration: underline;
      background: ${({ theme }) => theme.colors.primary.main}10;
    }
  }
`;

const SecurityInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.md};
  background: rgba(102, 126, 234, 0.1);
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.primary.dark};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  border: 1px solid rgba(102, 126, 234, 0.2);
`;

// Bulgarian cities for the location dropdown
const bulgarianCities = [
  'София', 'Пловдив', 'Варна', 'Бургас', 'Русе', 'Стара Загора', 'Плевен', 'Добрич', 
  'Сливен', 'Шумен', 'Перник', 'Хасково', 'Ямбол', 'Пазарджик', 'Благоевград', 'Велико Търново',
  'Врац', 'Габрово', 'Асеновград', 'Видин', 'Казанлък', 'Кюстендил', 'Кърджали', 'Монтана',
  'Димитровград', 'Търговище', 'Силистра', 'Ловеч', 'Разград', 'Смолян'
];

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  location: string;
  agreeToTerms: boolean;
  subscribeToNewsletter: boolean;
}

const EnhancedRegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
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
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  // إعادة توجيه المستخدم إذا كان مسجلاً دخوله
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // حساب قوة كلمة المرور
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

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // حساب قوة كلمة المرور
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
    
    // مسح رسائل الخطأ عند التعديل
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
      // إنشاء الحساب
      const result = await SocialAuthService.createUserWithEmailAndPassword(
        formData.email,
        formData.password
      );
      
      if (result && result.user) {
        // إنشاء الملف الشخصي البلغاري
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
        
        // انتظار قصير لعرض رسالة النجاح
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setError(t('auth.registerFailed', 'Registration failed. Please try again.'));
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(t('auth.unexpectedError', 'An unexpected error occurred. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLoginSuccess = async () => {
    setSuccess(t('auth.loginSuccess', 'Login successful! Redirecting...'));
    setTimeout(() => {
      navigate('/dashboard');
    }, 1000);
  };

  const handleSocialLoginError = (error: string) => {
    setError(error);
  };

  return (
    <RegisterContainer>
      <RegisterCard>
        <RegisterHeader>
          <RegisterTitle>{t('auth.createAccount', 'Create Your Account')}</RegisterTitle>
          <RegisterSubtitle>{t('auth.registerSubtitle', 'Join the Bulgarian car marketplace today')}</RegisterSubtitle>
          <BulgarianInfo>
            <Globe size={16} />
            <span>{t('auth.bulgarianMarketplace', 'Bulgarian Car Marketplace')}</span>
          </BulgarianInfo>
        </RegisterHeader>

        <StepIndicator>
          <Step completed={currentStep > 1} active={currentStep === 1}>
            {currentStep > 1 ? <Check size={20} /> : '1'}
          </Step>
          <Step completed={currentStep > 2} active={currentStep === 2}>
            {currentStep > 2 ? <Check size={20} /> : '2'}
          </Step>
          <Step active={currentStep === 3}>
            3
          </Step>
        </StepIndicator>

        {success && (
          <SuccessMessage>
            <CheckCircle size={18} />
            <span>{success}</span>
          </SuccessMessage>
        )}

        {error && (
          <ErrorMessage>
            <AlertCircle size={18} />
            <span>{error}</span>
          </ErrorMessage>
        )}

        <RegisterForm onSubmit={handleSubmit}>
          {/* Personal Information */}
          <FormRow>
            <FormGroup>
              <Label htmlFor="firstName">{t('auth.firstName', 'First Name')}</Label>
              <User className="form-icon" size={20} />
              <Input
                id="firstName"
                type="text"
                name="firstName"
                placeholder={t('auth.firstNamePlaceholder', 'Enter your first name')}
                value={formData.firstName}
                onChange={handleInputChange}
                hasError={!!validationErrors.firstName}
                disabled={loading}
                required
                autoComplete="given-name"
              />
              {validationErrors.firstName && (
                <ErrorMessage>
                  <AlertCircle size={16} />
                  <span>{validationErrors.firstName}</span>
                </ErrorMessage>
              )}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="lastName">{t('auth.lastName', 'Last Name')}</Label>
              <User className="form-icon" size={20} />
              <Input
                id="lastName"
                type="text"
                name="lastName"
                placeholder={t('auth.lastNamePlaceholder', 'Enter your last name')}
                value={formData.lastName}
                onChange={handleInputChange}
                hasError={!!validationErrors.lastName}
                disabled={loading}
                required
                autoComplete="family-name"
              />
              {validationErrors.lastName && (
                <ErrorMessage>
                  <AlertCircle size={16} />
                  <span>{validationErrors.lastName}</span>
                </ErrorMessage>
              )}
            </FormGroup>
          </FormRow>

          {/* Contact Information */}
          <FormGroup>
            <Label htmlFor="email">{t('auth.email', 'Email Address')}</Label>
            <Mail className="form-icon" size={20} />
            <Input
              id="email"
              type="email"
              name="email"
              placeholder={t('auth.emailPlaceholder', 'Enter your email address')}
              value={formData.email}
              onChange={handleInputChange}
              hasError={!!validationErrors.email}
              disabled={loading}
              required
              autoComplete="email"
            />
            {validationErrors.email && (
              <ErrorMessage>
                <AlertCircle size={16} />
                <span>{validationErrors.email}</span>
              </ErrorMessage>
            )}
          </FormGroup>

          <FormRow>
            <FormGroup>
              <Label htmlFor="phone">{t('auth.phone', 'Phone Number')}</Label>
              <Phone className="form-icon" size={20} />
              <Input
                id="phone"
                type="tel"
                name="phone"
                placeholder={t('auth.phonePlaceholder', '+359 888 123 456')}
                value={formData.phone}
                onChange={handleInputChange}
                hasError={!!validationErrors.phone}
                disabled={loading}
                required
                autoComplete="tel"
              />
              {validationErrors.phone && (
                <ErrorMessage>
                  <AlertCircle size={16} />
                  <span>{validationErrors.phone}</span>
                </ErrorMessage>
              )}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="location">{t('auth.location', 'City')}</Label>
              <MapPin className="form-icon" size={20} />
              <Select
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                hasError={!!validationErrors.location}
                disabled={loading}
                required
              >
                <option value="">{t('auth.selectCity', 'Select your city')}</option>
                {bulgarianCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </Select>
              {validationErrors.location && (
                <ErrorMessage>
                  <AlertCircle size={16} />
                  <span>{validationErrors.location}</span>
                </ErrorMessage>
              )}
            </FormGroup>
          </FormRow>

          {/* Password */}
          <FormGroup>
            <Label htmlFor="password">{t('auth.password', 'Password')}</Label>
            <Lock className="form-icon" size={20} />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder={t('auth.passwordPlaceholder', 'Create a strong password')}
              value={formData.password}
              onChange={handleInputChange}
              hasError={!!validationErrors.password}
              disabled={loading}
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? t('auth.hidePassword', 'Hide password') : t('auth.showPassword', 'Show password')}
              tabIndex={0}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {formData.password && (
              <>
                <PasswordStrengthIndicator strength={passwordStrength} />
                <PasswordStrengthText strength={passwordStrength}>
                  {t('auth.passwordStrength', 'Strength')}: {getPasswordStrengthText(passwordStrength)}
                </PasswordStrengthText>
              </>
            )}
            {validationErrors.password && (
              <ErrorMessage>
                <AlertCircle size={16} />
                <span>{validationErrors.password}</span>
              </ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="confirmPassword">{t('auth.confirmPassword', 'Confirm Password')}</Label>
            <Lock className="form-icon" size={20} />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder={t('auth.confirmPasswordPlaceholder', 'Confirm your password')}
              value={formData.confirmPassword}
              onChange={handleInputChange}
              hasError={!!validationErrors.confirmPassword}
              disabled={loading}
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? t('auth.hidePassword', 'Hide password') : t('auth.showPassword', 'Show password')}
              tabIndex={0}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {validationErrors.confirmPassword && (
              <ErrorMessage>
                <AlertCircle size={16} />
                <span>{validationErrors.confirmPassword}</span>
              </ErrorMessage>
            )}
          </FormGroup>

          {/* Agreement Checkboxes */}
          <CheckboxContainer>
            <input
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleInputChange}
              disabled={loading}
              required
            />
            <span>
              {t('auth.agreeToTerms', 'I agree to the')} <Link to="/terms">{t('auth.termsAndConditions', 'Terms and Conditions')}</Link> {t('auth.and', 'and')} <Link to="/privacy">{t('auth.privacyPolicy', 'Privacy Policy')}</Link>
            </span>
          </CheckboxContainer>
          {validationErrors.agreeToTerms && (
            <ErrorMessage>
              <AlertCircle size={16} />
              <span>{validationErrors.agreeToTerms}</span>
            </ErrorMessage>
          )}

          <CheckboxContainer>
            <input
              type="checkbox"
              name="subscribeToNewsletter"
              checked={formData.subscribeToNewsletter}
              onChange={handleInputChange}
              disabled={loading}
            />
            <span>
              {t('auth.subscribeToNewsletter', 'Subscribe to our newsletter for the latest car deals and updates')}
            </span>
          </CheckboxContainer>

          <RegisterButton type="submit" disabled={loading || !formData.agreeToTerms} loading={loading}>
            {loading ? (
              <>
                <Loader size={20} />
                {t('auth.creatingAccount', 'Creating Account...')}
              </>
            ) : (
              <>
                {t('auth.createAccount', 'Create Account')}
                <ArrowRight size={20} />
              </>
            )}
          </RegisterButton>
        </RegisterForm>

        <Divider>
          <span>{t('auth.orRegisterWith', 'Or register with')}</span>
        </Divider>

        <SocialLogin
          onGoogleLogin={handleSocialLoginSuccess}
          onFacebookLogin={handleSocialLoginSuccess}
          onAppleLogin={handleSocialLoginSuccess}
          loading={loading}
          disabled={loading}
        />

        <SecurityInfo>
          <Shield size={16} />
          <span>{t('auth.secureRegistration', 'Your information is secure and encrypted')}</span>
        </SecurityInfo>

        <LoginPrompt>
          <span>{t('auth.haveAccount', 'Already have an account?')}</span>
          <Link to="/login">{t('auth.signInHere', 'Sign in here')}</Link>
        </LoginPrompt>
      </RegisterCard>
    </RegisterContainer>
  );
};

export default EnhancedRegisterPage;