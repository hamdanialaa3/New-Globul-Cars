import React, { useState } from 'react';
import styled from 'styled-components';
import { X } from 'lucide-react';
import { useLanguage } from '@globul-cars/core/contexts/LanguageContext';
import { useProfile } from '@globul-cars/profile/hooks/useProfile';
import { toast } from 'react-toastify';

interface NameEditModalProps {
  onClose: () => void;
}

const NameEditModal: React.FC<NameEditModalProps> = ({ onClose }) => {
  const { language } = useLanguage();
  const { user, updateProfile } = useProfile();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [loading, setLoading] = useState(false);

  const getText = () => {
    if (language === 'bg') {
      return {
        title: 'Редактиране на името',
        firstName: 'Име',
        lastName: 'Фамилия',
        cancel: 'Отказ',
        save: 'Запази',
        success: 'Името е актуализирано успешно!',
        error: 'Грешка при актуализиране на името'
      };
    } else {
      return {
        title: 'Edit Name',
        firstName: 'First Name',
        lastName: 'Last Name',
        cancel: 'Cancel',
        save: 'Save',
        success: 'Name updated successfully!',
        error: 'Error updating name'
      };
    }
  };

  const text = getText();

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error(language === 'bg' ? 'Моля, попълнете всички полета' : 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        displayName: `${firstName.trim()} ${lastName.trim()}`
      });
      toast.success(text.success);
      onClose();
    } catch (error) {
      console.error('Error updating name:', error);
      toast.error(text.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{text.title}</ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={24} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <InputGroup>
            <Label>{text.firstName}</Label>
            <Input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder={text.firstName}
            />
          </InputGroup>

          <InputGroup>
            <Label>{text.lastName}</Label>
            <Input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder={text.lastName}
            />
          </InputGroup>
        </ModalBody>

        <ModalFooter>
          <CancelButton onClick={onClose}>{text.cancel}</CancelButton>
          <SaveButton onClick={handleSave} disabled={loading}>
            {loading ? (language === 'bg' ? 'Зареждане...' : 'Loading...') : text.save}
          </SaveButton>
        </ModalFooter>
      </ModalContainer>
    </Overlay>
  );
};

export default NameEditModal;

// Styled Components
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
  z-index: 10000;
  padding: 20px;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid #e8e8e8;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  transition: color 0.2s ease;

  &:hover {
    color: #1a1a1a;
  }
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const InputGroup = styled.div`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e8e8e8;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #FF8F10;
  }

  &::placeholder {
    color: #999;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #e8e8e8;
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 12px 24px;
  background: #f5f5f5;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e8e8e8;
  }
`;

const SaveButton = styled.button`
  flex: 1;
  padding: 12px 24px;
  background: #FF8F10;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #e67e00;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
