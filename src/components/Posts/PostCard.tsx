import { logger } from '../../services/logger-service';
// src/components/Posts/PostCard.tsx
// Post Card Component - Display individual post
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthProvider';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark,
  MoreHorizontal,
  MapPin
} from 'lucide-react';
import { postsEngagementService } from '../../services/social/posts-engagement.service';
import { Post } from '../../services/social/posts.service';
import ImageGallery from './ImageGallery';
import { PostComments } from './PostComments';
import { CommentForm } from './CommentForm';
import { realtimeFeedService } from '../../services/social/realtime-feed.service';

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
    border-color: #3B82F6;
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
    : 'linear-gradient(135deg, #3B82F6, #2563EB)'};
  background-size: cover;
  background-position: center;
  border: 2px solid #3B82F6;
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
      default: return 'linear-gradient(135deg, #3B82F6, #2563EB)';
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
      color: #2563EB;
      font-weight: 600;
      cursor: pointer;
      font-size: 0.875rem;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
`;

// Removed: PostMedia is now handled by ImageGallery component

  // NEW: Map Container for text-only posts
const PostMapContainer = styled.div`
  position: relative;
  margin: 16px 0;
  border-radius: 12px;
  overflow: hidden;
  height: 300px;
  border: 2px solid #e9ecef;
`;

const TextOverMap = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to bottom, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.8) 70%, transparent 100%);
  padding: 20px;
  z-index: 1;
  
  .text {
    font-size: 1.1rem;
    line-height: 1.6;
    color: #212529;
    font-weight: 500;
    margin-bottom: 8px;
    max-height: 120px;
    overflow-y: auto;
  }
  
  .location-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: rgba(99, 102, 241, 0.1);
    color: #2563EB;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 0.85rem;
    font-weight: 600;
    
    svg {
      width: 14px;
      height: 14px;
    }
  }
`;

const MapElement = styled.div`
  width: 100%;
  height: 100%;
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
  background: ${p => p.$active ? 'rgba(99, 102, 241, 0.1)' : 'transparent'};
  color: ${p => p.$active ? '#2563EB' : '#6c757d'};
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(99, 102, 241, 0.1);
    color: #2563EB;
    transform: translateY(-1px);
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const CommentsSection = styled.div`
  border-top: 1px solid #e9ecef;
  padding-top: 16px;
  margin-top: 16px;
  max-height: 600px;
  overflow-y: auto;
`;

// ==================== LOCATION MAP COMPONENT ====================

interface LocationMapProps {
  location: {
    displayName: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  text: string;
}

const LocationMap: React.FC<LocationMapProps> = ({ location, text }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || typeof google === 'undefined') return;

    // Guard: Check if coordinates exist before destructuring
    if (!location?.coordinates) return;

    const { latitude, longitude } = location.coordinates;

    const map = new google.maps.Map(mapRef.current, {
      center: { lat: latitude, lng: longitude },
      zoom: 14,
      disableDefaultUI: true,
      zoomControl: false,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      gestureHandling: 'cooperative',
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    new google.maps.Marker({
      position: { lat: latitude, lng: longitude },
      map: map,
      animation: google.maps.Animation.DROP,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: '#2563EB',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
        scale: 12
      }
    });

    googleMapRef.current = map;
  }, [location]);

  return (
    <PostMapContainer>
      <TextOverMap>
        <div className="text">{text}</div>
        <div className="location-tag">
          <MapPin />
          {location.displayName}
        </div>
      </TextOverMap>
      <MapElement ref={mapRef} />
    </PostMapContainer>
  );
};

// ==================== POST CARD COMPONENT ====================

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
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(post.engagement.comments);
  
  // Real-time subscriptions
  useEffect(() => {
    // Subscribe to reactions
    const unsubReactions = realtimeFeedService.subscribeToReactions(
      post.id,
      () => {
        // Reload post data or increment counter
        onLike?.(post.id);
      }
    );

    // Subscribe to comments
    const unsubComments = realtimeFeedService.subscribeToComments(
      post.id,
      () => {
        // Update comment count
        setCommentCount(prev => prev + 1);
        onComment?.(post.id);
      }
    );

    // Cleanup on unmount
    return () => {
      unsubReactions();
      unsubComments();
    };
  }, [post.id, onLike, onComment]);
  
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
      logger.error('Error liking post:', error);
    }
  };
  
  const handleComment = () => {
    setShowComments(!showComments);
    onComment?.(post.id);
  };
  
  const handleAuthorClick = () => {
    // 🔒 STRICT: Use /profile/view/{numericId} for other users' profiles
    // PostCard author is always another user, so use view path
    if (post.authorNumericId) {
      navigate(`/profile/view/${post.authorNumericId}`);
    } else {
      // 🔒 STRICT: Do NOT navigate with Firebase UID — numeric ID is required
      logger.warn('PostCard: Missing authorNumericId for profile navigation', { authorId: post.authorId });
    }
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
            {post.location?.city && ` • ${post.locationData?.cityName}`}
          </div>
        </AuthorInfo>
        <MoreButton>
          <MoreHorizontal size={20} />
        </MoreButton>
      </PostHeader>
      
      <PostContent>
        {/* Show text (without map) if post has images */}
        {post.content.media && post.content.media.urls.length > 0 ? (
          <div className="text">{post.content.text}</div>
        ) : (
          /* Show text over map ONLY for text-only posts with location */
          post.location?.coordinates ? (
            <LocationMap 
              location={post.location} 
              text={post.content.text}
            />
          ) : (
            <div className="text">{post.content.text}</div>
          )
        )}
        
        {/* Smart Image Gallery - supports 1-5 images */}
        {post.content.media && post.content.media.urls.length > 0 && (
          <ImageGallery images={post.content.media.urls} />
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
          {commentCount}
        </ActionButton>
        
        <ActionButton>
          <Share2 size={18} />
          Share
        </ActionButton>
        
        <ActionButton style={{ marginLeft: 'auto' }}>
          <Bookmark size={18} />
        </ActionButton>
      </PostActions>
      
      {/* Comments Section */}
      {showComments && (
        <CommentsSection>
          <CommentForm
            postId={post.id}
            onCommentAdded={() => {
              setCommentCount(prev => prev + 1);
              onComment?.(post.id);
            }}
          />
          <PostComments 
            postId={post.id}
            onCommentAdded={() => {
              setCommentCount(prev => prev + 1);
            }}
          />
        </CommentsSection>
      )}
    </Card>
  );
};

export default PostCard;



