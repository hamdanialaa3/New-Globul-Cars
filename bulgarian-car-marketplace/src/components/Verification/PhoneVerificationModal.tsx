// src/components/Verification/PhoneVerificationModal.tsx
// Phone Verification Modal - نافذة التحقق من الهاتف
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { X, Phone, Shield, Loader } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { VerificationService } from '../../services/verification';

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

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 24px;
`;

const Step = styled.div<{ $active: boolean }>`
  width: ${props => props.$active ? '40px' : '12px'};
  height: 12px;
  border-radius: 6px;
  background: ${props => props.$active ? '#FF7900' : '#e0e0e0'};
  transition: all 0.3s ease;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #333;
  }
  
  input {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
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

const OTPInput = styled.input`
  width: 50px;
  height: 60px;
  text-align: center;
  font-size: 1.5rem;
  font-weight: bold;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  
  &:focus {
    outline: none;
    border-color: #FF7900;
  }
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
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
    background: #f0f0f0;
    color: #666;
    &:hover { background: #e0e0e0; }
  ` : `
    background: #FF7900;
    color: white;
    &:hover { 
      background: #ff8c1a;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255, 121, 0, 0.3);
    }
  `}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }
`;

const InfoText = styled.p`
  font-size: 0.875rem;
  color: #666;
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
      <ModalContainer onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <h3>
            <Phone size={24} />
            {language === 'bg' ? 'Потвърди телефон' : 'Verify Phone'}
          </h3>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <StepIndicator>
          <Step $active={step === 'phone'} />
          <Step $active={step === 'otp'} />
        </StepIndicator>

        {step === 'phone' ? (
          <>
            <FormGroup>
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

            <InfoText>
              {language === 'bg'
                ? 'Ще получите SMS с 6-цифрен код'
                : 'You will receive an SMS with a 6-digit code'}
            </InfoText>

            <RecaptchaContainer id="recaptcha-container" />

            {error && <InfoText style={{ color: '#ef5350' }}>{error}</InfoText>}

            <ActionButton onClick={handleSendCode} disabled={loading}>
              {loading ? <Loader size={20} /> : <Shield size={20} />}
              {language === 'bg' ? 'Изпрати код' : 'Send Code'}
            </ActionButton>
          </>
        ) : (
          <>
            <InfoText>
              {language === 'bg'
                ? `Въведете кода изпратен на ${phoneNumber}`
                : `Enter code sent to ${phoneNumber}`}
            </InfoText>

            <OTPInputContainer>
              {otp.map((digit, index) => (
                <OTPInput
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

            {error && <InfoText style={{ color: '#ef5350' }}>{error}</InfoText>}

            <ActionButton onClick={handleVerifyOTP} disabled={loading}>
              {loading ? <Loader size={20} /> : <Shield size={20} />}
              {language === 'bg' ? 'Потвърди' : 'Verify'}
            </ActionButton>

            <ActionButton 
              $variant="secondary" 
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
