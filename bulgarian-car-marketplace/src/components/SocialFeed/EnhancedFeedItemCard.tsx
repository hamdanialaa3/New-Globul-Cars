/**
 * Enhanced Feed Item Card
 * Full-featured card with complete engagement system
 * 
 * Features:
 * - Like/Unlike with real-time updates
 * - Advanced comments system with threading
 * - Share functionality
 * - Save/Unsave
 * - View tracking
 * - Real-time engagement updates
 * - Smooth animations
 */

import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreVertical,
  Send,
  ThumbsUp,
  Smile,
  X,
  Eye,
  TrendingUp,
  Flag,
  Reply
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { postsEngagementService } from '@/services/social/posts-engagement.service';
import { FeedStatsModal } from './FeedStatsModal';
import type { FeedItem } from '@/services/social/smart-feed.service';
import type { PostComment } from '@/services/social/posts-engagement.service';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';

const CardContainer = styled.div<{ $isDark: boolean }>`
  background: ${props => props.$isDark ? '#1e293b' : '#ffffff'};
  border: 1px solid ${props => props.$isDark ? '#334155' : '#e4e6eb'};
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &:hover {
    box-shadow: ${props => props.$isDark 
      ? '0 8px 24px rgba(0, 0, 0, 0.4)' 
      : '0 8px 24px rgba(0, 0, 0, 0.12)'};
    transform: translateY(-4px);
    border-color: ${props => props.$isDark ? '#475569' : '#cbd5e1'};
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::before {
    opacity: 1;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  position: relative;
`;

const AuthorSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  cursor: pointer;
`;

const AuthorAvatar = styled.div<{ $imageUrl?: string; $isDark: boolean }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${props => props.$imageUrl 
    ? `url(${props.$imageUrl}) center/cover` 
    : props.$isDark ? '#334155' : '#e2e8f0'};
  border: 2px solid ${props => props.$isDark ? '#475569' : '#cbd5e1'};
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 50%;
    padding: 2px;
    background: linear-gradient(45deg, #3b82f6, #8b5cf6);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::after {
    opacity: 1;
  }
`;

const AuthorInfo = styled.div`
  flex: 1;
`;

const AuthorName = styled.div<{ $isDark: boolean }>`
  font-size: 15px;
  font-weight: 700;
  color: ${props => props.$isDark ? '#f1f5f9' : '#050505'};
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
`;

const VerifiedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1877f2, #42a5f5);
  color: white;
  font-size: 11px;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(24, 119, 242, 0.3);
`;

const PostMeta = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: ${props => props.$isDark ? '#94a3b8' : '#65676b'};
`;

const TypeBadge = styled.div<{ $type: string; $isDark: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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

const MoreButton = styled.button<{ $isDark: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${props => props.$isDark ? '#94a3b8' : '#65676b'};
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    background: ${props => props.$isDark ? '#334155' : '#f0f2f5'};
    transform: rotate(90deg);
  }
`;

const ReportMenu = styled.div<{ $isDark: boolean }>`
  position: absolute;
  top: 40px;
  right: 0;
  background: ${props => props.$isDark ? '#1e293b' : '#ffffff'};
  border: 1px solid ${props => props.$isDark ? '#334155' : '#e2e8f0'};
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  min-width: 150px;
`;

const ReportMenuItem = styled.button<{ $isDark: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: transparent;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.$isDark ? '#cbd5e1' : '#050505'};
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: ${props => props.$isDark ? '#334155' : '#f0f2f5'};
  }
`;

const CardContent = styled.div`
  margin-bottom: 16px;
`;

const ContentTitle = styled.h3<{ $isDark: boolean }>`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.$isDark ? '#f1f5f9' : '#050505'};
  margin: 0 0 12px 0;
  line-height: 1.4;
`;

const ContentText = styled.p<{ $isDark: boolean }>`
  font-size: 15px;
  line-height: 1.6;
  color: ${props => props.$isDark ? '#cbd5e1' : '#050505'};
  margin: 0 0 16px 0;
  white-space: pre-wrap;
  word-break: break-word;
`;

const MediaContainer = styled.div`
  margin-top: 16px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
`;

const VideoThumbnail = styled.div<{ $thumbnailUrl?: string; $isDark: boolean }>`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: ${props => props.$thumbnailUrl 
    ? `url(${props.$thumbnailUrl}) center/cover` 
    : props.$isDark ? '#0f172a' : '#f8fafc'};
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.3);
    transition: background 0.3s ease;
  }

  &:hover::before {
    background: rgba(0, 0, 0, 0.5);
  }
`;

const PlayButton = styled.div<{ $isDark: boolean }>`
  position: relative;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
  z-index: 1;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);

  &:hover {
    transform: scale(1.15);
    background: white;
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
  }

  svg {
    margin-left: 4px;
  }
`;

const PostImages = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 4px;
  border-radius: 12px;
  overflow: hidden;
`;

const PostImage = styled.img`
  width: 100%;
  height: 300px;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const EngagementBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-top: 1px solid #e4e6eb;
  border-bottom: 1px solid #e4e6eb;
  margin: 16px 0;
`;

const EngagementStats = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 14px;
  color: ${props => props.$isDark ? '#94a3b8' : '#65676b'};
`;

const StatItem = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: ${props => props.$isDark ? '#cbd5e1' : '#050505'};
  }
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: space-around;
  gap: 4px;
  padding-top: 8px;
`;

const ActionButton = styled.button<{ $isDark: boolean; $active?: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  background: ${props => props.$active
    ? (props.$isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)')
    : 'transparent'};
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  color: ${props => {
    if (props.$active) return props.$isDark ? '#60a5fa' : '#2563eb';
    return props.$isDark ? '#cbd5e1' : '#65676b';
  }};
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    background: ${props => props.$isDark ? '#334155' : '#f0f2f5'};
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    transition: transform 0.2s ease;
  }

  &:hover svg {
    transform: ${props => props.$active ? 'scale(1.2)' : 'scale(1.1)'};
  }
`;

const CommentsSection = styled.div<{ $isDark: boolean; $expanded: boolean }>`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid ${props => props.$isDark ? '#334155' : '#e4e6eb'};
  max-height: ${props => props.$expanded ? '600px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease, padding 0.3s ease;
  ${props => !props.$expanded && 'padding-top: 0;'}
`;

const CommentForm = styled.form<{ $isDark: boolean }>`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const CommentInput = styled.input<{ $isDark: boolean }>`
  flex: 1;
  padding: 12px 16px;
  background: ${props => props.$isDark ? '#0f172a' : '#f8fafc'};
  border: 1px solid ${props => props.$isDark ? '#334155' : '#e2e8f0'};
  border-radius: 24px;
  font-size: 14px;
  color: ${props => props.$isDark ? '#f1f5f9' : '#050505'};
  outline: none;
  transition: all 0.2s ease;

  &:focus {
    border-color: ${props => props.$isDark ? '#3b82f6' : '#2563eb'};
    box-shadow: 0 0 0 3px ${props => props.$isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(37, 99, 235, 0.1)'};
  }

  &::placeholder {
    color: ${props => props.$isDark ? '#64748b' : '#94a3b8'};
  }
`;

const SendButton = styled.button<{ $isDark: boolean; $disabled?: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: ${props => props.$disabled
    ? (props.$isDark ? '#334155' : '#e2e8f0')
    : 'linear-gradient(135deg, #3b82f6, #8b5cf6)'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  opacity: ${props => props.$disabled ? 0.5 : 1};

  &:hover:not(:disabled) {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }
`;

const CommentsList = styled.div<{ $isDark: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 8px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.$isDark ? '#475569' : '#cbd5e1'};
    border-radius: 3px;
  }
`;

const CommentItem = styled.div<{ $isDark: boolean }>`
  display: flex;
  gap: 12px;
  padding: 12px;
  background: ${props => props.$isDark ? '#0f172a' : '#f8fafc'};
  border-radius: 12px;
  transition: background 0.2s ease;

  &:hover {
    background: ${props => props.$isDark ? '#1e293b' : '#f1f5f9'};
  }
`;

const CommentAvatar = styled.div<{ $imageUrl?: string; $isDark: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.$imageUrl 
    ? `url(${props.$imageUrl}) center/cover` 
    : props.$isDark ? '#334155' : '#e2e8f0'};
  flex-shrink: 0;
`;

const CommentContent = styled.div`
  flex: 1;
`;

const CommentAuthor = styled.div<{ $isDark: boolean }>`
  font-size: 13px;
  font-weight: 600;
  color: ${props => props.$isDark ? '#f1f5f9' : '#050505'};
  margin-bottom: 4px;
`;

const CommentText = styled.div<{ $isDark: boolean }>`
  font-size: 14px;
  color: ${props => props.$isDark ? '#cbd5e1' : '#050505'};
  line-height: 1.5;
  margin-bottom: 6px;
`;

const CommentActions = styled.div`
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #65676b;
`;

const CommentAction = styled.button<{ $isDark: boolean }>`
  background: none;
  border: none;
  color: ${props => props.$isDark ? '#94a3b8' : '#65676b'};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    background: ${props => props.$isDark ? '#334155' : '#f0f2f5'};
    color: ${props => props.$isDark ? '#cbd5e1' : '#050505'};
  }
`;

const ReplyIndicator = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: ${props => props.$isDark ? '#334155' : '#f0f2f5'};
  border-radius: 8px;
  font-size: 12px;
  color: ${props => props.$isDark ? '#cbd5e1' : '#64748b'};
  margin-bottom: 8px;
`;

interface EnhancedFeedItemCardProps {
  item: FeedItem;
  onUpdate?: (item: FeedItem) => void;
}

export const EnhancedFeedItemCard: React.FC<EnhancedFeedItemCardProps> = ({
  item,
  onUpdate
}) => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isDark = theme === 'dark';
  
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [engagement, setEngagement] = useState(item.engagement);
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showReportMenu, setShowReportMenu] = useState(false);
  
  const commentInputRef = useRef<HTMLInputElement>(null);
  const hasTrackedView = useRef(false);

  // Track view on mount
  useEffect(() => {
    if (!hasTrackedView.current && item.type === 'post' && item.id) {
      postsEngagementService.incrementViews(item.id);
      hasTrackedView.current = true;
    }
  }, [item.id, item.type]);

  // Real-time engagement updates
  useEffect(() => {
    if (item.type !== 'post' || !item.id) return;

    const postRef = doc(db, 'posts', item.id);
    const unsubscribe = onSnapshot(postRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setEngagement(data.engagement || item.engagement);
        
        // Check if user liked
        if (user?.uid) {
          const reactions = data.reactions || {};
          setLiked(!!reactions[user.uid]);
        }
      }
    });

    return () => unsubscribe();
  }, [item.id, item.type, user?.uid]);

  // Load comments
  useEffect(() => {
    if (!showComments || item.type !== 'post' || !item.id) return;

    const commentsQuery = query(
      collection(db, 'posts', item.id, 'comments'),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PostComment));
      setComments(commentsData);
    });

    return () => unsubscribe();
  }, [showComments, item.id, item.type]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || item.type !== 'post' || !item.id || isLiking) return;

    setIsLiking(true);
    try {
      const newLiked = await postsEngagementService.toggleLike(item.id, user.uid);
      setLiked(newLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    setShowComments(!showComments);
    if (!showComments) {
      setTimeout(() => commentInputRef.current?.focus(), 100);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || item.type !== 'post' || !item.id) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: item.content.title || item.content.text || 'Check this out!',
          text: item.content.text,
          url: `${window.location.origin}/posts/${item.id}`
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${window.location.origin}/posts/${item.id}`);
        // Show toast notification (you can implement this)
      }
      await postsEngagementService.sharePost(item.id, user.uid);
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || item.type !== 'post' || !item.id) return;

    try {
      await postsEngagementService.savePost(item.id, user.uid);
      setSaved(!saved);
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user || !commentText.trim() || item.type !== 'post' || !item.id || isCommenting) return;

    setIsCommenting(true);
    try {
      await postsEngagementService.addComment(
        item.id, 
        user.uid, 
        commentText.trim(),
        replyingTo || undefined
      );
      setCommentText('');
      setReplyingTo(null);
      setShowComments(true);
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsCommenting(false);
    }
  };

  const handleReply = (commentId: string, authorName: string) => {
    setReplyingTo(commentId);
    setCommentText(`@${authorName} `);
    commentInputRef.current?.focus();
  };

  const handleReport = async () => {
    if (!user || !item.id) return;
    // Implement report functionality
    alert(language === 'bg' 
      ? 'Благодарим ви за докладването. Ще прегледаме това съдържание.'
      : 'Thank you for reporting. We will review this content.');
    setShowReportMenu(false);
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return language === 'bg' ? 'Току-що' : 'Just now';
    const date = timestamp instanceof Date 
      ? timestamp 
      : timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return language === 'bg' ? 'Току-що' : 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}${language === 'bg' ? 'м' : 'm'}`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}${language === 'bg' ? 'ч' : 'h'}`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}${language === 'bg' ? 'д' : 'd'}`;
    return date.toLocaleDateString();
  };

  const handleCardClick = () => {
    if (item.type === 'post') {
      navigate(`/posts/${item.id}`);
    } else if (item.type === 'intro_video' || item.type === 'success_story' || item.type === 'achievement') {
      navigate(`/profile/${item.userId}`);
    }
  };

  return (
    <CardContainer $isDark={isDark} onClick={handleCardClick}>
      <CardHeader>
        <AuthorSection onClick={(e) => {
          e.stopPropagation();
          navigate(`/profile/${item.userId}`);
        }}>
          <AuthorAvatar 
            $imageUrl={item.authorInfo.profileImage} 
            $isDark={isDark}
          />
          <AuthorInfo>
            <AuthorName $isDark={isDark}>
              {item.authorInfo.displayName}
              {item.authorInfo.isVerified && <VerifiedBadge>✓</VerifiedBadge>}
            </AuthorName>
            <PostMeta $isDark={isDark}>
              <span>{formatTimestamp(item.createdAt)}</span>
              <TypeBadge $type={item.type} $isDark={isDark}>
                {item.type.replace('_', ' ')}
              </TypeBadge>
            </PostMeta>
          </AuthorInfo>
        </AuthorSection>
        <MoreButton 
          $isDark={isDark}
          onClick={(e) => {
            e.stopPropagation();
            setShowReportMenu(!showReportMenu);
          }}
        >
          <MoreVertical size={18} />
        </MoreButton>
        
        {showReportMenu && (
          <ReportMenu $isDark={isDark}>
            <ReportMenuItem $isDark={isDark} onClick={handleReport}>
              <Flag size={16} />
              {language === 'bg' ? 'Докладвай' : 'Report'}
            </ReportMenuItem>
          </ReportMenu>
        )}
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
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/profile/${item.userId}`);
              }}
            >
              <PlayButton $isDark={isDark}>
                <Play size={32} fill="currentColor" />
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

      <EngagementBar>
        <EngagementStats $isDark={isDark} onClick={(e) => {
          e.stopPropagation();
          setShowStats(true);
        }}>
          {engagement.likes > 0 && (
            <StatItem $isDark={isDark}>
              <ThumbsUp size={16} />
              {engagement.likes}
            </StatItem>
          )}
          {engagement.comments > 0 && (
            <StatItem $isDark={isDark}>
              <MessageCircle size={16} />
              {engagement.comments}
            </StatItem>
          )}
          {engagement.shares > 0 && (
            <StatItem $isDark={isDark}>
              <Share2 size={16} />
              {engagement.shares}
            </StatItem>
          )}
          {engagement.views > 0 && (
            <StatItem $isDark={isDark}>
              <Eye size={16} />
              {engagement.views}
            </StatItem>
          )}
        </EngagementStats>
      </EngagementBar>

      <ActionButtons>
        <ActionButton 
          $isDark={isDark} 
          $active={liked}
          onClick={handleLike}
          disabled={isLiking || !user}
        >
          <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
          {language === 'bg' ? 'Харесай' : 'Like'}
        </ActionButton>
        
        <ActionButton 
          $isDark={isDark} 
          $active={showComments}
          onClick={handleComment}
        >
          <MessageCircle size={18} />
          {language === 'bg' ? 'Коментирай' : 'Comment'}
        </ActionButton>
        
        <ActionButton $isDark={isDark} onClick={handleShare}>
          <Share2 size={18} />
          {language === 'bg' ? 'Сподели' : 'Share'}
        </ActionButton>
        
        <ActionButton 
          $isDark={isDark} 
          $active={saved}
          onClick={handleSave}
        >
          <Bookmark size={18} fill={saved ? 'currentColor' : 'none'} />
        </ActionButton>
      </ActionButtons>

      {showComments && item.type === 'post' && item.id && (
        <CommentsSection $isDark={isDark} $expanded={showComments}>
          <CommentForm $isDark={isDark} onSubmit={handleSubmitComment}>
            {replyingTo && (
              <ReplyIndicator $isDark={isDark}>
                <Reply size={14} />
                {language === 'bg' ? 'Отговаряш на коментар' : 'Replying to comment'}
                <button
                  type="button"
                  onClick={() => {
                    setReplyingTo(null);
                    setCommentText('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'inherit',
                    cursor: 'pointer',
                    marginLeft: 'auto'
                  }}
                >
                  <X size={14} />
                </button>
              </ReplyIndicator>
            )}
            <CommentInput
              ref={commentInputRef}
              $isDark={isDark}
              type="text"
              placeholder={
                replyingTo 
                  ? (language === 'bg' ? 'Напиши отговор...' : 'Write a reply...')
                  : (language === 'bg' ? 'Напиши коментар...' : 'Write a comment...')
              }
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            <SendButton 
              $isDark={isDark} 
              type="submit"
              disabled={!commentText.trim() || isCommenting}
            >
              <Send size={18} />
            </SendButton>
          </CommentForm>

          <CommentsList $isDark={isDark}>
            {comments.map(comment => (
              <CommentItem key={comment.id} $isDark={isDark}>
                <CommentAvatar 
                  $imageUrl={comment.authorInfo.profileImage} 
                  $isDark={isDark}
                />
                <CommentContent>
                  <CommentAuthor $isDark={isDark}>
                    {comment.authorInfo.displayName}
                  </CommentAuthor>
                  <CommentText $isDark={isDark}>
                    {comment.content}
                  </CommentText>
                  <CommentActions>
                    <CommentAction 
                      $isDark={isDark}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReply(comment.id, comment.authorInfo.displayName);
                      }}
                    >
                      <Reply size={12} />
                      {language === 'bg' ? 'Отговори' : 'Reply'}
                    </CommentAction>
                    <CommentAction $isDark={isDark}>
                      {formatTimestamp(comment.createdAt)}
                    </CommentAction>
                    {comment.likes > 0 && (
                      <CommentAction $isDark={isDark}>
                        👍 {comment.likes}
                      </CommentAction>
                    )}
                  </CommentActions>
                </CommentContent>
              </CommentItem>
            ))}
          </CommentsList>
        </CommentsSection>
      )}

      <FeedStatsModal
        item={item}
        isOpen={showStats}
        onClose={() => setShowStats(false)}
      />
    </CardContainer>
  );
};

export default EnhancedFeedItemCard;

