// src/components/RatingDisplay.tsx
// Rating display component for Bulgarian Car Marketplace

import React from 'react';
import styled from 'styled-components';
import { RatingSummary } from '@/services/reviews/rating-service';

interface RatingDisplayProps {
  summary: RatingSummary | null;
  size?: 'small' | 'medium' | 'large';
  showDetails?: boolean;
  className?: string;
}

const RatingContainer = styled.div<{ size: string }>`
  display: flex;
  align-items: center;
  gap: ${({ size }) =>
    size === 'small' ? '4px' :
    size === 'medium' ? '8px' : '12px'};
`;

const StarsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
`;

const Star = styled.span<{ filled: boolean; size: string }>`
  color: ${({ filled }) => filled ? '#FFD700' : '#E0E0E0'};
  font-size: ${({ size }) =>
    size === 'small' ? '14px' :
    size === 'medium' ? '18px' : '24px'};
  line-height: 1;
`;

const RatingText = styled.span<{ size: string }>`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ size }) =>
    size === 'small' ? '12px' :
    size === 'medium' ? '14px' : '16px'};
`;

const RatingCount = styled.span<{ size: string }>`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ size }) =>
    size === 'small' ? '11px' :
    size === 'medium' ? '12px' : '14px'};
`;

const RatingDetails = styled.div`
  margin-top: 12px;
  padding: 16px;
  background: ${({ theme }) => theme.colors.grey[50]};
  border-radius: 8px;
`;

const CategoryRating = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const CategoryName = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const CategoryStars = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
`;

const RatingDistribution = styled.div`
  margin-top: 16px;
`;

const DistributionBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
`;

const StarLabel = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
  width: 20px;
`;

const ProgressBar = styled.div<{ percentage: number }>`
  flex: 1;
  height: 6px;
  background: ${({ theme }) => theme.colors.grey[200]};
  border-radius: 3px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ percentage: number }>`
  height: 100%;
  background: #FFD700;
  width: ${({ percentage }) => percentage}%;
  transition: width 0.3s ease;
`;

const DistributionCount = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
  width: 30px;
  text-align: right;
`;

const RatingDisplay: React.FC<RatingDisplayProps> = ({
  summary,
  size = 'medium',
  showDetails = false,
  className
}) => {
  if (!summary || summary.totalRatings === 0) {
    return (
      <RatingContainer size={size} className={className}>
        <StarsContainer>
          {[1, 2, 3, 4, 5].map(star => (
            <Star key={star} filled={false} size={size}>★</Star>
          ))}
        </StarsContainer>
        <RatingText size={size}>0.0</RatingText>
        <RatingCount size={size}>(0)</RatingCount>
      </RatingContainer>
    );
  }

  const renderStars = (rating: number) => {
    return [1, 2, 3, 4, 5].map(star => (
      <Star key={star} filled={star <= rating} size={size}>★</Star>
    ));
  };

  const renderCategoryStars = (rating: number) => {
    return [1, 2, 3, 4, 5].map(star => (
      <Star key={star} filled={star <= Math.round(rating)} size="small">★</Star>
    ));
  };

  const getCategoryName = (category: string) => {
    const names: { [key: string]: string } = {
      reliability: 'Надеждност',
      performance: 'Производителност',
      comfort: 'Комфорт',
      value: 'Цена/Качество',
      design: 'Дизайн'
    };
    return names[category] || category;
  };

  return (
    <div className={className}>
      <RatingContainer size={size}>
        <StarsContainer>
          {renderStars(Math.round(summary.averageRating))}
        </StarsContainer>
        <RatingText size={size}>{summary.averageRating.toFixed(1)}</RatingText>
        <RatingCount size={size}>
          ({summary.totalRatings} {summary.totalRatings === 1 ? 'отзив' : 'отзива'})
        </RatingCount>
      </RatingContainer>

      {showDetails && (
        <RatingDetails>
          <div style={{ marginBottom: '16px' }}>
            {summary.categoryRatings && Object.entries(summary.categoryRatings).map(([category, rating]) => (
              <CategoryRating key={category}>
                <CategoryName>{getCategoryName(category)}</CategoryName>
                <CategoryStars>
                  {renderCategoryStars(rating as number)}
                  <span style={{ marginLeft: '8px', fontSize: '12px', color: '#666' }}>
                    {(rating as number).toFixed(1)}
                  </span>
                </CategoryStars>
              </CategoryRating>
            ))}
          </div>

          <RatingDistribution>
            {[5, 4, 3, 2, 1].map(stars => {
              const count = summary.ratingDistribution[stars] || 0;
              const percentage = summary.totalRatings > 0 ? (count / summary.totalRatings) * 100 : 0;
              return (
                <DistributionBar key={stars}>
                  <StarLabel>{stars}★</StarLabel>
                  <ProgressBar percentage={100}>
                    <ProgressFill percentage={percentage} />
                  </ProgressBar>
                  <DistributionCount>{count}</DistributionCount>
                </DistributionBar>
              );
            })}
          </RatingDistribution>
        </RatingDetails>
      )}
    </div>
  );
};

export default RatingDisplay;