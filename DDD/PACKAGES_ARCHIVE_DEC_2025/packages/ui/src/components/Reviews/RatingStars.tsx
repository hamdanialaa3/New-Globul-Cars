/**
 * Rating Stars Component
 * Displays star rating (read-only or interactive)
 * Location: Bulgaria | Languages: BG, EN | Currency: EUR
 */

import React from 'react';
import styled from 'styled-components';
import { Star } from 'lucide-react';

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const StarButton = styled.button<{ $filled: boolean; $interactive: boolean }>`
  background: none;
  border: none;
  padding: 0;
  cursor: ${props => props.$interactive ? 'pointer' : 'default'};
  transition: transform 0.1s;
  
  &:hover {
    transform: ${props => props.$interactive ? 'scale(1.1)' : 'none'};
  }
  
  &:active {
    transform: ${props => props.$interactive ? 'scale(0.95)' : 'none'};
  }
`;

const RatingText = styled.span`
  margin-left: 8px;
  font-size: 14px;
  color: #666;
  font-weight: 500;
`;

interface RatingStarsProps {
  rating: number;
  totalReviews?: number;
  size?: number;
  interactive?: boolean;
  showText?: boolean;
  onChange?: (rating: number) => void;
}

const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  totalReviews,
  size = 20,
  interactive = false,
  showText = false,
  onChange
}) => {
  const [hoverRating, setHoverRating] = React.useState(0);
  
  const handleClick = (value: number) => {
    if (interactive && onChange) {
      onChange(value);
    }
  };

  const displayRating = interactive && hoverRating > 0 ? hoverRating : rating;

  return (
    <Container>
      {[1, 2, 3, 4, 5].map((value) => (
        <StarButton
          key={value}
          $filled={value <= displayRating}
          $interactive={interactive}
          onClick={() => handleClick(value)}
          onMouseEnter={() => interactive && setHoverRating(value)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          disabled={!interactive}
        >
          <Star
            size={size}
            fill={value <= displayRating ? '#FFB800' : 'none'}
            color={value <= displayRating ? '#FFB800' : '#ccc'}
          />
        </StarButton>
      ))}
      
      {showText && totalReviews !== undefined && (
        <RatingText>
          {rating.toFixed(1)} ({totalReviews})
        </RatingText>
      )}
    </Container>
  );
};

export default RatingStars;

