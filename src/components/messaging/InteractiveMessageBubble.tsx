import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';
import { bg } from 'date-fns/locale';
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
import { OfferBubble } from './OfferBubble';

/**
 * Message type
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
 * Interactive message bubble component
 * 
 * Supports different types: text, offer, action, voice, system
 */
const InteractiveMessageBubble: React.FC<InteractiveMessageBubbleProps> = ({
  message,
  isSender,
  showAvatar = true,
  onOfferAction,
  className
}) => {
  // Format time in Bulgarian
  const formatTime = (timestamp: Date) => {
    try {
      return format(timestamp, 'HH:mm', { locale: bg });
    } catch (error) {
      return format(timestamp, 'HH:mm');
    }
  };

  // Delivery status icon
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

  // Render content by type
  const renderContent = () => {
    switch (message.type) {
      case 'text':
        return <TextContent>{message.content}</TextContent>;
      
      case 'offer':
        return (
          <OfferBubble
            offer={(message.metadata?.offer as any) || (message as any)}
            canRespond={!isSender}
            isReceiver={!isSender}
          />
        );
      
      case 'action':
        // Action messages (appointment booking, share location, etc.)
        return (
          <ActionContent>
            <ActionIcon>{getActionIcon(message.metadata?.actionType)}</ActionIcon>
            <ActionText>{message.content}</ActionText>
          </ActionContent>
        );
      
      case 'voice':
        return <VoiceMessagePlayer message={message} />;
      
      case 'system':
        // System messages (user joined, left, etc.)
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

  // Action type icon
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

  // System messages have different design
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
        {/* Avatar for receiver only */}
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
          {/* Sender name (for receiver only) */}
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

// Inline voice message player
const VoicePlayerWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 200px;
`;

const PlayButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 22px;
  padding: 0;
  line-height: 1;
`;

const WaveformBar = styled.div`
  flex: 1;
  height: 32px;
  background: rgba(0,0,0,0.05);
  border-radius: 16px;
  position: relative;
  overflow: hidden;
`;

const WaveformProgress = styled.div<{ $pct: number }>`
  height: 100%;
  width: ${p => p.$pct}%;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  border-radius: 16px;
  transition: width 0.1s linear;
`;

const VoiceDuration = styled.span`
  font-size: 12px;
  color: #94a3b8;
  min-width: 36px;
`;

const VoiceMessagePlayer: React.FC<{ message: Message }> = ({ message }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const toggle = () => {
    if (!audioRef.current) {
      if (!message.metadata?.audioUrl) return;
      audioRef.current = new Audio(message.metadata.audioUrl);
      audioRef.current.ontimeupdate = () => {
        const a = audioRef.current!;
        setProgress(a.duration ? (a.currentTime / a.duration) * 100 : 0);
      };
      audioRef.current.onended = () => { setPlaying(false); setProgress(0); };
    }
    if (playing) { audioRef.current.pause(); } else { audioRef.current.play(); }
    setPlaying(!playing);
  };

  return (
    <VoicePlayerWrapper>
      <PlayButton onClick={toggle}>{playing ? '⏸️' : '▶️'}</PlayButton>
      <WaveformBar><WaveformProgress $pct={progress} /></WaveformBar>
      <VoiceDuration>{message.metadata?.duration || '0:00'}</VoiceDuration>
    </VoicePlayerWrapper>
  );
};

// Named export for barrel export
export { InteractiveMessageBubble };

// Export default for backward compatibility
export default InteractiveMessageBubble;
