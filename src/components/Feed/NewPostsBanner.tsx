import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../contexts/LanguageContext';
import { realtimeFeedService } from '../../services/social/realtime-feed.service';

interface NewPostsBannerProps {
  onRefresh: () => void;
}

const translations = {
  bg: {
    newPosts: (count: number) => `${count} нови публикации`,
    refresh: 'Опресни',
  },
  en: {
    newPosts: (count: number) => `${count} new posts`,
    refresh: 'Refresh',
  },
};

export const NewPostsBanner: React.FC<NewPostsBannerProps> = ({ onRefresh }) => {
  const { language } = useLanguage();
  const [newPostsCount, setNewPostsCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [lastCheckTimestamp, setLastCheckTimestamp] = useState(Date.now());

  const text = translations[language];

  useEffect(() => {
    // Subscribe to new posts count from realtime service
    const unsubscribe = realtimeFeedService.subscribeToNewPostsCount(
      lastCheckTimestamp,
      (count: number) => {
        if (count > 0) {
          setNewPostsCount(count);
          setIsVisible(true);
          setIsAnimating(true);
          
          // Reset animation after it completes
          setTimeout(() => setIsAnimating(false), 500);
        } else {
          setIsVisible(false);
          setNewPostsCount(0);
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [lastCheckTimestamp]);

  const handleRefresh = () => {
    setIsVisible(false);
    setNewPostsCount(0);
    setLastCheckTimestamp(Date.now()); // Update timestamp to reset count
    onRefresh();
  };

  if (!isVisible || newPostsCount === 0) {
    return null;
  }

  return (
    <BannerContainer $isAnimating={isAnimating}>
      <BannerContent>
        <PostCountText>{text.newPosts(newPostsCount)}</PostCountText>
        <RefreshButton onClick={handleRefresh}>
          <RefreshIcon>↻</RefreshIcon>
          <span>{text.refresh}</span>
        </RefreshButton>
      </BannerContent>
    </BannerContainer>
  );
};

// Styled Components

const BannerContainer = styled.div<{ $isAnimating: boolean }>`
  position: sticky;
  top: 80px;
  z-index: 100;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  animation: ${({ $isAnimating }) => ($isAnimating ? 'slideDown 0.4s ease-out' : 'none')};
  
  @keyframes slideDown {
    from {
      transform: translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    top: 60px;
    margin: 0 -16px 16px;
    border-radius: 0;
  }
`;

const BannerContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`;

const PostCountText = styled.span`
  color: white;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.3px;
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 13px;
  }
`;

const RefreshIcon = styled.span`
  font-size: 18px;
  font-weight: bold;
  transition: transform 0.3s ease;
  
  ${RefreshButton}:hover & {
    transform: rotate(180deg);
  }
`;
