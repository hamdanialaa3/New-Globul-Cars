6import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useTheme } from '../../../contexts/ThemeContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { blogService } from '../../../services/blog/blog.service';
import type { BlogPost, BlogCategory } from '../../../types/blog.types';
import { serviceLogger } from '../../../services/logger-service';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { Calendar, Clock, Eye, Heart, Tag, User } from 'lucide-react';

const BlogPage: React.FC = () => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const texts = {
    bg: {
      title: 'Блог - Съвети и Новини',
      subtitle: 'Всичко за автомобилите в България',
      search: 'Търсене...',
      allCategories: 'Всички категории',
      categories: {
        'buying-tips': 'Съвети за покупка',
        'selling-tips': 'Съвети за продажба',
        'market-trends': 'Пазарни тенденции',
        'car-reviews': 'Ревюта',
        'maintenance': 'Поддръжка',
        'legal': 'Правна информация',
        'news': 'Новини'
      },
      readMore: 'Прочети повече',
      minRead: 'мин четене',
      views: 'прегледи',
      noPosts: 'Няма налични статии',
      loading: 'Зареждане...'
    },
    en: {
      title: 'Blog - Tips & News',
      subtitle: 'Everything about cars in Bulgaria',
      search: 'Search...',
      allCategories: 'All Categories',
      categories: {
        'buying-tips': 'Buying Tips',
        'selling-tips': 'Selling Tips',
        'market-trends': 'Market Trends',
        'car-reviews': 'Car Reviews',
        'maintenance': 'Maintenance',
        'legal': 'Legal Info',
        'news': 'News'
      },
      readMore: 'Read more',
      minRead: 'min read',
      views: 'views',
      noPosts: 'No posts available',
      loading: 'Loading...'
    }
  };

  const t = texts[language] || texts.bg;

  useEffect(() => {
    loadPosts();
  }, [selectedCategory]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const filters = selectedCategory !== 'all' ? { category: selectedCategory as BlogCategory } : {};
      const { posts: fetchedPosts } = await blogService.getPosts(filters, 50);
      setPosts(fetchedPosts);
    } catch (error) {
      serviceLogger.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadPosts();
      return;
    }

    try {
      setLoading(true);
      const results = await blogService.searchPosts(searchQuery);
      setPosts(results);
    } catch (error) {
      serviceLogger.error('Error searching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostClick = (post: BlogPost) => {
    const slug = language === 'bg' ? post.slug.bg : post.slug.en;
    navigate(`/blog/${slug}`);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(language === 'bg' ? 'bg-BG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  if (loading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <p>{t.loading}</p>
      </LoadingContainer>
    );
  }

  return (
    <PageContainer>
      <HeaderSection>
        <Title>{t.title}</Title>
        <Subtitle>{t.subtitle}</Subtitle>

        <SearchBar>
          <SearchInput
            type="text"
            placeholder={t.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <SearchButton onClick={handleSearch}>
            🔍
          </SearchButton>
        </SearchBar>

        <CategoryFilters>
          <CategoryButton
            $active={selectedCategory === 'all'}
            onClick={() => setSelectedCategory('all')}
          >
            {t.allCategories}
          </CategoryButton>
          {Object.keys(t.categories).map((cat) => (
            <CategoryButton
              key={cat}
              $active={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat as BlogCategory)}
            >
              {t.categories[cat as BlogCategory]}
            </CategoryButton>
          ))}
        </CategoryFilters>
      </HeaderSection>

      {posts.length === 0 ? (
        <NoPostsMessage>{t.noPosts}</NoPostsMessage>
      ) : (
        <PostsGrid>
          {posts.map((post) => (
            <PostCard key={post.id} onClick={() => handlePostClick(post)}>
              <PostImage src={post.coverImage} alt={language === 'bg' ? post.title.bg : post.title.en} />
              
              <PostContent>
                <CategoryBadge>{t.categories[post.category]}</CategoryBadge>
                
                <PostTitle>{language === 'bg' ? post.title.bg : post.title.en}</PostTitle>
                
                <PostExcerpt>{language === 'bg' ? post.excerpt.bg : post.excerpt.en}</PostExcerpt>
                
                <PostMeta>
                  <MetaItem>
                    <User size={16} />
                    {post.author.name}
                  </MetaItem>
                  <MetaItem>
                    <Calendar size={16} />
                    {formatDate(post.publishedAt || post.createdAt)}
                  </MetaItem>
                  <MetaItem>
                    <Clock size={16} />
                    {post.readingTime} {t.minRead}
                  </MetaItem>
                  <MetaItem>
                    <Eye size={16} />
                    {post.views} {t.views}
                  </MetaItem>
                </PostMeta>

                {post.tags.length > 0 && (
                  <Tags>
                    {post.tags.slice(0, 3).map((tag) => (
                      <TagItem key={tag}>
                        <Tag size={12} />
                        {tag}
                      </TagItem>
                    ))}
                  </Tags>
                )}

                <ReadMoreButton>{t.readMore} →</ReadMoreButton>
              </PostContent>
            </PostCard>
          ))}
        </PostsGrid>
      )}
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: ${(props) => props.theme?.colors?.background || '#f8f9fa'};
  padding: 2rem 1rem;
`;

const HeaderSection = styled.div`
  max-width: 1200px;
  margin: 0 auto 3rem;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: ${(props) => props.theme?.colors?.text || '#333'};
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: ${(props) => props.theme?.colors?.textSecondary || '#666'};
  margin-bottom: 2rem;
`;

const SearchBar = styled.div`
  display: flex;
  max-width: 600px;
  margin: 0 auto 2rem;
  gap: 0.5rem;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid ${(props) => props.theme?.colors?.border || '#ddd'};
  border-radius: 8px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme?.colors?.primary?.main || '#007bff'};
  }
`;

const SearchButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${(props) => props.theme?.colors?.primary?.main || '#007bff'};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => props.theme?.colors?.primary?.dark || '#0056b3'};
  }
`;

const CategoryFilters = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const CategoryButton = styled.button<{ $active: boolean }>`
  padding: 0.5rem 1rem;
  background: ${(props) => (props.$active ? props.theme?.colors?.primary?.main || '#007bff' : 'white')};
  color: ${(props) => (props.$active ? 'white' : props.theme?.colors?.text || '#333')};
  border: 2px solid ${(props) => (props.$active ? props.theme?.colors?.primary?.main || '#007bff' : props.theme?.colors?.border || '#ddd')};
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;

  &:hover {
    background: ${(props) => (props.$active ? props.theme?.colors?.primary?.dark || '#0056b3' : props.theme?.colors?.hover || '#f0f0f0')};
  }
`;

const PostsGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const PostCard = styled.article`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
`;

const PostImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const PostContent = styled.div`
  padding: 1.5rem;
`;

const CategoryBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: ${(props) => props.theme?.colors?.primary?.main || '#007bff'}15;
  color: ${(props) => props.theme?.colors?.primary?.main || '#007bff'};
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 1rem;
`;

const PostTitle = styled.h2`
  font-size: 1.5rem;
  color: ${(props) => props.theme?.colors?.text || '#333'};
  margin-bottom: 0.75rem;
  line-height: 1.3;
`;

const PostExcerpt = styled.p`
  color: ${(props) => props.theme?.colors?.textSecondary || '#666'};
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const PostMeta = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.85rem;
  color: ${(props) => props.theme?.colors?.textSecondary || '#666'};
`;

const Tags = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
`;

const TagItem = styled.span`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: ${(props) => props.theme?.colors?.hover || '#f0f0f0'};
  border-radius: 8px;
  font-size: 0.8rem;
  color: ${(props) => props.theme?.colors?.textSecondary || '#666'};
`;

const ReadMoreButton = styled.div`
  color: ${(props) => props.theme?.colors?.primary?.main || '#007bff'};
  font-weight: 500;
  margin-top: 1rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 1rem;
`;

const NoPostsMessage = styled.div`
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
  color: ${(props) => props.theme?.colors?.textSecondary || '#666'};
`;

export default BlogPage;
