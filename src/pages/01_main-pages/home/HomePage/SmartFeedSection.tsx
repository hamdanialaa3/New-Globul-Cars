import { logger } from '../../../../services/logger-service';
// Smart Feed Section - AI-Powered Community Feed (Third Section)
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { usePullToRefresh } from '../../../../hooks/useMobileInteractions';
import { PullToRefreshIndicator } from '../../../../components/mobile/PullToRefreshIndicator';
import { toast } from 'react-toastify';
import { useAuth } from '../../../../contexts/AuthProvider';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { useTheme } from '../../../../contexts/ThemeContext';
import feedAlgorithmService from '../../../../services/social/algorithms/feed-algorithm.service';
import personalizationService from '../../../../services/social/algorithms/personalization.service';
import PostCard from '../../../../components/Posts/PostCard';
import { Post } from '../../../../services/social/posts.service';
import { Image, Video, Car, Sparkles, Clock, Heart, MessageCircle, TrendingUp, User as UserIcon } from 'lucide-react';
import { homePageCache, CACHE_KEYS } from '../../../../services/homepage-cache.service';
import { NewPostsBanner } from '../../../../components/Feed/NewPostsBanner';

type FeedMode = 'smart' | 'newest' | 'most_liked' | 'most_comments' | 'trending';

const SmartFeedSection: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [feedMode, setFeedMode] = useState<FeedMode>('smart');
  
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);


  // Load initial feed
  const loadFeed = useCallback(async (pageNum: number) => {
    if (pageNum > 1) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      let newPosts: Post[] = [];

      // ⚡ OPTIMIZED: Reduced from 10 posts to 5 for faster initial load
      const postsPerPage = pageNum === 1 ? 5 : 10; // First page: 5 posts, next pages: 10 posts
      
      // ⚡ OPTIMIZED: Cache feed data for 3 minutes (shorter than other data)
      const cacheKey = CACHE_KEYS.SMART_FEED(user?.uid || 'guest', feedMode, pageNum);
      
      newPosts = await homePageCache.getOrFetch(
        cacheKey,
        async () => {
          // Get posts based on feed mode
          switch (feedMode) {
            case 'smart':
              // AI-powered personalized feed with intelligent scoring
              return user
                ? await feedAlgorithmService.getPersonalizedFeed(user.uid, pageNum, postsPerPage)
                : await feedAlgorithmService.getPublicFeed(pageNum, postsPerPage);

            case 'newest':
              // Sort by creation date (newest first)
              return await feedAlgorithmService.getNewestPosts(pageNum, postsPerPage);

            case 'most_liked':
              // Sort by likes count
              return await feedAlgorithmService.getMostLikedPosts(postsPerPage);

            case 'most_comments':
              // Sort by comments count
              return await feedAlgorithmService.getMostCommentedPosts(postsPerPage);

            case 'trending':
              // Trending = high engagement in last 24h
              return await feedAlgorithmService.getTrendingPosts(postsPerPage);

            default:
              return await feedAlgorithmService.getPublicFeed(pageNum, postsPerPage);
          }
        },
        3 * 60 * 1000 // 3 minutes cache for social feed
      );

      if (newPosts.length < postsPerPage) {
        setHasMore(false);
      }

      setPosts(prev => pageNum === 1 ? newPosts : [...prev, ...newPosts]);
    } catch (error) {
      logger.error('Failed to load feed:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [user, feedMode]);

  // Load initial feed
  useEffect(() => {
    loadFeed(1);
  }, [loadFeed]);

  // Pull-to-Refresh: Container ref (placed after loadFeed to avoid TDZ)
  const feedContainerRef = useRef<HTMLDivElement>(null);

  // Pull-to-Refresh: Refresh handler
  const handleRefreshFeed = useCallback(async () => {
    try {
      logger.info('🔄 Pull-to-refresh: Refreshing feed');

      // Reset and reload feed
      setPosts([]);
      setPage(1);
      setHasMore(true);
      await loadFeed(1);

      toast.success(language === 'bg' ? 'Емисията е актуализирана' : 'Feed refreshed');
    } catch (error) {
      logger.error('❌ Pull-to-refresh: Failed to refresh feed', error as Error);
      toast.error(language === 'bg' ? 'Грешка при актуализиране' : 'Failed to refresh');
    }
  }, [language, loadFeed]);

  // Pull-to-Refresh: Hook
  const { pulling, refreshing } = usePullToRefresh(feedContainerRef, handleRefreshFeed);

  // ⚡ OPTIMIZED: Infinite scroll observer with debouncing
  useEffect(() => {
    let debounceTimer: NodeJS.Timeout | null = null;
    
    const options = {
      root: null,
      rootMargin: '100px', // ⚡ Reduced from 200px to 100px
      threshold: 0.1
    };

    observerRef.current = new IntersectionObserver(
      async ([entry]) => {
        if (entry.isIntersecting && hasMore && !loadingMore) {
          // ⚡ Debounce: Wait 500ms before loading more
          if (debounceTimer) {
            clearTimeout(debounceTimer);
          }
          debounceTimer = setTimeout(async () => {
            await loadMore();
          }, 500);
        }
      },
      options
    );

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [hasMore, loadingMore, page]);

  // Load more posts
  const loadMore = useCallback(async () => {
    const nextPage = page + 1;
    setPage(nextPage);
    await loadFeed(nextPage);
  }, [page]);

  // Handle engagement
  const handleEngagement = useCallback(async (
    postId: string,
    actionType: string
  ) => {
    if (!user) return;

    // Optimistic update
    setPosts(prev => prev.map((post: any) => {
      if (post.id === postId) {
        const field = actionType === 'like' ? 'likes' : actionType + 's';
        return {
          ...post,
          engagement: {
            ...post.engagement,
            [field]: (post.engagement[field as keyof typeof post.engagement] || 0) + 1
          }
        };
      }
      return post;
    }));

    // Track interest
    const post = posts.find(p => p.id === postId);
    if (post && (actionType === 'like' || actionType === 'comment' || actionType === 'share' || actionType === 'save')) {
      await personalizationService.trackInterest(
        user.uid,
        { 
          userId: user.uid, 
          postId, 
          type: actionType as any, 
          timestamp: Date.now() 
        },
        post
      );
    }
  }, [user, posts]);

  // New Posts Banner integration
  const handleRefresh = useCallback(() => {
    setPage(1);
    setPosts([]);
    loadFeed(1);
  }, [loadFeed]);

  const text = {
    bg: {
      title: 'Новини от общността',
      subtitle: 'Споделете вашите истории, открийте нови автомобили и се свържете със съмишленици',
      createPlaceholder: 'Какво мислите',
      addPhoto: 'Снимка',
      addVideo: 'Видео',
      addCar: 'Автомобил',
      noPostsTitle: 'Все още няма публикации',
      noPostsDesc: 'Бъдете първият, който споделя нещо интересно!',
      createFirst: 'Създай първата публикация',
      endOfFeed: 'Видяхте всички публикации',
      loginToPost: 'Влезте, за да създадете публикация',
      loadingMore: 'Зареждане на още...',
      filters: {
        smart: 'Интелигентен',
        newest: 'Най-нови',
        mostLiked: 'Най-харесвани',
        mostComments: 'Най-коментирани',
        trending: 'Популярни'
      }
    },
    en: {
      title: 'Community Feed',
      subtitle: 'Share your stories, discover new cars, and connect with fellow enthusiasts',
      createPlaceholder: 'What\'s on your mind',
      addPhoto: 'Photo',
      addVideo: 'Video',
      addCar: 'Car',
      noPostsTitle: 'No posts yet',
      noPostsDesc: 'Be the first to share something interesting!',
      createFirst: 'Create First Post',
      endOfFeed: 'You\'ve seen all posts',
      loginToPost: 'Log in to create a post',
      loadingMore: 'Loading more...',
      filters: {
        smart: 'Smart',
        newest: 'Newest',
        mostLiked: 'Most Liked',
        mostComments: 'Most Comments',
        trending: 'Trending'
      }
    }
  };

  const t = text[language];

  return (
    <FeedSection $isDark={isDark}>
      <FeedContainer ref={feedContainerRef}>
        <PullToRefreshIndicator 
          pulling={pulling}
          refreshing={refreshing}
          pullingText={language === 'bg' ? 'Издърпайте за опресняване' : 'Pull to refresh'}
          refreshingText={language === 'bg' ? 'Опресняване...' : 'Refreshing...'}
          position="top"
        />
        <FeedHeader>
          <FeedTitle $isDark={isDark}>{t.title}</FeedTitle>
          <FeedSubtitle $isDark={isDark}>{t.subtitle}</FeedSubtitle>
        </FeedHeader>

        <FilterBar>
          <FilterButton 
            $active={feedMode === 'smart'} 
            $isDark={isDark}
            onClick={() => { setFeedMode('smart'); setPage(1); }}
          >
            <Sparkles size={16} />
            <span>{t.filters.smart}</span>
          </FilterButton>
          <FilterButton 
            $active={feedMode === 'newest'} 
            $isDark={isDark}
            onClick={() => { setFeedMode('newest'); setPage(1); }}
          >
            <Clock size={16} />
            <span>{t.filters.newest}</span>
          </FilterButton>
          <FilterButton 
            $active={feedMode === 'most_liked'} 
            $isDark={isDark}
            onClick={() => { setFeedMode('most_liked'); setPage(1); }}
          >
            <Heart size={16} />
            <span>{t.filters.mostLiked}</span>
          </FilterButton>
          <FilterButton 
            $active={feedMode === 'most_comments'} 
            $isDark={isDark}
            onClick={() => { setFeedMode('most_comments'); setPage(1); }}
          >
            <MessageCircle size={16} />
            <span>{t.filters.mostComments}</span>
          </FilterButton>
          <FilterButton 
            $active={feedMode === 'trending'} 
            $isDark={isDark}
            onClick={() => { setFeedMode('trending'); setPage(1); }}
          >
            <TrendingUp size={16} />
            <span>{t.filters.trending}</span>
          </FilterButton>
        </FilterBar>

        {user && (
          <CreatePostTrigger $isDark={isDark} onClick={() => navigate('/create-post')}>
            <UserAvatar $hasImage={!!(user as any).profileImage} $imageUrl={(user as any).profileImage}>
              {!(user as any).profileImage && <UserIcon size={24} />}
            </UserAvatar>
            <CreatePostPlaceholder $isDark={isDark}>
              {t.createPlaceholder}, {(user as any).displayName || 'User'}?
            </CreatePostPlaceholder>
            <CreatePostActions>
              <ActionButton $isDark={isDark}>
                <Image size={20} />
                <span>{t.addPhoto}</span>
              </ActionButton>
              <ActionButton $isDark={isDark}>
                <Video size={20} />
                <span>{t.addVideo}</span>
              </ActionButton>
              <ActionButton $isDark={isDark}>
                <Car size={20} />
                <span>{t.addCar}</span>
              </ActionButton>
            </CreatePostActions>
          </CreatePostTrigger>
        )}

        {!user && (
          <LoginPrompt $isDark={isDark} onClick={() => navigate('/login')}>
            {t.loginToPost}
          </LoginPrompt>
        )}

        <PostsGrid>
          {posts.map((post: any) => (
            <PostCard
              key={post.id}
              post={post}
            />
          ))}
        </PostsGrid>

        {loading && !loadingMore && (
          <LoadingSpinner />
        )}

        {loadingMore && (
          <LoadingMore $isDark={isDark}>{t.loadingMore}</LoadingMore>
        )}

        <div ref={sentinelRef} style={{ height: 1 }} />

        {!hasMore && posts.length > 0 && (
          <EndOfFeed $isDark={isDark}>{t.endOfFeed}</EndOfFeed>
        )}

        {!loading && posts.length === 0 && (
          <EmptyState>
            <EmptyTitle $isDark={isDark}>{t.noPostsTitle}</EmptyTitle>
            <EmptyDescription $isDark={isDark}>{t.noPostsDesc}</EmptyDescription>
            {user && (
              <CreateFirstButton onClick={() => navigate('/create-post')}>
                {t.createFirst}
              </CreateFirstButton>
            )}
          </EmptyState>
        )}

        {/* New Posts Banner - Only visible to logged-in users */}
        {user && posts.length > 0 && (
          <NewPostsBanner 
            onRefresh={handleRefresh}
          />
        )}
      </FeedContainer>
    </FeedSection>
  );
};

// Styled Components
const FeedSection = styled.section<{ $isDark: boolean }>`
  width: 100%;
  background: ${p => p.$isDark
    ? 'linear-gradient(135deg, rgba(8, 12, 20, 0.9), rgba(12, 26, 42, 0.82))'
    : 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)'};
  padding: 60px 0;
  position: relative;
  border-top: 1px solid ${p => p.$isDark ? 'rgba(255,255,255,0.05)' : 'rgba(12,26,42,0.06)'};
  border-bottom: 1px solid ${p => p.$isDark ? 'rgba(255,255,255,0.05)' : 'rgba(12,26,42,0.06)'};
`;

const FeedContainer = styled.div`
  max-width: 680px;
  margin: 0 auto;
  padding: 0 20px;
  
  @media (max-width: 768px) {
    max-width: 100%;
    padding: 0 15px;
  }
`;

const FeedHeader = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const FilterBar = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 32px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ $active: boolean; $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border-radius: 24px;
  border: 2px solid ${p => p.$active ? '#FF7900' : (p.$isDark ? 'rgba(255,255,255,0.1)' : '#e9ecef')};
  background: ${p => p.$active ? '#FF7900' : (p.$isDark ? 'rgba(255,255,255,0.05)' : 'white')};
  color: ${p => p.$active ? '#0f172a' : (p.$isDark ? '#e2e8f0' : '#444')};
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  
  svg {
    flex-shrink: 0;
  }
  
  &:hover {
    background: ${p => p.$active ? '#E66D00' : (p.$isDark ? 'rgba(255, 121, 0, 0.12)' : 'rgba(255, 121, 0, 0.08)')};
    border-color: #FF7900;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${p => p.$isDark ? 'rgba(255, 121, 0, 0.25)' : 'rgba(255, 121, 0, 0.2)'};
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    padding: 8px 16px;
    font-size: 0.85rem;
    
    span {
      display: none;
    }
  }
`;

const FeedTitle = styled.h2<{ $isDark: boolean }>`
  font-size: 2rem;
  font-weight: 700;
  color: ${p => p.$isDark ? '#f8fbff' : '#212529'};
  margin-bottom: 12px;
  
  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;

const FeedSubtitle = styled.p<{ $isDark: boolean }>`
  font-size: 1rem;
  color: ${p => p.$isDark ? '#cbd5e1' : '#6c757d'};
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
`;

const CreatePostTrigger = styled.button<{ $isDark: boolean }>`
  width: 100%;
  background: ${p => p.$isDark ? 'rgba(255,255,255,0.04)' : 'white'};
  border: 1px solid ${p => p.$isDark ? 'rgba(255,255,255,0.08)' : '#e9ecef'};
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #FF8F10;
    box-shadow: 0 4px 12px ${p => p.$isDark ? 'rgba(255, 127, 0, 0.25)' : 'rgba(255, 127, 0, 0.1)'};
  }
`;

const UserAvatar = styled.div<{ $hasImage: boolean; $imageUrl?: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #FF8F10;
  flex-shrink: 0;
  
  ${p => p.$hasImage && p.$imageUrl ? `
    background: url(${p.$imageUrl}) center/cover no-repeat;
  ` : `
    background: linear-gradient(135deg, #FF8F10, #FF7900);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  `}
`;

const CreatePostPlaceholder = styled.span<{ $isDark: boolean }>`
  flex: 1;
  text-align: left;
  color: ${p => p.$isDark ? '#cbd5e1' : '#6c757d'};
  font-size: 1rem;
`;

const CreatePostActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: ${p => p.$isDark ? 'rgba(255,255,255,0.06)' : '#f8f9fa'};
  border-radius: 8px;
  color: ${p => p.$isDark ? '#e2e8f0' : '#495057'};
  font-size: 0.875rem;
  
  @media (max-width: 480px) {
    span { display: none; }
  }
`;

const LoginPrompt = styled.button<{ $isDark: boolean }>`
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #FF7900, #FF8F10);
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 24px;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const PostsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  padding: 40px;
  
  &::after {
    content: '';
    width: 40px;
    height: 40px;
    border: 4px solid #e9ecef;
    border-top-color: #FF7900;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const LoadingMore = styled.div<{ $isDark: boolean }>`
  text-align: center;
  padding: 20px;
  color: ${p => p.$isDark ? '#cbd5e1' : '#6c757d'};
  font-size: 0.938rem;
`;

const EndOfFeed = styled.div<{ $isDark: boolean }>`
  text-align: center;
  padding: 30px;
  color: ${p => p.$isDark ? '#cbd5e1' : '#6c757d'};
  font-size: 0.938rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
`;

const EmptyTitle = styled.h3<{ $isDark: boolean }>`
  font-size: 1.5rem;
  color: ${p => p.$isDark ? '#f8fbff' : '#212529'};
  margin-bottom: 12px;
`;

const EmptyDescription = styled.p<{ $isDark: boolean }>`
  font-size: 1rem;
  color: ${p => p.$isDark ? '#cbd5e1' : '#6c757d'};
  margin-bottom: 24px;
`;

const CreateFirstButton = styled.button`
  padding: 12px 24px;
  background: #FF7900;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background: #FF8F10;
    transform: translateY(-2px);
  }
`;

export default SmartFeedSection;

