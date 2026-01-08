import React, { useEffect, useState, useRef } from 'react';
import styled, { useTheme } from 'styled-components';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { bg } from 'date-fns/locale/bg';
import { enUS } from 'date-fns/locale/en-US';
import { Send } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';

import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../contexts/AuthProvider';
import { logger } from '../../services/logger-service';
import { advancedMessagingService } from '../../services/messaging/advanced-messaging-service';
import { Conversation, Message } from '../../services/messaging/advanced-messaging-types';
import { userService } from '../../services/user/canonical-user.service';
import { Avatar } from '../../components/design-system/Avatar';
import { Badge } from '../../components/design-system/Badge';
import { notificationSoundService } from '../../services/messaging/notification-sound.service';
import { NotificationSettings } from '../../components/messaging/NotificationSettings';
import { ConversationView } from '../../components/messaging';
import { getCarLogoUrl } from '../../services/car-logo-service';
import Header from '../../components/Header/UnifiedHeader';
import { db } from '../../firebase/firebase-config';
import { toast } from 'react-toastify';

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
  
  // ✅ NEW: Support numeric ID routing - /messages/:id1/:id2
  const { id1, id2 } = useParams<{ id1?: string; id2?: string }>();

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
  // previousMessagesCount moved to useRef to prevent infinite loop
  
  // ✅ NEW: State for numeric ID resolution
  const [resolvedConversationId, setResolvedConversationId] = useState<string | null>(null);
  const [resolutionError, setResolutionError] = useState<string | null>(null);
  const [isResolvingNumericIds, setIsResolvingNumericIds] = useState(false);

  // 🚨 CRITICAL: Validate currentConversation whenever it changes
  useEffect(() => {
    if (currentConversation && (!currentConversation.id || currentConversation.id.length !== 20)) {
      console.log('🚨 INVALID CONVERSATION DETECTED IN STATE - CLEARING!', {
        conversationId: currentConversation.id,
        idLength: currentConversation.id?.length
      });
      
      logger.error('🚨 INVALID CONVERSATION IN STATE - CLEARING!', new Error('Invalid conversation'), {
        conversationId: currentConversation.id,
        idLength: currentConversation.id?.length,
        participants: currentConversation.participants
      });
      
      // Clear invalid conversation from state
      setCurrentConversation(null);
      
      // Show user-friendly message
      toast.error(
        language === 'bg'
          ? 'Грешка в системата. Моля презаредете страницата.'
          : 'System error. Please refresh the page.'
      );
    }
  }, [currentConversation, language]);

  // Refs for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // ✅ إخفاء Header و Footer عند فتح الصفحة
  useEffect(() => {
    // البحث عن Header بكل الطرق الممكنة
    const header = document.querySelector('header');
    const nav = document.querySelector('nav');
    const footer = document.querySelector('footer');
    const mainLayout = document.querySelector('[class*="MainLayout"]');
    const headerWrapper = document.querySelector('[class*="HeaderWrapper"]');
    
    // حفظ الحالات الأصلية
    const originalStyles = {
      header: header ? (header as HTMLElement).style.display : '',
      nav: nav ? (nav as HTMLElement).style.display : '',
      footer: footer ? (footer as HTMLElement).style.display : '',
      bodyPaddingTop: document.body.style.paddingTop,
      bodyPaddingBottom: document.body.style.paddingBottom,
      bodyOverflow: document.body.style.overflow
    };

    // إخفاء Header/Footer
    if (header) (header as HTMLElement).style.display = 'none';
    if (nav) (nav as HTMLElement).style.display = 'none';
    if (footer) (footer as HTMLElement).style.display = 'none';
    if (headerWrapper) (headerWrapper as HTMLElement).style.display = 'none';
    
    // إزالة padding من body
    document.body.style.paddingTop = '0';
    document.body.style.paddingBottom = '0';
    document.body.style.overflow = 'hidden';

    // Cleanup: إعادة كل شيء عند المغادرة
    return () => {
      if (header) (header as HTMLElement).style.display = originalStyles.header;
      if (nav) (nav as HTMLElement).style.display = originalStyles.nav;
      if (footer) (footer as HTMLElement).style.display = originalStyles.footer;
      if (headerWrapper) (headerWrapper as HTMLElement).style.display = '';
      
      document.body.style.paddingTop = originalStyles.bodyPaddingTop;
      document.body.style.paddingBottom = originalStyles.bodyPaddingBottom;
      document.body.style.overflow = originalStyles.bodyOverflow;
    };
  }, []);

  // ✅ NEW: Resolve numeric IDs to conversation
  useEffect(() => {
    const resolveNumericIdsToConversation = async () => {
      if (!currentUser) return;
      
      // Path 1: Numeric ID route - /messages/:id1/:id2
      if (id1 && id2) {
        setIsResolvingNumericIds(true);
        logger.info('🔍 Resolving numeric ID path to conversation', { 
          id1, 
          id2, 
          currentUserUid: currentUser.uid 
        });

        try {
          // Convert numeric IDs to Firebase UIDs
          const usersRef = collection(db, 'users');
          
          // Find user 1 - try both Number and String types
          let q1 = query(usersRef, where('numericId', '==', parseInt(id1)));
          let snapshot1 = await getDocs(q1);
          
          if (snapshot1.empty) {
            logger.warn('User not found as Number, trying String', { id1 });
            q1 = query(usersRef, where('numericId', '==', id1));
            snapshot1 = await getDocs(q1);
          }
          
          if (snapshot1.empty) {
            throw new Error(`User with numericId ${id1} not found (tried both Number and String types)`);
          }
          const user1Uid = snapshot1.docs[0].id;
          
          // Find user 2 - try both Number and String types
          let q2 = query(usersRef, where('numericId', '==', parseInt(id2)));
          let snapshot2 = await getDocs(q2);
          
          if (snapshot2.empty) {
            logger.warn('User not found as Number, trying String', { id2 });
            q2 = query(usersRef, where('numericId', '==', id2));
            snapshot2 = await getDocs(q2);
          }
          
          if (snapshot2.empty) {
            throw new Error(`User with numericId ${id2} not found`);
          }
          const user2Uid = snapshot2.docs[0].id;
          
          logger.info('✅ Resolved numeric IDs to UIDs', { 
            id1, 
            id2, 
            user1Uid, 
            user2Uid 
          });
          
          // ✅ FIX: Find or create conversation between these users
          let conversation = await advancedMessagingService.findConversationByParticipants(
            [user1Uid, user2Uid]
          );
          
          let conversationId: string;
          
          if (!conversation) {
            logger.info('📝 Creating new conversation between users', { 
              user1Uid, 
              user2Uid 
            });
            
            // Create new conversation - createConversation returns conversation ID (string)
            const carId = searchParams.get('car');
            conversationId = await advancedMessagingService.createConversation(
              [user1Uid, user2Uid],
              {
                carId: carId || undefined
              }
            );
            
            logger.info('✅ New conversation created', { 
              conversationId,
              participants: [user1Uid, user2Uid]
            });
            
            // ✅ Wait for Firestore to propagate the new conversation with retry
            let retryCount = 0;
            const maxRetries = 5;
            while (retryCount < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, 300));
              const retryConv = await advancedMessagingService.findConversationByParticipants(
                [user1Uid, user2Uid]
              );
              if (retryConv) {
                logger.info('✅ Conversation confirmed after retry', { retryCount });
                break;
              }
              retryCount++;
            }
          } else {
            conversationId = conversation.id;
            logger.info('✅ Found existing conversation', { 
              conversationId,
              participants: conversation.participants
            });
          }
          
          setResolvedConversationId(conversationId);
          setResolutionError(null);
          
          logger.info('✅ Successfully resolved to conversation', { 
            conversationId,
            willWaitForSubscription: !conversation 
          });
          
        } catch (error: any) {
          logger.error('❌ Failed to resolve numeric IDs', error, { id1, id2 });
          setResolutionError(
            language === 'bg' 
              ? 'Грешка при зареждане на съобщенията. Моля опитайте по-късно.'
              : 'Failed to open conversation. Please try again later.'
          );
          
          toast.error(
            language === 'bg'
              ? 'Грешка при отваряне на разговора'
              : 'Error opening conversation'
          );
        } finally {
          setIsResolvingNumericIds(false);
        }
      }
      // Path 2: Direct conversation ID (existing flow)
      else if (searchParams.get('conversationId')) {
        const convId = searchParams.get('conversationId')!;
        setResolvedConversationId(convId);
        logger.info('📨 Using direct conversation ID', { convId });
      }
      // Path 3: Legacy userId param (create conversation)
      else if (targetUserId) {
        logger.info('🔄 Legacy userId param detected - will create conversation', { 
          targetUserId 
        });
        // Handled by existing initializeConversation logic below
      }
    };

    resolveNumericIdsToConversation();
  }, [id1, id2, searchParams, currentUser, language]);

  // ✅ Connect resolvedConversationId to currentConversation
  useEffect(() => {
    if (!resolvedConversationId) return;
    
    // Skip if already set
    if (currentConversation?.id === resolvedConversationId) {
      logger.debug('Current conversation already matches resolved ID');
      return;
    }
    
    // Try to find in loaded conversations
    const conv = conversations.find(c => c.id === resolvedConversationId);
    if (conv) {
      logger.info('🔗 Setting current conversation from resolved ID', { 
        resolvedConversationId,
        participants: conv.participants,
        conversationId: conv.id,
        idLength: conv.id?.length
      });
      setCurrentConversation(conv);
      return;
    }
    
    // ✅ If not found in list, fetch it directly (new conversation or not yet in subscription)
    const fetchConversation = async () => {
      try {
        logger.info('📥 Conversation not in list, fetching directly', { 
          resolvedConversationId,
          conversationsCount: conversations.length 
        });
        
        const conversationData = await advancedMessagingService.getConversationById(resolvedConversationId);
        
        if (conversationData) {
          logger.info('✅ Fetched conversation data directly', { 
            id: conversationData.id, 
            participants: conversationData.participants,
            idLength: conversationData.id?.length,
            isValidFormat: conversationData.id?.length === 20
          });
          setCurrentConversation(conversationData);
        } else {
          logger.warn('⚠️ Conversation not found in Firestore', { resolvedConversationId });
          // Wait a bit and retry (conversation might be propagating)
          setTimeout(async () => {
            logger.info('🔄 Retrying conversation fetch...');
            const retryData = await advancedMessagingService.getConversationById(resolvedConversationId);
            if (retryData) {
              logger.info('✅ Retry successful');
              setCurrentConversation(retryData);
            } else {
              logger.error('❌ Conversation still not found after retry');
            }
          }, 1000);
        }
      } catch (error) {
        logger.error('Failed to fetch conversation', error as Error, { resolvedConversationId });
      }
    };
    
    // Only fetch if conversations are loaded but this one is missing (newly created)
    if (conversations.length >= 0) { // Always try for new conversations
      fetchConversation();
    }
  }, [resolvedConversationId, conversations, currentConversation?.id]);

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
        // 🚨 EMERGENCY DEBUG: Check incoming conversations
        console.log('🚨 CONVERSATIONS RECEIVED:', updatedConversations.map(c => ({
          id: c.id,
          idLength: c.id?.length,
          participants: c.participants,
          isUIDasID: c.participants?.includes(c.id)
        })));

        // DEBUG: Log loaded conversations WITH VALIDATION
        logger.info('📬 Conversations received in MessagesPage', {
          count: updatedConversations.length,
          ids: updatedConversations.map(c => c.id),
          firstConv: updatedConversations[0] ? {
            id: updatedConversations[0].id,
            idLength: updatedConversations[0].id?.length,
            isValidFormat: updatedConversations[0].id?.length === 20,
            participants: updatedConversations[0].participants
          } : null
        });
        
        // ⚠️ CRITICAL: Validate all conversation IDs before setting state
        const validConversations = updatedConversations.filter(c => {
          if (!c.id || c.id.length !== 20) {
            logger.error('❌ Invalid conversation ID detected in subscription!', new Error('Invalid ID'), {
              conversationId: c.id,
              idLength: c.id?.length,
              participants: c.participants
            });
            return false;
          }
          return true;
        });
        
        if (validConversations.length !== updatedConversations.length) {
          logger.warn(`⚠️ Filtered out ${updatedConversations.length - validConversations.length} invalid conversations`);
        }
        
        setConversations(validConversations);
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
  // Using useRef to avoid dependency loop
  const previousMessagesCountRef = React.useRef(0);
  
  useEffect(() => {
    const prevCount = previousMessagesCountRef.current;
    
    if (messages.length > prevCount && prevCount > 0) {
      const latestMessage = messages[messages.length - 1];
      
      // Only play sound for received messages (not sent by current user)
      if (latestMessage && latestMessage.receiverId === currentUser?.uid) {
        notificationSoundService.playNotification();
      }
    }
    
    // Update ref (doesn't trigger re-render)
    previousMessagesCountRef.current = messages.length;
  }, [messages, currentUser?.uid]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !currentConversation) return;

    // 🚨 EMERGENCY DEBUG: Use console.log directly to bypass logger issues
    console.log('🚨 SEND MESSAGE DEBUG:', {
      conversationId: currentConversation.id,
      idLength: currentConversation.id?.length,
      participants: currentConversation.participants,
      isUID: currentConversation.participants?.includes(currentConversation.id),
      fullConversation: currentConversation
    });

    // Debug: Log current conversation details BEFORE validation
    logger.info('📤 Attempting to send message - PRE VALIDATION', {
      conversationId: currentConversation.id,
      conversationIdType: typeof currentConversation.id,
      participants: currentConversation.participants,
      idLength: currentConversation.id?.length,
      isString: typeof currentConversation.id === 'string',
      conversationObject: JSON.stringify(currentConversation).substring(0, 200)
    });

    // Debug: Log current conversation details
    logger.info('📤 Attempting to send message', {
      conversationId: currentConversation.id,
      participants: currentConversation.participants,
      idLength: currentConversation.id?.length,
      isValidFirestoreId: currentConversation.id?.length === 20 // Firestore IDs are 20 chars
    });

    // ⚠️ Validate conversation ID - should NOT be a user UID
    if (!currentConversation.id || currentConversation.id.length !== 20) {
      logger.error('❌ Invalid conversation ID - wrong format!', new Error('Invalid conversation format'), {
        conversationId: currentConversation.id,
        participants: currentConversation.participants,
        idLength: currentConversation.id?.length
      });
      alert('خطأ في المحادثة. يرجى إعادة تحميل الصفحة.');
      return;
    }

    if (currentConversation.participants?.includes(currentConversation.id)) {
      logger.error('❌ Invalid conversation ID - matches a participant UID!', new Error('Conversation ID is a UID'), {
        conversationId: currentConversation.id,
        participants: currentConversation.participants
      });
      alert('خطأ في المحادثة. يرجى إعادة تحميل الصفحة.');
      return;
    }

    const text = newMessage;
    setNewMessage(''); // Optimistic clear

    try {
      const receiverId = currentConversation.participants.find(p => p !== currentUser.uid);
      if (!receiverId) {
        const error = new Error('No receiver found');
        logger.error('❌ No receiver found in conversation', error, {
          participants: currentConversation.participants,
          currentUserId: currentUser.uid
        });
        throw error;
      }

      logger.info('📤 Sending message to Firestore', {
        conversationId: currentConversation.id,
        senderId: currentUser.uid,
        receiverId: receiverId,
        textLength: text.length
      });

      await advancedMessagingService.sendMessage(
        currentConversation.id,
        currentUser.uid,
        receiverId,
        text
      );
      
      logger.info('✅ Message sent successfully');
      notificationSoundService.playSent();
    } catch (error) {
      logger.error('❌ Failed to send message', error as Error, {
        conversationId: currentConversation.id,
        errorMessage: (error as Error).message
      });
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
  
  // ✅ NEW: Show loading while resolving numeric IDs
  if (isResolvingNumericIds) {
    return (
      <MessagesContainer>
        <LoadingOverlay>
          <div className="spinner" />
          <p>{language === 'bg' ? 'جاري فتح المحادثة...' : 'Opening conversation...'}</p>
        </LoadingOverlay>
      </MessagesContainer>
    );
  }
  
  // ✅ NEW: Show error if numeric ID resolution failed
  if (resolutionError) {
    return (
      <MessagesContainer>
        <LoadingOverlay>
          <div style={{ color: '#ef4444', textAlign: 'center' }}>
            <h3>❌ {resolutionError}</h3>
            <button 
              onClick={() => navigate('/messages')}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                background: '#ff8f10',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              {language === 'bg' ? 'العودة للصندوق' : 'Back to Inbox'}
            </button>
          </div>
        </LoadingOverlay>
      </MessagesContainer>
    );
  }

  return (
    <>
      <Header />
      <MessagesContainer>
        <PageContainer>
          <Sidebar $visible={showSidebar}>
            <SidebarHeader>
              <div style={{ position: 'relative' }}>
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
                        {unread > 0 && <Badge variant="primary" size="sm" $rounded>{unread}</Badge>}
                      </div>
                      {conv.carTitle && (
                        <CarBadgeWrapper>
                          <Badge variant="light" size="sm">
                            {conv.carLogoUrl ? (
                              <CarLogoImage 
                              src={conv.carLogoUrl} 
                              alt={conv.carMake || 'Car'} 
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = conv.carMake 
                                  ? getCarLogoUrl(conv.carMake) 
                                  : '/assets/images/professional_car_logos/mein_logo_rest.png';
                              }}
                            />
                          ) : conv.carMake ? (
                            <CarLogoImage 
                              src={getCarLogoUrl(conv.carMake)} 
                              alt={conv.carMake}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/assets/images/professional_car_logos/mein_logo_rest.png';
                              }}
                            />
                          ) : null}
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
          {currentConversation ? (
            /* ✨ المكونات الجديدة - ConversationView مع كامل الميزات */
            <ConversationView
              conversation={currentConversation}
              onBack={() => {
                setCurrentConversation(null);
                navigate('/messages');
              }}
            />
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
    </>
  );
};

export default MessagesPage;