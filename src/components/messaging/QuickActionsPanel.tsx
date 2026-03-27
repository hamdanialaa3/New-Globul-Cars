import React, { useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { MessagingColors, ButtonBase, CardBase, Divider, InputBase } from './messaging-styles';
import { messagingOrchestrator } from '@/services/messaging/core';
import { logger } from '@/services/logger-service';
import { useLanguage, useAuth } from '@/contexts';
import {
  ModernDollar,
  ModernCalendar,
  ModernMapPin,
  ModernWrench,
  ModernClose,
  ModernLightning,
  ModernSend
} from './icons/ModernIcons';

interface QuickActionsPanelProps {
  conversationId: string;
  carId: string;
  receiverId: string;
  onActionComplete?: (actionType: string) => void;
  className?: string;
}

/**
 * Quick Actions Panel
 * Quick actions panel for messaging
 * 
 * Allows:
 * - Send price offer
 * - Book inspection appointment
 * - Share location
 * - Request inspection report
 */
const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({
  conversationId,
  carId,
  receiverId,
  onActionComplete,
  className
}) => {
  const { t, language } = useLanguage();
  const theme = useTheme();
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // Offer state
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  // Appointment state
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [appointmentNote, setAppointmentNote] = useState('');

  // Send offer
  const handleSendOffer = async () => {
    const amount = parseFloat(offerAmount);
    if (!amount || amount <= 0) {
      logger.warn('Invalid offer amount', { offerAmount });
      return;
    }
    if (!currentUser?.uid) {
      logger.warn('User not authenticated');
      return;
    }
    setIsLoading(true);
    try {
      const offerId = await messagingOrchestrator.sendOffer({
        conversationId,
        senderId: currentUser.uid,
        receiverId,
        carId,
        offerAmount: amount,
        currency: 'EUR',
        message: offerMessage
      });
      logger.info('Offer sent successfully', { offerId });
      // Reset form
      setOfferAmount('');
      setOfferMessage('');
      setActiveAction(null);
      if (onActionComplete) {
        onActionComplete('offer');
      }
    } catch (error) {
      logger.error('Failed to send offer', error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  // إرسال طلب موعد - Send appointment request
  const handleSendAppointment = async () => {
    if (!appointmentDate || !appointmentTime) {
      logger.warn('Invalid appointment data');
      return;
    }
    if (!currentUser?.uid) {
      logger.warn('User not authenticated');
      return;
    }
    setIsLoading(true);
    try {
      const appointmentText = language === 'bg' 
        ? `📅 Заявка за среща за оглед\n\nДата: ${appointmentDate}\nВреме: ${appointmentTime}${appointmentNote ? `\n\nБележка: ${appointmentNote}` : ''}`
        : `📅 Viewing Appointment Request\n\nDate: ${appointmentDate}\nTime: ${appointmentTime}${appointmentNote ? `\n\nNote: ${appointmentNote}` : ''}`;
      await messagingOrchestrator.sendMessage({
        conversationId,
        senderId: currentUser.uid,
        receiverId,
        content: appointmentText,
        type: 'action',
        metadata: {
          actionType: 'appointment',
          date: appointmentDate,
          time: appointmentTime,
          note: appointmentNote
        }
      });
      logger.info('Appointment request sent');
      // Reset form
      setAppointmentDate('');
      setAppointmentTime('');
      setAppointmentNote('');
      setActiveAction(null);
      if (onActionComplete) {
        onActionComplete('appointment');
      }
    } catch (error) {
      logger.error('Failed to send appointment request', error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  // مشاركة الموقع - Share location
  const handleShareLocation = async () => {
    if (!currentUser?.uid) {
      logger.warn('User not authenticated');
      return;
    }
    setIsLoading(true);
    try {
      // Get user's location
      if (!navigator.geolocation) {
        logger.warn('Geolocation not supported');
        setIsLoading(false);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const locationText = `📍 My location\n\nhttps://www.google.com/maps?q=${latitude},${longitude}`;
          await messagingOrchestrator.sendMessage({
            conversationId,
            senderId: currentUser.uid,
            receiverId,
            content: locationText,
            type: 'action',
            metadata: {
              actionType: 'location',
              latitude,
              longitude
            }
          });
          logger.info('Location shared');
          setActiveAction(null);
          if (onActionComplete) {
            onActionComplete('location');
          }
          setIsLoading(false);
        },
        (error) => {
          logger.error('Failed to get location', error);
          setIsLoading(false);
        }
      );
    } catch (error) {
      logger.error('Failed to share location', error as Error);
      setIsLoading(false);
    }
  };

  // طلب تقرير فحص - Request inspection report
  const handleRequestInspection = async () => {
    if (!currentUser?.uid) {
      logger.warn('User not authenticated');
      return;
    }
    setIsLoading(true);
    try {
      const inspectionText = language === 'bg'
        ? `📋 Заявка за технически доклад\n\nМоже ли да ми предоставите технически доклад за автомобила?`
        : `📋 Inspection Report Request\n\nCan you provide me with a technical inspection report for the vehicle?`;
      await messagingOrchestrator.sendMessage({
        conversationId,
        senderId: currentUser.uid,
        receiverId,
        content: inspectionText,
        type: 'action',
        metadata: {
          actionType: 'inspection'
        }
      });
      logger.info('Inspection report requested');
      setActiveAction(null);
      if (onActionComplete) {
        onActionComplete('inspection');
      }
    } catch (error) {
      logger.error('Failed to request inspection', error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  // Render action form
  const renderActionForm = () => {
    switch (activeAction) {
      case 'offer':
        return (
          <ActionForm $theme={theme.mode}>
            <FormTitle $theme={theme.mode}>
              <ModernDollar size={20} color={theme.mode === 'dark' ? '#60a5fa' : '#3B82F6'} />
              {language === 'bg' ? 'Изпрати оферта' : 'Send Offer'}
            </FormTitle>
            <Divider />
            
            <FormGroup>
              <Label $theme={theme.mode}>
                {language === 'bg' ? 'Сума (EUR) *' : 'Amount (EUR) *'}
              </Label>
              <PriceInputRow>
                <StyledInput
                  type="number"
                  placeholder="25000"
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  disabled={isLoading}
                  min="0"
                  step="100"
                />
                <CurrencyBadge>EUR</CurrencyBadge>
              </PriceInputRow>
            </FormGroup>

            <FormGroup>
              <Label $theme={theme.mode}>
                {language === 'bg' ? 'Съобщение (по избор)' : 'Message (optional)'}
              </Label>
              <StyledTextarea
                $theme={theme.mode}
                placeholder={language === 'bg' ? 'Това е моята финална оферта...' : 'This is my final offer...'}
                value={offerMessage}
                onChange={(e) => setOfferMessage(e.target.value)}
                disabled={isLoading}
                rows={3}
              />
            </FormGroup>

            <ButtonRow>
              <ActionButton
                $variant="primary"
                $theme={theme.mode}
                onClick={handleSendOffer}
                disabled={isLoading || !offerAmount}
              >
                <ModernSend size={16} style={{ marginRight: '6px' }} />
                {language === 'bg' ? 'Изпрати' : 'Send'}
              </ActionButton>
              <ActionButton
                $variant="secondary"
                $theme={theme.mode}
                onClick={() => setActiveAction(null)}
                disabled={isLoading}
              >
                {language === 'bg' ? 'Откажи' : 'Cancel'}
              </ActionButton>
            </ButtonRow>
          </ActionForm>
        );

      case 'appointment':
        return (
          <ActionForm $theme={theme.mode}>
            <FormTitle $theme={theme.mode}>
              <ModernCalendar size={20} color={theme.mode === 'dark' ? '#60a5fa' : '#3B82F6'} />
              {language === 'bg' ? 'Запази среща за оглед' : 'Book Viewing Appointment'}
            </FormTitle>
            <Divider />
            
            <FormGroup>
              <Label $theme={theme.mode}>
                {language === 'bg' ? 'Дата *' : 'Date *'}
              </Label>
              <StyledInput
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                disabled={isLoading}
                min={new Date().toISOString().split('T')[0]}
              />
            </FormGroup>

            <FormGroup>
              <Label $theme={theme.mode}>
                {language === 'bg' ? 'Време *' : 'Time *'}
              </Label>
              <StyledInput
                type="time"
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                disabled={isLoading}
              />
            </FormGroup>

            <FormGroup>
              <Label $theme={theme.mode}>
                {language === 'bg' ? 'Бележка (по избор)' : 'Note (optional)'}
              </Label>
              <StyledTextarea
                $theme={theme.mode}
                placeholder={language === 'bg' ? 'Допълнителни бележки...' : 'Additional notes...'}
                value={appointmentNote}
                onChange={(e) => setAppointmentNote(e.target.value)}
                disabled={isLoading}
                rows={2}
              />
            </FormGroup>

            <ButtonRow>
              <ActionButton
                $variant="primary"
                $theme={theme.mode}
                onClick={handleSendAppointment}
                disabled={isLoading || !appointmentDate || !appointmentTime}
              >
                <ModernSend size={16} style={{ marginRight: '6px' }} />
                {language === 'bg' ? 'Изпрати заявка' : 'Send Request'}
              </ActionButton>
              <ActionButton
                $variant="secondary"
                $theme={theme.mode}
                onClick={() => setActiveAction(null)}
                disabled={isLoading}
              >
                {language === 'bg' ? 'Откажи' : 'Cancel'}
              </ActionButton>
            </ButtonRow>
          </ActionForm>
        );

      default:
        return null;
    }
  };

  return (
    <Container className={className}>
      {!activeAction ? (
        <>
          <ToggleButton onClick={() => setIsOpen(!isOpen)}>
            <ButtonIcon>
              {isOpen ? <ModernClose size={18} /> : <ModernLightning size={18} />}
            </ButtonIcon>
            <ButtonText>
              {language === 'bg' ? 'Бързи действия' : 'Quick Actions'}
            </ButtonText>
          </ToggleButton>

          {isOpen && (
            <ActionsGrid>
              <ActionCard $theme={theme.mode} onClick={() => setActiveAction('offer')}>
                <ActionIcon>
                  <ModernDollar size={32} color={theme.mode === 'dark' ? '#60a5fa' : '#3B82F6'} />
                </ActionIcon>
                <ActionTitle $theme={theme.mode}>
                  {language === 'bg' ? 'Изпрати оферта' : 'Send Offer'}
                </ActionTitle>
                <ActionDesc $theme={theme.mode}>
                  {language === 'bg' ? 'Предложи официална цена' : 'Make an official price offer'}
                </ActionDesc>
              </ActionCard>

              <ActionCard $theme={theme.mode} onClick={() => setActiveAction('appointment')}>
                <ActionIcon>
                  <ModernCalendar size={32} color={theme.mode === 'dark' ? '#60a5fa' : '#3B82F6'} />
                </ActionIcon>
                <ActionTitle $theme={theme.mode}>
                  {language === 'bg' ? 'Запази среща' : 'Book Appointment'}
                </ActionTitle>
                <ActionDesc $theme={theme.mode}>
                  {language === 'bg' ? 'Заяви час за оглед' : 'Request viewing time'}
                </ActionDesc>
              </ActionCard>

              <ActionCard $theme={theme.mode} onClick={handleShareLocation}>
                <ActionIcon>
                  <ModernMapPin size={32} color={theme.mode === 'dark' ? '#60a5fa' : '#3B82F6'} />
                </ActionIcon>
                <ActionTitle $theme={theme.mode}>
                  {language === 'bg' ? 'Сподели местоположение' : 'Share Location'}
                </ActionTitle>
                <ActionDesc $theme={theme.mode}>
                  {language === 'bg' ? 'Изпрати текущата си локация' : 'Send your current location'}
                </ActionDesc>
              </ActionCard>

              <ActionCard $theme={theme.mode} onClick={handleRequestInspection}>
                <ActionIcon>
                  <ModernWrench size={32} color={theme.mode === 'dark' ? '#60a5fa' : '#3B82F6'} />
                </ActionIcon>
                <ActionTitle $theme={theme.mode}>
                  {language === 'bg' ? 'Поискай доклад' : 'Request Report'}
                </ActionTitle>
                <ActionDesc $theme={theme.mode}>
                  {language === 'bg' ? 'Поискай технически доклад' : 'Request technical report'}
                </ActionDesc>
              </ActionCard>
            </ActionsGrid>
          )}
        </>
      ) : (
        renderActionForm()
      )}
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  position: relative;
  width: 100%;
`;

const ToggleButton = styled.button`
  width: 100%;
  padding: 12px 16px;
  background: linear-gradient(135deg, #3B82F6 0%, #6366F1 100%);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ButtonIcon = styled.span`
  font-size: 18px;
`;

const ButtonText = styled.span`
  flex: 1;
`;

const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 12px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ActionCard = styled(CardBase)<{ $theme?: string }>`
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  padding: 20px 16px;
  background: ${({ $theme }) => $theme === 'dark' ? '#1e293b' : 'white'};
  border-color: ${({ $theme }) => $theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#e5e7eb'};

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ $theme }) => $theme === 'dark' 
      ? '0 4px 16px rgba(96,165,250,0.2)' 
      : '0 4px 16px rgba(0, 0, 0, 0.15)'};
    border: 2px solid ${({ $theme }) => $theme === 'dark' ? '#60a5fa' : MessagingColors.senderBg};
  }

  &:active {
    transform: translateY(-2px);
  }
`;

const ActionIcon = styled.div`
  font-size: 32px;
  margin-bottom: 8px;
`;

const ActionTitle = styled.div<{ $theme?: string }>`
  font-weight: 600;
  font-size: 14px;
  color: ${({ $theme }) => $theme === 'dark' ? '#e2e8f0' : '#003366'};
  margin-bottom: 4px;
`;

const ActionDesc = styled.div<{ $theme?: string }>`
  font-size: 12px;
  color: ${({ $theme }) => $theme === 'dark' ? '#94a3b8' : '#6B7280'};
`;

const ActionForm = styled(CardBase)<{ $theme?: string }>`
  margin-top: 12px;
  padding: 20px;
  background: ${({ $theme }) => $theme === 'dark' ? '#1e293b' : 'white'};
  border-color: ${({ $theme }) => $theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#e5e7eb'};
`;

const FormTitle = styled.h3<{ $theme?: string }>`
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: ${({ $theme }) => $theme === 'dark' ? '#e2e8f0' : '#003366'};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label<{ $theme?: string }>`
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: ${({ $theme }) => $theme === 'dark' ? '#cbd5e1' : '#374151'};
  margin-bottom: 6px;
`;

const StyledInput = styled(InputBase)``;

const PriceInputRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const CurrencyBadge = styled.span`
  padding: 10px 16px;
  background-color: #F3F4F6;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  color: #6B7280;
`;

const StyledTextarea = styled.textarea<{ $theme?: string }>`
  width: 100%;
  padding: 10px 14px;
  background: ${({ $theme }) => $theme === 'dark' ? '#0f172a' : 'white'};
  color: ${({ $theme }) => $theme === 'dark' ? '#e2e8f0' : '#1f2937'};
  border: 1px solid ${({ $theme }) => $theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#D1D5DB'};
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${({ $theme }) => $theme === 'dark' ? '#60a5fa' : '#3B82F6'};
    box-shadow: 0 0 0 3px ${({ $theme }) => $theme === 'dark' ? 'rgba(96,165,250,0.1)' : 'rgba(139, 92, 246, 0.1)'};
  }

  &::placeholder {
    color: ${({ $theme }) => $theme === 'dark' ? '#64748b' : '#9CA3AF'};
  }

  &:disabled {
    background-color: ${({ $theme }) => $theme === 'dark' ? '#1e293b' : '#F3F4F6'};
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const ButtonRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 12px;
  margin-top: 20px;
`;

const ActionButton = styled(ButtonBase)<{ $theme?: string }>`
  padding: 12px 20px;
  ${({ $variant, $theme }) => $variant === 'secondary' && $theme === 'dark' && `
    background: rgba(255,255,255,0.1);
    color: #e2e8f0;
    &:hover {
      background: rgba(255,255,255,0.15);
    }
  `}
`;

// Named export for barrel export
export { QuickActionsPanel };

// Default export for backward compatibility
export default QuickActionsPanel;


