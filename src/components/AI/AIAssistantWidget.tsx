/**
 * AI Assistant Widget - "Karo"
 * Smart AI chatbot for car search assistance
 * 
 * Inspired by: Cars.com "Carson" AI, AutoScout24 search suggestions
 * 
 * File: src/components/ai/AIAssistantWidget.tsx
 * Created: January 8, 2026
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import {
  MessageCircle, X, Send, Sparkles, Car, Search,
  DollarSign, Gauge, Fuel, Calendar, ChevronDown,
  Bot, User, RefreshCw, Mic, MicOff, Loader2
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { logger } from '@/services/logger-service';

// ==================== ANIMATIONS ====================

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(100px); }
  to { opacity: 1; transform: translateX(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`;

const typing = keyframes`
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(102, 126, 234, 0.4); }
  50% { box-shadow: 0 0 40px rgba(102, 126, 234, 0.6); }
`;

// ==================== STYLED COMPONENTS ====================

const WidgetContainer = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  font-family: 'Inter', -apple-system, sans-serif;
  
  @media (max-width: 640px) {
    bottom: 16px;
    right: 16px;
    ${p => p.$isOpen && css`
      left: 16px;
    `}
  }
`;

// Floating Button
const FloatingButton = styled.button<{ $hasNotification: boolean }>`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
  animation: ${glow} 3s ease-in-out infinite;
  position: relative;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 12px 48px rgba(102, 126, 234, 0.5);
  }
  
  svg {
    width: 28px;
    height: 28px;
  }
  
  ${p => p.$hasNotification && css`
    &::after {
      content: '1';
      position: absolute;
      top: -4px;
      right: -4px;
      width: 22px;
      height: 22px;
      background: #ef4444;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      border: 3px solid white;
    }
  `}
`;

// Chat Window
const ChatWindow = styled.div`
  position: absolute;
  bottom: 80px;
  right: 0;
  width: 400px;
  max-height: 600px;
  background: var(--bg-card);
  border-radius: 24px;
  border: 2px solid var(--border-primary);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ${slideIn} 0.4s ease-out;
  
  @media (max-width: 640px) {
    width: calc(100vw - 32px);
    max-height: calc(100vh - 180px);
    right: 0;
    left: 0;
  }
`;

// Header
const ChatHeader = styled.div`
  padding: 1.25rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const AvatarContainer = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const AvatarImage = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #ffd700 0%, #ffb347 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

const OnlineIndicator = styled.div`
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background: #10b981;
  border-radius: 50%;
  border: 2px solid white;
`;

const HeaderInfo = styled.div`
  flex: 1;
`;

const AssistantName = styled.div`
  font-weight: 700;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatusText = styled.div`
  font-size: 0.85rem;
  opacity: 0.9;
`;

const CloseButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }
`;

// Messages Container
const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 300px;
  max-height: 400px;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--border-primary);
    border-radius: 3px;
  }
`;

const MessageRow = styled.div<{ $isUser: boolean }>`
  display: flex;
  justify-content: ${p => p.$isUser ? 'flex-end' : 'flex-start'};
  animation: ${fadeInUp} 0.3s ease-out;
`;

const MessageBubble = styled.div<{ $isUser: boolean }>`
  max-width: 85%;
  padding: 0.85rem 1.1rem;
  border-radius: 20px;
  font-size: 0.95rem;
  line-height: 1.5;
  
  ${p => p.$isUser ? css`
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-bottom-right-radius: 6px;
  ` : css`
    background: var(--bg-secondary);
    color: var(--text-primary);
    border-bottom-left-radius: 6px;
  `}
`;

const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.85rem 1.1rem;
  background: var(--bg-secondary);
  border-radius: 20px;
  border-bottom-left-radius: 6px;
  max-width: 100px;
`;

const TypingDot = styled.div<{ $delay: number }>`
  width: 8px;
  height: 8px;
  background: var(--text-secondary);
  border-radius: 50%;
  animation: ${typing} 1.5s ease-in-out infinite;
  animation-delay: ${p => p.$delay}s;
`;

// Quick Suggestions
const SuggestionsContainer = styled.div`
  padding: 0.75rem 1rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  border-top: 1px solid var(--border-primary);
  background: var(--bg-secondary);
`;

const SuggestionChip = styled.button`
  padding: 0.5rem 0.85rem;
  border: 1px solid var(--border-primary);
  border-radius: 20px;
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: var(--accent-primary);
    color: var(--accent-primary);
    background: rgba(102, 126, 234, 0.08);
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

// Input Area
const InputArea = styled.div`
  padding: 1rem;
  border-top: 1px solid var(--border-primary);
  display: flex;
  gap: 0.75rem;
  align-items: center;
`;

const InputWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  background: var(--bg-secondary);
  border-radius: 24px;
  padding: 0 0.5rem 0 1rem;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  
  &:focus-within {
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  }
`;

const Input = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  padding: 0.75rem 0;
  font-size: 0.95rem;
  color: var(--text-primary);
  
  &::placeholder {
    color: var(--text-muted);
  }
  
  &:focus {
    outline: none;
  }
`;

const IconButton = styled.button<{ $active?: boolean; $primary?: boolean }>`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  ${p => p.$primary ? css`
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    
    &:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
  ` : css`
    background: transparent;
    color: ${p.$active ? 'var(--accent-primary)' : 'var(--text-secondary)'};
    
    &:hover {
      background: var(--bg-tertiary);
      color: var(--accent-primary);
    }
  `}
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

// Car Result Card (inline results)
const CarResultCard = styled.div`
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  margin-top: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: var(--accent-primary);
    transform: translateX(5px);
  }
`;

const CarThumb = styled.div`
  width: 60px;
  height: 45px;
  border-radius: 8px;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  svg {
    color: var(--text-muted);
  }
`;

const CarInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const CarTitle = styled.div`
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CarPrice = styled.div`
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--accent-primary);
`;

const CarMeta = styled.div`
  font-size: 0.8rem;
  color: var(--text-secondary);
`;

// ==================== TYPES ====================

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  carResults?: CarResult[];
}

interface CarResult {
  id: string;
  title: string;
  price: number;
  year: number;
  km: number;
}

interface Suggestion {
  icon: React.ReactNode;
  text: { bg: string; en: string };
  query: { bg: string; en: string };
}

// ==================== COMPONENT ====================

export const AIAssistantWidget: React.FC = () => {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasNotification, setHasNotification] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const t = {
    bg: {
      name: 'Каро',
      tagline: 'AI Асистент',
      status: 'Онлайн • Готов да помогна',
      inputPlaceholder: 'Питай Каро за коли...',
      welcome: 'Здравей! 👋 Аз съм Каро, твоят AI асистент за търсене на коли. Какво търсиш днес?',
      thinking: 'Мисля...',
      foundCars: 'Намерих {count} коли за теб:',
      noCars: 'Не намерих коли по тези критерии. Опитай с друго търсене.',
      suggestions: 'Популярни запитвания:'
    },
    en: {
      name: 'Karo',
      tagline: 'AI Assistant',
      status: 'Online • Ready to help',
      inputPlaceholder: 'Ask Karo about cars...',
      welcome: "Hi! 👋 I'm Karo, your AI car search assistant. What are you looking for today?",
      thinking: 'Thinking...',
      foundCars: 'I found {count} cars for you:',
      noCars: "I couldn't find cars matching those criteria. Try another search.",
      suggestions: 'Popular queries:'
    }
  };

  const text = t[language] || t.en;

  const suggestions: Suggestion[] = [
    {
      icon: <Car />,
      text: { bg: 'Семеен SUV', en: 'Family SUV' },
      query: { bg: 'Търся семеен SUV до 30000 евро', en: 'Looking for family SUV under 30000 euros' }
    },
    {
      icon: <DollarSign />,
      text: { bg: 'Икономична кола', en: 'Economical car' },
      query: { bg: 'Искам икономична кола с нисък разход', en: 'I want an economical car with low consumption' }
    },
    {
      icon: <Gauge />,
      text: { bg: 'Бърза кола', en: 'Fast car' },
      query: { bg: 'Показвай спортни коли над 300 коня', en: 'Show sport cars over 300 hp' }
    },
    {
      icon: <Fuel />,
      text: { bg: 'Електрическа', en: 'Electric' },
      query: { bg: 'Търся електрическа кола', en: 'Looking for electric car' }
    }
  ];

  // Scroll to bottom when new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Show welcome message when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setHasNotification(false);
      const welcomeMessage: Message = {
        id: '1',
        text: text.welcome,
        isUser: false,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const mockCars: CarResult[] = [
        { id: '1', title: 'BMW X5 2022', price: 45000, year: 2022, km: 25000 },
        { id: '2', title: 'Audi Q7 2021', price: 48000, year: 2021, km: 35000 },
        { id: '3', title: 'Mercedes GLE 2023', price: 55000, year: 2023, km: 15000 }
      ];

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: text.foundCars.replace('{count}', '3'),
        isUser: false,
        timestamp: new Date(),
        carResults: mockCars
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  }, [inputValue, text.foundCars]);

  const handleSuggestionClick = (query: string) => {
    setInputValue(query);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <WidgetContainer $isOpen={isOpen}>
      {isOpen && (
        <ChatWindow>
          {/* Header */}
          <ChatHeader>
            <AvatarContainer>
              <AvatarImage>🚗</AvatarImage>
              <OnlineIndicator />
            </AvatarContainer>
            <HeaderInfo>
              <AssistantName>
                {text.name}
                <Sparkles size={16} />
              </AssistantName>
              <StatusText>{text.status}</StatusText>
            </HeaderInfo>
            <CloseButton onClick={() => setIsOpen(false)}>
              <X size={18} />
            </CloseButton>
          </ChatHeader>

          {/* Messages */}
          <MessagesContainer>
            {messages.map(message => (
              <MessageRow key={message.id} $isUser={message.isUser}>
                <MessageBubble $isUser={message.isUser}>
                  {message.text}
                  {message.carResults && (
                    <div>
                      {message.carResults.map(car => (
                        <CarResultCard key={car.id}>
                          <CarThumb>
                            <Car size={24} />
                          </CarThumb>
                          <CarInfo>
                            <CarTitle>{car.title}</CarTitle>
                            <CarMeta>{car.year} • {car.km.toLocaleString()} km</CarMeta>
                          </CarInfo>
                          <CarPrice>{car.price.toLocaleString()}€</CarPrice>
                        </CarResultCard>
                      ))}
                    </div>
                  )}
                </MessageBubble>
              </MessageRow>
            ))}

            {isTyping && (
              <MessageRow $isUser={false}>
                <TypingIndicator>
                  <TypingDot $delay={0} />
                  <TypingDot $delay={0.2} />
                  <TypingDot $delay={0.4} />
                </TypingIndicator>
              </MessageRow>
            )}

            <div ref={messagesEndRef} />
          </MessagesContainer>

          {/* Suggestions */}
          <SuggestionsContainer>
            {suggestions.map((sug, i) => (
              <SuggestionChip 
                key={i}
                onClick={() => handleSuggestionClick(sug.query[language])}
              >
                {sug.icon}
                {sug.text[language]}
              </SuggestionChip>
            ))}
          </SuggestionsContainer>

          {/* Input */}
          <InputArea>
            <InputWrapper>
              <Input
                ref={inputRef}
                type="text"
                placeholder={text.inputPlaceholder}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <IconButton $active={false}>
                <Mic />
              </IconButton>
            </InputWrapper>
            <IconButton 
              $primary 
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
            >
              <Send />
            </IconButton>
          </InputArea>
        </ChatWindow>
      )}

      {/* Floating Button */}
      <FloatingButton
        $hasNotification={hasNotification}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X /> : <MessageCircle />}
      </FloatingButton>
    </WidgetContainer>
  );
};

export default AIAssistantWidget;
