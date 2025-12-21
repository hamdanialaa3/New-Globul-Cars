// src/components/Reviews/ReviewCard.tsx
// Review Card Component - كارت عرض مراجعة واحدة
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import React, { useState } from 'react';
import styled from 'styled-components';
import { ThumbsUp, ThumbsDown, Shield, MessageSquare } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import type { Review } from '../../services/reviews';
import RatingDisplay from './RatingDisplay';

// ==================== STYLED COMPONENTS ====================

const CardContainer = styled.div`
  padding: 20px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Avatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF7900, #ff8c1a);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.25rem;
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const UserName = styled.div`
  font-weight: 600;
  color: #333;
  font-size: 1rem;
`;

const ReviewDate = styled.div`
  font-size: 0.75rem;
  color: #999;
`;

const BadgeContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const Badge = styled.div<{ $color: string }>`
  padding: 4px 10px;
  border-radius: 12px;
  background: ${props => props.$color}20;
  color: ${props => props.$color};
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ReviewTitle = styled.h4`
  margin: 0 0 12px 0;
  font-size: 1.1rem;
  color: #333;
  font-weight: 600;
`;

const ReviewText = styled.p`
  margin: 0 0 16px 0;
  color: #666;
  line-height: 1.6;
  font-size: 0.95rem;
`;

const ProsCons = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin: 16px 0;
`;

const List = styled.div`
  h5 {
    margin: 0 0 8px 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: #333;
  }
  
  ul {
    margin: 0;
    padding-left: 20px;
    
    li {
      font-size: 0.875rem;
      color: #666;
      margin-bottom: 4px;
    }
  }
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const ActionButton = styled.button<{ $active?: boolean }>`
  padding: 8px 16px;
  border: 1px solid ${props => props.$active ? '#FF7900' : '#e0e0e0'};
  border-radius: 8px;
  background: ${props => props.$active ? '#fff5e6' : 'white'};
  color: ${props => props.$active ? '#FF7900' : '#666'};
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #FF7900;
    background: #fff5e6;
    color: #FF7900;
  }
`;

const RecommendBadge = styled.div<{ $recommend: boolean }>`
  padding: 8px 16px;
  border-radius: 8px;
  background: ${props => props.$recommend ? '#e8f5e9' : '#ffebee'};
  color: ${props => props.$recommend ? '#4caf50' : '#f44336'};
  font-size: 0.875rem;
  font-weight: 600;
`;

// ==================== COMPONENT ====================

interface ReviewCardProps {
  review: Review;
  onHelpful?: (reviewId: string, helpful: boolean) => void;
  showResponse?: boolean;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onHelpful,
  showResponse = true
}) => {
  const { language } = useLanguage();
  const [markedHelpful, setMarkedHelpful] = useState<boolean | null>(null);

  const handleHelpful = (helpful: boolean) => {
    if (markedHelpful === null) {
      setMarkedHelpful(helpful);
      onHelpful?.(review.id!, helpful);
    }
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat(language === 'bg' ? 'bg-BG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const getInitials = (name: string): string => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <CardContainer>
      <CardHeader>
        <UserInfo>
          <Avatar>{getInitials('User Name')}</Avatar>
          <UserDetails>
            <UserName>
              {language === 'bg' ? 'Потребител' : 'User'}
              {review.verifiedPurchase && (
                <Badge $color="#4caf50" style={{ marginLeft: '8px', display: 'inline-flex' }}>
                  <Shield size={12} />
                  {language === 'bg' ? 'Потвърдена покупка' : 'Verified Purchase'}
                </Badge>
              )}
            </UserName>
            <ReviewDate>{formatDate(review.createdAt)}</ReviewDate>
          </UserDetails>
        </UserInfo>

        <RatingDisplay rating={review.rating} showNumber={false} />
      </CardHeader>

      <ReviewTitle>{review.title}</ReviewTitle>
      <ReviewText>{review.comment}</ReviewText>

      {(review.pros && review.pros.length > 0) || (review.cons && review.cons.length > 0) && (
        <ProsCons>
          {review.pros && review.pros.length > 0 && (
            <List>
              <h5 style={{ color: '#4caf50' }}>
                ✓ {language === 'bg' ? 'Плюсове' : 'Pros'}
              </h5>
              <ul>
                {review.pros.map((pro, index) => (
                  <li key={index}>{pro}</li>
                ))}
              </ul>
            </List>
          )}

          {review.cons && review.cons.length > 0 && (
            <List>
              <h5 style={{ color: '#f44336' }}>
                ✗ {language === 'bg' ? 'Минуси' : 'Cons'}
              </h5>
              <ul>
                {review.cons.map((con, index) => (
                  <li key={index}>{con}</li>
                ))}
              </ul>
            </List>
          )}
        </ProsCons>
      )}

      <CardFooter>
        <ActionButtons>
          <ActionButton 
            onClick={() => handleHelpful(true)}
            $active={markedHelpful === true}
          >
            <ThumbsUp size={16} />
            {language === 'bg' ? 'Полезно' : 'Helpful'} ({review.helpful})
          </ActionButton>
          <ActionButton 
            onClick={() => handleHelpful(false)}
            $active={markedHelpful === false}
          >
            <ThumbsDown size={16} />
            ({review.notHelpful})
          </ActionButton>
        </ActionButtons>

        <RecommendBadge $recommend={review.wouldRecommend}>
          {review.wouldRecommend
            ? (language === 'bg' ? '👍 Препоръчвам' : '👍 Recommend')
            : (language === 'bg' ? '👎 Не препоръчвам' : '👎 Not Recommend')
          }
        </RecommendBadge>
      </CardFooter>

      {showResponse && review.response && (
        <div style={{
          marginTop: '16px',
          padding: '16px',
          background: '#f9f9f9',
          borderRadius: '8px',
          borderLeft: '4px solid #FF7900'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <MessageSquare size={16} color="#FF7900" />
            <strong style={{ color: '#FF7900' }}>
              {language === 'bg' ? 'Отговор от продавача' : 'Seller Response'}
            </strong>
          </div>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#666' }}>
            {review.response.text}
          </p>
        </div>
      )}
    </CardContainer>
  );
};

export default ReviewCard;
