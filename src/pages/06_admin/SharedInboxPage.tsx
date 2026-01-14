import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../contexts/LanguageContext';
// ❌ DEPRECATED: advanced-messaging-service moved to DDD/deprecated-services/
// Use useRealtimeMessaging hook instead
// import { messagingService } from '../../services/messaging/advanced-messaging-service';
import { Conversation } from '../../services/messaging/advanced-messaging-types';
import { useAuth } from '../../contexts/AuthContext';
import { Loader, MessageSquare, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { logger } from '../../services/logger-service';

const Container = styled.div`
  padding: 40px;
  max-width: 1000px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #1e293b;
  margin: 0;
`;

const InboxList = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const InboxItem = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background 0.2s;
  cursor: pointer;

  &:hover {
    background: #f8fafc;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const MessageInfo = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
`;

const Avatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #eff6ff;
  color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Content = styled.div``;

const SenderName = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px 0;
`;

const LastMessage = styled.p`
  color: #64748b;
  font-size: 0.9rem;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Meta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  min-width: 100px;
`;

const Time = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  color: #94a3b8;
`;

const UnreadBadge = styled.span`
  background: #ef4444;
  color: white;
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 600;
`;

const SharedInboxPage: React.FC = () => {
  const { language } = useLanguage();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const isBg = language === 'bg';

  useEffect(() => {
    if (!currentUser) return;

    const fetchMessages = async () => {
      try {
        const data = await messagingService.getUserConversations(currentUser.uid);
        setConversations(data.sort((a, b) =>
          (b.lastMessageAt?.seconds || 0) - (a.lastMessageAt?.seconds || 0)
        ));
      } catch (error) {
        logger.error('Failed to fetch conversations', error as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [currentUser]);

  if (loading) {
    return (
      <Container>
        <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}>
          <Loader className="animate-spin" color="#3b82f6" />
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <div>
          <Title>{isBg ? 'Всички Съобщения' : 'All Messages'}</Title>
          <p style={{ color: '#64748b', marginTop: '8px' }}>
            {isBg ? 'Управлявайте комуникацията с клиенти' : 'Manage communication with clients'}
          </p>
        </div>
      </Header>

      <InboxList>
        {conversations.length > 0 ? (
          conversations.map((conv) => (
            <InboxItem key={conv.id} onClick={() => navigate(`/messages/${conv.id}`)}>
              <MessageInfo>
                <Avatar>
                  <MessageSquare size={24} />
                </Avatar>
                <Content>
                  <SenderName>
                    {/* TODO: Fetch other participant name ideally */}
                    {isBg ? 'Разговор' : 'Conversation'} #{conv.id.substring(0, 6)}
                  </SenderName>
                  <LastMessage>{conv.lastMessage?.text || (isBg ? 'Няма съобщения' : 'No messages')}</LastMessage>
                </Content>
              </MessageInfo>
              <Meta>
                <Time>
                  <Clock size={12} />
                  {conv.lastMessageAt ? new Date(conv.lastMessageAt.seconds * 1000).toLocaleDateString() : ''}
                </Time>
                {(conv.unreadCount?.[currentUser?.uid || ''] || 0) > 0 && (
                  <UnreadBadge>{conv.unreadCount[currentUser?.uid || '']}</UnreadBadge>
                )}
              </Meta>
            </InboxItem>
          ))
        ) : (
          <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
            <MessageSquare size={48} color="#e2e8f0" style={{ marginBottom: '16px' }} />
            <h3>{isBg ? 'Нямате съобщения' : 'No messages yet'}</h3>
            <p>{isBg ? 'Всички нови разговори ще се покажат тук.' : 'All new conversations will appear here.'}</p>
          </div>
        )}
      </InboxList>
    </Container>
  );
};

export default SharedInboxPage;
