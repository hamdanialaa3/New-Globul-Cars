/**
 * Follow Button Component
 * زر المتابعة
 * 
 * Features:
 * - Optimistic UI (instant feedback)
 * - Loading states with spinner
 * - Error handling with rollback
 * - Responsive design (mobile.de style)
 * - Accessibility compliant
 * - Follower count display (optional)
 * 
 * Usage:
 * <FollowButton targetUserId="80" showCount />
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { UserPlus, UserCheck, Loader } from 'lucide-react';
import { followService } from '../../services/social/follow-service';
import { useAuth } from '../../contexts/AuthProvider';
import { useLanguage } from '../../contexts/LanguageContext';
import { logger } from '../../services/logger-service';

interface FollowButtonProps {
  targetUserId: string;
  showCount?: boolean;
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  onFollowChange?: (isFollowing: boolean) => void;
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  targetUserId,
  showCount = false,
  variant = 'primary',
  size = 'medium',
  onFollowChange
}) => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Check initial following status
  useEffect(() => {
    const checkStatus = async () => {
      if (!user?.uid || user.uid === targetUserId) {
        setIsLoading(false);
        return;
      }

      try {
        const [following, stats] = await Promise.all([
          followService.isFollowing(user.uid, targetUserId),
          followService.getFollowStats(targetUserId)
        ]);

        setIsFollowing(following);
        setFollowersCount(stats.followersCount);

      } catch (error) {
        logger.error('Failed to check following status', error as Error);
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();
  }, [user?.uid, targetUserId]);

  // Handle follow/unfollow with optimistic UI
  const handleToggleFollow = async () => {
    if (!user?.uid) {
      // Redirect to login
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }

    if (user.uid === targetUserId) {
      return; // Cannot follow yourself
    }

    setIsProcessing(true);
    setError(null);

    // Optimistic UI update
    const previousState = isFollowing;
    const optimisticState = !isFollowing;
    setIsFollowing(optimisticState);
    setFollowersCount(prev => optimisticState ? prev + 1 : Math.max(0, prev - 1));

    try {
      const newState = await followService.toggleFollow(user.uid, targetUserId);
      
      // Verify optimistic update was correct
      if (newState !== optimisticState) {
        setIsFollowing(newState);
        // Refetch accurate count
        const stats = await followService.getFollowStats(targetUserId);
        setFollowersCount(stats.followersCount);
      }

      // Callback
      onFollowChange?.(newState);

      logger.info('Follow toggled', { 
        targetUserId, 
        newState 
      });

    } catch (error) {
      // Rollback optimistic update
      setIsFollowing(previousState);
      setFollowersCount(prev => previousState ? prev + 1 : Math.max(0, prev - 1));
      
      setError(language === 'bg' 
        ? 'Грешка при актуализиране на статуса на следване'
        : 'Failed to update follow status'
      );

      logger.error('Follow toggle failed', error as Error);

    } finally {
      setIsProcessing(false);
    }
  };

  // Don't render for own profile
  if (user?.uid === targetUserId) {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <StyledButton
        variant={variant}
        size={size}
        disabled
      >
        <Loader size={18} className="spin" />
      </StyledButton>
    );
  }

  // Translations
  const buttonText = isFollowing
    ? (language === 'bg' ? 'Следвате' : 'Following')
    : (language === 'bg' ? 'Последвай' : 'Follow');

  const followersText = language === 'bg' 
    ? `${followersCount} последователи`
    : `${followersCount} followers`;

  return (
    <ButtonWrapper>
      <StyledButton
        variant={variant}
        size={size}
        isFollowing={isFollowing}
        onClick={handleToggleFollow}
        disabled={isProcessing}
        title={buttonText}
      >
        {isProcessing ? (
          <Loader size={18} className="spin" />
        ) : isFollowing ? (
          <>
            <UserCheck size={18} />
            <span>{buttonText}</span>
          </>
        ) : (
          <>
            <UserPlus size={18} />
            <span>{buttonText}</span>
          </>
        )}
      </StyledButton>

      {showCount && followersCount > 0 && (
        <FollowersCount>{followersText}</FollowersCount>
      )}

      {error && (
        <ErrorMessage>{error}</ErrorMessage>
      )}
    </ButtonWrapper>
  );
};

// ==================== STYLED COMPONENTS ====================

const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;

const StyledButton = styled.button<{
  variant: string;
  size: string;
  isFollowing?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  white-space: nowrap;

  /* Size variants */
  ${props => {
    switch (props.size) {
      case 'small':
        return `
          padding: 0.4rem 0.8rem;
          font-size: 0.875rem;
        `;
      case 'large':
        return `
          padding: 0.875rem 1.75rem;
          font-size: 1.125rem;
        `;
      default: // medium
        return `
          padding: 0.625rem 1.25rem;
          font-size: 1rem;
        `;
    }
  }}

  /* Style variants */
  ${props => {
    if (props.isFollowing) {
      // Following state (subtle)
      return `
        background: transparent;
        color: var(--gray-700);
        border-color: var(--gray-300);

        &:hover:not(:disabled) {
          background: var(--gray-100);
          border-color: var(--gray-400);
        }
      `;
    }

    switch (props.variant) {
      case 'outline':
        return `
          background: transparent;
          color: var(--primary-blue);
          border-color: var(--primary-blue);

          &:hover:not(:disabled) {
            background: var(--primary-blue);
            color: white;
          }
        `;
      case 'ghost':
        return `
          background: transparent;
          color: var(--primary-blue);

          &:hover:not(:disabled) {
            background: rgba(30, 58, 138, 0.1);
          }
        `;
      default: // primary
        return `
          background: var(--primary-blue);
          color: white;

          &:hover:not(:disabled) {
            background: #1E3A8A;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(30, 58, 138, 0.3);
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  svg {
    flex-shrink: 0;
  }

  .spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;

    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

const FollowersCount = styled.span`
  font-size: 0.875rem;
  color: var(--gray-600);
  text-align: center;
`;

const ErrorMessage = styled.div`
  font-size: 0.75rem;
  color: var(--primary-red);
  text-align: center;
  margin-top: 0.25rem;
`;

export default FollowButton;

