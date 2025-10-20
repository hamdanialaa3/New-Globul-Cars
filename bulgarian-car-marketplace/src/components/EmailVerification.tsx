// src/components/EmailVerificationFixed.tsx
// Email Verification Component with Bulgarian/English support

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthProvider';
import { EmailVerificationService } from '../services/email-verification';
import { useTranslation } from '../hooks/useTranslation';
import { Mail, CheckCircle, AlertCircle, RefreshCw, Send, Clock } from 'lucide-react';

const VerificationContainer = styled.div`
  background: linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%);
  border: 2px solid #e3f2fd;
  border-radius: 16px;
  padding: 24px;
  margin: 16px 0;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const VerificationIcon = styled.div<{ $status: 'pending' | 'verified' | 'error' }>`
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: ${props => {
    switch (props.$status) {
      case 'verified': return 'linear-gradient(135deg, #4caf50, #66bb6a)';
      case 'error': return 'linear-gradient(135deg, #f44336, #ef5350)';
      default: return 'linear-gradient(135deg, #FF7900, #ff8c1a)';
    }
  }};
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const VerificationTitle = styled.h3`
  color: #1a237e;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 8px;
`;

const VerificationMessage = styled.p`
  color: #424242;
  margin-bottom: 16px;
  line-height: 1.5;
`;

const EmailDisplay = styled.div`
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  margin: 12px 0;
  font-family: monospace;
  font-size: 0.9rem;
  color: #1565c0;
  word-break: break-all;
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 4px;
  
  ${props => props.$variant === 'secondary' ? `
    background: #f5f5f5;
    color: #666;
    border: 1px solid #ddd;
    &:hover:not(:disabled) {
      background: #eeeeee;
      border-color: #ccc;
    }
  ` : `
    background: linear-gradient(135deg, #FF7900, #ff8c1a);
    color: white;
    &:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(255, 121, 0, 0.3);
    }
  `}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }
`;

const CountdownTimer = styled.div`
  font-size: 0.8rem;
  color: #666;
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
`;

const StatusMessage = styled.div<{ $type: 'success' | 'error' | 'info' }>`
  padding: 12px 16px;
  border-radius: 8px;
  margin: 12px 0;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 8px;
  
  ${props => {
    switch (props.$type) {
      case 'success':
        return `
          background: #e8f5e8;
          color: #2e7d32;
          border-left: 4px solid #4caf50;
        `;
      case 'error':
        return `
          background: #ffebee;
          color: #c62828;
          border-left: 4px solid #f44336;
        `;
      default:
        return `
          background: #e3f2fd;
          color: #1565c0;
          border-left: 4px solid #2196f3;
        `;
    }
  }}
`;

interface EmailVerificationProps {
  compact?: boolean;
  showTitle?: boolean;
  onVerificationComplete?: () => void;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({
  compact = false,
  showTitle = true,
  onVerificationComplete
}) => {
  const { currentUser } = useAuth();
  const { language } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [countdown, setCountdown] = useState(0);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // Auto-check verification status periodically
  useEffect(() => {
    if (!currentUser || currentUser.emailVerified) return;

    const interval = setInterval(async () => {
      setIsCheckingStatus(true);
      await EmailVerificationService.reloadUser(currentUser);
      if (currentUser.emailVerified) {
        setMessage(
          language === 'bg' 
            ? 'Имейлът е успешно потвърден!' 
            : 'Email verified successfully!'
        );
        setMessageType('success');
        onVerificationComplete?.();
      }
      setIsCheckingStatus(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [currentUser, language, onVerificationComplete]);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendVerification = async () => {
    if (!currentUser) return;

    setLoading(true);
    setMessage('');

    try {
      const result = await EmailVerificationService.sendVerificationEmail(
        currentUser, 
        language as 'bg' | 'en'
      );

      setMessage(result.message);
      setMessageType(result.success ? 'success' : 'error');
      
      if (result.success) {
        setCountdown(60); // 60 seconds cooldown
      }
    } catch (error) {
      setMessage(
        language === 'bg'
          ? 'Грешка при изпращане на имейл за потвърждение'
          : 'Error sending verification email'
      );
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!currentUser) return;

    setIsCheckingStatus(true);
    await EmailVerificationService.reloadUser(currentUser);
    
    if (currentUser.emailVerified) {
      setMessage(
        language === 'bg'
          ? 'Имейлът е успешно потвърден!'
          : 'Email verified successfully!'
      );
      setMessageType('success');
      onVerificationComplete?.();
    } else {
      setMessage(
        language === 'bg'
          ? 'Имейлът все още не е потвърден'
          : 'Email not yet verified'
      );
      setMessageType('info');
    }
    setIsCheckingStatus(false);
  };

  if (!currentUser) return null;
  if (currentUser.emailVerified) {
    return compact ? null : (
      <VerificationContainer>
        <VerificationIcon $status="verified">
          <CheckCircle size={32} />
        </VerificationIcon>
        {showTitle && (
          <VerificationTitle>
            {language === 'bg' 
              ? 'Имейлът е потвърден' 
              : 'Email Verified'}
          </VerificationTitle>
        )}
        <VerificationMessage>
          {language === 'bg'
            ? 'Вашият имейл адрес е успешно потвърден.'
            : 'Your email address has been verified successfully.'}
        </VerificationMessage>
      </VerificationContainer>
    );
  }

  return (
    <VerificationContainer>
      <VerificationIcon $status={messageType === 'error' ? 'error' : 'pending'}>
        <Mail size={32} />
      </VerificationIcon>

      {showTitle && (
        <VerificationTitle>
          {language === 'bg'
            ? 'Потвърдете вашия имейл'
            : 'Verify Your Email'}
        </VerificationTitle>
      )}

      <VerificationMessage>
        {language === 'bg'
          ? 'Моля, потвърдете вашия имейл адрес за да активирате всички функции на акаунта.'
          : 'Please verify your email address to activate all account features.'}
      </VerificationMessage>

      <EmailDisplay>{currentUser.email}</EmailDisplay>

      {message && (
        <StatusMessage $type={messageType}>
          {messageType === 'success' && <CheckCircle size={16} />}
          {messageType === 'error' && <AlertCircle size={16} />}
          {messageType === 'info' && <Mail size={16} />}
          {message}
        </StatusMessage>
      )}

      <div>
        <ActionButton
          onClick={handleSendVerification}
          disabled={loading || countdown > 0}
        >
          {loading ? (
            <RefreshCw size={16} className="spinning" />
          ) : (
            <Send size={16} />
          )}
          {language === 'bg'
            ? 'Изпрати имейл'
            : 'Send Email'}
          {countdown > 0 && ` (${countdown}s)`}
        </ActionButton>

        <ActionButton
          $variant="secondary"
          onClick={handleCheckStatus}
          disabled={isCheckingStatus}
        >
          {isCheckingStatus ? (
            <RefreshCw size={16} className="spinning" />
          ) : (
            <RefreshCw size={16} />
          )}
          {language === 'bg'
            ? 'Проверка'
            : 'Check Status'}
        </ActionButton>
      </div>

      {countdown > 0 && (
        <CountdownTimer>
          <Clock size={12} />
          {language === 'bg'
            ? `Можете да изпратите отново след ${countdown} секунди`
            : `Can resend in ${countdown} seconds`}
        </CountdownTimer>
      )}
    </VerificationContainer>
  );
};

export default EmailVerification;