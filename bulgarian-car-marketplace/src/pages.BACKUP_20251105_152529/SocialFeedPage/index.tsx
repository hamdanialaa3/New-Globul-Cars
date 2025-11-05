import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { useAuth } from '../../contexts/AuthProvider';
import { useLanguage } from '../../contexts/LanguageContext';
import { collection, query, where, orderBy, limit as firestoreLimit, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';

interface Post {
  id: string;
  authorId: string;
  authorInfo: {
    displayName: string;
    profileImage?: string;
    profileType: string;
    isVerified: boolean;
  };
  type: string;
  content: {
    text: string;
    media?: {
      type: string;
      urls: string[];
    };
  };
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  createdAt: any;
}

const SocialFeedPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [showSocialPosts, setShowSocialPosts] = useState(true);
  const [mainHeaderVisible, setMainHeaderVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState('smart');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const filters = ['smart', 'newest', 'mostLiked', 'mostComments', 'trending'];

  // Auto-hide header-top on mount (keep header-nav visible)
  useEffect(() => {
    const headerTop = document.querySelector('.header-top') as HTMLElement;
    const mainContent = document.querySelector('[data-main-content]') as HTMLElement;
    const leftSidebar = document.querySelector('[data-left-sidebar]') as HTMLElement;
    const rightSidebar = document.querySelector('[data-right-sidebar]') as HTMLElement;
    
    if (headerTop) {
      headerTop.style.transform = 'translateY(-100%)';
      headerTop.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    }
    
    // Adjust content position when header-top is hidden
    if (mainContent) {
      mainContent.style.paddingTop = '20px';
      mainContent.style.transition = 'padding-top 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    }
    if (leftSidebar) {
      leftSidebar.style.paddingTop = '8px';
      leftSidebar.style.transition = 'padding-top 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    }
    if (rightSidebar) {
      rightSidebar.style.paddingTop = '8px';
      rightSidebar.style.transition = 'padding-top 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    }

    return () => {
      if (headerTop) {
        headerTop.style.transform = 'translateY(0)';
      }
      if (mainContent) {
        mainContent.style.paddingTop = '80px';
      }
      if (leftSidebar) {
        leftSidebar.style.paddingTop = '60px';
      }
      if (rightSidebar) {
        rightSidebar.style.paddingTop = '60px';
      }
    };
  }, []);

  // Toggle header-top visibility manually (keep header-nav visible)
  useEffect(() => {
    const headerTop = document.querySelector('.header-top') as HTMLElement;
    const mainContent = document.querySelector('[data-main-content]') as HTMLElement;
    const leftSidebar = document.querySelector('[data-left-sidebar]') as HTMLElement;
    const rightSidebar = document.querySelector('[data-right-sidebar]') as HTMLElement;
    
    if (headerTop) {
      if (mainHeaderVisible) {
        headerTop.style.transform = 'translateY(0)';
        headerTop.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        
        // Move content down when header-top is visible
        if (mainContent) {
          mainContent.style.paddingTop = '80px';
        }
        if (leftSidebar) {
          leftSidebar.style.paddingTop = '60px';
        }
        if (rightSidebar) {
          rightSidebar.style.paddingTop = '60px';
        }
      } else {
        headerTop.style.transform = 'translateY(-100%)';
        headerTop.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        
        // Move content up when header-top is hidden
        if (mainContent) {
          mainContent.style.paddingTop = '20px';
        }
        if (leftSidebar) {
          leftSidebar.style.paddingTop = '8px';
        }
        if (rightSidebar) {
          rightSidebar.style.paddingTop = '8px';
        }
      }
    }
  }, [mainHeaderVisible]);

  useEffect(() => {
    setLoading(true);
    
    let postsQuery;
    
    switch (activeFilter) {
      case 'newest':
        postsQuery = query(
          collection(db, 'posts'),
          where('status', '==', 'published'),
          where('visibility', '==', 'public'),
          orderBy('createdAt', 'desc'),
          firestoreLimit(10)
        );
        break;
      case 'mostLiked':
        postsQuery = query(
          collection(db, 'posts'),
          where('status', '==', 'published'),
          where('visibility', '==', 'public'),
          orderBy('engagement.likes', 'desc'),
          firestoreLimit(10)
        );
        break;
      case 'mostComments':
        postsQuery = query(
          collection(db, 'posts'),
          where('status', '==', 'published'),
          where('visibility', '==', 'public'),
          orderBy('engagement.comments', 'desc'),
          firestoreLimit(10)
        );
        break;
      default:
        postsQuery = query(
          collection(db, 'posts'),
          where('status', '==', 'published'),
          where('visibility', '==', 'public'),
          orderBy('createdAt', 'desc'),
          firestoreLimit(10)
        );
    }

    const unsubscribe = onSnapshot(
      postsQuery,
      (snapshot) => {
        const postsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Post[];
        setPosts(postsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading posts:', error);
        setPosts([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [activeFilter]);

  const handleCreatePost = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/create-post');
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <PageContainer>
      <LeftSidebarContainer data-left-sidebar>
        <LeftSidebar />
      </LeftSidebarContainer>

      <MainContent data-main-content>
        <MainHeaderToggleButton 
          onClick={() => setMainHeaderVisible(!mainHeaderVisible)}
          $visible={mainHeaderVisible}
          title={mainHeaderVisible ? 'Hide main header' : 'Show main header'}
        >
          <ArrowIcon $expanded={!mainHeaderVisible}>▼</ArrowIcon>
        </MainHeaderToggleButton>

        <PageHeader>
          <TitleSection>
            <MainTitle>{t('social.title')}</MainTitle>
            <Subtitle>{t('social.subtitle')}</Subtitle>
          </TitleSection>
          <ToggleButton onClick={() => setShowSocialPosts(!showSocialPosts)}>
            {showSocialPosts ? t('social.hideButton') : t('social.showButton')}
          </ToggleButton>
        </PageHeader>

        {showSocialPosts && (
          <ContentArea>
            <FeedHeader>
              <FeedTitle>{t('social.communityFeed')}</FeedTitle>
              <FeedSubtitle>{t('social.feedSubtitle')}</FeedSubtitle>
            </FeedHeader>

            <FilterBar>
              {filters.map((filter) => (
                <FilterButton
                  key={filter}
                  active={activeFilter === filter}
                  onClick={() => setActiveFilter(filter)}
                >
                  {t(`social.filters.${filter}`)}
                </FilterButton>
              ))}
            </FilterBar>

            <CreatePostBox onClick={handleCreatePost}>
              <Avatar src={user?.photoURL || 'https://i.pravatar.cc/150?img=1'} alt="User" />
              <PostInput 
                placeholder={t('social.createPost.placeholder').replace('{name}', user?.displayName || 'Guest')} 
                readOnly 
              />
            </CreatePostBox>

            <ActionButtons>
              <ActionBtn onClick={handleCreatePost}>
                <PhotoIcon />
                <span>{t('social.createPost.photo')}</span>
              </ActionBtn>
              <ActionBtn onClick={handleCreatePost}>
                <VideoIcon />
                <span>{t('social.createPost.video')}</span>
              </ActionBtn>
              <ActionBtn onClick={handleCreatePost}>
                <CarIcon />
                <span>{t('social.createPost.car')}</span>
              </ActionBtn>
            </ActionButtons>

            {loading ? (
              <LoadingState>
                <LoadingSpinner />
                <LoadingText>{t('social.loading')}</LoadingText>
              </LoadingState>
            ) : posts.length > 0 ? (
              <PostsList>
                {posts.map((post) => (
                  <PostCard key={post.id}>
                    <PostHeader>
                      <AuthorInfo>
                        <AuthorAvatar src={post.authorInfo.profileImage || `https://i.pravatar.cc/150?u=${post.authorId}`} />
                        <AuthorDetails>
                          <AuthorName>
                            {post.authorInfo.displayName}
                            {post.authorInfo.isVerified && <VerifiedBadge>✓</VerifiedBadge>}
                          </AuthorName>
                          <PostTime>{formatTimestamp(post.createdAt)}</PostTime>
                        </AuthorDetails>
                      </AuthorInfo>
                      <MoreButton>⋯</MoreButton>
                    </PostHeader>

                    <PostContent>{post.content.text}</PostContent>

                    {post.content.media && post.content.media.urls && post.content.media.urls.length > 0 && (
                      <PostImages>
                        {post.content.media.urls.map((url, idx) => (
                          <PostImage key={idx} src={url} alt="" />
                        ))}
                      </PostImages>
                    )}

                    <PostStats>
                      <StatsLeft>
                        {post.engagement.likes > 0 && <span>{post.engagement.likes} {t('social.post.likes')}</span>}
                      </StatsLeft>
                      <StatsRight>
                        {post.engagement.comments > 0 && <span>{post.engagement.comments} {t('social.post.comments')}</span>}
                        {post.engagement.shares > 0 && <span>{post.engagement.shares} {t('social.post.shares')}</span>}
                      </StatsRight>
                    </PostStats>

                    <PostDivider />

                    <PostActions>
                      <PostAction>👍 {t('social.post.like')}</PostAction>
                      <PostAction>💬 {t('social.post.comment')}</PostAction>
                      <PostAction>↗️ {t('social.post.share')}</PostAction>
                    </PostActions>
                  </PostCard>
                ))}
              </PostsList>
            ) : (
              <EmptyState>
                <EmptyIcon>📭</EmptyIcon>
                <EmptyTitle>{t('social.emptyState.title')}</EmptyTitle>
                <EmptyText>{t('social.emptyState.description')}</EmptyText>
                <CreateButton onClick={handleCreatePost}>{t('social.emptyState.createButton')}</CreateButton>
              </EmptyState>
            )}

            <FeedFooter>
              <FooterTitle>{t('social.footer.title')}</FooterTitle>
              <FooterText>{t('social.footer.description')}</FooterText>
            </FeedFooter>
          </ContentArea>
        )}
      </MainContent>

      <RightSidebarContainer data-right-sidebar>
        <RightSidebar />
      </RightSidebarContainer>
    </PageContainer>
  );
};

const PageContainer = styled.div`
  display: grid;
  grid-template-columns: 240px 1fr 280px;
  gap: 0;
  max-width: 1920px;
  margin: 0 auto;
  background: #f0f2f5;
  min-height: 100vh;
  padding-top: 0;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const LeftSidebarContainer = styled.aside`
  position: sticky;
  top: 80px;
  height: calc(100vh - 80px);
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px 0;
  padding-top: 8px;
  transition: padding-top 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #bcc0c4;
    border-radius: 3px;
  }

  @media (max-width: 1200px) {
    display: none;
  }
`;

const MainContent = styled.main`
  max-width: 720px;
  margin: 0 auto;
  width: 100%;
  padding: 20px 16px 20px 16px;
  position: relative;
  transition: padding-top 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: 768px) {
    padding: 20px 8px 10px 8px;
  }
`;

const MainHeaderToggleButton = styled.button<{ $visible: boolean }>`
  position: fixed;
  top: 20px;
  left: calc(50% + 200px);
  transform: translateX(-50%);
  width: 35px;
  height: 35px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 1000;
  
  /* LED Glow Effect - Optimized (single layer) */
  box-shadow: 0 0 15px rgba(242, 206, 24, 0.4);
  
  /* Animation only on hover for better performance */
  @keyframes pulseGlow {
    0%, 100% {
      box-shadow: 0 0 15px rgba(242, 206, 24, 0.4);
    }
    50% {
      box-shadow: 0 0 25px rgba(242, 206, 24, 0.6);
    }
  }

  /* Inner Glow */
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 70%;
    height: 70%;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%);
    transform: translate(-50%, -50%);
    opacity: 1;
    transition: opacity 0.3s;
  }

  /* Outer Ring - Disabled for performance */
  &::after {
    content: '';
    position: absolute;
    top: -4px;
    left: -4px;
    right: -4px;
    bottom: -4px;
    border-radius: 50%;
    background: transparent;
    z-index: -1;
  }

  &:hover {
    background: rgba(162, 242, 24, 0.25);
    backdrop-filter: blur(15px);
    transform: translateX(-50%) scale(1.15) translateY(-4px);
    animation: pulseGlow 0.8s ease-in-out;
  }

  &:active {
    transform: translateX(-50%) scale(0.95) translateY(0);
    transition: all 0.1s;
  }

  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
    top: 15px;
    left: calc(50% + 100px);
  }
`;

const ArrowIcon = styled.span<{ $expanded: boolean }>`
  font-size: 16px;
  font-weight: bold;
  color: white;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform: ${props => props.$expanded ? 'rotate(0deg) scale(1)' : 'rotate(180deg) scale(1.1)'};
  display: inline-block;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
  z-index: 1;
  position: relative;
  text-shadow: 
    0 0 8px rgba(255,255,255,0.9),
    0 0 15px rgba(133, 242, 24, 0.8),
    0 0 22px rgba(242, 242, 24, 0.6);
`;

const RightSidebarContainer = styled.aside`
  position: sticky;
  top: 80px;
  height: calc(100vh - 80px);
  overflow-y: auto;
  overflow-x: hidden;
  padding-top: 8px;
  transition: padding-top 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #bcc0c4;
    border-radius: 3px;
  }

  @media (max-width: 1200px) {
    display: none;
  }
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
`;

const TitleSection = styled.div``;

const MainTitle = styled.h1`
  font-size: 20px;
  font-weight: 700;
  color: #050505;
  margin: 0 0 4px 0;
`;

const Subtitle = styled.p`
  font-size: 13px;
  color: #65676b;
  margin: 0;
`;

const ToggleButton = styled.button`
  padding: 6px 12px;
  background: transparent;
  border: 1px solid #e4e6eb;
  border-radius: 6px;
  color: #65676b;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f0f2f5;
  }
`;

const ContentArea = styled.div`
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const FeedHeader = styled.div`
  margin-bottom: 12px;
`;

const FeedTitle = styled.h2`
  font-size: 17px;
  font-weight: 700;
  color: #050505;
  margin: 0 0 4px 0;
`;

const FeedSubtitle = styled.p`
  font-size: 13px;
  color: #65676b;
  margin: 0;
`;

const FilterBar = styled.div`
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e4e6eb;
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ active?: boolean }>`
  padding: 6px 12px;
  background: ${props => props.active ? '#e7f3ff' : 'transparent'};
  color: ${props => props.active ? '#1877f2' : '#65676b'};
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.active ? '#e7f3ff' : '#f0f2f5'};
  }
`;

const CreatePostBox = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  cursor: pointer;
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
`;

const PostInput = styled.input`
  flex: 1;
  background: #f0f2f5;
  border: none;
  border-radius: 24px;
  padding: 12px 16px;
  font-size: 15px;
  color: #65676b;
  cursor: pointer;

  &:hover {
    background: #e4e6eb;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e4e6eb;
  margin-bottom: 20px;

  @media (max-width: 640px) {
    justify-content: space-around;
  }
`;

const ActionBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 500;
  color: #65676b;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
  justify-content: center;

  &:hover {
    background: #f0f2f5;
  }

  span {
    @media (max-width: 480px) {
      display: none;
    }
  }
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 16px;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #e4e6eb;
  border-top-color:rgb(155, 242, 24);
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  font-size: 14px;
  color: #65676b;
`;

const PostsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const PostCard = styled.div`
  background: white;
  border: 1px solid #e4e6eb;
  border-radius: 8px;
  padding: 16px;
`;

const PostHeader = styled.div`
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

const AuthorName = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #050505;
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

const PostTime = styled.div`
  font-size: 13px;
  color: #65676b;
`;

const MoreButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
  color: #65676b;

  &:hover {
    background: #f0f2f5;
  }
`;

const PostContent = styled.p`
  font-size: 15px;
  line-height: 1.5;
  color: #050505;
  margin: 0 0 12px 0;
  white-space: pre-wrap;
`;

const PostImages = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 4px;
  margin-bottom: 12px;
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

const PostStats = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 13px;
  color: #65676b;
`;

const StatsLeft = styled.div`
  display: flex;
  gap: 8px;
`;

const StatsRight = styled.div`
  display: flex;
  gap: 12px;
`;

const PostDivider = styled.div`
  height: 1px;
  background: #e4e6eb;
  margin: 8px 0;
`;

const PostActions = styled.div`
  display: flex;
  justify-content: space-around;
  gap: 8px;
`;

const PostAction = styled.button`
  flex: 1;
  padding: 8px;
  background: transparent;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 600;
  color: #65676b;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #f0f2f5;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 12px;
`;

const EmptyTitle = styled.h3`
  font-size: 17px;
  font-weight: 600;
  color: #050505;
  margin: 0 0 6px 0;
`;

const EmptyText = styled.p`
  font-size: 14px;
  color: #65676b;
  margin: 0 0 16px 0;
`;

const CreateButton = styled.button`
  padding: 10px 24px;
  background:rgb(97, 242, 24);
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background:rgb(125, 229, 22);
  }
`;

const FeedFooter = styled.div`
  text-align: center;
  padding-top: 20px;
  border-top: 1px solidrgb(234, 235, 228);
  margin-top: 20px;
`;

const FooterTitle = styled.h3`
  font-size: 15px;
  font-weight: 600;
  color: #050505;
  margin: 0 0 4px 0;
`;

const FooterText = styled.p`
  font-size: 12px;
  color:rgb(107, 107, 101);
  margin: 0;
`;

const PhotoIcon = () => (
  <svg width="20" height="20" fill="#45bd62" viewBox="0 0 24 24">
    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
  </svg>
);

const VideoIcon = () => (
  <svg width="20" height="20" fill="#f3425f" viewBox="0 0 24 24">
    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
  </svg>
);

const CarIcon = () => (
  <svg width="20" height="20" fill="#ff8c00" viewBox="0 0 24 24">
    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
  </svg>
);

export default SocialFeedPage;
