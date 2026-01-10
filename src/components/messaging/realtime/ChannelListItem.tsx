/**
 * 💬 ChannelListItem Component
 * مكون عنصر قائمة القنوات
 * 
 * @description Display a single conversation/channel in the list
 * عرض محادثة/قناة واحدة في القائمة
 * 
 * @author Claude Opus 4.5 - Chief Architect
 * @date January 8, 2026
 */

import React from 'react';
import styledBase from 'styled-components';
import { Link } from 'react-router-dom';
import { Check, CheckCheck } from 'lucide-react';

import { RealtimeChannel } from '../../../services/messaging/realtime';
import { useUserPresence } from '../../../hooks/messaging';
import { useLanguage } from '../../../contexts/LanguageContext';

// Alias for styled-components
const styled = styledBase;

// ==================== STYLED COMPONENTS ====================

const ChannelItem = styled(Link)<{ $isActive?: boolean; $hasUnread?: boolean }>`
  display: flex;
  gap: 12px;
  padding: 16px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  /* Glassmorphism Effect */
  background: ${({ $isActive }) =>
    $isActive
      ? 'rgba(59, 130, 246, 0.15)'
      : 'rgba(255, 255, 255, 0.02)'};
  
  ${({ $hasUnread }) =>
    $hasUnread &&
    `
    background: rgba(59, 130, 246, 0.08);
    border-left: 3px solid #3B82F6;
  `}
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }
`;

const AvatarContainer = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const Avatar = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  background: rgba(255, 255, 255, 0.1);
`;

const DefaultAvatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3B82F6, #8B5CF6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 18px;
`;

const OnlineIndicator = styled.div<{ $isOnline: boolean }>`
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #1a1a2e;
  background: ${({ $isOnline }) => ($isOnline ? '#22C55E' : '#6B7280')};
`;

const Content = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const UserName = styled.span`
  font-weight: 600;
  font-size: 15px;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TimeStamp = styled.span`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  flex-shrink: 0;
`;

const MiddleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const LastMessage = styled.span<{ $isUnread?: boolean }>`
  font-size: 13px;
  color: ${({ $isUnread }) =>
    $isUnread ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.5)'};
  font-weight: ${({ $isUnread }) => ($isUnread ? '500' : '400')};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
`;

const MessageStatus = styled.span<{ $isRead: boolean }>`
  color: ${({ $isRead }) => ($isRead ? '#3B82F6' : 'rgba(255, 255, 255, 0.4)')};
  flex-shrink: 0;
`;

const BottomRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CarThumbnail = styled.img`
  width: 40px;
  height: 30px;
  border-radius: 4px;
  object-fit: cover;
  background: rgba(255, 255, 255, 0.1);
`;

const CarInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
`;

const CarTitle = styled.span`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CarPrice = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #22C55E;
`;

const UnreadBadge = styled.span`
  background: #3B82F6;
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  flex-shrink: 0;
`;

const TypingIndicator = styled.span`
  font-size: 12px;
  color: #3B82F6;
  font-style: italic;
  animation: pulse 1.5s infinite;
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

// ==================== HELPER FUNCTIONS ====================

const formatTimeAgo = (timestamp: number, locale: 'bg' | 'en'): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return locale === 'bg' ? 'сега' : 'now';
  if (minutes < 60) return `${minutes}${locale === 'bg' ? 'м' : 'm'}`;
  if (hours < 24) return `${hours}${locale === 'bg' ? 'ч' : 'h'}`;
  if (days < 7) return `${days}${locale === 'bg' ? 'д' : 'd'}`;
  
  return new Date(timestamp).toLocaleDateString(locale === 'bg' ? 'bg-BG' : 'en-US', {
    day: 'numeric',
    month: 'short',
  });
};

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(price);
};

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// ==================== COMPONENT ====================

interface ChannelListItemProps {
  channel: RealtimeChannel;
  currentUserNumericId: number;
  isActive?: boolean;
  isTyping?: boolean;
  onClick?: () => void;
}

export const ChannelListItem: React.FC<ChannelListItemProps> = ({
  channel,
  currentUserNumericId,
  isActive = false,
  isTyping = false,
  onClick,
}) => {
  const { language } = useLanguage();
  const locale = language === 'bg' ? 'bg' : 'en';
  
  // Determine the other participant
  const isBuyer = channel.buyerNumericId === currentUserNumericId;
  const otherUserName = isBuyer ? channel.sellerName : channel.buyerName;
  const otherUserAvatar = isBuyer ? channel.sellerAvatar : channel.buyerAvatar;
  const otherUserNumericId = isBuyer ? channel.sellerNumericId : channel.buyerNumericId;
  
  // Get presence for the other user
  const { isOnline } = useUserPresence(otherUserNumericId);
  
  // Unread count for current user
  const unreadCount = channel.unreadCount?.[currentUserNumericId] || 0;
  const hasUnread = unreadCount > 0;
  
  // Last message info
  const lastMessage = channel.lastMessage;
  const isOwnMessage = lastMessage?.senderId === currentUserNumericId;
  
  return (
    <ChannelItem
      to={`/messages?channel=${channel.id}`}
      $isActive={isActive}
      $hasUnread={hasUnread}
      onClick={onClick}
    >
      {/* Avatar with online indicator */}
      <AvatarContainer>
        {otherUserAvatar ? (
          <Avatar src={otherUserAvatar} alt={otherUserName} />
        ) : (
          <DefaultAvatar>{getInitials(otherUserName)}</DefaultAvatar>
        )}
        <OnlineIndicator $isOnline={isOnline} />
      </AvatarContainer>
      
      {/* Content */}
      <Content>
        {/* Top row: Name + Time */}
        <TopRow>
          <UserName>{otherUserName}</UserName>
          {lastMessage && (
            <TimeStamp>{formatTimeAgo(lastMessage.timestamp, locale)}</TimeStamp>
          )}
        </TopRow>
        
        {/* Middle row: Last message */}
        <MiddleRow>
          {isOwnMessage && (
            <MessageStatus $isRead={!hasUnread}>
              {hasUnread ? <Check size={14} /> : <CheckCheck size={14} />}
            </MessageStatus>
          )}
          
          {isTyping ? (
            <TypingIndicator>
              {locale === 'bg' ? 'пише...' : 'typing...'}
            </TypingIndicator>
          ) : lastMessage ? (
            <LastMessage $isUnread={hasUnread}>
              {lastMessage.type === 'offer'
                ? `💰 ${locale === 'bg' ? 'Ценово предложение' : 'Price offer'}`
                : lastMessage.type === 'image'
                ? `📷 ${locale === 'bg' ? 'Снимка' : 'Photo'}`
                : lastMessage.content}
            </LastMessage>
          ) : (
            <LastMessage>
              {locale === 'bg' ? 'Няма съобщения' : 'No messages'}
            </LastMessage>
          )}
          
          {hasUnread && <UnreadBadge>{unreadCount > 99 ? '99+' : unreadCount}</UnreadBadge>}
        </MiddleRow>
        
        {/* Bottom row: Car info */}
        <BottomRow>
          {channel.carImage && (
            <CarThumbnail src={channel.carImage} alt={channel.carTitle} />
          )}
          <CarInfo>
            <CarTitle>{channel.carTitle}</CarTitle>
            <CarPrice>{formatPrice(channel.carPrice)}</CarPrice>
          </CarInfo>
        </BottomRow>
      </Content>
    </ChannelItem>
  );
};

export default ChannelListItem;
