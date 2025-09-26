import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../context/AuthProvider';
import { messagingService, Conversation } from '../../services/messagingService';

// Styled Components
const ConversationsContainer = styled.div`
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 1.5rem;
  height: 100%;
  overflow-y: auto;
`;

const ConversationsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Title = styled.h3`
  font-size: 1.4rem;
  font-weight: 600;
  color: #00D4FF;
  margin: 0;
  text-shadow: 0 2px 8px rgba(0, 212, 255, 0.3);
`;

const NewMessageButton = styled.button`
  background: linear-gradient(135deg, #00D4FF, #0099CC);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  box-shadow: 0 4px 15px rgba(0, 212, 255, 0.2);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 212, 255, 0.4);
  }
`;

const ConversationItem = styled.div<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: ${props => props.$isActive ? 'rgba(0, 212, 255, 0.1)' : 'rgba(0, 0, 0, 0.4)'};
  border: 1px solid ${props => props.$isActive ? 'rgba(0, 212, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 12px;
  margin-bottom: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    background: rgba(0, 212, 255, 0.05);
    transform: translateX(5px);
    border-color: rgba(0, 212, 255, 0.2);
  }
`;

const Avatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00D4FF, #0099CC);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
  box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);
`;

const ConversationInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ParticipantName = styled.div`
  font-weight: 600;
  color: white;
  margin-bottom: 0.25rem;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
`;

const CarTitle = styled.div`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LastMessage = styled.div`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ConversationMeta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
`;

const Time = styled.div`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
`;

const UnreadBadge = styled.div`
  background: #FF4444;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(255, 68, 68, 0.3);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: rgba(255, 255, 255, 0.6);
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.6);
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

  useEffect(() => {
    if (!user?.uid) return;

    const loadConversations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const userConversations = await messagingService.getUserConversations(user.uid);
        setConversations(userConversations);
      } catch (err) {
        console.error('Error loading conversations:', err);
        setError('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    loadConversations();

    // Subscribe to real-time updates
    const unsubscribe = messagingService.subscribeToUserConversations(
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

  if (loading) {
    return (
      <ConversationsContainer>
        <LoadingState>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          {t('common.loading')}
        </LoadingState>
      </ConversationsContainer>
    );
  }

  if (error) {
    return (
      <ConversationsContainer>
        <div style={{ textAlign: 'center', padding: '2rem', color: '#FF4444' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>❌</div>
          {error}
        </div>
      </ConversationsContainer>
    );
  }

  return (
    <ConversationsContainer>
      <ConversationsHeader>
        <Title>{t('messaging.conversations')}</Title>
        <NewMessageButton>
          ✉️ {t('messaging.newMessage')}
        </NewMessageButton>
      </ConversationsHeader>

      {conversations.length === 0 ? (
        <EmptyState>
          <EmptyIcon>💬</EmptyIcon>
          <div>{t('messaging.noConversations')}</div>
        </EmptyState>
      ) : (
        conversations.map(conversation => (
          <ConversationItem
            key={conversation.id}
            $isActive={selectedConversationId === conversation.id}
            onClick={() => onConversationSelect(conversation)}
          >
            <Avatar>
              {conversation.otherParticipant.avatar ? (
                <img
                  src={conversation.otherParticipant.avatar}
                  alt={conversation.otherParticipant.name}
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                getInitials(conversation.otherParticipant.name)
              )}
            </Avatar>
            
            <ConversationInfo>
              <ParticipantName>{conversation.otherParticipant.name}</ParticipantName>
              <CarTitle>{conversation.carTitle}</CarTitle>
              {conversation.lastMessage && (
                <LastMessage>{conversation.lastMessage.text}</LastMessage>
              )}
            </ConversationInfo>
            
            <ConversationMeta>
              {conversation.lastMessageTime && (
                <Time>{formatTime(conversation.lastMessageTime)}</Time>
              )}
              {conversation.unreadCount > 0 && (
                <UnreadBadge>{conversation.unreadCount}</UnreadBadge>
              )}
            </ConversationMeta>
          </ConversationItem>
        ))
      )}
    </ConversationsContainer>
  );
};

export default ConversationsList;

