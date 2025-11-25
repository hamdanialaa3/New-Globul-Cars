// PostCard Component
// Displays individual post in feed
// English/Bulgarian bilingual. No emojis. <200 lines.

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Post } from '@/services/posts/posts.service';
import * as S from './styles';

interface PostCardProps {
  post: Post;
  onLike?: (postId: string) => void;
  onFlag?: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onLike, onFlag }) => {
  const { language, t } = useLanguage();
  const title = post.content.title[language] || post.content.title.bg;
  const body = post.content.body[language] || post.content.body.bg;

  const handleLike = () => {
    if (onLike) onLike(post.id);
  };

  const handleFlag = () => {
    if (onFlag) onFlag(post.id);
  };

  return (
    <S.Card flagged={post.moderation.flagged}>
      <S.Header>
        <S.TypeBadge type={post.type}>{t(`posts.type.${post.type}`)}</S.TypeBadge>
        <S.Date>{post.createdAt.toDate().toLocaleDateString()}</S.Date>
      </S.Header>

      <S.Title>{title}</S.Title>
      <S.Body>{body}</S.Body>

      {post.tags.length > 0 && (
        <S.TagsContainer>
          {post.tags.map(tag => (
            <S.Tag key={tag}>{tag}</S.Tag>
          ))}
        </S.TagsContainer>
      )}

      <S.Footer>
        <S.MetricsContainer>
          <S.Metric>
            <S.MetricIcon>👁</S.MetricIcon>
            {post.metrics.views}
          </S.Metric>
          <S.Metric>
            <S.MetricIcon>❤</S.MetricIcon>
            {post.metrics.likes}
          </S.Metric>
          <S.Metric>
            <S.MetricIcon>💬</S.MetricIcon>
            {post.metrics.comments}
          </S.Metric>
        </S.MetricsContainer>

        <S.ActionsContainer>
          <S.ActionButton onClick={handleLike}>{t('posts.like')}</S.ActionButton>
          <S.ActionButton onClick={handleFlag}>{t('posts.flag')}</S.ActionButton>
        </S.ActionsContainer>
      </S.Footer>

      {post.moderation.flagged && (
        <S.FlaggedBanner>
          {t('posts.flaggedWarning')}: {post.moderation.reason}
        </S.FlaggedBanner>
      )}
    </S.Card>
  );
};
