import React from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';
import bg from 'date-fns/locale/bg';
import { 
  MessageContainer, 
  BubbleBase, 
  Timestamp, 
  DeliveryStatus,
  AvatarContainer,
  Avatar,
  TimeRow
} from './messaging-styles';
import { useLanguage } from '@/contexts';

/**
 * نوع الرسالة - Message type
 * @interface Message
 */
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  senderName?: string;
  senderAvatar?: string;
  content: string;
  type: 'text' | 'offer' | 'action' | 'voice' | 'system';
  deliveryStatus?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  createdAt: Date;
  metadata?: Record<string, any>;
}

interface InteractiveMessageBubbleProps {
  message: Message;
  isSender: boolean;
  showAvatar?: boolean;
  onOfferAction?: (action: 'accept' | 'reject' | 'counter') => void;
  className?: string;
}

/**
 * مكون عرض الرسالة التفاعلي
 * Interactive message bubble component
 * 
 * يدعم أنواع مختلفة: text, offer, action, voice, system
 * Supports different types: text, offer, action, voice, system
 */
const InteractiveMessageBubble: React.FC<InteractiveMessageBubbleProps> = ({
  message,
  isSender,
  showAvatar = true,
  onOfferAction,
  className
}) => {
  // تنسيق الوقت بالبلغارية - Format time in Bulgarian
  const formatTime = (timestamp: Date) => {
    try {
      return format(timestamp, 'HH:mm', { locale: bg });
    } catch (error) {
      return format(timestamp, 'HH:mm');
    }
  };

  // رمز حالة التوصيل - Delivery status icon
  const renderDeliveryStatus = () => {
    if (!isSender || !message.deliveryStatus) return null;
    
    const { deliveryStatus } = message;
    
    if (deliveryStatus === 'sending') {
      return <DeliveryStatus $status="sending">🕐</DeliveryStatus>;
    }
    
    if (deliveryStatus === 'sent') {
      return <DeliveryStatus $status="sent">✓</DeliveryStatus>;
    }
    
    if (deliveryStatus === 'delivered') {
      return <DeliveryStatus $status="delivered">✓✓</DeliveryStatus>;
    }
    
    if (deliveryStatus === 'read') {
      return <DeliveryStatus $status="read">✓✓</DeliveryStatus>;
    }

    if (deliveryStatus === 'failed') {
      return <DeliveryStatus $status="failed">❌</DeliveryStatus>;
    }
    
    return null;
  };

  // عرض محتوى الرسالة حسب النوع - Render content by type
  const renderContent = () => {
    switch (message.type) {
      case 'text':
        return <TextContent>{message.content}</TextContent>;
      
      case 'offer':
        // TODO: استخدام OfferBubble component
        return (
          <ActionContent>
            <ActionIcon>💰</ActionIcon>
            <ActionText>{message.content}</ActionText>
          </ActionContent>
        );
      
      case 'action':
        // رسائل الإجراءات (حجز موعد، مشاركة موقع، إلخ)
        return (
          <ActionContent>
            <ActionIcon>{getActionIcon(message.metadata?.actionType)}</ActionIcon>
            <ActionText>{message.content}</ActionText>
          </ActionContent>
        );
      
      case 'voice':
        // TODO: استخدام VoiceMessageBubble component
        const { language } = useLanguage();
        return (
          <ActionContent>
            <ActionIcon>🎤</ActionIcon>
            <ActionText>{language === 'bg' ? 'Гласово съобщение' : 'Voice Message'} ({message.metadata?.duration || '0:00'})</ActionText>
          </ActionContent>
        );
      
      case 'system':
        // رسائل النظام (انضم مستخدم، غادر، إلخ)
        return (
          <SystemContent>
            <SystemIcon>ℹ️</SystemIcon>
            <SystemText>{message.content}</SystemText>
          </SystemContent>
        );
      
      default:
        return <TextContent>{message.content}</TextContent>;
    }
  };

  // أيقونة نوع الإجراء - Action type icon
  const getActionIcon = (actionType?: string) => {
    switch (actionType) {
      case 'appointment':
        return '📅';
      case 'location':
        return '📍';
      case 'inspection':
        return '📋';
      case 'document':
        return '📄';
      default:
        return '⚡';
    }
  };

  // رسائل النظام لها تصميم مختلف - System messages have different design
  if (message.type === 'system') {
    return (
      <SystemMessageContainer className={className}>
        {renderContent()}
      </SystemMessageContainer>
    );
  }

  return (
    <MessageContainer $isSender={isSender} className={className}>
      <MessageRow>
        {/* Avatar للمستقبل فقط - Avatar for receiver only */}
        {showAvatar && !isSender && message.senderAvatar && (
          <AvatarContainer>
            <Avatar 
              src={message.senderAvatar} 
              alt={message.senderName || 'User'} 
              onError={(e) => {
                // Fallback to default avatar
                (e.target as HTMLImageElement).src = '/assets/default-avatar.png';
              }}
            />
          </AvatarContainer>
        )}
        
        <BubbleWrapper>
          {/* اسم المرسل (للمستقبل فقط) - Sender name (for receiver only) */}
          {showAvatar && !isSender && message.senderName && (
            <SenderName>{message.senderName}</SenderName>
          )}
          
          <BubbleBase $isSender={isSender}>
            {renderContent()}
            
            <TimeRow>
              <Timestamp>{formatTime(message.createdAt)}</Timestamp>
              {renderDeliveryStatus()}
            </TimeRow>
          </BubbleBase>
        </BubbleWrapper>
      </MessageRow>
    </MessageContainer>
  );
};

// Styled Components
const MessageRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 8px;
  max-width: 100%;
`;

const BubbleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 100%;
`;

const SenderName = styled.span`
  font-size: 11px;
  color: #6B7280;
  font-weight: 500;
  padding-left: 4px;
`;

const TextContent = styled.p`
  margin: 0;
  line-height: 1.5;
  font-size: 14px;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const ActionContent = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ActionIcon = styled.span`
  font-size: 18px;
`;

const ActionText = styled.span`
  font-size: 14px;
  font-weight: 500;
`;

const SystemContent = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
`;

const SystemIcon = styled.span`
  font-size: 14px;
  opacity: 0.7;
`;

const SystemText = styled.span`
  font-size: 12px;
  color: #6B7280;
  font-style: italic;
`;

const SystemMessageContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 8px 16px;
  margin: 8px 0;
`;

// Named export for barrel export
export { InteractiveMessageBubble };

// Export default for backward compatibility
export default InteractiveMessageBubble;
