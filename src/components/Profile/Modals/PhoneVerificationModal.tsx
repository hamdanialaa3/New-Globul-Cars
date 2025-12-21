// Phone Verification Modal
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import React, { useState } from 'react';
import styled from 'styled-components';
import { X, Phone, Send } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { toast } from 'react-toastify';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase/firebase-config';

interface PhoneVerificationModalProps {
  phoneNumber?: string;
  onClose: () => void;
}

const PhoneVerificationModal: React.FC<PhoneVerificationModalProps> = ({ 
  phoneNumber, 
  onClose 
}) => {
  const { language } = useLanguage();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  const handleSendCode = async () => {
    if (!phoneNumber) {
      toast.error(language === 'bg'
        ? 'Няма телефонен номер'
        : 'No phone number');
      return;
    }

    try {
      setLoading(true);
      
      // Simulate sending SMS code
      // In production, integrate with SMS provider (Twilio, etc.)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCodeSent(true);
      toast.success(language === 'bg'
        ? 'Кодът е изпратен успешно'
        : 'Code sent successfully');
    } catch (error) {
      toast.error(language === 'bg'
        ? 'Грешка при изпращане'
        : 'Error sending code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (code.length !== 6) {
      toast.error(language === 'bg'
        ? 'Кодът трябва да е 6 цифри'
        : 'Code must be 6 digits');
      return;
    }

    try {
      setLoading(true);

      // Simulate verification
      // In production, verify with backend
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update phone verification status
      const user = auth.currentUser;
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          phoneVerified: true,
          phoneVerifiedAt: new Date()
        });
      }

      toast.success(language === 'bg'
        ? 'Телефонът е потвърден успешно'
        : 'Phone verified successfully');
      onClose();
    } catch (error) {
      toast.error(language === 'bg'
        ? 'Грешка при потвърждение'
        : 'Verification error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>
            <Phone size={24} />
            {language === 'bg' ? 'Потвърждение на телефон' : 'Phone Verification'}
          </Title>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </Header>

        <Content>
          <PhoneDisplay>{phoneNumber}</PhoneDisplay>

          {!codeSent ? (
            <>
              <Description>
                {language === 'bg'
                  ? 'Ще изпратим код за потвърждение на вашия телефон'
                  : 'We will send a verification code to your phone'}
              </Description>
              <SendButton onClick={handleSendCode} disabled={loading}>
                <Send size={16} />
                {loading
                  ? (language === 'bg' ? 'Изпращане...' : 'Sending...')
                  : (language === 'bg' ? 'Изпрати код' : 'Send Code')}
              </SendButton>
            </>
          ) : (
            <Form onSubmit={handleVerify}>
              <Label>{language === 'bg' ? 'Въведете кода' : 'Enter Code'}</Label>
              <CodeInput
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                required
              />
              <ButtonGroup>
                <CancelButton type="button" onClick={onClose}>
                  {language === 'bg' ? 'Отказ' : 'Cancel'}
                </CancelButton>
                <SubmitButton type="submit" disabled={loading}>
                  {loading
                    ? (language === 'bg' ? 'Проверка...' : 'Verifying...')
                    : (language === 'bg' ? 'Потвърди' : 'Verify')}
                </SubmitButton>
              </ButtonGroup>
            </Form>
          )}
        </Content>
      </Modal>
    </Overlay>
  );
};

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const Modal = styled.div`
  background: white;
  border-radius: 16px;
  max-width: 450px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid #e9ecef;
`;

const Title = styled.h2`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.25rem;
  font-weight: 600;
  color: #212529;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #6c757d;
  padding: 4px;
  display: flex;
  
  &:hover {
    color: #212529;
  }
`;

const Content = styled.div`
  padding: 24px;
`;

const PhoneDisplay = styled.div`
  text-align: center;
  font-size: 1.25rem;
  font-weight: 600;
  color: #212529;
  margin-bottom: 20px;
  font-family: 'Courier New', monospace;
`;

const Description = styled.p`
  text-align: center;
  font-size: 0.9375rem;
  color: #6c757d;
  margin-bottom: 24px;
  line-height: 1.5;
`;

const SendButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 24px;
  background: linear-gradient(135deg, #FF7900, #FF8F10);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 121, 0, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Form = styled.form``;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 8px;
  text-align: center;
`;

const CodeInput = styled.input`
  width: 100%;
  padding: 16px;
  border: 2px solid #ced4da;
  border-radius: 8px;
  font-size: 1.5rem;
  font-weight: 600;
  text-align: center;
  letter-spacing: 8px;
  font-family: 'Courier New', monospace;
  margin-bottom: 20px;

  &:focus {
    outline: none;
    border-color: #FF7900;
    box-shadow: 0 0 0 3px rgba(255, 121, 0, 0.1);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 12px;
  background: white;
  color: #495057;
  border: 1px solid #ced4da;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: #f8f9fa;
  }
`;

const SubmitButton = styled.button`
  flex: 1;
  padding: 12px;
  background: linear-gradient(135deg, #FF7900, #FF8F10);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 121, 0, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export default PhoneVerificationModal;

