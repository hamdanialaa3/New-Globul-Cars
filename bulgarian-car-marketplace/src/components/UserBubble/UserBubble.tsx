// src/components/UserBubble/UserBubble.tsx
// User Bubble Component - Circular user display
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import React, { useState } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { 
  MessageCircle, 
  UserPlus, 
  UserCheck,
  CheckCircle
} from 'lucide-react';

// ==================== ANIMATIONS ====================

const gentleFloat = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const onlinePulse = keyframes`
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(76, 175, 80, 0);
  }
`;

// ==================== STYLED COMPONENTS ====================

const BubbleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  animation: ${gentleFloat} 0.4s ease-out;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  transform: translateZ(0);
  z-index: 1; /* ✅ Base z-index */
  
  /* ✅ FIX: Bring hovered bubble to front */
  &:hover {
    z-index: 999; /* ✅ CRITICAL: Hover card appears ABOVE all other users */
  }
`;

const BubbleWrapper = styled.div<{ $isOnline: boolean }>`
  position: relative;
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-4px) scale(1.05);
    
    .quick-actions {
      opacity: 1;
      pointer-events: all;
    }
    
    .hover-card {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }
  }
  
  &:active {
    transform: translateY(-2px) scale(1.02);
  }
`;

const BubbleAvatar = styled.div<{ 
  $imageUrl?: string; 
  $size: number;
  $borderColor: string;
  $isOnline: boolean;
  $initial: string;
}>`
  width: ${p => p.$size}px;
  height: ${p => p.$size}px;
  border-radius: 50%;
  background: ${props => props.$imageUrl 
    ? `url(${props.$imageUrl})` 
    : 'linear-gradient(135deg, #FF8F10 0%, #FF7900 50%, #FF6600 100%)'
  };
  background-size: cover;
  background-position: center;
  border: 3px solid ${p => p.$borderColor};
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.15),
    0 0 0 ${p => p.$isOnline ? '3px' : '0'} rgba(76, 175, 80, 0.3);
  position: relative;
  overflow: hidden;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  transform: translateZ(0);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${p => p.$size * 0.4}px;
  font-weight: 800;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  
  ${p => p.$isOnline && css`
    animation: ${onlinePulse} 2s ease-in-out infinite;
  `}
  
  &::before {
    content: '${p => !p.$imageUrl ? p.$initial : ''}';
  }
`;

const OnlineIndicator = styled.div<{ $status: 'online' | 'away' | 'offline' }>`
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: ${p => {
    switch (p.$status) {
      case 'online': return '#4CAF50';
      case 'away': return '#FFC107';
      default: return '#9E9E9E';
    }
  }};
  border: 3px solid white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  z-index: 2;
`;

const VerifiedBadge = styled.div`
  position: absolute;
  top: -4px;
  right: -4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1976D2 0%, #0D47A1 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.4);
  z-index: 3;
`;

const UserName = styled.div`
  margin-top: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #212529;
  text-align: center;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
`;

const UserRole = styled.div<{ $type: string }>`
  font-size: 0.7rem;
  color: ${p => {
    switch (p.$type) {
      case 'dealer': return '#16a34a';
      case 'company': return '#1d4ed8';
      default: return '#6c757d';
    }
  }};
  font-weight: 500;
  margin-top: 2px;
`;

const QuickActions = styled.div`
  position: absolute;
  top: -12px;
  right: -12px;
  display: flex;
  gap: 6px; /* ✅ More spacing */
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
  z-index: 50; /* ✅ Above avatar but below hover card */
`;

const QuickActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: ${p => p.$variant === 'primary' 
    ? 'linear-gradient(135deg, #FF7900 0%, #FF9533 100%)' 
    : 'white'};
  color: ${p => p.$variant === 'primary' ? 'white' : '#6c757d'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.15);
    box-shadow: 0 4px 12px rgba(255, 121, 0, 0.3);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const HoverCard = styled.div`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(16px);
  width: 300px; /* ✅ Wider for better readability */
  background: white;
  border-radius: 16px;
  padding: 24px; /* ✅ More padding */
  box-shadow: 
    0 0 0 1px rgba(255, 143, 16, 0.12), /* ✅ Orange subtle border */
    0 12px 48px rgba(0, 0, 0, 0.25), /* ✅ Stronger shadow */
    0 0 80px rgba(255, 143, 16, 0.15); /* ✅ Orange glow */
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 9999; /* ✅ CRITICAL FIX: Very high z-index to appear above everything */
  pointer-events: none;
  
  /* ✅ Glassmorphism effect */
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  
  &::before {
    content: '';
    position: absolute;
    top: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 10px solid transparent; /* ✅ Larger arrow */
    border-right: 10px solid transparent;
    border-bottom: 10px solid white;
    filter: drop-shadow(0 -2px 4px rgba(0, 0, 0, 0.1)); /* ✅ Arrow shadow */
  }
`;

const HoverCardHeader = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
`;

const HoverAvatar = styled.div<{ $url?: string; $initial: string }>`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${p => p.$url 
    ? `url(${p.$url})` 
    : 'linear-gradient(135deg, #FF8F10, #FF7900)'};
  background-size: cover;
  background-position: center;
  border: 2px solid #FF8F10;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 800;
  color: white;
  
  &::before {
    content: '${p => !p.$url ? p.$initial : ''}';
  }
`;

const HoverCardInfo = styled.div`
  flex: 1;
  
  h4 {
    margin: 0 0 4px 0;
    font-size: 0.95rem;
    font-weight: 700;
    color: #212529;
  }
  
  p {
    margin: 0;
    font-size: 0.75rem;
    color: #6c757d;
  }
`;

const HoverCardStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  padding: 12px 0;
  border-top: 1px solid #e9ecef;
  border-bottom: 1px solid #e9ecef;
  margin-bottom: 12px;
  
  div {
    text-align: center;
    
    .value {
      font-size: 1.1rem;
      font-weight: 700;
      color: #FF7900;
    }
    
    .label {
      font-size: 0.65rem;
      color: #6c757d;
      text-transform: uppercase;
      margin-top: 2px;
    }
  }
`;

const HoverCardActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s ease;
  
  ${p => p.$variant === 'primary' 
    ? `
      background: linear-gradient(135deg, #FF7900 0%, #FF9533 100%);
      color: white;
      &:hover {
        background: linear-gradient(135deg, #e66d00 0%, #e68429 100%);
        transform: translateY(-1px);
      }
    `
    : `
      background: #f8f9fa;
      color: #495057;
      border: 1px solid #dee2e6;
      &:hover {
        background: #e9ecef;
      }
    `
  }
`;

// ==================== INTERFACES ====================

export interface UserBubbleProps {
  user: {
    uid: string;
    displayName: string;
    profileImage?: { url: string };
    profileType?: 'private' | 'dealer' | 'company';
    isOnline?: boolean;
    verification?: {
      emailVerified?: boolean;
      phoneVerified?: boolean;
      trustScore?: number;
    };
    stats?: {
      followers?: number;
      listings?: number;
      reviews?: number;
    };
  };
  size?: 'small' | 'medium' | 'large';
  isFollowing?: boolean;
  showHoverCard?: boolean;
  onFollow?: () => void;
  onMessage?: () => void;
  onClick?: () => void;
}

const SIZES = {
  small: 64,
  medium: 96,
  large: 128
};

const BORDER_COLORS = {
  private: '#FF8F10',
  dealer: '#16a34a',
  company: '#1d4ed8',
  default: '#dee2e6'
};

// ==================== COMPONENT ====================

export const UserBubble: React.FC<UserBubbleProps> = ({
  user,
  size = 'medium',
  isFollowing = false,
  showHoverCard = true,
  onFollow,
  onMessage,
  onClick
}) => {
  const navigate = useNavigate();
  const [showCard, setShowCard] = useState(false);
  
  const bubbleSize = SIZES[size];
  const borderColor = BORDER_COLORS[user.profileType || 'default'];
  const isOnline = user.isOnline || false;
  const onlineStatus: 'online' | 'away' | 'offline' = isOnline ? 'online' : 'offline';
  const initial = user.displayName?.[0]?.toUpperCase() || '?';
  const isVerified = user.verification?.emailVerified || user.verification?.phoneVerified;
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/profile/${user.uid}`);
    }
  };
  
  const handleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFollow?.();
  };
  
  const handleMessage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMessage?.();
  };
  
  return (
    <BubbleContainer
      onMouseEnter={() => showHoverCard && setShowCard(true)}
      onMouseLeave={() => setShowCard(false)}
    >
      <BubbleWrapper $isOnline={isOnline}>
        <BubbleAvatar
          $imageUrl={user.profileImage?.url}
          $size={bubbleSize}
          $borderColor={borderColor}
          $isOnline={isOnline}
          $initial={initial}
          onClick={handleClick}
        />
        
        {size !== 'small' && (
          <OnlineIndicator $status={onlineStatus} />
        )}
        
        {isVerified && size !== 'small' && (
          <VerifiedBadge title="Verified User">
            <CheckCircle size={12} color="white" />
          </VerifiedBadge>
        )}
        
        {size !== 'small' && (
          <QuickActions className="quick-actions">
            <QuickActionButton 
              $variant={isFollowing ? 'secondary' : 'primary'}
              onClick={handleFollow}
              title={isFollowing ? 'Unfollow' : 'Follow'}
            >
              {isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />}
            </QuickActionButton>
            
            <QuickActionButton 
              $variant="secondary"
              onClick={handleMessage}
              title="Send Message"
            >
              <MessageCircle size={16} />
            </QuickActionButton>
          </QuickActions>
        )}
        
        {showHoverCard && showCard && (
          <HoverCard className="hover-card">
            <HoverCardHeader>
              <HoverAvatar 
                $url={user.profileImage?.url}
                $initial={initial}
              />
              <HoverCardInfo>
                <h4>{user.displayName}</h4>
                <p>
                  {user.profileType === 'dealer' ? 'Dealer' 
                   : user.profileType === 'company' ? 'Company' 
                   : 'Private'}
                </p>
              </HoverCardInfo>
            </HoverCardHeader>
            
            <HoverCardStats>
              <div>
                <div className="value">{user.stats?.followers || 0}</div>
                <div className="label">Followers</div>
              </div>
              <div>
                <div className="value">{user.stats?.listings || 0}</div>
                <div className="label">Cars</div>
              </div>
              <div>
                <div className="value">{user.verification?.trustScore || 0}</div>
                <div className="label">Trust</div>
              </div>
            </HoverCardStats>
            
            <HoverCardActions>
              <ActionButton $variant="primary" onClick={handleMessage}>
                <MessageCircle size={14} />
                Message
              </ActionButton>
              <ActionButton $variant="secondary" onClick={handleFollow}>
                {isFollowing ? <UserCheck size={14} /> : <UserPlus size={14} />}
                {isFollowing ? 'Following' : 'Follow'}
              </ActionButton>
            </HoverCardActions>
          </HoverCard>
        )}
      </BubbleWrapper>
      
      <UserName>{user.displayName}</UserName>
      
      {user.profileType && size !== 'small' && (
        <UserRole $type={user.profileType}>
          {user.profileType === 'dealer' ? 'Dealer' 
           : user.profileType === 'company' ? 'Company' 
           : 'Private'}
        </UserRole>
      )}
    </BubbleContainer>
  );
};

export default UserBubble;

