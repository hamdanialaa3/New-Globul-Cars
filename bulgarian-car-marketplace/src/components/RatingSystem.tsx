import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from '../hooks/useTranslation';

interface RatingSystemProps {
  dealerRating?: number;
  onRatingSubmit?: (rating: number, comment: string) => void;
  showForm?: boolean;
}

export const RatingSystem: React.FC<RatingSystemProps> = ({
  dealerRating,
  onRatingSubmit,
  showForm = true
}) => {
  const { t } = useTranslation();
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (userRating === 0) return;

    setIsSubmitting(true);
    try {
      await onRatingSubmit?.(userRating, comment);
      setUserRating(0);
      setComment('');
      // إظهار رسالة نجاح
    } catch (error) {
      console.error('Error submitting rating:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // محاكاة بيانات التقييمات للعرض
  const mockRatingData = {
    averageRating: dealerRating || 4.5,
    totalRatings: 125,
    ratingBreakdown: {
      5: 75,
      4: 30,
      3: 15,
      2: 3,
      1: 2
    }
  };

  return (
    <RatingContainer>
      <RatingTitle>{t('cars.rating.dealerRating', 'Оценка на търговеца')}</RatingTitle>

      <RatingOverview>
        <OverallRating>
          <RatingValue>{mockRatingData.averageRating.toFixed(1)}</RatingValue>
          <Stars rating={mockRatingData.averageRating} size="large" />
          <RatingCount>{mockRatingData.totalRatings} {t('cars.rating.ratings', 'оценки')}</RatingCount>
        </OverallRating>

        <RatingBreakdown>
          {[5, 4, 3, 2, 1].map(stars => (
            <RatingRow key={stars}>
              <Stars rating={stars} size="small" />
              <RatingBar>
                <RatingFill width={`${(mockRatingData.ratingBreakdown[stars as keyof typeof mockRatingData.ratingBreakdown] / mockRatingData.totalRatings) * 100}%`} />
              </RatingBar>
              <RatingPercentage>{mockRatingData.ratingBreakdown[stars as keyof typeof mockRatingData.ratingBreakdown]}</RatingPercentage>
            </RatingRow>
          ))}
        </RatingBreakdown>
      </RatingOverview>

      {/* نموذج إضافة تقييم */}
      {showForm && (
        <RatingForm>
          <FormTitle>{t('cars.rating.addRating', 'Добавете вашата оценка')}</FormTitle>

          <StarsInteractive
            rating={userRating}
            hoverRating={hoverRating}
            onRatingChange={setUserRating}
            onHoverChange={setHoverRating}
          />

          <CommentTextarea
            placeholder={t('cars.rating.commentPlaceholder', 'Напишете вашето мнение...')}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
          />

          <SubmitButton
            onClick={handleSubmit}
            disabled={userRating === 0 || isSubmitting}
          >
            {isSubmitting ? t('cars.rating.submitting', 'Изпращане...') : t('cars.rating.submit', 'Изпрати оценка')}
          </SubmitButton>
        </RatingForm>
      )}

      {/* قسم المراجعات الأخيرة */}
      <RecentReviews>
        <ReviewsTitle>{t('cars.rating.recentReviews', 'Последни отзиви')}</ReviewsTitle>
        <ReviewList>
          <ReviewItem>
            <ReviewHeader>
              <ReviewerName>Иван Петров</ReviewerName>
              <ReviewDate>15.01.2024</ReviewDate>
              <Stars rating={5} size="small" />
            </ReviewHeader>
            <ReviewText>
              Отличен търговец! Автомобилът беше точно както е описан. Бързо и професионално обслужване.
            </ReviewText>
          </ReviewItem>

          <ReviewItem>
            <ReviewHeader>
              <ReviewerName>Мария Димитрова</ReviewerName>
              <ReviewDate>12.01.2024</ReviewDate>
              <Stars rating={4} size="small" />
            </ReviewHeader>
            <ReviewText>
              Добър опит. Цената беше справедлива и нямаше скрити проблеми. Препоръчвам!
            </ReviewText>
          </ReviewItem>

          <ReviewItem>
            <ReviewHeader>
              <ReviewerName>Георги Стоянов</ReviewerName>
              <ReviewDate>08.01.2024</ReviewDate>
              <Stars rating={5} size="small" />
            </ReviewHeader>
            <ReviewText>
              Професионален подход и отлична комуникация. Автомобилът е в перфектно състояние.
            </ReviewText>
          </ReviewItem>
        </ReviewList>
      </RecentReviews>
    </RatingContainer>
  );
};

// مكون النجوم التفاعلي
const StarsInteractive: React.FC<{
  rating: number;
  hoverRating: number;
  onRatingChange: (rating: number) => void;
  onHoverChange: (rating: number) => void;
}> = ({ rating, hoverRating, onRatingChange, onHoverChange }) => {
  return (
    <StarsContainer>
      {[1, 2, 3, 4, 5].map(star => (
        <StarButton
          key={star}
          onMouseEnter={() => onHoverChange(star)}
          onMouseLeave={() => onHoverChange(0)}
          onClick={() => onRatingChange(star)}
        >
          <Star filled={star <= (hoverRating || rating)}>★</Star>
        </StarButton>
      ))}
    </StarsContainer>
  );
};

// مكون النجوم للعرض فقط
const Stars: React.FC<{ rating: number; size?: 'small' | 'large' }> = ({ rating, size = 'small' }) => {
  return (
    <StarsContainer>
      {[1, 2, 3, 4, 5].map(star => (
        <Star key={star} filled={star <= rating} size={size}>★</Star>
      ))}
    </StarsContainer>
  );
};

// Styled Components
const RatingContainer = styled.div`
  background: white;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-top: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.base};
`;

const RatingTitle = styled.h3`
  margin: 0 0 ${({ theme }) => theme.spacing.lg} 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
`;

const RatingOverview = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const OverallRating = styled.div`
  text-align: center;
`;

const RatingValue = styled.div`
  font-size: 48px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary.main};
`;

const RatingCount = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const RatingBreakdown = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const RatingRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const RatingBar = styled.div`
  flex: 1;
  background: ${({ theme }) => theme.colors.grey[200]};
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
`;

const RatingFill = styled.div<{ width: string }>`
  background: ${({ theme }) => theme.colors.primary.main};
  height: 100%;
  width: ${props => props.width};
`;

const RatingPercentage = styled.span`
  min-width: 40px;
  text-align: right;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const RatingForm = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.grey[200]};
  padding-top: ${({ theme }) => theme.spacing.lg};
`;

const FormTitle = styled.h4`
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
`;

const StarsContainer = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const StarButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
`;

const Star = styled.span<{ filled: boolean; size?: 'small' | 'large' }>`
  color: ${({ filled, theme }) =>
    filled ? theme.colors.warning : theme.colors.grey[300]};
  font-size: ${({ size }) => size === 'large' ? '24px' : '16px'};
  transition: color 0.2s ease-in-out;
`;

const CommentTextarea = styled.textarea`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.grey[300]};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  font-family: inherit;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const SubmitButton = styled.button<{ disabled: boolean }>`
  margin-top: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme, disabled }) =>
    disabled ? theme.colors.grey[300] : theme.colors.primary.main};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primary.dark};
  }
`;

const RecentReviews = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xl};
  border-top: 1px solid ${({ theme }) => theme.colors.grey[200]};
  padding-top: ${({ theme }) => theme.spacing.lg};
`;

const ReviewsTitle = styled.h4`
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ReviewList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const ReviewItem = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.grey[50]};
  border-radius: ${({ theme }) => theme.borderRadius.base};
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const ReviewerName = styled.span`
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ReviewDate = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const ReviewText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1.5;
`;

export default RatingSystem;