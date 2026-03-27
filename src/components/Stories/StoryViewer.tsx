import { logger } from '../../services/logger-service';
/**
 * StoryViewer - Full-screen story viewer with gestures
 * Location: Bulgaria | Languages: BG/EN | Currency: EUR
 */

import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { CarStory } from '../../types/story.types';
import { X, ChevronLeft, ChevronRight, Heart, Send, MoreVertical } from 'lucide-react';
import { storyService } from '../../services/stories/story.service';
import { useAuth } from '../../contexts/AuthProvider';

// ==================== STYLED COMPONENTS ====================

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ViewerContainer = styled.div`
  position: relative;
  max-width: 500px;
  width: 100%;
  height: 90vh;
  max-height: 900px;
  background: black;
  border-radius: 16px;
  overflow: hidden;
  
  @media (max-width: 768px) {
    max-width: 100%;
    height: 100vh;
    max-height: 100vh;
    border-radius: 0;
  }
`;

const ProgressBar = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 4px;
  padding: 12px;
  z-index: 3;
`;

const Progress = styled.div<{ $progress: number }>`
  flex: 1;
  height: 3px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  overflow: hidden;
  
  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${p => p.$progress}%;
    background: white;
    transition: width 0.1s linear;
  }
`;

const Header = styled.div`
  position: absolute;
  top: 20px;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 3;
`;

const AuthorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Avatar = styled.div<{ $imageUrl?: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${p => p.$imageUrl
    ? `url(${p.$imageUrl}) center/cover`
    : 'linear-gradient(135deg, #3B82F6, #2563EB)'};
  border: 2px solid white;
`;

const AuthorDetails = styled.div`
  color: white;
  
  .name {
    font-size: 0.95rem;
    font-weight: 700;
    margin-bottom: 2px;
  }
  
  .time {
    font-size: 0.8rem;
    opacity: 0.8;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const IconButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const MediaContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const StoryImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
`;

const StoryVideo = styled.video`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
`;

const Caption = styled.div`
  position: absolute;
  bottom: 100px;
  left: 20px;
  right: 20px;
  color: white;
  font-size: 1rem;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
  z-index: 2;
`;

const ReactionBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  display: flex;
  gap: 12px;
  z-index: 3;
`;

const ReactionInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 0.95rem;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
  
  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.5);
  }
`;

const ReactionButton = styled.button<{ $active?: boolean }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: ${p => p.$active ? '#FF4500' : 'rgba(255, 255, 255, 0.1)'};
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background: ${p => p.$active ? '#FF3000' : 'rgba(255, 255, 255, 0.2)'};
    transform: scale(1.05);
  }
  
  svg {
    width: 24px;
    height: 24px;
  }
`;

const NavArea = styled.div<{ $position: 'left' | 'right' }>`
  position: absolute;
  top: 0;
  ${p => p.$position}: 0;
  width: 30%;
  height: 100%;
  cursor: pointer;
  z-index: 2;
  
  &:active {
    background: ${p => p.$position === 'left'
    ? 'linear-gradient(to right, rgba(255, 255, 255, 0.1), transparent)'
    : 'linear-gradient(to left, rgba(255, 255, 255, 0.1), transparent)'};
  }
`;

// ==================== COMPONENT ====================

interface StoryViewerProps {
  story: CarStory;
  onClose: () => void;
}

const StoryViewer: React.FC<StoryViewerProps> = ({ story, onClose }) => {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [reaction, setReaction] = useState('');
  const [hasLiked, setHasLiked] = useState(false);

  // ==================== EFFECTS ====================

  useEffect(() => {
    if (isPaused) return;

    const duration = (story.durationSec || 15) * 1000;
    const interval = 50;
    const increment = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          onClose();
          return 100;
        }
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isPaused, story.duration, onClose]);

  useEffect(() => {
    if (story.mediaType === 'video' && videoRef.current) {
      if (isPaused) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  }, [isPaused, story.type]);

  // ==================== HANDLERS ====================

  const handlePrevious = () => {
    logger.info('Previous story');
  };

  const handleNext = () => {
    logger.info('Next story');
  };

  const handleLike = async () => {
    if (!user) return;

    try {
      await storyService.addReaction(story.id, user.uid, '❤️');
      setHasLiked(true);
    } catch (error) {
      logger.error('Failed to like story:', error);
    }
  };

  const handleSendReaction = async () => {
    if (!user || !reaction.trim()) return;

    try {
      await storyService.addReaction(story.id, user.uid, reaction);
      setReaction('');
    } catch (error) {
      logger.error('Failed to send reaction:', error);
    }
  };

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((new Date().getTime() - timestamp) / 1000);

    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h`;
  };

  // ==================== RENDER ====================

  return (
    <Overlay onClick={onClose}>
      <ViewerContainer onClick={e => e.stopPropagation()}>
        <ProgressBar>
          <Progress $progress={progress} />
        </ProgressBar>

        <Header>
          <AuthorInfo>
            <Avatar $imageUrl={story.authorInfo.profileImage} />
            <AuthorDetails>
              <div className="name">{story.authorInfo?.displayName || 'Anonymous'}</div>
              <div className="time">{getTimeAgo(story.createdAt)}</div>
            </AuthorDetails>
          </AuthorInfo>

          <ActionButtons>
            <IconButton onClick={() => setIsPaused(!isPaused)}>
              {isPaused ? '▶' : '⏸'}
            </IconButton>
            <IconButton>
              <MoreVertical />
            </IconButton>
            <IconButton onClick={onClose}>
              <X />
            </IconButton>
          </ActionButtons>
        </Header>

        <NavArea $position="left" onClick={handlePrevious} />
        <NavArea $position="right" onClick={handleNext} />

        <MediaContainer>
          {story.type === 'engine_sound' || story.type === 'exterior_walkaround' ? (
            <StoryVideo
              ref={videoRef}
              src={story.videoUrl}
              autoPlay
              muted
              loop={false}
            />
          ) : (
            <StoryImage src={story.videoUrl} alt="Story" />
          )}
        </MediaContainer>

        {story.caption && <Caption>{story.caption}</Caption>}

        <ReactionBar>
          <ReactionInput
            type="text"
            placeholder="Send a message..."
            value={reaction}
            onChange={e => setReaction(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendReaction()}
          />
          <ReactionButton onClick={handleSendReaction}>
            <Send />
          </ReactionButton>
          <ReactionButton $active={hasLiked} onClick={handleLike}>
            <Heart fill={hasLiked ? 'currentColor' : 'none'} />
          </ReactionButton>
        </ReactionBar>
      </ViewerContainer>
    </Overlay>
  );
};

export default StoryViewer;

