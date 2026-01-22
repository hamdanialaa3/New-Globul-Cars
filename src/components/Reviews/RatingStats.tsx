// src/components/Reviews/RatingStats.tsx
// Rating Statistics Component - إحصائيات التقييمات
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import React from 'react';
import styled from 'styled-components';
import { ThumbsUp, Shield } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { ratingService } from '../../services/reviews';
import type { ReviewStats } from '../../services/reviews';
import RatingDisplay from './RatingDisplay';

// ==================== STYLED COMPONENTS ====================

const StatsContainer = styled.div`
  width: 100%;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const StatsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
  }
`;

const OverallRating = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const BigRating = styled.div`
  font-size: 3rem;
  font-weight: 700;
  color: #333;
  line-height: 1;
`;

const RatingLabel = styled.div<{ $color: string }>`
  padding: 6px 16px;
  border-radius: 20px;
  background: ${props => props.$color}20;
  color: ${props => props.$color};
  font-size: 0.875rem;
  font-weight: 600;
`;

const DistributionContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const DistributionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StarLabel = styled.span`
  font-size: 0.875rem;
  color: #666;
  min-width: 40px;
`;

const ProgressBar = styled.div`
  flex: 1;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $width: number; $color: string }>`
  height: 100%;
  width: ${props => props.$width}%;
  background: ${props => props.$color};
  transition: width 0.3s ease;
`;

const CountLabel = styled.span`
  font-size: 0.875rem;
  color: #666;
  min-width: 40px;
  text-align: right;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-top: 20px;
`;

const StatCard = styled.div`
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const StatIcon = styled.div<{ $color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.$color}20;
  color: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: #666;
  text-align: center;
`;

// ==================== COMPONENT ====================

interface RatingStatsProps {
  stats: ReviewStats;
}

const RatingStats: React.FC<RatingStatsProps> = ({ stats }) => {
  const { language } = useLanguage();
  const level = ratingService.getRatingLevel(stats.averageRating);

  const distributionData = [
    { stars: 5, count: stats.ratingDistribution[5], color: '#4caf50' },
    { stars: 4, count: stats.ratingDistribution[4], color: '#8bc34a' },
    { stars: 3, count: stats.ratingDistribution[3], color: '#ff9800' },
    { stars: 2, count: stats.ratingDistribution[2], color: '#ff5722' },
    { stars: 1, count: stats.ratingDistribution[1], color: '#f44336' }
  ];

  return (
    <StatsContainer>
      <StatsHeader>
        <OverallRating>
          <BigRating>{ratingService.formatRating(stats.averageRating)}</BigRating>
          <RatingDisplay 
            rating={stats.averageRating}
            showNumber={false}
            size="large"
          />
          <RatingLabel $color={level.color}>
            {language === 'bg' ? level.label_bg : level.label_en}
          </RatingLabel>
          <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '4px' }}>
            {stats.totalReviews} {language === 'bg' ? 'отзива' : 'reviews'}
          </div>
        </OverallRating>

        <DistributionContainer>
          {distributionData.map((item: any) => (
            <DistributionRow key={item.stars}>
              <StarLabel>
                {item.stars} ⭐
              </StarLabel>
              <ProgressBar>
                <ProgressFill
                  $width={ratingService.getRatingPercentage(item.count, stats.totalReviews)}
                  $color={item.color}
                />
              </ProgressBar>
              <CountLabel>{item.count}</CountLabel>
            </DistributionRow>
          ))}
        </DistributionContainer>
      </StatsHeader>

      <StatsGrid>
        <StatCard>
          <StatIcon $color="#4caf50">
            <ThumbsUp size={20} />
          </StatIcon>
          <StatValue>{stats.recommendationRate}%</StatValue>
          <StatLabel>
            {language === 'bg' ? 'Препоръчват' : 'Recommend'}
          </StatLabel>
        </StatCard>

        <StatCard>
          <StatIcon $color="#2196f3">
            <Shield size={20} />
          </StatIcon>
          <StatValue>{stats.verifiedPurchaseRate}%</StatValue>
          <StatLabel>
            {language === 'bg' ? 'Потвърдени' : 'Verified'}
          </StatLabel>
        </StatCard>
      </StatsGrid>
    </StatsContainer>
  );
};

export default RatingStats;
