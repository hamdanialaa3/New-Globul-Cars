// src/components/Verification/EmailVerificationModal.tsx
// Email Verification Modal - نافذة التحقق من الإيميل
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { X, Mail, Send, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthProvider';
import { EmailVerificationService } from '../../services/email-verification';

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

const ModalContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  h3 {
    margin: 0;
    font-size: 1.5rem;
    color: #333;
    display: flex;
    align-items: center;
    gap: 12px;
  }
`;

const CloseButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:hover {
    background: #e0e0e0;
  }
`;

const ContentSection = styled.div`
  margin-bottom: 24px;
`;

const EmailDisplay = styled.div`
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  
  svg {
    color: #2563EB;
  }
  
  p {
    margin: 0;
    font-size: 1rem;
    color: #333;
    font-weight: 500;
  }
`;

const InfoText = styled.p<{ $type?: 'default' | 'success' | 'error' | 'info' }>`
  margin: 16px 0;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  line-height: 1.5;
  
  ${props => {
    switch (props.$type) {
      case 'success':
        return `
          background: #d1f4e0;
          color: #0d7a3f;
          border-left: 4px solid #0d7a3f;
        `;
      case 'error':
        return `
          background: #ffe5e5;
          color: #d32f2f;
          border-left: 4px solid #d32f2f;
        `;
      case 'info':
        return `
          background: #e3f2fd;
          color: #1976d2;
          border-left: 4px solid #1976d2;
        `;
      default:
        return `
          background: #f5f5f5;
          color: #666;
        `;
    }
  }}
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

const SendButton = styled.button<{ $disabled?: boolean }>`
  flex: 1;
  padding: 12px 24px;
  background: ${props => props.$disabled ? '#ccc' : 'linear-gradient(135deg, #2563EB 0%, #FF9500 100%)'};
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
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
  }
`;

const CheckButton = styled.button`
  flex: 1;
  padding: 12px 24px;
  background: white;
  color: #2563EB;
  border: 2px solid #2563EB;
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
    background: #FFF5E6;
    transform: translateY(-2px);
  }
`;

const Countdown = styled.span`
  color: #666;
  font-size: 0.9rem;
  text-align: center;
  margin-top: 8px;
  display: block;
`;

const StepsList = styled.ol`
  margin: 16px 0;
  padding-left: 24px;
  color: #666;
  
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

const StatusIcon = styled.div<{ $status: 'idle' | 'sending' | 'sent' | 'verified' | 'error' }>`
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
          background: #d1f4e0;
          color: #0d7a3f;
        `;
      case 'verified':
        return `
          background: #d1f4e0;
          color: #0d7a3f;
        `;
      case 'error':
        return `
          background: #ffe5e5;
          color: #d32f2f;
        `;
      default:
        return `
          background: #f5f5f5;
          color: #666;
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
    } catch (error: unknown) {
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
        <ModalContainer onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
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
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h3>
            <Mail color="#2563EB" />
            {language === 'bg' ? 'Потвърждение на имейл' : 'Email Verification'}
          </h3>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <ContentSection>
          {status === 'verified' && (
            <StatusIcon $status="verified">
              <CheckCircle size={40} />
            </StatusIcon>
          )}

          {status === 'error' && (
            <StatusIcon $status="error">
              <AlertCircle size={40} />
            </StatusIcon>
          )}

          <EmailDisplay>
            <Mail size={20} />
            <p>{currentUser?.email}</p>
          </EmailDisplay>

          {status === 'idle' && (
            <>
              <InfoText>
                {language === 'bg'
                  ? 'Моля, потвърдете имейл адреса си, за да активирате всички функции на профила си.'
                  : 'Please verify your email address to activate all profile features.'}
              </InfoText>

              <StepsList>
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
            <InfoText $type="success">
              {message}
              <br /><br />
              {language === 'bg'
                ? 'Проверете вашата пощенска кутия и кликнете върху линка за потвърждение.'
                : 'Check your mailbox and click the verification link.'}
            </InfoText>
          )}

          {status === 'verified' && (
            <InfoText $type="success">
              {message}
            </InfoText>
          )}

          {status === 'error' && message && (
            <InfoText $type="error">
              {message}
            </InfoText>
          )}
        </ContentSection>

        {status !== 'verified' && (
          <ButtonGroup>
            <SendButton
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
              <CheckButton onClick={handleCheckStatus} disabled={isChecking}>
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



