// AllPostsPage.tsx - All Posts with Create Post & Simple Filters
// ⚡ Compact & Professional Design

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';
import { useLanguage } from '../contexts/LanguageContext';
import { collection, query, getDocs, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import PostCard from '../components/Posts/PostCard';
import CreatePostForm from '../components/Posts/CreatePostForm';
import { Post } from '../services/social/posts.service';
import { MessageSquare, Search, X, Plus } from 'lucide-react';

type PostFilter = 'all' | 'smart' | 'newest' | 'most_liked' | 'most_comments' | 'trending';

const AllPostsPage: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<PostFilter>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      let q = query(collection(db, 'posts'), where('status', '==', 'published'), orderBy('createdAt', 'desc'));
      
      const snapshot = await getDocs(q);
      let postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];

      // Apply client-side filters
      if (filterType === 'newest') {
        postsData = postsData.sort((a, b) => {
          const aTime = a.createdAt?.toMillis() || 0;
          const bTime = b.createdAt?.toMillis() || 0;
          return bTime - aTime;
        });
      } else if (filterType === 'most_liked') {
        postsData = postsData.sort((a, b) => (b.engagement?.likes || 0) - (a.engagement?.likes || 0));
      } else if (filterType === 'most_comments') {
        postsData = postsData.sort((a, b) => (b.engagement?.comments || 0) - (a.engagement?.comments || 0));
      } else if (filterType === 'trending') {
        // Trending = high engagement in last 24h
        const now = Date.now();
        const oneDayAgo = now - 24 * 60 * 60 * 1000;
        postsData = postsData.filter(post => {
          const postTime = post.createdAt?.toMillis() || 0;
          return postTime > oneDayAgo;
        }).sort((a, b) => {
          const aScore = (a.engagement?.likes || 0) + (a.engagement?.comments || 0) * 2;
          const bScore = (b.engagement?.likes || 0) + (b.engagement?.comments || 0) * 2;
          return bScore - aScore;
        });
      }

      setPosts(postsData);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      post.content?.text?.toLowerCase().includes(query) ||
      post.authorInfo?.displayName?.toLowerCase().includes(query)
    );
  });

  const handlePostCreated = (postId: string) => {
    setShowCreateForm(false);
    loadPosts();
    navigate(`/posts/${postId}`);
  };

  const t = {
    bg: {
      title: 'Всички публикации',
      subtitle: 'Преглед на всички публикации от потребителите',
      createPost: 'Създай публикация',
      search: 'Търсене по текст или автор...',
      all: 'Всички',
      smart: 'Умни',
      newest: 'Най-нови',
      mostLiked: 'Най-харесвани',
      mostComments: 'Най-коментирани',
      trending: 'Трендови',
      noResults: 'Няма намерени публикации',
      total: 'Общо',
      posts: 'публикации'
    },
    en: {
      title: 'All Posts',
      subtitle: 'Browse all user posts',
      createPost: 'Create Post',
      search: 'Search by text or author...',
      all: 'All',
      smart: 'Smart',
      newest: 'Newest',
      mostLiked: 'Most Liked',
      mostComments: 'Most Comments',
      trending: 'Trending',
      noResults: 'No posts found',
      total: 'Total',
      posts: 'posts'
    }
  };

  const text = t[language as 'bg' | 'en'];

  return (
    <Container>
      <Header>
        <MessageSquare size={24} />
        <div>
          <h1>{text.title}</h1>
          <p>{text.subtitle}</p>
        </div>
      </Header>

      {/* Create Post Button */}
      {user && (
        <CreateButton onClick={() => setShowCreateForm(true)}>
          <Plus size={18} />
          {text.createPost}
        </CreateButton>
      )}

      {/* Create Post Form Modal */}
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

      {/* Simple Filter Bar */}
      <FilterBar>
        <SearchWrapper>
          <Search size={18} />
          <SearchInput
            type="text"
            placeholder={text.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <ClearButton onClick={() => setSearchQuery('')}>
              <X size={16} />
            </ClearButton>
          )}
        </SearchWrapper>

        <FilterButtons>
          <FilterButton
            $active={filterType === 'all'}
            onClick={() => setFilterType('all')}
          >
            {text.all}
          </FilterButton>
          <FilterButton
            $active={filterType === 'newest'}
            onClick={() => setFilterType('newest')}
          >
            {text.newest}
          </FilterButton>
          <FilterButton
            $active={filterType === 'most_liked'}
            onClick={() => setFilterType('most_liked')}
          >
            {text.mostLiked}
          </FilterButton>
          <FilterButton
            $active={filterType === 'most_comments'}
            onClick={() => setFilterType('most_comments')}
          >
            {text.mostComments}
          </FilterButton>
          <FilterButton
            $active={filterType === 'trending'}
            onClick={() => setFilterType('trending')}
          >
            {text.trending}
          </FilterButton>
        </FilterButtons>
      </FilterBar>

      {/* Results Summary */}
      <ResultsSummary>
        {text.total}: <strong>{filteredPosts.length}</strong> {text.posts}
      </ResultsSummary>

      {/* Posts List */}
      {loading ? (
        <LoadingState>
          <div>Loading...</div>
        </LoadingState>
      ) : filteredPosts.length === 0 ? (
        <EmptyState>
          <MessageSquare size={48} color="#ccc" />
          <h3>{text.noResults}</h3>
        </EmptyState>
      ) : (
        <PostsList>
          {filteredPosts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </PostsList>
      )}
    </Container>
  );
};

export default AllPostsPage;

// ==================== STYLED COMPONENTS ====================

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;

  svg {
    color: #FF8F10;
  }

  h1 {
    margin: 0;
    font-size: 1.75rem;
    font-weight: 700;
    color: #333;
  }

  p {
    margin: 4px 0 0 0;
    font-size: 0.95rem;
    color: #666;
  }
`;

const CreateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #FF8F10, #FF6B35);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 20px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 143, 16, 0.3);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
`;

const FilterBar = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 10px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const SearchWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;

  svg {
    color: #999;
    flex-shrink: 0;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.9rem;
  color: #333;

  &::placeholder {
    color: #999;
  }
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  padding: 4px;
  color: #999;
  cursor: pointer;
  display: flex;
  align-items: center;
  
  &:hover {
    color: #333;
  }
`;

const FilterButtons = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ $active: boolean }>`
  padding: 10px 18px;
  border: 1.5px solid ${p => p.$active ? '#FF8F10' : '#e0e0e0'};
  background: ${p => p.$active ? '#FF8F10' : 'white'};
  color: ${p => p.$active ? 'white' : '#666'};
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: ${p => p.$active ? '600' : '500'};
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;

  &:hover {
    border-color: #FF8F10;
    background: ${p => p.$active ? '#FF8F10' : 'rgba(255, 143, 16, 0.1)'};
  }
`;

const ResultsSummary = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 16px;

  strong {
    color: #333;
    font-weight: 600;
  }
`;

const PostsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  color: #999;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;

  h3 {
    margin: 16px 0 0 0;
    font-size: 1.2rem;
    color: #999;
  }
`;

