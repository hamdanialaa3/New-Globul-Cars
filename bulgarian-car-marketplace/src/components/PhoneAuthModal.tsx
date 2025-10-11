// src/components/PhoneAuthModal.tsx
// Phone Authentication Modal Component

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Phone, X, Check, Loader, AlertCircle } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { SocialAuthService } from '../firebase/social-auth-service';
import { RecaptchaVerifier, ConfirmationResult } from 'firebase/auth';

interface PhoneAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const Modal Overlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: ${({ $isOpen }) => ($isOpen ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  max-width: 480px;
  width: 100%;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const ModalTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
`;

const ModalSubtitle = styled.p`
  color: #718096;
  font-size: 14px;
  margin: 0 0 24px 0;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
`;

const PhoneInputWrapper = styled.div`
  display: flex;
  gap: 8px;
`;

const CountryCode = styled.div`
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  min-width: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Input = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &:disabled {
    background: #f7fafc;
    cursor: not-allowed;
  }
`;

const RecaptchaContainer = styled.div`
  margin: 20px 0;
  display: flex;
  justify-content: center;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  width: 100%;
  padding: 14px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;

  ${({ $variant }) =>
    $variant === 'primary'
      ? `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
    }
  `
      : `
    background: #f7fafc;
    color: #2d3748;

    &:hover:not(:disabled) {
      background: #e2e8f0;
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fff5f5;
  border: 1px solid #fc8181;
  border-radius: 8px;
  color: #c53030;
  font-size: 14px;
  margin-bottom: 16px;
`;

const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f0fff4;
  border: 1px solid #68d391;
  border-radius: 8px;
  color: #22543d;
  font-size: 14px;
  margin-bottom: 16px;
`;

const PhoneAuthModal: React.FC<PhoneAuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { t, language } = useTranslation();
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  useEffect(() => {
    if (isOpen && !recaptchaVerifier) {
      try {
        const verifier = SocialAuthService.setupRecaptchaVerifier('recaptcha-container');
        setRecaptchaVerifier(verifier);
      } catch (err) {
        console.error('Failed to setup reCAPTCHA:', err);
        setError('Failed to initialize phone authentication. Please refresh and try again.');
      }
    }

    return () => {
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
      }
    };
  }, [isOpen]);

  const handleSendCode = async () => {
    if (!phoneNumber || !recaptchaVerifier) {
      setError(language === 'bg' ? 'Моля, въведете телефонен номер' : 'Please enter a phone number');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const confirmation = await SocialAuthService.sendPhoneVerificationCode(phoneNumber, recaptchaVerifier);
      setConfirmationResult(confirmation);
      setStep('code');
      setSuccess(language === 'bg' ? 'Кодът за потвърждение е изпратен!' : 'Verification code sent!');
    } catch (err: any) {
      setError(err.message || (language === 'bg' ? 'Грешка при изпращане на код' : 'Error sending code'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || !confirmationResult) {
      setError(language === 'bg' ? 'Моля, въведете код за потвърждение' : 'Please enter verification code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await SocialAuthService.verifyPhoneCode(confirmationResult, verificationCode);
      setSuccess(language === 'bg' ? 'Успешно влизане!' : 'Sign-in successful!');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || (language === 'bg' ? 'Невалиден код' : 'Invalid code'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('phone');
    setPhoneNumber('');
    setVerificationCode('');
    setError('');
    setSuccess('');
    if (recaptchaVerifier) {
      recaptchaVerifier.clear();
      setRecaptchaVerifier(null);
    }
    onClose();
  };

  return (
    <ModalOverlay $isOpen={isOpen} onClick={handleClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={handleClose}>
          <X size={24} color="#718096" />
        </CloseButton>

        <ModalHeader>
          <IconWrapper>
            <Phone size={24} />
          </IconWrapper>
          <div>
            <ModalTitle>
              {language === 'bg' ? 'Вход с телефон' : 'Phone Sign-In'}
            </ModalTitle>
          </div>
        </ModalHeader>

        <ModalSubtitle>
          {step === 'phone'
            ? language === 'bg'
              ? 'Въведете вашия телефонен номер за да получите код за потвърждение'
              : 'Enter your phone number to receive a verification code'
            : language === 'bg'
            ? 'Въведете 6-цифрения код, изпратен на вашия телефон'
            : 'Enter the 6-digit code sent to your phone'}
        </ModalSubtitle>

        {error && (
          <ErrorMessage>
            <AlertCircle size={18} />
            <span>{error}</span>
          </ErrorMessage>
        )}

        {success && (
          <SuccessMessage>
            <Check size={18} />
            <span>{success}</span>
          </SuccessMessage>
        )}

        {step === 'phone' ? (
          <>
            <FormGroup>
              <Label>{language === 'bg' ? 'Телефонен номер' : 'Phone Number'}</Label>
              <PhoneInputWrapper>
                <CountryCode>+359</CountryCode>
                <Input
                  type="tel"
                  placeholder={language === 'bg' ? '8XXXXXXXX' : '8XXXXXXXX'}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  disabled={loading}
                  maxLength={9}
                />
              </PhoneInputWrapper>
            </FormGroup>

            <RecaptchaContainer id="recaptcha-container" />

            <Button $variant="primary" onClick={handleSendCode} disabled={loading || !phoneNumber}>
              {loading ? (
                <>
                  <Loader size={20} className="spin" />
                  {language === 'bg' ? 'Изпращане...' : 'Sending...'}
                </>
              ) : (
                <>
                  <Phone size={20} />
                  {language === 'bg' ? 'Изпрати код' : 'Send Code'}
                </>
              )}
            </Button>
          </>
        ) : (
          <>
            <FormGroup>
              <Label>{language === 'bg' ? 'Код за потвърждение' : 'Verification Code'}</Label>
              <Input
                type="text"
                placeholder={language === 'bg' ? '000000' : '000000'}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                disabled={loading}
                maxLength={6}
                autoFocus
              />
            </FormGroup>

            <Button $variant="primary" onClick={handleVerifyCode} disabled={loading || verificationCode.length !== 6}>
              {loading ? (
                <>
                  <Loader size={20} className="spin" />
                  {language === 'bg' ? 'Проверка...' : 'Verifying...'}
                </>
              ) : (
                <>
                  <Check size={20} />
                  {language === 'bg' ? 'Потвърди' : 'Verify'}
                </>
              )}
            </Button>

            <Button
              $variant="secondary"
              onClick={() => setStep('phone')}
              disabled={loading}
              style={{ marginTop: '12px' }}
            >
              {language === 'bg' ? 'Обратно' : 'Back'}
            </Button>
          </>
        )}
      </ModalContent>
    </ModalOverlay>
  );
};

export default PhoneAuthModal;

