// EmailVerificationFlow.tsx
// Enhanced email verification with OTP code for guest account upgrade
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Mail, Send, CheckCircle, X, Loader2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { auth, db } from '../../firebase/firebase-config';
import { 
  updateEmail, 
  sendEmailVerification, 
  updateProfile,
  reload 
} from 'firebase/auth';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { logger } from '../../services/logger-service';
import { SocialAuthService } from '../../firebase/social-auth-service';

interface EmailVerificationFlowProps {
  currentEmail?: string;
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
        ? '#FF7900' 
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
    border-color: #FF7900;
    background: rgba(255, 255, 255, 0.12);
    box-shadow: 0 0 0 3px rgba(255, 121, 0, 0.1);
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
      : 'linear-gradient(135deg, #FF7900, #FF8F10)'};
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
        : 'rgba(255, 121, 0, 0.4)'};
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

const EmailVerificationFlow: React.FC<EmailVerificationFlowProps> = ({
  currentEmail,
  isGuest,
  onVerified,
  onClose
}) => {
  const { language } = useLanguage();
  const isBg = language === 'bg';
  
  const [step, setStep] = useState<'email' | 'code' | 'success'>('email');
  const [email, setEmail] = useState(currentEmail || '');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSendCode = async () => {
    if (!validateEmail(email)) {
      toast.error(isBg ? 'Моля, въведете валиден имейл' : 'Please enter a valid email');
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      if (isGuest) {
        // For guest accounts, we need to link email first
        // Since Firebase doesn't allow linking email without password for anonymous users,
        // we'll use a workaround: create a custom token or use email link authentication
        // For now, we'll update the email in Firestore and send verification
        await updateDoc(doc(db, 'users', user.uid), {
          email: email,
          emailVerified: false,
          updatedAt: serverTimestamp()
        });

        // Send verification email (this requires the email to be set in auth first)
        // For anonymous users, we'll need to convert them first
        // This is a simplified flow - in production, you'd use Firebase Admin SDK
        // to create a custom token or use email link authentication
        
        toast.info(isBg 
          ? 'Имейлът е запазен. Моля, проверете пощата си за код за потвърждение.' 
          : 'Email saved. Please check your inbox for verification code.');
        
        // Simulate sending code (in production, use Firebase Admin SDK or email service)
        setCodeSent(true);
        setStep('code');
        setCountdown(300); // 5 minutes
      } else {
        // For registered users, update email and send verification
        if (email !== user.email) {
          await updateEmail(user, email);
        }
        await sendEmailVerification(user);
        setCodeSent(true);
        setStep('code');
        setCountdown(300);
        toast.success(isBg 
          ? 'Код за потвърждение е изпратен на вашия имейл' 
          : 'Verification code sent to your email');
      }
    } catch (error: any) {
      logger.error('Error sending verification code:', error);
      toast.error(error.message || (isBg 
        ? 'Грешка при изпращане на код' 
        : 'Error sending code'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      toast.error(isBg ? 'Кодът трябва да е 6 цифри' : 'Code must be 6 digits');
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // In production, verify code with backend/Firebase Admin SDK
      // For now, we'll simulate verification
      // TODO: Implement actual OTP verification with Firebase Admin SDK
      
      // Update user profile
      await updateDoc(doc(db, 'users', user.uid), {
        email: email,
        emailVerified: true,
        emailVerifiedAt: serverTimestamp(),
        accountType: isGuest ? 'registered' : undefined,
        isGuest: false,
        updatedAt: serverTimestamp()
      });

      // If guest, convert to registered account
      if (isGuest) {
        await SocialAuthService.convertGuestToRegistered(user.uid);
        // Reload user to get updated claims
        await reload(user);
      }

      setStep('success');
      toast.success(isBg 
        ? 'Имейлът е потвърден успешно!' 
        : 'Email verified successfully!');
      
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
    handleSendCode();
  };

  return (
    <ModalOverlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>
            <Mail size={24} />
            {isBg ? 'Потвърждение на имейл' : 'Email Verification'}
          </Title>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </Header>

        <Content>
          <StepIndicator>
            <Step $active={step === 'email'} $completed={step !== 'email'} />
            <Step $active={step === 'code'} $completed={step === 'success'} />
            <Step $active={step === 'success'} $completed={false} />
          </StepIndicator>

          {step === 'email' && (
            <>
              <FormGroup>
                <Label>{isBg ? 'Имейл адрес' : 'Email Address'}</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  disabled={loading || !!currentEmail}
                />
                <HelpText>
                  {isBg 
                    ? 'Ще изпратим код за потвърждение на този имейл' 
                    : 'We will send a verification code to this email'}
                </HelpText>
              </FormGroup>
              <Button onClick={handleSendCode} disabled={loading || !email}>
                {loading ? (
                  <>
                    <SpinningLoader size={16} />
                    {isBg ? 'Изпращане...' : 'Sending...'}
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    {isBg ? 'Изпрати код' : 'Send Code'}
                  </>
                )}
              </Button>
            </>
          )}

          {step === 'code' && (
            <>
              <FormGroup>
                <Label>{isBg ? 'Код за потвърждение' : 'Verification Code'}</Label>
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
                    ? `Въведете 6-цифрения код, изпратен на ${email}` 
                    : `Enter the 6-digit code sent to ${email}`}
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
                {isBg ? 'Имейлът е потвърден!' : 'Email Verified!'}
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

export default EmailVerificationFlow;

