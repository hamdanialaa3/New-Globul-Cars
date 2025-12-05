// src/components/Profile/FollowButton.tsx
// Follow Button Component
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { UserPlus, UserCheck } from 'lucide-react';
import { followService } from '@globul-cars/services/social/follow.service';
import { useLanguage } from '@globul-cars/core/contextsLanguageContext';
import { logger } from '@globul-cars/services';

const Button = styled.button<{ $following: boolean }>`
  padding: 10px 20px;
  background: ${props => props.$following ? '#6c757d' : '#FF7900'};
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: ${props => props.$following ? '#5a6268' : '#e66d00'};
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

interface FollowButtonProps {
  targetUserId: string;
  currentUserId: string;
  onFollowChange?: (following: boolean) => void;
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  targetUserId,
  currentUserId,
  onFollowChange
}) => {
  const { language } = useLanguage();
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkFollowStatus();
  }, [targetUserId, currentUserId]);

  const checkFollowStatus = async () => {
    try {
      const isFollowing = await followService.isFollowing(currentUserId, targetUserId);
      setFollowing(isFollowing);
    } catch (error) {
      logger.error('Error checking follow status', error as Error, { currentUserId, targetUserId });
    }
  };

  const handleClick = async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      
      if (following) {
        await followService.unfollowUser(currentUserId, targetUserId);
        setFollowing(false);
        onFollowChange?.(false);
      } else {
        await followService.followUser(currentUserId, targetUserId);
        setFollowing(true);
        onFollowChange?.(true);
      }
    } catch (error) {
      logger.error('Follow operation error', error as Error, { currentUserId, targetUserId, following });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      $following={following}
      onClick={handleClick}
      disabled={loading}
    >
      {following ? (
        <>
          <UserCheck size={18} />
          {language === 'bg' ? 'Последващ' : 'Following'}
        </>
      ) : (
        <>
          <UserPlus size={18} />
          {language === 'bg' ? 'Последвай' : 'Follow'}
        </>
      )}
    </Button>
  );
};

export default FollowButton;

