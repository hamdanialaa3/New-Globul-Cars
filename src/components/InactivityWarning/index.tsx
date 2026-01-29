import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../contexts/LanguageContext';
import IndexedDBActivityTracker from '../../services/indexeddb-activity-tracker';

const WarningBanner = styled.div<{ $isDark: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: ${props => props.$isDark ? '#d97706' : '#f59e0b'};
  color: white;
  padding: 1rem;
  text-align: center;
  z-index: 10000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  animation: slideDown 0.3s ease-out;

  @keyframes slideDown {
    from {
      transform: translateY(-100%);
    }
    to {
      transform: translateY(0);
    }
  }
`;

const WarningContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const WarningText = styled.p`
  margin: 0;
  font-size: 0.95rem;
  font-weight: 500;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const Button = styled.button<{ $variant: 'primary' | 'secondary' }>`
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.$variant === 'primary' ? 'white' : 'transparent'};
  color: ${props => props.$variant === 'primary' ? '#d97706' : 'white'};
  border: ${props => props.$variant === 'secondary' ? '2px solid white' : 'none'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
`;

/**
 * IndexedDB Inactivity Warning Component
 * Shows warning before data deletion
 */
export const InactivityWarning: React.FC = () => {
  const { language } = useLanguage();
  const [showWarning, setShowWarning] = useState(false);
  const [status, setStatus] = useState(IndexedDBActivityTracker.getStatusDetails());

  useEffect(() => {
    // Check on mount
    const shouldShow = IndexedDBActivityTracker.shouldShowWarning();
    setShowWarning(shouldShow);

    // Check periodically (every hour)
    const interval = setInterval(() => {
      const newStatus = IndexedDBActivityTracker.getStatusDetails();
      setStatus(newStatus);
      setShowWarning(IndexedDBActivityTracker.shouldShowWarning());
    }, 60 * 60 * 1000); // 1 hour

    return () => clearInterval(interval);
  }, []);

  const handleExtend = () => {
    IndexedDBActivityTracker.extendSession();
    setShowWarning(false);
  };

  const handleDismiss = () => {
    setShowWarning(false);
  };

  if (!showWarning) return null;

  const daysRemaining = 7 - status.daysSinceActivity;
  const message = language === 'bg'
    ? `Вашите данни за автомобила ще бъдат изтрити след ${daysRemaining} дни поради неактивност.`
    : `Your car listing data will be deleted in ${daysRemaining} days due to inactivity.`;

  const keepButton = language === 'bg' ? 'Запази данните' : 'Keep My Data';
  const dismissButton = language === 'bg' ? 'Разбрах' : 'I Understand';

  return (
    <WarningBanner $isDark={false}>
      <WarningContent>
        <WarningText>{message}</WarningText>
        <ButtonGroup>
          <Button $variant="primary" onClick={handleExtend}>
            {keepButton}
          </Button>
          <Button $variant="secondary" onClick={handleDismiss}>
            {dismissButton}
          </Button>
        </ButtonGroup>
      </WarningContent>
    </WarningBanner>
  );
};

export default InactivityWarning;
