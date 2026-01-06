// UnifiedAIChat.tsx
// مكون موحد لدمج RobotChatIcon و AIChatbotWidget في آلية واحدة
// Unified AI Chat Component - Merges RobotChatIcon and AIChatbotWidget

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Wand2 } from 'lucide-react';
import { geminiChatService } from '../../services/ai/gemini-chat.service';
import { logger } from '../../services/logger-service';
import { useAuth } from '../../contexts/AuthProvider';
import { useLanguage } from '../../contexts/LanguageContext';

// ==================== TYPES ====================

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  createdAt: number;
}

interface UnifiedAIChatProps {
  /** Position of the floating button */
  position?: 'bottom-right' | 'bottom-left';
  /** Custom bottom position (default: 304px) */
  bottom?: number;
  /** Custom right/left position (default: 32px) */
  offset?: number;
  /** Show badge for unread messages */
  showBadge?: boolean;
  /** Custom tooltip text */
  tooltip?: { bg: string; en: string };
}

// ==================== ANIMATIONS ====================

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
`;

// ==================== STYLED COMPONENTS ====================

const FloatingContainer = styled.div<{ $bottom: number; $offset: number; $position: string }>`
  position: fixed;
  ${p => p.$position === 'bottom-right' ? `right: ${p.$offset}px;` : `left: ${p.$offset}px;`}
  bottom: ${p => p.$bottom}px;
  z-index: 1000;
  
  @media (max-width: 768px) {
    ${p => p.$position === 'bottom-right' ? `right: ${p.$offset - 8}px;` : `left: ${p.$offset - 8}px;`}
    bottom: ${p => p.$bottom - 40}px;
  }
`;

const ChatButton = styled.button<{ $isActive: boolean }>`
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: none;
  padding: 0;
  cursor: pointer;
  
  background: ${props => props.$isActive 
    ? 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)'
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  };
  
  display: flex;
  align-items: center;
  justify-content: center;
  
  color: white;
  font-size: 32px;
  
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${props => props.$isActive ? 'none' : css`${float} 3s ease-in-out infinite`};
  
  box-shadow: 0 8px 24px ${props => props.$isActive 
    ? 'rgba(56, 189, 248, 0.4)' 
    : 'rgba(102, 126, 234, 0.4)'
  };
  
  &:hover {
    transform: translateY(-4px) scale(1.05);
    box-shadow: 0 12px 32px ${props => props.$isActive 
      ? 'rgba(56, 189, 248, 0.5)' 
      : 'rgba(102, 126, 234, 0.5)'
    };
  }
  
  &:active {
    transform: translateY(-2px) scale(0.98);
  }
  
  svg {
    stroke-width: 2;
  }
  
  @media (max-width: 768px) {
    width: 56px;
    height: 56px;
    font-size: 28px;
  }
`;

const Badge = styled.div<{ $show: boolean }>`
  position: absolute;
  top: -4px;
  right: -4px;
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  border-radius: 50%;
  border: 2px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  color: white;
  opacity: ${props => props.$show ? 1 : 0};
  transform: ${props => props.$show ? 'scale(1)' : 'scale(0)'};
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.5);
  
  @media (max-width: 768px) {
    width: 18px;
    height: 18px;
    font-size: 9px;
  }
`;

const Tooltip = styled.div<{ $show: boolean }>`
  position: absolute;
  bottom: calc(100% + 12px);
  ${p => p.$show ? 'right: 0;' : 'left: 0;'}
  background: rgba(15, 23, 42, 0.95);
  color: white;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  opacity: ${props => props.$show ? 1 : 0};
  transform: ${props => props.$show ? 'translateY(0)' : 'translateY(4px)'};
  pointer-events: none;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    ${p => p.$show ? 'right: 16px;' : 'left: 16px;'}
    border: 6px solid transparent;
    border-top-color: rgba(15, 23, 42, 0.95);
  }
  
  @media (max-width: 768px) {
    font-size: 12px;
    padding: 6px 12px;
  }
`;

const ChatPanel = styled(motion.div)<{ $position: string; $offset: number }>`
  position: fixed;
  ${p => p.$position === 'bottom-right' ? `right: ${p.$offset}px;` : `left: ${p.$offset}px;`}
  bottom: 380px; /* Positioned above the button */
  width: 360px;
  max-height: 70vh;
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'linear-gradient(180deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.95) 100%)'
      : 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)'};
  border-radius: 18px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  backdrop-filter: blur(16px);
  border: 1px solid
    ${({ theme }) =>
      theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'};
  z-index: 9999;

  @media (max-width: 768px) {
    width: calc(100vw - 32px);
    ${p => p.$position === 'bottom-right' ? `right: ${p.$offset - 8}px;` : `left: ${p.$offset - 8}px;`}
    bottom: 340px;
    max-height: 75vh;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: ${({ theme }) =>
    theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)'};
  border-bottom: 1px solid
    ${({ theme }) =>
      theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
`;

const Title = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const CloseButton = styled.button`
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  display: grid;
  place-items: center;
  padding: 6px;
  border-radius: 8px;

  &:hover {
    background: ${({ theme }) =>
      theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'};
  }
`;

const MessagesContainer = styled.div`
  padding: 12px 14px;
  height: 360px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) =>
      theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
    border-radius: 4px;
  }
`;

const Bubble = styled.div<{ $role: 'user' | 'assistant' }>`
  align-self: ${({ $role }) => ($role === 'user' ? 'flex-end' : 'flex-start')};
  max-width: 85%;
  padding: 12px 14px;
  border-radius: 14px;
  line-height: 1.45;
  color: ${({ theme, $role }) =>
    $role === 'user' ? '#0b1537' : theme.colors.text.primary};
  background: ${({ theme, $role }) =>
    $role === 'user'
      ? 'linear-gradient(135deg, #c2e9fb 0%, #a1c4fd 100%)'
      : theme.mode === 'dark'
        ? 'rgba(255,255,255,0.04)'
        : 'rgba(0,0,0,0.03)'};
  border: 1px solid
    ${({ theme, $role }) =>
      $role === 'assistant'
        ? theme.mode === 'dark'
          ? 'rgba(255,255,255,0.06)'
          : 'rgba(0,0,0,0.04)'
        : 'transparent'};
  box-shadow: ${({ $role }) =>
    $role === 'user'
      ? '0 6px 18px rgba(37, 99, 235, 0.16)'
      : '0 4px 12px rgba(0, 0, 0, 0.08)'};
  white-space: pre-wrap;
`;

const Composer = styled.form`
  padding: 12px 14px;
  border-top: 1px solid
    ${({ theme }) =>
      theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'};
  display: flex;
  gap: 10px;
  background: ${({ theme }) =>
    theme.mode === 'dark' ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.98)'};
`;

const Input = styled.textarea`
  flex: 1;
  min-height: 44px;
  max-height: 120px;
  padding: 12px 12px;
  border-radius: 12px;
  border: 1px solid
    ${({ theme }) =>
      theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'};
  background: ${({ theme }) =>
    theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(248,250,252,0.9)'};
  color: ${({ theme }) => theme.colors.text.primary};
  resize: vertical;
  font-size: 14px;
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: 0 0 0 3px
      ${({ theme }) =>
        theme.mode === 'dark'
          ? 'rgba(14,165,233,0.18)'
          : 'rgba(14,165,233,0.12)'};
  }
`;

const SendButton = styled.button<{ $disabled?: boolean }>`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #ffffff;
  display: grid;
  place-items: center;
  cursor: pointer;
  box-shadow: 0 10px 20px rgba(22, 163, 74, 0.25);
  transition: transform 0.12s ease, box-shadow 0.12s ease;

  &:hover {
    transform: translateY(-1px);
  }

  ${({ $disabled }) =>
    $disabled &&
    css`
      opacity: 0.5;
      cursor: not-allowed;
      box-shadow: none;
    `}
`;

const Suggestions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 14px 10px;
`;

const Suggestion = styled.button`
  border: 1px solid
    ${({ theme }) =>
      theme.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'};
  background: ${({ theme }) =>
    theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.9)'};
  color: ${({ theme }) => theme.colors.text.secondary};
  border-radius: 999px;
  padding: 8px 12px;
  font-size: 13px;
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary.main};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const StatusBar = styled.div`
  padding: 8px 14px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: 6px;
`;

const LoaderDot = styled.span`
  width: 8px;
  height: 8px;
  background: #22c55e;
  border-radius: 50%;
  display: inline-block;
  animation: pulse 1.1s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% { opacity: 0.3; transform: translateY(0); }
    50% { opacity: 1; transform: translateY(-2px); }
  }
`;

const Disclaimer = styled.div`
  padding: 8px 14px 12px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
  border-top: 1px dashed
    ${({ theme }) =>
      theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'};
`;

// ==================== COMPONENT ====================

export const UnifiedAIChat: React.FC<UnifiedAIChatProps> = ({
  position = 'bottom-right',
  bottom = 304,
  offset = 32,
  showBadge = false,
  tooltip
}) => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const listRef = useRef<HTMLDivElement | null>(null);

  const defaultTooltip = {
    bg: 'AI Асистент',
    en: 'AI Assistant'
  };

  const tooltipText = tooltip || defaultTooltip;

  const suggestions = useMemo(
    () => [
      t('messaging.ai.suggestions.search') ?? 'Find cars within €20k',
      t('messaging.ai.suggestions.price') ?? 'Estimate fair price for BMW 320d 2019',
      t('messaging.ai.suggestions.compare') ?? 'Compare Audi A4 vs BMW 3 Series',
      t('messaging.ai.suggestions.support') ?? 'How do I verify my profile?'
    ],
    [t]
  );

  const scrollToBottom = useCallback(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = useCallback(
    async (text?: string) => {
      const content = (text ?? input).trim();
      if (!content || loading) return;

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        text: content,
        createdAt: Date.now()
      };

      setMessages(prev => [...prev, userMessage]);
      setInput('');
      setLoading(true);

      try {
        const reply = await geminiChatService.chat(content, {
          page: 'messages',
          language,
          userType: user?.profileType || 'visitor'
        }, user?.uid);

        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: reply || (t('messaging.ai.emptyResponse') ?? 'I could not generate a reply right now.'),
          createdAt: Date.now()
        };

        setMessages(prev => [...prev, assistantMessage]);
      } catch (error) {
        logger.error('[UnifiedAIChat] Failed to get reply', error as Error);
        const fallback: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text:
            t('messaging.ai.error') ??
            'Sorry, I could not respond at the moment. Please try again in a few seconds.',
          createdAt: Date.now()
        };
        setMessages(prev => [...prev, fallback]);
      } finally {
        setLoading(false);
      }
    },
    [input, loading, language, t, user]
  );

  const toggleOpen = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      handleSend();
    },
    [handleSend]
  );

  return (
    <>
      <FloatingContainer $bottom={bottom} $offset={offset} $position={position}>
        <ChatButton
          $isActive={isOpen}
          onClick={toggleOpen}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          aria-label={isOpen 
            ? (language === 'bg' ? 'Затвори AI чат' : 'Close AI Chat')
            : (language === 'bg' ? 'Отвори AI чат' : 'Open AI Chat')
          }
        >
          <MessageCircle size={28} />
          
          <Badge $show={showBadge}>!</Badge>
        </ChatButton>
        
        <Tooltip $show={showTooltip && !isOpen}>
          {tooltipText[language as keyof typeof tooltipText] || tooltipText.en}
        </Tooltip>
      </FloatingContainer>

      <AnimatePresence>
        {isOpen && (
          <ChatPanel
            $position={position}
            $offset={offset}
            initial={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0, translateY: 20 }}
            transition={{ duration: 0.18 }}
          >
            <Header>
              <Title>
                <MessageCircle size={18} />
                {t('messaging.ai.title') ?? 'AI Assistant'}
              </Title>
              <CloseButton onClick={toggleOpen} aria-label="Close chatbot">
                <X size={18} />
              </CloseButton>
            </Header>

            <MessagesContainer ref={listRef}>
              {messages.length === 0 && (
                <Bubble $role="assistant">
                  {t('messaging.ai.greeting') ?? 'Hi! I can help you search cars, pricing, and marketplace tips.'}
                </Bubble>
              )}
              {messages.map(msg => (
                <Bubble key={msg.id} $role={msg.role}>
                  {msg.text}
                </Bubble>
              ))}
            </MessagesContainer>

            <Suggestions>
              {suggestions.map(suggestion => (
                <Suggestion key={suggestion} onClick={() => handleSend(suggestion)}>
                  {suggestion}
                </Suggestion>
              ))}
            </Suggestions>

            <Composer onSubmit={handleSubmit}>
              <Input
                placeholder={t('messaging.ai.placeholder') ?? 'Ask me anything about cars, pricing, or the app...'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
              />
              <SendButton type="submit" $disabled={loading || !input.trim()} aria-label="Send">
                <Send size={18} />
              </SendButton>
            </Composer>

            <StatusBar>
              {loading ? (
                <>
                  <LoaderDot /> {t('messaging.ai.thinking') ?? 'Thinking...'}
                </>
              ) : (
                t('messaging.ai.ready') ?? 'Ready to help'
              )}
            </StatusBar>

            <Disclaimer>
              {t('messaging.ai.disclaimer') ?? 'AI responses may contain inaccuracies. Always double-check critical info.'}
            </Disclaimer>
          </ChatPanel>
        )}
      </AnimatePresence>
    </>
  );
};

export default UnifiedAIChat;

