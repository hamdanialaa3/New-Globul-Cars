/**
 * Feed Item Card
 * Universal card component for all feed item types
 */

import React from 'react';
import styled from 'styled-components';
import { Video, Trophy, Award, Target, FileText, Play } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import type { FeedItem } from '../../services/social/smart-feed.service';

const CardContainer = styled.div<{ $isDark: boolean }>`
  background: ${props => props.$isDark ? '#1e293b' : '#ffffff'};
  border: 1px solid ${props => props.$isDark ? '#334155' : '#e4e6eb'};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    box-shadow: ${props => props.$isDark 
      ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
      : '0 4px 12px rgba(0, 0, 0, 0.1)'};
    transform: translateY(-2px);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const AuthorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AuthorAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
`;

const AuthorDetails = styled.div``;

const AuthorName = styled.div<{ $isDark: boolean }>`
  font-size: 15px;
  font-weight: 600;
  color: ${props => props.$isDark ? '#f1f5f9' : '#050505'};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const VerifiedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #1877f2;
  color: white;
  font-size: 10px;
  font-weight: bold;
`;

const PostTime = styled.div<{ $isDark: boolean }>`
  font-size: 13px;
  color: ${props => props.$isDark ? '#94a3b8' : '#65676b'};
`;

const TypeBadge = styled.div<{ $type: string; $isDark: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  background: ${props => {
    switch (props.$type) {
      case 'intro_video': return props.$isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)';
      case 'success_story': return props.$isDark ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)';
      case 'achievement': return props.$isDark ? 'rgba(251, 191, 36, 0.2)' : 'rgba(251, 191, 36, 0.1)';
      case 'challenge': return props.$isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)';
      default: return props.$isDark ? '#334155' : '#f0f2f5';
    }
  }};
  color: ${props => {
    switch (props.$type) {
      case 'intro_video': return '#3b82f6';
      case 'success_story': return '#22c55e';
      case 'achievement': return '#fbbf24';
      case 'challenge': return '#8b5cf6';
      default: return props.$isDark ? '#cbd5e1' : '#64748b';
    }
  }};
`;

const CardContent = styled.div`
  margin-bottom: 12px;
`;

const ContentTitle = styled.h3<{ $isDark: boolean }>`
  font-size: 17px;
  font-weight: 700;
  color: ${props => props.$isDark ? '#f1f5f9' : '#050505'};
  margin: 0 0 8px 0;
`;

const ContentText = styled.p<{ $isDark: boolean }>`
  font-size: 15px;
  line-height: 1.5;
  color: ${props => props.$isDark ? '#cbd5e1' : '#050505'};
  margin: 0;
  white-space: pre-wrap;
`;

const MediaContainer = styled.div`
  margin-top: 12px;
  border-radius: 8px;
  overflow: hidden;
`;

const VideoThumbnail = styled.div<{ $thumbnailUrl?: string; $isDark: boolean }>`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: ${props => props.$thumbnailUrl 
    ? `url(${props.$thumbnailUrl}) center/cover` 
    : props.$isDark ? '#0f172a' : '#f8fafc'};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const PlayButton = styled.div<{ $isDark: boolean }>`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.9);
    transform: scale(1.1);
  }
`;

const PostImages = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 4px;
  border-radius: 8px;
  overflow: hidden;
`;

const PostImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  cursor: pointer;

  &:hover {
    opacity: 0.95;
  }
`;

const CardStats = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 13px;
  color: #65676b;
  border-top: 1px solid #e4e6eb;
  margin-top: 12px;
`;

const StatsLeft = styled.div<{ $isDark: boolean }>`
  display: flex;
  gap: 8px;
  color: ${props => props.$isDark ? '#94a3b8' : '#65676b'};
`;

const StatsRight = styled.div<{ $isDark: boolean }>`
  display: flex;
  gap: 12px;
  color: ${props => props.$isDark ? '#94a3b8' : '#65676b'};
`;

const CardActions = styled.div`
  display: flex;
  justify-content: space-around;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid #e4e6eb;
  margin-top: 8px;
`;

const ActionButton = styled.button<{ $isDark: boolean }>`
  flex: 1;
  padding: 8px;
  background: transparent;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 600;
  color: ${props => props.$isDark ? '#cbd5e1' : '#65676b'};
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: ${props => props.$isDark ? '#334155' : '#f0f2f5'};
  }
`;

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'intro_video': return Video;
    case 'success_story': return Trophy;
    case 'achievement': return Award;
    case 'challenge': return Target;
    default: return FileText;
  }
};

const getTypeLabel = (type: string, language: string) => {
  const labels: Record<string, { bg: string; en: string }> = {
    'post': { bg: 'Публикация', en: 'Post' },
    'intro_video': { bg: 'Видео', en: 'Video' },
    'success_story': { bg: 'История за успех', en: 'Success Story' },
    'achievement': { bg: 'Постижение', en: 'Achievement' },
    'challenge': { bg: 'Предизвикателство', en: 'Challenge' },
    'news': { bg: 'Новина', en: 'News' }
  };
  return labels[type]?.[language === 'bg' ? 'bg' : 'en'] || type;
};

interface FeedItemCardProps {
  item: FeedItem;
}

export const FeedItemCard: React.FC<FeedItemCardProps> = ({ item }) => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === 'dark';
  const TypeIcon = getTypeIcon(item.type);

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    const date = timestamp instanceof Date 
      ? timestamp 
      : timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return language === 'bg' ? 'Току-що' : 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}${language === 'bg' ? 'м' : 'm'} ${language === 'bg' ? 'преди' : 'ago'}`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}${language === 'bg' ? 'ч' : 'h'} ${language === 'bg' ? 'преди' : 'ago'}`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}${language === 'bg' ? 'д' : 'd'} ${language === 'bg' ? 'преди' : 'ago'}`;
    return date.toLocaleDateString();
  };

  const handleClick = () => {
    if (item.type === 'post') {
      navigate(`/posts/${item.id}`);
    } else if (item.type === 'intro_video') {
      navigate(`/profile/${item.userId}`);
    } else if (item.type === 'success_story') {
      navigate(`/profile/${item.userId}`);
    } else if (item.type === 'achievement') {
      navigate(`/profile/${item.userId}`);
    }
  };

  return (
    <CardContainer $isDark={isDark} onClick={handleClick}>
      <CardHeader>
        <AuthorInfo>
          <AuthorAvatar 
            src={item.authorInfo.profileImage || `https://i.pravatar.cc/150?u=${item.userId}`} 
            alt={item.authorInfo.displayName}
          />
          <AuthorDetails>
            <AuthorName $isDark={isDark}>
              {item.authorInfo.displayName}
              {item.authorInfo.isVerified && <VerifiedBadge>✓</VerifiedBadge>}
            </AuthorName>
            <PostTime $isDark={isDark}>
              {formatTimestamp(item.createdAt)}
            </PostTime>
          </AuthorDetails>
        </AuthorInfo>
        <TypeBadge $type={item.type} $isDark={isDark}>
          <TypeIcon size={12} />
          {getTypeLabel(item.type, language)}
        </TypeBadge>
      </CardHeader>

      <CardContent>
        {item.content.title && (
          <ContentTitle $isDark={isDark}>{item.content.title}</ContentTitle>
        )}
        {item.content.text && (
          <ContentText $isDark={isDark}>{item.content.text}</ContentText>
        )}

        {item.type === 'intro_video' && item.content.videoUrl && (
          <MediaContainer>
            <VideoThumbnail 
              $thumbnailUrl={item.content.thumbnailUrl} 
              $isDark={isDark}
            >
              <PlayButton $isDark={isDark}>
                <Play size={24} fill="white" />
              </PlayButton>
            </VideoThumbnail>
          </MediaContainer>
        )}

        {item.content.media && item.content.media.urls && item.content.media.urls.length > 0 && (
          <MediaContainer>
            <PostImages>
              {item.content.media.urls.map((url, idx) => (
                <PostImage key={idx} src={url} alt="" />
              ))}
            </PostImages>
          </MediaContainer>
        )}
      </CardContent>

      <CardStats>
        <StatsLeft $isDark={isDark}>
          {item.engagement.likes > 0 && (
            <span>👍 {item.engagement.likes} {language === 'bg' ? 'харесвания' : 'likes'}</span>
          )}
        </StatsLeft>
        <StatsRight $isDark={isDark}>
          {item.engagement.comments > 0 && (
            <span>💬 {item.engagement.comments} {language === 'bg' ? 'коментари' : 'comments'}</span>
          )}
          {item.engagement.shares > 0 && (
            <span>↗️ {item.engagement.shares} {language === 'bg' ? 'споделяния' : 'shares'}</span>
          )}
          {item.engagement.views > 0 && (
            <span>👁️ {item.engagement.views} {language === 'bg' ? 'гледания' : 'views'}</span>
          )}
        </StatsRight>
      </CardStats>

      <CardActions>
        <ActionButton $isDark={isDark}>
          👍 {language === 'bg' ? 'Харесай' : 'Like'}
        </ActionButton>
        <ActionButton $isDark={isDark}>
          💬 {language === 'bg' ? 'Коментирай' : 'Comment'}
        </ActionButton>
        <ActionButton $isDark={isDark}>
          ↗️ {language === 'bg' ? 'Сподели' : 'Share'}
        </ActionButton>
      </CardActions>
    </CardContainer>
  );
};

export default FeedItemCard;

