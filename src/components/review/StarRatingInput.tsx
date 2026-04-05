/**
 * StarRatingInput
 * Interactive 1-5 star rating picker with hover preview
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { Star } from 'lucide-react';

interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
  size?: number;
  readonly?: boolean;
  showLabel?: boolean;
}

const LABELS_EN = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
const LABELS_BG = ['', 'Слабо', 'Средно', 'Добро', 'Много добро', 'Отлично'];

export const StarRatingInput: React.FC<StarRatingInputProps & { language?: string }> = ({
  value,
  onChange,
  size = 28,
  readonly = false,
  showLabel = true,
  language = 'en',
}) => {
  const [hoverIndex, setHoverIndex] = useState(0);
  const labels = language === 'bg' ? LABELS_BG : LABELS_EN;
  const displayValue = hoverIndex || value;

  return (
    <Wrapper>
      <StarsRow>
        {[1, 2, 3, 4, 5].map(i => (
          <StarButton
            key={i}
            type="button"
            $readonly={readonly}
            onMouseEnter={() => !readonly && setHoverIndex(i)}
            onMouseLeave={() => !readonly && setHoverIndex(0)}
            onClick={() => !readonly && onChange(i)}
            aria-label={`${i} star${i > 1 ? 's' : ''}`}
          >
            <Star
              size={size}
              fill={i <= displayValue ? '#f59e0b' : 'none'}
              stroke={i <= displayValue ? '#f59e0b' : '#CBD5E1'}
              strokeWidth={1.5}
            />
          </StarButton>
        ))}
      </StarsRow>
      {showLabel && displayValue > 0 && (
        <Label>{labels[displayValue]}</Label>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const StarsRow = styled.div`
  display: flex;
  gap: 2px;
`;

const StarButton = styled.button<{ $readonly: boolean }>`
  background: none;
  border: none;
  padding: 2px;
  cursor: ${p => p.$readonly ? 'default' : 'pointer'};
  transition: transform 0.15s ease;
  display: flex;

  &:hover {
    transform: ${p => p.$readonly ? 'none' : 'scale(1.15)'};
  }
`;

const Label = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: #f59e0b;
`;

export default StarRatingInput;
