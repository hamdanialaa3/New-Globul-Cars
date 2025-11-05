// Mobile Register Page - Professional Edition
// Optimized for mobile and portrait tablets
// Multi-step registration inspired by mobile.de

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useLanguage } from '../../../../../contexts/LanguageContext';
import { useAuth } from '../../../../../contexts/AuthProvider';
import { 
  MobileContainer, 
  MobileStack, 
  MobileCard 
} from '../../components/ui/mobile-index';
import { MobileButton } from '../../components/ui/MobileButton';
import { MobileInput } from '../../components/ui/MobileInput';
import { 
  mobileColors,
  mobileSpacing,
  mobileTypography,
  mobileBorderRadius,
  mobileMediaQueries,
  mobileMixins
} from '../../styles/mobile-design-system';

const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, 
    ${mobileColors.primary.pale} 0%, 
    ${mobileColors.secondary.pale} 100%
  );
  display: flex;
  flex-direction: column;
`;

const LogoSection = styled.div`
  ${mobileMixins.flexCenter}
  padding: ${mobileSpacing.xl} ${mobileSpacing.md};
  ${mobileMixins.safeAreaPadding}
`;

const Logo = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: ${mobileColors.secondary.main};
  text-align: center;
`;

const BackButton = styled.button`
  ${mobileMixins.touchTarget}
  position: absolute;
  left: ${mobileSpacing.md};
  background: transparent;
  border: none;
  color: ${mobileColors.neutral.gray700};
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  
  svg {
    width: 24px;
    height: 24px;
  }
`;

const ContentSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const WelcomeText = styled.h1`
  font-size: ${mobileTypography.display.xs.fontSize};
  line-height: ${mobileTypography.display.xs.lineHeight};
  font-weight: ${mobileTypography.display.xs.fontWeight};
  color: ${mobileColors.neutral.gray900};
  text-align: center;
  margin: 0 0 ${mobileSpacing.sm} 0;
  padding: 0 ${mobileSpacing.md};
  
  ${mobileMediaQueries.sm} {
    font-size: ${mobileTypography.display.sm.fontSize};
    line-height: ${mobileTypography.display.sm.lineHeight};
  }
`;

const SubtitleText = styled.p`
  font-size: ${mobileTypography.bodyLarge.fontSize};
  line-height: ${mobileTypography.bodyLarge.lineHeight};
  color: ${mobileColors.neutral.gray600};
  text-align: center;
  margin: 0 0 ${mobileSpacing.xl} 0;
  padding: 0 ${mobileSpacing.md};
`;

const ProgressIndicator = styled.div`
  ${mobileMixins.flexCenter}
  gap: ${mobileSpacing.xs};
  margin-bottom: ${mobileSpacing.xl};
  padding: 0 ${mobileSpacing.md};
`;

const ProgressDot = styled.div<{ $active: boolean; $completed: boolean }>`
  width: 10px;
  height: 10px;
  border-radius: ${mobileBorderRadius.full};
  background: ${props => {
    if (props.$completed) return mobileColors.primary.main;
    if (props.$active) return mobileColors.primary.main;
    return mobileColors.neutral.gray300;
  }};
  transition: all 300ms ease;
`;

const FormCard = styled(MobileCard)`
  margin: 0 ${mobileSpacing.md};
`;

const FormSection = styled.form`
  width: 100%;
`;

const ErrorMessage = styled.div`
  padding: ${mobileSpacing.md};
  background: ${mobileColors.error.light};
  border: 1px solid ${mobileColors.error.main};
  border-radius: ${mobileBorderRadius.md};
  color: ${mobileColors.error.dark};
  font-size: ${mobileTypography.bodyMedium.fontSize};
  margin-bottom: ${mobileSpacing.md};
  display: flex;
  align-items: flex-start;
  gap: ${mobileSpacing.sm};
`;

const PasswordStrengthBar = styled.div<{ $strength: number }>`
  height: 4px;
  background: ${mobileColors.neutral.gray200};
  border-radius: ${mobileBorderRadius.full};
  overflow: hidden;
  margin-top: ${mobileSpacing.xs};
  
  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${props => props.$strength}%;
    background: ${props => {
      if (props.$strength < 40) return mobileColors.error.main;
      if (props.$strength < 70) return mobileColors.warning.main;
      return mobileColors.success.main;
    }};
    transition: all 300ms ease;
  }
`;

const PasswordStrengthText = styled.span<{ $strength: number }>`
  font-size: ${mobileTypography.caption.fontSize};
  color: ${props => {
    if (props.$strength < 40) return mobileColors.error.main;
    if (props.$strength < 70) return mobileColors.warning.main;
    return mobileColors.success.main;
  }};
  margin-top: ${mobileSpacing.xxs};
  display: block;
`;

const CheckboxLabel = styled.label`
  ${mobileMixins.flexCenter}
  justify-content: flex-start;
  gap: ${mobileSpacing.sm};
  font-size: ${mobileTypography.bodySmall.fontSize};
  color: ${mobileColors.neutral.gray700};
  cursor: pointer;
  
  input[type="checkbox"] {
    width: 20px;
    height: 20px;
    cursor: pointer;
  }
  
  a {
    color: ${mobileColors.interactive.link};
    text-decoration: none;
    
    &:active {
      color: ${mobileColors.interactive.linkHover};
    }
  }
`;

const FooterSection = styled.div`
  padding: ${mobileSpacing.xl} ${mobileSpacing.md};
  text-align: center;
  ${mobileMixins.safeAreaPadding}
`;

const FooterText = styled.p`
  font-size: ${mobileTypography.bodyMedium.fontSize};
  color: ${mobileColors.neutral.gray600};
  margin: 0 0 ${mobileSpacing.sm} 0;
`;

const LoginLink = styled(Link)`
  color: ${mobileColors.primary.main};
  font-weight: 600;
  text-decoration: none;
  
  &:active {
    color: ${mobileColors.primary.dark};
  }
`;

type RegisterStep = 'account' | 'profile' | 'verification';

export const MobileRegisterPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<RegisterStep>('account');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { t } = useLanguage();
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  
  const calculatePasswordStrength = (pwd: string): number => {
    let strength = 0;
    if (pwd.length >= 8) strength += 25;
    if (/[a-z]/.test(pwd)) strength += 25;
    if (/[A-Z]/.test(pwd)) strength += 25;
    if (/[0-9]/.test(pwd)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength += 10;
    return Math.min(strength, 100);
  };
  
  const passwordStrength = calculatePasswordStrength(password);
  
  const getPasswordStrengthLabel = (): string => {
    if (passwordStrength < 40) return t('auth.password.weak', 'Weak');
    if (passwordStrength < 70) return t('auth.password.medium', 'Medium');
    return t('auth.password.strong', 'Strong');
  };
  
  const validateAccountStep = (): boolean => {
    setError('');
    
    if (!email || !password || !confirmPassword) {
      setError(t('auth.error.fillAllFields', 'Please fill in all fields'));
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t('auth.error.invalidEmail', 'Please enter a valid email'));
      return false;
    }
    
    if (password.length < 8) {
      setError(t('auth.error.passwordLength', 'Password must be at least 8 characters'));
      return false;
    }
    
    if (password !== confirmPassword) {
      setError(t('auth.error.passwordMismatch', 'Passwords do not match'));
      return false;
    }
    
    return true;
  };
  
  const validateProfileStep = (): boolean => {
    setError('');
    
    if (!name) {
      setError(t('auth.error.nameRequired', 'Please enter your name'));
      return false;
    }
    
    if (!agreeToTerms) {
      setError(t('auth.error.termsRequired', 'Please agree to terms and conditions'));
      return false;
    }
    
    return true;
  };
  
  const handleNextStep = () => {
    if (currentStep === 'account' && validateAccountStep()) {
      setCurrentStep('profile');
    }
  };
  
  const handlePreviousStep = () => {
    if (currentStep === 'profile') {
      setCurrentStep('account');
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateProfileStep()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const result = await registerUser(email, password, name, phone);
      if (result.success) {
        navigate('/verification');
      } else {
        setError(result.error || t('auth.error.registrationFailed', 'Registration failed'));
      }
    } catch (err) {
      setError(t('auth.error.unexpected', 'An unexpected error occurred'));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <PageWrapper>
      <LogoSection>
        {currentStep === 'profile' && (
          <BackButton onClick={handlePreviousStep}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </BackButton>
        )}
        <Logo>Globul Cars</Logo>
      </LogoSection>
      
      <ContentSection>
        <MobileContainer maxWidth="sm">
          <MobileStack spacing="lg">
            <div>
              <WelcomeText>
                {t('auth.register.welcome', 'Create Account')}
              </WelcomeText>
              <SubtitleText>
                {currentStep === 'account' 
                  ? t('auth.register.subtitle1', 'Enter your credentials')
                  : t('auth.register.subtitle2', 'Complete your profile')
                }
              </SubtitleText>
              
              <ProgressIndicator>
                <ProgressDot $active={currentStep === 'account'} $completed={currentStep === 'profile'} />
                <ProgressDot $active={currentStep === 'profile'} $completed={false} />
              </ProgressIndicator>
            </div>
            
            <FormCard>
              <MobileStack spacing="md">
                {error && (
                  <ErrorMessage>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <span>{error}</span>
                  </ErrorMessage>
                )}
                
                {currentStep === 'account' ? (
                  <FormSection onSubmit={(e) => { e.preventDefault(); handleNextStep(); }}>
                    <MobileStack spacing="md">
                      <MobileInput
                        type="email"
                        label={t('auth.email', 'Email')}
                        placeholder={t('auth.emailPlaceholder', 'Enter your email')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                        icon={
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="5" width="18" height="14" rx="2"/>
                            <path d="M3 7l9 6 9-6"/>
                          </svg>
                        }
                      />
                      
                      <div>
                        <MobileInput
                          type={showPassword ? 'text' : 'password'}
                          label={t('auth.password', 'Password')}
                          placeholder={t('auth.passwordPlaceholder', 'Create a password')}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          autoComplete="new-password"
                          icon={
                            showPassword ? (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" onClick={() => setShowPassword(false)} style={{ cursor: 'pointer' }}>
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                                <line x1="1" y1="1" x2="23" y2="23"/>
                              </svg>
                            ) : (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" onClick={() => setShowPassword(true)} style={{ cursor: 'pointer' }}>
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                              </svg>
                            )
                          }
                          iconPosition="right"
                        />
                        {password && (
                          <>
                            <PasswordStrengthBar $strength={passwordStrength} />
                            <PasswordStrengthText $strength={passwordStrength}>
                              {getPasswordStrengthLabel()}
                            </PasswordStrengthText>
                          </>
                        )}
                      </div>
                      
                      <MobileInput
                        type={showPassword ? 'text' : 'password'}
                        label={t('auth.confirmPassword', 'Confirm Password')}
                        placeholder={t('auth.confirmPasswordPlaceholder', 'Re-enter password')}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                      />
                      
                      <MobileButton
                        type="submit"
                        variant="primary"
                        size="lg"
                        fullWidth
                        disabled={!email || !password || !confirmPassword}
                      >
                        {t('auth.continue', 'Continue')}
                      </MobileButton>
                    </MobileStack>
                  </FormSection>
                ) : (
                  <FormSection onSubmit={handleSubmit}>
                    <MobileStack spacing="md">
                      <MobileInput
                        type="text"
                        label={t('auth.fullName', 'Full Name')}
                        placeholder={t('auth.fullNamePlaceholder', 'Enter your full name')}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        autoComplete="name"
                        icon={
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                          </svg>
                        }
                      />
                      
                      <MobileInput
                        type="tel"
                        label={t('auth.phone', 'Phone Number')}
                        placeholder={t('auth.phonePlaceholder', 'Enter your phone (optional)')}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        autoComplete="tel"
                        icon={
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                          </svg>
                        }
                      />
                      
                      <CheckboxLabel>
                        <input
                          type="checkbox"
                          checked={agreeToTerms}
                          onChange={(e) => setAgreeToTerms(e.target.checked)}
                        />
                        <span>
                          {t('auth.agreeToTerms', 'I agree to the')}{' '}
                          <Link to="/terms-of-service">
                            {t('auth.termsOfService', 'Terms of Service')}
                          </Link>
                          {' '}{t('auth.and', 'and')}{' '}
                          <Link to="/privacy-policy">
                            {t('auth.privacyPolicy', 'Privacy Policy')}
                          </Link>
                        </span>
                      </CheckboxLabel>
                      
                      <MobileButton
                        type="submit"
                        variant="primary"
                        size="lg"
                        fullWidth
                        loading={loading}
                        disabled={!name || !agreeToTerms}
                      >
                        {t('auth.createAccount', 'Create Account')}
                      </MobileButton>
                    </MobileStack>
                  </FormSection>
                )}
              </MobileStack>
            </FormCard>
          </MobileStack>
        </MobileContainer>
      </ContentSection>
      
      <FooterSection>
        <FooterText>
          {t('auth.haveAccount', 'Already have an account?')}
          {' '}
          <LoginLink to="/login">
            {t('auth.login', 'Sign In')}
          </LoginLink>
        </FooterText>
      </FooterSection>
    </PageWrapper>
  );
};

export default MobileRegisterPage;
