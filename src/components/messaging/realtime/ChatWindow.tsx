/**
 * 💬 ChatWindow Component
 * مكون نافذة المحادثة
 * 
 * @description Full chat window with messages list, input, and header
 * نافذة محادثة كاملة مع قائمة الرسائل والإدخال والعنوان
 * 
 * @author Claude Opus 4.5 - Chief Architect
 * @date January 8, 2026
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import styledBase, { keyframes } from 'styled-components';
import { ArrowLeft, MoreVertical, Phone, Video, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

import { RealtimeChannel, RealtimeMessage } from '../../../services/messaging/realtime';
import { useTypingIndicator } from '../../../hooks/messaging';
import { useLanguage } from '../../../contexts/LanguageContext';
import { logger } from '../../../services/logger-service';

import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';

// Alias for styled-components
const styled = styledBase;

// ==================== ANIMATIONS ====================

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// ==================== STYLED COMPONENTS ====================

const WindowContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 100vh;
  background: var(--bg-secondary, #ffffff);
  overflow: hidden;
  animation: ${fadeIn} 0.3s ease;
  transition: background-color 0.3s ease;
  
  [data-theme='dark'] & {
    background: var(--bg-secondary, #1e293b);
  }
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--bg-primary, #f8f9fa);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-color, rgba(0, 0, 0, 0.08));
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  [data-theme='dark'] & {
    background: rgba(15, 23, 42, 0.95);
    border-bottom-color: rgba(255, 255, 255, 0.1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
  
  @media (max-width: 768px) {
    padding: 10px 12px;
  }
`;

const BackButton = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-hover, rgba(0, 0, 0, 0.05));
  color: var(--text-secondary, #64748b);
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--bg-active, rgba(0, 0, 0, 0.1));
    color: var(--text-primary, #1a1d2e);
    transform: scale(1.05);
  }
  
  [data-theme='dark'] & {
    background: rgba(255, 255, 255, 0.05);
    color: #94a3b8;
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }
  }
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const CarThumbnail = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  object-fit: cover;
  border: 2px solid rgba(59, 130, 246, 0.3);
  cursor: pointer;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const HeaderInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const CarTitle = styled(Link)`
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary, #1a1d2e);
  text-decoration: none;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s ease;
  
  &:hover {
    color: var(--color-primary, #3b82f6);
  }
  
  [data-theme='dark'] & {
    color: #fff;
    
    &:hover {
      color: #60a5fa;
    }
  }
`;

const CarPrice = styled.div`
  font-size: 14px;
  color: #22c55e;
  font-weight: 500;
`;

const TypingIndicatorText = styled.div`
  font-size: 12px;
  color: #60a5fa;
  font-style: italic;
  animation: ${pulse} 1s ease infinite;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-hover, rgba(0, 0, 0, 0.05));
  border: none;
  color: var(--text-secondary, #64748b);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(59, 130, 246, 0.1);
    color: var(--color-primary, #3b82f6);
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  [data-theme='dark'] & {
    background: rgba(255, 255, 255, 0.05);
    color: #94a3b8;
    
    &:hover {
      background: rgba(59, 130, 246, 0.2);
      color: #60a5fa;
    }
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: var(--bg-tertiary, #f8f9fa);
  transition: background-color 0.3s ease;
  
  [data-theme='dark'] & {
    background: var(--bg-tertiary, #0f172a);
  }
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--border-color, rgba(0, 0, 0, 0.1));
    border-radius: 3px;
    transition: background 0.2s ease;
    
    &:hover {
      background: var(--border-color, rgba(0, 0, 0, 0.2));
    }
  }
  
  [data-theme='dark'] &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    
    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  }
`;

const DateDivider = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 16px 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border-color, rgba(0, 0, 0, 0.1));
    transition: background 0.3s ease;
  }
  
  [data-theme='dark'] &::before,
  [data-theme='dark'] &::after {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const DateText = styled.span`
  font-size: 12px;
  color: var(--text-secondary, #64748b);
  padding: 4px 12px;
  background: var(--bg-hover, rgba(0, 0, 0, 0.05));
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  
  [data-theme='dark'] & {
    color: #94a3b8;
    background: rgba(255, 255, 255, 0.05);
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 32px;
  text-align: center;
  animation: ${slideUp} 0.5s ease;
`;

const EmptyIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(59, 130, 246, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
  
  svg {
    width: 40px;
    height: 40px;
    color: var(--color-primary, #3b82f6);
    transition: color 0.3s ease;
  }
  
  [data-theme='dark'] svg {
    color: #60a5fa;
  }
`;

const EmptyTitle = styled.h3`
  font-size: 18px;
  color: var(--text-primary, #1a1d2e);
  margin-bottom: 8px;
  font-weight: 600;
  transition: color 0.3s ease;
  
  [data-theme='dark'] & {
    color: #fff;
  }
`;

const EmptyDescription = styled.p`
  font-size: 14px;
  color: var(--text-secondary, #64748b);
  max-width: 280px;
  line-height: 1.5;
  transition: color 0.3s ease;
  
  [data-theme='dark'] & {
    color: #94a3b8;
  }
`;

const InputSection = styled.div`
  border-top: 1px solid var(--border-color, rgba(0, 0, 0, 0.08));
  background: var(--bg-primary, #ffffff);
  backdrop-filter: blur(12px);
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  [data-theme='dark'] & {
    border-top-color: rgba(255, 255, 255, 0.1);
    background: rgba(15, 23, 42, 0.95);
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.3);
  }
`;

// ==================== INTERFACES ====================

interface ChatWindowProps {
  channel: RealtimeChannel;
  messages: RealtimeMessage[];
  currentUserNumericId: number;
  isLoading?: boolean;
  onSendMessage: (content: string) => Promise<string | null>;
  onSendOffer?: (amount: number, currency?: string) => Promise<string | null>;
  onSendImage?: (imageUrl: string, imageThumbnail?: string) => Promise<string | null>;
  onAcceptOffer?: (messageId: string) => void;
  onRejectOffer?: (messageId: string) => void;
  onCounterOffer?: (messageId: string) => void;
  onBack?: () => void;
}

// ==================== HELPER FUNCTIONS ====================

const formatDate = (timestamp: number, locale: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const daysDiff = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (daysDiff === 0) {
    return locale === 'bg' ? 'Днес' : 'Today';
  }
  if (daysDiff === 1) {
    return locale === 'bg' ? 'Вчера' : 'Yesterday';
  }
  
  return date.toLocaleDateString(locale === 'bg' ? 'bg-BG' : 'en-US', {
    day: 'numeric',
    month: 'long',
  });
};

const groupMessagesByDate = (messages: RealtimeMessage[]): Map<string, RealtimeMessage[]> => {
  const groups = new Map<string, RealtimeMessage[]>();
  
  messages.forEach((message) => {
    const date = new Date(message.timestamp).toDateString();
    if (!groups.has(date)) {
      groups.set(date, []);
    }
    const group = groups.get(date);
    if (group) {
      group.push(message);
    }
  });
  
  return groups;
};

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('de-DE').format(price);
};

// ==================== COMPONENT ====================

export const ChatWindow: React.FC<ChatWindowProps> = ({
  channel,
  messages,
  currentUserNumericId,
  isLoading = false,
  onSendMessage,
  onSendOffer,
  onSendImage,
  onAcceptOffer,
  onRejectOffer,
  onCounterOffer,
  onBack,
}) => {
  const { language } = useLanguage();
  const locale = language === 'bg' ? 'bg' : 'en';
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Get typing state for this channel
  const {
    typingText,
    isAnyoneTyping,
    startTyping,
    stopTyping,
  } = useTypingIndicator(channel.id, currentUserNumericId);
  
  // Auto-scroll to bottom on new messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);
  
  // Group messages by date
  const messageGroups = groupMessagesByDate(messages);
  
  // Determine other participant info
  const isUserBuyer = channel.buyerNumericId === currentUserNumericId;
  const otherUserName = isUserBuyer 
    ? (channel.sellerDisplayName || channel.sellerName) 
    : (channel.buyerDisplayName || channel.buyerName);
  
  // Car details URL
  const carDetailsUrl = `/car/${channel.sellerNumericId}/${channel.carNumericId}`;
  
  // Handle send message
  const handleSendMessage = async (content: string): Promise<boolean> => {
    startTyping(); // Notify typing started
    const result = await onSendMessage(content);
    stopTyping(); // Notify typing stopped
    return result !== null;
  };
  
  // Handle send offer
  const handleSendOffer = async (amount: number, currency?: string): Promise<boolean> => {
    if (onSendOffer) {
      const result = await onSendOffer(amount, currency);
      return result !== null;
    }
    return false;
  };
  
  // Handle send image (upload then send)
  const handleSendImage = async (file: File): Promise<boolean> => {
    if (!onSendImage) return false;
    
    try {
      // Import image upload service dynamically
      const { imageUploadService } = await import('../../../services/messaging/realtime/image-upload.service');
      
      // Upload image to Firebase Storage
      const uploadResult = await imageUploadService.uploadImage(file, currentUserNumericId);
      
      // Send message with image URLs
      const result = await onSendImage(uploadResult.url, uploadResult.thumbnailUrl);
      return result !== null;
    } catch (error) {
      logger.error('[ChatWindow] Failed to upload and send image', error as Error);
      return false;
    }
  };
  
  // Handle Phone Call
  const handlePhoneCall = useCallback(() => {
    // Get phone number from channel metadata or other user profile
    const phoneNumber = channel.sellerPhone || channel.buyerPhone;
    
    if (phoneNumber) {
      // Open phone dialer (works on mobile)
      window.location.href = `tel:${phoneNumber}`;
      logger.info('[ChatWindow] Phone call initiated', { phoneNumber });
    } else {
      // Show notification that phone number is not available
      logger.warn('[ChatWindow] Phone number not available');
      toast.warning(locale === 'bg' 
        ? 'Телефонният номер не е наличен' 
        : 'Phone number not available');
    }
  }, [channel, locale]);
  
  // Handle Video Call
  const handleVideoCall = useCallback(() => {
    // For future WebRTC integration
    logger.info('[ChatWindow] Video call requested (not implemented yet)');
    toast.info(locale === 'bg' 
      ? 'Видео разговорите ще бъдат налични скоро' 
      : 'Video calls will be available in a future update');
    
    // TODO: Integrate WebRTC or external video call service
    // Example: Jitsi, Agora, Twilio Video
  }, [locale]);
  
  // Handle Info Button (Show channel/user details)
  const handleShowInfo = useCallback(() => {
    // For future implementation: Show modal with channel details
    logger.info('[ChatWindow] Info requested', { channelId: channel.id });
    
    // TODO: Open modal with:
    // - Car details
    // - Other user profile
    // - Shared photos
    // - Offer history
    toast.info(locale === 'bg' 
      ? `Информация за ${channel.carTitle} | Продавач: ${otherUserName}` 
      : `Info about ${channel.carTitle} | Seller: ${otherUserName}`);
  }, [channel, otherUserName, locale]);
  
  // Handle More Options
  const handleMoreOptions = useCallback(() => {
    // For future implementation: Show context menu
    logger.info('[ChatWindow] More options requested');
    
    // TODO: Show menu with:
    // - Block user
    // - Report conversation
    // - Archive conversation
    // - Clear history
    // - Export conversation
    const action = window.confirm(
      locale === 'bg' 
        ? 'Опции:\n\n1. Архивирай разговора\n2. Изчисти историята\n3. Блокирай потребителя\n\nИзберете (отказ за затваряне)' 
        : 'Options:\n\n1. Archive conversation\n2. Clear history\n3. Block user\n\nChoose (cancel to close)'
    );
    
    if (action) {
      // Handle selected action
      logger.info('[ChatWindow] More options action selected');
    }
  }, [locale]);
  
  return (
    <WindowContainer>
      {/* Header */}
      <Header>
        <BackButton to="/messages" onClick={(e) => { if (onBack) { e.preventDefault(); onBack(); } }}>
          <ArrowLeft size={20} />
        </BackButton>
        
        {channel.carImage && (
          <Link to={carDetailsUrl}>
            <CarThumbnail
              src={channel.carImage}
              alt={channel.carTitle}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/car-placeholder.png';
              }}
            />
          </Link>
        )}
        
        <HeaderInfo>
          <CarTitle to={carDetailsUrl}>
            {channel.carTitle || (locale === 'bg' ? 'Автомобил' : 'Vehicle')}
          </CarTitle>
          
          {isAnyoneTyping ? (
            <TypingIndicatorText>{typingText}</TypingIndicatorText>
          ) : channel.carPrice ? (
            <CarPrice>{formatPrice(channel.carPrice)} EUR</CarPrice>
          ) : null}
        </HeaderInfo>
        
        <HeaderActions>
          <ActionButton 
            title={locale === 'bg' ? 'Обаждане' : 'Call'}
            onClick={handlePhoneCall}
          >
            <Phone size={18} />
          </ActionButton>
          <ActionButton 
            title={locale === 'bg' ? 'Видео' : 'Video'}
            onClick={handleVideoCall}
          >
            <Video size={18} />
          </ActionButton>
          <ActionButton 
            title={locale === 'bg' ? 'Информация' : 'Info'}
            onClick={handleShowInfo}
          >
            <Info size={18} />
          </ActionButton>
          <ActionButton 
            title={locale === 'bg' ? 'Още' : 'More'}
            onClick={handleMoreOptions}
          >
            <MoreVertical size={18} />
          </ActionButton>
        </HeaderActions>
      </Header>
      
      {/* Messages */}
      <MessagesContainer ref={containerRef}>
        {messages.length === 0 && !isLoading ? (
          <EmptyState>
            <EmptyIcon>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </EmptyIcon>
            <EmptyTitle>
              {locale === 'bg' ? 'Започнете разговор' : 'Start a Conversation'}
            </EmptyTitle>
            <EmptyDescription>
              {locale === 'bg'
                ? `Изпратете първото съобщение до ${otherUserName || 'продавача'} относно ${channel.carTitle || 'този автомобил'}`
                : `Send the first message to ${otherUserName || 'the seller'} about ${channel.carTitle || 'this vehicle'}`}
            </EmptyDescription>
          </EmptyState>
        ) : (
          <>
            {Array.from(messageGroups.entries()).map(([dateKey, dateMessages]) => (
              <React.Fragment key={dateKey}>
                <DateDivider>
                  <DateText>{formatDate(dateMessages[0].timestamp, locale)}</DateText>
                </DateDivider>
                
                {dateMessages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwn={(message.senderNumericId || message.senderId) === currentUserNumericId}
                    onAcceptOffer={onAcceptOffer}
                    onRejectOffer={onRejectOffer}
                    onCounterOffer={onCounterOffer}
                  />
                ))}
              </React.Fragment>
            ))}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </MessagesContainer>
      {/* Input */}
      <InputSection>
        <MessageInput
          onSendMessage={handleSendMessage}
          onSendOffer={handleSendOffer}
          onSendImage={onSendImage ? handleSendImage : undefined}
          onTyping={startTyping}
          isTyping={isAnyoneTyping ? typingText : undefined}
          disabled={isLoading}
          placeholder={
            locale === 'bg'
              ? `Съобщение до ${otherUserName || 'продавача'}...`
              : `Message to ${otherUserName || 'seller'}...`
          }
        />
      </InputSection>
    </WindowContainer>
  );
};

export default ChatWindow;
