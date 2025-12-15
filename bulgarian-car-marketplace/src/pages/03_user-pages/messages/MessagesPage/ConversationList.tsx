/**
 * ConversationList - List of user conversations
 * Location: Bulgaria | Languages: BG/EN | Currency: EUR
 */

import React from 'react';
import styled from 'styled-components';
import { ChatRoom } from '../../../../services/realtimeMessaging';
import { formatDistanceToNow } from 'date-fns';
import { bg, enUS } from 'date-fns/locale';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { Check, CheckCheck } from 'lucide-react';

// ==================== STYLED COMPONENTS ====================

const Container = styled.div`
  flex: 1;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f3f5;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #dee2e6;
    border-radius: 3px;
    
    &:hover {
      background: #adb5bd;
    }
  }
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    &::-webkit-scrollbar-track {
      background: #1e293b;
    }
    
    &::-webkit-scrollbar-thumb {
      background: #475569;
      
      &:hover {
        background: #64748b;
      }
    }
  }
  
  /* Light Mode Support */
  html[data-theme="light"] & {
    &::-webkit-scrollbar-track {
      background: #f1f3f5;
    }
    
    &::-webkit-scrollbar-thumb {
      background: #dee2e6;
      
      &:hover {
        background: #adb5bd;
      }
    }
  }
`;

const ConversationItem = styled.div<{ $isSelected?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  cursor: pointer;
  background: ${p => p.$isSelected ? 'rgba(255, 121, 0, 0.08)' : 'white'};
  border-left: 3px solid ${p => p.$isSelected ? '#FF7900' : 'transparent'};
  transition: all 0.2s;
  
  &:hover {
    background: ${p => p.$isSelected ? 'rgba(255, 121, 0, 0.08)' : '#f8f9fa'};
  }
  
  & + & {
    border-top: 1px solid #f1f3f5;
  }
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    background: ${p => p.$isSelected ? 'rgba(255, 121, 0, 0.15)' : '#1e293b'};
    
    &:hover {
      background: ${p => p.$isSelected ? 'rgba(255, 121, 0, 0.15)' : '#334155'};
    }
    
    & + & {
      border-top-color: rgba(148, 163, 184, 0.1);
    }
  }
  
  /* Light Mode Support */
  html[data-theme="light"] & {
    background: ${p => p.$isSelected ? 'rgba(255, 121, 0, 0.08)' : 'white'};
    
    &:hover {
      background: ${p => p.$isSelected ? 'rgba(255, 121, 0, 0.08)' : '#f8f9fa'};
    }
    
    & + & {
      border-top-color: #f1f3f5;
    }
  }
`;

const Avatar = styled.img`
  width: 52px;
  height: 52px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #dee2e6;
  flex-shrink: 0;
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    border-color: rgba(148, 163, 184, 0.3);
  }
  
  /* Light Mode Support */
  html[data-theme="light"] & {
    border-color: #dee2e6;
  }
`;

const Content = styled.div`
  flex: 1;
  min-width: 0;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
`;

const Name = styled.div`
  font-weight: 700;
  color: #212529;
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    color: #e2e8f0;
  }
  
  /* Light Mode Support */
  html[data-theme="light"] & {
    color: #212529;
  }
`;

const Time = styled.div`
  font-size: 0.75rem;
  color: #6c757d;
  white-space: nowrap;
  margin-left: 8px;
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    color: #94a3b8;
  }
  
  /* Light Mode Support */
  html[data-theme="light"] & {
    color: #6c757d;
  }
`;

const MessagePreview = styled.div<{ $hasUnread?: boolean }>`
  font-size: 0.9rem;
  color: ${p => p.$hasUnread ? '#212529' : '#6c757d'};
  font-weight: ${p => p.$hasUnread ? 600 : 400};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 6px;
  
  svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    color: ${p => p.$hasUnread ? '#e2e8f0' : '#94a3b8'};
  }
  
  /* Light Mode Support */
  html[data-theme="light"] & {
    color: ${p => p.$hasUnread ? '#212529' : '#6c757d'};
  }
`;

const UnreadBadge = styled.div`
  min-width: 24px;
  height: 24px;
  border-radius: 12px;
  background: #FF7900;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  flex-shrink: 0;
`;

const OnlineIndicator = styled.div<{ $isOnline?: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${p => p.$isOnline ? '#22c55e' : '#6c757d'};
  border: 2px solid white;
  position: absolute;
  bottom: 2px;
  right: 2px;
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    border-color: #1e293b;
    background: ${p => p.$isOnline ? '#22c55e' : '#64748b'};
  }
  
  /* Light Mode Support */
  html[data-theme="light"] & {
    border-color: white;
    background: ${p => p.$isOnline ? '#22c55e' : '#6c757d'};
  }
`;

const AvatarContainer = styled.div`
  position: relative;
`;

// ==================== INTERFACES ====================

interface ConversationListProps {
  conversations: ChatRoom[];
  selectedId?: string;
  onSelect: (conversation: ChatRoom) => void;
  currentUserId: string;
  recipientImages?: { [userId: string]: string };
}

// ==================== COMPONENT ====================

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedId,
  onSelect,
  currentUserId,
  recipientImages = {}
}) => {
  const { language } = useLanguage();
  
  const formatTime = (date: Date) => {
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: language === 'bg' ? bg : enUS
    });
  };
  
  const getUnreadCount = (conversation: ChatRoom, userId: string) => {
    return conversation.unreadCount?.[userId] || 0;
  };
  
  const getRecipientInfo = (conversation: ChatRoom) => {
    const recipientId = conversation.participants.find(id => id !== currentUserId) || conversation.participants[0];
    const recipientName = conversation.participantNames?.[recipientId] || 'Unknown';
    const recipientImage = recipientImages[recipientId] || '/assets/default-avatar.png';
    return { recipientId, recipientName, recipientImage };
  };
  
  const renderMessagePreview = (conversation: ChatRoom) => {
    const lastMessage = conversation.lastMessage;
    
    if (!lastMessage) {
      return <span>{language === 'bg' ? 'Все още няма съобщения' : 'No messages yet'}</span>;
    }
    
    let icon = null;
    // ✅ FIX: Check if current user is sender
    if (lastMessage.senderId === currentUserId) {
      icon = lastMessage.isRead ? <CheckCheck /> : <Check />;
    }
    
    let content = lastMessage.content || lastMessage.text || '';
    if (lastMessage.type === 'image' || lastMessage.messageType === 'image') {
      content = language === 'bg' ? 'Изображение' : 'Image';
    } else if (lastMessage.type === 'file') {
      content = language === 'bg' ? 'Файл' : 'File';
    } else if (lastMessage.type === 'voice') {
      content = language === 'bg' ? 'Гласово съобщение' : 'Voice message';
    } else if (lastMessage.type === 'system' || lastMessage.messageType === 'system') {
      content = content.substring(0, 50); // Truncate system messages
    }
    
    return (
      <>
        {icon}
        <span>{content}</span>
      </>
    );
  };
  
  return (
    <Container>
      {conversations.map(conversation => {
        const isSelected = conversation.id === selectedId;
        const unreadCount = getUnreadCount(conversation, currentUserId);
        const hasUnread = unreadCount > 0;
        
        // ✅ FIX: Get recipient info correctly
        const { recipientId, recipientName, recipientImage } = getRecipientInfo(conversation);
        
        return (
          <ConversationItem
            key={conversation.id}
            $isSelected={isSelected}
            onClick={() => onSelect(conversation)}
          >
            <AvatarContainer>
              <Avatar
                src={recipientImage}
                alt={recipientName}
                onError={(e) => {
                  // Fallback to default avatar on error
                  (e.target as HTMLImageElement).src = '/assets/default-avatar.png';
                }}
              />
              <OnlineIndicator $isOnline={false} />
            </AvatarContainer>
            
            <Content>
              <Header>
                <Name>{recipientName}</Name>
                {conversation.lastMessage && (
                  <Time>{formatTime(conversation.lastMessage.createdAt)}</Time>
                )}
              </Header>
              
              <MessagePreview $hasUnread={hasUnread}>
                {renderMessagePreview(conversation)}
              </MessagePreview>
            </Content>
            
            {hasUnread && (
              <UnreadBadge>{unreadCount}</UnreadBadge>
            )}
          </ConversationItem>
        );
      })}
    </Container>
  );
};

export default ConversationList;
