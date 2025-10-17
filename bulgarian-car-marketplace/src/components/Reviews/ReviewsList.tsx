/**
 * Reviews List Component
 * Displays list of reviews for a seller
 * Location: Bulgaria | Languages: BG, EN | Currency: EUR
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../contexts/LanguageContext';
import reviewsService, { Review } from '../../services/reviews/reviews.service';
import { Star, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { bg } from 'date-fns/locale/bg';
import { enUS } from 'date-fns/locale/en-US';

const Container = styled.div`
  width: 100%;
`;

const ReviewCard = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  transition: all 0.2s;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
`;

const ReviewHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const Avatar = styled.div<{ $imageUrl?: string }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${props => props.$imageUrl 
    ? `url(${props.$imageUrl}) center/cover` 
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  };
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 16px;
`;

const ReviewerInfo = styled.div`
  flex: 1;
`;

const ReviewerName = styled.div`
  font-weight: 600;
  font-size: 15px;
  color: #1a1a1a;
  margin-bottom: 4px;
`;

const ReviewDate = styled.div`
  font-size: 13px;
  color: #666;
`;

const StarsContainer = styled.div`
  display: flex;
  gap: 4px;
`;

const ReviewContent = styled.p`
  margin: 0;
  font-size: 15px;
  line-height: 1.6;
  color: #333;
`;

const VerifiedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #4CAF50;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  margin-left: 8px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #666;
  
  h3 {
    margin: 0 0 8px;
    color: #1a1a1a;
  }
  
  p {
    margin: 0;
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #666;
`;

interface ReviewsListProps {
  sellerId: string;
}

const ReviewsList: React.FC<ReviewsListProps> = ({ sellerId }) => {
  const { language } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, [sellerId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const sellerReviews = await reviewsService.getSellerReviews(sellerId, 20);
      setReviews(sellerReviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={16}
          fill={i <= rating ? '#FFB800' : 'none'}
          color={i <= rating ? '#FFB800' : '#ccc'}
        />
      );
    }
    return <StarsContainer>{stars}</StarsContainer>;
  };

  const formatTime = (timestamp: any): string => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const locale = language === 'bg' ? bg : enUS;
    return formatDistanceToNow(date, { addSuffix: true, locale });
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  if (loading) {
    return (
      <Container>
        <LoadingState>
          {language === 'bg' ? 'Зареждане на отзиви...' : 'Loading reviews...'}
        </LoadingState>
      </Container>
    );
  }

  if (reviews.length === 0) {
    return (
      <Container>
        <EmptyState>
          <h3>
            {language === 'bg' ? 'Няма отзиви' : 'No reviews yet'}
          </h3>
          <p>
            {language === 'bg'
              ? 'Този продавач все още няма отзиви'
              : 'This seller has no reviews yet'
            }
          </p>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      {reviews.map((review) => (
        <ReviewCard key={review.id}>
          <ReviewHeader>
            <Avatar $imageUrl={review.reviewerPhoto}>
              {!review.reviewerPhoto && getInitials(review.reviewerName)}
            </Avatar>
            
            <ReviewerInfo>
              <ReviewerName>
                {review.reviewerName}
                {review.verified && (
                  <VerifiedBadge>
                    {language === 'bg' ? 'Проверен' : 'Verified'}
                  </VerifiedBadge>
                )}
              </ReviewerName>
              <ReviewDate>{formatTime(review.createdAt)}</ReviewDate>
            </ReviewerInfo>
            
            {renderStars(review.rating)}
          </ReviewHeader>
          
          <ReviewContent>{review.comment}</ReviewContent>
        </ReviewCard>
      ))}
    </Container>
  );
};

export default ReviewsList;
