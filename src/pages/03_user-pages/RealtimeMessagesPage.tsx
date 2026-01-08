/**
 * 💬 RealtimeMessagesPage
 * صفحة الرسائل في الوقت الحقيقي
 * 
 * @description Full messaging page using Firebase Realtime Database
 * صفحة الرسائل الكاملة باستخدام Firebase Realtime Database
 * 
 * @author Claude Opus 4.5 - Chief Architect
 * @date January 8, 2026
 */

import React, { useEffect, useState, useCallback } from 'react';
import styledBase, { keyframes } from 'styled-components';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import { useAuth } from '../../contexts/AuthProvider';
import { useLanguage } from '../../contexts/LanguageContext';
import { logger } from '../../services/logger-service';
import { userService } from '../../services/user/canonical-user.service';
import { useRealtimeMessaging, usePresence, usePushNotifications } from '../../hooks/messaging';
import { ChannelList, ChatWindow } from '../../components/messaging/realtime';
import Header from '../../components/Header/UnifiedHeader';
import { BulgarianUser } from '../../types/user/bulgarian-user.types';

// Alias for styled-components
const styled = styledBase;

// ==================== ANIMATIONS ====================

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

// ==================== STYLED COMPONENTS ====================

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(145deg, #0f172a 0%, #1e293b 100%);
`;

const MessagesContainer = styled.div`
  display: flex;
  flex: 1;
  height: calc(100vh - 64px);
  animation: ${fadeIn} 0.3s ease;
  
  @media (max-width: 768px) {
    height: calc(100vh - 60px);
    flex-direction: column;
  }
`;

const Sidebar = styled.div<{ $isHidden?: boolean }>`
  width: 380px;
  min-width: 380px;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  
  @media (max-width: 1024px) {
    width: 320px;
    min-width: 320px;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    min-width: 100%;
    display: ${({ $isHidden }) => $isHidden ? 'none' : 'block'};
  }
`;

const ChatSection = styled.div<{ $isHidden?: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    display: ${({ $isHidden }) => $isHidden ? 'none' : 'flex'};
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 100;
  }
`;

const EmptyStateWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  text-align: center;
  background: rgba(15, 23, 42, 0.5);
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const EmptyIcon = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  
  svg {
    width: 60px;
    height: 60px;
    color: #60a5fa;
  }
`;

const EmptyTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 12px;
`;

const EmptyDescription = styled.p`
  font-size: 15px;
  color: #64748b;
  max-width: 400px;
  line-height: 1.6;
`;

// ==================== COMPONENT ====================

export const RealtimeMessagesPage: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const locale = language === 'bg' ? 'bg' : 'en';
  const [searchParams, setSearchParams] = useSearchParams();
  
  // User profile state (fetched from Firestore)
  const [userProfile, setUserProfile] = useState<BulgarianUser | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  
  // Get current channel from URL
  const channelIdFromUrl = searchParams.get('channel');
  
  // Mobile state
  const [showChat, setShowChat] = useState(!!channelIdFromUrl);
  
  // Fetch user profile when user changes
  useEffect(() => {
    let isActive = true;
    
    const fetchProfile = async () => {
      if (!user?.uid) {
        setUserProfile(null);
        setProfileLoading(false);
        return;
      }
      
      try {
        setProfileLoading(true);
        const profile = await userService.getUserProfile(user.uid);
        if (isActive) {
          setUserProfile(profile);
        }
      } catch (err) {
        logger.error('[RealtimeMessagesPage] Failed to fetch profile', err instanceof Error ? err : new Error(String(err)));
      } finally {
        if (isActive) {
          setProfileLoading(false);
        }
      }
    };
    
    fetchProfile();
    
    return () => {
      isActive = false;
    };
  }, [user?.uid]);
  
  // Get user's numeric ID
  const currentUserNumericId = userProfile?.numericId ?? null;
  const currentUserFirebaseId = user?.uid ?? null;
  
  // Initialize realtime messaging
  const {
    channels,
    currentChannel,
    messages,
    isLoading,
    error,
    selectChannel,
    sendMessage,
    sendOffer,
    sendImage,
  } = useRealtimeMessaging(currentUserNumericId, currentUserFirebaseId, {
    autoMarkAsRead: true,
  });
  
  // Initialize presence (only if user has numericId)
  usePresence(currentUserNumericId, {
    autoInitialize: true,
    device: 'desktop',
  });
  
  // Initialize push notifications
  usePushNotifications(currentUserFirebaseId, currentUserNumericId);
  
  // Translations
  const translations = {
    pageTitle: locale === 'bg' ? 'Съобщения | Globul Cars' : 'Messages | Globul Cars',
    emptyTitle: locale === 'bg' ? 'Изберете разговор' : 'Select a Conversation',
    emptyDesc: locale === 'bg'
      ? 'Изберете разговор от списъка вляво за да започнете да общувате'
      : 'Select a conversation from the list on the left to start chatting',
    errorTitle: locale === 'bg' ? 'Грешка' : 'Error',
    loginRequired: locale === 'bg' 
      ? 'Моля, влезте в профила си за да видите съобщенията' 
      : 'Please log in to view your messages',
  };
  
  // Handle channel selection
  const handleSelectChannel = useCallback((channelId: string) => {
    selectChannel(channelId);
    setSearchParams({ channel: channelId });
    setShowChat(true);
  }, [selectChannel, setSearchParams]);
  
  // Handle back (mobile)
  const handleBack = useCallback(() => {
    setShowChat(false);
    setSearchParams({});
  }, [setSearchParams]);
  
  // Auto-select channel from URL on mount
  useEffect(() => {
    if (channelIdFromUrl && channels.length > 0) {
      const channelExists = channels.find((c) => c.id === channelIdFromUrl);
      if (channelExists) {
        selectChannel(channelIdFromUrl);
        setShowChat(true);
      }
    }
  }, [channelIdFromUrl, channels, selectChannel]);
  
  // Log errors
  useEffect(() => {
    if (error) {
      logger.error('[RealtimeMessagesPage] Error', new Error(error));
    }
  }, [error]);
  
  // Require authentication
  if (!user || profileLoading) {
    return (
      <PageWrapper>
        <Header />
        <Helmet>
          <title>{translations.pageTitle}</title>
        </Helmet>
        <MessagesContainer>
          <EmptyStateWrapper style={{ flex: 1 }}>
            {profileLoading ? (
              <>
                <EmptyIcon>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                    <path d="M12 2a10 10 0 0 1 10 10" style={{ animation: 'spin 1s linear infinite' }} />
                  </svg>
                </EmptyIcon>
                <EmptyTitle>
                  {locale === 'bg' ? 'Зареждане...' : 'Loading...'}
                </EmptyTitle>
              </>
            ) : (
              <>
                <EmptyIcon>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm10-10V7a4 4 0 0 0-8 0v4h8z" />
                  </svg>
                </EmptyIcon>
                <EmptyTitle>
                  {locale === 'bg' ? 'Влезте в профила си' : 'Sign In Required'}
                </EmptyTitle>
                <EmptyDescription>
                  {translations.loginRequired}
                </EmptyDescription>
              </>
            )}
          </EmptyStateWrapper>
        </MessagesContainer>
      </PageWrapper>
    );
  }
  
  // Handle case where user has no numericId
  if (!currentUserNumericId) {
    return (
      <PageWrapper>
        <Header />
        <Helmet>
          <title>{translations.pageTitle}</title>
        </Helmet>
        <MessagesContainer>
          <EmptyStateWrapper style={{ flex: 1 }}>
            <EmptyIcon>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </EmptyIcon>
            <EmptyTitle>
              {locale === 'bg' ? 'Проблем с профила' : 'Profile Issue'}
            </EmptyTitle>
            <EmptyDescription>
              {locale === 'bg' 
                ? 'Профилът ви не е напълно конфигуриран. Моля, обновете профила си.'
                : 'Your profile is not fully configured. Please update your profile.'}
            </EmptyDescription>
          </EmptyStateWrapper>
        </MessagesContainer>
      </PageWrapper>
    );
  }
  
  return (
    <PageWrapper>
      <Helmet>
        <title>{translations.pageTitle}</title>
        <meta name="description" content={locale === 'bg' 
          ? 'Вашите съобщения и разговори с продавачи на автомобили' 
          : 'Your messages and conversations with car sellers'} 
        />
      </Helmet>
      
      <MessagesContainer>
        {/* Sidebar with channel list */}
        <Sidebar $isHidden={showChat}>
          <ChannelList
            channels={channels}
            activeChannelId={currentChannel?.id}
            currentUserNumericId={currentUserNumericId}
            isLoading={isLoading}
            onSelectChannel={handleSelectChannel}
          />
        </Sidebar>
        
        {/* Chat window or empty state */}
        {currentChannel ? (
          <ChatSection $isHidden={!showChat && window.innerWidth <= 768}>
            <ChatWindow
              channel={currentChannel}
              messages={messages}
              currentUserNumericId={currentUserNumericId}
              isLoading={isLoading}
              onSendMessage={sendMessage}
              onSendOffer={sendOffer}
              onSendImage={sendImage}
              onBack={handleBack}
            />
          </ChatSection>
        ) : (
          <EmptyStateWrapper>
            <EmptyIcon>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </EmptyIcon>
            <EmptyTitle>{translations.emptyTitle}</EmptyTitle>
            <EmptyDescription>{translations.emptyDesc}</EmptyDescription>
          </EmptyStateWrapper>
        )}
      </MessagesContainer>
    </PageWrapper>
  );
};

export default RealtimeMessagesPage;
