import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { blogService } from '@/services/blog/blog.service';
import type { BlogPost } from '@/types/blog.types';
import { serviceLogger } from '@/services/logger-service';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Calendar, Clock, Eye, Heart, Share2, User, ArrowLeft, Tag } from 'lucide-react';

const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [liked, setLiked] = useState(false);

  const texts = {
    bg: {
      loading: 'Зареждане...',
      notFound: 'Статията не е намерена',
      backToBlog: 'Обратно към блога',
      share: 'Сподели',
      like: 'Харесай',
      minRead: 'мин четене',
      views: 'прегледи',
      relatedPosts: 'Свързани статии',
      readMore: 'Прочети повече',
      author: 'Автор',
      publishedOn: 'Публикувана на',
      tags: 'Тагове'
    },
    en: {
      loading: 'Loading...',
      notFound: 'Post not found',
      backToBlog: 'Back to Blog',
      share: 'Share',
      like: 'Like',
      minRead: 'min read',
      views: 'views',
      relatedPosts: 'Related Posts',
      readMore: 'Read more',
      author: 'Author',
      publishedOn: 'Published on',
      tags: 'Tags'
    }
  };

  const t = texts[language] || texts.bg;

  useEffect(() => {
    if (slug) {
      loadPost();
    }
  }, [slug, language]);

  const loadPost = async () => {
    if (!slug) return;

    try {
      setLoading(true);
      const fetchedPost = await blogService.getPostBySlug(slug, language);
      
      if (fetchedPost) {
        setPost(fetchedPost);
        // Increment views
        blogService.incrementViews(fetchedPost.id);
        
        // Load related posts
        if (fetchedPost.category) {
          const related = await blogService.getPostsByCategory(fetchedPost.category, 3);
          setRelatedPosts(related.filter(p => p.id !== fetchedPost.id));
        }
      }
    } catch (error) {
      serviceLogger.error('Error loading post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user || !post) {
      navigate('/login');
      return;
    }

    try {
      await blogService.toggleLike(post.id, user.uid);
      setLiked(!liked);
      setPost({
        ...post,
        likes: liked ? post.likes - 1 : post.likes + 1
      });
    } catch (error) {
      serviceLogger.error('Error liking post:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share && post) {
      try {
        await navigator.share({
          title: language === 'bg' ? post.title.bg : post.title.en,
          text: language === 'bg' ? post.excerpt.bg : post.excerpt.en,
          url: window.location.href
        });
      } catch (error) {
        serviceLogger.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success(language === 'bg' ? 'Линкът е копиран!' : 'Link copied!');
    }
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

  if (!post) {
    return (
      <NotFoundContainer>
        <h2>{t.notFound}</h2>
        <BackButton onClick={() => navigate('/blog')}>{t.backToBlog}</BackButton>
      </NotFoundContainer>
    );
  }

  return (
    <PageContainer>
      <BackLink onClick={() => navigate('/blog')}>
        <ArrowLeft size={20} />
        {t.backToBlog}
      </BackLink>

      <Article>
        <Header>
          <CategoryBadge>{post.category}</CategoryBadge>
          <Title>{language === 'bg' ? post.title.bg : post.title.en}</Title>
          
          <MetaInfo>
            <MetaItem>
              <User size={18} />
              <AuthorInfo>
                {post.author.avatar && <AuthorAvatar src={post.author.avatar} alt={post.author.name} />}
                <div>
                  <AuthorName>{post.author.name}</AuthorName>
                  <AuthorRole>{post.author.role}</AuthorRole>
                </div>
              </AuthorInfo>
            </MetaItem>
            
            <MetaItem>
              <Calendar size={18} />
              {formatDate(post.publishedAt || post.createdAt)}
            </MetaItem>
            
            <MetaItem>
              <Clock size={18} />
              {post.readingTime} {t.minRead}
            </MetaItem>
            
            <MetaItem>
              <Eye size={18} />
              {post.views} {t.views}
            </MetaItem>
          </MetaInfo>

          <ActionButtons>
            <ActionButton onClick={handleLike} $active={liked}>
              <Heart fill={liked ? '#e74c3c' : 'none'} color={liked ? '#e74c3c' : 'currentColor'} size={20} />
              {post.likes}
            </ActionButton>
            <ActionButton onClick={handleShare}>
              <Share2 size={20} />
              {t.share}
            </ActionButton>
          </ActionButtons>
        </Header>

        <CoverImage src={post.coverImage} alt={language === 'bg' ? post.title.bg : post.title.en} />

        <Content dangerouslySetInnerHTML={{ __html: language === 'bg' ? post.content.bg : post.content.en }} />

        {post.tags.length > 0 && (
          <TagsSection>
            <TagsTitle>{t.tags}:</TagsTitle>
            <Tags>
              {post.tags.map((tag) => (
                <TagItem key={tag}>
                  <Tag size={14} />
                  {tag}
                </TagItem>
              ))}
            </Tags>
          </TagsSection>
        )}
      </Article>

      {relatedPosts.length > 0 && (
        <RelatedSection>
          <SectionTitle>{t.relatedPosts}</SectionTitle>
          <RelatedGrid>
            {relatedPosts.map((relatedPost) => (
              <RelatedCard
                key={relatedPost.id}
                onClick={() => navigate(`/blog/${language === 'bg' ? relatedPost.slug.bg : relatedPost.slug.en}`)}
              >
                <RelatedImage src={relatedPost.coverImage} alt={language === 'bg' ? relatedPost.title.bg : relatedPost.title.en} />
                <RelatedContent>
                  <RelatedTitle>{language === 'bg' ? relatedPost.title.bg : relatedPost.title.en}</RelatedTitle>
                  <RelatedExcerpt>{language === 'bg' ? relatedPost.excerpt.bg : relatedPost.excerpt.en}</RelatedExcerpt>
                  <ReadMoreLink>{t.readMore} →</ReadMoreLink>
                </RelatedContent>
              </RelatedCard>
            ))}
          </RelatedGrid>
        </RelatedSection>
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

const BackLink = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  max-width: 900px;
  margin: 0 auto 2rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid ${(props) => props.theme?.colors?.border || '#ddd'};
  border-radius: 8px;
  cursor: pointer;
  color: ${(props) => props.theme?.colors?.text || '#333'};
  transition: all 0.2s;

  &:hover {
    background: ${(props) => props.theme?.colors?.hover || '#f0f0f0'};
  }
`;

const Article = styled.article`
  max-width: 900px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  padding: 3rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
  }
`;

const Header = styled.header`
  margin-bottom: 2rem;
`;

const CategoryBadge = styled.span`
  display: inline-block;
  padding: 0.5rem 1rem;
  background: ${(props) => props.theme?.colors?.primary?.main || '#007bff'}15;
  color: ${(props) => props.theme?.colors?.primary?.main || '#007bff'};
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: ${(props) => props.theme?.colors?.text || '#333'};
  margin-bottom: 1.5rem;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const MetaInfo = styled.div`
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${(props) => props.theme?.colors?.textSecondary || '#666'};
  font-size: 0.95rem;
`;

const AuthorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const AuthorAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
`;

const AuthorName = styled.div`
  font-weight: 500;
  color: ${(props) => props.theme?.colors?.text || '#333'};
`;

const AuthorRole = styled.div`
  font-size: 0.85rem;
  color: ${(props) => props.theme?.colors?.textSecondary || '#666'};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
`;

const ActionButton = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${(props) => (props.$active ? 'rgba(231, 76, 60, 0.1)' : 'white')};
  border: 2px solid ${(props) => props.theme?.colors?.border || '#ddd'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: ${(props) => props.theme?.colors?.text || '#333'};

  &:hover {
    background: ${(props) => props.theme?.colors?.hover || '#f0f0f0'};
  }
`;

const CoverImage = styled.img`
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    height: 250px;
  }
`;

const Content = styled.div`
  color: ${(props) => props.theme?.colors?.text || '#333'};
  line-height: 1.8;
  font-size: 1.1rem;

  h2 {
    margin-top: 2rem;
    margin-bottom: 1rem;
    font-size: 1.8rem;
  }

  h3 {
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
    font-size: 1.4rem;
  }

  p {
    margin-bottom: 1.5rem;
  }

  img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 1.5rem 0;
  }

  ul, ol {
    margin-left: 2rem;
    margin-bottom: 1.5rem;
  }

  blockquote {
    border-left: 4px solid ${(props) => props.theme?.colors?.primary?.main || '#007bff'};
    padding-left: 1.5rem;
    margin: 2rem 0;
    font-style: italic;
    color: ${(props) => props.theme?.colors?.textSecondary || '#666'};
  }
`;

const TagsSection = styled.div`
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid ${(props) => props.theme?.colors?.border || '#ddd'};
`;

const TagsTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: ${(props) => props.theme?.colors?.text || '#333'};
`;

const Tags = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const TagItem = styled.span`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${(props) => props.theme?.colors?.hover || '#f0f0f0'};
  border-radius: 20px;
  font-size: 0.9rem;
  color: ${(props) => props.theme?.colors?.textSecondary || '#666'};
`;

const RelatedSection = styled.section`
  max-width: 900px;
  margin: 3rem auto 0;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  color: ${(props) => props.theme?.colors?.text || '#333'};
  margin-bottom: 2rem;
`;

const RelatedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const RelatedCard = styled.article`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
`;

const RelatedImage = styled.img`
  width: 100%;
  height: 160px;
  object-fit: cover;
`;

const RelatedContent = styled.div`
  padding: 1.5rem;
`;

const RelatedTitle = styled.h3`
  font-size: 1.2rem;
  color: ${(props) => props.theme?.colors?.text || '#333'};
  margin-bottom: 0.75rem;
  line-height: 1.3;
`;

const RelatedExcerpt = styled.p`
  color: ${(props) => props.theme?.colors?.textSecondary || '#666'};
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 1rem;
`;

const ReadMoreLink = styled.div`
  color: ${(props) => props.theme?.colors?.primary?.main || '#007bff'};
  font-weight: 500;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 1rem;
`;

const NotFoundContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 2rem;
`;

const BackButton = styled.button`
  padding: 1rem 2rem;
  background: ${(props) => props.theme?.colors?.primary?.main || '#007bff'};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => props.theme?.colors?.primary?.dark || '#0056b3'};
  }
`;

export default BlogPostPage;
