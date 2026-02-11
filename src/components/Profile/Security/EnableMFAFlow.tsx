import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { Shield, Send, CheckCircle, X, Loader2, Lock } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { auth } from '../../../firebase/firebase-config';
import { twoFactorAuthService } from '../../../services/security/two-factor-auth.service';
import { toast } from 'react-toastify';

interface EnableMFAFlowProps {
    currentPhone?: string;
    onSuccess: () => void;
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
    border-color: #667eea;
    background: rgba(255, 255, 255, 0.12);
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
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

const Button = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
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

const EnableMFAFlow: React.FC<EnableMFAFlowProps> = ({
    currentPhone,
    onSuccess,
    onClose
}) => {
    const { language } = useLanguage();
    const isBg = language === 'bg';

    const [step, setStep] = useState<'phone' | 'code' | 'success'>('phone');
    const [phone, setPhone] = useState(currentPhone?.replace('+359', '') || '');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [verificationId, setVerificationId] = useState<string | null>(null);

    // Initialize reCAPTCHA
    useEffect(() => {
        twoFactorAuthService.initializeRecaptcha('mfa-recaptcha-container');
        return () => {
            twoFactorAuthService.cleanup();
        };
    }, []);

    const handleSendCode = async () => {
        if (!phone || phone.length < 9) {
            toast.error(isBg ? 'Моля, въведете валиден телефонен номер' : 'Please enter a valid phone number');
            return;
        }

        setLoading(true);
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('No user');

            const result = await twoFactorAuthService.startEnrollment(user, phone);

            if (result.success && result.verificationId) {
                setVerificationId(result.verificationId);
                setStep('code');
                toast.success(isBg ? 'Кодът е изпратен' : 'Code sent');
            } else {
                toast.error(result.message);
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        if (code.length !== 6) return;

        setLoading(true);
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('No user');

            const result = await twoFactorAuthService.finishEnrollment(user, code);

            if (result.success) {
                setStep('success');
                setTimeout(() => {
                    onSuccess();
                    onClose();
                }, 2000);
            } else {
                toast.error(result.message);
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalOverlay onClick={onClose}>
            <Modal onClick={(e) => e.stopPropagation()}>
                <Header>
                    <Title>
                        <Shield size={24} />
                        {isBg ? 'Активиране на 2FA' : 'Enable 2FA'}
                    </Title>
                    <CloseButton onClick={onClose}>
                        <X size={20} />
                    </CloseButton>
                </Header>

                <Content>
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
                                        disabled={loading}
                                    />
                                </PhoneInputWrapper>
                                <HelpText>
                                    {isBg
                                        ? 'За сигурност, ще изпратим SMS код за потвърждение.'
                                        : 'For security, we will send an SMS verification code.'}
                                </HelpText>
                            </FormGroup>
                            <RecaptchaContainer id="mfa-recaptcha-container" />
                            <Button onClick={handleSendCode} disabled={loading || !phone}>
                                {loading ? (
                                    <SpinningLoader size={16} />
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
                                <Label>{isBg ? 'SMS код' : 'SMS Code'}</Label>
                                <CodeInput
                                    type="text"
                                    maxLength={6}
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                                    placeholder="000000"
                                    disabled={loading}
                                />
                            </FormGroup>
                            <Button onClick={handleVerifyCode} disabled={loading || code.length !== 6}>
                                {loading ? (
                                    <SpinningLoader size={16} />
                                ) : (
                                    <>
                                        <CheckCircle size={16} />
                                        {isBg ? 'Потвърди' : 'Verify'}
                                    </>
                                )}
                            </Button>
                        </>
                    )}

                    {step === 'success' && (
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <CheckCircle size={48} color="#22C55E" style={{ marginBottom: 16 }} />
                            <h3>{isBg ? '2FA активирана!' : '2FA Enabled!'}</h3>
                        </div>
                    )}
                </Content>
            </Modal>
        </ModalOverlay>
    );
};

export default EnableMFAFlow;
