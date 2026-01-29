import { logger } from '../../services/logger-service';
// PostsFeedPage Component
// Main page displaying posts feed with filtering
// English/Bulgarian bilingual. No emojis. <250 lines.

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { postsService, type Post } from '../../services/posts/posts.service';
import { PostCard } from './PostCard';
import * as S from './feed-styles';

export const PostsFeedPage: React.FC = () => {
  const { t } = useLanguage();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadPosts();
  }, [filter]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const filterType = filter === 'all' ? undefined : filter;
      const data = await postsService.list(filterType, 50);
      setPosts(data);
    } catch (err) {
      logger.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    // TODO: Implement like functionality
    logger.info('Like post:', postId);
  };

  const handleFlag = async (postId: string) => {
    const reason = prompt(t('posts.flagReason'));
    if (reason) {
      try {
        await postsService.flag(postId, reason, 'current-user-id');
        await loadPosts();
      } catch (err) {
        logger.error('Failed to flag post:', err);
      }
    }
  };

  if (loading) {
    return <S.LoadingContainer>{t('common.loading')}</S.LoadingContainer>;
  }

  return (
    <S.Container>
      <S.Header>
        <S.Title>{t('posts.feedTitle')}</S.Title>
        <S.FilterContainer>
          <S.FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>
            {t('posts.filter.all')}
          </S.FilterButton>
          <S.FilterButton active={filter === 'market'} onClick={() => setFilter('market')}>
            {t('posts.filter.market')}
          </S.FilterButton>
          <S.FilterButton active={filter === 'tips'} onClick={() => setFilter('tips')}>
            {t('posts.filter.tips')}
          </S.FilterButton>
          <S.FilterButton active={filter === 'review'} onClick={() => setFilter('review')}>
            {t('posts.filter.review')}
          </S.FilterButton>
        </S.FilterContainer>
      </S.Header>

      <S.FeedContainer>
        {posts.length === 0 ? (
          <S.EmptyState>{t('posts.noPosts')}</S.EmptyState>
        ) : (
          posts.map((post: any) => (
            <PostCard key={post.id} post={post} onLike={handleLike} onFlag={handleFlag} />
          ))
        )}
      </S.FeedContainer>
    </S.Container>
  );
};
