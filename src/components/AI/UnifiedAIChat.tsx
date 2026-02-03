// UnifiedAIChat.tsx
// Unified AI Chat Component - Merges RobotChatIcon and AIChatbotWidget

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Maximize2, Minimize2 } from 'lucide-react';
import { geminiChatService } from '../../services/ai/gemini-chat.service';
import { logger } from '../../services/logger-service';
import { useAuth } from '../../contexts/AuthProvider';
import { useLanguage } from '../../contexts/LanguageContext';
import { AIRobotIcon } from '../icons/AIRobotIcon';

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

const ChatPanel = styled(motion.div)<{
  $position: string;
  $offset: number;
  $panelBottom: number;
  $mobilePanelBottom: number;
  $isMaximized: boolean;
}>`
  position: fixed;
  ${p => p.$isMaximized 
    ? 'top: 16px; left: 16px; right: 16px; bottom: 16px;'
    : `
      ${p.$position === 'bottom-right' ? `right: ${p.$offset}px;` : `left: ${p.$offset}px;`}
      bottom: ${p.$panelBottom}px;
      width: 360px;
      max-height: min(70vh, calc(100vh - ${p.$panelBottom + 24}px));
      min-height: 320px;
    `
  }
  display: flex;
  flex-direction: column;
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'linear-gradient(180deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.95) 100%)'
      : 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)'};
  border-radius: ${p => p.$isMaximized ? '12px' : '18px'};
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  backdrop-filter: blur(16px);
  border: 1px solid
    ${({ theme }) =>
      theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'};
  z-index: 9999;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: 768px) {
    ${p => !p.$isMaximized && `
      width: calc(100vw - 32px);
      ${p.$position === 'bottom-right' ? `right: ${p.$offset - 8}px;` : `left: ${p.$offset - 8}px;`}
      bottom: ${p.$mobilePanelBottom}px;
      max-height: min(75vh, calc(100vh - ${p.$mobilePanelBottom + 20}px));
      min-height: 280px;
    `}
    ${p => p.$isMaximized && `
      top: 8px;
      left: 8px;
      right: 8px;
      bottom: 8px;
    `}
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
  flex-shrink: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const IconButton = styled.button`
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  display: grid;
  place-items: center;
  padding: 6px;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) =>
      theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const Title = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  color: ${({ theme }) => 
    theme.mode === 'dark' ? 'rgba(255,255,255,0.95)' : theme.colors.text.primary};
`;



const MessagesContainer = styled.div`
  padding: 12px 14px;
  flex: 1;
  min-height: 220px;
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
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
  color: ${({ theme, $role }) =>
    $role === 'user' 
      ? '#ffffff' 
      : theme.mode === 'dark'
        ? 'rgba(255,255,255,0.95)'
        : theme.colors.text.primary};
  background: ${({ theme, $role }) =>
    $role === 'user'
      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      : theme.mode === 'dark'
        ? 'rgba(255,255,255,0.08)'
        : 'rgba(0,0,0,0.04)'};
  border: 1px solid
    ${({ theme, $role }) =>
      $role === 'assistant'
        ? theme.mode === 'dark'
          ? 'rgba(255,255,255,0.12)'
          : 'rgba(0,0,0,0.06)'
        : 'transparent'};
  box-shadow: ${({ $role }) =>
    $role === 'user'
      ? '0 6px 18px rgba(102, 126, 234, 0.25)'
      : '0 4px 12px rgba(0, 0, 0, 0.08)'};
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
  padding: 12px 16px;
  border-radius: 12px;
  border: 2px solid
    ${({ theme }) =>
      theme.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'};
  background: ${({ theme }) =>
    theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.95)'};
  color: ${({ theme }) => 
    theme.mode === 'dark' ? 'rgba(255,255,255,0.95)' : theme.colors.text.primary};
  resize: none;
  font-size: 14px;
  font-family: inherit;
  line-height: 1.4;
  outline: none;
  transition: all 0.2s ease;

  &::placeholder {
    color: ${({ theme }) => 
      theme.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: 0 0 0 3px
      ${({ theme }) =>
        theme.mode === 'dark'
          ? 'rgba(14,165,233,0.18)'
          : 'rgba(14,165,233,0.12)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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

const StatusBar = styled.div`
  padding: 8px 14px;
  font-size: 12px;
  color: ${({ theme }) => 
    theme.mode === 'dark' ? 'rgba(255,255,255,0.6)' : theme.colors.text.secondary};
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
  color: ${({ theme }) => 
    theme.mode === 'dark' ? 'rgba(255,255,255,0.5)' : theme.colors.text.secondary};
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
  const [isMaximized, setIsMaximized] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const listRef = useRef<HTMLDivElement | null>(null);
  const panelBottom = bottom + 76; // button bottom + height + small gap
  const mobilePanelBottom = Math.max(80, bottom - 40 + 70); // mobile button bottom + height + gap, clamped

  const defaultTooltip = {
    bg: 'AI Асистент',
    en: 'AI Assistant'
  };

  const tooltipText = tooltip || defaultTooltip;

  // Welcome message when opening chat for the first time
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const baseGreeting = t('messaging.ai.greeting') ?? 'Hi! I can help you search cars, pricing, and marketplace tips.';
      
      // Add quota info for guests
      const quotaInfo = !user 
        ? (language === 'bg' 
            ? '\n\n📊 Като гост имате 3 безплатни съобщения на ден. Влезте в профила си за до 10 съобщения.'
            : '\n\n📊 As a guest, you have 3 free messages per day. Sign in for up to 10 messages.')
        : '';
      
      const welcomeMessage: ChatMessage = {
        id: `assistant-welcome-${Date.now()}`,
        role: 'assistant',
        text: baseGreeting + quotaInfo,
        createdAt: Date.now()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length, t, user, language]);

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
          userType: (user as any)?.profileType || 'visitor'
        }, user?.uid);

        if (!reply || reply.trim().length === 0) {
          throw new Error('Empty response from AI');
        }

        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: reply,
          createdAt: Date.now()
        };

        setMessages(prev => [...prev, assistantMessage]);
      } catch (error) {
        logger.error('[UnifiedAIChat] Failed to get reply', error as Error);
        const errorMessage = (error as Error)?.message || 'Unknown error';
        const isTimeout = errorMessage.includes('timeout') || errorMessage.includes('TIMEOUT');
        const isQuotaExceeded = errorMessage.includes('quota exceeded') || errorMessage.includes('resource-exhausted');
        const isAuthError = errorMessage.includes('not authenticated') || errorMessage.includes('unauthenticated');
        
        let fallbackText = '';
        
        if (isQuotaExceeded) {
          fallbackText = language === 'bg'
            ? (user 
                ? '📊 Достигнахте дневния си лимит от 10 съобщения. Опитайте отново утре.'
                : '📊 Достигнахте дневния лимит от 3 съобщения за гости. Влезте в профила си за до 10 съобщения на ден.')
            : (user
                ? '📊 You\'ve reached your daily limit of 10 messages. Try again tomorrow.'
                : '📊 You\'ve reached the guest limit of 3 messages per day. Sign in for up to 10 messages daily.');
        } else if (isTimeout) {
          fallbackText = language === 'bg'
            ? 'Времето изтече. Опитайте отново.'
            : 'Request timed out. Please try again.';
        } else {
          fallbackText = language === 'bg'
            ? 'Съжалявам, възникна грешка. Опитайте отново.'
            : 'Sorry, an error occurred. Please try again.';
        }
        
        const fallback: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: fallbackText,
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
    setIsOpen(prev => {
      if (prev) {
        // Reset maximize state when closing
        setIsMaximized(false);
      }
      return !prev;
    });
  }, []);

  const toggleMaximize = useCallback(() => {
    setIsMaximized(prev => !prev);
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
          <AIRobotIcon size={28} />
          
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
            $panelBottom={panelBottom}
            $mobilePanelBottom={mobilePanelBottom}
            $isMaximized={isMaximized}
            initial={{ opacity: 0, translateY: isMaximized ? 0 : 20, scale: isMaximized ? 0.95 : 1 }}
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            exit={{ opacity: 0, translateY: isMaximized ? 0 : 20, scale: isMaximized ? 0.95 : 1 }}
            transition={{ duration: 0.18 }}
          >
            <Header>
              <Title>
                <AIRobotIcon size={18} />
                {t('messaging.ai.title') ?? 'AI Assistant'}
              </Title>
              <HeaderActions>
                <IconButton 
                  onClick={toggleMaximize} 
                  aria-label={isMaximized ? 'Minimize chat' : 'Maximize chat'}
                  title={isMaximized 
                    ? (language === 'bg' ? 'Намали' : 'Minimize') 
                    : (language === 'bg' ? 'Увеличи' : 'Maximize')
                  }
                >
                  {isMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </IconButton>
                <IconButton onClick={toggleOpen} aria-label="Close chatbot">
                  <X size={18} />
                </IconButton>
              </HeaderActions>
            </Header>

            <MessagesContainer ref={listRef}>
              {messages.map(msg => (
                <Bubble key={msg.id} $role={msg.role}>
                  {msg.text}
                </Bubble>
              ))}
              {loading && (
                <Bubble $role="assistant">
                  <LoaderDot style={{ display: 'inline-block', marginRight: '4px' }} />
                  <LoaderDot style={{ display: 'inline-block', marginRight: '4px', animationDelay: '0.2s' }} />
                  <LoaderDot style={{ display: 'inline-block', animationDelay: '0.4s' }} />
                </Bubble>
              )}
            </MessagesContainer>

            <Composer onSubmit={handleSubmit}>
              <Input
                placeholder={t('messaging.ai.placeholder') ?? 'Ask me anything about cars, pricing, or the app...'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                disabled={loading}
                autoFocus={isOpen}
                rows={1}
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

