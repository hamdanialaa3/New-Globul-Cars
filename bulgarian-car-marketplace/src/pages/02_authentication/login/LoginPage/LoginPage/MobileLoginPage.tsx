// Mobile Login Page - Professional Edition
// Optimized for mobile and portrait tablets
// Inspired by mobile.de authentication flow

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useLogin } from '../LoginPage/hooks/useLogin';
import { useLanguage } from '../../../../../contexts/LanguageContext';
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
  padding: ${mobileSpacing.xxl} ${mobileSpacing.md};
  ${mobileMixins.safeAreaPadding}
`;

const Logo = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: ${mobileColors.secondary.main};
  text-align: center;
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

const FormCard = styled(MobileCard)`
  margin: 0 ${mobileSpacing.md};
`;

const FormSection = styled.form`
  width: 100%;
`;

const DividerSection = styled.div`
  ${mobileMixins.flexCenter}
  gap: ${mobileSpacing.md};
  margin: ${mobileSpacing.lg} 0;
`;

const DividerLine = styled.div`
  flex: 1;
  height: 1px;
  background: ${mobileColors.surface.divider};
`;

const DividerText = styled.span`
  font-size: ${mobileTypography.caption.fontSize};
  color: ${mobileColors.neutral.gray500};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const SocialButtonsGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${mobileSpacing.sm};
`;

const SocialButton = styled.button<{ $provider: 'google' | 'facebook' | 'apple' }>`
  ${mobileMixins.touchTarget}
  ${mobileMixins.preventZoom}
  
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${mobileSpacing.md};
  
  width: 100%;
  min-height: ${mobileSpacing.touchComfortable};
  padding: ${mobileSpacing.sm} ${mobileSpacing.lg};
  
  background: ${props => {
    switch(props.$provider) {
      case 'google': return '#FFFFFF';
      case 'facebook': return '#1877F2';
      case 'apple': return '#000000';
    }
  }};
  
  color: ${props => props.$provider === 'google' ? '#333' : '#FFFFFF'};
  border: 2px solid ${props => props.$provider === 'google' ? '#E0E0E0' : 'transparent'};
  border-radius: ${mobileBorderRadius.md};
  
  font-size: ${mobileTypography.button.fontSize};
  font-weight: ${mobileTypography.button.fontWeight};
  
  cursor: pointer;
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
  -webkit-tap-highlight-color: transparent;
  
  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
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

const SuccessMessage = styled(ErrorMessage)`
  background: ${mobileColors.success.light};
  border-color: ${mobileColors.success.main};
  color: ${mobileColors.success.dark};
`;

const ForgotPasswordLink = styled(Link)`
  display: block;
  text-align: right;
  color: ${mobileColors.interactive.link};
  font-size: ${mobileTypography.bodySmall.fontSize};
  text-decoration: none;
  margin-top: -${mobileSpacing.sm};
  margin-bottom: ${mobileSpacing.lg};
  
  &:active {
    color: ${mobileColors.interactive.linkHover};
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

const RegisterLink = styled(Link)`
  color: ${mobileColors.primary.main};
  font-weight: 600;
  text-decoration: none;
  
  &:active {
    color: ${mobileColors.primary.dark};
  }
`;

export const MobileLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const {
    emailLogin,
    googleLogin,
    facebookLogin,
    appleLogin,
    loading,
    error,
    success
  } = useLogin();
  
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await emailLogin(email, password);
    if (result.success) {
      navigate('/');
    }
  };
  
  const handleGoogleLogin = async () => {
    const result = await googleLogin();
    if (result.success) {
      navigate('/');
    }
  };
  
  const handleFacebookLogin = async () => {
    const result = await facebookLogin();
    if (result.success) {
      navigate('/');
    }
  };
  
  const handleAppleLogin = async () => {
    const result = await appleLogin();
    if (result.success) {
      navigate('/');
    }
  };
  
  return (
    <PageWrapper>
      <LogoSection>
        <Logo>Globul Cars</Logo>
      </LogoSection>
      
      <ContentSection>
        <MobileContainer maxWidth="sm">
          <MobileStack spacing="lg">
            <div>
              <WelcomeText>
                {t('auth.login.welcome', 'Welcome Back')}
              </WelcomeText>
              <SubtitleText>
                {t('auth.login.subtitle', 'Sign in to continue to your account')}
              </SubtitleText>
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
                
                {success && (
                  <SuccessMessage>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    <span>{success}</span>
                  </SuccessMessage>
                )}
                
                <FormSection onSubmit={handleEmailLogin}>
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
                    
                    <MobileInput
                      type={showPassword ? 'text' : 'password'}
                      label={t('auth.password', 'Password')}
                      placeholder={t('auth.passwordPlaceholder', 'Enter your password')}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
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
                    
                    <ForgotPasswordLink to="/forgot-password">
                      {t('auth.forgotPassword', 'Forgot password?')}
                    </ForgotPasswordLink>
                    
                    <MobileButton
                      type="submit"
                      variant="primary"
                      size="lg"
                      fullWidth
                      loading={loading}
                      disabled={!email || !password}
                    >
                      {t('auth.login.button', 'Sign In')}
                    </MobileButton>
                  </MobileStack>
                </FormSection>
                
                <DividerSection>
                  <DividerLine />
                  <DividerText>{t('auth.or', 'or')}</DividerText>
                  <DividerLine />
                </DividerSection>
                
                <SocialButtonsGroup>
                  <SocialButton $provider="google" onClick={handleGoogleLogin}>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    {t('auth.continueWithGoogle', 'Continue with Google')}
                  </SocialButton>
                  
                  <SocialButton $provider="facebook" onClick={handleFacebookLogin}>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    {t('auth.continueWithFacebook', 'Continue with Facebook')}
                  </SocialButton>
                  
                  <SocialButton $provider="apple" onClick={handleAppleLogin}>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                    {t('auth.continueWithApple', 'Continue with Apple')}
                  </SocialButton>
                </SocialButtonsGroup>
              </MobileStack>
            </FormCard>
          </MobileStack>
        </MobileContainer>
      </ContentSection>
      
      <FooterSection>
        <FooterText>
          {t('auth.noAccount', "Don't have an account?")}
          {' '}
          <RegisterLink to="/register">
            {t('auth.register', 'Sign Up')}
          </RegisterLink>
        </FooterText>
      </FooterSection>
    </PageWrapper>
  );
};

export default MobileLoginPage;
