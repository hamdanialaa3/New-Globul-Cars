import React, { useEffect, useState, useRef } from 'react';
import styled, { useTheme } from 'styled-components';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../contexts/AuthProvider';
import { logger } from '../../services/logger-service';
import { advancedMessagingService, Conversation, Message } from '../../services/messaging/advanced-messaging-service';
import { userService } from '../../services/user/canonical-user.service';
import { Avatar } from '../../components/design-system/Avatar';
import { Badge } from '../../components/design-system/Badge';
import { Alert } from '../../components/design-system/Alert';
import { Send, Image as ImageIcon, Search, Settings } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { bg, enUS } from 'date-fns/locale';
import { notificationSoundService } from '../../services/messaging/notification-sound.service';
import { NotificationSettings } from '../../components/messaging/NotificationSettings';

const MessagesContainer = styled.div`
  min-height: calc(100vh - 64px);
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.mode === 'dark' 
    ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' 
    : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'};
  color: ${({ theme }) => theme.colors.text.primary};

  @media (max-width: 768px) {
    padding: 0;
    height: calc(100vh - 56px);
    background: ${({ theme }) => theme.mode === 'dark' ? '#0f172a' : '#ffffff'};
  }
`;

const PageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  height: 85vh;
  display: flex;
  background: ${({ theme }) => theme.mode === 'dark' 
    ? 'rgba(30, 41, 59, 0.95)' 
    : 'rgba(255, 255, 255, 0.95)'};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.mode === 'dark' 
    ? '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)' 
    : '0 20px 60px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.05)'};
  overflow: hidden;
  backdrop-filter: blur(20px);
  border: 1px solid ${({ theme }) => theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.08)' 
    : 'rgba(0, 0, 0, 0.06)'};

  @media (max-width: 768px) {
    height: 100%;
    border-radius: 0;
    border: none;
    flex-direction: column;
    backdrop-filter: none;
  }
`;

const Sidebar = styled.div<{ $visible: boolean }>`
  width: 380px;
  border-right: 1px solid ${({ theme }) => theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.08)' 
    : 'rgba(0, 0, 0, 0.06)'};
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.mode === 'dark' 
    ? 'rgba(15, 23, 42, 0.6)' 
    : 'rgba(248, 250, 252, 0.8)'};

  @media (max-width: 768px) {
    width: 100%;
    display: ${({ $visible }) => $visible ? 'flex' : 'none'};
    height: 100%;
    border-right: none;
    background: ${({ theme }) => theme.mode === 'dark' ? '#0f172a' : '#ffffff'};
  }
`;

const ChatArea = styled.div<{ $visible: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.mode === 'dark' 
    ? 'linear-gradient(180deg, rgba(15, 23, 42, 0.4) 0%, rgba(30, 41, 59, 0.4) 100%)' 
    : 'linear-gradient(180deg, rgba(248, 250, 252, 0.5) 0%, rgba(241, 245, 249, 0.5) 100%)'};
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${({ theme }) => theme.mode === 'dark'
      ? 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.02"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
      : 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%230066cc" fill-opacity="0.02"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'};
    opacity: 0.3;
    pointer-events: none;
  }

  @media (max-width: 768px) {
    width: 100%;
    display: ${({ $visible }) => $visible ? 'flex' : 'none'};
    height: 100%;
    background: ${({ theme }) => theme.mode === 'dark' ? '#0f172a' : '#f8fafc'};
  }
`;

const SidebarHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.08)' 
    : 'rgba(0, 0, 0, 0.06)'};
  background: ${({ theme }) => theme.mode === 'dark' 
    ? 'rgba(30, 41, 59, 0.4)' 
    : 'rgba(255, 255, 255, 0.6)'};
  backdrop-filter: blur(10px);
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  padding-left: 2.5rem;
  border: 1px solid ${({ theme }) => theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.08)'};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background: ${({ theme }) => theme.mode === 'dark' 
    ? 'rgba(15, 23, 42, 0.6)' 
    : 'rgba(255, 255, 255, 0.8)'};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 14px;
  transition: all 0.2s ease;
  
  &::placeholder {
    color: ${({ theme }) => theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.4)' 
      : 'rgba(0, 0, 0, 0.4)'};
  }
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
    background: ${({ theme }) => theme.mode === 'dark' 
      ? 'rgba(15, 23, 42, 0.8)' 
      : 'rgba(255, 255, 255, 1)'};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.mode === 'dark' 
      ? 'rgba(0, 102, 204, 0.15)' 
      : 'rgba(0, 102, 204, 0.1)'};
  }
`;

const ConversationList = styled.div`
  flex: 1;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.2)' 
      : 'rgba(0, 0, 0, 0.2)'};
    border-radius: 3px;
    
    &:hover {
      background: ${({ theme }) => theme.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.3)' 
        : 'rgba(0, 0, 0, 0.3)'};
    }
  }
`;

const ConversationItem = styled.div<{ $active: boolean }>`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.05)' 
    : 'rgba(0, 0, 0, 0.04)'};
  cursor: pointer;
  background: ${({ $active, theme }) => $active 
    ? (theme.mode === 'dark' 
        ? 'linear-gradient(90deg, rgba(0, 102, 204, 0.15) 0%, rgba(0, 102, 204, 0.08) 100%)' 
        : 'linear-gradient(90deg, rgba(0, 102, 204, 0.08) 0%, rgba(0, 102, 204, 0.04) 100%)')
    : 'transparent'};
  transition: all 0.2s ease;
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: ${({ $active, theme }) => $active ? theme.colors.primary.main : 'transparent'};
    transition: all 0.2s ease;
  }

  &:hover {
    background: ${({ theme }) => theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.05)' 
      : 'rgba(0, 0, 0, 0.03)'};
    
    &::before {
      width: ${({ $active }) => $active ? '3px' : '2px'};
      background: ${({ theme }) => theme.colors.primary.main};
      opacity: ${({ $active }) => $active ? 1 : 0.5};
    }
  }

  &:active {
    transform: scale(0.995);
  }
`;

const ConversationInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 4px;
`;

const UserName = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Timestamp = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.tertiary};
  flex-shrink: 0;
`;

const LastMessage = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
`;

const ChatHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.mode === 'dark' 
    ? 'linear-gradient(180deg, rgba(30, 41, 59, 0.95) 0%, rgba(30, 41, 59, 0.8) 100%)' 
    : 'linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.8) 100%)'};
  border-bottom: 1px solid ${({ theme }) => theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.08)' 
    : 'rgba(0, 0, 0, 0.06)'};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  backdrop-filter: blur(10px);
  z-index: 10;
  position: relative;
`;

const MessagesList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  z-index: 1;
  position: relative;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.15)' 
      : 'rgba(0, 0, 0, 0.15)'};
    border-radius: 4px;
    
    &:hover {
      background: ${({ theme }) => theme.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.25)' 
        : 'rgba(0, 0, 0, 0.25)'};
    }
  }
`;

const MessageBubble = styled.div<{ $sent: boolean }>`
  max-width: 70%;
  padding: 12px 16px;
  border-radius: ${({ $sent }) => $sent ? '18px 18px 4px 18px' : '18px 18px 18px 4px'};
  background: ${({ $sent, theme }) => $sent 
    ? 'linear-gradient(135deg, #0066CC 0%, #0052A3 100%)' 
    : (theme.mode === 'dark' 
        ? 'linear-gradient(135deg, rgba(51, 65, 85, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)' 
        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)')};
  color: ${({ $sent, theme }) => $sent ? '#ffffff' : theme.colors.text.primary};
  align-self: ${({ $sent }) => $sent ? 'flex-end' : 'flex-start'};
  box-shadow: ${({ $sent, theme }) => $sent 
    ? '0 4px 12px rgba(0, 102, 204, 0.25)' 
    : (theme.mode === 'dark' 
        ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
        : '0 4px 12px rgba(0, 0, 0, 0.08)')};
  position: relative;
  word-wrap: break-word;
  border: 1px solid ${({ $sent, theme }) => $sent 
    ? 'rgba(255, 255, 255, 0.1)' 
    : (theme.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.08)' 
        : 'rgba(0, 0, 0, 0.06)')};
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;
  animation: messageSlideIn 0.3s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: ${({ $sent, theme }) => $sent 
      ? '0 6px 16px rgba(0, 102, 204, 0.3)' 
      : (theme.mode === 'dark' 
          ? '0 6px 16px rgba(0, 0, 0, 0.4)' 
          : '0 6px 16px rgba(0, 0, 0, 0.12)')};
  }
  
  @keyframes messageSlideIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @media (max-width: 768px) {
    max-width: 85%;
  }
  ${({ $sent }) => $sent && `
    border-bottom-right-radius: 4px;
  `}
`;

const InputArea = styled.form`
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.mode === 'dark' 
    ? 'linear-gradient(180deg, rgba(30, 41, 59, 0.8) 0%, rgba(30, 41, 59, 0.95) 100%)' 
    : 'linear-gradient(180deg, rgba(248, 250, 252, 0.8) 0%, rgba(255, 255, 255, 0.95) 100%)'};
  border-top: 1px solid ${({ theme }) => theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.08)' 
    : 'rgba(0, 0, 0, 0.06)'};
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;
  backdrop-filter: blur(20px);
  z-index: 10;
  position: relative;
`;

const MessageInput = styled.input`
  flex: 1;
  padding: 12px 18px;
  border: 2px solid ${({ theme }) => theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.08)'};
  border-radius: 24px;
  background: ${({ theme }) => theme.mode === 'dark' 
    ? 'rgba(15, 23, 42, 0.6)' 
    : 'rgba(255, 255, 255, 0.9)'};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 14px;
  transition: all 0.2s ease;
  
  &::placeholder {
    color: ${({ theme }) => theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.3)' 
      : 'rgba(0, 0, 0, 0.3)'};
  }
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
    background: ${({ theme }) => theme.mode === 'dark' 
      ? 'rgba(15, 23, 42, 0.8)' 
      : 'rgba(255, 255, 255, 1)'};
    box-shadow: 0 0 0 4px ${({ theme }) => theme.mode === 'dark' 
      ? 'rgba(0, 102, 204, 0.2)' 
      : 'rgba(0, 102, 204, 0.15)'};
  }
`;

const IconButton = styled.button`
  background: ${({ theme }) => theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.08)' 
    : 'rgba(0, 0, 0, 0.04)'};
  border: 1px solid ${({ theme }) => theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.06)'};
  padding: 10px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.secondary};
  border-radius: 50%;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primary.main};
    color: white;
    border-color: ${({ theme }) => theme.colors.primary.main};
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 102, 204, 0.3);
  }
  
  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    background: ${({ theme }) => theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.03)' 
      : 'rgba(0, 0, 0, 0.02)'};
  }
`;

const LoadingOverlay = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  gap: 16px;
  
  .spinner {
    width: 48px;
    height: 48px;
    border: 4px solid ${({ theme }) => theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.1)' 
      : 'rgba(0, 0, 0, 0.1)'};
    border-top-color: ${({ theme }) => theme.colors.primary.main};
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  p {
    font-size: 1rem;
    color: ${({ theme }) => theme.colors.text.secondary};
    margin: 0;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px;
  text-align: center;
  
  .icon-wrapper {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: ${({ theme }) => theme.mode === 'dark' 
      ? 'linear-gradient(135deg, rgba(0, 102, 204, 0.15) 0%, rgba(0, 82, 163, 0.1) 100%)' 
      : 'linear-gradient(135deg, rgba(0, 102, 204, 0.1) 0%, rgba(0, 82, 163, 0.05) 100%)'};
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
    border: 2px solid ${({ theme }) => theme.mode === 'dark' 
      ? 'rgba(0, 102, 204, 0.2)' 
      : 'rgba(0, 102, 204, 0.15)'};
    
    svg {
      color: ${({ theme }) => theme.colors.primary.main};
      opacity: 0.8;
    }
  }
  
  h3 {
    font-size: 20px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text.primary};
    margin: 0 0 8px 0;
  }
  
  p {
    font-size: 14px;
    color: ${({ theme }) => theme.colors.text.secondary};
    margin: 0;
    max-width: 400px;
  }
`;

const MessagesPage: React.FC = () => {
  const theme = useTheme();
  const { t, language } = useTranslation();
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const targetUserId = searchParams.get('userId');
  const targetCarId = searchParams.get('carId');
  const targetCarTitle = searchParams.get('carTitle');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [profiles, setProfiles] = useState<{ [key: string]: any }>({});
  const [showSettings, setShowSettings] = useState(false);
  const [previousMessagesCount, setPreviousMessagesCount] = useState(0);

  // Refs for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversations
  useEffect(() => {
    if (!currentUser) return;

    logger.info('Setting up conversations subscription', { userId: currentUser.uid });

    const unsubscribe = advancedMessagingService.subscribeToUserConversations(
      currentUser.uid,
      (updatedConversations) => {
        setConversations(updatedConversations);
        setLoading(false);
      }
    );

    return () => {
      logger.info('Cleaning up conversations subscription', { userId: currentUser.uid });
      unsubscribe();
    };
  }, [currentUser?.uid]); // Only depend on user ID

  // Fetch profiles for conversations
  useEffect(() => {
    const fetchProfiles = async () => {
      const userIds = new Set<string>();
      conversations.forEach(c => {
        c.participants.forEach(p => {
          if (p !== currentUser?.uid) userIds.add(p);
        });
      });

      const newProfiles: { [key: string]: any } = { ...profiles };
      let changed = false;

      await Promise.all(Array.from(userIds).map(async (uid) => {
        if (!newProfiles[uid]) {
          try {
            const profile = await userService.getUserProfile(uid);
            if (profile) {
              newProfiles[uid] = profile;
              changed = true;
            }
          } catch (e) {
            logger.error('Failed to fetch profile', e as Error, { userId: uid });
          }
        }
      }));

      if (changed) {
        setProfiles(newProfiles);
      }
    };

    if (conversations.length > 0 && currentUser) {
      fetchProfiles();
    }
  }, [conversations, currentUser]); // Removed profiles from dep array to avoid loops, though logic prevents it

  // Handle URL parameters (create/find conversation)
  useEffect(() => {
    const initChat = async () => {
      if (!currentUser || initializing) return;

      const paramConversationId = searchParams.get('conversationId');

      // 1. If we have a direct conversation ID, try to find it
      if (paramConversationId) {
        const directConv = conversations.find(c => c.id === paramConversationId);
        if (directConv) {
          if (currentConversation?.id !== paramConversationId) {
            setCurrentConversation(directConv);
          }
          return;
        }
      }

      if (!targetUserId) return;

      // Don't create chat with self
      if (currentUser.uid === targetUserId) {
        alert(t('messages.cannotMessageSelf', 'You cannot message yourself'));
        navigate('/messages');
        return;
      }

      setInitializing(true);

      try {
        // 2. Check if we already have this conversation loaded
        const existingConv = conversations.find(c =>
          c.participants.includes(targetUserId) &&
          (!targetCarId || c.carId === targetCarId)
        );

        if (existingConv) {
          setCurrentConversation(existingConv);
        } else {
          // 3. Try to find/create on server
          await advancedMessagingService.createConversation(
            [currentUser.uid, targetUserId],
            {
              carId: targetCarId || undefined,
              carTitle: targetCarTitle || undefined
            }
          );
          // Wait for subscription to catch up
        }
      } catch (error) {
        logger.error('Failed to initialize chat', error as Error);
      } finally {
        setInitializing(false);
      }
    };

    initChat();
  }, [currentUser?.uid, targetUserId, targetCarId, conversations.length]); // Only depend on primitive values

  // Load messages for current conversation
  useEffect(() => {
    if (!currentConversation || !currentUser) {
      setMessages([]); // Clear messages when no conversation
      return;
    }

    logger.info('Setting up message subscription', { conversationId: currentConversation.id });

    let isActive = true; // Prevent state updates after unmount
    const unsubscribe = advancedMessagingService.subscribeToMessages(
      currentConversation.id,
      (newMessages) => {
        if (!isActive) return; // Ignore updates after cleanup
        
        setMessages(newMessages);

        // Mark as read only if we have unread messages
        if (newMessages.some(m => m.receiverId === currentUser.uid && m.status !== 'read')) {
          advancedMessagingService.markAsRead(currentConversation.id, currentUser.uid);
        }
      }
    );

    return () => {
      isActive = false; // Mark as inactive immediately
      logger.info('Cleaning up message subscription', { conversationId: currentConversation.id });
      unsubscribe(); // Then unsubscribe
    };
  }, [currentConversation?.id, currentUser?.uid]); // Only depend on IDs, not full objects

  // Play notification sound on new message received
  useEffect(() => {
    if (messages.length > previousMessagesCount && previousMessagesCount > 0) {
      const latestMessage = messages[messages.length - 1];
      
      // Only play sound for received messages (not sent by current user)
      if (latestMessage && latestMessage.receiverId === currentUser?.uid) {
        notificationSoundService.playNotification();
      }
    }
    
    // Update previous count
    setPreviousMessagesCount(messages.length);
  }, [messages, previousMessagesCount, currentUser?.uid]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !currentConversation) return;

    const text = newMessage;
    setNewMessage(''); // Optimistic clear

    try {
      const receiverId = currentConversation.participants.find(p => p !== currentUser.uid);
      if (receiverId) {
        await advancedMessagingService.sendMessage(
          currentConversation.id,
          currentUser.uid,
          receiverId,
          text
        );
      }
    } catch (error) {
      logger.error('Failed to send message', error as Error);
      setNewMessage(text); // Restore on error
      alert(t('messages.sendFailed', 'Failed to send message'));
    }
  };

  const selectedUserId = currentConversation?.participants.find(id => id !== currentUser?.uid);

  const getUserName = (uid?: string) => {
    if (!uid) return 'Unknown';
    if (profiles[uid]) {
      return profiles[uid].displayName || profiles[uid].name || 'User';
    }
    return uid.slice(0, 8) + '...';
  };

  const getUserAvatar = (uid?: string) => {
    if (!uid) return undefined;
    if (profiles[uid]) {
      return profiles[uid].photoURL || profiles[uid].avatarUrl;
    }
    return undefined;
  };

  const isMobile = window.innerWidth <= 768;
  const showSidebar = !isMobile || !currentConversation;
  const showChat = !isMobile || !!currentConversation;

  if (loading && !conversations.length) {
    return (
      <MessagesContainer>
        <LoadingOverlay>
          <div className="spinner" />
          <p>{t('common.loading', 'Loading messages...')}</p>
        </LoadingOverlay>
      </MessagesContainer>
    );
  }

  return (
    <MessagesContainer>
      <PageContainer>
        <Sidebar $visible={showSidebar}>
          <SidebarHeader>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '10px', top: '10px', color: theme.colors.text.disabled }} size={18} />
              <SearchInput placeholder={t('messages.search', 'Search messages...')} />
            </div>
          </SidebarHeader>

          <ConversationList>
            {conversations.length === 0 ? (
              <EmptyState>
                <div className="icon-wrapper">
                  <Send size={48} />
                </div>
                <h3>{t('messages.noConversations', 'No conversations yet')}</h3>
                <p>{t('messages.noConversationsDescription', 'Start a conversation by sending a message to a seller')}</p>
              </EmptyState>
            ) : (
              conversations.map(conv => {
                const otherPid = conv.participants.find(p => p !== currentUser?.uid);
                const unread = conv.unreadCount?.[currentUser?.uid || ''] || 0;
                const name = getUserName(otherPid);
                const avatar = getUserAvatar(otherPid);

                return (
                  <ConversationItem
                    key={conv.id}
                    $active={currentConversation?.id === conv.id}
                    onClick={() => {
                      setCurrentConversation(conv);
                      navigate('/messages', { replace: true });
                    }}
                  >
                    <Avatar src={avatar} name={name} size="md" />
                    <ConversationInfo>
                      <TopRow>
                        <UserName>{name}</UserName>
                        {conv.lastMessageAt && (
                          <Timestamp>
                            {formatDistanceToNow(conv.lastMessageAt.toDate(), { addSuffix: true, locale: language === 'bg' ? bg : enUS })}
                          </Timestamp>
                        )}
                      </TopRow>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <LastMessage>
                          {conv.lastMessage?.text || t('messages.startedChat', 'Started a chat')}
                        </LastMessage>
                        {unread > 0 && <Badge variant="primary" size="sm" rounded>{unread}</Badge>}
                      </div>
                      {conv.carTitle && (
                        <Badge variant="light" size="sm" style={{ marginTop: '4px' }}>
                          🚗 {conv.carTitle}
                        </Badge>
                      )}
                    </ConversationInfo>
                  </ConversationItem>
                );
              })
            )}
          </ConversationList>
        </Sidebar>

        <ChatArea $visible={showChat}>
          {currentConversation ? (
            <>
              <ChatHeader>
                {isMobile && (
                  <button onClick={() => setCurrentConversation(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>
                    ←
                  </button>
                )}
                <Avatar name={getUserName(selectedUserId)} src={getUserAvatar(selectedUserId)} size="md" />
                <div style={{ flex: 1 }}>
                  <UserName>{getUserName(selectedUserId)}</UserName>
                  {currentConversation.carTitle && (
                    <div style={{ fontSize: '0.8rem', color: theme.colors.text.secondary }}>
                      Ref: {currentConversation.carTitle}
                    </div>
                  )}
                </div>
                <IconButton 
                  onClick={() => setShowSettings(true)}
                  title={t('settings.notifications', 'Notification Settings')}
                >
                  <Settings size={20} />
                </IconButton>
              </ChatHeader>

              <MessagesList>
                {messages.map((msg, index) => {
                  const isMe = msg.senderId === currentUser?.uid;
                  return (
                    <MessageBubble key={msg.id || index} $sent={isMe}>
                      <div style={{ marginBottom: '4px', lineHeight: '1.5' }}>
                        {msg.text}
                      </div>
                      <div style={{
                        fontSize: '0.7rem',
                        opacity: isMe ? 0.9 : 0.7,
                        textAlign: 'right',
                        fontWeight: 500
                      }}>
                        {msg.createdAt && formatDistanceToNow(msg.createdAt, { addSuffix: true, locale: language === 'bg' ? bg : enUS })}
                      </div>
                    </MessageBubble>
                  );
                })}
                <div ref={messagesEndRef} />
              </MessagesList>

              <InputArea onSubmit={handleSendMessage}>
                <IconButton type="button">
                  <ImageIcon size={20} />
                </IconButton>
                <MessageInput
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={t('messages.typeMessage', 'Type a message...')}
                />
                <IconButton type="submit" disabled={!newMessage.trim()}>
                  <Send size={20} />
                </IconButton>
              </InputArea>
            </>
          ) : (
            <EmptyState>
              <div className="icon-wrapper">
                <Send size={56} />
              </div>
              <h3>{t('messages.selectToStart', 'Select a conversation')}</h3>
              <p>{t('messages.selectToStartDescription', 'Choose a conversation from the list to start messaging')}</p>
            </EmptyState>
          )}
        </ChatArea>
      </PageContainer>

      {/* Notification Settings Modal */}
      <NotificationSettings 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </MessagesContainer>
  );
};

export default MessagesPage;
