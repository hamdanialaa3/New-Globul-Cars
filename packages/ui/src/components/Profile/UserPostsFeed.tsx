// User Posts Feed - Display user's posts on profile
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '@globul-cars/core/contextsAuthProvider';
import { useLanguage } from '@globul-cars/core/contextsLanguageContext';
import { postsService, Post } from '@globul-cars/services/social/posts.service';
import PostCard from '../Posts/PostCard';
import { FileText, Loader } from 'lucide-react';

interface UserPostsFeedProps {
  userId?: string;
  limit?: number;
  showTitle?: boolean;
}

const UserPostsFeed: React.FC<UserPostsFeedProps> = ({ 
  userId, 
  limit = 10,
  showTitle = true
}) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  const targetUserId = userId || user?.uid;

  useEffect(() => {
    loadUserPosts();
  }, [targetUserId]);

  const loadUserPosts = async () => {
    if (!targetUserId) return;
    
    setLoading(true);
    try {
      const userPosts = await postsService.getUserPosts(targetUserId, limit);
      setPosts(userPosts);
    } catch (error) {
      console.error('Error loading user posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const t = {
    bg: {
      title: 'Моите публикации',
      noPosts: 'Все още няма публикации',
      noPostsDesc: 'Споделете нещо интересно с общността!',
      loading: 'Зареждане на публикации...'
    },
    en: {
      title: 'My Posts',
      noPosts: 'No posts yet',
      noPostsDesc: 'Share something interesting with the community!',
      loading: 'Loading posts...'
    }
  }[language];

  if (loading) {
    return (
      <Container>
        {showTitle && (
          <SectionHeader>
            <SectionTitle>
              <FileText size={20} />
              {t.title}
            </SectionTitle>
          </SectionHeader>
        )}
        <LoadingContainer>
          <Loader size={40} className="spinner" />
          <LoadingText>{t.loading}</LoadingText>
        </LoadingContainer>
      </Container>
    );
  }

  if (posts.length === 0) {
    return (
      <Container>
        {showTitle && (
          <SectionHeader>
            <SectionTitle>
              <FileText size={20} />
              {t.title}
            </SectionTitle>
          </SectionHeader>
        )}
        <EmptyState>
          <FileText size={60} color="#dee2e6" />
          <EmptyTitle>{t.noPosts}</EmptyTitle>
          <EmptyDescription>{t.noPostsDesc}</EmptyDescription>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      {showTitle && (
        <SectionHeader>
          <SectionTitle>
            <FileText size={20} />
            {t.title}
            <PostCount>{posts.length}</PostCount>
          </SectionTitle>
        </SectionHeader>
      )}
      
      <PostsGrid>
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </PostsGrid>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  width: 100%;
`;

const SectionHeader = styled.div`
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f2f5;
`;

const SectionTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.25rem;
  font-weight: 700;
  color: #212529;
  margin: 0;
  
  svg {
    color: #FF7900;
    flex-shrink: 0;
  }
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const PostCount = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 8px;
  background: linear-gradient(135deg, #FF7900, #FF8F10);
  color: white;
  border-radius: 14px;
  font-size: 0.875rem;
  font-weight: 700;
  margin-left: 8px;
`;

const PostsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  
  .spinner {
    color: #FF7900;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  margin-top: 16px;
  color: #6c757d;
  font-size: 0.95rem;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
`;

const EmptyTitle = styled.h4`
  font-size: 1.25rem;
  font-weight: 600;
  color: #495057;
  margin: 20px 0 8px 0;
`;

const EmptyDescription = styled.p`
  font-size: 0.95rem;
  color: #6c757d;
  max-width: 400px;
  line-height: 1.6;
  margin: 0;
`;

export default UserPostsFeed;

