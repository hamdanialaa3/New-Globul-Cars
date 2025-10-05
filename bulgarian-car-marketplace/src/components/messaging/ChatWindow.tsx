// src/components/Messaging/ChatWindow.tsx
// Chat Window Component - نافذة المحادثة
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { ArrowLeft, MoreVertical, Phone, Video } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { advancedMessagingService } from '../../services/messaging';
import type { Message } from '../../services/messaging';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';

// ==================== STYLED COMPONENTS ====================

const WindowContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
`;

const WindowHeader = styled.div`
  padding: 16px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
`;

const BackButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  @media (min-width: 768px) {
    display: none;
  }
  
  &:hover {
    background: #e0e0e0;
  }
`;

const Avatar = styled.div<{ $online?: boolean }>`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF7900, #ff8c1a);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  position: relative;
  flex-shrink: 0;
  
  ${props => props.$online && `
    &::after {
      content: '';
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 12px;
      height: 12px;
      background: #4caf50;
      border: 2px solid white;
      border-radius: 50%;
    }
  `}
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
  
  h3 {
    margin: 0 0 4px 0;
    font-size: 1rem;
    font-weight: 600;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  p {
    margin: 0;
    font-size: 0.75rem;
    color: #4caf50;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
`;

const IconButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: #f0f0f0;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:hover {
    background: #e0e0e0;
    color: #FF7900;
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
  background: #f9f9f9;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 3px;
  }
`;

const DateSeparator = styled.div`
  text-align: center;
  padding: 16px 0;
  
  span {
    display: inline-block;
    padding: 6px 16px;
    background: white;
    border-radius: 12px;
    font-size: 0.75rem;
    color: #999;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
`;

// ==================== COMPONENT ====================

interface ChatWindowProps {
  conversationId: string;
  currentUserId: string;
  receiverId: string;
  receiverName?: string;
  onBack?: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  conversationId,
  currentUserId,
  receiverId,
  receiverName,
  onBack
}) => {
  const { language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState<{ [key: string]: boolean }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Subscribe to messages
  useEffect(() => {
    const unsubscribe = advancedMessagingService.subscribeToMessages(
      conversationId,
      setMessages
    );

    return unsubscribe;
  }, [conversationId]);

  // Subscribe to typing
  useEffect(() => {
    const unsubscribe = advancedMessagingService.subscribeToTyping(
      conversationId,
      setTyping
    );

    return unsubscribe;
  }, [conversationId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark as read
  useEffect(() => {
    advancedMessagingService.markAsRead(conversationId, currentUserId);
  }, [conversationId, currentUserId, messages]);

  const formatDateSeparator = (date: Date): string => {
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);

    if (diffDays === 0) {
      return language === 'bg' ? 'Днес' : 'Today';
    } else if (diffDays === 1) {
      return language === 'bg' ? 'Вчера' : 'Yesterday';
    } else {
      return new Intl.DateTimeFormat(language === 'bg' ? 'bg-BG' : 'en-US', {
        day: 'numeric',
        month: 'long',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      }).format(date);
    }
  };

  const groupMessagesByDate = () => {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentDate = '';

    messages.forEach(message => {
      const messageDate = message.createdAt.toDateString();
      
      if (messageDate !== currentDate) {
        currentDate = messageDate;
        groups.push({
          date: formatDateSeparator(message.createdAt),
          messages: [message]
        });
      } else {
        groups[groups.length - 1].messages.push(message);
      }
    });

    return groups;
  };

  const messageGroups = groupMessagesByDate();
  const isReceiverTyping = typing[receiverId];

  return (
    <WindowContainer>
      <WindowHeader>
        <HeaderLeft>
          <BackButton onClick={onBack}>
            <ArrowLeft size={20} />
          </BackButton>

          <Avatar $online={false}>
            {receiverName ? receiverName[0].toUpperCase() : 'U'}
          </Avatar>

          <UserInfo>
            <h3>{receiverName || (language === 'bg' ? 'Потребител' : 'User')}</h3>
            {isReceiverTyping && (
              <p>{language === 'bg' ? 'Пише...' : 'Typing...'}</p>
            )}
          </UserInfo>
        </HeaderLeft>

        <HeaderActions>
          <IconButton title={language === 'bg' ? 'Обаждане' : 'Call'}>
            <Phone size={20} />
          </IconButton>
          <IconButton title={language === 'bg' ? 'Видео' : 'Video'}>
            <Video size={20} />
          </IconButton>
          <IconButton>
            <MoreVertical size={20} />
          </IconButton>
        </HeaderActions>
      </WindowHeader>

      <MessagesContainer>
        {messageGroups.map((group, index) => (
          <div key={index}>
            <DateSeparator>
              <span>{group.date}</span>
            </DateSeparator>

            {group.messages.map(message => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.senderId === currentUserId}
              />
            ))}
          </div>
        ))}

        {isReceiverTyping && (
          <TypingIndicator userName={receiverName} />
        )}

        <div ref={messagesEndRef} />
      </MessagesContainer>

      <MessageInput
        conversationId={conversationId}
        senderId={currentUserId}
        receiverId={receiverId}
        onSend={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
      />
    </WindowContainer>
  );
};

export default ChatWindow;
