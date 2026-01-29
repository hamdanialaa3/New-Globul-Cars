import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Wand2 } from 'lucide-react';

import { logger } from '@/services/logger-service';
import { useAuth } from '@/contexts/AuthProvider';
import { useLanguage } from '@/contexts';
import { getAIReplyWithFailover } from '@/services/messaging/ai-failover.service';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  createdAt: number;
}

const FloatingButton = styled.button<{ $open: boolean }>`
  position: fixed;
  bottom: 232px; /* Positioned between Plus button (160px) and Message-circle button (304px) with 72px spacing */
  right: 32px; /* Aligned with other floating buttons */
  z-index: 9999;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #0ea5e9, #2563eb);
  color: #ffffff;
  box-shadow: 0 10px 30px rgba(14, 165, 233, 0.35);
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  ${({ $open }) =>
    $open &&
    css`
      transform: translateY(-6px) scale(1.03);
      box-shadow: 0 12px 40px rgba(37, 99, 235, 0.4);
    `}

  &:hover {
    transform: translateY(-4px) scale(1.02);
  }

  @media (max-width: 768px) {
    bottom: 200px; /* Positioned between Plus button (136px) and Message-circle button (264px) with 64px spacing */
    right: 24px; /* Aligned with other floating buttons on mobile */
  }
`;

const ChatPanel = styled(motion.div)`
  position: fixed;
  bottom: 302px; /* Positioned above the button (232px + 56px button height + 14px gap) */
  right: 32px; /* Aligned with the button */
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
    right: 24px; /* Aligned with the button on mobile */
    bottom: 270px; /* Positioned above the button (200px + 56px button height + 14px gap) */
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

export const AIChatbotWidget: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const listRef = useRef<HTMLDivElement | null>(null);

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
        const response = await getAIReplyWithFailover(
          content,
          { page: 'messages', language, userType: user?.profileType || 'visitor' },
          user?.uid,
          undefined
        );

        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text:
            response.text ||
            (t('messaging.ai.emptyResponse') ?? 'I could not generate a reply right now.'),
          createdAt: Date.now()
        };

        setMessages(prev => [...prev, assistantMessage]);
      } catch (error) {
        logger.error('[AIChatbotWidget] Failed to get reply', error as Error);
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
    setOpen(prev => !prev);
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
      <FloatingButton onClick={toggleOpen} aria-label="AI Assistant" $open={open}>
        {open ? <X size={22} /> : <Wand2 size={24} />}
      </FloatingButton>

      <AnimatePresence>
        {open && (
          <ChatPanel
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

export default AIChatbotWidget;
