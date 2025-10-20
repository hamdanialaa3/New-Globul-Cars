// src/pages/HomePage/CommunityFeedSection.tsx
// Community Feed Section for HomePage
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import React, { useState, useEffect, memo } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthProvider';
import { useLanguage } from '../../contexts/LanguageContext';
import { TrendingUp } from 'lucide-react';
import { postsFeedService } from '../../services/social/posts-feed.service';
import { Post } from '../../services/social/posts.service';
import PostCard from '../../components/Posts/PostCard';

// ==================== STYLED COMPONENTS ====================

const Section = styled.section`
  background: linear-gradient(135deg, #fafbfc 0%, #f5f7fa 100%);
  padding: 4rem 0;
  position: relative;
`;

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  
  h2 {
    font-size: 2rem;
    font-weight: 800;
    color: #212529;
    margin-bottom: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }
  
  p {
    font-size: 1.1rem;
    color: #6c757d;
    max-width: 600px;
    margin: 0 auto;
  }
`;

const FeedContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const LoadMoreButton = styled.button`
  width: 100%;
  padding: 16px;
  border: 2px dashed #dee2e6;
  background: white;
  border-radius: 12px;
  color: #6c757d;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #FF8F10;
    color: #FF7900;
    background: rgba(255, 247, 237, 0.5);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  
  h3 {
    font-size: 1.3rem;
    color: #495057;
    margin: 0 0 12px 0;
  }
  
  p {
    font-size: 1rem;
    color: #6c757d;
  }
`;

// ==================== COMPONENT ====================

const CommunityFeedSection: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadPosts();
  }, [user]);
  
  const loadPosts = async () => {
    try {
      setLoading(true);
      
      let feedPosts: Post[];
      if (user) {
        feedPosts = await postsFeedService.getFeedPosts(user.uid, 10);
      } else {
        feedPosts = await postsFeedService.getPublicFeed(10);
      }
      
      setPosts(feedPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleLike = (postId: string) => {
    console.log('Post liked:', postId);
  };
  
  const handleComment = (postId: string) => {
    console.log('Navigate to post:', postId);
  };
  
  const t = (key: string) => {
    const translations: Record<string, any> = {
      bg: {
        title: 'Общност',
        subtitle: 'Последни истории, съвети и прозрения от автомобилната общност',
        loading: 'Зареждане на публикации...',
        loadMore: 'Зареди още',
        noPosts: 'Все още няма публикации',
        noPostsDesc: 'Бъдете първите, които споделят нещо!'
      },
      en: {
        title: 'Community Feed',
        subtitle: 'Latest stories, tips, and insights from the car community',
        loading: 'Loading posts...',
        loadMore: 'Load More',
        noPosts: 'No posts yet',
        noPostsDesc: 'Be the first to share something!'
      }
    };
    return translations[language]?.[key] || key;
  };
  
  if (loading) {
    return (
      <Section>
        <Container>
          <SectionHeader>
            <h2>
              <TrendingUp size={32} />
              {t('loading')}
            </h2>
          </SectionHeader>
        </Container>
      </Section>
    );
  }
  
  if (posts.length === 0) {
    return (
      <Section>
        <Container>
          <SectionHeader>
            <h2>
              <TrendingUp size={32} />
              {t('title')}
            </h2>
            <p>{t('subtitle')}</p>
          </SectionHeader>
          <EmptyState>
            <h3>{t('noPosts')}</h3>
            <p>{t('noPostsDesc')}</p>
          </EmptyState>
        </Container>
      </Section>
    );
  }
  
  return (
    <Section>
      <Container>
        <SectionHeader>
          <h2>
            <TrendingUp size={32} />
            {t('title')}
          </h2>
          <p>{t('subtitle')}</p>
        </SectionHeader>
        
        <FeedContainer>
          {posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onComment={handleComment}
            />
          ))}
          
          <LoadMoreButton onClick={loadPosts}>
            {t('loadMore')}
          </LoadMoreButton>
        </FeedContainer>
      </Container>
    </Section>
  );
};

export default memo(CommunityFeedSection);

