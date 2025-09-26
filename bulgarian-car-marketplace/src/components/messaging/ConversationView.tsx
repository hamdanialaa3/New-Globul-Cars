import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../context/AuthProvider';
import { messagingService, Message, Conversation } from '../../services/messagingService';

// Styled Components
const ConversationContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  overflow: hidden;
`;

const ConversationHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.6);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #00D4FF;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 212, 255, 0.1);
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

const HeaderInfo = styled.div`
  flex: 1;
`;

const ParticipantName = styled.div`
  font-weight: 600;
  color: white;
  font-size: 1.1rem;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
`;

const CarTitle = styled.div`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 0.25rem;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MessageBubble = styled.div<{ $isOwn: boolean }>`
  display: flex;
  justify-content: ${props => props.$isOwn ? 'flex-end' : 'flex-start'};
  margin-bottom: 0.5rem;
`;

const MessageContent = styled.div<{ $isOwn: boolean }>`
  max-width: 70%;
  padding: 0.75rem 1rem;
  border-radius: ${props => props.$isOwn ? '20px 20px 5px 20px' : '20px 20px 20px 5px'};
  background: ${props => props.$isOwn 
    ? 'linear-gradient(135deg, #00D4FF, #0099CC)' 
    : 'rgba(255, 255, 255, 0.1)'
  };
  color: ${props => props.$isOwn ? 'white' : 'rgba(255, 255, 255, 0.9)'};
  box-shadow: ${props => props.$isOwn 
    ? '0 4px 15px rgba(0, 212, 255, 0.3)' 
    : '0 4px 15px rgba(0, 0, 0, 0.2)'
  };
  text-shadow: ${props => props.$isOwn ? '0 2px 8px rgba(0, 0, 0, 0.3)' : 'none'};
  word-wrap: break-word;
  position: relative;
`;

const MessageTime = styled.div<{ $isOwn: boolean }>`
  font-size: 0.7rem;
  color: ${props => props.$isOwn ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.5)'};
  margin-top: 0.25rem;
  text-align: ${props => props.$isOwn ? 'right' : 'left'};
`;

const MessageInputContainer = styled.div`
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.6);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const MessageInputForm = styled.form`
  display: flex;
  gap: 1rem;
  align-items: flex-end;
`;

const MessageInput = styled.textarea`
  flex: 1;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 0.75rem 1rem;
  color: white;
  font-size: 0.9rem;
  resize: none;
  min-height: 40px;
  max-height: 120px;
  font-family: inherit;

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  &:focus {
    outline: none;
    border-color: #00D4FF;
    box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.2);
  }
`;

const SendButton = styled.button<{ $disabled: boolean }>`
  background: ${props => props.$disabled 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'linear-gradient(135deg, #00D4FF, #0099CC)'
  };
  color: ${props => props.$disabled ? 'rgba(255, 255, 255, 0.3)' : 'white'};
  border: none;
  border-radius: 50%;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  box-shadow: ${props => props.$disabled 
    ? 'none' 
    : '0 4px 15px rgba(0, 212, 255, 0.3)'
  };

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 212, 255, 0.4);
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  padding: 2rem;
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgba(255, 255, 255, 0.6);
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
        const conversationMessages = await messagingService.getConversation(
          user.uid,
          conversation.otherParticipant.id,
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
    const unsubscribe = messagingService.subscribeToConversation(
      conversation.carId,
      user.uid,
      conversation.otherParticipant.id,
      (message) => {
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
      messagingService.markMessagesAsRead(conversation.id, user.uid);
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
      await messagingService.sendMessage(
        user.uid,
        conversation.otherParticipant.id,
        conversation.carId,
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
        <HeaderInfo>
          <ParticipantName>{conversation.otherParticipant.name}</ParticipantName>
          <CarTitle>{conversation.carTitle}</CarTitle>
        </HeaderInfo>
      </ConversationHeader>

      <MessagesContainer>
        {messages.length === 0 ? (
          <EmptyState>
            <EmptyIcon>💬</EmptyIcon>
            <div>{t('messaging.noMessages')}</div>
          </EmptyState>
        ) : (
          messages.map(message => (
            <MessageBubble key={message.id} $isOwn={message.senderId === user?.uid}>
              <div style={{ maxWidth: '100%' }}>
                <MessageContent $isOwn={message.senderId === user?.uid}>
                  {message.text}
                </MessageContent>
                <MessageTime $isOwn={message.senderId === user?.uid}>
                  {formatTime(message.timestamp)}
                </MessageTime>
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

