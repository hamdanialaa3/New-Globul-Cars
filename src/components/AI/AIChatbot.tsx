// AI Chatbot Component
// مساعد الذكاء الاصطناعي للمحادثة

import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { AIChatMessage, AIChatContext } from '../../types/ai.types';
import { useAuth } from '../../contexts/AuthProvider';
import { useLanguage } from '../../contexts/LanguageContext';
import { logger } from '../../services/logger-service';
import { X, MessageSquare } from 'lucide-react';

interface Props {
  context?: AIChatContext;
  position?: 'bottom-right' | 'bottom-left';
  hideButton?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(99, 102, 241, 0); }
  100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
`;

export const AIChatbot: React.FC<Props> = ({
  context = {},
  position = 'bottom-right',
  hideButton = false,
  isOpen: externalIsOpen,
  onClose
}) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
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
      bg: 'Здравейте! Как мога да ви помогна днес? Попитайте ме за коли, цени или каквото и да е друго!',
      en: 'Hello! How can I help you today? Ask me about cars, prices, or anything else!'
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
      const functions = getFunctions();
      const geminiChatCallable = httpsCallable(functions, 'geminiChat');

      const chatContext: AIChatContext = {
        ...context,
        language: language as any
      };

      const conversationHistory = messages.slice(-6).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const result = await geminiChatCallable({
        message: input,
        context: chatContext,
        conversationHistory
      });

      const responseData = result.data as { message: string; quotaRemaining?: number };

      const assistantMessage: AIChatMessage = {
        role: 'assistant',
        content: responseData.message,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error: any) {
      logger.error('Chatbot error', error);

      const errorMessages = {
        bg: error.message || 'Съжалявам, възникна грешка. Моля, опитайте отново.',
        en: error.message || 'Sorry, I encountered an error. Please try again.'
      };

      const errorMessage: AIChatMessage = {
        role: 'assistant',
        content: errorMessages[language as keyof typeof errorMessages] || errorMessages.en,
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

  const toggleChat = () => {
    if (onClose && isOpen) {
      onClose();
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  return (
    <>
      {isOpen && (
        <ChatWindow $position={position}>
          <ChatHeader>
            <HeaderTitle>
              <BotIcon>🤖</BotIcon>
              <span>{language === 'bg' ? 'AI Асистент' : 'AI Assistant'}</span>
            </HeaderTitle>
            <CloseButton onClick={toggleChat}>✕</CloseButton>
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
                    <Dot $delay={0} />
                    <Dot $delay={0.2} />
                    <Dot $delay={0.4} />
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
              placeholder={language === 'bg' ? 'Напишете вашето съобщение...' : 'Type your message...'}
              disabled={loading}
            />
            <SendButton onClick={handleSend} disabled={loading || !input.trim()}>
              ➤
            </SendButton>
          </InputContainer>
        </ChatWindow>
      )}

      {!hideButton && (
        <ChatButton
          onClick={toggleChat}
          $isOpen={isOpen}
          $position={position}
          aria-label="AI Chatbot"
        >
          {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        </ChatButton>
      )}
    </>
  );
};

// Styled Components

const ChatButton = styled.button<{ $isOpen: boolean; $position: string }>`
  position: fixed;
  bottom: 92px; /* Centered between 160px and ~24px */
  ${p => p.$position === 'bottom-right' ? 'right: 32px;' : 'left: 32px;'}
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: none;
  
  /* Glassmorphism Gradient matching FloatingAddButton style but Indigo */
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  
  display: flex;
  align-items: center;
  justify-content: center;
  
  /* Matches FloatingAddButton shadow intensity */
  box-shadow: 
    0 8px 32px rgba(99, 102, 241, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
    
  cursor: pointer;
  z-index: 9999;
  
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${p => p.$isOpen ? 'none' : css`${pulse} 2s infinite`};
  
  &:hover {
    transform: translateY(-4px) scale(1.1);
    box-shadow: 
      0 12px 48px rgba(99, 102, 241, 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
  }
  
  @media (max-width: 768px) {
    ${p => p.$position === 'bottom-right' ? 'right: 24px;' : 'left: 24px;'}
    bottom: 82px;
    width: 56px;
    height: 56px;
  }
`;

const ChatWindow = styled.div<{ $position: string }>`
  position: fixed;
  ${p => p.$position === 'bottom-right' ? 'right: 24px;' : 'left: 24px;'}
  bottom: 150px; /* Above the button */
  width: 380px;
  height: 550px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  z-index: 9998;
  overflow: hidden;

  transform-origin: bottom right;
  animation: openWindow 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  @keyframes openWindow {
    from { opacity: 0; transform: scale(0.9) translateY(20px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }

  @media (max-width: 768px) {
    width: calc(100vw - 48px);
    height: 500px;
    bottom: 140px;
  }
`;

const ChatHeader = styled.div`
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
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
    ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
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

const Dot = styled.div<{ $delay: number }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #6366f1;
  animation: bounce 1.4s infinite ease-in-out;
  animation-delay: ${p => p.$delay}s;

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
    border-color: #6366f1;
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
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
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

export default AIChatbot;
