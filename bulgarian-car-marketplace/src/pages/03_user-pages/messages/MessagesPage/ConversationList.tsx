/**
 * ConversationList - List of user conversations
 * Location: Bulgaria | Languages: BG/EN | Currency: EUR
 */

import React from 'react';
import styled from 'styled-components';
import { ChatRoom } from '@/services/realtimeMessaging';
import { formatDistanceToNow } from 'date-fns';
import { bg, enUS } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';
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
`;

const Avatar = styled.img`
  width: 52px;
  height: 52px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #dee2e6;
  flex-shrink: 0;
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
`;

const Time = styled.div`
  font-size: 0.75rem;
  color: #6c757d;
  white-space: nowrap;
  margin-left: 8px;
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
`;

const AvatarContainer = styled.div`
  position: relative;
`;

// ==================== INTERFACES ====================

interface ConversationListProps {
  conversations: ChatRoom[];
  selectedId?: string;
  onSelect: (conversation: ChatRoom) => void;
}

// ==================== COMPONENT ====================

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedId,
  onSelect
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
  
  const renderMessagePreview = (conversation: ChatRoom) => {
    const lastMessage = conversation.lastMessage;
    
    if (!lastMessage) {
      return <span>No messages yet</span>;
    }
    
    let icon = null;
    if (lastMessage.senderId === conversation.participants[0]) {
      icon = lastMessage.isRead ? <CheckCheck /> : <Check />;
    }
    
    let content = lastMessage.content;
    if (lastMessage.type === 'image') {
      content = 'Image';
    } else if (lastMessage.type === 'file') {
      content = 'File';
    } else if (lastMessage.type === 'voice') {
      content = 'Voice message';
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
        const unreadCount = getUnreadCount(conversation, conversation.participants[0]);
        const hasUnread = unreadCount > 0;
        
        // Get recipient info (for now, just use first participant)
        const recipientId = conversation.participants[1] || conversation.participants[0];
        const recipientName = conversation.participantNames?.[recipientId] || 'Unknown';
        
        return (
          <ConversationItem
            key={conversation.id}
            $isSelected={isSelected}
            onClick={() => onSelect(conversation)}
          >
            <AvatarContainer>
              <Avatar
                src={`/assets/default-avatar.png`}
                alt={recipientName}
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
