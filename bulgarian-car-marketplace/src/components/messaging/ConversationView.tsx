import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../contexts/AuthProvider';
import { advancedMessagingService, Message, Conversation } from '../../services/messaging/advanced-messaging-service';

// Facebook Messenger Style Components
const ConversationContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f0f2f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
`;

const ConversationHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #e4e6ea;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #4267B2;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;

  &:hover {
    background: #f0f2f5;
  }

  @media (min-width: 769px) {
    display: none;
  }
`;

const Avatar = styled.div<{ $online?: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #4267B2;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
  position: relative;

  ${props => props.$online && `
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      right: 0;
      width: 12px;
      height: 12px;
      background: #42b883;
      border: 2px solid white;
      border-radius: 50%;
    }
  `}
`;

const HeaderInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ParticipantName = styled.div`
  font-weight: 600;
  color: #1c1e21;
  font-size: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CarTitle = styled.div`
  font-size: 13px;
  color: #65676b;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const HeaderActionButton = styled.button`
  background: none;
  border: none;
  color: #65676b;
  font-size: 18px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.2s;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #f0f2f5;
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #f0f2f5;
`;

const MessageBubble = styled.div<{ $isOwn: boolean }>`
  display: flex;
  justify-content: ${props => props.$isOwn ? 'flex-end' : 'flex-start'};
  margin-bottom: 4px;
`;

const MessageContent = styled.div<{ $isOwn: boolean }>`
  max-width: 70%;
  padding: 8px 12px;
  border-radius: 18px;
  background: ${props => props.$isOwn ? '#4267B2' : 'white'};
  color: ${props => props.$isOwn ? 'white' : '#1c1e21'};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  word-wrap: break-word;
  position: relative;
  font-size: 14px;
  line-height: 1.4;

  ${props => props.$isOwn ? `
    border-bottom-right-radius: 4px;
  ` : `
    border-bottom-left-radius: 4px;
  `}
`;

const MessageTime = styled.div<{ $isOwn: boolean }>`
  font-size: 11px;
  color: ${props => props.$isOwn ? 'rgba(255, 255, 255, 0.7)' : '#65676b'};
  margin-top: 4px;
  text-align: ${props => props.$isOwn ? 'right' : 'left'};
`;

const MessageStatus = styled.div<{ $isOwn: boolean }>`
  display: flex;
  align-items: center;
  gap: 2px;
  margin-top: 2px;
  justify-content: ${props => props.$isOwn ? 'flex-end' : 'flex-start'};
  font-size: 11px;
  color: ${props => props.$isOwn ? 'rgba(255, 255, 255, 0.7)' : '#65676b'};
`;

const MessageInputContainer = styled.div`
  padding: 12px 16px;
  background: white;
  border-top: 1px solid #e4e6ea;
`;

const MessageInputForm = styled.form`
  display: flex;
  gap: 8px;
  align-items: flex-end;
`;

const MessageInput = styled.textarea`
  flex: 1;
  background: #f0f2f5;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  color: #1c1e21;
  font-size: 14px;
  resize: none;
  min-height: 36px;
  max-height: 100px;
  font-family: inherit;
  outline: none;
  line-height: 1.4;

  &::placeholder {
    color: #65676b;
  }

  &:focus {
    background: white;
    box-shadow: 0 0 0 2px #4267B2;
  }
`;

const SendButton = styled.button<{ $disabled: boolean }>`
  background: ${props => props.$disabled ? '#e4e6ea' : '#4267B2'};
  color: ${props => props.$disabled ? '#bcc0c4' : 'white'};
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s;
  font-size: 16px;

  &:hover:not(:disabled) {
    background: #365899;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #65676b;
  text-align: center;
  padding: 40px;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
`;

const EmptyTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #1c1e21;
`;

const EmptyDescription = styled.p`
  font-size: 15px;
  margin: 0;
  color: #65676b;
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #65676b;
  font-size: 14px;
`;

interface ConversationViewProps {
  conversation: Conversation | null;
  onBack: () => void;
}

const ConversationView: React.FC<ConversationViewProps> = ({
  conversation,
  onBack
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load messages when conversation changes
  useEffect(() => {
    if (!conversation || !user?.uid) return;

    const loadMessages = async () => {
      try {
        setLoading(true);
        const conversationMessages = await advancedMessagingService.getConversation(
          user.uid,
          conversation.otherParticipant?.id || '',
          conversation.carId
        );
        setMessages(conversationMessages);
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();

    // Subscribe to real-time messages
    const unsubscribe = advancedMessagingService.subscribeToConversation(
      conversation.carId || '',
      user.uid,
      conversation.otherParticipant?.id || '',
      (message: Message) => {
        setMessages(prev => [...prev, message]);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [conversation, user?.uid]);

  // Mark messages as read when conversation is active
  useEffect(() => {
    if (conversation && user?.uid) {
      advancedMessagingService.markMessagesAsRead(conversation.id, user.uid);
    }
  }, [conversation, user?.uid]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [newMessage]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !conversation || !user?.uid || sending) return;

    try {
      setSending(true);
      await advancedMessagingService.sendMessage(
        user.uid,
        conversation.otherParticipant?.id || '',
        conversation.carId || '',
        newMessage.trim()
      );
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

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

  if (!conversation) {
    return (
      <ConversationContainer>
        <EmptyState>
          <EmptyIcon>💬</EmptyIcon>
          <div>{t('messaging.selectConversation')}</div>
        </EmptyState>
      </ConversationContainer>
    );
  }

  if (loading) {
    return (
      <ConversationContainer>
        <LoadingState>
          <div style={{ fontSize: '2rem', marginRight: '1rem' }}>⏳</div>
          {t('common.loading')}
        </LoadingState>
      </ConversationContainer>
    );
  }

  return (
    <ConversationContainer>
      <ConversationHeader>
        <BackButton onClick={onBack}>
          ←
        </BackButton>
        <Avatar $online={Math.random() > 0.5}>
          {conversation.otherParticipant?.avatar ? (
            <img
              src={conversation.otherParticipant.avatar}
              alt={conversation.otherParticipant?.name || 'Unknown'}
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            getInitials(conversation.otherParticipant?.name || 'Unknown')
          )}
        </Avatar>
        <HeaderInfo>
          <ParticipantName>{conversation.otherParticipant?.name || 'Unknown'}</ParticipantName>
          <CarTitle>{conversation.carTitle}</CarTitle>
        </HeaderInfo>
        <HeaderActions>
          <HeaderActionButton title="Video call">
            📹
          </HeaderActionButton>
          <HeaderActionButton title="Voice call">
            📞
          </HeaderActionButton>
          <HeaderActionButton title="More options">
            ⋮
          </HeaderActionButton>
        </HeaderActions>
      </ConversationHeader>

      <MessagesContainer>
        {messages.length === 0 ? (
          <EmptyState>
            <EmptyIcon>💬</EmptyIcon>
            <EmptyTitle>{t('messaging.noMessages')}</EmptyTitle>
            <EmptyDescription>
              {t('messaging.startConversation')}
            </EmptyDescription>
          </EmptyState>
        ) : (
          messages.map(message => (
            <MessageBubble key={message.id} $isOwn={message.senderId === user?.uid}>
              <div style={{ maxWidth: '100%' }}>
                <MessageContent $isOwn={message.senderId === user?.uid}>
                  {message.text}
                </MessageContent>
                <MessageTime $isOwn={message.senderId === user?.uid}>
                  {formatTime(message.createdAt)}
                </MessageTime>
                {message.senderId === user?.uid && (
                  <MessageStatus $isOwn={true}>
                    {message.status === 'sent' && '✓'}
                    {message.status === 'delivered' && '✓✓'}
                    {message.status === 'read' && '✓✓'}
                  </MessageStatus>
                )}
              </div>
            </MessageBubble>
          ))
        )}
        <div ref={messagesEndRef} />
      </MessagesContainer>

      <MessageInputContainer>
        <MessageInputForm onSubmit={handleSendMessage}>
          <MessageInput
            ref={textareaRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={t('messaging.typeMessage')}
            rows={1}
            disabled={sending}
          />
          <SendButton
            type="submit"
            $disabled={!newMessage.trim() || sending}
            disabled={!newMessage.trim() || sending}
          >
            {sending ? '⏳' : '➤'}
          </SendButton>
        </MessageInputForm>
      </MessageInputContainer>
    </ConversationContainer>
  );
};

export default ConversationView;

