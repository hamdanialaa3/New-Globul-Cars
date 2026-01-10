/**
 * 💬 MessageBubble Component
 * مكون فقاعة الرسالة
 * 
 * @description Display a single message with different styles based on type
 * عرض رسالة واحدة بأنماط مختلفة بناءً على النوع
 * 
 * @author Claude Opus 4.5 - Chief Architect
 * @date January 8, 2026
 */

import React from 'react';
import styledBase, { keyframes } from 'styled-components';
import { 
  Check, 
  CheckCheck, 
  DollarSign, 
  MapPin,
  ThumbsUp,
  ThumbsDown,
  RefreshCw
} from 'lucide-react';

import { RealtimeMessage } from '../../../services/messaging/realtime';
import { useLanguage } from '../../../contexts/LanguageContext';

// Alias for styled-components
const styled = styledBase;

// ==================== ANIMATIONS ====================

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulseGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(59, 130, 246, 0);
  }
`;

// ==================== STYLED COMPONENTS ====================

const BubbleWrapper = styled.div<{ $isOwn: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ $isOwn }) => ($isOwn ? 'flex-end' : 'flex-start')};
  margin-bottom: 8px;
  animation: ${fadeInUp} 0.3s ease;
`;

const Bubble = styled.div<{ $isOwn: boolean; $type: string }>`
  max-width: 70%;
  padding: ${({ $type }) => ($type === 'offer' ? '0' : '12px 16px')};
  border-radius: 18px;
  border-bottom-${({ $isOwn }) => ($isOwn ? 'right' : 'left')}-radius: 4px;
  
  /* Glassmorphism Effect */
  background: ${({ $isOwn, $type }) => {
    if ($type === 'offer') return 'transparent';
    return $isOwn
      ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(139, 92, 246, 0.9))'
      : 'rgba(255, 255, 255, 0.1)';
  }};
  backdrop-filter: blur(10px);
  border: 1px solid ${({ $isOwn }) =>
    $isOwn ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  
  color: ${({ $isOwn }) => ($isOwn ? '#ffffff' : 'rgba(255, 255, 255, 0.9)')};
`;

const MessageText = styled.p`
  margin: 0;
  font-size: 15px;
  line-height: 1.4;
  word-wrap: break-word;
`;

const TimeRow = styled.div<{ $isOwn: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  justify-content: ${({ $isOwn }) => ($isOwn ? 'flex-end' : 'flex-start')};
`;

const TimeStamp = styled.span`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
`;

const StatusIcon = styled.span<{ $isRead: boolean }>`
  color: ${({ $isRead }) => ($isRead ? '#3B82F6' : 'rgba(255, 255, 255, 0.4)')};
  display: flex;
  align-items: center;
`;

// ==================== OFFER MESSAGE STYLES ====================

const OfferCard = styled.div<{ $status: string }>`
  background: linear-gradient(135deg, 
    ${({ $status }) => {
      switch ($status) {
        case 'accepted': return 'rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1)';
        case 'rejected': return 'rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1)';
        case 'countered': return 'rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.1)';
        case 'expired': return 'rgba(107, 114, 128, 0.2), rgba(107, 114, 128, 0.1)';
        default: return 'rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.1)';
      }
    }}
  );
  border: 1px solid ${({ $status }) => {
    switch ($status) {
      case 'accepted': return 'rgba(34, 197, 94, 0.4)';
      case 'rejected': return 'rgba(239, 68, 68, 0.4)';
      case 'countered': return 'rgba(245, 158, 11, 0.4)';
      case 'expired': return 'rgba(107, 114, 128, 0.4)';
      default: return 'rgba(59, 130, 246, 0.4)';
    }
  }};
  border-radius: 16px;
  padding: 16px;
  max-width: 280px;
  animation: ${({ $status }) => $status === 'pending' ? pulseGlow : 'none'} 2s infinite;
`;

const OfferHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`;

const OfferIcon = styled.div<{ $status: string }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $status }) => {
    switch ($status) {
      case 'accepted': return 'rgba(34, 197, 94, 0.3)';
      case 'rejected': return 'rgba(239, 68, 68, 0.3)';
      case 'countered': return 'rgba(245, 158, 11, 0.3)';
      case 'expired': return 'rgba(107, 114, 128, 0.3)';
      default: return 'rgba(59, 130, 246, 0.3)';
    }
  }};
  color: ${({ $status }) => {
    switch ($status) {
      case 'accepted': return '#22C55E';
      case 'rejected': return '#EF4444';
      case 'countered': return '#F59E0B';
      case 'expired': return '#6B7280';
      default: return '#3B82F6';
    }
  }};
`;

const OfferTitle = styled.span`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
`;

const OfferAmount = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  text-align: center;
  margin: 12px 0;
`;

const OfferCurrency = styled.span`
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin-left: 4px;
`;

const OfferStatus = styled.div<{ $status: string }>`
  text-align: center;
  padding: 8px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  background: ${({ $status }) => {
    switch ($status) {
      case 'accepted': return 'rgba(34, 197, 94, 0.2)';
      case 'rejected': return 'rgba(239, 68, 68, 0.2)';
      case 'countered': return 'rgba(245, 158, 11, 0.2)';
      case 'expired': return 'rgba(107, 114, 128, 0.2)';
      default: return 'rgba(59, 130, 246, 0.2)';
    }
  }};
  color: ${({ $status }) => {
    switch ($status) {
      case 'accepted': return '#22C55E';
      case 'rejected': return '#EF4444';
      case 'countered': return '#F59E0B';
      case 'expired': return '#6B7280';
      default: return '#3B82F6';
    }
  }};
`;

const OfferActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const OfferButton = styled.button<{ $variant: 'accept' | 'reject' | 'counter' }>`
  flex: 1;
  padding: 10px;
  border-radius: 10px;
  border: none;
  font-weight: 500;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s ease;
  
  background: ${({ $variant }) => {
    switch ($variant) {
      case 'accept': return 'linear-gradient(135deg, #22C55E, #16A34A)';
      case 'reject': return 'rgba(239, 68, 68, 0.2)';
      case 'counter': return 'rgba(245, 158, 11, 0.2)';
    }
  }};
  color: ${({ $variant }) => {
    switch ($variant) {
      case 'accept': return '#ffffff';
      case 'reject': return '#EF4444';
      case 'counter': return '#F59E0B';
    }
  }};
  border: 1px solid ${({ $variant }) => {
    switch ($variant) {
      case 'accept': return 'transparent';
      case 'reject': return 'rgba(239, 68, 68, 0.4)';
      case 'counter': return 'rgba(245, 158, 11, 0.4)';
    }
  }};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

// ==================== IMAGE MESSAGE STYLES ====================

const ImageContainer = styled.div`
  max-width: 280px;
  border-radius: 16px;
  overflow: hidden;
`;

const MessageImage = styled.img`
  width: 100%;
  height: auto;
  display: block;
  cursor: pointer;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.02);
  }
`;

// ==================== LOCATION MESSAGE STYLES ====================

const LocationCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const LocationIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #EF4444, #DC2626);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const LocationText = styled.span`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
`;

// ==================== HELPER FUNCTIONS ====================

const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat('de-DE').format(amount);
};

const getStatusText = (status: string, locale: 'bg' | 'en'): string => {
  const texts: Record<string, { bg: string; en: string }> = {
    pending: { bg: 'Очаква отговор', en: 'Awaiting response' },
    accepted: { bg: 'Прието', en: 'Accepted' },
    rejected: { bg: 'Отхвърлено', en: 'Rejected' },
    countered: { bg: 'Контра предложение', en: 'Counter offer' },
    expired: { bg: 'Изтекло', en: 'Expired' },
  };
  return texts[status]?.[locale] || status;
};

// ==================== COMPONENT ====================

interface MessageBubbleProps {
  message: RealtimeMessage;
  isOwn: boolean;
  onAcceptOffer?: (messageId: string) => void;
  onRejectOffer?: (messageId: string) => void;
  onCounterOffer?: (messageId: string) => void;
  onImageClick?: (imageUrl: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  onAcceptOffer,
  onRejectOffer,
  onCounterOffer,
  onImageClick,
}) => {
  const { language } = useLanguage();
  const locale = language === 'bg' ? 'bg' : 'en';
  
  const renderContent = () => {
    switch (message.type) {
      case 'offer': {
        const offerStatus = message.metadata?.offerStatus || 'pending';
        const offerAmount = message.metadata?.offerAmount || 0;
        const offerCurrency = message.metadata?.offerCurrency || 'EUR';
        const canRespond = !isOwn && offerStatus === 'pending';
        
        return (
          <OfferCard $status={offerStatus}>
            <OfferHeader>
              <OfferIcon $status={offerStatus}>
                <DollarSign size={20} />
              </OfferIcon>
              <OfferTitle>
                {locale === 'bg' ? 'Ценово предложение' : 'Price Offer'}
              </OfferTitle>
            </OfferHeader>
            
            <OfferAmount>
              {formatPrice(offerAmount)}
              <OfferCurrency>{offerCurrency}</OfferCurrency>
            </OfferAmount>
            
            <OfferStatus $status={offerStatus}>
              {getStatusText(offerStatus, locale)}
            </OfferStatus>
            
            {canRespond && (
              <OfferActions>
                <OfferButton $variant="accept" onClick={() => onAcceptOffer?.(message.id)}>
                  <ThumbsUp size={16} />
                  {locale === 'bg' ? 'Приеми' : 'Accept'}
                </OfferButton>
                <OfferButton $variant="reject" onClick={() => onRejectOffer?.(message.id)}>
                  <ThumbsDown size={16} />
                </OfferButton>
                <OfferButton $variant="counter" onClick={() => onCounterOffer?.(message.id)}>
                  <RefreshCw size={16} />
                </OfferButton>
              </OfferActions>
            )}
          </OfferCard>
        );
      }
        
      case 'image': {
        const imageUrl = message.metadata?.imageUrl;
        return (
          <ImageContainer>
            {imageUrl && (
              <MessageImage
                src={imageUrl}
                alt="Shared image"
                onClick={() => onImageClick?.(imageUrl)}
              />
            )}
            {message.content && <MessageText>{message.content}</MessageText>}
          </ImageContainer>
        );
      }
        
      case 'location': {
        const locationName = message.metadata?.locationName;
        return (
          <LocationCard
            onClick={() => {
              const lat = message.metadata?.latitude;
              const lng = message.metadata?.longitude;
              if (lat && lng) {
                window.open(`https://maps.google.com/?q=${lat},${lng}`, '_blank');
              }
            }}
          >
            <LocationIcon>
              <MapPin size={20} />
            </LocationIcon>
            <LocationText>
              {locationName || (locale === 'bg' ? 'Споделена локация' : 'Shared location')}
            </LocationText>
          </LocationCard>
        );
      }
        
      case 'system':
        return (
          <MessageText style={{ fontStyle: 'italic', opacity: 0.7 }}>
            {message.content}
          </MessageText>
        );
        
      default: // text
        return <MessageText>{message.content}</MessageText>;
    }
  };
  
  return (
    <BubbleWrapper $isOwn={isOwn}>
      <Bubble $isOwn={isOwn} $type={message.type}>
        {renderContent()}
      </Bubble>
      
      <TimeRow $isOwn={isOwn}>
        <TimeStamp>{formatTime(message.timestamp)}</TimeStamp>
        {isOwn && (
          <StatusIcon $isRead={message.read}>
            {message.read ? <CheckCheck size={14} /> : <Check size={14} />}
          </StatusIcon>
        )}
      </TimeRow>
    </BubbleWrapper>
  );
};

export default MessageBubble;
