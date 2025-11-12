// AI Chatbot Component
// مساعد الذكاء الاصطناعي للمحادثة

import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { geminiChatService } from '@/services/ai/gemini-chat.service';
import { AIChatMessage, AIChatContext } from '@/types/ai.types';
import { useAuth } from '@/contexts/AuthProvider';
import { useTranslation } from '@/hooks/useTranslation';
import { logger } from '@/services/logger-service';

interface Props {
  context?: AIChatContext;
  position?: 'bottom-right' | 'bottom-left';
}

export const AIChatbot: React.FC<Props> = ({ 
  context = {}, 
  position = 'bottom-right' 
}) => {
  const { user } = useAuth();
  const { language } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addWelcomeMessage();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addWelcomeMessage = () => {
    const welcomeMessages = {
      bg: 'Здравейте! Как мога да ви помогна днес?',
      en: 'Hello! How can I help you today?',
      ar: 'مرحباً! كيف يمكنني مساعدتك اليوم؟',
      ru: 'Здравствуйте! Как я могу вам помочь сегодня?',
      tr: 'Merhaba! Bugün size nasıl yardımcı olabilirim?'
    };

    setMessages([{
      role: 'assistant',
      content: welcomeMessages[language as keyof typeof welcomeMessages] || welcomeMessages.en,
      timestamp: Date.now()
    }]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: AIChatMessage = {
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const chatContext: AIChatContext = {
        ...context,
        language: language as any
      };

      const response = await geminiChatService.chat(
        input, 
        chatContext,
        user?.uid
      );

      const assistantMessage: AIChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error: any) {
      logger.error('Chatbot error', error);
      
      const errorMessage: AIChatMessage = {
        role: 'assistant',
        content: error.message || 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <ChatButton 
        onClick={() => setIsOpen(!isOpen)}
        position={position}
        isOpen={isOpen}
      >
        {isOpen ? '✕' : '💬'}
      </ChatButton>

      {isOpen && (
        <ChatWindow position={position}>
          <ChatHeader>
            <HeaderTitle>
              <BotIcon>🤖</BotIcon>
              <span>AI Assistant</span>
            </HeaderTitle>
            <CloseButton onClick={() => setIsOpen(false)}>✕</CloseButton>
          </ChatHeader>

          <MessagesContainer>
            {messages.map((msg, idx) => (
              <Message key={idx} role={msg.role}>
                <MessageBubble role={msg.role}>
                  {msg.content}
                </MessageBubble>
              </Message>
            ))}
            {loading && (
              <Message role="assistant">
                <MessageBubble role="assistant">
                  <TypingIndicator>
                    <Dot delay={0} />
                    <Dot delay={0.2} />
                    <Dot delay={0.4} />
                  </TypingIndicator>
                </MessageBubble>
              </Message>
            )}
            <div ref={messagesEndRef} />
          </MessagesContainer>

          <InputContainer>
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={loading}
            />
            <SendButton onClick={handleSend} disabled={loading || !input.trim()}>
              ➤
            </SendButton>
          </InputContainer>
        </ChatWindow>
      )}
    </>
  );
};

const ChatButton = styled.button<{ position: string; isOpen: boolean }>`
  position: fixed;
  ${p => p.position === 'bottom-right' ? 'right: 24px;' : 'left: 24px;'}
  bottom: 24px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  font-size: 28px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  z-index: 9999;
  transition: all 0.3s;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
  }
`;

const ChatWindow = styled.div<{ position: string }>`
  position: fixed;
  ${p => p.position === 'bottom-right' ? 'right: 24px;' : 'left: 24px;'}
  bottom: 100px;
  width: 380px;
  height: 550px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  z-index: 9998;
  overflow: hidden;

  @media (max-width: 768px) {
    width: calc(100vw - 48px);
    height: calc(100vh - 150px);
  }
`;

const ChatHeader = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  font-size: 16px;
`;

const BotIcon = styled.span`
  font-size: 24px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  
  &:hover {
    opacity: 0.8;
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f9fafb;
`;

const Message = styled.div<{ role: string }>`
  display: flex;
  justify-content: ${p => p.role === 'user' ? 'flex-end' : 'flex-start'};
  margin-bottom: 12px;
`;

const MessageBubble = styled.div<{ role: string }>`
  max-width: 75%;
  padding: 12px 16px;
  border-radius: 16px;
  background: ${p => p.role === 'user' 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
    : 'white'};
  color: ${p => p.role === 'user' ? 'white' : '#1a1a1a'};
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  word-wrap: break-word;
  font-size: 14px;
  line-height: 1.5;
`;

const TypingIndicator = styled.div`
  display: flex;
  gap: 4px;
  padding: 4px 0;
`;

const Dot = styled.div<{ delay: number }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #667eea;
  animation: bounce 1.4s infinite ease-in-out;
  animation-delay: ${p => p.delay}s;

  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
  }
`;

const InputContainer = styled.div`
  display: flex;
  gap: 10px;
  padding: 16px;
  background: white;
  border-top: 1px solid #e5e7eb;
`;

const Input = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 24px;
  font-size: 14px;
  outline: none;

  &:focus {
    border-color: #667eea;
  }

  &:disabled {
    background: #f3f4f6;
  }
`;

const SendButton = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 18px;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover:not(:disabled) {
    transform: scale(1.1);
  }

  &:disabled {
    background: #e5e7eb;
    cursor: not-allowed;
  }
`;
