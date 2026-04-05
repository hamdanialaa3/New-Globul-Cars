import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { formatDistanceToNow } from 'date-fns';
import { bg } from 'date-fns/locale';
import { MessagingColors, OnlineDot, TypingDot } from './messaging-styles';
import { presenceMonitor } from '@/services/messaging/core';
import { logger } from '@/services/logger-service';
import { useLanguage } from '@/contexts';

/**
 * Presence status type
 */
export type PresenceStatus = 'online' | 'offline' | 'away';

/**
 * Presence info
 */
export interface PresenceInfo {
  status: PresenceStatus;
  lastSeen?: Date;
  isTyping?: boolean;
}

interface PresenceIndicatorProps {
  userId: string;
  userName?: string;
  showLastSeen?: boolean;
  showTyping?: boolean;
  conversationId?: string;
  compact?: boolean;
  className?: string;
}

/**
 * Presence and typing indicator component
 * 
 * Displays:
 * - Connection status (online/offline/away)
 * - Last seen
 * - Typing indicator
 */
const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({
  userId,
  userName,
  showLastSeen = true,
  showTyping = true,
  conversationId,
  compact = false,
  className
}) => {
  const { language } = useLanguage();
  const [presence, setPresence] = useState<PresenceInfo | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  // Monitor presence status
  useEffect(() => {
    if (!userId) return;

    let isActive = true;

    const unsubscribe = presenceMonitor.watchUserPresence(
      userId,
      (presenceData) => {
        if (!isActive) return;

        if (presenceData) {
          setPresence({
            status: presenceData.status as PresenceStatus,
            lastSeen: presenceData.lastSeen ? new Date(presenceData.lastSeen) : undefined,
          });
        }
      }
    );

    return () => {
      isActive = false;
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch (error) {
          logger.warn('Error cleaning up presence listener', { userId, error });
        }
      }
    };
  }, [userId]);

  // Monitor typing status
  useEffect(() => {
    if (!showTyping || !conversationId) return;

    let isActive = true;

    const unsubscribe = presenceMonitor.watchConversationTyping(
      conversationId,
      (typingUsers) => {
        if (!isActive) return;
        
        // Check if user is typing
        const userIsTyping = typingUsers.some(id => id === userId);
        setIsTyping(userIsTyping);
      }
    );

    return () => {
      isActive = false;
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch (error) {
          logger.warn('Error cleaning up typing listener', { conversationId, error });
        }
      }
    };
  }, [showTyping, conversationId, userId]);

  // Format last seen
  const formatLastSeen = (lastSeen: Date) => {
    try {
      return formatDistanceToNow(lastSeen, { 
        locale: bg, 
        addSuffix: true 
      });
    } catch (error) {
      return language === 'bg' ? 'преди известно време' : 'some time ago';
    }
  };

  // Status text
  const getStatusText = () => {
    if (isTyping && showTyping) {
      return language === 'bg' ? 'Пише...' : 'Typing...';
    }

    if (!presence) {
      return language === 'bg' ? 'Офлайн' : 'Offline';
    }

    switch (presence.status) {
      case 'online':
        return language === 'bg' ? 'Онлайн' : 'Online';
      case 'away':
        return language === 'bg' ? 'Отсъстващ' : 'Away';
      case 'offline':
        if (showLastSeen && presence.lastSeen) {
          const lastSeenText = language === 'bg' ? 'последно видян' : 'last seen';
          return `${lastSeenText} ${formatLastSeen(presence.lastSeen)}`;
        }
        return language === 'bg' ? 'Офлайн' : 'Offline';
      default:
        return language === 'bg' ? 'Офлайн' : 'Offline';
    }
  };

  // Compact view
  if (compact) {
    return (
      <CompactContainer className={className}>
        <OnlineDot $status={presence?.status || 'offline'} />
      </CompactContainer>
    );
  }

  // Full view
  return (
    <Container className={className}>
      <StatusRow>
        <OnlineDot $status={presence?.status || 'offline'} />
        
        <StatusText $isTyping={isTyping}>
          {isTyping && showTyping ? (
            <>
              {userName || 'User'} {getStatusText()}
              <TypingAnimation>
                <TypingDot $delay={0} />
                <TypingDot $delay={0.2} />
                <TypingDot $delay={0.4} />
              </TypingAnimation>
            </>
          ) : (
            getStatusText()
          )}
        </StatusText>
      </StatusRow>
    </Container>
  );
};

// Version with avatar
interface PresenceWithAvatarProps extends PresenceIndicatorProps {
  avatarUrl?: string;
  avatarSize?: number;
}

const PresenceWithAvatar: React.FC<PresenceWithAvatarProps> = ({
  userId,
  userName,
  avatarUrl,
  avatarSize = 40,
  showLastSeen = true,
  showTyping = true,
  conversationId,
  className
}) => {
  return (
    <AvatarContainer className={className}>
      <AvatarWrapper $size={avatarSize}>
        {avatarUrl ? (
          <Avatar 
            src={avatarUrl} 
            alt={userName || 'User'} 
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/assets/default-avatar.png';
            }}
          />
        ) : (
          <AvatarPlaceholder>
            {userName?.charAt(0).toUpperCase() || '?'}
          </AvatarPlaceholder>
        )}
        
        <PresenceIndicator
          userId={userId}
          userName={userName}
          showLastSeen={showLastSeen}
          showTyping={showTyping}
          conversationId={conversationId}
          compact
        />
      </AvatarWrapper>
      
      <UserInfo>
        {userName && <UserName>{userName}</UserName>}
        <PresenceIndicator
          userId={userId}
          showLastSeen={showLastSeen}
          showTyping={showTyping}
          conversationId={conversationId}
        />
      </UserInfo>
    </AvatarContainer>
  );
};

// Styled Components
const Container = styled.div`
  display: inline-flex;
  align-items: center;
`;

const CompactContainer = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  bottom: 0;
  right: 0;
`;

const StatusRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatusText = styled.span<{ $isTyping?: boolean }>`
  font-size: 13px;
  color: ${props => props.$isTyping ? MessagingColors.typing : '#6B7280'};
  font-weight: ${props => props.$isTyping ? 500 : 400};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const TypingAnimation = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  margin-left: 4px;
`;

const AvatarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AvatarWrapper = styled.div<{ $size: number }>`
  position: relative;
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  flex-shrink: 0;
`;

const Avatar = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
`;

const AvatarPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #3B82F6 0%, #6366F1 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 16px;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const UserName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #003366;
`;

// Named export for barrel export
export { PresenceIndicator, PresenceWithAvatar };

// Export default for backward compatibility
export default PresenceIndicator;


