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
import { Send, Image as ImageIcon, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { bg, enUS } from 'date-fns/locale';

const MessagesContainer = styled.div`
  min-height: calc(100vh - 64px);
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.background.default};
  color: ${({ theme }) => theme.colors.text.primary};

  @media (max-width: 768px) {
    padding: 0;
    height: calc(100vh - 56px);
  }
`;

const PageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  height: 85vh;
  display: flex;
  background: ${({ theme }) => theme.mode === 'dark' ? theme.colors.grey[900] : theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? theme.colors.grey[800] : theme.colors.grey[200]};

  @media (max-width: 768px) {
    height: 100%;
    border-radius: 0;
    border: none;
    flex-direction: column;
  }
`;

const Sidebar = styled.div<{ $visible: boolean }>`
  width: 350px;
  border-right: 1px solid ${({ theme }) => theme.mode === 'dark' ? theme.colors.grey[800] : theme.colors.grey[200]};
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.mode === 'dark' ? theme.colors.grey[900] : theme.colors.background.paper};

  @media (max-width: 768px) {
    width: 100%;
    display: ${({ $visible }) => $visible ? 'flex' : 'none'};
    height: 100%;
    border-right: none;
  }
`;

const ChatArea = styled.div<{ $visible: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.mode === 'dark' ? theme.colors.grey[900] : theme.colors.grey[50]};

  @media (max-width: 768px) {
    width: 100%;
    display: ${({ $visible }) => $visible ? 'flex' : 'none'};
    height: 100%;
  }
`;

const SidebarHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.mode === 'dark' ? theme.colors.grey[800] : theme.colors.grey[200]};
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  padding-left: 2.5rem;
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? theme.colors.grey[700] : theme.colors.grey[300]};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background: ${({ theme }) => theme.mode === 'dark' ? theme.colors.grey[800] : theme.colors.background.input};
  color: ${({ theme }) => theme.colors.text.primary};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const ConversationList = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const ConversationItem = styled.div<{ $active: boolean }>`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.mode === 'dark' ? theme.colors.grey[800] : theme.colors.grey[200]};
  cursor: pointer;
  background: ${({ $active, theme }) => $active ? (theme.mode === 'dark' ? theme.colors.primary.dark + '30' : theme.colors.primary.light + '10') : 'transparent'};
  transition: background 0.2s;
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};

  &:hover {
    background: ${({ theme }) => theme.mode === 'dark' ? theme.colors.grey[800] : theme.colors.grey[100]};
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
  background: ${({ theme }) => theme.mode === 'dark' ? theme.colors.grey[900] : theme.colors.background.paper};
  border-bottom: 1px solid ${({ theme }) => theme.mode === 'dark' ? theme.colors.grey[800] : theme.colors.grey[200]};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const MessagesList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const MessageBubble = styled.div<{ $sent: boolean }>`
  max-width: 70%;
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: 12px;
  background: ${({ $sent, theme }) => $sent ? theme.colors.primary.main : (theme.mode === 'dark' ? theme.colors.grey[800] : theme.colors.grey[100])};
  color: ${({ $sent, theme }) => $sent ? 'white' : theme.colors.text.primary};
  align-self: ${({ $sent }) => $sent ? 'flex-end' : 'flex-start'};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  position: relative;
  word-wrap: break-word;
  border: 1px solid ${({ $sent, theme }) => $sent ? 'transparent' : (theme.mode === 'dark' ? theme.colors.grey[700] : 'transparent')};

  ${({ $sent }) => !$sent && `
    border-bottom-left-radius: 4px;
  `}
  ${({ $sent }) => $sent && `
    border-bottom-right-radius: 4px;
  `}
`;

const InputArea = styled.form`
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.mode === 'dark' ? theme.colors.grey[900] : theme.colors.background.paper};
  border-top: 1px solid ${({ theme }) => theme.mode === 'dark' ? theme.colors.grey[800] : theme.colors.grey[200]};
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;
`;

const MessageInput = styled.input`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? theme.colors.grey[700] : theme.colors.grey[300]};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background: ${({ theme }) => theme.mode === 'dark' ? theme.colors.grey[800] : theme.colors.background.input};
  color: ${({ theme }) => theme.colors.text.primary};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const IconButton = styled.button`
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.secondary};
  border-radius: 50%;
  
  &:hover {
    background: ${({ theme }) => theme.mode === 'dark' ? theme.colors.grey[800] : theme.colors.grey[100]};
    color: ${({ theme }) => theme.colors.primary.main};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoadingOverlay = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.text.secondary};
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

    const unsubscribe = advancedMessagingService.subscribeToUserConversations(
      currentUser.uid,
      (updatedConversations) => {
        setConversations(updatedConversations);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

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
  }, [currentUser, targetUserId, targetCarId, conversations, searchParams, initializing]);

  // Load messages for current conversation
  useEffect(() => {
    if (!currentConversation || !currentUser) return;

    const unsubscribe = advancedMessagingService.subscribeToMessages(
      currentConversation.id,
      (newMessages) => {
        setMessages(newMessages);

        // Mark as read
        if (newMessages.some(m => m.receiverId === currentUser.uid && m.status !== 'read')) {
          advancedMessagingService.markAsRead(currentConversation.id, currentUser.uid);
        }
      }
    );

    return () => unsubscribe();
  }, [currentConversation, currentUser]);

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
          {t('common.loading', 'Loading messages...')}
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
              <div style={{ padding: '2rem', textAlign: 'center', color: theme.colors.text.secondary }}>
                {t('messages.noConversations', 'No conversations yet')}
              </div>
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
                <div>
                  <UserName>{getUserName(selectedUserId)}</UserName>
                  {currentConversation.carTitle && (
                    <div style={{ fontSize: '0.8rem', color: theme.colors.text.secondary }}>
                      Ref: {currentConversation.carTitle}
                    </div>
                  )}
                </div>
              </ChatHeader>

              <MessagesList>
                {messages.map((msg, index) => {
                  const isMe = msg.senderId === currentUser?.uid;
                  return (
                    <MessageBubble key={msg.id || index} $sent={isMe}>
                      {msg.text}
                      <div style={{
                        fontSize: '0.65rem',
                        marginTop: '4px',
                        opacity: 0.8,
                        textAlign: 'right'
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
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: theme.colors.text.disabled, gap: '1rem' }}>
              <div style={{ padding: '2rem', background: theme.mode === 'dark' ? theme.colors.grey[800] : theme.colors.grey[200], borderRadius: '50%' }}>
                <Send size={48} />
              </div>
              <h3>{t('messages.selectToStart', 'Select a conversation to start messaging')}</h3>
            </div>
          )}
        </ChatArea>
      </PageContainer>
    </MessagesContainer>
  );
};

export default MessagesPage;
