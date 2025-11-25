/**
 * Intro Video Section
 * Displays and manages user introduction video
 */

import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Video, Upload, Play, Eye, Lock, Unlock, Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { introVideoService } from '@/services/profile/intro-video.service';
import type { IntroVideo } from '@/types/profile-enhancements.types';

const SectionContainer = styled.section<{ $isDark: boolean }>`
  padding: 24px;
  background: ${props => props.$isDark ? '#1e293b' : '#ffffff'};
  border-radius: 16px;
  box-shadow: ${props => props.$isDark 
    ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
    : '0 2px 8px rgba(0, 0, 0, 0.08)'};
  margin-bottom: 24px;
  border: 1px solid ${props => props.$isDark ? '#334155' : '#e2e8f0'};
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3<{ $isDark: boolean }>`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${props => props.$isDark ? '#f1f5f9' : '#1e293b'};
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
`;

const VideoContainer = styled.div<{ $isDark: boolean }>`
  position: relative;
  width: 100%;
  max-width: 600px;
  aspect-ratio: 16 / 9;
  border-radius: 12px;
  overflow: hidden;
  background: ${props => props.$isDark ? '#0f172a' : '#f8fafc'};
  border: 1px solid ${props => props.$isDark ? '#1e293b' : '#e2e8f0'};
`;

const VideoPlayer = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const VideoThumbnail = styled.div<{ $thumbnailUrl?: string; $isDark: boolean }>`
  width: 100%;
  height: 100%;
  background: ${props => props.$thumbnailUrl 
    ? `url(${props.$thumbnailUrl}) center/cover` 
    : props.$isDark ? '#0f172a' : '#f8fafc'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.9;
  }
`;

const PlayButton = styled.button<{ $isDark: boolean }>`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.9);
    transform: scale(1.1);
  }
`;

const VideoInfo = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 12px;
  font-size: 0.875rem;
  color: ${props => props.$isDark ? '#94a3b8' : '#64748b'};
`;

const UploadButton = styled.label<{ $isDark: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: ${props => props.$isDark ? '#334155' : '#f8fafc'};
  color: ${props => props.$isDark ? '#cbd5e1' : '#64748b'};
  border: 1px solid ${props => props.$isDark ? '#475569' : '#e2e8f0'};
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$isDark ? '#475569' : '#f1f5f9'};
    border-color: ${props => props.$isDark ? '#64748b' : '#cbd5e1'};
  }

  input {
    display: none;
  }
`;

const ActionButton = styled.button<{ $isDark: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: ${props => props.$isDark ? '#334155' : '#f8fafc'};
  color: ${props => props.$isDark ? '#cbd5e1' : '#64748b'};
  border: 1px solid ${props => props.$isDark ? '#475569' : '#e2e8f0'};
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$isDark ? '#475569' : '#f1f5f9'};
  }
`;

const EmptyState = styled.div<{ $isDark: boolean }>`
  text-align: center;
  padding: 40px 20px;
  color: ${props => props.$isDark ? '#94a3b8' : '#64748b'};
`;

interface IntroVideoSectionProps {
  userId: string;
  isOwnProfile: boolean;
}

export const IntroVideoSection: React.FC<IntroVideoSectionProps> = ({
  userId,
  isOwnProfile
}) => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [video, setVideo] = useState<IntroVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadVideo = async () => {
      try {
        const videoData = await introVideoService.getVideo(userId);
        setVideo(videoData);
      } catch (error) {
        console.error('Error loading video:', error);
        setVideo(null);
      } finally {
        setLoading(false);
      }
    };

    loadVideo();
  }, [userId]);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
      introVideoService.incrementViews(userId);
    }
  };

  const handlePause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !isOwnProfile) return;

    try {
      const { videoUrl, thumbnailUrl } = await introVideoService.uploadVideo(userId, file);
      await introVideoService.saveVideo(userId, {
        videoUrl,
        thumbnailUrl,
        isPublic: true
      });
      
      const updatedVideo = await introVideoService.getVideo(userId);
      setVideo(updatedVideo);
    } catch (error) {
      console.error('Error uploading video:', error);
    }
  };

  const handleToggleVisibility = async () => {
    if (!video || !isOwnProfile) return;

    try {
      await introVideoService.updateVisibility(userId, !video.isPublic);
      const updatedVideo = await introVideoService.getVideo(userId);
      setVideo(updatedVideo);
    } catch (error) {
      console.error('Error updating visibility:', error);
    }
  };

  const handleDelete = async () => {
    if (!video || !isOwnProfile) return;

    if (window.confirm(language === 'bg' 
      ? 'Сигурни ли сте, че искате да изтриете видеото?'
      : 'Are you sure you want to delete the video?')) {
      try {
        await introVideoService.deleteVideo(userId);
        setVideo(null);
      } catch (error) {
        console.error('Error deleting video:', error);
      }
    }
  };

  if (loading) {
    return null;
  }

  if (!video && !isOwnProfile) {
    return null;
  }

  return (
    <SectionContainer $isDark={isDark}>
      <SectionHeader>
        <SectionTitle $isDark={isDark}>
          <Video size={20} />
          {language === 'bg' ? 'Видео представяне' : 'Intro Video'}
        </SectionTitle>
        {isOwnProfile && !video && (
          <UploadButton $isDark={isDark}>
            <Upload size={16} />
            {language === 'bg' ? 'Качи видео' : 'Upload Video'}
            <input
              type="file"
              accept="video/*"
              onChange={handleFileUpload}
            />
          </UploadButton>
        )}
      </SectionHeader>

      {!video ? (
        <EmptyState $isDark={isDark}>
          <Video size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
          <p style={{ fontSize: '0.875rem', color: isDark ? '#94a3b8' : '#64748b', margin: 0 }}>
            {language === 'bg' 
              ? 'Все още няма качено видео'
              : 'No video uploaded yet'}
          </p>
        </EmptyState>
      ) : (
        <>
          <VideoContainer $isDark={isDark}>
            {isPlaying ? (
              <VideoPlayer
                ref={videoRef}
                src={video.videoUrl}
                controls
                onPause={handlePause}
                onEnded={() => setIsPlaying(false)}
              />
            ) : (
              <VideoThumbnail
                $thumbnailUrl={video.thumbnailUrl}
                $isDark={isDark}
                onClick={handlePlay}
              >
                <PlayButton $isDark={isDark}>
                  <Play size={24} fill="white" />
                </PlayButton>
              </VideoThumbnail>
            )}
          </VideoContainer>

          <VideoInfo $isDark={isDark}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Eye size={14} />
              {video.views} {language === 'bg' ? 'гледания' : 'views'}
            </span>
            {isOwnProfile && (
              <>
                <ActionButton $isDark={isDark} onClick={handleToggleVisibility}>
                  {video.isPublic ? <Unlock size={14} /> : <Lock size={14} />}
                  {video.isPublic 
                    ? (language === 'bg' ? 'Публично' : 'Public')
                    : (language === 'bg' ? 'Частно' : 'Private')}
                </ActionButton>
                <ActionButton $isDark={isDark} onClick={handleDelete}>
                  <Trash2 size={14} />
                  {language === 'bg' ? 'Изтрий' : 'Delete'}
                </ActionButton>
              </>
            )}
          </VideoInfo>
        </>
      )}
    </SectionContainer>
  );
};

export default IntroVideoSection;

