/**
 * Chat Window Component
 * Displays messages and allows sending new messages
 * Location: Bulgaria | Languages: BG, EN | Currency: EUR
 */

import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthProvider';
import { useLanguage } from '../../contexts/LanguageContext';
import messagingService, { Message } from '../../services/messaging/messaging.service';
import { format } from 'date-fns';
import { Send } from 'lucide-react';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MessageBubble = styled.div<{ $isOwn: boolean }>`
  max-width: 70%;
  align-self: ${props => props.$isOwn ? 'flex-end' : 'flex-start'};
  background: ${props => props.$isOwn 
    ? 'linear-gradient(135deg, #FF7900 0%, #FF6600 100%)' 
    : '#f0f0f0'
  };
  color: ${props => props.$isOwn ? '#fff' : '#1a1a1a'};
  padding: 12px 16px;
  border-radius: 18px;
  border-bottom-right-radius: ${props => props.$isOwn ? '4px' : '18px'};
  border-bottom-left-radius: ${props => props.$isOwn ? '18px' : '4px'};
  word-wrap: break-word;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const MessageContent = styled.p`
  margin: 0;
  font-size: 15px;
  line-height: 1.4;
`;

const MessageTime = styled.span`
  font-size: 11px;
  opacity: 0.7;
  margin-top: 4px;
  display: block;
`;

const InputContainer = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid #e0e0e0;
  background: #fff;
`;

const Input = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 24px;
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s;
  
  &:focus {
    border-color: #FF7900;
  }
  
  &::placeholder {
    color: #999;
  }
`;

const SendButton = styled.button`
  background: linear-gradient(135deg, #FF7900 0%, #FF6600 100%);
  color: white;
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(255, 121, 0, 0.3);
  }
  
  &:active:not(:disabled) {
    transform: scale(0.95);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  text-align: center;
  padding: 40px 20px;
`;

interface ChatWindowProps {
  conversationId: string;
  otherUserName: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  conversationId,
  otherUserName
}) => {
  const { currentUser } = useAuth();
  const { language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = messagingService.subscribeToMessages(
      conversationId,
      (updatedMessages) => {
        setMessages(updatedMessages);
      }
    );

    return () => unsubscribe();
  }, [conversationId]);

  useEffect(() => {
    if (conversationId && currentUser) {
      messagingService.markConversationAsRead(conversationId, currentUser.uid);
    }
  }, [conversationId, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser || sending) return;

    setSending(true);

    try {
      await messagingService.sendMessage(
        conversationId,
        currentUser.uid,
        newMessage.trim()
      );
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (timestamp: any): string => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'HH:mm');
  };

  if (!conversationId) {
    return (
      <Container>
        <EmptyState>
          {language === 'bg'
            ? 'Изберете разговор, за да започнете'
            : 'Select a conversation to start'
          }
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <MessagesContainer>
        {messages.map((message) => {
          const isOwn = message.senderId === currentUser?.uid;
          
          return (
            <MessageBubble key={message.id} $isOwn={isOwn}>
              <MessageContent>{message.content}</MessageContent>
              <MessageTime>{formatMessageTime(message.timestamp)}</MessageTime>
            </MessageBubble>
          );
        })}
        <div ref={messagesEndRef} />
      </MessagesContainer>

      <InputContainer>
        <Input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={language === 'bg' 
            ? 'Напишете съобщение...' 
            : 'Type a message...'
          }
          disabled={sending}
        />
        <SendButton
          onClick={handleSendMessage}
          disabled={!newMessage.trim() || sending}
        >
          <Send size={20} />
        </SendButton>
      </InputContainer>
    </Container>
  );
};

export default ChatWindow;

