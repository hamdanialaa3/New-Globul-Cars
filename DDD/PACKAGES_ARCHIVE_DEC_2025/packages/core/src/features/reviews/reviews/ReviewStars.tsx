// src/features/reviews/ReviewStars.tsx
// Reusable Star Rating Display Component

import React from 'react';
import styled from 'styled-components';

interface ReviewStarsProps {
  rating: number; // 0-5, supports decimals (e.g., 4.5)
  size?: 'small' | 'medium' | 'large';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showCount?: boolean;
  count?: number;
}

const ReviewStars: React.FC<ReviewStarsProps> = ({
  rating,
  size = 'medium',
  interactive = false,
  onChange,
  showCount = false,
  count = 0,
}) => {
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);

  const displayRating = hoverRating !== null ? hoverRating : rating;

  const handleClick = (starRating: number) => {
    if (interactive && onChange) {
      onChange(starRating);
    }
  };

  const handleMouseEnter = (starRating: number) => {
    if (interactive) {
      setHoverRating(starRating);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(null);
    }
  };

  return (
    <Container>
      <StarsContainer size={size}>
        {[1, 2, 3, 4, 5].map((star) => {
          const fillPercentage = Math.max(0, Math.min(1, displayRating - star + 1)) * 100;

          return (
            <StarWrapper
              key={star}
              onClick={() => handleClick(star)}
              onMouseEnter={() => handleMouseEnter(star)}
              onMouseLeave={handleMouseLeave}
              interactive={interactive}
            >
              <StarSVG
                width={size === 'small' ? 16 : size === 'medium' ? 20 : 24}
                height={size === 'small' ? 16 : size === 'medium' ? 20 : 24}
                viewBox="0 0 24 24"
              >
                <defs>
                  <linearGradient id={`star-gradient-${star}`}>
                    <stop offset={`${fillPercentage}%`} stopColor="#FFB800" />
                    <stop offset={`${fillPercentage}%`} stopColor="#E0E0E0" />
                  </linearGradient>
                </defs>
                <path
                  d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                  fill={`url(#star-gradient-${star})`}
                  stroke="#FFB800"
                  strokeWidth="0.5"
                />
              </StarSVG>
            </StarWrapper>
          );
        })}
      </StarsContainer>

      {showCount && (
        <CountText size={size}>
          ({count} {count === 1 ? 'review' : 'reviews'})
        </CountText>
      )}

      {!showCount && size !== 'small' && (
        <RatingText size={size}>{rating.toFixed(1)}</RatingText>
      )}
    </Container>
  );
};

export default ReviewStars;

// Styled Components

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StarsContainer = styled.div<{ size: string }>`
  display: flex;
  gap: ${(props) => (props.size === 'small' ? '2px' : '4px')};
`;

const StarWrapper = styled.div<{ interactive: boolean }>`
  cursor: ${(props) => (props.interactive ? 'pointer' : 'default')};
  transition: transform 0.2s;

  &:hover {
    transform: ${(props) => (props.interactive ? 'scale(1.2)' : 'none')};
  }
`;

const StarSVG = styled.svg`
  display: block;
`;

const RatingText = styled.span<{ size: string }>`
  font-size: ${(props) =>
    props.size === 'small' ? '12px' : props.size === 'medium' ? '14px' : '16px'};
  font-weight: 600;
  color: #333;
`;

const CountText = styled.span<{ size: string }>`
  font-size: ${(props) =>
    props.size === 'small' ? '12px' : props.size === 'medium' ? '14px' : '16px'};
  color: #666;
`;
