// src/components/Reviews/RatingDisplay.tsx
// Rating Display Component - عرض التقييم بالنجوم
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import React from 'react';
import styled from 'styled-components';
import { Star } from 'lucide-react';
import { ratingService } from '../../services/reviews';

// ==================== STYLED COMPONENTS ====================

const RatingContainer = styled.div<{ $size?: 'small' | 'medium' | 'large' }>`
  display: flex;
  align-items: center;
  gap: ${props => props.$size === 'small' ? '4px' : props.$size === 'large' ? '8px' : '6px'};
`;

const StarsContainer = styled.div<{ $size?: 'small' | 'medium' | 'large' }>`
  display: flex;
  gap: ${props => props.$size === 'small' ? '2px' : props.$size === 'large' ? '6px' : '4px'};
`;

const StarIcon = styled(Star)<{ $filled: boolean; $half?: boolean; $size?: 'small' | 'medium' | 'large' }>`
  ${props => {
    const size = props.$size === 'small' ? 16 : props.$size === 'large' ? 28 : 20;
    return `width: ${size}px; height: ${size}px;`;
  }}
  
  fill: ${props => props.$filled ? '#FFC107' : 'transparent'};
  stroke: ${props => props.$filled ? '#FFC107' : '#e0e0e0'};
  stroke-width: 1.5;
  
  ${props => props.$half && `
    fill: url(#halfGradient);
  `}
`;

const RatingText = styled.span<{ $size?: 'small' | 'medium' | 'large'; $color?: string }>`
  font-size: ${props => props.$size === 'small' ? '0.875rem' : props.$size === 'large' ? '1.25rem' : '1rem'};
  font-weight: 600;
  color: ${props => props.$color || '#333'};
`;

const ReviewCount = styled.span<{ $size?: 'small' | 'medium' | 'large' }>`
  font-size: ${props => props.$size === 'small' ? '0.75rem' : props.$size === 'large' ? '1rem' : '0.875rem'};
  color: #666;
`;

// ==================== COMPONENT ====================

interface RatingDisplayProps {
  rating: number;
  reviewCount?: number;
  showNumber?: boolean;
  showCount?: boolean;
  size?: 'small' | 'medium' | 'large';
  interactive?: boolean;
  onClick?: () => void;
}

const RatingDisplay: React.FC<RatingDisplayProps> = ({
  rating,
  reviewCount,
  showNumber = true,
  showCount = false,
  size = 'medium',
  interactive = false,
  onClick
}) => {
  const stars = ratingService.getStarDisplay(rating);
  const level = ratingService.getRatingLevel(rating);

  const renderStars = () => {
    const starElements = [];

    // Full stars
    for (let i = 0; i < stars.full; i++) {
      starElements.push(
        <StarIcon key={`full-${i}`} $filled={true} $size={size} />
      );
    }

    // Half star
    if (stars.half) {
      starElements.push(
        <StarIcon key="half" $filled={false} $half={true} $size={size} />
      );
    }

    // Empty stars
    for (let i = 0; i < stars.empty; i++) {
      starElements.push(
        <StarIcon key={`empty-${i}`} $filled={false} $size={size} />
      );
    }

    return starElements;
  };

  return (
    <RatingContainer 
      $size={size}
      onClick={interactive ? onClick : undefined}
      style={{ cursor: interactive ? 'pointer' : 'default' }}
    >
      {/* SVG gradient for half stars */}
      <svg width="0" height="0">
        <defs>
          <linearGradient id="halfGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="50%" stopColor="#FFC107" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>

      <StarsContainer $size={size}>
        {renderStars()}
      </StarsContainer>

      {showNumber && (
        <RatingText $size={size} $color={level.color}>
          {ratingService.formatRating(rating)}
        </RatingText>
      )}

      {showCount && reviewCount !== undefined && (
        <ReviewCount $size={size}>
          ({reviewCount})
        </ReviewCount>
      )}
    </RatingContainer>
  );
};

export default RatingDisplay;
