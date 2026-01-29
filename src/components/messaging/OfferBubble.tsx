import React, { useState } from 'react';
import styled from 'styled-components';
import { format, differenceInHours, differenceInDays } from 'date-fns';
import bg from 'date-fns/locale/bg';
import { MessagingColors, ButtonBase, Divider, Spinner } from './messaging-styles';
import { logger } from '@/services/logger-service';
import { useLanguage } from '@/contexts';

/**
 * نوع العرض - Offer type
 * @interface Offer
 */
export interface Offer {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  carId: string;
  offerAmount: number;
  currency: string;
  status: 'pending' | 'accepted' | 'rejected' | 'countered' | 'expired';
  message?: string;
  counterAmount?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  expiresAt: Date | string;
}

interface OfferBubbleProps {
  offer: Offer;
  canRespond: boolean;
  isReceiver?: boolean;
  onAccept?: () => Promise<void>;
  onReject?: () => Promise<void>;
  onCounter?: (amount: number) => Promise<void>;
  className?: string;
}

/**
 * مكون عرض السعر التفاعلي
 * Interactive offer bubble component
 * 
 * يتيح قبول/رفض/عرض مضاد
 * Allows accepting/rejecting/countering offers
 */
const OfferBubble: React.FC<OfferBubbleProps> = ({
  offer,
  canRespond,
  isReceiver = true,
  onAccept,
  onReject,
  onCounter,
  className
}) => {
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [showCounterInput, setShowCounterInput] = useState(false);
  const [counterAmount, setCounterAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  // تحويل التواريخ إلى Date objects
  const createdAt = new Date(offer.createdAt);
  const expiresAt = new Date(offer.expiresAt);

  // حساب الوقت المتبقي - Calculate time remaining
  const getTimeRemaining = () => {
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    
    if (diff <= 0) return language === 'bg' ? 'Изтекла' : 'Expired';
    
    const days = differenceInDays(expiresAt, now);
    const hours = differenceInHours(expiresAt, now) % 24;
    
    if (days > 0) {
      if (language === 'bg') {
        return days === 1 ? '1 ден' : `${days} дни`;
      } else {
        return days === 1 ? '1 day' : `${days} days`;
      }
    }
    
    if (hours > 0) {
      if (language === 'bg') {
        return hours === 1 ? '1 час' : `${hours} часа`;
      } else {
        return hours === 1 ? '1 hour' : `${hours} hours`;
      }
    }
    
    return language === 'bg' ? 'по-малко от час' : 'less than an hour';
  };

  // قبول العرض - Accept offer
  const handleAccept = async () => {
    if (!onAccept || isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await onAccept();
      logger.info('Offer accepted successfully', { offerId: offer.id });
    } catch (error) {
      logger.error('Failed to accept offer', error as Error, { offerId: offer.id });
      setError(language === 'bg' ? 'Неуспешно приемане на офертата. Опитайте отново.' : 'Failed to accept offer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // رفض العرض - Reject offer
  const handleReject = async () => {
    if (!onReject || isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await onReject();
      logger.info('Offer rejected successfully', { offerId: offer.id });
    } catch (error) {
      logger.error('Failed to reject offer', error as Error, { offerId: offer.id });
      setError(language === 'bg' ? 'Неуспешно отхвърляне на офертата. Опитайте отново.' : 'Failed to reject offer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // عرض مضاد - Counter offer
  const handleCounter = async () => {
    if (!onCounter || !counterAmount || isLoading) return;
    
    const amount = parseFloat(counterAmount);
    
    // Validation
    if (isNaN(amount) || amount <= 0) {
      setError(language === 'bg' ? 'Моля, въведете валидна сума' : 'Please enter a valid amount');
      return;
    }
    
    if (amount === offer.offerAmount) {
      setError(language === 'bg' ? 'Насрещното предложение трябва да бъде различно от оригиналното' : 'Counter offer must be different from original offer');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await onCounter(amount);
      setShowCounterInput(false);
      setCounterAmount('');
      logger.info('Counter offer sent successfully', { offerId: offer.id, amount });
    } catch (error) {
      logger.error('Failed to send counter offer', error as Error, { offerId: offer.id });
      setError(language === 'bg' ? 'Неуспешно изпращане на насрещно предложение. Опитайте отново.' : 'Failed to send counter offer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // نص الحالة - Status text
  const getStatusText = (status: Offer['status']) => {
    switch (status) {
      case 'pending':
        return language === 'bg' ? '⏳ В чакане' : '⏳ Pending';
      case 'accepted':
        return language === 'bg' ? '✅ Прието' : '✅ Accepted';
      case 'rejected':
        return language === 'bg' ? '❌ Отказано' : '❌ Rejected';
      case 'countered':
        return language === 'bg' ? '🔄 Насрещно предложение' : '🔄 Counter Offer';
      case 'expired':
        return language === 'bg' ? '⏰ Изтекло' : '⏰ Expired';
      default:
        return status;
    }
  };

  // لون الحالة - Status color
  const getStatusColor = (status: Offer['status']) => {
    switch (status) {
      case 'accepted':
        return MessagingColors.offerAccepted;
      case 'rejected':
        return MessagingColors.offerRejected;
      case 'expired':
        return MessagingColors.offerExpired;
      case 'countered':
        return MessagingColors.offerCountered;
      default:
        return MessagingColors.offerPending;
    }
  };

  return (
    <OfferCard $status={offer.status} className={className}>
      {/* Header */}
      <OfferHeader>
        <OfferTitle>
          <OfferIcon>💰</OfferIcon>
          {isReceiver ? (language === 'bg' ? 'Нова оферта' : 'New Offer') : (language === 'bg' ? 'Вашата оферта' : 'Your Offer')}
        </OfferTitle>
        <StatusBadge $color={getStatusColor(offer.status)}>
          {getStatusText(offer.status)}
        </StatusBadge>
      </OfferHeader>

      <Divider />

      {/* Amount */}
      <OfferAmount>
        {offer.offerAmount.toLocaleString('bg-BG')} {offer.currency}
      </OfferAmount>

      {/* Message */}
      {offer.message && (
        <OfferMessage>
          <MessageIcon>💬</MessageIcon>
          {offer.message}
        </OfferMessage>
      )}

      {/* Counter Offer */}
      {offer.status === 'countered' && offer.counterAmount && (
        <CounterOffer>
          <CounterLabel>{language === 'bg' ? 'Насрещно предложение:' : 'Counter Offer:'}</CounterLabel>
          <CounterAmount>
            {offer.counterAmount.toLocaleString('bg-BG')} {offer.currency}
          </CounterAmount>
        </CounterOffer>
      )}

      <Divider />

      {/* Footer */}
      <OfferFooter>
        <FooterItem>
          <FooterLabel>
            {offer.status === 'expired' ? 
              (language === 'bg' ? '⏰ Изтекла на' : '⏰ Expired at') : 
              (language === 'bg' ? '⏳ Изтича след' : '⏳ Expires in')
            }
          </FooterLabel>
          <FooterValue $expired={offer.status === 'expired'}>
            {offer.status === 'expired' ? 
              format(expiresAt, 'dd MMM, HH:mm', { locale: bg }) :
              getTimeRemaining()
            }
          </FooterValue>
        </FooterItem>
        
        <FooterItem>
          <FooterLabel>{language === 'bg' ? '📅 Изпратена на' : '📅 Sent on'}</FooterLabel>
          <FooterValue>
            {format(createdAt, 'dd MMM, HH:mm', { locale: bg })}
          </FooterValue>
        </FooterItem>
      </OfferFooter>

      {/* Error Message */}
      {error && (
        <ErrorMessage>
          ⚠️ {error}
        </ErrorMessage>
      )}

      {/* Actions */}
      {canRespond && offer.status === 'pending' && (
        <>
          <Divider />
          <ActionsContainer>
            {!showCounterInput ? (
              <ActionsRow>
                <ActionButton 
                  $variant="primary" 
                  onClick={handleAccept}
                  disabled={isLoading}
                >
                  {isLoading ? <Spinner /> : '✅'} {language === 'bg' ? 'Приеми' : 'Accept'}
                </ActionButton>
                
                <ActionButton 
                  $variant="secondary" 
                  onClick={() => setShowCounterInput(true)}
                  disabled={isLoading}
                >
                  🔄 {language === 'bg' ? 'Насрещно' : 'Counter'}
                </ActionButton>
                
                <ActionButton 
                  $variant="danger" 
                  onClick={handleReject}
                  disabled={isLoading}
                >
                  {isLoading ? <Spinner /> : '❌'} {language === 'bg' ? 'Откажи' : 'Reject'}
                </ActionButton>
              </ActionsRow>
            ) : (
              <CounterInputContainer>
                <CounterInputLabel>{language === 'bg' ? 'Въведете насрещно предложение:' : 'Enter your counter offer:'}</CounterInputLabel>
                <CounterInputRow>
                  <CounterInput
                    type="number"
                    placeholder={language === 'bg' ? `Пример: ${(offer.offerAmount * 1.1).toFixed(0)}` : `Example: ${(offer.offerAmount * 1.1).toFixed(0)}`}
                    value={counterAmount}
                    onChange={(e) => setCounterAmount(e.target.value)}
                    disabled={isLoading}
                    min="0"
                    step="100"
                  />
                  <CurrencyLabel>{offer.currency}</CurrencyLabel>
                </CounterInputRow>
                <CounterActionsRow>
                  <ActionButton 
                    $variant="primary" 
                    onClick={handleCounter}
                    disabled={isLoading || !counterAmount}
                  >
                    {isLoading ? <Spinner /> : '📤'} {language === 'bg' ? 'Изпращане' : 'Send'}
                  </ActionButton>
                  <ActionButton 
                    $variant="secondary" 
                    onClick={() => {
                      setShowCounterInput(false);
                      setCounterAmount('');
                      setError(null);
                    }}
                    disabled={isLoading}
                  >
                    {language === 'bg' ? 'Отказ' : 'Cancel'}
                  </ActionButton>
                </CounterActionsRow>
              </CounterInputContainer>
            )}
          </ActionsContainer>
        </>
      )}

      {/* View Only Message */}
      {!canRespond && offer.status === 'pending' && (
        <ViewOnlyMessage>
          <InfoIcon>ℹ️</InfoIcon>
          {language === 'bg' ? 
            'Това е вашата оферта. Изчакване на отговор.' : 
            'This is your offer. Waiting for response.'
          }
        </ViewOnlyMessage>
      )}
    </OfferCard>
  );
};

// Styled Components
const OfferCard = styled.div<{ $status: Offer['status'] }>`
  background: white;
  border: 2px solid ${props => {
    switch (props.$status) {
      case 'accepted': return MessagingColors.offerAccepted;
      case 'rejected': return MessagingColors.offerRejected;
      case 'expired': return MessagingColors.offerExpired;
      case 'countered': return MessagingColors.offerCountered;
      default: return MessagingColors.offerPending;
    }
  }};
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

const OfferHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
`;

const OfferTitle = styled.h4`
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #003366;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const OfferIcon = styled.span`
  font-size: 20px;
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

const OfferAmount = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #003366;
  margin: 12px 0;
  text-align: center;
  letter-spacing: -0.5px;
`;

const OfferMessage = styled.div`
  display: flex;
  gap: 8px;
  padding: 12px;
  background-color: #F9FAFB;
  border-radius: 8px;
  margin: 12px 0;
  font-size: 13px;
  color: #4B5563;
  line-height: 1.5;
`;

const MessageIcon = styled.span`
  font-size: 16px;
  flex-shrink: 0;
`;

const CounterOffer = styled.div`
  padding: 12px;
  background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
  border-radius: 10px;
  margin: 12px 0;
  border-left: 4px solid #F59E0B;
`;

const CounterLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #92400E;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
`;

const CounterAmount = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #92400E;
`;

const OfferFooter = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 16px;
`;

const FooterItem = styled.div`
  flex: 1;
`;

const FooterLabel = styled.div`
  font-size: 10px;
  color: #9CA3AF;
  font-weight: 500;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const FooterValue = styled.div<{ $expired?: boolean }>`
  font-size: 13px;
  color: ${props => props.$expired ? '#DC2626' : '#374151'};
  font-weight: 600;
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

const ActionsContainer = styled.div`
  margin-top: 12px;
`;

const ActionsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
`;

const ActionButton = styled(ButtonBase)`
  font-size: 13px;
  padding: 10px 12px;
  min-height: 40px;
`;

const CounterInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const CounterInputLabel = styled.label`
  font-size: 13px;
  font-weight: 500;
  color: #374151;
`;

const CounterInputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CounterInput = styled.input`
  flex: 1;
  padding: 10px 14px;
  border: 2px solid #D1D5DB;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #FF8F10;
    box-shadow: 0 0 0 3px rgba(255, 143, 16, 0.1);
  }
  
  &::placeholder {
    color: #9CA3AF;
    font-weight: 400;
  }
  
  &:disabled {
    background-color: #F3F4F6;
    cursor: not-allowed;
  }
`;

const CurrencyLabel = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #6B7280;
`;

const CounterActionsRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 8px;
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

const InfoIcon = styled.span`
  font-size: 16px;
`;

// Named export for barrel export
export { OfferBubble };

// Export default for backward compatibility
export default OfferBubble;
