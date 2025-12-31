import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { logger } from '../../services/logger-service';
import styled from 'styled-components';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../contexts/AuthProvider';
import { advancedMessagingService, Conversation } from '../../services/messaging/advanced-messaging-service';

// Facebook Messenger Style Components
const ConversationsContainer = styled.div`
  background: white;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ConversationsHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid #e4e6ea;
  background: white;
`;

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 12px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 12px 8px 36px;
  border: 1px solid #e4e6ea;
  border-radius: 20px;
  font-size: 14px;
  background: #f0f2f5;
  outline: none;
  transition: all 0.2s;

  &:focus {
    background: white;
    border-color: #4267B2;
  }

  &::placeholder {
    color: #65676b;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #65676b;
  font-size: 16px;
`;

const FilterTabs = styled.div`
  display: flex;
  gap: 8px;
`;

const FilterTab = styled.button<{ $active?: boolean }>`
  padding: 6px 12px;
  border: none;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.$active ? '#4267B2' : '#f0f2f5'};
  color: ${props => props.$active ? 'white' : '#65676b'};

  &:hover {
    background: ${props => props.$active ? '#365899' : '#e4e6ea'};
  }
`;

const ConversationsListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  background: white;
`;

const ConversationItem = styled.div<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  background: ${props => props.$isActive ? '#f0f2f5' : 'white'};
  border-left: 3px solid ${props => props.$isActive ? '#4267B2' : 'transparent'};

  &:hover {
    background: #f0f2f5;
  }
`;

const Avatar = styled.div<{ $online?: boolean }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #4267B2;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 16px;
  position: relative;
  margin-right: 12px;

  ${props => props.$online && `
    &::after {
      content: '';
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 12px;
      height: 12px;
      background: #42b883;
      border: 2px solid white;
      border-radius: 50%;
    }
  `}
`;

const ConversationInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ParticipantName = styled.div`
  font-weight: 600;
  color: #1c1e21;
  font-size: 15px;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CarTitle = styled.div`
  font-size: 13px;
  color: #65676b;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LastMessage = styled.div`
  font-size: 13px;
  color: #65676b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ConversationMeta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  min-width: 60px;
`;

const Time = styled.div`
  font-size: 12px;
  color: #65676b;
`;

const UnreadBadge = styled.div`
  background: #4267B2;
  color: white;
  border-radius: 50%;
  min-width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  padding: 0 6px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #65676b;
  text-align: center;
  padding: 20px;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
`;

const EmptyTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #1c1e21;
`;

const EmptyDescription = styled.p`
  font-size: 14px;
  margin: 0;
  color: #65676b;
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #65676b;
  font-size: 14px;
`;

interface ConversationsListProps {
  onConversationSelect: (conversation: Conversation) => void;
  selectedConversationId?: string;
}

const ConversationsList: React.FC<ConversationsListProps> = ({
  onConversationSelect,
  selectedConversationId
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    if (!user?.uid) return;

    const loadConversations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const userConversations = await advancedMessagingService.getUserConversations(user.uid);
        setConversations(userConversations);
      } catch (err) {
        logger.error('Error loading conversations', err as Error, { userId: user?.uid });
        setError('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    loadConversations();

    // Subscribe to real-time updates
    const unsubscribe = advancedMessagingService.subscribeToUserConversations(
      user.uid,
      setConversations
    );

    return () => {
      unsubscribe();
    };
  }, [user?.uid]);

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return t('dashboard.timeAgo.justNow');
    if (diffInHours < 24) return t('dashboard.timeAgo.hoursAgo').replace('{{count}}', diffInHours.toString());
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return t('dashboard.timeAgo.dayAgo');
    return t('dashboard.timeAgo.daysAgo').replace('{{count}}', diffInDays.toString());
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const filteredConversations = conversations.filter(conversation => {
    const matchesSearch = conversation.otherParticipant?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conversation.carTitle?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === 'unread') {
      const hasUnread = conversation.unreadCount && Object.values(conversation.unreadCount).some(count => count > 0);
      return matchesSearch && hasUnread;
    }
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <ConversationsContainer>
        <ConversationsHeader>
          <SearchContainer>
            <SearchInput placeholder={t('messaging.searchMessages')} disabled />
            <SearchIcon>🔍</SearchIcon>
          </SearchContainer>
        </ConversationsHeader>
        <LoadingState>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
          {t('common.loading')}
        </LoadingState>
      </ConversationsContainer>
    );
  }

  if (error) {
    return (
      <ConversationsContainer>
        <ConversationsHeader>
          <SearchContainer>
            <SearchInput placeholder={t('messaging.searchMessages')} disabled />
            <SearchIcon>🔍</SearchIcon>
          </SearchContainer>
        </ConversationsHeader>
        <div style={{ textAlign: 'center', padding: '2rem', color: '#FF4444' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>❌</div>
          {error}
        </div>
      </ConversationsContainer>
    );
  }

  return (
    <ConversationsContainer>
      <ConversationsHeader>
        <SearchContainer>
          <SearchInput 
            placeholder={t('messaging.searchMessages')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <SearchIcon>🔍</SearchIcon>
        </SearchContainer>
        <FilterTabs>
          <FilterTab 
            $active={activeFilter === 'all'}
            onClick={() => setActiveFilter('all')}
          >
            {t('messaging.all')}
          </FilterTab>
          <FilterTab 
            $active={activeFilter === 'unread'}
            onClick={() => setActiveFilter('unread')}
          >
            {t('messaging.unread')}
          </FilterTab>
        </FilterTabs>
      </ConversationsHeader>

      <ConversationsListContainer>
        {filteredConversations.length === 0 ? (
          <EmptyState>
            <EmptyIcon>💬</EmptyIcon>
            <EmptyTitle>{t('messaging.noConversations')}</EmptyTitle>
            <EmptyDescription>
              {searchQuery ? t('messaging.noSearchResults') : t('messaging.noConversationsDescription')}
            </EmptyDescription>
          </EmptyState>
        ) : (
          filteredConversations.map(conversation => (
            <ConversationItem
              key={conversation.id}
              $isActive={selectedConversationId === conversation.id}
              onClick={() => onConversationSelect(conversation)}
            >
              <Avatar $online={Math.random() > 0.5}>
                {conversation.otherParticipant?.avatar ? (
                  <img
                    src={conversation.otherParticipant.avatar}
                    alt={conversation.otherParticipant.name}
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  getInitials(conversation.otherParticipant?.name || 'Unknown')
                )}
              </Avatar>
              
              <ConversationInfo>
                <ParticipantName>{conversation.otherParticipant?.name || 'Unknown'}</ParticipantName>
                <CarTitle>{conversation.carTitle}</CarTitle>
                {conversation.lastMessage && (
                  <LastMessage>
                    {conversation.lastMessage.text}
                    {conversation.lastMessage.senderId === user?.uid && ' ✓'}
                  </LastMessage>
                )}
              </ConversationInfo>
              
              <ConversationMeta>
                {conversation.lastMessageAt && (
                  <Time>{formatTime(conversation.lastMessageAt)}</Time>
                )}
                {conversation.unreadCount && Object.values(conversation.unreadCount).some(count => count > 0) && (
                  <UnreadBadge>
                    {Object.values(conversation.unreadCount).reduce((sum, count) => sum + count, 0)}
                  </UnreadBadge>
                )}
              </ConversationMeta>
            </ConversationItem>
          ))
        )}
      </ConversationsListContainer>
    </ConversationsContainer>
  );
};

export default ConversationsList;

