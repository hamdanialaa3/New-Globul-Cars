import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Star, ThumbsUp, ThumbsDown, Heart, Smile, Frown } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface RatingOption {
  id: string;
  label: string;
  value: number;
  icon?: React.ReactNode;
  color?: string;
}

interface RatingSystemProps {
  rating: number;
  dealerRating?: number;
  maxRating?: number;
  onRatingChange?: (rating: number) => void;
  type?: 'star' | 'thumbs' | 'heart' | 'smile' | 'custom';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showForm?: boolean;
  showValue?: boolean;
  showCount?: boolean;
  count?: number;
  disabled?: boolean;
  interactive?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onHover?: (rating: number) => void;
  onLeave?: () => void;
  customOptions?: RatingOption[];
}

const RatingSystemContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const RatingSystemLabel = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const RatingSystemStars = styled.div<{ size: string; disabled: boolean }>`
  display: flex;
  gap: ${({ theme, size }) => {
    switch (size) {
      case 'sm': return theme.spacing.xs;
      case 'lg': return theme.spacing.sm;
      default: return theme.spacing.xs;
    }
  }};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
`;

const RatingSystemStar = styled.button<{ 
  filled: boolean; 
  size: string; 
  disabled: boolean;
  interactive: boolean;
}>`
  background: none;
  border: none;
  cursor: ${({ disabled, interactive }) => 
    disabled || !interactive ? 'not-allowed' : 'pointer'
  };
  padding: ${({ theme, size }) => {
    switch (size) {
      case 'sm': return theme.spacing.xs;
      case 'lg': return theme.spacing.sm;
      default: return theme.spacing.xs;
    }
  }};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.grey[100]};
    transform: scale(1.1);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary.light + '40'};
  }

  svg {
    width: ${({ size }) => {
      switch (size) {
        case 'sm': return '16px';
        case 'lg': return '24px';
        default: return '20px';
      }
    }};
    height: ${({ size }) => {
      switch (size) {
        case 'sm': return '16px';
        case 'lg': return '24px';
        default: return '20px';
      }
    }};
    color: ${({ theme, filled }) => 
      filled ? theme.colors.warning.main : theme.colors.grey[300]
    };
    transition: color 0.2s ease;
  }
`;

const RatingSystemThumbs = styled.div<{ size: string; disabled: boolean }>`
  display: flex;
  gap: ${({ theme, size }) => {
    switch (size) {
      case 'sm': return theme.spacing.sm;
      case 'lg': return theme.spacing.md;
      default: return theme.spacing.sm;
    }
  }};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
`;

const RatingSystemThumb = styled.button<{ 
  active: boolean; 
  size: string; 
  disabled: boolean;
  interactive: boolean;
  type: 'up' | 'down';
}>`
  background: ${({ theme, active, type }) => {
    if (active) {
      return type === 'up' ? theme.colors.success.main : theme.colors.error.main;
    }
    return theme.colors.grey[100];
  }};
  border: 1px solid ${({ theme, active, type }) => {
    if (active) {
      return type === 'up' ? theme.colors.success.main : theme.colors.error.main;
    }
    return theme.colors.grey[300];
  }};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  padding: ${({ theme, size }) => {
    switch (size) {
      case 'sm': return `${theme.spacing.sm} ${theme.spacing.md}`;
      case 'lg': return `${theme.spacing.md} ${theme.spacing.lg}`;
      default: return `${theme.spacing.sm} ${theme.spacing.md}`;
    }
  }};
  cursor: ${({ disabled, interactive }) => 
    disabled || !interactive ? 'not-allowed' : 'pointer'
  };
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};

  &:hover:not(:disabled) {
    background: ${({ theme, active, type }) => {
      if (active) {
        return type === 'up' ? theme.colors.success.dark : theme.colors.error.dark;
      }
      return theme.colors.grey[200];
    }};
    transform: scale(1.05);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary.light + '40'};
  }

  svg {
    width: ${({ size }) => {
      switch (size) {
        case 'sm': return '16px';
        case 'lg': return '20px';
        default: return '18px';
      }
    }};
    height: ${({ size }) => {
      switch (size) {
        case 'sm': return '16px';
        case 'lg': return '20px';
        default: return '18px';
      }
    }};
    color: ${({ theme, active, type }) => {
      if (active) {
        return type === 'up' ? theme.colors.success.contrastText : theme.colors.error.contrastText;
      }
      return theme.colors.text.secondary;
    }};
  }
`;

const RatingSystemHearts = styled.div<{ size: string; disabled: boolean }>`
  display: flex;
  gap: ${({ theme, size }) => {
    switch (size) {
      case 'sm': return theme.spacing.xs;
      case 'lg': return theme.spacing.sm;
      default: return theme.spacing.xs;
    }
  }};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
`;

const RatingSystemHeart = styled.button<{ 
  filled: boolean; 
  size: string; 
  disabled: boolean;
  interactive: boolean;
}>`
  background: none;
  border: none;
  cursor: ${({ disabled, interactive }) => 
    disabled || !interactive ? 'not-allowed' : 'pointer'
  };
  padding: ${({ theme, size }) => {
    switch (size) {
      case 'sm': return theme.spacing.xs;
      case 'lg': return theme.spacing.sm;
      default: return theme.spacing.xs;
    }
  }};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.grey[100]};
    transform: scale(1.1);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary.light + '40'};
  }

  svg {
    width: ${({ size }) => {
      switch (size) {
        case 'sm': return '16px';
        case 'lg': return '24px';
        default: return '20px';
      }
    }};
    height: ${({ size }) => {
      switch (size) {
        case 'sm': return '16px';
        case 'lg': return '24px';
        default: return '20px';
      }
    }};
    color: ${({ theme, filled }) => 
      filled ? theme.colors.error.main : theme.colors.grey[300]
    };
    transition: color 0.2s ease;
  }
`;

const RatingSystemSmiles = styled.div<{ size: string; disabled: boolean }>`
  display: flex;
  gap: ${({ theme, size }) => {
    switch (size) {
      case 'sm': return theme.spacing.sm;
      case 'lg': return theme.spacing.md;
      default: return theme.spacing.sm;
    }
  }};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
`;

const RatingSystemSmile = styled.button<{ 
  active: boolean, 
  size: string, 
  disabled: boolean,
  interactive: boolean,
  type: 'up' | 'down'
}>`
  background: ${({ theme, active, type }) => {
    if (active) {
      return type === 'up' ? theme.colors.success.main : theme.colors.error.main;
    }
    return theme.colors.grey[100];
  }};
  border: 1px solid ${({ theme, active, type }) => {
    if (active) {
      return type === 'up' ? theme.colors.success.main : theme.colors.error.main;
    }
    return theme.colors.grey[300];
  }};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  padding: ${({ theme, size }) => {
    switch (size) {
      case 'sm': return `${theme.spacing.sm} ${theme.spacing.md}`;
      case 'lg': return `${theme.spacing.md} ${theme.spacing.lg}`;
      default: return `${theme.spacing.sm} ${theme.spacing.md}`;
    }
  }};
  cursor: ${({ disabled, interactive }) => 
    disabled || !interactive ? 'not-allowed' : 'pointer'
  };
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};

  &:hover:not(:disabled) {
    background: ${({ theme, active, type }) => {
      if (active) {
        return type === 'up' ? theme.colors.success.dark : theme.colors.error.dark;
      }
      return theme.colors.grey[200];
    }};
    transform: scale(1.05);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary.light + '40'};
  }

  svg {
    width: ${({ size }) => {
      switch (size) {
        case 'sm': return '16px';
        case 'lg': return '20px';
        default: return '18px';
      }
    }};
    height: ${({ size }) => {
      switch (size) {
        case 'sm': return '16px';
        case 'lg': return '20px';
        default: return '18px';
      }
    }};
    color: ${({ theme, active, type }) => {
      if (active) {
        return type === 'up' ? theme.colors.success.contrastText : theme.colors.error.contrastText;
      }
      return theme.colors.text.secondary;
    }};
  }
`;

const RatingSystemCustom = styled.div<{ size: string; disabled: boolean }>`
  display: flex;
  gap: ${({ theme, size }) => {
    switch (size) {
      case 'sm': return theme.spacing.sm;
      case 'lg': return theme.spacing.md;
      default: return theme.spacing.sm;
    }
  }};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
`;

const RatingSystemCustomOption = styled.button<{ 
  active: boolean; 
  size: string; 
  disabled: boolean;
  interactive: boolean;
  color?: string;
}>`
  background: ${({ theme, active, color }) => {
    if (active) {
      return color || theme.colors.primary.main;
    }
    return theme.colors.grey[100];
  }};
  border: 1px solid ${({ theme, active, color }) => {
    if (active) {
      return color || theme.colors.primary.main;
    }
    return theme.colors.grey[300];
  }};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  padding: ${({ theme, size }) => {
    switch (size) {
      case 'sm': return `${theme.spacing.sm} ${theme.spacing.md}`;
      case 'lg': return `${theme.spacing.md} ${theme.spacing.lg}`;
      default: return `${theme.spacing.sm} ${theme.spacing.md}`;
    }
  }};
  cursor: ${({ disabled, interactive }) => 
    disabled || !interactive ? 'not-allowed' : 'pointer'
  };
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};

  &:hover:not(:disabled) {
    background: ${({ theme, active, color }) => {
      if (active) {
        return color || theme.colors.primary.dark;
      }
      return theme.colors.grey[200];
    }};
    transform: scale(1.05);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary.light + '40'};
  }

  svg {
    width: ${({ size }) => {
      switch (size) {
        case 'sm': return '16px';
        case 'lg': return '20px';
        default: return '18px';
      }
    }};
    height: ${({ size }) => {
      switch (size) {
        case 'sm': return '16px';
        case 'lg': return '20px';
        default: return '18px';
      }
    }};
    color: ${({ theme, active, color }) => {
      if (active) {
        return color || theme.colors.primary.contrastText;
      }
      return theme.colors.text.secondary;
    }};
  }
`;

const RatingSystemInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const RatingSystemValue = styled.span`
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const RatingSystemCount = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const RatingSystem: React.FC<RatingSystemProps> = ({
  rating,
  maxRating = 5,
  onRatingChange,
  type = 'star',
  size = 'md',
  showLabel = true,
  showValue = true,
  showCount = true,
  count = 0,
  disabled = false,
  interactive = true,
  className,
  style,
  onHover,
  onLeave,
  customOptions = [],
}) => {
  const { t } = useTranslation();
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleRatingClick = (newRating: number) => {
    if (disabled || !interactive) return;
    onRatingChange?.(newRating);
  };

  const handleMouseEnter = (newRating: number) => {
    if (disabled || !interactive) return;
    setHoveredRating(newRating);
    onHover?.(newRating);
  };

  const handleMouseLeave = () => {
    if (disabled || !interactive) return;
    setHoveredRating(0);
    onLeave?.();
  };

  const renderStars = () => {
    return Array.from({ length: maxRating }, (_, index) => {
      const starRating = index + 1;
      const isFilled = starRating <= (hoveredRating || rating);
      
      return (
        <RatingSystemStar
          key={starRating}
          filled={isFilled}
          size={size}
          disabled={disabled}
          interactive={interactive}
          onClick={() => handleRatingClick(starRating)}
          onMouseEnter={() => handleMouseEnter(starRating)}
          onMouseLeave={handleMouseLeave}
        >
          <Star size={20} />
        </RatingSystemStar>
      );
    });
  };

  const renderThumbs = () => {
    return (
      <>
        <RatingSystemThumb
          active={rating === 1}
          size={size}
          disabled={disabled}
          interactive={interactive}
          type="up"
          onClick={() => handleRatingClick(rating === 1 ? 0 : 1)}
          onMouseEnter={() => handleMouseEnter(1)}
          onMouseLeave={handleMouseLeave}
        >
          <ThumbsUp size={18} />
        </RatingSystemThumb>
        <RatingSystemThumb
          active={rating === -1}
          size={size}
          disabled={disabled}
          interactive={interactive}
          type="down"
          onClick={() => handleRatingClick(rating === -1 ? 0 : -1)}
          onMouseEnter={() => handleMouseEnter(-1)}
          onMouseLeave={handleMouseLeave}
        >
          <ThumbsDown size={18} />
        </RatingSystemThumb>
      </>
    );
  };

  const renderHearts = () => {
    return Array.from({ length: maxRating }, (_, index) => {
      const heartRating = index + 1;
      const isFilled = heartRating <= (hoveredRating || rating);
      
      return (
        <RatingSystemHeart
          key={heartRating}
          filled={isFilled}
          size={size}
          disabled={disabled}
          interactive={interactive}
          onClick={() => handleRatingClick(heartRating)}
          onMouseEnter={() => handleMouseEnter(heartRating)}
          onMouseLeave={handleMouseLeave}
        >
          <Heart size={20} />
        </RatingSystemHeart>
      );
    });
  };

  const renderSmiles = () => {
    return (
      <>
        <RatingSystemSmile
          active={rating === 1}
          size={size}
          disabled={disabled}
          interactive={interactive}
          type="up"
          onClick={() => handleRatingClick(rating === 1 ? 0 : 1)}
          onMouseEnter={() => handleMouseEnter(1)}
          onMouseLeave={handleMouseLeave}
        >
          <Smile size={18} />
        </RatingSystemSmile>
        <RatingSystemSmile
          active={rating === -1}
          size={size}
          disabled={disabled}
          interactive={interactive}
          type="down"
          onClick={() => handleRatingClick(rating === -1 ? 0 : -1)}
          onMouseEnter={() => handleMouseEnter(-1)}
          onMouseLeave={handleMouseLeave}
        >
          <Frown size={18} />
        </RatingSystemSmile>
      </>
    );
  };

  const renderCustom = () => {
    return customOptions.map((option) => {
      const isActive = option.value === rating;
      
      return (
        <RatingSystemCustomOption
          key={option.id}
          active={isActive}
          size={size}
          disabled={disabled}
          interactive={interactive}
          color={option.color}
          onClick={() => handleRatingClick(option.value)}
          onMouseEnter={() => handleMouseEnter(option.value)}
          onMouseLeave={handleMouseLeave}
        >
          {option.icon}
          {option.label}
        </RatingSystemCustomOption>
      );
    });
  };

  const renderRating = () => {
    switch (type) {
      case 'star':
        return <RatingSystemStars size={size} disabled={disabled}>{renderStars()}</RatingSystemStars>;
      case 'thumbs':
        return <RatingSystemThumbs size={size} disabled={disabled}>{renderThumbs()}</RatingSystemThumbs>;
      case 'heart':
        return <RatingSystemHearts size={size} disabled={disabled}>{renderHearts()}</RatingSystemHearts>;
      case 'smile':
        return <RatingSystemSmiles size={size} disabled={disabled}>{renderSmiles()}</RatingSystemSmiles>;
      case 'custom':
        return <RatingSystemCustom size={size} disabled={disabled}>{renderCustom()}</RatingSystemCustom>;
      default:
        return <RatingSystemStars size={size} disabled={disabled}>{renderStars()}</RatingSystemStars>;
    }
  };

  return (
    <RatingSystemContainer className={className} style={style}>
      {showLabel && (
        <RatingSystemLabel>
          {t('ratingSystem.label', 'Rating')}
        </RatingSystemLabel>
      )}
      
      {renderRating()}
      
      {(showValue || showCount) && (
        <RatingSystemInfo>
          {showValue && (
            <RatingSystemValue>
              {rating} / {maxRating}
            </RatingSystemValue>
          )}
          {showCount && count > 0 && (
            <RatingSystemCount>
              ({count} {t('ratingSystem.votes', 'votes')})
            </RatingSystemCount>
          )}
        </RatingSystemInfo>
      )}
    </RatingSystemContainer>
  );
};

export default RatingSystem;