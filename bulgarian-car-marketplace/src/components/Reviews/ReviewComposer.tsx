/**
 * Review Composer Component
 * Allows users to write and submit reviews
 * Location: Bulgaria | Languages: BG, EN | Currency: EUR
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthProvider';
import { reviewService as reviewsService } from '../../services/reviews/review-service';
import RatingStars from './RatingStars';
import { MessageCircle } from 'lucide-react';

const Container = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
`;

const Title = styled.h3`
  margin: 0 0 20px;
  font-size: 18px;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #FF7900;
  }
  
  &::placeholder {
    color: #999;
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #FF7900 0%, #FF6600 100%);
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 121, 0, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  background: #ffebee;
  color: #c62828;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
`;

const SuccessMessage = styled.div`
  background: #e8f5e9;
  color: #2e7d32;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
`;

interface ReviewComposerProps {
  carId: string;
  sellerId: string;
  onReviewSubmitted?: () => void;
}

const ReviewComposer: React.FC<ReviewComposerProps> = ({
  carId,
  sellerId,
  onReviewSubmitted
}) => {
  const { language } = useLanguage();
  const { currentUser } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError(language === 'bg' 
        ? 'Трябва да влезете, за да оставите отзив' 
        : 'You must be signed in to leave a review'
      );
      return;
    }

    if (rating === 0) {
      setError(language === 'bg' 
        ? 'Моля, изберете оценка' 
        : 'Please select a rating'
      );
      return;
    }

    if (!comment.trim()) {
      setError(language === 'bg' 
        ? 'Моля, напишете коментар' 
        : 'Please write a comment'
      );
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await reviewsService.createReview(
        carId,
        sellerId,
        currentUser.uid,
        rating,
        comment
      );

      setSuccess(true);
      setRating(0);
      setComment('');

      if (onReviewSubmitted) {
        onReviewSubmitted();
      }

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);

    } catch (error: any) {
      console.error('Error submitting review:', error);
      setError(error.message || (language === 'bg' 
        ? 'Грешка при изпращане на отзив' 
        : 'Error submitting review'
      ));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container>
      <Title>
        <MessageCircle size={20} />
        {language === 'bg' ? 'Напишете отзив' : 'Write a Review'}
      </Title>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && (
        <SuccessMessage>
          {language === 'bg' 
            ? 'Благодарим ви за отзива!' 
            : 'Thank you for your review!'
          }
        </SuccessMessage>
      )}

      <form onSubmit={handleSubmit}>
        <FormGroup>
          <Label>
            {language === 'bg' ? 'Вашата оценка' : 'Your Rating'}
          </Label>
          <RatingStars
            rating={rating}
            size={28}
            interactive={true}
            onChange={setRating}
          />
        </FormGroup>

        <FormGroup>
          <Label>
            {language === 'bg' ? 'Вашият коментар' : 'Your Comment'}
          </Label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={language === 'bg'
              ? 'Споделете вашето мнение за този продавач...'
              : 'Share your experience with this seller...'
            }
            maxLength={500}
            disabled={submitting}
          />
        </FormGroup>

        <SubmitButton type="submit" disabled={submitting || rating === 0}>
          {submitting 
            ? (language === 'bg' ? 'Изпращане...' : 'Submitting...') 
            : (language === 'bg' ? 'Изпратете отзив' : 'Submit Review')
          }
        </SubmitButton>
      </form>
    </Container>
  );
};

export default ReviewComposer;

