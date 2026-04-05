import React, { useEffect, useState, useRef } from 'react';
import styled, { useTheme } from 'styled-components';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { bg, enUS } from 'date-fns/locale';
import { Send, Image, DollarSign, ArrowLeft, RefreshCw } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';

import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../contexts/AuthProvider';
import { logger } from '../../services/logger-service';
import { useRealtimeMessaging } from '../../hooks/messaging/useRealtimeMessaging';
import {
  RealtimeChannel,
  RealtimeMessage,
  realtimeMessagingService
} from '../../services/messaging/realtime';
import { userService } from '../../services/user/canonical-user.service';
import { Avatar } from '../../components/design-system/Avatar';
import { Badge } from '../../components/design-system/Badge';
import { notificationSoundService } from '../../services/messaging/notification-sound.service';
import { NotificationSettings } from '../../components/messaging/NotificationSettings';
import { MessageBubble } from '../../components/messaging/realtime/MessageBubble';
import { getCarLogoUrl } from '../../services/car-logo-service';
import Header from '../../components/Header/UnifiedHeader';
import { db } from '../../firebase/firebase-config';
import { toast } from 'react-toastify';
import { usePullToRefresh } from '../../hooks/useMobileInteractions';

const MessagesContainer = styled.div`
  position: fixed;
  top: 64px; /* Add space for header */
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 900; /* Below header (sticky: 1020) */
  padding: 0;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
    : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'};
  color: ${({ theme }) => theme.colors.text.primary};
  overflow: visible;

  @media (max-width: 768px) {
    top: 60px; /* Adjust for mobile header */
    padding: 0;
    background: ${({ theme }) => theme.mode === 'dark' ? '#0f172a' : '#ffffff'};
  }
`;

const PageContainer = styled.div`
  width: 100%;
  height: calc(100vh - 64px); /* Subtract header height */
  display: flex;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(30, 41, 59, 0.95)'
    : 'rgba(255, 255, 255, 0.95)'};
  border-radius: 0;
  box-shadow: none;
  overflow: visible;
  backdrop-filter: blur(20px);
  border: none;

  @media (max-width: 768px) {
    height: calc(100vh - 60px); /* Subtract mobile header height */
    width: 100vw;
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
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const HeaderTopRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;
`;

const ClearCacheButton = styled.button`
  padding: 8px 12px;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(239, 68, 68, 0.1)'
    : 'rgba(239, 68, 68, 0.08)'};
  border: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(239, 68, 68, 0.3)'
    : 'rgba(239, 68, 68, 0.2)'};
  border-radius: 6px;
  color: ${({ theme }) => theme.mode === 'dark' ? '#ef4444' : '#dc2626'};
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  flex-shrink: 0;
  
  &:hover {
    background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(239, 68, 68, 0.2)'
    : 'rgba(239, 68, 68, 0.15)'};
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  padding-left: 2.5rem;
  border: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.08)'};
  border-radius: ${({ theme }) => theme.colors.border.defaultRadius.full};
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

const CarLogoImage = styled.img`
  width: 16px;
  height: 16px;
  object-fit: contain;
  margin-right: 6px;
  flex-shrink: 0;
`;

const CarBadgeWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
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
  color: ${({ theme }) => theme.colors.text.secondary};
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

  // ✅ NEW: Use Realtime Messaging Hook
  const {
    channels: realtimeChannels,
    currentChannel,
    messages: realtimeMessages,
    isLoading: isMessagingLoading,
    error: messagingError,
    loadChannels,
    selectChannel,
    sendMessage: sendRealtimeMessage,
    markAsRead: markRealtimeAsRead,
    getOrCreateChannel,
  } = useRealtimeMessaging(
    (currentUser as any)?.numericId || null,
    currentUser?.uid || null
  );

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [, forceUpdate] = useState({});
  const [isClearing, setIsClearing] = useState(false);

  // 🔄 Force re-render when theme changes
  useEffect(() => {
    forceUpdate({});
  }, [theme.mode]);

  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  // ==================== CACHE CLEARING FUNCTION ====================
  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      logger.info('🧹 Starting cache clear operation...');
      
      // 1. Clear messaging service listeners
      realtimeMessagingService.cleanup();
      logger.info('✅ Cleared messaging service listeners');
      
      // 2. Force reload channels - pass the current user's Firebase ID
      if (currentUser?.uid) {
        // Add a small delay to ensure listeners are fully unsubscribed
        await new Promise(resolve => setTimeout(resolve, 500));
        await loadChannels(currentUser.uid as any);
        logger.info('✅ Reloaded channels from database');
      }
      
      // 3. Clear browser cache if available
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        logger.info('✅ Cleared browser caches', { count: cacheNames.length });
      }
      
      // 4. Clear localStorage messaging data
      const messagingKeys = Object.keys(localStorage).filter(key => 
        key.includes('msg') || key.includes('messaging') || key.includes('chat')
      );
      messagingKeys.forEach(key => localStorage.removeItem(key));
      logger.info('✅ Cleared localStorage messaging data', { count: messagingKeys.length });
      
      toast.success(
        language === 'bg'
          ? '✅ تم تنظيف الذاكرة المؤقتة بنجاح'
          : '✅ Cache cleared successfully'
      );
      
      logger.info('🎉 Cache clear operation completed successfully');
      
    } catch (error) {
      logger.error('❌ Failed to clear cache', error as Error);
      toast.error(
        language === 'bg'
          ? '❌ فشل تنظيف الذاكرة المؤقتة'
          : '❌ Failed to clear cache'
      );
    } finally {
      setIsClearing(false);
    }
  };

  // ✅ Pull-to-Refresh: Refresh function
  const handleRefreshConversations = async () => {
    if (!currentUser) return;

    try {
      logger.info('🔄 Pull-to-refresh: Refreshing conversations', { userId: currentUser.uid });
      
      // Clear cache and reload
      await handleClearCache();

      logger.info('✅ Pull-to-refresh: Conversations refreshed successfully');
    } catch (error) {
      logger.error('❌ Pull-to-refresh: Failed to refresh', error as Error);
    }
  };

  // Filter channels based on search query
  const filteredChannels = realtimeChannels.filter(conv => {
    const name = (conv.buyerNumericId === (currentUser as any)?.numericId ? conv.sellerName : conv.buyerName) || '';
    const carTitle = conv.carTitle || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      carTitle.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // ✅ Pull-to-Refresh: Container ref
  const pullToRefreshContainerRef = usePullToRefresh({
    onRefresh: handleRefreshConversations,
    threshold: 60
  });

  // End message ref for auto-scroll
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [realtimeMessages]);

  // ==================== CLEANUP ON UNMOUNT ====================
  useEffect(() => {
    return () => {
      // Cleanup listeners on unmount
      realtimeMessagingService.cleanup();
      logger.info('✅ Cleanup: Messaging service cleaned up');
    };
  }, []);

  useEffect(() => {
    // Hide Header/Footer
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');

    if (header) (header as HTMLElement).style.display = 'none';
    if (footer) (footer as HTMLElement).style.display = 'none';
    document.body.style.overflow = 'hidden';

    return () => {
      if (header) (header as HTMLElement).style.display = '';
      if (footer) (footer as HTMLElement).style.display = '';
      document.body.style.overflow = '';
    };
  }, []);

  // Play notification sound on new message received
  const previousMessagesCountRef = React.useRef(0);
  useEffect(() => {
    const prevCount = previousMessagesCountRef.current;

    if (realtimeMessages.length > prevCount && prevCount > 0) {
      const latestMessage = realtimeMessages[realtimeMessages.length - 1];

      // Only play sound for received messages (not sent by current user)
      if (latestMessage && latestMessage.senderNumericId !== (currentUser as any)?.numericId) {
        notificationSoundService.playNotification();
      }
    }

    // Update ref (doesn't trigger re-render)
    previousMessagesCountRef.current = realtimeMessages.length;
  }, [realtimeMessages, currentUser?.numericId]);

  const isMobile = window.innerWidth <= 768;
  const showSidebar = !isMobile || !currentChannel;
  const showChat = !isMobile || !!currentChannel;

  if (isMessagingLoading && realtimeChannels.length === 0) {
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
    <>
      <Header />
      <MessagesContainer ref={pullToRefreshContainerRef}>
        <PageContainer>
          <Sidebar $visible={showSidebar}>
            <SidebarHeader>
              <HeaderTopRow>
                <div style={{ position: 'relative', flex: 1 }}>
                  <SearchInput
                    placeholder={t('messages.search', 'Search messages...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <ClearCacheButton 
                  onClick={handleClearCache}
                  disabled={isClearing}
                  title={t('messages.clearCache', 'Clear cache')}
                >
                  <RefreshCw />
                  {isClearing ? 'Clearing...' : 'Clear'}
                </ClearCacheButton>
              </HeaderTopRow>
            </SidebarHeader>

            <ConversationList>
              {filteredChannels.length === 0 ? (
                <EmptyState>
                  <div className="icon-wrapper">
                    <Send size={48} />
                  </div>
                  <h3>{t('messages.noConversations', 'No conversations yet')}</h3>
                  <p>{t('messages.noConversationsDescription', 'Start a conversation by sending a message to a seller')}</p>
                </EmptyState>
              ) : (
                filteredChannels.map(conv => {
                  const isBuyer = conv.buyerNumericId === (currentUser as any)?.numericId;
                  const otherPid = isBuyer ? conv.sellerFirebaseId : conv.buyerFirebaseId;
                  const unread = conv.unreadCount?.[(currentUser as any)?.numericId || ''] || 0;
                  const name = isBuyer ? conv.sellerName : conv.buyerName;
                  const avatar = isBuyer ? conv.sellerAvatar : conv.buyerAvatar;

                  return (
                    <ConversationItem
                      key={conv.id}
                      $active={currentChannel?.id === conv.id}
                      onClick={() => {
                        selectChannel(conv.id);
                        if (isMobile) navigate('/messages', { replace: true });
                      }}
                    >
                      <Avatar src={avatar || undefined} name={name} size="md" />
                      <ConversationInfo>
                        <TopRow>
                          <UserName>{name}</UserName>
                          {conv.updatedAt && (
                            <Timestamp>
                              {formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: true, locale: language === 'bg' ? bg : enUS })}
                            </Timestamp>
                          )}
                        </TopRow>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <LastMessage>
                            {conv.lastMessage?.content || t('messages.startedChat', 'Started a chat')}
                          </LastMessage>
                          {unread > 0 && <Badge variant="primary" size="sm" $rounded>{unread}</Badge>}
                        </div>
                        {conv.carTitle && (
                          <CarBadgeWrapper>
                            <Badge variant="light" size="sm">
                              {conv.carImage && (
                                <CarLogoImage
                                  src={conv.carImage}
                                  alt={conv.carMake || 'Car'}
                                  onError={(e) => {
                                    const img = e.target as HTMLImageElement;
                                    if (!img.dataset.errorHandled) {
                                      img.dataset.errorHandled = 'true';
                                      img.src = '/assets/images/car-placeholder.svg';
                                    }
                                  }}
                                />
                              )}
                              {conv.carTitle}
                            </Badge>
                          </CarBadgeWrapper>
                        )}
                      </ConversationInfo>
                    </ConversationItem>
                  );
                })
              )}
            </ConversationList>
          </Sidebar>

          <ChatArea $visible={showChat}>
            {currentChannel ? (
              <>
                <ChatHeader>
                  <Avatar
                    src={(currentChannel.buyerNumericId === (currentUser as any)?.numericId ? currentChannel.sellerAvatar : currentChannel.buyerAvatar) || undefined}
                    name={currentChannel.buyerNumericId === (currentUser as any)?.numericId ? currentChannel.sellerName : currentChannel.buyerName}
                    size="md"
                  />
                  <ConversationInfo>
                    <UserName>{currentChannel.buyerNumericId === (currentUser as any)?.numericId ? currentChannel.sellerName : currentChannel.buyerName}</UserName>
                    <LastMessage>{currentChannel.carTitle}</LastMessage>
                  </ConversationInfo>
                </ChatHeader>
                <MessagesList>
                  {realtimeMessages.map((msg) => (
                    <MessageBubble
                      key={msg.id}
                      $sent={msg.senderNumericId === (currentUser as any)?.numericId}
                    >
                      {msg.content}
                      <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '4px', textAlign: 'right' }}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </MessageBubble>
                  ))}
                  <div ref={messagesEndRef} />
                </MessagesList>
                <InputArea onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newMessage.trim() || !currentUser) return;
                  const ok = await sendRealtimeMessage(newMessage);
                  if (ok) {
                    setNewMessage('');
                    notificationSoundService.playSent();
                  }
                }}>
                  <MessageInput
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={t('messages.typeSomething', 'Type a message...')}
                  />
                  <input
                    type="file"
                    id="chat-image-upload"
                    hidden
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file && currentUser) {
                        // In a real app, upload to storage first.
                        // For now, showcase the UI intent.
                        toast.info('Image upload initialized...');
                      }
                    }}
                  />
                  <IconButton
                    type="button"
                    onClick={() => document.getElementById('chat-image-upload')?.click()}
                    title={t('messages.sendImage', 'Send Image')}
                  >
                    <Image size={20} />
                  </IconButton>
                  <IconButton
                    type="button"
                    onClick={() => {
                      const amount = prompt(t('messages.enterOffer', 'Enter offer amount:'));
                      if (amount) sendRealtimeMessage(`I'm offering ${amount} EUR`);
                    }}
                    title={t('messages.makeOffer', 'Make Offer')}
                  >
                    <DollarSign size={20} />
                  </IconButton>
                  <IconButton type="submit" disabled={!newMessage.trim()}>
                    <Send size={20} />
                  </IconButton>
                </InputArea>
              </>
            ) : (
              <EmptyState>
                <div className="icon-wrapper">
                  <Send size={48} />
                </div>
                <h3>{t('messages.selectConversation', 'Select a conversation')}</h3>
                <p>{t('messages.selectConversationDescription', 'Choose a chat from the sidebar to start messaging')}</p>
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
    </>
  );
};

export default MessagesPage;
