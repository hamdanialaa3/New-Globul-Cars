// src/components/Reviews/ReviewsList.tsx
// Reviews List Component - قائمة المراجعات
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Filter, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { reviewService } from '../../services/reviews';
import type { Review } from '../../services/reviews';
import ReviewCard from './ReviewCard';
import RatingStats from './RatingStats';
import EmptyState from '../Profile/EmptyState';
import LoadingSkeleton from '../Profile/LoadingSkeleton';

// ==================== STYLED COMPONENTS ====================

const Container = styled.div`
  width: 100%;
`;

const Header = styled.div`
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

const Title = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  color: #333;
`;

const Controls = styled.div`
  display: flex;
  gap: 12px;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const FilterButton = styled.button<{ $active?: boolean }>`
  padding: 10px 16px;
  border: 1px solid ${props => props.$active ? '#FF7900' : '#e0e0e0'};
  border-radius: 8px;
  background: ${props => props.$active ? '#fff5e6' : 'white'};
  color: ${props => props.$active ? '#FF7900' : '#666'};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #FF7900;
    background: #fff5e6;
    color: #FF7900;
  }
  
  @media (max-width: 768px) {
    flex: 1;
  }
`;

const ReviewsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const LoadMoreButton = styled.button`
  width: 100%;
  padding: 14px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  color: #666;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #FF7900;
    color: #FF7900;
  }
`;

// ==================== COMPONENT ====================

interface ReviewsListProps {
  sellerId: string;
  showStats?: boolean;
}

type FilterType = 'all' | 'verified' | 'high' | 'low';
type SortType = 'recent' | 'helpful' | 'rating';

const ReviewsList: React.FC<ReviewsListProps> = ({
  sellerId,
  showStats = true
}) => {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('recent');
  const [displayCount, setDisplayCount] = useState(10);

  useEffect(() => {
    loadReviews();
  }, [sellerId]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const [reviewsData, statsData] = await Promise.all([
        reviewService.getSellerReviews(sellerId, 50),
        reviewService.getSellerReviewStats(sellerId)
      ]);

      setReviews(reviewsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredReviews = (): Review[] => {
    let filtered = [...reviews];

    // Apply filter
    switch (filter) {
      case 'verified':
        filtered = filtered.filter(r => r.verifiedPurchase);
        break;
      case 'high':
        filtered = filtered.filter(r => r.rating >= 4);
        break;
      case 'low':
        filtered = filtered.filter(r => r.rating <= 2);
        break;
    }

    // Apply sort
    switch (sort) {
      case 'helpful':
        filtered.sort((a, b) => b.helpful - a.helpful);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'recent':
      default:
        filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
    }

    return filtered;
  };

  const handleHelpful = async (reviewId: string, helpful: boolean) => {
    await reviewService.markHelpful(reviewId, helpful);
    
    // Update local state
    setReviews(prev =>
      prev.map(r =>
        r.id === reviewId
          ? {
              ...r,
              helpful: helpful ? r.helpful + 1 : r.helpful,
              notHelpful: !helpful ? r.notHelpful + 1 : r.notHelpful
            }
          : r
      )
    );
  };

  const filteredReviews = getFilteredReviews();
  const displayedReviews = filteredReviews.slice(0, displayCount);
  const hasMore = filteredReviews.length > displayCount;

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (reviews.length === 0) {
    return (
      <Container>
        <div style={{
          padding: '60px 20px',
          textAlign: 'center',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📝</div>
          <p style={{ fontSize: '1.1rem', color: '#666', margin: 0 }}>
            {language === 'bg'
              ? 'Все още няма отзиви за този продавач'
              : 'No reviews yet for this seller'}
          </p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      {showStats && stats && (
        <div style={{ marginBottom: '32px' }}>
          <RatingStats stats={stats} />
        </div>
      )}

      <Header>
        <Title>
          {language === 'bg' ? 'Отзиви' : 'Reviews'} ({filteredReviews.length})
        </Title>

        <Controls>
          <FilterButton
            $active={filter === 'all'}
            onClick={() => setFilter('all')}
          >
            {language === 'bg' ? 'Всички' : 'All'}
          </FilterButton>

          <FilterButton
            $active={filter === 'verified'}
            onClick={() => setFilter('verified')}
          >
            {language === 'bg' ? 'Потвърдени' : 'Verified'}
          </FilterButton>

          <FilterButton
            $active={filter === 'high'}
            onClick={() => setFilter('high')}
          >
            {language === 'bg' ? 'Високи (4-5⭐)' : 'High (4-5⭐)'}
          </FilterButton>

          <FilterButton
            $active={filter === 'low'}
            onClick={() => setFilter('low')}
          >
            {language === 'bg' ? 'Ниски (1-2⭐)' : 'Low (1-2⭐)'}
          </FilterButton>
        </Controls>
      </Header>

      <ReviewsContainer>
        {displayedReviews.map(review => (
          <ReviewCard
            key={review.id}
            review={review}
            onHelpful={handleHelpful}
          />
        ))}
      </ReviewsContainer>

      {hasMore && (
        <LoadMoreButton
          onClick={() => setDisplayCount(prev => prev + 10)}
          style={{ marginTop: '24px' }}
        >
          {language === 'bg' ? 'Покажи още' : 'Load More'}
          <ChevronDown size={20} />
        </LoadMoreButton>
      )}
    </Container>
  );
};

export default ReviewsList;
