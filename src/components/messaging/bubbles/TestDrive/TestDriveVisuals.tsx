import React from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';
import bg from 'date-fns/locale/bg';
import { FiCalendar, FiMapPin, FiFileText, FiClock } from 'react-icons/fi';
import { MessagingColors, Divider } from '../../messaging-styles';
import type { TestDriveRequest } from './TestDriveBubble';

interface TestDriveVisualsProps {
  request: TestDriveRequest;
  appointmentDate: Date;
  statusColor: string;
  statusText: string;
  locationTypeText: string;
  isReceiver: boolean;
  language: 'bg' | 'en';
  error: string | null;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Test Drive Visuals Component
 * مكون العرض البصري لطلب تجربة القيادة
 * 
 * Handles all visual display and styled components
 */
export const TestDriveVisuals: React.FC<TestDriveVisualsProps> = ({
  request,
  appointmentDate,
  statusColor,
  statusText,
  locationTypeText,
  isReceiver,
  language,
  error,
  className,
  children
}) => {
  return (
    <TestDriveCard $status={request.status} $statusColor={statusColor} className={className}>
      {/* Header */}
      <TestDriveHeader>
        <TestDriveTitle>
          <TestDriveIcon>
            <FiCalendar />
          </TestDriveIcon>
          {isReceiver 
            ? (language === 'bg' ? 'Заявка за тест драйв' : 'Test Drive Request')
            : (language === 'bg' ? 'Вашата заявка' : 'Your Request')
          }
        </TestDriveTitle>
        <StatusBadge $color={statusColor}>
          {statusText}
        </StatusBadge>
      </TestDriveHeader>

      <Divider />

      {/* Date & Time */}
      <InfoRow>
        <InfoIcon>
          <FiClock />
        </InfoIcon>
        <InfoContent>
          <InfoLabel>{language === 'bg' ? 'Дата и час' : 'Date & Time'}</InfoLabel>
          <InfoValue>
            {format(appointmentDate, 'EEEE, dd MMMM yyyy', { locale: bg })}
          </InfoValue>
          <InfoSubValue>
            {format(appointmentDate, 'HH:mm', { locale: bg })}
          </InfoSubValue>
        </InfoContent>
      </InfoRow>

      {/* Location */}
      <InfoRow>
        <InfoIcon>
          <FiMapPin />
        </InfoIcon>
        <InfoContent>
          <InfoLabel>{language === 'bg' ? 'Локация' : 'Location'}</InfoLabel>
          <InfoValue>{locationTypeText}</InfoValue>
          {request.location && (
            <InfoSubValue>{request.location}</InfoSubValue>
          )}
        </InfoContent>
      </InfoRow>

      {/* Notes */}
      {request.notes && (
        <>
          <Divider />
          <NotesContainer>
            <NotesIcon>
              <FiFileText />
            </NotesIcon>
            <NotesContent>
              <NotesLabel>{language === 'bg' ? 'Бележки' : 'Notes'}</NotesLabel>
              <NotesText>{request.notes}</NotesText>
            </NotesContent>
          </NotesContainer>
        </>
      )}

      {/* Error Message */}
      {error && (
        <ErrorMessage>
          {error}
        </ErrorMessage>
      )}

      {/* Actions or View Only Message */}
      {children}
    </TestDriveCard>
  );
};

// View Only Message Component
TestDriveVisuals.ViewOnlyMessage = ({ language }: { language: 'bg' | 'en' }) => (
  <ViewOnlyMessage>
    <InfoIcon>
      <FiFileText />
    </InfoIcon>
    {language === 'bg' 
      ? 'Това е вашата заявка. Изчакване на отговор.' 
      : 'This is your request. Waiting for response.'
    }
  </ViewOnlyMessage>
);

// Styled Components
const TestDriveCard = styled.div<{ $status: TestDriveRequest['status']; $statusColor: string }>`
  background: white;
  border: 2px solid ${props => props.$statusColor};
  border-radius: 16px;
  padding: 16px;
  max-width: 380px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.2s;
  
  &:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  }
  
  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const TestDriveHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
`;

const TestDriveTitle = styled.h4`
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #003366;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TestDriveIcon = styled.span`
  font-size: 18px;
  color: #3B82F6;
  display: flex;
  align-items: center;
`;

const StatusBadge = styled.span<{ $color: string }>`
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background-color: ${props => `${props.$color}20`};
  color: ${props => props.$color};
  white-space: nowrap;
`;

const InfoRow = styled.div`
  display: flex;
  gap: 12px;
  margin: 12px 0;
  align-items: flex-start;
`;

const InfoIcon = styled.span`
  font-size: 18px;
  color: #6B7280;
  flex-shrink: 0;
  margin-top: 2px;
  display: flex;
  align-items: center;
`;

const InfoContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const InfoLabel = styled.div`
  font-size: 10px;
  color: #9CA3AF;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InfoValue = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #003366;
  line-height: 1.4;
`;

const InfoSubValue = styled.div`
  font-size: 13px;
  color: #6B7280;
  margin-top: 2px;
`;

const NotesContainer = styled.div`
  display: flex;
  gap: 12px;
  padding: 12px;
  background-color: #F9FAFB;
  border-radius: 8px;
  margin: 12px 0;
`;

const NotesIcon = styled.span`
  font-size: 16px;
  color: #6B7280;
  flex-shrink: 0;
  margin-top: 2px;
  display: flex;
  align-items: center;
`;

const NotesContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const NotesLabel = styled.div`
  font-size: 10px;
  color: #9CA3AF;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const NotesText = styled.div`
  font-size: 13px;
  color: #4B5563;
  line-height: 1.5;
`;

const ErrorMessage = styled.div`
  padding: 10px 12px;
  background-color: #FEE2E2;
  border: 1px solid #FCA5A5;
  border-radius: 8px;
  color: #DC2626;
  font-size: 13px;
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ViewOnlyMessage = styled.div`
  padding: 12px;
  background-color: #EFF6FF;
  border: 1px solid #BFDBFE;
  border-radius: 8px;
  margin-top: 12px;
  font-size: 12px;
  color: #1E40AF;
  display: flex;
  align-items: center;
  gap: 8px;
`;


