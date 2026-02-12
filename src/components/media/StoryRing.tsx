// src/components/media/StoryRing.tsx
// Story Ring Component - Colored ring around seller photo indicating stories exist
// Goal: Display attractive visual indicator for new Stories

import React from 'react';
import styled from 'styled-components';
import type { CarStory } from '@/types/story.types';

/**
 * Story Ring Props
 */
interface StoryRingProps {
  hasStories: boolean;
  stories?: CarStory[];
  imageUrl: string;
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  viewed?: boolean; // Has the user viewed the stories
}

/**
 * Story Ring Component
 * Colored ring around profile photo (like Instagram)
 */
const StoryRing: React.FC<StoryRingProps> = ({
  hasStories,
  stories = [],
  imageUrl,
  size = 'medium',
  onClick,
  viewed = false
}) => {
  if (!hasStories || stories.length === 0) {
    return (
      <ProfileImage
        src={imageUrl}
        alt="Profile"
        $size={size}
        onClick={onClick}
        $clickable={!!onClick}
      />
    );
  }

  return (
    <RingContainer
      $size={size}
      $viewed={viewed}
      onClick={onClick}
      $clickable={!!onClick}
    >
      <ProfileImage
        src={imageUrl}
        alt="Profile with stories"
        $size={size}
        $clickable={false}
      />
      <StoryCount $size={size}>
        {stories.length}
      </StoryCount>
    </RingContainer>
  );
};

// ==================== STYLED COMPONENTS ====================

const getSizePixels = (size: 'small' | 'medium' | 'large'): number => {
  switch (size) {
    case 'small': return 48;
    case 'large': return 120;
    default: return 80;
  }
};

const RingContainer = styled.div<{
  $size: 'small' | 'medium' | 'large';
  $viewed: boolean;
  $clickable: boolean;
}>`
  position: relative;
  width: ${props => getSizePixels(props.$size) + 8}px;
  height: ${props => getSizePixels(props.$size) + 8}px;
  border-radius: 50%;
  padding: 3px;
  background: ${props => props.$viewed
    ? 'linear-gradient(45deg, #9CA3AF, #D1D5DB)' // gray for viewed stories
    : 'linear-gradient(45deg, #FF6B6B, #4ECDC4, #FFD93D, #FF6B6B)' // vibrant colors
  };
  background-size: 200% 200%;
  animation: ${props => !props.$viewed && 'gradientRotate 3s ease infinite'};
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};
  transition: transform 0.2s ease;

  &:hover {
    ${props => props.$clickable && 'transform: scale(1.05);'}
  }

  &:active {
    ${props => props.$clickable && 'transform: scale(0.98);'}
  }

  @keyframes gradientRotate {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
`;

const ProfileImage = styled.img<{
  $size: 'small' | 'medium' | 'large';
  $clickable: boolean;
}>`
  width: ${props => getSizePixels(props.$size)}px;
  height: ${props => getSizePixels(props.$size)}px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #FFFFFF;
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};
  transition: transform 0.2s ease;

  ${props => props.$clickable && `
    &:hover {
      transform: scale(1.05);
    }
  `}
`;

const StoryCount = styled.div<{ $size: 'small' | 'medium' | 'large' }>`
  position: absolute;
  bottom: -2px;
  right: -2px;
  background: #FF6B6B;
  color: #FFFFFF;
  width: ${props => props.$size === 'small' ? '20px' : props.$size === 'large' ? '32px' : '24px'};
  height: ${props => props.$size === 'small' ? '20px' : props.$size === 'large' ? '32px' : '24px'};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => props.$size === 'small' ? '10px' : props.$size === 'large' ? '14px' : '12px'};
  font-weight: 700;
  border: 2px solid #FFFFFF;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

export default StoryRing;
