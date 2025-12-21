import { logger } from '../services/logger-service';
// src/components/PhoneAuthModal.tsx
// Phone Authentication Modal Component

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Phone, X, Check, Loader, AlertCircle } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { SocialAuthService } from '../firebase/social-auth-service';
import { RecaptchaVerifier, ConfirmationResult } from 'firebase/auth';
import { useTheme } from '../contexts/ThemeContext';

interface PhoneAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ModalOverlay = styled.div<{ $isOpen: boolean; $isDark: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${({ $isDark }) => ($isDark ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.7)')};
  display: ${({ $isOpen }) => ($isOpen ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
`;

const ModalContent = styled.div<{ $isDark: boolean }>`
  background: ${({ $isDark }) => ($isDark ? '#252936' : '#ffffff')};
  border-radius: 16px;
  padding: 32px;
  max-width: 480px;
  width: 100%;
  position: relative;
  box-shadow: ${({ $isDark }) =>
    $isDark
      ? '0 20px 60px rgba(0, 0, 0, 0.6)'
      : '0 20px 60px rgba(0, 0, 0, 0.3)'};
  animation: slideUp 0.3s ease;
  border: ${({ $isDark }) => ($isDark ? '1px solid rgba(255, 255, 255, 0.1)' : 'none')};

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

const CloseButton = styled.button<{ $isDark: boolean }>`
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
  color: ${({ $isDark }) => ($isDark ? '#d1d5db' : '#718096')};

  &:hover {
    background: ${({ $isDark }) =>
    $isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
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

const ModalTitle = styled.h2<{ $isDark: boolean }>`
  font-size: 24px;
  font-weight: 700;
  color: ${({ $isDark }) => ($isDark ? '#f9fafb' : '#1a202c')};
  margin: 0;
`;

const ModalSubtitle = styled.p<{ $isDark: boolean }>`
  color: ${({ $isDark }) => ($isDark ? '#d1d5db' : '#718096')};
  font-size: 14px;
  margin: 0 0 24px 0;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label<{ $isDark: boolean }>`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: ${({ $isDark }) => ($isDark ? '#e5e7eb' : '#2d3748')};
  margin-bottom: 8px;
`;

const PhoneInputWrapper = styled.div`
  display: flex;
  gap: 8px;
`;

const CountryCode = styled.div<{ $isDark: boolean }>`
  background: ${({ $isDark }) => ($isDark ? '#374151' : '#f7fafc')};
  border: 2px solid ${({ $isDark }) => ($isDark ? '#4b5563' : '#e2e8f0')};
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 16px;
  font-weight: 600;
  color: ${({ $isDark }) => ($isDark ? '#e5e7eb' : '#2d3748')};
  min-width: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Input = styled.input<{ $isDark: boolean }>`
  flex: 1;
  padding: 12px 16px;
  border: 2px solid ${({ $isDark }) => ($isDark ? '#4b5563' : '#e2e8f0')};
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.2s;
  background: ${({ $isDark }) => ($isDark ? '#374151' : '#ffffff')};
  color: ${({ $isDark }) => ($isDark ? '#f9fafb' : '#1a202c')};

  &::placeholder {
    color: ${({ $isDark }) => ($isDark ? '#9ca3af' : '#9ca3af')};
  }

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px ${({ $isDark }) =>
    $isDark ? 'rgba(102, 126, 234, 0.2)' : 'rgba(102, 126, 234, 0.1)'};
  }

  &:disabled {
    background: ${({ $isDark }) => ($isDark ? '#1f2937' : '#f7fafc')};
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const RecaptchaContainer = styled.div`
  margin: 20px 0;
  display: flex;
  justify-content: center;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary'; $isDark: boolean }>`
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

  ${({ $variant, $isDark }) =>
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
    background: ${$isDark ? '#374151' : '#f7fafc'};
    color: ${$isDark ? '#e5e7eb' : '#2d3748'};
    border: 1px solid ${$isDark ? '#4b5563' : '#e2e8f0'};

    &:hover:not(:disabled) {
      background: ${$isDark ? '#4b5563' : '#e2e8f0'};
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }
`;

const ErrorMessage = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: ${({ $isDark }) => ($isDark ? '#7f1d1d' : '#fff5f5')};
  border: 1px solid ${({ $isDark }) => ($isDark ? '#dc2626' : '#fc8181')};
  border-radius: 8px;
  color: ${({ $isDark }) => ($isDark ? '#fca5a5' : '#c53030')};
  font-size: 14px;
  margin-bottom: 16px;
`;

const SuccessMessage = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: ${({ $isDark }) => ($isDark ? '#064e3b' : '#f0fff4')};
  border: 1px solid ${({ $isDark }) => ($isDark ? '#10b981' : '#68d391')};
  border-radius: 8px;
  color: ${({ $isDark }) => ($isDark ? '#6ee7b7' : '#22543d')};
  font-size: 14px;
  margin-bottom: 16px;
`;

const PhoneAuthModal: React.FC<PhoneAuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { t, language } = useTranslation();
  const { theme } = useTheme();

  // Get theme from multiple sources for reliability
  const getIsDark = (): boolean => {
    // First try useTheme hook
    if (theme === 'dark') return true;
    if (theme === 'light') return false;

    // Fallback to document attribute
    const dataTheme = document.documentElement.getAttribute('data-theme');
    if (dataTheme === 'dark') return true;
    if (dataTheme === 'light') return false;

    // Fallback to classList
    if (document.documentElement.classList.contains('dark-theme')) return true;
    if (document.documentElement.classList.contains('light-theme')) return false;

    // Default to light
    return false;
  };

  // Use state to track theme changes
  const [isDark, setIsDark] = useState(() => getIsDark());

  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [recaptchaId, setRecaptchaId] = useState(0); // Add state to force re-render/reset

  // Update theme state when theme changes
  useEffect(() => {
    const currentIsDark = getIsDark();
    setIsDark(currentIsDark);

    if (process.env.NODE_ENV === 'development') {
      logger.debug('PhoneAuthModal theme updated', {
        theme,
        isDark: currentIsDark,
        dataTheme: document.documentElement.getAttribute('data-theme'),
        hasDarkClass: document.documentElement.classList.contains('dark-theme')
      });
    }
  }, [theme]);

  // Also listen to DOM changes for theme
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const currentIsDark = getIsDark();
      if (currentIsDark !== isDark) {
        setIsDark(currentIsDark);
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class']
    });

    return () => observer.disconnect();
  }, [isDark]);

  useEffect(() => {
    // Clean up previous verifier if exists
    if (recaptchaVerifier) {
      try {
        recaptchaVerifier.clear();
      } catch (e) {
        console.warn('Error clearing recaptcha', e);
      }
    }

    if (isOpen) {
      // Small delay to ensure DOM is ready
      const timeoutId = setTimeout(() => {
        try {
          const verifier = SocialAuthService.setupRecaptchaVerifier('recaptcha-container');
          setRecaptchaVerifier(verifier);
        } catch (err) {
          logger.error('Failed to setup reCAPTCHA:', err);
          setError('Failed to initialize phone authentication. Please refresh and try again.');
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    }

    return () => {
      if (recaptchaVerifier) {
        try {
          recaptchaVerifier.clear();
        } catch (e) {
          // ignore clean up errors
        }
      }
    };
  }, [isOpen, recaptchaId]);

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
      // ✅ FIX: Enhanced Error Handling for Common Issues
      if (err.code === 'auth/operation-not-allowed') {
        setError(language === 'bg'
          ? 'Входът с телефон не е активиран в Firebase Search Console.'
          : 'Phone Sign-in is not enabled in Firebase Console. Please enable it in Authentication > Sign-in method.');
        logger.error('Phone Auth Provider disabled', err);
      } else if (err.code === 'auth/invalid-app-credential') {
        // Try to give a more helpful message even if we can't fix it from here
        setError(language === 'bg'
          ? 'Защитата на Google блокира заявката. Уверете се, че не използвате VPN и localhost е одорен в Firebase Console.'
          : 'Google Security blocked this request (Invalid App Credential). Ensure localhost is authorized in Firebase Console and no VPN is active.');
        logger.error('Invalid App Credential - Check Authorized Domains', err);
      } else if (err.message && err.message.includes('reCAPTCHA')) {
        setError(language === 'bg'
          ? 'Проблем с reCAPTCHA. Моля, опреснете страницата и опитайте пак.'
          : 'reCAPTCHA issue. Please refresh and try again.');
        // Force reset on next open
        setRecaptchaId(prev => prev + 1);
      } else {
        setError(err.message || (language === 'bg' ? 'Грешка при изпращане на код' : 'Error sending code'));
      }
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
    // Clean up verifier on close so it re-initializes cleanly next time
    if (recaptchaVerifier) {
      try {
        recaptchaVerifier.clear();
      } catch (e) {
        // ignore
      }
      setRecaptchaVerifier(null);
    }
    onClose();
  };

  return (
    <ModalOverlay
      key={`modal-overlay-${theme}`}
      $isOpen={isOpen}
      $isDark={isDark}
      onClick={handleClose}
    >
      <ModalContent
        key={`modal-content-${theme}`}
        $isDark={isDark}
        onClick={(e) => e.stopPropagation()}
      >
        <CloseButton $isDark={isDark} onClick={handleClose}>
          <X size={24} color={isDark ? '#d1d5db' : '#718096'} />
        </CloseButton>

        <ModalHeader>
          <IconWrapper>
            <Phone size={24} />
          </IconWrapper>
          <div>
            <ModalTitle $isDark={isDark}>
              {language === 'bg' ? 'Вход с телефон' : 'Phone Sign-In'}
            </ModalTitle>
          </div>
        </ModalHeader>

        <ModalSubtitle $isDark={isDark}>
          {step === 'phone'
            ? language === 'bg'
              ? 'Въведете вашия телефонен номер за да получите код за потвърждение'
              : 'Enter your phone number to receive a verification code'
            : language === 'bg'
              ? 'Въведете 6-цифрения код, изпратен на вашия телефон'
              : 'Enter the 6-digit code sent to your phone'}
        </ModalSubtitle>

        {error && (
          <ErrorMessage $isDark={isDark}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </ErrorMessage>
        )}

        {success && (
          <SuccessMessage $isDark={isDark}>
            <Check size={18} />
            <span>{success}</span>
          </SuccessMessage>
        )}

        {step === 'phone' ? (
          <>
            <FormGroup>
              <Label $isDark={isDark}>{language === 'bg' ? 'Телефонен номер' : 'Phone Number'}</Label>
              <PhoneInputWrapper>
                <CountryCode $isDark={isDark}>+359</CountryCode>
                <Input
                  $isDark={isDark}
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

            <Button $variant="primary" $isDark={isDark} onClick={handleSendCode} disabled={loading || !phoneNumber}>
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
              <Label $isDark={isDark}>{language === 'bg' ? 'Код за потвърждение' : 'Verification Code'}</Label>
              <Input
                $isDark={isDark}
                type="text"
                placeholder={language === 'bg' ? '000000' : '000000'}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                disabled={loading}
                maxLength={6}
                autoFocus
              />
            </FormGroup>

            <Button $variant="primary" $isDark={isDark} onClick={handleVerifyCode} disabled={loading || verificationCode.length !== 6}>
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
              $isDark={isDark}
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
