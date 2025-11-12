// src/components/RatingList.tsx
// Rating list component for Bulgarian Car Marketplace

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useTranslation } from '@/hooks/useTranslation';
import { bulgarianRatingService, CarRating } from '@/services/reviews/rating-service';

interface RatingListProps {
  carId: string;
  className?: string;
}

const ListContainer = styled.div`
  margin-top: 32px;
`;

const ListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

const HeaderTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 24px;
  font-weight: 600;
`;

const SortSelect = styled.select`
  padding: 8px 12px;
  border: 2px solid ${({ theme }) => theme.colors.grey[300]};
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const RatingItem = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid ${({ theme }) => theme.colors.grey[200]};
`;

const RatingHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const UserAvatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid ${({ theme }) => theme.colors.grey[200]};
`;

const DefaultAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary.main};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 600;
  border: 2px solid ${({ theme }) => theme.colors.grey[200]};
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const UserName = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 16px;
`;

const RatingDate = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 12px;
`;

const RatingStars = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const Star = styled.span<{ filled: boolean }>`
  color: ${({ filled }) => filled ? '#FFD700' : '#E0E0E0'};
  font-size: 16px;
`;

const RatingTitle = styled.h4`
  margin: 0 0 12px 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 18px;
  font-weight: 600;
`;

const RatingComment = styled.p`
  margin: 0 0 16px 0;
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1.6;
  font-size: 15px;
`;

const ProsConsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ProsConsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SectionTitle = styled.span`
  font-weight: 600;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const Tag = styled.span<{ type: 'pro' | 'con' }>`
  background: ${({ type, theme }) =>
    type === 'pro' ? '#4CAF50' : '#F44336'};
  color: white;
  padding: 4px 8px;
  border-radius: 16px;
  font-size: 12px;
`;

const RatingFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.grey[200]};

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
`;

const VerifiedBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #4CAF50;
  font-size: 14px;
  font-weight: 500;
`;

const HelpfulButton = styled.button`
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.grey[300]};
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.grey[50]};
    border-color: ${({ theme }) => theme.colors.primary.main};
    color: ${({ theme }) => theme.colors.primary.main};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const LoadMoreButton = styled.button`
  width: 100%;
  padding: 16px;
  background: ${({ theme }) => theme.colors.primary.main};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 24px;
  transition: background 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primary.dark};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 24px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const EmptyTitle = styled.h4`
  margin: 0 0 8px 0;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const EmptyMessage = styled.p`
  margin: 0;
  font-size: 16px;
`;

const RatingList: React.FC<RatingListProps> = ({ carId, className }) => {
  const { t } = useTranslation();
  const [ratings, setRatings] = useState<CarRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'helpful' | 'rating'>('newest');
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<any>(null);

  const loadRatings = useCallback(async (reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
        setLastDoc(null);
      } else {
        setLoadingMore(true);
      }

      const result = await bulgarianRatingService.getCarRatings(
        carId,
        10,
        reset ? undefined : lastDoc
      );

      if (reset) {
        setRatings(result.ratings);
      } else {
        setRatings(prev => [...prev, ...result.ratings]);
      }

      setHasMore(result.hasMore);
      if (result.lastDoc) {
        setLastDoc(result.lastDoc);
      }
    } catch (error) {
      console.error('Error loading ratings:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [carId, lastDoc]);

  useEffect(() => {
    loadRatings(true);
  }, [loadRatings, sortBy]);

  const handleHelpful = async (ratingId: string) => {
    try {
      await bulgarianRatingService.updateRatingHelpful(ratingId, true);
      // Update local state
      setRatings(prev => prev.map(rating =>
        rating.id === ratingId
          ? { ...rating, helpful: (rating.helpful || 0) + 1 }
          : rating
      ));
    } catch (error) {
      console.error('Error marking helpful:', error);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('bg-BG');
  };

  const renderStars = (rating: number) => {
    return [1, 2, 3, 4, 5].map(star => (
      <Star key={star} filled={star <= rating}>★</Star>
    ));
  };

  const sortedRatings = [...ratings].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return a.createdAt.getTime() - b.createdAt.getTime();
      case 'helpful':
        return (b.helpful || 0) - (a.helpful || 0);
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
      default:
        return b.createdAt.getTime() - a.createdAt.getTime();
    }
  });

  if (loading) {
    return (
      <ListContainer className={className}>
        <div style={{ textAlign: 'center', padding: '48px' }}>
          {t('common.loading')}
        </div>
      </ListContainer>
    );
  }

  return (
    <ListContainer className={className}>
      <ListHeader>
        <HeaderTitle>
          {t('ratings.customerReviews')} ({ratings.length})
        </HeaderTitle>
        <SortSelect
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
        >
          <option value="newest">{t('ratings.sort.newest')}</option>
          <option value="oldest">{t('ratings.sort.oldest')}</option>
          <option value="helpful">{t('ratings.sort.helpful')}</option>
          <option value="rating">{t('ratings.sort.rating')}</option>
        </SortSelect>
      </ListHeader>

      {sortedRatings.length === 0 ? (
        <EmptyState>
          <EmptyTitle>{t('ratings.noReviews')}</EmptyTitle>
          <EmptyMessage>{t('ratings.beFirstToReview')}</EmptyMessage>
        </EmptyState>
      ) : (
        <>
          {sortedRatings.map((rating) => (
            <RatingItem key={rating.id}>
              <RatingHeader>
                <UserInfo>
                  {rating.userAvatar ? (
                    <UserAvatar src={rating.userAvatar} alt={rating.userName} />
                  ) : (
                    <DefaultAvatar>
                      {rating.userName?.charAt(0).toUpperCase() || 'U'}
                    </DefaultAvatar>
                  )}
                  <UserDetails>
                    <UserName>{rating.userName}</UserName>
                    <RatingDate>{formatDate(rating.createdAt)}</RatingDate>
                  </UserDetails>
                </UserInfo>
                <RatingStars>
                  {renderStars(rating.rating)}
                </RatingStars>
              </RatingHeader>

              <RatingTitle>{rating.title}</RatingTitle>
              <RatingComment>{rating.comment}</RatingComment>

              {(rating.pros?.length || rating.cons?.length) && (
                <ProsConsContainer>
                  {rating.pros?.length > 0 && (
                    <ProsConsSection>
                      <SectionTitle>{t('ratings.pros')}</SectionTitle>
                      <TagList>
                        {rating.pros.map((pro: string, index: number) => (
                          <Tag key={index} type="pro">{pro}</Tag>
                        ))}
                      </TagList>
                    </ProsConsSection>
                  )}
                  {rating.cons?.length > 0 && (
                    <ProsConsSection>
                      <SectionTitle>{t('ratings.cons')}</SectionTitle>
                      <TagList>
                        {rating.cons.map((con: string, index: number) => (
                          <Tag key={index} type="con">{con}</Tag>
                        ))}
                      </TagList>
                    </ProsConsSection>
                  )}
                </ProsConsContainer>
              )}

              <RatingFooter>
                <div>
                  {rating.verifiedPurchase && (
                    <VerifiedBadge>
                      ✅ {t('ratings.verifiedPurchase')}
                    </VerifiedBadge>
                  )}
                </div>
                <HelpfulButton onClick={() => handleHelpful(rating.id)}>
                  👍 {t('ratings.helpful')} ({rating.helpful || 0})
                </HelpfulButton>
              </RatingFooter>
            </RatingItem>
          ))}

          {hasMore && (
            <LoadMoreButton
              onClick={() => loadRatings(false)}
              disabled={loadingMore}
            >
              {loadingMore ? t('common.loading') : t('ratings.loadMore')}
            </LoadMoreButton>
          )}
        </>
      )}
    </ListContainer>
  );
};

export default RatingList;