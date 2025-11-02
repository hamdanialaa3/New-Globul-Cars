// SocialMediaPage.tsx - صفحة السوشيال ميديا
// صفحة متكاملة تحتوي على: الهيدر + آلية إضافة منشور + كل المنشورات

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';
import { useLanguage } from '../contexts/LanguageContext';
import { collection, query, getDocs, orderBy, where, limit } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import PostCard from '../components/Posts/PostCard';
import CreatePostForm from '../components/Posts/CreatePostForm';
import { Post } from '../services/social/posts.service';
import { MessageSquare, TrendingUp, Clock, Heart, MessageCircle, Plus } from 'lucide-react';

type FilterType = 'all' | 'trending' | 'recent';

const SocialMediaPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  useEffect(() => {
    loadPosts();
  }, [activeFilter]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      
      let q = query(
        collection(db, 'posts'), 
        where('status', '==', 'published'),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const snapshot = await getDocs(q);
      let postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];

      // تطبيق الفلاتر
      if (activeFilter === 'trending') {
        const now = Date.now();
        const threeDaysAgo = now - 3 * 24 * 60 * 60 * 1000;
        
        postsData = postsData
          .filter(post => {
            const postTime = post.createdAt?.toMillis() || 0;
            return postTime > threeDaysAgo;
          })
          .sort((a, b) => {
            const aScore = (a.engagement?.likes || 0) * 2 + (a.engagement?.comments || 0) * 3;
            const bScore = (b.engagement?.likes || 0) * 2 + (b.engagement?.comments || 0) * 3;
            return bScore - aScore;
          });
      } else if (activeFilter === 'recent') {
        postsData = postsData.sort((a, b) => {
          const aTime = a.createdAt?.toMillis() || 0;
          const bTime = b.createdAt?.toMillis() || 0;
          return bTime - aTime;
        });
      }

      setPosts(postsData);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = (postId: string) => {
    setShowCreateForm(false);
    loadPosts();
    navigate(`/posts/${postId}`);
  };

  return (
    <PageWrapper>
      {/* Header الهيدر */}
      <PageHeader>
        <HeaderContent>
          <IconWrapper>
            <MessageSquare size={32} />
          </IconWrapper>
          <HeaderText>
            <h1>{t('socialMedia.title')}</h1>
            <p>{t('socialMedia.subtitle')}</p>
          </HeaderText>
        </HeaderContent>

        {/* زر إنشاء منشور */}
        {user && (
          <CreatePostButton onClick={() => setShowCreateForm(true)}>
            <Plus size={20} />
            {t('socialMedia.createPost')}
          </CreatePostButton>
        )}
      </PageHeader>

      {/* Modal للنموذج آلية إضافة منشور */}
      {showCreateForm && (
        <ModalOverlay onClick={() => setShowCreateForm(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <CreatePostForm
              onClose={() => setShowCreateForm(false)}
              onPostCreated={handlePostCreated}
            />
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Main Content */}
      <MainContent>
        {/* Sidebar إحصائيات */}
        <Sidebar>
          <StatsCard>
            <StatItem>
              <StatIcon>
                <MessageSquare size={24} />
              </StatIcon>
              <StatInfo>
                <StatValue>{posts.length}</StatValue>
                <StatLabel>{t('socialMedia.stats.totalPosts')}</StatLabel>
              </StatInfo>
            </StatItem>
          </StatsCard>

          {/* Filters الفلاتر */}
          <FiltersCard>
            <FilterButton
              $active={activeFilter === 'all'}
              onClick={() => setActiveFilter('all')}
            >
              <MessageSquare size={18} />
              {t('socialMedia.filters.all')}
            </FilterButton>
            <FilterButton
              $active={activeFilter === 'trending'}
              onClick={() => setActiveFilter('trending')}
            >
              <TrendingUp size={18} />
              {t('socialMedia.filters.trending')}
            </FilterButton>
            <FilterButton
              $active={activeFilter === 'recent'}
              onClick={() => setActiveFilter('recent')}
            >
              <Clock size={18} />
              {t('socialMedia.filters.recent')}
            </FilterButton>
          </FiltersCard>
        </Sidebar>

        {/* Posts Feed كل المنشورات */}
        <PostsFeed>
          {loading ? (
            <LoadingState>
              <LoadingSpinner />
              <p>{t('socialMedia.loading')}</p>
            </LoadingState>
          ) : posts.length === 0 ? (
            <EmptyState>
              <MessageSquare size={64} color="#ddd" />
              <h3>{t('socialMedia.empty.title')}</h3>
              <p>{t('socialMedia.empty.subtitle')}</p>
              {user && (
                <CreatePostButton onClick={() => setShowCreateForm(true)}>
                  <Plus size={20} />
                  {t('socialMedia.createPost')}
                </CreatePostButton>
              )}
            </EmptyState>
          ) : (
            <PostsList>
              {posts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </PostsList>
          )}
        </PostsFeed>
      </MainContent>
    </PageWrapper>
  );
};

export default SocialMediaPage;

// ==================== STYLED COMPONENTS ====================

const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
  padding: 24px;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const PageHeader = styled.header`
  max-width: 1200px;
  margin: 0 auto 32px;
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    padding: 24px;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const IconWrapper = styled.div`
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #FF8F10 0%, #FF6B35 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;

  @media (max-width: 768px) {
    width: 56px;
    height: 56px;
  }
`;

const HeaderText = styled.div`
  h1 {
    margin: 0 0 8px 0;
    font-size: 2rem;
    font-weight: 700;
    color: #1a1a1a;
    background: linear-gradient(135deg, #FF8F10 0%, #FF6B35 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;

    @media (max-width: 768px) {
      font-size: 1.5rem;
    }
  }

  p {
    margin: 0;
    font-size: 1rem;
    color: #666;

    @media (max-width: 768px) {
      font-size: 0.9rem;
    }
  }
`;

const CreatePostButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  background: linear-gradient(135deg, #FF8F10 0%, #FF6B35 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(255, 143, 16, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(255, 143, 16, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    padding: 12px 24px;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  max-width: 650px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
`;

const MainContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (max-width: 1024px) {
    display: none;
  }
`;

const StatsCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #FF8F10 0%, #FF6B35 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const StatInfo = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a1a1a;
`;

const StatLabel = styled.div`
  font-size: 0.85rem;
  color: #666;
  margin-top: 4px;
`;

const FiltersCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FilterButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: ${p => p.$active ? 'linear-gradient(135deg, #FF8F10 0%, #FF6B35 100%)' : 'transparent'};
  color: ${p => p.$active ? 'white' : '#666'};
  border: 1.5px solid ${p => p.$active ? 'transparent' : '#e0e0e0'};
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: ${p => p.$active ? '600' : '500'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${p => p.$active 
      ? 'linear-gradient(135deg, #FF8F10 0%, #FF6B35 100%)' 
      : 'rgba(255, 143, 16, 0.1)'};
    border-color: ${p => p.$active ? 'transparent' : '#FF8F10'};
  }

  svg {
    flex-shrink: 0;
  }
`;

const PostsFeed = styled.main`
  min-height: 600px;
`;

const PostsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;

  p {
    color: #666;
    font-size: 1rem;
  }
`;

const LoadingSpinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #FF8F10;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  h3 {
    margin: 24px 0 8px 0;
    font-size: 1.5rem;
    color: #333;
  }

  p {
    margin: 0 0 24px 0;
    color: #666;
    font-size: 1rem;
  }
`;
