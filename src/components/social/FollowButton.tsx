/**
 * FollowButton - Professional user follow toggle component
 * زر المتابعة - مكون تبديل المتابعة بين المستخدمين
 * 
 * Features:
 * - Optimistic UI updates (instant feedback)
 * - Loading states
 * - Authentication protection
 * - Animated icon
 * - i18n support (BG/EN)
 */

import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../components/Toast';
import { followService } from '@/services/social/follow-service';
import { logger } from '@/services/logger-service';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';

interface FollowButtonProps {
  targetUserId: string;
  initialIsFollowing?: boolean;
  onStatusChange?: (isFollowing: boolean) => void;
  size?: 'small' | 'medium' | 'large';
  accentColor?: string;
}

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const StyledButton = styled.button<{ 
  $isFollowing: boolean; 
  $accentColor: string;
  $size: 'small' | 'medium' | 'large';
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: ${props => {
    if (props.$size === 'small') return '0.4rem 0.8rem';
    if (props.$size === 'large') return '0.75rem 1.5rem';
    return '0.6rem 1.2rem';
  }};
  font-size: ${props => {
    if (props.$size === 'small') return '0.8rem';
    if (props.$size === 'large') return '1rem';
    return '0.9rem';
  }};
  font-weight: 600;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1.5px solid ${props => props.$accentColor};
  
  background: ${props => props.$isFollowing ? 'transparent' : props.$accentColor};
  color: ${props => props.$isFollowing ? props.$accentColor : 'white'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${props => props.$accentColor}40;
    background: ${props => props.$isFollowing ? props.$accentColor + '10' : props.$accentColor};
    filter: brightness(1.05);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  svg {
    width: ${props => props.$size === 'small' ? '14px' : '18px'};
    height: ${props => props.$size === 'small' ? '14px' : '18px'};
  }
`;

const Spinner = styled(Loader2)`
  animation: ${spin} 1s linear infinite;
`;

export const FollowButton: React.FC<FollowButtonProps> = ({
  targetUserId,
  initialIsFollowing,
  onStatusChange,
  size = 'medium',
  accentColor = '#2B7BFF',
}) => {
  const { currentUser } = useAuth();
  const { language } = useLanguage();
  const toast = useToast();
  const [isFollowing, setIsFollowing] = useState<boolean>(initialIsFollowing ?? false);
  const [isLoading, setIsLoading] = useState<boolean>(initialIsFollowing === undefined);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);

  // Initialize status if not provided
  useEffect(() => {
    let isMounted = true;
    
    if (currentUser?.uid && targetUserId && initialIsFollowing === undefined) {
      if (currentUser.uid === targetUserId) {
        setIsLoading(false);
        return;
      }

      followService.isFollowing(currentUser.uid, targetUserId)
        .then(status => {
          if (isMounted) {
            setIsFollowing(status);
            setIsLoading(false);
          }
        })
        .catch(err => {
          logger.error('Failed to fetch follow status', err);
          if (isMounted) setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }

    return () => { isMounted = false; };
  }, [currentUser?.uid, targetUserId, initialIsFollowing]);

  const handleToggleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  
    if (!currentUser) {
      toast.info(
        language === 'bg' ? 'Моля, влезте в профила си, за да следвате потребители' : 'Please log in to follow users',
        language === 'bg' ? 'Изисква се вход' : 'Login Required'
      );
      return;
    }

    if (!currentUser?.uid || !targetUserId || currentUser.uid === targetUserId) return;
  
    // Start action
    setIsActionLoading(true);
    
    // Optimistic Update
    const previousState = isFollowing;

    setIsFollowing(!previousState);

    try {
      const result = await followService.toggleFollow(currentUser.uid, targetUserId);
      setIsFollowing(result);
      if (onStatusChange) onStatusChange(result);
      logger.info('Follow toggled successfully', { result, targetUserId });
    } catch (error) {
      // Revert on error
      setIsFollowing(previousState);
      logger.error('Failed to toggle follow', error as Error);
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <StyledButton 
        disabled 
        $isFollowing={false} 
        $accentColor={accentColor}
        $size={size}
      >
        <Spinner />
      </StyledButton>
    );
  }

  // Hide if it's the user's own profile
  if (currentUser?.uid === targetUserId) return null;

  const labels = {
    follow: { bg: 'Последвай', en: 'Follow' },
    following: { bg: 'Последван', en: 'Following' }
  };

  const currentLabel = isFollowing 
    ? (language === 'bg' ? labels.following.bg : labels.following.en)
    : (language === 'bg' ? labels.follow.bg : labels.follow.en);

  return (
    <StyledButton
      $isFollowing={isFollowing}
      $accentColor={accentColor}
      $size={size}
      onClick={handleToggleFollow}
      disabled={isActionLoading}
    >
      {isActionLoading ? <Spinner /> : (isFollowing ? <UserMinus /> : <UserPlus />)}
      {currentLabel}
    </StyledButton>
  );
};

export default FollowButton;
