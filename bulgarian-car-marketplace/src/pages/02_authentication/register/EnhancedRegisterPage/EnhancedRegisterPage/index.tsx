import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../../../../hooks/useTranslation';
import SocialLogin from '../../components/SocialLogin';
import { useEnhancedRegister } from './hooks/useEnhancedRegister';
import {
  RegisterContainer,
  RegisterCard,
  RegisterHeader,
  RegisterTitle,
  RegisterSubtitle,
  BulgarianInfo,
  StepIndicator,
  Step,
  RegisterForm,
  FormRow,
  FormGroup,
  Label,
  Input,
  Select,
  ErrorMessage,
  SuccessMessage,
  PasswordStrengthIndicator,
  PasswordStrengthText,
  CheckboxContainer,
  RegisterButton,
  Divider,
  LoginPrompt,
  SecurityInfo
} from './styles';
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

// Bulgarian cities for the location dropdown
const bulgarianCities = [
  'София', 'Пловдив', 'Варна', 'Бургас', 'Русе', 'Стара Загора', 'Плевен', 'Добрич',
  'Сливен', 'Шумен', 'Перник', 'Хасково', 'Ямбол', 'Пазарджик', 'Благоевград', 'Велико Търново',
  'Врац', 'Габрово', 'Асеновград', 'Видин', 'Казанлък', 'Кюстендил', 'Кърджали', 'Монтана',
  'Димитровград', 'Търговище', 'Силистра', 'Ловеч', 'Разград', 'Смолян'
];

const EnhancedRegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const {
    currentStep,
    formData,
    showPassword,
    showConfirmPassword,
    loading,
    error,
    success,
    validationErrors,
    passwordStrength,
    setShowPassword,
    setShowConfirmPassword,
    handleInputChange,
    handleSubmit,
    handleSocialLoginSuccess,
    getPasswordStrengthText
  } = useEnhancedRegister();

  return (
    <RegisterContainer>
      <RegisterCard>
        <RegisterHeader>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <img 
              src="/mobile-eu-logo.png" 
              alt="MOBILE-EU Logo" 
              style={{ width: '80px', height: '80px', objectFit: 'contain', margin: '0 auto' }}
            />
          </div>
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