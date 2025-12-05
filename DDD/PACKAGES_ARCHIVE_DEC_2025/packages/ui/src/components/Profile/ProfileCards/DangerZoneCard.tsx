// Danger Zone Card Component
// Location: Bulgaria | Languages: BG/EN | Currency: EUR
// Account deletion section

import React, { useState } from 'react';
import styled from 'styled-components';
import { Trash2, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@globul-cars/core/contextsLanguageContext';

interface DangerZoneCardProps {
  email: string;
  registeredYear: number;
  accountType: string;
  onDeleteAccount: () => void;
}

const DangerZoneCard: React.FC<DangerZoneCardProps> = ({
  email,
  registeredYear,
  accountType,
  onDeleteAccount
}) => {
  const { language } = useLanguage();
  const [showConfirmation, setShowConfirmation] = useState(false);

  const getAccountTypeLabel = () => {
    const labels: Record<string, { bg: string; en: string }> = {
      private: { bg: 'Личен акаунт', en: 'Private account' },
      dealer: { bg: 'Търговски акаунт', en: 'Dealer account' },
      company: { bg: 'Фирмен акаунт', en: 'Company account' }
    };
    
    const label = labels[accountType] || labels.private;
    return language === 'bg' ? label.bg : label.en;
  };

  const handleDeleteClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirmDelete = () => {
    onDeleteAccount();
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  return (
    <Card>
      <SectionHeader>
        <Title>
          <Trash2 size={20} />
          {language === 'bg' ? 'Изтриване на акаунт' : 'Delete account'}
        </Title>
      </SectionHeader>

      <AccountInfo>
        <AccountEmail>{email}</AccountEmail>
        <AccountDetails>
          {getAccountTypeLabel()}, {language === 'bg' ? 'регистриран от' : 'registered since'} {registeredYear}
        </AccountDetails>
      </AccountInfo>

      {!showConfirmation ? (
        <>
          <DangerButton onClick={handleDeleteClick}>
            <Trash2 size={16} />
            {language === 'bg' ? 'Изтрий акаунта' : 'Delete account'}
          </DangerButton>

          <Warning>
            <AlertTriangle size={16} />
            <WarningText>
              {language === 'bg'
                ? 'Внимание: Това действие е необратимо!'
                : 'Warning: This action is irreversible!'}
            </WarningText>
          </Warning>
        </>
      ) : (
        <ConfirmationBox>
          <ConfirmationTitle>
            <AlertTriangle size={20} />
            {language === 'bg' ? 'Потвърдете изтриването' : 'Confirm deletion'}
          </ConfirmationTitle>
          <ConfirmationText>
            {language === 'bg'
              ? 'Сигурни ли сте, че искате да изтриете акаунта си? Всички данни, обяви и съобщения ще бъдат изтрити завинаги.'
              : 'Are you sure you want to delete your account? All data, listings, and messages will be permanently deleted.'}
          </ConfirmationText>
          <ButtonGroup>
            <CancelButton onClick={handleCancel}>
              {language === 'bg' ? 'Отказ' : 'Cancel'}
            </CancelButton>
            <ConfirmButton onClick={handleConfirmDelete}>
              <Trash2 size={16} />
              {language === 'bg' ? 'Да, изтрий акаунта' : 'Yes, delete account'}
            </ConfirmButton>
          </ButtonGroup>
        </ConfirmationBox>
      )}
    </Card>
  );
};

const Card = styled.div`
  background: white;
  border: 2px solid #dc3545;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.15);
  padding: 24px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    padding: 16px;
    border-radius: 8px;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    margin-bottom: 16px;
  }
`;

const Title = styled.h3`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.125rem;
  font-weight: 600;
  color: #dc3545;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1rem;
    
    svg {
      width: 18px;
      height: 18px;
    }
  }
`;

const AccountInfo = styled.div`
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    padding: 12px;
    margin-bottom: 16px;
  }
`;

const AccountEmail = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #721c24;
  margin-bottom: 4px;

  @media (max-width: 768px) {
    font-size: 0.9375rem;
  }
`;

const AccountDetails = styled.div`
  font-size: 0.875rem;
  color: #721c24;
  opacity: 0.8;

  @media (max-width: 768px) {
    font-size: 0.8125rem;
  }
`;

const DangerButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 16px;

  &:hover {
    background: #c82333;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    padding: 10px 20px;
    font-size: 0.875rem;
    width: 100%;
    justify-content: center;
  }
`;

const Warning = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: #856404;
  background: #fff3cd;
  border: 1px solid #ffeeba;
  border-radius: 8px;
  padding: 12px 16px;

  svg {
    flex-shrink: 0;
  }

  @media (max-width: 768px) {
    padding: 10px 12px;
    gap: 8px;
    
    svg {
      width: 14px;
      height: 14px;
    }
  }
`;

const WarningText = styled.span`
  font-size: 0.875rem;
  font-weight: 600;

  @media (max-width: 768px) {
    font-size: 0.8125rem;
  }
`;

const ConfirmationBox = styled.div`
  background: #fff3cd;
  border: 2px solid #ffc107;
  border-radius: 8px;
  padding: 20px;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const ConfirmationTitle = styled.h4`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1rem;
  font-weight: 600;
  color: #856404;
  margin: 0 0 12px 0;

  @media (max-width: 768px) {
    font-size: 0.9375rem;
  }
`;

const ConfirmationText = styled.p`
  font-size: 0.875rem;
  color: #856404;
  line-height: 1.6;
  margin: 0 0 20px 0;

  @media (max-width: 768px) {
    font-size: 0.8125rem;
    margin-bottom: 16px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;

  @media (max-width: 768px) {
    flex-direction: column-reverse;
    gap: 8px;
  }
`;

const CancelButton = styled.button`
  flex: 1;
  background: white;
  color: #495057;
  border: 1px solid #ced4da;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f8f9fa;
    border-color: #adb5bd;
  }

  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: 0.875rem;
  }
`;

const ConfirmButton = styled.button`
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #c82333;
  }

  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: 0.875rem;
  }
`;

export default DangerZoneCard;

