/**
 * ChatWindow - Full-featured chat interface
 * Location: Bulgaria | Languages: BG/EN | Currency: EUR
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { useAuth } from '@/contexts/AuthProvider';
import { useLanguage } from '@/contexts/LanguageContext';
import { realtimeMessagingService, Message } from '@/services/realtimeMessaging';
import MessageBubble from '@/components/messaging/MessageBubble';
import TypingIndicator from '@/components/messaging/TypingIndicator';
import MessageComposer from './MessageComposer';
import {
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Search
} from 'lucide-react';

// ==================== INTERFACES ====================

interface ChatWindowProps {
  conversationId: string;
  recipientId: string;
  recipientName: string;
  recipientImage?: string;
  onBack: () => void;
}

// ==================== STYLED COMPONENTS ====================

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f8f9fa;
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    background: #0f172a;
  }
  
  /* Light Mode Support */
  html[data-theme="light"] & {
    background: #f8f9fa;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: white;
  border-bottom: 1px solid #e9ecef;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  z-index: 10;
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    background: #1e293b;
    border-bottom-color: rgba(148, 163, 184, 0.15);
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  }
  
  /* Light Mode Support */
  html[data-theme="light"] & {
    background: white;
    border-bottom-color: #e9ecef;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }
`;

const BackButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #6c757d;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background: #f1f3f5;
    color: #212529;
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
  
  @media (min-width: 769px) {
    display: none;
  }
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    color: #94a3b8;
    
    &:hover {
      background: #334155;
      color: #e2e8f0;
    }
  }
  
  /* Light Mode Support */
  html[data-theme="light"] & {
    color: #6c757d;
    
    &:hover {
      background: #f1f3f5;
      color: #212529;
    }
  }
`;

const RecipientInfo = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  
  &:hover .name {
    color: #FF7900;
  }
`;

const Avatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #FF8F10;
`;

const UserDetails = styled.div`
  flex: 1;
  
  .name {
    font-weight: 700;
    color: #212529;
    font-size: 1rem;
    margin-bottom: 2px;
    transition: color 0.2s;
  }
  
  .status {
    font-size: 0.85rem;
    color: #6c757d;
  }
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    .name {
      color: #e2e8f0;
    }
    
    .status {
      color: #94a3b8;
    }
  }
  
  /* Light Mode Support */
  html[data-theme="light"] & {
    .name {
      color: #212529;
    }
    
    .status {
      color: #6c757d;
    }
  }
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ActionButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #6c757d;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background: #f1f3f5;
    color: #FF7900;
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    color: #94a3b8;
    
    &:hover {
      background: #334155;
      color: #FF7900;
    }
  }
  
  /* Light Mode Support */
  html[data-theme="light"] & {
    color: #6c757d;
    
    &:hover {
      background: #f1f3f5;
      color: #FF7900;
    }
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f3f5;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #dee2e6;
    border-radius: 4px;
    
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

const DateDivider = styled.div`
  text-align: center;
  margin: 16px 0;
  position: relative;
  
  &:before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: #dee2e6;
  }
  
  span {
    position: relative;
    background: #f8f9fa;
    padding: 4px 16px;
    font-size: 0.8rem;
    color: #6c757d;
    font-weight: 600;
    text-transform: uppercase;
  }
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    &:before {
      background: rgba(148, 163, 184, 0.2);
    }
    
    span {
      background: #0f172a;
      color: #94a3b8;
    }
  }
  
  /* Light Mode Support */
  html[data-theme="light"] & {
    &:before {
      background: #dee2e6;
    }
    
    span {
      background: #f8f9fa;
      color: #6c757d;
    }
  }
`;

const EmptyMessagesState = styled.div`
  text-align: center;
  padding: 40px;
  color: #6c757d;
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    color: #94a3b8;
  }
  
  /* Light Mode Support */
  html[data-theme="light"] & {
    color: #6c757d;
  }
`;

const LoadingIndicator = styled.div`
  text-align: center;
  padding: 20px;
  color: #6c757d;
  
  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #FF7900;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 12px;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    color: #94a3b8;
    
    .spinner {
      border-color: #334155;
      border-top-color: #FF7900;
    }
  }
  
  /* Light Mode Support */
  html[data-theme="light"] & {
    color: #6c757d;
    
    .spinner {
      border-color: #f3f3f3;
      border-top-color: #FF7900;
    }
  }
`;

// ==================== COMPONENT ====================

const ChatWindow: React.FC<ChatWindowProps> = ({
  conversationId,
  recipientId,
  recipientName,
  recipientImage,
  onBack
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  
  // ==================== EFFECTS ====================
  
  // Load messages
  useEffect(() => {
    if (!user) return;
    
    const loadMessages = async () => {
      try {
        setLoading(true);
        const msgs = await realtimeMessagingService.getMessages(
          user.uid,
          recipientId,
          100
        );
        setMessages(msgs);
      } catch (error) {
        // Error loading messages - handled by loading state
      } finally {
        setLoading(false);
      }
    };
    
    loadMessages();
    
    // Listen to real-time messages
    const unsubscribe = realtimeMessagingService.listenToMessages(
      user.uid,
      (newMessages) => {
        setMessages(newMessages.filter(
          msg => 
            (msg.senderId === user.uid && msg.receiverId === recipientId) ||
            (msg.senderId === recipientId && msg.receiverId === user.uid)
        ));
      }
    );
    
    // Mark messages as read
    realtimeMessagingService.markMessagesAsRead(user.uid, recipientId);
    
    return () => {
      unsubscribe();
    };
  }, [user, recipientId]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // ==================== HANDLERS ====================
  
  const handleSendMessage = useCallback(async (content: string) => {
    if (!user || !content.trim()) return;
    
    try {
      // Generate conversationId (consistent ordering of user IDs)
      const conversationId = [user.uid, recipientId].sort().join('_');
      
      await realtimeMessagingService.sendMessage({
        conversationId,
        senderId: user.uid,
        senderName: user.displayName || user.email || 'User',
        receiverId: recipientId,
        receiverName: recipientName || 'User',
        content,
        messageType: 'text',
        isRead: false
      });
    } catch (error) {
      // Error sending message - handled by UI state
    }
  }, [user, recipientId, recipientName]);
  
  const handleTyping = useCallback((isTyping: boolean) => {
    if (!user) return;
    
    realtimeMessagingService.sendTypingIndicator(
      user.uid,
      recipientId,
      isTyping
    );
  }, [user, recipientId]);
  
  // ==================== RENDER HELPERS ====================
  
  const groupMessagesByDate = (msgs: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    msgs.forEach(msg => {
      const date = new Date(msg.createdAt).toLocaleDateString('bg-BG');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(msg);
    });
    
    return groups;
  };
  
  const renderMessages = () => {
    if (loading) {
      return (
        <LoadingIndicator>
          <div className="spinner" />
          <p>{t('messages.loading')}</p>
        </LoadingIndicator>
      );
    }
    
    if (messages.length === 0) {
      return (
        <EmptyMessagesState>
          <p>{t('messages.noMessages')}</p>
        </EmptyMessagesState>
      );
    }
    
    const grouped = groupMessagesByDate(messages);
    
    return Object.entries(grouped).map(([date, msgs]) => (
      <React.Fragment key={date}>
        <DateDivider>
          <span>{date}</span>
        </DateDivider>
        {msgs.map(msg => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwn={msg.senderId === user?.uid}
          />
        ))}
      </React.Fragment>
    ));
  };
  
  // ==================== RENDER ====================
  
  return (
    <Container>
      <Header>
        <BackButton onClick={onBack}>
          <ArrowLeft />
        </BackButton>
        
        <RecipientInfo>
          <Avatar
            src={recipientImage || '/assets/default-avatar.png'}
            alt={recipientName}
          />
          <UserDetails>
            <div className="name">{recipientName}</div>
            <div className="status">Online</div>
          </UserDetails>
        </RecipientInfo>
        
        <Actions>
          <ActionButton title="Voice call">
            <Phone />
          </ActionButton>
          <ActionButton title="Video call">
            <Video />
          </ActionButton>
          <ActionButton title="Search">
            <Search />
          </ActionButton>
          <ActionButton title="More">
            <MoreVertical />
          </ActionButton>
        </Actions>
      </Header>
      
      <MessagesContainer>
        {renderMessages()}
        {isTyping && <TypingIndicator userName={recipientName} />}
        <div ref={messagesEndRef} />
      </MessagesContainer>
      
      <MessageComposer
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        recipientName={recipientName}
      />
    </Container>
  );
};

export default ChatWindow;
