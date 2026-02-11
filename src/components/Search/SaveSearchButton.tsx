/**
 * SaveSearchButton Component
 * Button to save current search criteria for future alerts
 */

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '@/contexts/AuthProvider';
import { useLanguage } from '@/contexts';
import { savedSearchesAlertsService, SearchCriteria } from '@/services/search/saved-searches-alerts.service';
import { logger } from '@/services/logger-service';

// ====================================
// Animations
// ====================================

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

// ====================================
// Styled Components
// ====================================

const Button = styled.button<{ $variant: 'primary' | 'secondary' | 'icon' }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: ${props => props.$variant === 'icon' ? '10px' : '10px 20px'};
  font-size: ${props => props.$variant === 'icon' ? '1.25rem' : '0.9375rem'};
  font-weight: 600;
  border: none;
  border-radius: ${props => props.$variant === 'icon' ? '50%' : '8px'};
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => {
    if (props.$variant === 'primary') return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    if (props.$variant === 'secondary') return 'transparent';
    return '#f3f4f6';
  }};
  color: ${props => props.$variant === 'secondary' ? '#667eea' : '#fff'};
  border: ${props => props.$variant === 'secondary' ? '2px solid #667eea' : 'none'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    ${props => props.$variant === 'primary' && `
      background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
    `}
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const Modal = styled.div`
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
  animation: ${fadeIn} 0.3s ease;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: ${fadeIn} 0.3s ease;
`;

const ModalHeader = styled.div`
  margin-bottom: 24px;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 8px 0;
`;

const ModalSubtitle = styled.p`
  font-size: 0.9375rem;
  color: #718096;
  margin: 0;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 0.9375rem;
  color: #4a5568;

  input[type="checkbox"] {
    width: 20px;
    height: 20px;
    cursor: pointer;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 12px 24px;
  background: #e2e8f0;
  color: #4a5568;
  border: none;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: #cbd5e0;
  }
`;

const SaveButton = styled.button`
  flex: 1;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const SearchPreview = styled.div`
  background: #f7fafc;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  font-size: 0.875rem;
  color: #4a5568;
  line-height: 1.6;
`;

const SuccessMessage = styled.div`
  background: #10b981;
  color: white;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  animation: ${pulse} 0.5s ease;
  
  svg {
    width: 24px;
    height: 24px;
  }
`;

// ====================================
// Component Props
// ====================================

interface SaveSearchButtonProps {
  searchCriteria: SearchCriteria;
  variant?: 'primary' | 'secondary' | 'icon';
  disabled?: boolean;
}

// ====================================
// Component
// ====================================

const SaveSearchButton: React.FC<SaveSearchButtonProps> = ({
  searchCriteria,
  variant = 'secondary',
  disabled = false
}) => {
  const { currentUser } = useAuth();
  const { language } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [emailNotification, setEmailNotification] = useState(true);
  const [pushNotification, setPushNotification] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleClick = () => {
    if (!currentUser) {
      toast.info(language === 'bg' ? 'Моля, влезте в профила си' : 'Please login to save searches');
      return;
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!currentUser || !searchName.trim()) {
      return;
    }

    try {
      setIsSaving(true);

      await savedSearchesAlertsService.saveSearch(
        currentUser.uid,
        searchName,
        searchCriteria,
        enableNotifications,
        emailNotification,
        pushNotification
      );

      setSuccess(true);
      setTimeout(() => {
        setShowModal(false);
        setSuccess(false);
        setSearchName('');
      }, 2000);

      logger.info('Search saved successfully', { userId: currentUser.uid, searchName });
    } catch (error) {
      logger.error('Failed to save search', error as Error);
      toast.error(language === 'bg' ? 'Грешка при запазване' : 'Failed to save search');
    } finally {
      setIsSaving(false);
    }
  };

  const getSearchPreview = (): string => {
    return savedSearchesAlertsService.formatSearchCriteria(searchCriteria, language);
  };

  return (
    <>
      <Button
        $variant={variant}
        onClick={handleClick}
        disabled={disabled}
        title={language === 'bg' ? 'Запази търсенето' : 'Save search'}
      >
        {variant !== 'icon' && (
          language === 'bg' ? '💾 Запази търсене' : '💾 Save Search'
        )}
        {variant === 'icon' && '💾'}
      </Button>

      {showModal && (
        <Modal onClick={() => !success && setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {language === 'bg' ? '💾 Запази търсене' : '💾 Save Search'}
              </ModalTitle>
              <ModalSubtitle>
                {language === 'bg' 
                  ? 'Получавайте известия за нови автомобили' 
                  : 'Get notified when matching cars appear'}
              </ModalSubtitle>
            </ModalHeader>

            {success ? (
              <SuccessMessage>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 13l4 4L19 7" />
                </svg>
                <span>
                  {language === 'bg' ? 'Търсенето е запазено!' : 'Search saved successfully!'}
                </span>
              </SuccessMessage>
            ) : (
              <>
                <SearchPreview>
                  <strong>{language === 'bg' ? 'Критерии:' : 'Criteria:'}</strong>
                  <br />
                  {getSearchPreview()}
                </SearchPreview>

                <FormGroup>
                  <Label>
                    {language === 'bg' ? 'Име на търсенето' : 'Search Name'}
                  </Label>
                  <Input
                    type="text"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    placeholder={language === 'bg' ? 'Например: "BMW 3 Series в София"' : 'e.g. "BMW 3 Series in Sofia"'}
                    autoFocus
                  />
                </FormGroup>

                <CheckboxGroup>
                  <CheckboxLabel>
                    <input
                      type="checkbox"
                      checked={enableNotifications}
                      onChange={(e) => setEnableNotifications(e.target.checked)}
                    />
                    <span>
                      {language === 'bg' ? '🔔 Активирай известия' : '🔔 Enable notifications'}
                    </span>
                  </CheckboxLabel>

                  {enableNotifications && (
                    <>
                      <CheckboxLabel>
                        <input
                          type="checkbox"
                          checked={emailNotification}
                          onChange={(e) => setEmailNotification(e.target.checked)}
                        />
                        <span>
                          {language === 'bg' ? '📧 Имейл известия' : '📧 Email notifications'}
                        </span>
                      </CheckboxLabel>

                      <CheckboxLabel>
                        <input
                          type="checkbox"
                          checked={pushNotification}
                          onChange={(e) => setPushNotification(e.target.checked)}
                        />
                        <span>
                          {language === 'bg' ? '📱 Push известия' : '📱 Push notifications'}
                        </span>
                      </CheckboxLabel>
                    </>
                  )}
                </CheckboxGroup>

                <ButtonGroup>
                  <CancelButton onClick={() => setShowModal(false)}>
                    {language === 'bg' ? 'Отказ' : 'Cancel'}
                  </CancelButton>
                  <SaveButton onClick={handleSave} disabled={isSaving || !searchName.trim()}>
                    {isSaving 
                      ? (language === 'bg' ? 'Запазване...' : 'Saving...') 
                      : (language === 'bg' ? 'Запази' : 'Save')}
                  </SaveButton>
                </ButtonGroup>
              </>
            )}
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default SaveSearchButton;
