// LoginPageGlassFixed.tsx - Glass Morphism with Working Auth
// Uses proven useLogin hook with beautiful glass design

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { 
  Mail, 
  Eye, 
  EyeOff, 
  Chrome, 
  Facebook, 
  Apple, 
  Phone, 
  UserCheck,
  ArrowRight,
  Shield,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useLogin } from './hooks/useLogin';
import PhoneAuthModal from '@/components/PhoneAuthModal';
import BackgroundSlideshow from '@/components/BackgroundSlideshow';

// Background images
const backgroundImages = [
  '/assets/images/Pic/pexels-bylukemiller-29566897.jpg',
  '/assets/images/Pic/pexels-james-collington-2147687246-30772805.jpg',
  '/assets/images/Pic/pexels-peely-712618.jpg',
  '/assets/images/Pic/pexels-aboodi-18435540.jpg',
  '/assets/images/Pic/pexels-bylukemiller-29566896.jpg',
  '/assets/images/Pic/car_inside (1).jpg',
  '/assets/images/Pic/car_inside (5).jpg',
  '/assets/images/Pic/car_inside (10).jpg',
  '/assets/images/Pic/pexels-pixabay-248747.jpg',
  '/assets/images/Pic/pexels-kelly-2402235.jpg',
];

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const GlassWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 480px;
  min-height: 550px;
  background: rgba(255, 255, 255, 0.98);
  border: 2px solid rgba(255, 255, 255, 0.8);
  border-radius: 24px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 4px 16px rgba(255, 143, 16, 0.1);
  padding: 40px;
  z-index: 10;
  animation: ${fadeIn} 0.6s ease;

  @media (max-width: 768px) {
    max-width: 100%;
    padding: 30px 20px;
    min-height: auto;
  }

  @media (max-width: 480px) {
    padding: 25px 15px;
  }
`;

const Title = styled.h1`
  font-size: 42px;
  font-weight: 700;
  text-align: center;
  color: #2c3e50;
  margin-bottom: 12px;
  animation: ${slideIn} 0.6s ease;

  @media (max-width: 768px) {
    font-size: 36px;
  }

  @media (max-width: 480px) {
    font-size: 30px;
  }
`;

const Subtitle = styled.p`
  text-align: center;
  color: #6c757d;
  font-size: 15px;
  margin-bottom: 30px;
  animation: ${slideIn} 0.6s ease 0.1s backwards;

  @media (max-width: 480px) {
    font-size: 14px;
    margin-bottom: 20px;
  }
`;

const Form = styled.form`
  width: 100%;
  
  /* CRITICAL FIX: Ensure form and children are interactive */
  position: relative;
  z-index: 1;
  pointer-events: auto;
`;

const InputBox = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: 24px;
  animation: ${slideIn} 0.6s ease 0.2s backwards;

  @media (max-width: 480px) {
    margin-bottom: 20px;
  }
`;

const Input = styled.input<{ $verified?: boolean }>`
  width: 100%;
  height: 52px;
  background: ${props => props.$verified ? '#e9ecef' : 'rgba(0, 0, 0, 0.03)'};
  border: 2px solid ${props => props.$verified ? '#ced4da' : 'rgba(0, 0, 0, 0.1)'};
  border-radius: 50px;
  font-size: 16px;
  color: ${props => props.$verified ? '#6c757d' : '#2c3e50'};
  padding: 0 50px 0 20px;
  transition: all 0.3s ease;

  &::placeholder {
    color: ${props => props.$verified ? '#adb5bd' : 'rgba(0, 0, 0, 0.4)'};
  }

  &:focus {
    outline: none;
    border-color: ${props => props.$verified ? '#ced4da' : '#5010ffff'};
    background: ${props => props.$verified ? '#e9ecef' : 'rgba(255, 143, 16, 0.05)'};
    box-shadow: ${props => props.$verified ? 'none' : '0 0 20px rgba(255, 143, 16, 0.2)'};
  }

  &:disabled {
    background: #e9ecef;
    color: #6c757d;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    height: 48px;
    font-size: 15px;
  }
`;

const InputIcon = styled.div`
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  cursor: pointer;

  &:hover {
    color: #2c3e50;
  }
`;

const RememberForgot = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  margin: -10px 0 20px 0;
  animation: ${slideIn} 0.6s ease 0.3s backwards;

  @media (max-width: 480px) {
    font-size: 13px;
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
`;

const RememberLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #495057;
  cursor: pointer;

  input[type="checkbox"] {
    accent-color: #FF8F10;
    width: 16px;
    height: 16px;
    cursor: pointer;
  }
`;

const ForgotLink = styled(Link)`
  color: #FF8F10;
  text-decoration: none;

  &:hover {
    color: #ff7900;
    text-decoration: underline;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  height: 52px;
  background: linear-gradient(135deg, #FF8F10 0%, #ff7900 100%);
  border: none;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 143, 16, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  animation: ${slideIn} 0.6s ease 0.4s backwards;
  
  /* CRITICAL FIX: Ensure button is clickable (same as MobileHeader fix!) */
  position: relative;
  z-index: 10;
  pointer-events: auto !important;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  user-select: none;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 143, 16, 0.4);
    background: linear-gradient(135deg, #ff7900 0%, #e66d00 100%);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0) scale(0.98);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .spin {
    animation: ${spin} 1s linear infinite;
  }

  @media (max-width: 480px) {
    height: 48px;
    font-size: 15px;
    min-height: 48px;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 25px 0;
  animation: ${slideIn} 0.6s ease 0.5s backwards;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(0, 0, 0, 0.2);
  }

  span {
    padding: 0 15px;
    color: #6c757d;
    font-size: 14px;
    white-space: nowrap;
  }

  @media (max-width: 480px) {
    margin: 20px 0;
    span {
      font-size: 13px;
      padding: 0 10px;
    }
  }
`;

const SocialButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
  animation: ${slideIn} 0.6s ease 0.6s backwards;
  
  /* CRITICAL FIX: Ensure all social buttons are interactive */
  position: relative;
  z-index: 1;
  pointer-events: auto;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
`;

const SocialButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.03);
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 50px;
  color: #495057;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  /* CRITICAL FIX: Ensure social buttons are clickable (same fix as mobile menu!) */
  position: relative;
  z-index: 10;
  pointer-events: auto !important;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  user-select: none;

  &:hover:not(:disabled) {
    background: rgba(255, 143, 16, 0.1);
    border-color: #FF8F10;
    color: #ff7900;
    transform: translateY(-2px);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0) scale(0.98);
    background: rgba(255, 143, 16, 0.15);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    font-size: 14px;
    padding: 12px;
    min-height: 52px;
  }
`;

const GuestButton = styled(SocialButton)`
  grid-column: 1 / -1;
  background: rgba(255, 143, 16, 0.1);
  border-color: #FF8F10;
  color: #ff7900;
  font-weight: 600;
  
  /* CRITICAL FIX: Ensure guest button is clickable */
  z-index: 11;

  &:hover:not(:disabled) {
    background: rgba(255, 143, 16, 0.2);
    border-color: #ff7900;
  }
  
  &:active:not(:disabled) {
    transform: scale(0.98);
    background: rgba(255, 143, 16, 0.25);
  }
`;

const RegisterLink = styled.div`
  text-align: center;
  margin-top: 20px;
  color: #495057;
  font-size: 14px;
  animation: ${slideIn} 0.6s ease 0.7s backwards;

  a {
    color: #FF8F10;
    text-decoration: none;
    font-weight: 600;
    margin-left: 5px;

    &:hover {
      color: #ff7900;
      text-decoration: underline;
    }
  }

  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

const Message = styled.div<{ $type: 'error' | 'success' }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 12px;
  margin-bottom: 20px;
  font-size: 14px;
  animation: ${fadeIn} 0.3s ease;
  
  ${props => props.$type === 'error' ? `
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.5);
    color: #dc2626;
  ` : `
    background: rgba(34, 197, 94, 0.15);
    border: 1px solid rgba(34, 197, 94, 0.5);
    color: #16a34a;
  `}

  @media (max-width: 480px) {
    font-size: 13px;
    padding: 10px 14px;
  }
`;

const SecurityBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 12px;
  color: #6c757d;
  font-size: 12px;
  animation: ${slideIn} 0.6s ease 0.8s backwards;

  @media (max-width: 480px) {
    font-size: 11px;
    padding: 8px;
  }
`;

// Main Component
const LoginPageGlassFixed: React.FC = () => {
  const { language } = useTranslation();
  const { state, actions } = useLogin();
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  const {
    formData,
    showPassword,
    loading,
    error,
    success
  } = state;

  const {
    handleInputChange,
    handleSubmit,
    handleGoogleLogin,
    handleFacebookLogin,
    handleAppleLogin,
    handleAnonymousLogin,
    setShowPassword
  } = actions;

  return (
    <PageContainer>
      <BackgroundSlideshow 
        images={backgroundImages} 
        interval={7000}
        transitionDuration={7}
      />
      
      <GlassWrapper>
        <Title>{language === 'bg' ? 'Влезте' : 'Login'}</Title>
        <Subtitle>
          {language === 'bg' 
            ? 'Добре дошли обратно в Bulgarian Car Marketplace' 
            : 'Welcome back to Bulgarian Car Marketplace'}
        </Subtitle>

        {error && (
          <Message $type="error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </Message>
        )}

        {success && (
          <Message $type="success">
            <CheckCircle size={18} />
            <span>{success}</span>
          </Message>
        )}

        <Form onSubmit={handleSubmit}>
          <InputBox>
            <Input
              type="email"
              name="email"
              placeholder={language === 'bg' ? 'Имейл адрес' : 'Email address'}
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={loading}
              $verified={!!success}
            />
            <InputIcon>
              <Mail size={20} />
            </InputIcon>
          </InputBox>

          <InputBox>
            <Input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder={language === 'bg' ? 'Парола' : 'Password'}
              value={formData.password}
              onChange={handleInputChange}
              required
              disabled={loading}
              $verified={!!success}
            />
            <InputIcon onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </InputIcon>
          </InputBox>

          <RememberForgot>
            <RememberLabel>
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                disabled={loading}
              />
              {language === 'bg' ? 'Запомни ме' : 'Remember me'}
            </RememberLabel>
            <ForgotLink to="/forgot-password">
              {language === 'bg' ? 'Забравена парола?' : 'Forgot password?'}
            </ForgotLink>
          </RememberForgot>

          <SubmitButton type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader size={20} className="spin" />
                {language === 'bg' ? 'Влизане...' : 'Logging in...'}
              </>
            ) : (
              <>
                {language === 'bg' ? 'Влезте' : 'Login'}
                <ArrowRight size={20} />
              </>
            )}
          </SubmitButton>
        </Form>

        <Divider>
          <span>{language === 'bg' ? 'Или продължете с' : 'Or continue with'}</span>
        </Divider>

        <SocialButtons>
          <SocialButton onClick={handleGoogleLogin} disabled={loading}>
            <Chrome size={18} />
            Google
          </SocialButton>

          <SocialButton onClick={handleFacebookLogin} disabled={loading}>
            <Facebook size={18} />
            Facebook
          </SocialButton>

          <SocialButton onClick={handleAppleLogin} disabled={loading}>
            <Apple size={18} />
            Apple
          </SocialButton>

          <SocialButton onClick={() => setShowPhoneModal(true)} disabled={loading}>
            <Phone size={18} />
            {language === 'bg' ? 'Телефон' : 'Phone'}
          </SocialButton>

          <GuestButton onClick={handleAnonymousLogin} disabled={loading}>
            <UserCheck size={18} />
            {language === 'bg' ? 'Продължи като гост' : 'Continue as Guest'}
          </GuestButton>
        </SocialButtons>

        <RegisterLink>
          {language === 'bg' ? 'Нямате акаунт?' : "Don't have an account?"}
          <Link to="/register">{language === 'bg' ? 'Регистрирайте се' : 'Register'}</Link>
        </RegisterLink>

        <SecurityBadge>
          <Shield size={14} />
          {language === 'bg' 
            ? 'Защитена връзка с шифроване' 
            : 'Secure & encrypted connection'}
        </SecurityBadge>
      </GlassWrapper>

      <PhoneAuthModal
        isOpen={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
        onSuccess={() => {
          setShowPhoneModal(false);
        }}
      />
    </PageContainer>
  );
};

export default LoginPageGlassFixed;

