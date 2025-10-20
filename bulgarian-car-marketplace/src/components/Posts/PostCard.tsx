// src/components/Posts/PostCard.tsx
// Post Card Component - Display individual post
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthProvider';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark,
  MoreHorizontal
} from 'lucide-react';
import { postsEngagementService } from '../../services/social/posts-engagement.service';
import { Post } from '../../services/social/posts.service';

// ==================== STYLED COMPONENTS ====================

const Card = styled.article`
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
    border-color: #FF8F10;
  }
`;

const PostHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const Avatar = styled.div<{ $url?: string; $initial: string }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${p => p.$url 
    ? `url(${p.$url})` 
    : 'linear-gradient(135deg, #FF8F10, #FF7900)'};
  background-size: cover;
  background-position: center;
  border: 2px solid #FF8F10;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 800;
  color: white;
  
  &::before {
    content: '${p => !p.$url ? p.$initial : ''}';
  }
`;

const AuthorInfo = styled.div`
  flex: 1;
  cursor: pointer;
  
  .name {
    font-weight: 700;
    color: #212529;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
    font-size: 0.95rem;
  }
  
  .meta {
    font-size: 0.85rem;
    color: #6c757d;
  }
`;

const Badge = styled.span<{ $type: string }>`
  font-size: 0.65rem;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 600;
  background: ${p => {
    switch (p.$type) {
      case 'dealer': return 'linear-gradient(135deg, #16a34a, #22c55e)';
      case 'company': return 'linear-gradient(135deg, #1d4ed8, #3b82f6)';
      default: return 'linear-gradient(135deg, #FF8F10, #FF7900)';
    }
  }};
  color: white;
`;

const MoreButton = styled.button`
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: background 0.2s ease;
  
  &:hover {
    background: #f8f9fa;
  }
`;

const PostContent = styled.div`
  margin-bottom: 16px;
  
  .text {
    font-size: 0.95rem;
    line-height: 1.6;
    color: #212529;
    margin-bottom: 12px;
    white-space: pre-wrap;
  }
  
  .hashtags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
    
    span {
      color: #FF7900;
      font-weight: 600;
      cursor: pointer;
      font-size: 0.875rem;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
`;

const PostMedia = styled.div`
  margin: 16px 0;
  border-radius: 12px;
  overflow: hidden;
  max-height: 500px;
  
  img {
    width: 100%;
    height: auto;
    display: block;
    object-fit: cover;
  }
`;

const PostActions = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  padding-top: 16px;
  border-top: 1px solid #e9ecef;
`;

const ActionButton = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: none;
  background: ${p => p.$active ? 'rgba(255, 121, 0, 0.1)' : 'transparent'};
  color: ${p => p.$active ? '#FF7900' : '#6c757d'};
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 121, 0, 0.1);
    color: #FF7900;
    transform: translateY(-1px);
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

// ==================== COMPONENT ====================

interface PostCardProps {
  post: Post;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  onLike,
  onComment 
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.reactions?.[user?.uid || ''] === 'like');
  const [likes, setLikes] = useState(post.engagement.likes);
  
  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      const newLikedState = await postsEngagementService.toggleLike(post.id, user.uid);
      setLiked(newLikedState);
      setLikes(prev => newLikedState ? prev + 1 : prev - 1);
      onLike?.(post.id);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };
  
  const handleComment = () => {
    onComment?.(post.id);
  };
  
  const handleAuthorClick = () => {
    navigate(`/profile?userId=${post.authorId}`);
  };
  
  const initial = post.authorInfo.displayName?.[0]?.toUpperCase() || '?';
  
  return (
    <Card>
      <PostHeader>
        <Avatar 
          $url={post.authorInfo.profileImage}
          $initial={initial}
          onClick={handleAuthorClick}
        />
        <AuthorInfo onClick={handleAuthorClick}>
          <div className="name">
            {post.authorInfo.displayName}
            <Badge $type={post.authorInfo.profileType}>
              {post.authorInfo.profileType}
            </Badge>
          </div>
          <div className="meta">
            {post.createdAt?.toDate?.().toLocaleDateString()} 
            {post.location?.city && ` • ${post.location.city}`}
          </div>
        </AuthorInfo>
        <MoreButton>
          <MoreHorizontal size={20} />
        </MoreButton>
      </PostHeader>
      
      <PostContent>
        <div className="text">{post.content.text}</div>
        
        {post.content.media && post.content.media.urls.length > 0 && (
          <PostMedia>
            <img src={post.content.media.urls[0]} alt="Post media" />
          </PostMedia>
        )}
        
        {post.content.hashtags && post.content.hashtags.length > 0 && (
          <div className="hashtags">
            {post.content.hashtags.map((tag: string, i: number) => (
              <span key={i}>#{tag}</span>
            ))}
          </div>
        )}
      </PostContent>
      
      <PostActions>
        <ActionButton 
          $active={liked}
          onClick={handleLike}
        >
          <Heart 
            size={18} 
            fill={liked ? 'currentColor' : 'none'}
          />
          {likes}
        </ActionButton>
        
        <ActionButton onClick={handleComment}>
          <MessageCircle size={18} />
          {post.engagement.comments}
        </ActionButton>
        
        <ActionButton>
          <Share2 size={18} />
          Share
        </ActionButton>
        
        <ActionButton style={{ marginLeft: 'auto' }}>
          <Bookmark size={18} />
        </ActionButton>
      </PostActions>
    </Card>
  );
};

export default PostCard;

