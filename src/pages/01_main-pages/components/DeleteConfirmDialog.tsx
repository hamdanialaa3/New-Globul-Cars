import React from 'react';
import styled from 'styled-components';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  language: 'bg' | 'en';
  sellerType: 'private' | 'dealer' | 'company';
  onConfirm: (isSold: boolean) => void;
  onCancel: () => void;
}

const DialogOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 1rem;
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const DialogContainer = styled.div`
  background: var(--surface-primary);
  border-radius: 16px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const DialogTitle = styled.h2`
  color: var(--error);
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DialogMessage = styled.p`
  color: var(--text-primary);
  font-size: 1rem;
  line-height: 1.6;
  margin: 0 0 1.5rem;
`;

const WarningBox = styled.div`
  background: rgba(255, 152, 0, 0.1);
  border: 2px solid rgba(255, 152, 0, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
`;

const WarningTitle = styled.div`
  color: #ff9800;
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const WarningText = styled.p`
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.5;
`;

const QuestionBox = styled.div`
  background: rgba(33, 150, 243, 0.1);
  border: 2px solid rgba(33, 150, 243, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
`;

const QuestionText = styled.p`
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  text-align: center;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const Button = styled.button<{ $variant?: 'danger' | 'success' | 'cancel' }>`
  flex: 1;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  ${({ $variant }) => {
    switch ($variant) {
      case 'danger':
        return `
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          &:hover {
            background: linear-gradient(135deg, #dc2626, #b91c1c);
            transform: translateY(-2px);
            box-shadow: 0 8px 16px rgba(239, 68, 68, 0.3);
          }
        `;
      case 'success':
        return `
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: white;
          &:hover {
            background: linear-gradient(135deg, #16a34a, #15803d);
            transform: translateY(-2px);
            box-shadow: 0 8px 16px rgba(34, 197, 94, 0.3);
          }
        `;
      case 'cancel':
      default:
        return `
          background: rgba(148, 163, 184, 0.2);
          color: var(--text-primary);
          border: 2px solid rgba(148, 163, 184, 0.3);
          &:hover {
            background: rgba(148, 163, 184, 0.3);
            border-color: rgba(148, 163, 184, 0.5);
          }
        `;
    }
  }}

  &:active {
    transform: translateY(0);
  }
`;

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  isOpen,
  language,
  sellerType,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const limitText = sellerType === 'private'
    ? (language === 'bg' ? '3 обяви' : '3 listings')
    : sellerType === 'dealer'
      ? (language === 'bg' ? '10 обяви' : '10 listings')
      : (language === 'bg' ? 'неограничен брой обяви' : 'unlimited listings');

  return (
    <DialogOverlay onClick={onCancel}>
      <DialogContainer onClick={(e) => e.stopPropagation()}>
        <DialogTitle>
          <span>⚠️</span>
          {language === 'bg' ? 'Изтриване на обява' : 'Delete Listing'}
        </DialogTitle>

        <DialogMessage>
          {language === 'bg'
            ? 'Вие сте на път да изтриете тази обява за кола.'
            : 'You are about to delete this car listing.'}
        </DialogMessage>

        <WarningBox>
          <WarningTitle>
            <span>📊</span>
            {language === 'bg' ? 'Важна информация' : 'Important Information'}
          </WarningTitle>
          <WarningText>
            {language === 'bg' ? (
              <>
                Тази обява ще бъде броена в месечния ви лимит от <strong>{limitText}</strong>.
                {sellerType === 'private' && ' Дори да я изтриете, тя се брои към вашия месечен лимит.'}
                {sellerType === 'dealer' && ' Дори да я изтриете, тя се брои към вашия месечен лимит.'}
              </>
            ) : (
              <>
                This listing will count towards your monthly limit of <strong>{limitText}</strong>.
                {sellerType === 'private' && ' Even if you delete it, it counts towards your monthly limit.'}
                {sellerType === 'dealer' && ' Even if you delete it, it counts towards your monthly limit.'}
              </>
            )}
          </WarningText>
        </WarningBox>

        <QuestionBox>
          <QuestionText>
            {language === 'bg'
              ? '🚗 Продадохте ли вече тази кола?'
              : '🚗 Have you already sold this car?'}
          </QuestionText>
        </QuestionBox>

        <ButtonContainer>
          <Button $variant="success" onClick={() => onConfirm(true)}>
            <span>✅</span>
            {language === 'bg' ? 'Да, продадена е' : 'Yes, it\'s sold'}
          </Button>
          <Button $variant="danger" onClick={() => onConfirm(false)}>
            <span>❌</span>
            {language === 'bg' ? 'Не, просто изтривам' : 'No, just deleting'}
          </Button>
        </ButtonContainer>

        <ButtonContainer style={{ marginTop: '1rem' }}>
          <Button $variant="cancel" onClick={onCancel}>
            {language === 'bg' ? 'Отказ' : 'Cancel'}
          </Button>
        </ButtonContainer>
      </DialogContainer>
    </DialogOverlay>
  );
};
