import { logger } from '../../../../services/logger-service';
/**
 * MessagesPage - Main messaging interface
 * Location: Bulgaria | Languages: BG/EN | Currency: EUR
 */

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthProvider';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { realtimeMessagingService, ChatRoom } from '../../../../services/realtimeMessaging';
import { userService } from '../../../../services/user/canonical-user.service';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import { MessageCircle, Search, Users } from 'lucide-react';

// ==================== STYLED COMPONENTS ====================

const Container = styled.div`
  display: flex;
  height: calc(100vh - 80px);
  background: #f8f9fa;
  max-width: 1400px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    flex-direction: column;
    height: calc(100vh - 60px);
  }
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    background: #0f172a;
  }
  
  /* Light Mode Support */
  html[data-theme="light"] & {
    background: #f8f9fa;
  }
`;

const Sidebar = styled.div<{ $isHidden?: boolean }>`
  width: 380px;
  background: white;
  border-right: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    width: 100%;
    display: ${p => p.$isHidden ? 'none' : 'flex'};
  }
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    background: #1e293b;
    border-right-color: rgba(148, 163, 184, 0.15);
  }
  
  /* Light Mode Support */
  html[data-theme="light"] & {
    background: white;
    border-right-color: #e9ecef;
  }
`;

const MainContent = styled.div<{ $isHidden?: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    display: ${p => p.$isHidden ? 'none' : 'flex'};
  }
`;

const SidebarHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
  
  h1 {
    font-size: 1.5rem;
    font-weight: 800;
    color: #212529;
    margin: 0 0 8px 0;
    display: flex;
    align-items: center;
    gap: 12px;
    
    svg {
      width: 28px;
      height: 28px;
      color: #FF7900;
    }
  }
  
  p {
    font-size: 0.9rem;
    color: #6c757d;
    margin: 0;
  }
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    border-bottom-color: rgba(148, 163, 184, 0.15);
    
    h1 {
      color: #e2e8f0;
    }
    
    p {
      color: #94a3b8;
    }
  }
  
  /* Light Mode Support */
  html[data-theme="light"] & {
    border-bottom-color: #e9ecef;
    
    h1 {
      color: #212529;
    }
    
    p {
      color: #6c757d;
    }
  }
`;

const SearchBar = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #e9ecef;
  position: relative;
  
  input {
    width: 100%;
    padding: 12px 16px 12px 44px;
    border: 1px solid #dee2e6;
    border-radius: 24px;
    font-size: 0.95rem;
    transition: all 0.2s;
    background: white;
    color: #212529;
    
    &:focus {
      outline: none;
      border-color: #FF7900;
      box-shadow: 0 0 0 3px rgba(255, 121, 0, 0.1);
    }
  }
  
  svg {
    position: absolute;
    left: 36px;
    top: 50%;
    transform: translateY(-50%);
    width: 18px;
    height: 18px;
    color: #6c757d;
    pointer-events: none;
  }
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    border-bottom-color: rgba(148, 163, 184, 0.15);
    
    input {
      background: #334155;
      border-color: rgba(148, 163, 184, 0.2);
      color: #e2e8f0;
      
      &::placeholder {
        color: #94a3b8;
      }
      
      &:focus {
        border-color: #FF7900;
        box-shadow: 0 0 0 3px rgba(255, 121, 0, 0.2);
      }
    }
    
    svg {
      color: #94a3b8;
    }
  }
  
  /* Light Mode Support */
  html[data-theme="light"] & {
    border-bottom-color: #e9ecef;
    
    input {
      background: white;
      border-color: #dee2e6;
      color: #212529;
    }
    
    svg {
      color: #6c757d;
    }
  }
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
  color: #6c757d;
  
  svg {
    width: 80px;
    height: 80px;
    margin-bottom: 24px;
    opacity: 0.3;
  }
  
  h2 {
    font-size: 1.3rem;
    font-weight: 700;
    margin-bottom: 12px;
    color: #495057;
  }
  
  p {
    font-size: 1rem;
    max-width: 400px;
    line-height: 1.6;
  }
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    color: #94a3b8;
    
    svg {
      opacity: 0.2;
    }
    
    h2 {
      color: #cbd5e1;
    }
    
    p {
      color: #94a3b8;
    }
  }
  
  /* Light Mode Support */
  html[data-theme="light"] & {
    color: #6c757d;
    
    h2 {
      color: #495057;
    }
    
    p {
      color: #6c757d;
    }
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #FF7900;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    .spinner {
      border-color: #334155;
      border-top-color: #FF7900;
    }
  }
  
  /* Light Mode Support */
  html[data-theme="light"] & {
    .spinner {
      border-color: #f3f3f3;
      border-top-color: #FF7900;
    }
  }
`;

// ==================== COMPONENT ====================

const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [searchParams] = useSearchParams();
  
  const [conversations, setConversations] = useState<ChatRoom[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ChatRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [recipientImages, setRecipientImages] = useState<{ [userId: string]: string }>({});
  const [directConversation, setDirectConversation] = useState<ChatRoom | null>(null);
  
  // ✅ NEW: Load conversation directly from URL if not in list
  useEffect(() => {
    if (!user || !conversationIdFromUrl || selectedConversation) return;
    
    const loadDirectConversation = async () => {
      try {
        const conv = await realtimeMessagingService.getConversationById(conversationIdFromUrl);
        if (conv) {
          logger.debug('Loaded conversation directly from URL', { conversationId: conversationIdFromUrl });
          setDirectConversation(conv);
          setSelectedConversation(conv);
          setShowMobileChat(true);
          
          // Also add to conversations list if not there
          setConversations(prev => {
            if (!prev.find(c => c.id === conversationIdFromUrl)) {
              return [conv, ...prev];
            }
            return prev;
          });
        }
      } catch (error) {
        logger.debug('Could not load conversation directly', { conversationId: conversationIdFromUrl, error });
      }
    };
    
    loadDirectConversation();
  }, [user, conversationIdFromUrl, selectedConversation]);
  
  // Load recipient images
  useEffect(() => {
    if (!user || conversations.length === 0) return;
    
    const loadRecipientImages = async () => {
      const imageMap: { [userId: string]: string } = {};
      
      for (const conversation of conversations) {
        const recipientId = conversation.participants.find(id => id !== user.uid);
        if (recipientId && !imageMap[recipientId]) {
          try {
            const recipientProfile = await userService.getUserProfile(recipientId);
            if (recipientProfile) {
              const imageUrl = recipientProfile.photoURL || 
                              (recipientProfile.profileImage && typeof recipientProfile.profileImage === 'object' 
                                ? recipientProfile.profileImage.url 
                                : recipientProfile.profileImage) ||
                              '';
              if (imageUrl) {
                imageMap[recipientId] = imageUrl;
              }
            }
          } catch (error) {
            logger.debug('Failed to load recipient image', { recipientId, error });
          }
        }
      }
      
      setRecipientImages(prev => ({ ...prev, ...imageMap }));
    };
    
    loadRecipientImages();
  }, [user, conversations]);
  
  // Get URL params
  const carIdFromUrl = searchParams.get('carId');
  const conversationIdFromUrl = searchParams.get('conversation');
  
  // Debug logging
  useEffect(() => {
    if (conversationIdFromUrl) {
      logger.debug('MessagesPage: conversationId from URL', { conversationId: conversationIdFromUrl, carId: carIdFromUrl });
    }
  }, [conversationIdFromUrl, carIdFromUrl]);
  
  // ==================== EFFECTS ====================
  
  // Load conversations and select from URL
  useEffect(() => {
    if (!user) return;
    
    const loadConversations = async () => {
      try {
        setLoading(true);
        logger.debug('Loading conversations for user', { userId: user.uid, conversationId: conversationIdFromUrl });
        
        const chatRooms = await realtimeMessagingService.getUserChatRooms(user.uid);
        logger.debug('Loaded chatRooms', { count: chatRooms.length, rooms: chatRooms.map(r => r.id) });
        setConversations(chatRooms);
        
        // ✅ FIX: If conversationId in URL, try to find it
        if (conversationIdFromUrl) {
          logger.debug('Looking for conversation from URL', { conversationId: conversationIdFromUrl });
          let found = chatRooms.find(room => room.id === conversationIdFromUrl);
          
          if (found) {
            logger.debug('Found conversation in chatRooms', { conversationId: conversationIdFromUrl });
            setSelectedConversation(found);
            setShowMobileChat(true);
          } else {
            // ✅ FIX: Try to get conversation directly from conversations collection
            logger.debug('Conversation not found in chatRooms, trying conversations collection', { conversationId: conversationIdFromUrl });
            const conversation = await realtimeMessagingService.getConversationById(conversationIdFromUrl);
            
            if (conversation) {
              logger.debug('Found conversation in conversations collection', { conversationId: conversationIdFromUrl });
              // Add to conversations list if not already there
              if (!chatRooms.find(r => r.id === conversationIdFromUrl)) {
                setConversations([conversation, ...chatRooms]);
              }
              setSelectedConversation(conversation);
              setShowMobileChat(true);
            } else {
              // If still not found, wait a bit and reload (conversation might be creating)
              logger.warn('Conversation not found, waiting and retrying...', { conversationId: conversationIdFromUrl });
              setTimeout(async () => {
                const updatedChatRooms = await realtimeMessagingService.getUserChatRooms(user.uid);
                setConversations(updatedChatRooms);
                const foundAfterReload = updatedChatRooms.find(room => room.id === conversationIdFromUrl);
                if (foundAfterReload) {
                  logger.debug('Found conversation after reload', { conversationId: conversationIdFromUrl });
                  setSelectedConversation(foundAfterReload);
                  setShowMobileChat(true);
                } else {
                  // Last attempt: try conversations collection again
                  const conversationRetry = await realtimeMessagingService.getConversationById(conversationIdFromUrl);
                  if (conversationRetry) {
                    logger.debug('Found conversation on retry', { conversationId: conversationIdFromUrl });
                    setConversations([conversationRetry, ...updatedChatRooms]);
                    setSelectedConversation(conversationRetry);
                    setShowMobileChat(true);
                  } else {
                    logger.error('Conversation not found after all attempts', { conversationId: conversationIdFromUrl });
                  }
                }
              }, 1000);
            }
          }
        }
      } catch (error) {
        logger.error('Failed to load conversations:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadConversations();
    
    // Listen to real-time updates
    const unsubscribe = realtimeMessagingService.listenToChatRooms(
      user.uid,
      (updatedChatRooms) => {
        setConversations(updatedChatRooms);
        
        // Update selected conversation if it exists
        if (selectedConversation) {
          const updated = updatedChatRooms.find(room => room.id === selectedConversation.id);
          if (updated) {
            setSelectedConversation(updated);
          }
        }
        
        // ✅ FIX: If we're waiting for a conversation from URL, check again
        if (conversationIdFromUrl) {
          const found = updatedChatRooms.find(room => room.id === conversationIdFromUrl);
          if (found && !selectedConversation) {
            setSelectedConversation(found);
            setShowMobileChat(true);
          } else if (!found && !selectedConversation) {
            // Try to get from conversations collection
            realtimeMessagingService.getConversationById(conversationIdFromUrl).then(conv => {
              if (conv) {
                setConversations([conv, ...updatedChatRooms]);
                setSelectedConversation(conv);
                setShowMobileChat(true);
              }
            }).catch(() => {
              // Conversation doesn't exist
            });
          }
        }
      }
    );
    
    return () => {
      unsubscribe();
    };
  }, [user, conversationIdFromUrl, carIdFromUrl]);
  
  // ==================== HANDLERS ====================
  
  const handleConversationSelect = useCallback((conversation: ChatRoom) => {
    setSelectedConversation(conversation);
    setShowMobileChat(true);
  }, []);
  
  const handleBackToList = useCallback(() => {
    setShowMobileChat(false);
    setSelectedConversation(null);
  }, []);
  
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);
  
  // ==================== RENDER HELPERS ====================
  
  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    
    const participantNames = Object.values(conv.participantNames || {}).join(' ').toLowerCase();
    return participantNames.includes(searchQuery.toLowerCase());
  });
  
  const renderSidebar = () => (
    <Sidebar $isHidden={showMobileChat}>
      <SidebarHeader>
        <h1>
          <MessageCircle />
          {t('messages.title')}
        </h1>
        <p>{t('messages.subtitle')}</p>
      </SidebarHeader>
      
      <SearchBar>
        <Search />
        <input
          type="text"
          placeholder={t('messages.search')}
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </SearchBar>
      
      {loading ? (
        <LoadingSpinner>
          <div className="spinner" />
        </LoadingSpinner>
      ) : filteredConversations.length > 0 ? (
        <ConversationList
          conversations={filteredConversations}
          selectedId={selectedConversation?.id}
          onSelect={handleConversationSelect}
          currentUserId={user.uid}
          recipientImages={recipientImages}
        />
      ) : searchQuery ? (
        <EmptyState>
          <Search />
          <h2>{language === 'bg' ? 'Няма резултати' : 'No results'}</h2>
          <p>{language === 'bg' ? 'Не са намерени разговори, отговарящи на търсенето.' : 'No conversations match your search.'}</p>
        </EmptyState>
      ) : (
        <EmptyState>
          <Users />
          <h2>{t('messages.noConversations')}</h2>
          <p>{t('messages.startConversationHint')}</p>
        </EmptyState>
      )}
    </Sidebar>
  );
  
  const renderMainContent = () => {
    // ✅ FIX: Use directConversation if available (loaded from URL)
    const activeConversation = selectedConversation || directConversation;
    
    // ✅ FIX: If conversationId in URL but not loaded yet, show loading
    if (conversationIdFromUrl && !activeConversation) {
      return (
        <MainContent>
          <LoadingSpinner>
            <div className="spinner" />
          </LoadingSpinner>
        </MainContent>
      );
    }
    
    if (!activeConversation) {
      return (
        <MainContent>
          <EmptyState>
            <MessageCircle />
            <h2>{t('messages.selectConversation')}</h2>
            <p>{t('messages.selectConversationHint')}</p>
          </EmptyState>
        </MainContent>
      );
    }
    
    // Get recipient info
    const recipientId = activeConversation.participants.find(id => id !== user?.uid) || activeConversation.participants[0] || '';
    const recipientName = activeConversation.participantNames?.[recipientId] || 'Unknown';
    const recipientImage = recipientImages[recipientId] || undefined;
    const carId = carIdFromUrl || activeConversation.carId;
    const carTitle = activeConversation.carTitle;
    
    // ✅ FIX: Don't render if we don't have valid recipientId
    if (!recipientId || !user) {
      return (
        <MainContent>
          <EmptyState>
            <MessageCircle />
            <h2>{t('messages.selectConversation')}</h2>
            <p>{t('messages.selectConversationHint')}</p>
          </EmptyState>
        </MainContent>
      );
    }
    
    return (
      <MainContent $isHidden={!showMobileChat}>
        <ChatWindow
          conversationId={activeConversation.id}
          recipientId={recipientId}
          recipientName={recipientName}
          recipientImage={recipientImage}
          carId={carId}
          carTitle={carTitle}
          onBack={handleBackToList}
        />
      </MainContent>
    );
  };
  
  // ==================== RENDER ====================
  
  if (!user) {
    return (
      <Container>
        <Sidebar>
          <SidebarHeader>
            <h1>
              <MessageCircle />
              {t('messages.title')}
            </h1>
            <p>{t('messages.subtitle')}</p>
          </SidebarHeader>
          <EmptyState>
            <MessageCircle />
            <h2>{t('messages.loginRequired')}</h2>
            <p>{t('messages.loginRequiredHint')}</p>
          </EmptyState>
        </Sidebar>
        <MainContent>
          <EmptyState>
            <MessageCircle />
            <h2>{t('messages.loginRequired')}</h2>
            <p>{t('messages.loginRequiredHint')}</p>
          </EmptyState>
        </MainContent>
      </Container>
    );
  }
  
  return (
    <Container>
      {renderSidebar()}
      {renderMainContent()}
    </Container>
  );
};

export default MessagesPage;
