// ForgotPasswordPage.tsx - Password Recovery with Glass Morphism Design
// Matches the styling of LoginPageGlassFixed.tsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import {
  Mail,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader,
  KeyRound
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { bulgarianAuthService as authService } from '@/firebase/auth-service';

// Animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
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
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);

  html[data-theme="dark"] & {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  }

  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const GlassWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 480px;
  min-height: 450px;
  background: rgba(255, 255, 255, 0.98);
  border: 2px solid rgba(255, 255, 255, 0.8);
  border-radius: 24px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 4px 16px rgba(255, 143, 16, 0.1);
  padding: 40px;
  z-index: 10;
  animation: ${fadeIn} 0.6s ease-out;

  html[data-theme="dark"] & {
    background: rgba(30, 41, 59, 0.95);
    border-color: rgba(148, 163, 184, 0.3);
    box-shadow: 
      0 8px 32px rgba(0, 0, 0, 0.6),
      0 4px 16px rgba(255, 143, 16, 0.2);
  }
  transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;

  @media (max-width: 768px) {
    max-width: 100%;
    padding: 30px 20px;
    min-height: auto;
  }

  @media (max-width: 480px) {
    padding: 25px 15px;
  }
`;

const IconWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
`;

const IconCircle = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF8F10 0%, #ff6b00 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(255, 143, 16, 0.4);
  
  svg {
    color: white;
    width: 40px;
    height: 40px;
  }
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  text-align: center;
  color: #2c3e50;
  margin: 0 0 12px 0;

  html[data-theme="dark"] & {
    color: #f8fafc;
  }
  transition: color 0.3s ease;

  @media (max-width: 768px) {
    font-size: 28px;
  }

  @media (max-width: 480px) {
    font-size: 24px;
  }
`;

const Subtitle = styled.p`
  text-align: center;
  color: #6c757d;
  font-size: 15px;
  margin-bottom: 30px;
  margin-top: 0;
  line-height: 1.5;

  html[data-theme="dark"] & {
    color: #cbd5e1;
  }
  transition: color 0.3s ease;

  @media (max-width: 480px) {
    font-size: 14px;
    margin-bottom: 20px;
  }
`;

const Form = styled.form`
  width: 100%;
  position: relative;
  z-index: 1;
`;

const InputBox = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: 24px;

  @media (max-width: 480px) {
    margin-bottom: 20px;
  }
`;

const Input = styled.input`
  width: 100%;
  height: 52px;
  background: rgba(0, 0, 0, 0.03);
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 50px;
  font-size: 16px;
  color: #2c3e50;
  padding: 0 50px 0 20px;
  transition: all 0.3s ease;

  &::placeholder {
    color: rgba(0, 0, 0, 0.4);
  }

  &:focus {
    outline: none;
    border-color: #FF8F10;
    background: rgba(255, 143, 16, 0.05);
    box-shadow: 0 0 20px rgba(255, 143, 16, 0.2);
  }

  &:disabled {
    background: #e9ecef;
    color: #6c757d;
    cursor: not-allowed;
  }

  html[data-theme="dark"] & {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(148, 163, 184, 0.2);
    color: #f8fafc;
    
    &::placeholder {
      color: rgba(203, 213, 225, 0.5);
    }

    &:focus {
      border-color: #FF8F10;
      background: rgba(255, 143, 16, 0.1);
      box-shadow: 0 0 20px rgba(255, 143, 16, 0.3);
    }

    &:disabled {
      background: #334155;
      color: #64748b;
    }
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

  html[data-theme="dark"] & {
    color: #94a3b8;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  height: 52px;
  background: linear-gradient(135deg, #FF8F10 0%, #ff6b00 100%);
  border: none;
  border-radius: 50px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 143, 16, 0.3);
  margin-bottom: 20px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 143, 16, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    background: linear-gradient(135deg, #ccc 0%, #999 100%);
    cursor: not-allowed;
    box-shadow: none;
  }

  @media (max-width: 480px) {
    height: 48px;
    font-size: 15px;
  }
`;

const SpinningLoader = styled(Loader)`
  animation: ${spin} 1s linear infinite;
`;

const BackLink = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #6c757d;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s ease;

  &:hover {
    color: #FF8F10;
  }

  html[data-theme="dark"] & {
    color: #94a3b8;
    
    &:hover {
      color: #FF8F10;
    }
  }
`;

const MessageBox = styled.div<{ $type: 'success' | 'error' }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-radius: 12px;
  margin-bottom: 24px;
  background: ${props => props.$type === 'success' 
    ? 'rgba(34, 197, 94, 0.1)' 
    : 'rgba(239, 68, 68, 0.1)'};
  border: 1px solid ${props => props.$type === 'success' 
    ? 'rgba(34, 197, 94, 0.3)' 
    : 'rgba(239, 68, 68, 0.3)'};
  color: ${props => props.$type === 'success' ? '#16a34a' : '#dc2626'};

  html[data-theme="dark"] & {
    background: ${props => props.$type === 'success' 
      ? 'rgba(34, 197, 94, 0.15)' 
      : 'rgba(239, 68, 68, 0.15)'};
    color: ${props => props.$type === 'success' ? '#4ade80' : '#f87171'};
  }

  svg {
    flex-shrink: 0;
  }
`;

const MessageText = styled.span`
  font-size: 14px;
  line-height: 1.4;
`;

const SuccessContainer = styled.div`
  text-align: center;
  padding: 20px 0;
`;

const SuccessIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  box-shadow: 0 4px 20px rgba(34, 197, 94, 0.4);
  
  svg {
    color: white;
    width: 40px;
    height: 40px;
  }
`;

const SuccessTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 12px 0;

  html[data-theme="dark"] & {
    color: #f8fafc;
  }
`;

const SuccessMessage = styled.p`
  color: #6c757d;
  font-size: 15px;
  margin: 0 0 24px 0;
  line-height: 1.5;

  html[data-theme="dark"] & {
    color: #cbd5e1;
  }
`;

// Component
const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email.trim()) {
      setError(t('auth.emailRequired', 'Моля, въведете имейл адрес'));
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t('auth.invalidEmail', 'Моля, въведете валиден имейл адрес'));
      return;
    }

    setIsLoading(true);

    try {
      await authService.sendPasswordResetEmail(email);
      setIsSuccess(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      // Handle specific Firebase errors
      if (errorMessage.includes('user-not-found')) {
        setError(t('auth.userNotFound', 'Няма регистриран потребител с този имейл'));
      } else if (errorMessage.includes('invalid-email')) {
        setError(t('auth.invalidEmail', 'Невалиден имейл адрес'));
      } else if (errorMessage.includes('too-many-requests')) {
        setError(t('auth.tooManyRequests', 'Твърде много опити. Моля, опитайте по-късно'));
      } else {
        setError(t('auth.resetError', 'Възникна грешка. Моля, опитайте отново'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Success state
  if (isSuccess) {
    return (
      <PageContainer>
        <GlassWrapper>
          <SuccessContainer>
            <SuccessIcon>
              <CheckCircle />
            </SuccessIcon>
            <SuccessTitle>
              {t('auth.resetEmailSent', 'Имейлът е изпратен!')}
            </SuccessTitle>
            <SuccessMessage>
              {t('auth.resetEmailSentMessage', 
                `Изпратихме линк за възстановяване на паролата на ${email}. Моля, проверете входящата си поща и следвайте инструкциите.`
              ).replace('${email}', email)}
            </SuccessMessage>
            <SubmitButton 
              type="button" 
              onClick={() => navigate('/login')}
            >
              {t('auth.backToLogin', 'Обратно към Вход')}
            </SubmitButton>
            <BackLink to="/login">
              <Mail size={16} />
              {t('auth.didntReceiveEmail', 'Не получихте имейл? Опитайте отново')}
            </BackLink>
          </SuccessContainer>
        </GlassWrapper>
      </PageContainer>
    );
  }

  // Form state
  return (
    <PageContainer>
      <GlassWrapper>
        <IconWrapper>
          <IconCircle>
            <KeyRound />
          </IconCircle>
        </IconWrapper>
        
        <Title>
          {t('auth.forgotPasswordTitle', 'Забравена парола?')}
        </Title>
        
        <Subtitle>
          {t('auth.forgotPasswordSubtitle', 
            'Въведете имейл адреса си и ще ви изпратим линк за възстановяване на паролата.'
          )}
        </Subtitle>

        {error && (
          <MessageBox $type="error">
            <AlertCircle size={20} />
            <MessageText>{error}</MessageText>
          </MessageBox>
        )}

        <Form onSubmit={handleSubmit}>
          <InputBox>
            <Input
              type="email"
              placeholder={t('auth.emailPlaceholder', 'Въведете имейл адрес')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              autoComplete="email"
              autoFocus
            />
            <InputIcon>
              <Mail size={20} />
            </InputIcon>
          </InputBox>

          <SubmitButton type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <SpinningLoader size={20} />
                {t('auth.sending', 'Изпращане...')}
              </>
            ) : (
              t('auth.sendResetLink', 'Изпрати линк за възстановяване')
            )}
          </SubmitButton>

          <BackLink to="/login">
            <ArrowLeft size={16} />
            {t('auth.backToLogin', 'Обратно към Вход')}
          </BackLink>
        </Form>
      </GlassWrapper>
    </PageContainer>
  );
};

export default ForgotPasswordPage;
