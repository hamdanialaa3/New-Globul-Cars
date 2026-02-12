// src/components/review/ReviewForm.tsx
// Review Form Component - نموذج التقييم بعد البيع
// الهدف: نموذج شامل لكتابة تقييم احترافي

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { Star, Send, MessageSquare } from 'lucide-react';
import { useLanguage } from '@/contexts';
import { postSaleReviewService } from '@/services/review/post-sale-review.service';
import type { PostSaleReview } from '@/services/review/post-sale-review.service';

/**
 * Review Form Props
 */
interface ReviewFormProps {
  carId: string;
  sellerId: string;
  buyerId: string;
  reviewerRole: 'buyer' | 'seller';
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * Review Form Component
 */
const ReviewForm: React.FC<ReviewFormProps> = ({
  carId,
  sellerId,
  buyerId,
  reviewerRole,
  onSuccess,
  onCancel
}) => {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    rating: 0,
    comment: '',
    aspectRatings: {
      communication: 0,
      accuracy: 0,
      condition: 0,
      fairness: 0
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.rating === 0) {
      toast.error(language === 'bg' 
        ? 'Моля, поставете обща оценка' 
        : 'Please provide an overall rating'
      );
      return;
    }

    try {
      setLoading(true);

      const reviewData: Omit<PostSaleReview, 'id' | 'createdAt' | 'updatedAt'> = {
        carId,
        sellerId,
        buyerId,
        rating: formData.rating,
        reviewType: reviewerRole === 'buyer' ? 'seller' : 'buyer',
        reviewerRole,
        comment: formData.comment,
        aspectRatings: formData.aspectRatings,
        verified: false,
        helpful: 0,
        reportCount: 0,
        status: 'pending'
      };

      const result = await postSaleReviewService.createReview(reviewData);

      // Show success message with incentive
      toast.success(
        language === 'bg'
          ? `Благодарим! Спечелихте ${result.incentive.pointsAwarded} точки!`
          : `Thank you! You earned ${result.incentive.pointsAwarded} points!`
      );

      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(
        language === 'bg'
          ? 'Грешка при изпращане на отзива'
          : 'Error submitting review'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (
    value: number,
    onChange: (rating: number) => void,
    size: number = 24
  ) => {
    return (
      <StarContainer>
        {[1, 2, 3, 4, 5].map((star) => (
          <StarButton
            key={star}
            type="button"
            onClick={() => onChange(star)}
            $filled={star <= value}
          >
            <Star
              size={size}
              fill={star <= value ? '#FFD700' : 'none'}
              stroke={star <= value ? '#FFD700' : '#D1D5DB'}
            />
          </StarButton>
        ))}
      </StarContainer>
    );
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      <FormHeader>
        <HeaderIcon>
          <MessageSquare size={24} />
        </HeaderIcon>
        <HeaderTitle>
          {language === 'bg' 
            ? 'Оставете вашия отзив' 
            : 'Leave Your Review'
          }
        </HeaderTitle>
        <IncentiveBadge>
          {language === 'bg' 
            ? '🎁 Спечелете 40 точки!' 
            : '🎁 Earn 40 points!'
          }
        </IncentiveBadge>
      </FormHeader>

      <FormSection>
        <SectionTitle>
          {language === 'bg' ? 'Обща оценка' : 'Overall Rating'}
        </SectionTitle>
        <RatingRow>
          {renderStars(formData.rating, (rating) => 
            setFormData({ ...formData, rating })
          , 32)}
          {formData.rating > 0 && (
            <RatingText>{formData.rating}/5</RatingText>
          )}
        </RatingRow>
      </FormSection>

      <FormSection>
        <SectionTitle>
          {language === 'bg' ? 'Детайлна оценка' : 'Detailed Rating'}
        </SectionTitle>
        
        <AspectRating>
          <AspectLabel>
            {language === 'bg' ? 'Комуникация' : 'Communication'}
          </AspectLabel>
          {renderStars(
            formData.aspectRatings.communication,
            (rating) => setFormData({
              ...formData,
              aspectRatings: { ...formData.aspectRatings, communication: rating }
            }),
            20
          )}
        </AspectRating>

        <AspectRating>
          <AspectLabel>
            {language === 'bg' ? 'Точност на описанието' : 'Description Accuracy'}
          </AspectLabel>
          {renderStars(
            formData.aspectRatings.accuracy,
            (rating) => setFormData({
              ...formData,
              aspectRatings: { ...formData.aspectRatings, accuracy: rating }
            }),
            20
          )}
        </AspectRating>

        <AspectRating>
          <AspectLabel>
            {language === 'bg' ? 'Състояние на колата' : 'Car Condition'}
          </AspectLabel>
          {renderStars(
            formData.aspectRatings.condition,
            (rating) => setFormData({
              ...formData,
              aspectRatings: { ...formData.aspectRatings, condition: rating }
            }),
            20
          )}
        </AspectRating>

        <AspectRating>
          <AspectLabel>
            {language === 'bg' ? 'Справедлива цена' : 'Fair Pricing'}
          </AspectLabel>
          {renderStars(
            formData.aspectRatings.fairness,
            (rating) => setFormData({
              ...formData,
              aspectRatings: { ...formData.aspectRatings, fairness: rating }
            }),
            20
          )}
        </AspectRating>
      </FormSection>

      <FormSection>
        <SectionTitle>
          {language === 'bg' ? 'Коментар (опционално)' : 'Comment (Optional)'}
        </SectionTitle>
        <CommentTextarea
          value={formData.comment}
          onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
          placeholder={
            language === 'bg'
              ? 'Споделете вашия опит...'
              : 'Share your experience...'
          }
          rows={4}
        />
      </FormSection>

      <FormActions>
        {onCancel && (
          <CancelButton type="button" onClick={onCancel} disabled={loading}>
            {language === 'bg' ? 'Отказ' : 'Cancel'}
          </CancelButton>
        )}
        <SubmitButton type="submit" disabled={loading || formData.rating === 0}>
          <Send size={18} />
          {loading
            ? (language === 'bg' ? 'Изпращане...' : 'Submitting...')
            : (language === 'bg' ? 'Изпрати отзив' : 'Submit Review')
          }
        </SubmitButton>
      </FormActions>
    </FormContainer>
  );
};

// ==================== STYLED COMPONENTS ====================

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
  background: #FFFFFF;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const FormHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
`;

const HeaderIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #3B82F6, #8B5CF6);
  color: #FFFFFF;
  border-radius: 50%;
`;

const HeaderTitle = styled.h2`
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #111827;
`;

const IncentiveBadge = styled.div`
  padding: 6px 12px;
  background: #FEF3C7;
  color: #92400E;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
`;

const RatingRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const StarContainer = styled.div`
  display: flex;
  gap: 4px;
`;

const StarButton = styled.button<{ $filled: boolean }>`
  border: none;
  background: none;
  cursor: pointer;
  padding: 4px;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const RatingText = styled.span`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
`;

const AspectRating = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #F9FAFB;
  border-radius: 8px;
`;

const AspectLabel = styled.span`
  font-size: 14px;
  color: #6B7280;
  font-weight: 500;
`;

const CommentTextarea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3B82F6;
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const Button = styled.button`
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CancelButton = styled(Button)`
  background: #F3F4F6;
  color: #6B7280;

  &:hover:not(:disabled) {
    background: #E5E7EB;
  }
`;

const SubmitButton = styled(Button)`
  background: linear-gradient(135deg, #3B82F6, #8B5CF6);
  color: #FFFFFF;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }
`;

export default ReviewForm;
