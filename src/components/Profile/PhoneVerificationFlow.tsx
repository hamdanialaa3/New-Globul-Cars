// PhoneVerificationFlow.tsx
// Enhanced phone verification with Firebase Phone Auth for guest account upgrade
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { Phone, Send, CheckCircle, X, Loader2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { auth, db } from '../../firebase/firebase-config';
import { 
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  linkWithCredential,
  updatePhoneNumber
} from 'firebase/auth';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { logger } from '../../services/logger-service';
import { SocialAuthService } from '../../firebase/social-auth-service';

interface PhoneVerificationFlowProps {
  currentPhone?: string;
  isGuest: boolean;
  onVerified: () => void;
  onClose: () => void;
}

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
`;

const Modal = styled.div`
  background: var(--bg-card, #1a1a1a);
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
  border-radius: 20px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
`;

const Title = styled.h2`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary, #ffffff);
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary, rgba(255, 255, 255, 0.6));
  padding: 8px;
  display: flex;
  align-items: center;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary, #ffffff);
  }
`;

const Content = styled.div`
  padding: 24px;
`;

const StepIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 24px;
`;

const Step = styled.div<{ $active: boolean; $completed: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => 
    props.$completed 
      ? '#22C55E' 
      : props.$active 
        ? '#2563EB' 
        : 'rgba(255, 255, 255, 0.2)'};
  transition: all 0.3s ease;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary, #ffffff);
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: var(--text-primary, #ffffff);
  font-size: 0.9375rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #2563EB;
    background: rgba(255, 255, 255, 0.12);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const CodeInput = styled(Input)`
  font-size: 1.5rem;
  font-weight: 600;
  text-align: center;
  letter-spacing: 12px;
  font-family: 'Courier New', monospace;
`;

const PhoneInputWrapper = styled.div`
  display: flex;
  gap: 8px;
`;

const CountryCode = styled.div`
  padding: 14px 12px;
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: var(--text-primary, #ffffff);
  font-size: 0.9375rem;
  font-weight: 600;
  white-space: nowrap;
`;

const SpinningLoader = styled(Loader2)`
  animation: ${spin} 1s linear infinite;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 24px;
  background: ${props => 
    props.$variant === 'secondary' 
      ? 'rgba(255, 255, 255, 0.1)' 
      : 'linear-gradient(135deg, #2563EB, #3B82F6)'};
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${props => 
      props.$variant === 'secondary' 
        ? 'rgba(255, 255, 255, 0.2)' 
        : 'rgba(99, 102, 241, 0.4)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled(Button)`
  background: rgba(255, 255, 255, 0.1);
  margin-top: 12px;
`;

const HelpText = styled.p`
  font-size: 0.8125rem;
  color: var(--text-secondary, rgba(255, 255, 255, 0.6));
  margin: 8px 0 0 0;
  line-height: 1.5;
`;

const RecaptchaContainer = styled.div`
  margin: 16px 0;
  display: flex;
  justify-content: center;
`;

const SuccessMessage = styled.div`
  text-align: center;
  padding: 24px 0;
`;

const SuccessIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  color: #22C55E;
`;

const SuccessText = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #22C55E;
  margin: 0 0 8px 0;
`;

const SuccessDescription = styled.p`
  font-size: 0.9375rem;
  color: var(--text-secondary, rgba(255, 255, 255, 0.7));
  line-height: 1.6;
`;

const PhoneVerificationFlow: React.FC<PhoneVerificationFlowProps> = ({
  currentPhone,
  isGuest,
  onVerified,
  onClose
}) => {
  const { language } = useLanguage();
  const isBg = language === 'bg';
  
  const [step, setStep] = useState<'phone' | 'code' | 'success'>('phone');
  const [phone, setPhone] = useState(currentPhone?.replace('+359', '') || '');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Initialize reCAPTCHA
  useEffect(() => {
    if (step === 'phone' && recaptchaContainerRef.current && !recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {
            // reCAPTCHA solved
          },
          'expired-callback': () => {
            toast.error(isBg ? 'reCAPTCHA изтече' : 'reCAPTCHA expired');
          }
        });
      } catch (error) {
        logger.error('Error initializing reCAPTCHA:', error);
      }
    }

    return () => {
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    };
  }, [step, isBg]);

  const formatPhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('359')) {
      return `+${cleaned}`;
    }
    return `+359${cleaned}`;
  };

  const validatePhone = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 9 && cleaned.length <= 10;
  };

  const handleSendCode = async () => {
    if (!validatePhone(phone)) {
      toast.error(isBg ? 'Моля, въведете валиден телефонен номер' : 'Please enter a valid phone number');
      return;
    }

    if (!recaptchaVerifierRef.current) {
      toast.error(isBg ? 'reCAPTCHA не е инициализиран' : 'reCAPTCHA not initialized');
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const formattedPhone = formatPhoneNumber(phone);

      if (isGuest && user.isAnonymous) {
        // For guest accounts, use signInWithPhoneNumber
        const confirmation = await signInWithPhoneNumber(
          auth,
          formattedPhone,
          recaptchaVerifierRef.current
        );
        setConfirmationResult(confirmation);
        setCodeSent(true);
        setStep('code');
        setCountdown(300);
        toast.success(isBg 
          ? 'SMS код е изпратен на вашия телефон' 
          : 'SMS code sent to your phone');
      } else {
        // For registered users, link phone number
        const confirmation = await SocialAuthService.linkPhoneNumber(
          formattedPhone,
          recaptchaVerifierRef.current
        );
        setConfirmationResult(confirmation);
        setCodeSent(true);
        setStep('code');
        setCountdown(300);
        toast.success(isBg 
          ? 'SMS код е изпратен на вашия телефон' 
          : 'SMS code sent to your phone');
      }
    } catch (error: any) {
      logger.error('Error sending SMS code:', error);
      toast.error(error.message || (isBg 
        ? 'Грешка при изпращане на SMS' 
        : 'Error sending SMS'));
      
      // Reset reCAPTCHA on error
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      toast.error(isBg ? 'Кодът трябва да е 6 цифри' : 'Code must be 6 digits');
      return;
    }

    if (!confirmationResult) {
      toast.error(isBg ? 'Няма активна верификация' : 'No active verification');
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Verify the code
      const result = await confirmationResult.confirm(code);

      // Update user profile
      const formattedPhone = formatPhoneNumber(phone);
      await updateDoc(doc(db, 'users', user.uid), {
        phoneNumber: formattedPhone,
        phoneVerified: true,
        phoneVerifiedAt: serverTimestamp(),
        accountType: isGuest ? 'registered' : undefined,
        isGuest: false,
        updatedAt: serverTimestamp()
      });

      // If guest, convert to registered account
      if (isGuest) {
        await SocialAuthService.convertGuestToRegistered(user.uid);
        // Reload user to get updated claims
        await user.reload();
      }

      setStep('success');
      toast.success(isBg 
        ? 'Телефонът е потвърден успешно!' 
        : 'Phone verified successfully!');
      
      setTimeout(() => {
        onVerified();
        onClose();
      }, 2000);
    } catch (error: any) {
      logger.error('Error verifying code:', error);
      toast.error(error.message || (isBg 
        ? 'Грешка при потвърждение' 
        : 'Verification error'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = () => {
    setCodeSent(false);
    setCode('');
    setCountdown(0);
    if (recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current.clear();
      recaptchaVerifierRef.current = null;
    }
    handleSendCode();
  };

  return (
    <ModalOverlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>
            <Phone size={24} />
            {isBg ? 'Потвърждение на телефон' : 'Phone Verification'}
          </Title>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </Header>

        <Content>
          <StepIndicator>
            <Step $active={step === 'phone'} $completed={step !== 'phone'} />
            <Step $active={step === 'code'} $completed={step === 'success'} />
            <Step $active={step === 'success'} $completed={false} />
          </StepIndicator>

          {step === 'phone' && (
            <>
              <FormGroup>
                <Label>{isBg ? 'Телефонен номер' : 'Phone Number'}</Label>
                <PhoneInputWrapper>
                  <CountryCode>+359</CountryCode>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="888123456"
                    disabled={loading || !!currentPhone}
                    style={{ flex: 1 }}
                  />
                </PhoneInputWrapper>
                <HelpText>
                  {isBg 
                    ? 'Ще изпратим SMS код за потвърждение на този номер' 
                    : 'We will send an SMS verification code to this number'}
                </HelpText>
              </FormGroup>
              <RecaptchaContainer id="recaptcha-container" ref={recaptchaContainerRef} />
              <Button onClick={handleSendCode} disabled={loading || !phone}>
                {loading ? (
                  <>
                    <SpinningLoader size={16} />
                    {isBg ? 'Изпращане...' : 'Sending...'}
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    {isBg ? 'Изпрати SMS' : 'Send SMS'}
                  </>
                )}
              </Button>
            </>
          )}

          {step === 'code' && (
            <>
              <FormGroup>
                <Label>{isBg ? 'SMS код' : 'SMS Code'}</Label>
                <CodeInput
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  disabled={loading}
                />
                <HelpText>
                  {isBg 
                    ? `Въведете 6-цифрения код, изпратен на +359${phone}` 
                    : `Enter the 6-digit code sent to +359${phone}`}
                </HelpText>
                {countdown > 0 && (
                  <HelpText>
                    {isBg 
                      ? `Можете да изпратите нов код след ${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, '0')}` 
                      : `Resend available in ${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, '0')}`}
                  </HelpText>
                )}
              </FormGroup>
              <Button onClick={handleVerifyCode} disabled={loading || code.length !== 6}>
                {loading ? (
                  <>
                    <SpinningLoader size={16} />
                    {isBg ? 'Проверка...' : 'Verifying...'}
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    {isBg ? 'Потвърди' : 'Verify'}
                  </>
                )}
              </Button>
              {countdown === 0 && (
                <SecondaryButton onClick={handleResendCode} disabled={loading}>
                  {isBg ? 'Изпрати код отново' : 'Resend Code'}
                </SecondaryButton>
              )}
            </>
          )}

          {step === 'success' && (
            <SuccessMessage>
              <SuccessIcon>
                <CheckCircle size={48} />
              </SuccessIcon>
              <SuccessText>
                {isBg ? 'Телефонът е потвърден!' : 'Phone Verified!'}
              </SuccessText>
              <SuccessDescription>
                {isBg 
                  ? 'Вашият акаунт е активиран успешно' 
                  : 'Your account has been activated successfully'}
              </SuccessDescription>
            </SuccessMessage>
          )}
        </Content>
      </Modal>
    </ModalOverlay>
  );
};

export default PhoneVerificationFlow;



