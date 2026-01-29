import React, { useState } from 'react';
import styled from 'styled-components';
import { FiCheck, FiX, FiRefreshCw } from 'react-icons/fi';
import { ButtonBase, Divider, Spinner, InputBase } from '../../messaging-styles';

interface TestDriveActionsProps {
  isLoading: boolean;
  showReschedule: boolean;
  onConfirm: () => Promise<void>;
  onReject: () => Promise<void>;
  onReschedule: (newDate: number) => Promise<void>;
  onToggleReschedule: () => void;
  language: 'bg' | 'en';
}

/**
 * Test Drive Actions Component
 * مكون أزرار الإجراءات لطلب تجربة القيادة
 * 
 * Handles all action buttons and reschedule functionality
 */
export const TestDriveActions: React.FC<TestDriveActionsProps> = ({
  isLoading,
  showReschedule,
  onConfirm,
  onReject,
  onReschedule,
  onToggleReschedule,
  language
}) => {
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');

  // Handle reschedule submission
  const handleRescheduleSubmit = async () => {
    if (!rescheduleDate || !rescheduleTime) {
      return;
    }

    // Combine date and time into timestamp
    const dateTimeString = `${rescheduleDate}T${rescheduleTime}`;
    const newDate = new Date(dateTimeString).getTime();

    if (isNaN(newDate) || newDate <= Date.now()) {
      return;
    }

    await onReschedule(newDate);
    setRescheduleDate('');
    setRescheduleTime('');
  };

  // Get today's date in YYYY-MM-DD format for min date
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get current time in HH:MM format
  const getCurrentTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  if (showReschedule) {
    return (
      <>
        <Divider />
        <RescheduleContainer>
          <RescheduleLabel>
            {language === 'bg' ? 'Пренареждане на среща' : 'Reschedule Appointment'}
          </RescheduleLabel>
          
          <RescheduleRow>
            <RescheduleInput
              type="date"
              value={rescheduleDate}
              onChange={(e) => setRescheduleDate(e.target.value)}
              min={getTodayDate()}
              disabled={isLoading}
            />
            <RescheduleInput
              type="time"
              value={rescheduleTime}
              onChange={(e) => setRescheduleTime(e.target.value)}
              disabled={isLoading}
            />
          </RescheduleRow>

          <RescheduleActionsRow>
            <ActionButton 
              $variant="primary" 
              onClick={handleRescheduleSubmit}
              disabled={isLoading || !rescheduleDate || !rescheduleTime}
            >
              {isLoading ? <Spinner /> : <FiRefreshCw />} 
              {language === 'bg' ? 'Пренареди' : 'Reschedule'}
            </ActionButton>
            
            <ActionButton 
              $variant="secondary" 
              onClick={() => {
                onToggleReschedule();
                setRescheduleDate('');
                setRescheduleTime('');
              }}
              disabled={isLoading}
            >
              {language === 'bg' ? 'Отказ' : 'Cancel'}
            </ActionButton>
          </RescheduleActionsRow>
        </RescheduleContainer>
      </>
    );
  }

  return (
    <>
      <Divider />
      <ActionsContainer>
        <ActionsRow>
          <ActionButton 
            $variant="primary" 
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? <Spinner /> : <FiCheck />} 
            {language === 'bg' ? 'Потвърди' : 'Confirm'}
          </ActionButton>
          
          <ActionButton 
            $variant="secondary" 
            onClick={onToggleReschedule}
            disabled={isLoading}
          >
            <FiRefreshCw /> 
            {language === 'bg' ? 'Пренареди' : 'Reschedule'}
          </ActionButton>
          
          <ActionButton 
            $variant="danger" 
            onClick={onReject}
            disabled={isLoading}
          >
            {isLoading ? <Spinner /> : <FiX />} 
            {language === 'bg' ? 'Откажи' : 'Reject'}
          </ActionButton>
        </ActionsRow>
      </ActionsContainer>
    </>
  );
};

// Styled Components
const ActionsContainer = styled.div`
  margin-top: 12px;
`;

const ActionsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const ActionButton = styled(ButtonBase)`
  font-size: 13px;
  padding: 10px 12px;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
`;

const RescheduleContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;
`;

const RescheduleLabel = styled.label`
  font-size: 13px;
  font-weight: 500;
  color: #374151;
`;

const RescheduleRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const RescheduleInput = styled(InputBase)`
  font-size: 14px;
`;

const RescheduleActionsRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 8px;
`;

