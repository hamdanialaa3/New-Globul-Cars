// Password Change Modal
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import React, { useState } from 'react';
import styled from 'styled-components';
import { X, Lock, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '../../../firebase/firebase-config';
import { toast } from 'react-toastify';

interface PasswordChangeModalProps {
  onClose: () => void;
}

const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({ onClose }) => {
  const { language } = useLanguage();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error(language === 'bg'
        ? 'Паролите не съвпадат'
        : 'Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error(language === 'bg'
        ? 'Паролата трябва да е поне 6 символа'
        : 'Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      const user = auth.currentUser;
      
      if (!user || !user.email) {
        throw new Error('User not authenticated');
      }

      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      toast.success(language === 'bg'
        ? 'Паролата е променена успешно'
        : 'Password changed successfully');
      onClose();
    } catch (error: any) {
      console.error('Error changing password:', error);
      
      if (error.code === 'auth/wrong-password') {
        toast.error(language === 'bg'
          ? 'Грешна текуща парола'
          : 'Wrong current password');
      } else {
        toast.error(language === 'bg'
          ? 'Грешка при промяна на паролата'
          : 'Error changing password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>
            <Lock size={24} />
            {language === 'bg' ? 'Промяна на паролата' : 'Change Password'}
          </Title>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </Header>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>{language === 'bg' ? 'Текуща парола' : 'Current Password'}</Label>
            <PasswordInput>
              <Input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="********"
              />
              <ToggleButton type="button" onClick={() => setShowCurrent(!showCurrent)}>
                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
              </ToggleButton>
            </PasswordInput>
          </FormGroup>

          <FormGroup>
            <Label>{language === 'bg' ? 'Нова парола' : 'New Password'}</Label>
            <PasswordInput>
              <Input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                placeholder="********"
              />
              <ToggleButton type="button" onClick={() => setShowNew(!showNew)}>
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </ToggleButton>
            </PasswordInput>
          </FormGroup>

          <FormGroup>
            <Label>{language === 'bg' ? 'Потвърди нова парола' : 'Confirm New Password'}</Label>
            <PasswordInput>
              <Input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                placeholder="********"
              />
              <ToggleButton type="button" onClick={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </ToggleButton>
            </PasswordInput>
          </FormGroup>

          <ButtonGroup>
            <CancelButton type="button" onClick={onClose}>
              {language === 'bg' ? 'Отказ' : 'Cancel'}
            </CancelButton>
            <SubmitButton type="submit" disabled={loading}>
              {loading 
                ? (language === 'bg' ? 'Запазване...' : 'Saving...')
                : (language === 'bg' ? 'Промени паролата' : 'Change Password')}
            </SubmitButton>
          </ButtonGroup>
        </Form>
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
  max-width: 500px;
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

const Form = styled.form`
  padding: 24px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;

  &:last-of-type {
    margin-bottom: 24px;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 8px;
`;

const PasswordInput = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 40px 12px 12px;
  border: 1px solid #ced4da;
  border-radius: 8px;
  font-size: 0.9375rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #FF7900;
    box-shadow: 0 0 0 3px rgba(255, 121, 0, 0.1);
  }
`;

const ToggleButton = styled.button`
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  color: #6c757d;
  padding: 4px;
  display: flex;

  &:hover {
    color: #495057;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;

  @media (max-width: 480px) {
    flex-direction: column-reverse;
  }
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 12px 24px;
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
  padding: 12px 24px;
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

export default PasswordChangeModal;

