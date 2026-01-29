import React from 'react';
import { useLanguage } from '../../../../../contexts/LanguageContext';
import { Star, ThumbsUp } from 'lucide-react';
import * as S from '../styles/public-profile.styles';
import styled from 'styled-components';

interface Review {
    id: string;
    reviewerName: string;
    rating: number;
    comment: string;
    createdAt: any;
}

interface ReviewsSectionProps {
    reviews: Review[];
    profileType: 'company' | 'dealer' | 'personal';
    averageRating: number;
    totalReviews: number;
}

const ReviewCard = styled.div`
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;

  &:last-child {
    border-bottom: none;
  }
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const ReviewerName = styled.div`
  font-weight: 600;
  color: #111827;
`;

const ReviewDate = styled.div`
  font-size: 0.875rem;
  color: #9ca3af;
`;

const RatingStars = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
`;

const ReviewComment = styled.p`
  color: #374151;
  line-height: 1.6;
  font-size: 0.95rem;
`;

const RatingOverview = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const RatingNumber = styled.div`
  font-size: 3rem;
  font-weight: 700;
  color: #111827;
`;

const RatingDetails = styled.div`
  flex: 1;
`;

const RatingText = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 4px;
`;

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
    reviews,
    profileType,
    averageRating,
    totalReviews,
}) => {
    const { language } = useLanguage();

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                size={16}
                fill={i < rating ? '#fbbf24' : 'none'}
                stroke={i < rating ? '#fbbf24' : '#d1d5db'}
            />
        ));
    };

    const formatDate = (date: any) => {
        if (!date) return '';
        const d = date.toDate ? date.toDate() : new Date(date);
        return d.toLocaleDateString(language === 'bg' ? 'bg-BG' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <S.SectionCard $profileType={profileType}>
            <S.SectionTitle>
                <ThumbsUp size={20} />
                {language === 'bg' ? 'Отзиви' : 'Reviews'}
            </S.SectionTitle>

            <S.SectionContent>
                {totalReviews > 0 ? (
                    <>
                        <RatingOverview>
                            <RatingNumber>{averageRating.toFixed(1)}</RatingNumber>
                            <RatingDetails>
                                <RatingStars>{renderStars(Math.round(averageRating))}</RatingStars>
                                <RatingText>
                                    {language === 'bg'
                                        ? `Базирано на ${totalReviews} отзива`
                                        : `Based on ${totalReviews} reviews`}
                                </RatingText>
                            </RatingDetails>
                        </RatingOverview>

                        {reviews.slice(0, 5).map((review) => (
                            <ReviewCard key={review.id}>
                                <ReviewHeader>
                                    <ReviewerName>{review.reviewerName}</ReviewerName>
                                    <ReviewDate>{formatDate(review.createdAt)}</ReviewDate>
                                </ReviewHeader>
                                <RatingStars>{renderStars(review.rating)}</RatingStars>
                                <ReviewComment>{review.comment}</ReviewComment>
                            </ReviewCard>
                        ))}
                    </>
                ) : (
                    <p style={{ textAlign: 'center', color: '#9ca3af', padding: '40px 0' }}>
                        {language === 'bg'
                            ? 'Все още няма отзиви'
                            : 'No reviews yet'}
                    </p>
                )}
            </S.SectionContent>
        </S.SectionCard>
    );
};
