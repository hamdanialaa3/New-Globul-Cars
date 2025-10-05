// src/components/Messaging/ConversationList.tsx
// Conversation List Component - قائمة المحادثات
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import React from 'react';
import styled from 'styled-components';
import { MessageCircle, Circle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import type { Conversation } from '../../services/messaging';

// ==================== STYLED COMPONENTS ====================

const ListContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: white;
`;

const ConversationItem = styled.div<{ $active?: boolean; $unread?: boolean }>`
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  display: flex;
  gap: 12px;
  align-items: center;
  background: ${props => props.$active ? '#fff5e6' : 'white'};
  border-left: 3px solid ${props => 
    props.$active ? '#FF7900' : 
    props.$unread ? '#4caf50' : 'transparent'
  };
  transition: all 0.2s ease;
  
  &:hover {
    background: #f9f9f9;
  }
`;

const Avatar = styled.div<{ $online?: boolean }>`
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF7900, #ff8c1a);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.25rem;
  position: relative;
  flex-shrink: 0;
  
  ${props => props.$online && `
    &::after {
      content: '';
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 14px;
      height: 14px;
      background: #4caf50;
      border: 2px solid white;
      border-radius: 50%;
    }
  `}
`;

const ConversationInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ConversationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
`;

const UserName = styled.div<{ $unread?: boolean }>`
  font-size: 1rem;
  font-weight: ${props => props.$unread ? 700 : 600};
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Timestamp = styled.div`
  font-size: 0.75rem;
  color: #999;
  white-space: nowrap;
`;

const LastMessage = styled.div<{ $unread?: boolean }>`
  font-size: 0.875rem;
  color: ${props => props.$unread ? '#333' : '#666'};
  font-weight: ${props => props.$unread ? 600 : 400};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const UnreadBadge = styled.div`
  min-width: 24px;
  height: 24px;
  padding: 0 8px;
  background: #FF7900;
  color: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
`;

const EmptyState = styled.div`
  padding: 60px 20px;
  text-align: center;
  color: #999;
  
  svg {
    margin-bottom: 16px;
    opacity: 0.3;
  }
  
  p {
    margin: 8px 0 0 0;
    font-size: 0.95rem;
  }
`;

// ==================== COMPONENT ====================

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId?: string;
  currentUserId: string;
  onSelectConversation: (conversationId: string) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversationId,
  currentUserId,
  onSelectConversation
}) => {
  const { language } = useLanguage();

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return language === 'bg' ? 'Сега' : 'Now';
    if (minutes < 60) return `${minutes}${language === 'bg' ? 'м' : 'm'}`;
    if (hours < 24) return `${hours}${language === 'bg' ? 'ч' : 'h'}`;
    if (days < 7) return `${days}${language === 'bg' ? 'д' : 'd'}`;
    
    return new Intl.DateTimeFormat('bg-BG', {
      day: 'numeric',
      month: 'short'
    }).format(date);
  };

  const getInitials = (name: string = 'U'): string => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (conversations.length === 0) {
    return (
      <EmptyState>
        <MessageCircle size={64} />
        <p>
          {language === 'bg' 
            ? 'Все още нямате разговори'
            : 'No conversations yet'}
        </p>
      </EmptyState>
    );
  }

  return (
    <ListContainer>
      {conversations.map(conversation => {
        const unreadCount = conversation.unreadCount[currentUserId] || 0;
        const hasUnread = unreadCount > 0;

        return (
          <ConversationItem
            key={conversation.id}
            $active={conversation.id === activeConversationId}
            $unread={hasUnread}
            onClick={() => onSelectConversation(conversation.id)}
          >
            <Avatar $online={false}>
              {getInitials('User')}
            </Avatar>

            <ConversationInfo>
              <ConversationHeader>
                <UserName $unread={hasUnread}>
                  {language === 'bg' ? 'Потребител' : 'User'}
                </UserName>
                {conversation.lastMessage && (
                  <Timestamp>
                    {formatTime(conversation.lastMessage.timestamp)}
                  </Timestamp>
                )}
              </ConversationHeader>

              {conversation.lastMessage && (
                <LastMessage $unread={hasUnread}>
                  {conversation.lastMessage.text}
                </LastMessage>
              )}
            </ConversationInfo>

            {hasUnread && (
              <UnreadBadge>{unreadCount}</UnreadBadge>
            )}
          </ConversationItem>
        );
      })}
    </ListContainer>
  );
};

export default ConversationList;
