// src/components/Verification/EmailVerificationModal.tsx
// Email Verification Modal - نافذة التحقق من الإيميل
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { X, Mail, Send, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useLanguage } from '@globul-cars/core/contextsLanguageContext';
import { useTheme } from '@globul-cars/core/contexts/ThemeContext';
import { useAuth } from '@globul-cars/core/contextsAuthProvider';
import { EmailVerificationService } from '@globul-cars/services/email-verification';

// ==================== STYLED COMPONENTS ====================

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
`;

const ModalContainer = styled.div<{ $isDark?: boolean }>`
  background: ${({ $isDark }) => ($isDark ? '#071025' : 'white')};
  border-radius: 16px;
  padding: 32px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
`;

const ModalHeader = styled.div<{ $isDark?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  h3 {
    margin: 0;
    font-size: 1.5rem;
    color: ${({ $isDark }) => ($isDark ? '#e6eef9' : '#333')};
    display: flex;
    align-items: center;
    gap: 12px;
  }
`;

const CloseButton = styled.button<{ $isDark?: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: ${({ $isDark }) => ($isDark ? '#0b1220' : '#f0f0f0')};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:hover {
    background: ${({ $isDark }) => ($isDark ? '#121827' : '#e0e0e0')};
  }
`;

const ContentSection = styled.div`
  margin-bottom: 24px;
`;

const EmailDisplay = styled.div<{ $isDark?: boolean }>`
  background: ${({ $isDark }) => ($isDark ? '#071025' : '#f8f9fa')};
  border: 1px solid ${({ $isDark }) => ($isDark ? '#1f2937' : '#e0e0e0')};
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  
  svg {
    color: #FF7900;
  }
  
  p {
    margin: 0;
    font-size: 1rem;
    color: ${({ $isDark }) => ($isDark ? '#e6eef9' : '#333')};
    font-weight: 500;
  }
`;

const InfoText = styled.p<{ $type?: 'default' | 'success' | 'error' | 'info'; $isDark?: boolean }>`
  margin: 16px 0;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  line-height: 1.5;
  
  ${props => {
    switch (props.$type) {
      case 'success':
          return `
            background: ${props.$isDark ? '#08342b' : '#d1f4e0'};
            color: ${props.$isDark ? '#9be6bb' : '#0d7a3f'};
            border-left: 4px solid ${props.$isDark ? '#0d7a3f' : '#0d7a3f'};
          `;
      case 'error':
        return `
          background: ${props.$isDark ? '#2b0b0b' : '#ffe5e5'};
          color: ${props.$isDark ? '#ffb4b4' : '#d32f2f'};
          border-left: 4px solid ${props.$isDark ? '#d32f2f' : '#d32f2f'};
        `;
      case 'info':
        return `
          background: ${props.$isDark ? '#07162a' : '#e3f2fd'};
          color: ${props.$isDark ? '#8ebcf7' : '#1976d2'};
          border-left: 4px solid ${props.$isDark ? '#1976d2' : '#1976d2'};
        `;
      default:
        return `
          background: ${props.$isDark ? '#071025' : '#f5f5f5'};
          color: ${props.$isDark ? '#9aa6b2' : '#666'};
        `;
    }
  }}
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

const SendButton = styled.button<{ $disabled?: boolean; $isDark?: boolean }>`
  flex: 1;
  padding: 12px 24px;
  background: ${props => props.$disabled ? (props.$isDark ? '#2a2a2a' : '#ccc') : (props.$isDark ? 'linear-gradient(135deg, #1f6fe8, #0f4fbf)' : 'linear-gradient(135deg, #FF7900 0%, #FF9500 100%)')};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${props => props.$isDark ? '0 4px 12px rgba(31, 111, 232, 0.3)' : '0 4px 12px rgba(255, 121, 0, 0.3)'};
  }
  
  &:disabled {
    opacity: 0.6;
  }
`;

const CheckButton = styled.button<{ $isDark?: boolean }>`
  flex: 1;
  padding: 12px 24px;
  background: ${({ $isDark }) => ($isDark ? '#071025' : 'white')};
  color: ${({ $isDark }) => ($isDark ? '#FFB78C' : '#FF7900')};
  border: 2px solid ${({ $isDark }) => ($isDark ? '#FF7900' : '#FF7900')};
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${({ $isDark }) => ($isDark ? '#071025' : '#FFF5E6')};
    transform: translateY(-2px);
  }
`;

const Countdown = styled.span<{ $isDark?: boolean }>`
  color: ${({ $isDark }) => ($isDark ? '#9aa6b2' : '#666')};
  font-size: 0.9rem;
  text-align: center;
  margin-top: 8px;
  display: block;
`;

const StepsList = styled.ol<{ $isDark?: boolean }>`
  margin: 16px 0;
  padding-left: 24px;
  color: ${({ $isDark }) => ($isDark ? '#9aa6b2' : '#666')};
  
  li {
    margin-bottom: 8px;
    line-height: 1.5;
  }
`;

const LoadingSpinner = styled.div`
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const StatusIcon = styled.div<{ $status: 'idle' | 'sending' | 'sent' | 'verified' | 'error'; $isDark?: boolean }>`
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  ${props => {
    switch (props.$status) {
      case 'sent':
        return `
          background: ${props.$isDark ? '#08342b' : '#d1f4e0'};
          color: ${props.$isDark ? '#9be6bb' : '#0d7a3f'};
        `;
      case 'verified':
        return `
          background: ${props.$isDark ? '#08342b' : '#d1f4e0'};
          color: ${props.$isDark ? '#9be6bb' : '#0d7a3f'};
        `;
      case 'error':
        return `
          background: ${props.$isDark ? '#2b0b0b' : '#ffe5e5'};
          color: ${props.$isDark ? '#ffb4b4' : '#d32f2f'};
        `;
      default:
        return `
          background: ${props.$isDark ? '#071025' : '#f5f5f5'};
          color: ${props.$isDark ? '#9aa6b2' : '#666'};
        `;
    }
  }}
`;

// ==================== COMPONENT ====================

interface EmailVerificationModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  onClose,
  onSuccess
}) => {
  const { currentUser } = useAuth();
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'verified' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isChecking, setIsChecking] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Auto-check every 5 seconds after sending
  useEffect(() => {
    if (status === 'sent' && currentUser) {
      const interval = setInterval(async () => {
        await EmailVerificationService.reloadUser(currentUser);
        if (currentUser.emailVerified) {
          setStatus('verified');
          setMessage(
            language === 'bg'
              ? 'Имейлът е успешно потвърден!'
              : 'Email successfully verified!'
          );
          setTimeout(() => {
            onSuccess();
          }, 2000);
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [status, currentUser, language, onSuccess]);

  const handleSendEmail = async () => {
    if (!currentUser || countdown > 0) return;

    setStatus('sending');
    setMessage('');

    try {
      const result = await EmailVerificationService.sendVerificationEmail(
        currentUser,
        language as 'bg' | 'en'
      );

      if (result.success) {
        setStatus('sent');
        setMessage(result.message);
        setCountdown(60);
      } else {
        setStatus('error');
        setMessage(result.message);
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(
        language === 'bg'
          ? 'Грешка при изпращане на имейл за потвърждение'
          : 'Error sending verification email'
      );
    }
  };

  const handleCheckStatus = async () => {
    if (!currentUser) return;

    setIsChecking(true);
    await EmailVerificationService.reloadUser(currentUser);

    if (currentUser.emailVerified) {
      setStatus('verified');
      setMessage(
        language === 'bg'
          ? 'Имейлът е успешно потвърден!'
          : 'Email successfully verified!'
      );
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } else {
      setMessage(
        language === 'bg'
          ? 'Имейлът все още не е потвърден'
          : 'Email not yet verified'
      );
    }
    setIsChecking(false);
  };

  // Already verified
  if (currentUser?.emailVerified) {
    return (
      <ModalOverlay onClick={onClose}>
        <ModalContainer $isDark={isDark} onClick={(e) => e.stopPropagation()}>
          <ModalHeader $isDark={isDark}>
            <h3>
              <CheckCircle color="#0d7a3f" />
              {language === 'bg' ? 'Потвърдено' : 'Verified'}
            </h3>
            <CloseButton onClick={onClose}>
              <X size={20} />
            </CloseButton>
          </ModalHeader>
          
          <StatusIcon $status="verified">
            <CheckCircle size={40} />
          </StatusIcon>

          <InfoText $type="success">
            {language === 'bg'
              ? 'Вашият имейл адрес е вече потвърден!'
              : 'Your email address is already verified!'}
          </InfoText>
        </ModalContainer>
      </ModalOverlay>
    );
  }

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer $isDark={isDark} onClick={(e) => e.stopPropagation()}>
        <ModalHeader $isDark={isDark}>
          <h3>
            <Mail color="#FF7900" />
            {language === 'bg' ? 'Потвърждение на имейл' : 'Email Verification'}
          </h3>
          <CloseButton $isDark={isDark} onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <ContentSection>
          {status === 'verified' && (
            <StatusIcon $status="verified" $isDark={isDark}>
              <CheckCircle size={40} />
            </StatusIcon>
          )}

          {status === 'error' && (
            <StatusIcon $status="error" $isDark={isDark}>
              <AlertCircle size={40} />
            </StatusIcon>
          )}

          <EmailDisplay $isDark={isDark}>
            <Mail size={20} />
            <p>{currentUser?.email}</p>
          </EmailDisplay>

          {status === 'idle' && (
            <>
              <InfoText $isDark={isDark}>
                {language === 'bg'
                  ? 'Моля, потвърдете имейл адреса си, за да активирате всички функции на профила си.'
                  : 'Please verify your email address to activate all profile features.'}
              </InfoText>

              <StepsList $isDark={isDark}>
                <li>
                  {language === 'bg'
                    ? 'Натиснете бутона "Изпрати имейл" по-долу'
                    : 'Click "Send Email" button below'}
                </li>
                <li>
                  {language === 'bg'
                    ? 'Проверете папката "Входящи" или "Спам"'
                    : 'Check your inbox or spam folder'}
                </li>
                <li>
                  {language === 'bg'
                    ? 'Натиснете линка в имейла за потвърждение'
                    : 'Click the verification link in the email'}
                </li>
              </StepsList>
            </>
          )}

          {status === 'sent' && (
            <InfoText $type="success" $isDark={isDark}>
              {message}
              <br /><br />
              {language === 'bg'
                ? 'Проверете вашата пощенска кутия и кликнете върху линка за потвърждение.'
                : 'Check your mailbox and click the verification link.'}
            </InfoText>
          )}

          {status === 'verified' && (
            <InfoText $type="success" $isDark={isDark}>
              {message}
            </InfoText>
          )}

          {status === 'error' && message && (
            <InfoText $type="error" $isDark={isDark}>
              {message}
            </InfoText>
          )}
        </ContentSection>

        {status !== 'verified' && (
          <ButtonGroup>
            <SendButton
              $isDark={isDark}
              onClick={handleSendEmail}
              disabled={status === 'sending' || countdown > 0}
              $disabled={status === 'sending' || countdown > 0}
            >
              {status === 'sending' ? (
                <>
                  <LoadingSpinner>
                    <Loader size={18} />
                  </LoadingSpinner>
                  {language === 'bg' ? 'Изпращане...' : 'Sending...'}
                </>
              ) : countdown > 0 ? (
                <>
                  <Send size={18} />
                  {language === 'bg' ? `Изчакайте ${countdown}s` : `Wait ${countdown}s`}
                </>
              ) : (
                <>
                  <Send size={18} />
                  {language === 'bg' ? 'Изпрати имейл' : 'Send Email'}
                </>
              )}
            </SendButton>

            {status === 'sent' && (
              <CheckButton $isDark={isDark} onClick={handleCheckStatus} disabled={isChecking}>
                {isChecking ? (
                  <LoadingSpinner>
                    <Loader size={18} />
                  </LoadingSpinner>
                ) : (
                  <CheckCircle size={18} />
                )}
                {language === 'bg' ? 'Провери статус' : 'Check Status'}
              </CheckButton>
            )}
          </ButtonGroup>
        )}
      </ModalContainer>
    </ModalOverlay>
  );
};

export default EmailVerificationModal;

