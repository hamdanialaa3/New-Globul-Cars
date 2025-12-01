// src/components/Verification/PhoneVerificationModal.tsx
// Phone Verification Modal - نافذة التحقق من الهاتف
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { X, Phone, Shield, Loader } from 'lucide-react';
import { useLanguage } from '@globul-cars/core/contextsLanguageContext';
import { useTheme } from '@globul-cars/core/contexts/ThemeContext';
import { VerificationService } from '@globul-cars/services/verification';

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

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 24px;
`;

const Step = styled.div<{ $active: boolean; $isDark?: boolean }>`
  width: ${props => props.$active ? '40px' : '12px'};
  height: 12px;
  border-radius: 6px;
  background: ${props => props.$active ? '#FF7900' : (props.$isDark ? '#1f2937' : '#e0e0e0')};
  transition: all 0.3s ease;
`;

const FormGroup = styled.div<{ $isDark?: boolean }>`
  margin-bottom: 20px;
  
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: ${({ $isDark }) => ($isDark ? '#e6eef9' : '#333')};
  }
  
  input {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid ${({ $isDark }) => ($isDark ? '#1f2937' : '#e0e0e0')};
    border-radius: 8px;
    background: ${({ $isDark }) => ($isDark ? '#071025' : 'white')};
    color: ${({ $isDark }) => ($isDark ? '#e6eef9' : 'inherit')};
    font-size: 1rem;
    transition: all 0.2s ease;
    
    &:focus {
      outline: none;
      border-color: #FF7900;
    }
  }
`;

const OTPInputContainer = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  margin: 24px 0;
`;

const OTPInput = styled.input<{ $isDark?: boolean }>`
  width: 50px;
  height: 60px;
  text-align: center;
  font-size: 1.5rem;
  font-weight: bold;
  border: 2px solid ${({ $isDark }) => ($isDark ? '#1f2937' : '#e0e0e0')};
  background: ${({ $isDark }) => ($isDark ? '#071025' : 'white')};
  color: ${({ $isDark }) => ($isDark ? '#e6eef9' : 'inherit')};
  border-radius: 8px;
  
  &:focus {
    outline: none;
    border-color: #FF7900;
  }
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary'; $isDark?: boolean }>`
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  
  ${props => props.$variant === 'secondary' ? `
    background: ${props.$isDark ? '#071025' : '#f0f0f0'};
    color: ${props.$isDark ? '#cbd5e1' : '#666'};
    border: 2px solid ${props.$isDark ? '#1f2937' : 'transparent'};
    &:hover { background: ${props.$isDark ? '#0b1220' : '#e0e0e0'}; }
  ` : `
    background: ${props.$isDark ? 'linear-gradient(135deg, #1f6fe8, #0f4fbf)' : '#FF7900'};
    color: white;
    &:hover { 
      background: ${props.$isDark ? 'linear-gradient(135deg, #235fcf, #0a3f9a)' : '#ff8c1a'};
      transform: translateY(-2px);
      box-shadow: ${props.$isDark ? '0 4px 12px rgba(31, 111, 232, 0.3)' : '0 4px 12px rgba(255, 121, 0, 0.3)'};
    }
  `}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }
`;

const InfoText = styled.p<{ $isDark?: boolean }>`
  font-size: 0.875rem;
  color: ${({ $isDark }) => ($isDark ? '#9aa6b2' : '#666')};
  text-align: center;
  line-height: 1.5;
  margin: 16px 0;
`;

const RecaptchaContainer = styled.div`
  margin: 20px 0;
`;

// ==================== COMPONENT ====================

interface PhoneVerificationModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const PhoneVerificationModal: React.FC<PhoneVerificationModalProps> = ({
  onClose,
  onSuccess
}) => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('+359 ');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize reCAPTCHA
  useEffect(() => {
    VerificationService.phone.initializeRecaptcha('recaptcha-container');
    
    return () => {
      VerificationService.phone.cleanup();
    };
  }, []);

  // Send SMS
  const handleSendCode = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await VerificationService.phone.sendVerificationCode(phoneNumber);
      
      if (result.success) {
        setStep('otp');
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    const code = otp.join('');
    
    if (code.length !== 6) {
      setError('Enter 6 digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await VerificationService.phone.verifyCode(code);
      
      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP input
  const handleOTPChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer $isDark={isDark} onClick={e => e.stopPropagation()}>
        <ModalHeader $isDark={isDark}>
          <h3>
            <Phone size={24} />
            {language === 'bg' ? 'Потвърди телефон' : 'Verify Phone'}
          </h3>
          <CloseButton $isDark={isDark} onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <StepIndicator>
          <Step $active={step === 'phone'} $isDark={isDark} />
          <Step $active={step === 'otp'} $isDark={isDark} />
        </StepIndicator>

        {step === 'phone' ? (
          <>
            <FormGroup $isDark={isDark}>
              <label>
                {language === 'bg' ? 'Телефонен номер' : 'Phone Number'}
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+359 888 123 456"
                disabled={loading}
              />
            </FormGroup>

            <InfoText $isDark={isDark}>
              {language === 'bg'
                ? 'Ще получите SMS с 6-цифрен код'
                : 'You will receive an SMS with a 6-digit code'}
            </InfoText>

            <RecaptchaContainer id="recaptcha-container" />

            {error && <InfoText $isDark={isDark} style={{ color: '#ef5350' }}>{error}</InfoText>}

            <ActionButton $isDark={isDark} onClick={handleSendCode} disabled={loading}>
              {loading ? <Loader size={20} /> : <Shield size={20} />}
              {language === 'bg' ? 'Изпрати код' : 'Send Code'}
            </ActionButton>
          </>
        ) : (
          <>
            <InfoText $isDark={isDark}>
              {language === 'bg'
                ? `Въведете кода изпратен на ${phoneNumber}`
                : `Enter code sent to ${phoneNumber}`}
            </InfoText>

            <OTPInputContainer>
              {otp.map((digit, index) => (
                <OTPInput $isDark={isDark}
                  key={index}
                  ref={(el) => { otpRefs.current[index] = el; }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOTPChange(index, e.target.value)}
                  disabled={loading}
                />
              ))}
            </OTPInputContainer>

            {error && <InfoText $isDark={isDark} style={{ color: '#ef5350' }}>{error}</InfoText>}

            <ActionButton $isDark={isDark} onClick={handleVerifyOTP} disabled={loading}>
              {loading ? <Loader size={20} /> : <Shield size={20} />}
              {language === 'bg' ? 'Потвърди' : 'Verify'}
            </ActionButton>

            <ActionButton 
              $variant="secondary" 
              $isDark={isDark}
              onClick={() => setStep('phone')}
              style={{ marginTop: '12px' }}
            >
              {language === 'bg' ? 'Назад' : 'Back'}
            </ActionButton>
          </>
        )}
      </ModalContainer>
    </ModalOverlay>
  );
};

export default PhoneVerificationModal;
