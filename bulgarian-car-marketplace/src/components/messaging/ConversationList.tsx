/**
 * Conversation List Component
 * Displays list of all conversations for the current user
 * Location: Bulgaria | Languages: BG, EN | Currency: EUR
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthProvider';
import { useLanguage } from '../../contexts/LanguageContext';
import messagingService, { ConversationWithUser } from '../../services/messaging/messaging.service';
import { formatDistanceToNow } from 'date-fns';
import { bg } from 'date-fns/locale/bg';
import { enUS } from 'date-fns/locale/en-US';

const Container = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: #f8f9fa;
`;

const ConversationItem = styled.div<{ $active: boolean; $unread: boolean }>`
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  cursor: pointer;
  background: ${props => props.$active ? '#fff' : 'transparent'};
  border-left: 4px solid ${props => props.$unread ? '#FF7900' : 'transparent'};
  transition: all 0.2s ease;
  
  &:hover {
    background: #fff;
  }
`;

const Avatar = styled.div<{ $imageUrl?: string }>`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${props => props.$imageUrl 
    ? `url(${props.$imageUrl}) center/cover` 
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  };
  margin-right: 12px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 18px;
`;

const ConversationInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
`;

const UserName = styled.div<{ $unread: boolean }>`
  font-weight: ${props => props.$unread ? '600' : '500'};
  font-size: 15px;
  color: #1a1a1a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Timestamp = styled.div`
  font-size: 12px;
  color: #666;
  white-space: nowrap;
`;

const LastMessage = styled.div<{ $unread: boolean }>`
  font-size: 14px;
  color: ${props => props.$unread ? '#1a1a1a' : '#666'};
  font-weight: ${props => props.$unread ? '500' : '400'};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UnreadBadge = styled.div`
  background: #FF7900;
  color: white;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 600;
  margin-left: 8px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  padding: 40px 20px;
  text-align: center;
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
`;

interface ConversationListProps {
  activeConversationId?: string;
  onConversationSelect: (conversationId: string) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  activeConversationId,
  onConversationSelect
}) => {
  const { currentUser } = useAuth();
  const { language } = useLanguage();
  const [conversations, setConversations] = useState<ConversationWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);

    const unsubscribe = messagingService.subscribeToConversations(
      currentUser.uid,
      (updatedConversations) => {
        setConversations(updatedConversations);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const formatTime = (timestamp: any): string => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const locale = language === 'bg' ? bg : enUS;
    
    return formatDistanceToNow(date, { 
      addSuffix: true,
      locale
    });
  };

  if (loading) {
    return (
      <Container>
        <LoadingState>
          {language === 'bg' ? 'Зареждане...' : 'Loading...'}
        </LoadingState>
      </Container>
    );
  }

  if (conversations.length === 0) {
    return (
      <Container>
        <EmptyState>
          <h3>
            {language === 'bg' 
              ? 'Няма съобщения' 
              : 'No messages'
            }
          </h3>
          <p>
            {language === 'bg'
              ? 'Изпратете съобщение на продавач, за да започнете разговор'
              : 'Send a message to a seller to start a conversation'
            }
          </p>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      {conversations.map(({ conversation, otherUser }) => {
        const unreadCount = currentUser 
          ? conversation.unreadCount[currentUser.uid] || 0 
          : 0;
        const isUnread = unreadCount > 0;
        const isActive = conversation.id === activeConversationId;

        return (
          <ConversationItem
            key={conversation.id}
            $active={isActive}
            $unread={isUnread}
            onClick={() => onConversationSelect(conversation.id)}
          >
            <Avatar $imageUrl={otherUser.photoURL}>
              {!otherUser.photoURL && getInitials(otherUser.displayName)}
            </Avatar>
            
            <ConversationInfo>
              <TopRow>
                <UserName $unread={isUnread}>
                  {otherUser.displayName}
                </UserName>
                <Timestamp>
                  {formatTime(conversation.lastMessage?.timestamp)}
                </Timestamp>
              </TopRow>
              
              <LastMessage $unread={isUnread}>
                {conversation.lastMessage?.text || 
                  (language === 'bg' ? 'Няма съобщения' : 'No messages')
                }
              </LastMessage>
            </ConversationInfo>
            
            {isUnread && <UnreadBadge>{unreadCount}</UnreadBadge>}
          </ConversationItem>
        );
      })}
    </Container>
  );
};

export default ConversationList;

