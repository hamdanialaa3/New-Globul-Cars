// src/components/media/StoryViewer.tsx
// Story Viewer Component - مكون عرض القصص
// الهدف: عرض قصص Instagram-style للسيارات
// الموقع: بلغاريا | اللغات: BG/EN

import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { X, Volume2, VolumeX, ChevronLeft, ChevronRight } from 'lucide-react';
import { StoryViewerProps, CarStory } from '../../types/story.types';
import { logger } from '@/services/logger-service';

// ==================== STYLED COMPONENTS ====================

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StoryContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 420px;
  height: 100vh;
  max-height: 800px;
  display: flex;
  flex-direction: column;
  background: #000;
`;

const VideoContainer = styled.div`
  position: relative;
  width: 100%;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
`;

const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const ProgressBarContainer = styled.div`
  display: flex;
  gap: 4px;
  padding: 12px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
`;

const ProgressBar = styled.div<{ $progress: number; $active: boolean }>`
  flex: 1;
  height: 3px;
  background: ${props => props.$active 
    ? 'rgba(255, 255, 255, 0.8)' 
    : 'rgba(255, 255, 255, 0.3)'};
  border-radius: 2px;
  overflow: hidden;
  
  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${props => props.$progress}%;
    background: white;
    transition: width 0.1s linear;
  }
`;

const ControlsContainer = styled.div`
  position: absolute;
  top: 50px;
  left: 0;
  right: 0;
  bottom: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 5;
`;

const NavButton = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }
  
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const TopControls = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  left: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
`;

const CloseButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }
`;

const MuteButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }
`;

const BottomInfo = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  z-index: 10;
`;

const StoryTypeLabel = styled.div`
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
`;

// ==================== COMPONENT ====================

const StoryViewer: React.FC<StoryViewerProps> = ({
  stories,
  initialIndex = 0,
  onClose,
  language = 'bg'
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartXRef = useRef<number>(0);

  const currentStory = stories[currentIndex];

  useEffect(() => {
    if (!currentStory || !videoRef.current) return;

    const video = videoRef.current;
    video.muted = isMuted;
    
    const loadVideo = async () => {
      try {
        video.src = currentStory.videoUrl;
        await video.load();
        setProgress(0);
        setIsPlaying(false);
      } catch (error) {
        logger.error('Error loading video', error as Error, { storyId: currentStory?.id });
      }
    };

    loadVideo();
  }, [currentStory, isMuted]);

  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      handleNext();
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [currentStory]);

  useEffect(() => {
    if (isPlaying && currentStory) {
      progressIntervalRef.current = setInterval(() => {
        if (videoRef.current) {
          const currentTime = videoRef.current.currentTime;
          const duration = videoRef.current.duration || currentStory.durationSec;
          const newProgress = (currentTime / duration) * 100;
          setProgress(Math.min(100, newProgress));
        }
      }, 100);
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying, currentStory]);

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch((err) => logger.error('Video play failed', err as Error, { storyId: currentStory?.id }));
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
    }
  };

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrevious();
      }
    } else {
      handlePlayPause();
    }
  };

  const getStoryTypeLabel = (type: string): string => {
    const labels: Record<string, { bg: string; en: string }> = {
      engine_start: { bg: 'Запуск на двигателя', en: 'Engine Start' },
      interior_360: { bg: 'Интериор 360°', en: 'Interior 360°' },
      exterior_walk: { bg: 'Екстериор', en: 'Exterior' },
      exhaust_sound: { bg: 'Звук на изпускателната', en: 'Exhaust Sound' },
      test_drive: { bg: 'Тест драйв', en: 'Test Drive' },
      features_showcase: { bg: 'Особености', en: 'Features' }
    };
    
    return labels[type]?.[language] || type;
  };

  if (!currentStory) {
    return null;
  }

  return (
    <Overlay onClick={onClose}>
      <StoryContainer onClick={(e) => e.stopPropagation()}>
        <ProgressBarContainer>
          {stories.map((_, index) => (
            <ProgressBar
              key={index}
              $progress={index === currentIndex ? progress : index < currentIndex ? 100 : 0}
              $active={index === currentIndex}
            />
          ))}
        </ProgressBarContainer>

        <TopControls>
          <div />
          <MuteButton
            onClick={(e) => {
              e.stopPropagation();
              setIsMuted(!isMuted);
            }}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </MuteButton>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </TopControls>

        <VideoContainer
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={handlePlayPause}
        >
          <Video
            ref={videoRef}
            playsInline
            muted={isMuted}
            preload="metadata"
          />
        </VideoContainer>

        <ControlsContainer>
          <NavButton
            onClick={(e) => {
              e.stopPropagation();
              handlePrevious();
            }}
            disabled={currentIndex === 0}
          >
            <ChevronLeft size={24} />
          </NavButton>
          <NavButton
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            disabled={currentIndex === stories.length - 1}
          >
            <ChevronRight size={24} />
          </NavButton>
        </ControlsContainer>

        <BottomInfo>
          <StoryTypeLabel>
            {getStoryTypeLabel(currentStory.type)}
          </StoryTypeLabel>
        </BottomInfo>
      </StoryContainer>
    </Overlay>
  );
};

export default StoryViewer;

