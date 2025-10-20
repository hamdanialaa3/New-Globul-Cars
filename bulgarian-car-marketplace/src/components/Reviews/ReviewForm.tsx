// src/components/Reviews/ReviewForm.tsx
// Review Form Component - نموذج إضافة مراجعة
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import React, { useState } from 'react';
import styled from 'styled-components';
import { Star, ThumbsUp, ThumbsDown, Send } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthProvider';
import { reviewService } from '../../services/reviews';
import type { SubmitReviewData } from '../../services/reviews';

// ==================== STYLED COMPONENTS ====================

const FormContainer = styled.div`
  width: 100%;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const FormTitle = styled.h3`
  margin: 0 0 24px 0;
  font-size: 1.25rem;
  color: #333;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
`;

const RequiredStar = styled.span`
  color: #f44336;
  margin-left: 4px;
`;

const StarSelector = styled.div`
  display: flex;
  gap: 8px;
`;

const StarButton = styled.button<{ $filled: boolean }>`
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
  }
  
  svg {
    fill: ${props => props.$filled ? '#FFC107' : 'transparent'};
    stroke: ${props => props.$filled ? '#FFC107' : '#e0e0e0'};
    stroke-width: 1.5;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #FF7900;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 150px;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #FF7900;
  }
`;

const CharCount = styled.div<{ $over?: boolean }>`
  text-align: right;
  font-size: 0.75rem;
  color: ${props => props.$over ? '#f44336' : '#999'};
  margin-top: 4px;
`;

const RecommendButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const RecommendButton = styled.button<{ $selected?: boolean; $type: 'yes' | 'no' }>`
  flex: 1;
  padding: 12px;
  border: 2px solid ${props => 
    props.$selected 
      ? (props.$type === 'yes' ? '#4caf50' : '#f44336')
      : '#e0e0e0'
  };
  border-radius: 8px;
  background: ${props => 
    props.$selected 
      ? (props.$type === 'yes' ? '#e8f5e9' : '#ffebee')
      : 'white'
  };
  color: ${props => 
    props.$selected 
      ? (props.$type === 'yes' ? '#4caf50' : '#f44336')
      : '#666'
  };
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${props => props.$type === 'yes' ? '#4caf50' : '#f44336'};
    background: ${props => props.$type === 'yes' ? '#e8f5e9' : '#ffebee'};
    color: ${props => props.$type === 'yes' ? '#4caf50' : '#f44336'};
  }
`;

const ErrorMessage = styled.div`
  padding: 12px;
  background: #ffebee;
  color: #c62828;
  border-radius: 8px;
  font-size: 0.875rem;
  margin-bottom: 16px;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 8px;
  background: #FF7900;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background: #ff8c1a;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 121, 0, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// ==================== COMPONENT ====================

interface ReviewFormProps {
  sellerId: string;
  carId?: string;
  onSuccess?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  sellerId,
  carId,
  onSuccess
}) => {
  const { language } = useLanguage();
  const { currentUser } = useAuth();
  const [rating, setRating] = useState<number>(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const MAX_LENGTH = 1000;
  const MIN_LENGTH = 50;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      setError(language === 'bg' ? 'Моля, влезте в акаунта си' : 'Please login');
      return;
    }

    if (rating === 0) {
      setError(language === 'bg' ? 'Моля, изберете рейтинг' : 'Please select a rating');
      return;
    }

    if (wouldRecommend === null) {
      setError(language === 'bg' ? 'Моля, отговорете дали препоръчвате' : 'Please answer if you recommend');
      return;
    }

    setLoading(true);
    setError('');

    const reviewData: SubmitReviewData = {
      sellerId,
      buyerId: currentUser.uid,
      carId,
      rating: rating as any,
      title: title.trim(),
      comment: comment.trim(),
      wouldRecommend,
      transactionType: 'inquiry',
      verifiedPurchase: false
    };

    const result = await reviewService.submitReview(reviewData);

    if (result.success) {
      // Reset form
      setRating(0);
      setTitle('');
      setComment('');
      setWouldRecommend(null);
      
      onSuccess?.();
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <FormContainer>
      <FormTitle>
        {language === 'bg' ? 'Напишете отзив' : 'Write a Review'}
      </FormTitle>

      <form onSubmit={handleSubmit}>
        <FormGroup>
          <Label>
            {language === 'bg' ? 'Рейтинг' : 'Rating'}
            <RequiredStar>*</RequiredStar>
          </Label>
          <StarSelector>
            {[1, 2, 3, 4, 5].map(star => (
              <StarButton
                key={star}
                type="button"
                $filled={star <= rating}
                onClick={() => setRating(star)}
              >
                <Star size={32} />
              </StarButton>
            ))}
          </StarSelector>
        </FormGroup>

        <FormGroup>
          <Label>
            {language === 'bg' ? 'Заглавие' : 'Title'}
            <RequiredStar>*</RequiredStar>
          </Label>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={language === 'bg' ? 'Резюме на вашия опит' : 'Summary of your experience'}
            required
            minLength={10}
          />
        </FormGroup>

        <FormGroup>
          <Label>
            {language === 'bg' ? 'Вашият отзив' : 'Your Review'}
            <RequiredStar>*</RequiredStar>
          </Label>
          <TextArea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={language === 'bg' 
              ? 'Споделете вашия опит с този продавач...'
              : 'Share your experience with this seller...'}
            required
            minLength={MIN_LENGTH}
            maxLength={MAX_LENGTH}
          />
          <CharCount $over={comment.length > MAX_LENGTH}>
            {comment.length} / {MAX_LENGTH}
          </CharCount>
        </FormGroup>

        <FormGroup>
          <Label>
            {language === 'bg' ? 'Бихте ли препоръчали този продавач?' : 'Would you recommend this seller?'}
            <RequiredStar>*</RequiredStar>
          </Label>
          <RecommendButtons>
            <RecommendButton
              type="button"
              $type="yes"
              $selected={wouldRecommend === true}
              onClick={() => setWouldRecommend(true)}
            >
              <ThumbsUp size={20} />
              {language === 'bg' ? 'Да, препоръчвам' : 'Yes, Recommend'}
            </RecommendButton>
            <RecommendButton
              type="button"
              $type="no"
              $selected={wouldRecommend === false}
              onClick={() => setWouldRecommend(false)}
            >
              <ThumbsDown size={20} />
              {language === 'bg' ? 'Не, не препоръчвам' : 'No, Not Recommend'}
            </RecommendButton>
          </RecommendButtons>
        </FormGroup>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <SubmitButton type="submit" disabled={loading}>
          <Send size={20} />
          {loading 
            ? (language === 'bg' ? 'Изпращане...' : 'Submitting...') 
            : (language === 'bg' ? 'Публикувай отзив' : 'Submit Review')
          }
        </SubmitButton>
      </form>
    </FormContainer>
  );
};

export default ReviewForm;
