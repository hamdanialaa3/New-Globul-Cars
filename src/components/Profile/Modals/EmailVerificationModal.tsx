import { logger } from '../../../services/logger-service';
// Email Verification Modal
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import React, { useState } from 'react';
import styled from 'styled-components';
import { X, Mail, Send } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '../../../firebase/firebase-config';
import { toast } from 'react-toastify';

interface EmailVerificationModalProps {
  onClose: () => void;
}

const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({ onClose }) => {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSendVerification = async () => {
    try {
      setLoading(true);
      
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      await sendEmailVerification(user);
      
      setSent(true);
      toast.success(language === 'bg'
        ? 'Имейлът за потвърждение е изпратен'
        : 'Verification email sent');
    } catch (error) {
      logger.error('Error sending verification:', error);
      toast.error(language === 'bg'
        ? 'Грешка при изпращане'
        : 'Error sending email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>
            <Mail size={24} />
            {language === 'bg' ? 'Потвърждение на имейл' : 'Email Verification'}
          </Title>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </Header>

        <Content>
          {!sent ? (
            <>
              <Description>
                {language === 'bg'
                  ? 'Ще изпратим имейл за потвърждение на вашия адрес. Моля проверете входящата си поща.'
                  : 'We will send a verification email to your address. Please check your inbox.'}
              </Description>
              <SendButton onClick={handleSendVerification} disabled={loading}>
                <Send size={16} />
                {loading
                  ? (language === 'bg' ? 'Изпращане...' : 'Sending...')
                  : (language === 'bg' ? 'Изпрати имейл' : 'Send Email')}
              </SendButton>
            </>
          ) : (
            <>
              <SuccessMessage>
                <SuccessIcon>
                  <Mail size={48} />
                </SuccessIcon>
                <SuccessText>
                  {language === 'bg'
                    ? 'Имейлът е изпратен успешно!'
                    : 'Email sent successfully!'}
                </SuccessText>
                <SuccessDescription>
                  {language === 'bg'
                    ? 'Моля проверете входящата си поща и кликнете върху линка за потвърждение.'
                    : 'Please check your inbox and click the verification link.'}
                </SuccessDescription>
              </SuccessMessage>
              <CloseBtn onClick={onClose}>
                {language === 'bg' ? 'Затвори' : 'Close'}
              </CloseBtn>
            </>
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

const Description = styled.p`
  text-align: center;
  font-size: 0.9375rem;
  color: #6c757d;
  margin-bottom: 24px;
  line-height: 1.6;
`;

const SendButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 24px;
  background: linear-gradient(135deg, #2563EB, #3B82F6);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SuccessMessage = styled.div`
  text-align: center;
`;

const SuccessIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  color: #28a745;
`;

const SuccessText = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #28a745;
  margin: 0 0 12px 0;
`;

const SuccessDescription = styled.p`
  font-size: 0.9375rem;
  color: #6c757d;
  line-height: 1.6;
  margin-bottom: 24px;
`;

const CloseBtn = styled.button`
  width: 100%;
  padding: 12px 24px;
  background: #f8f9fa;
  color: #495057;
  border: 1px solid #ced4da;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: #e9ecef;
  }
`;

export default EmailVerificationModal;



