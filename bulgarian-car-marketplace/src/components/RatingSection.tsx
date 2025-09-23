// src/components/RatingSection.tsx
// Complete rating section component for Bulgarian Car Marketplace

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from '../hooks/useTranslation';
import { bulgarianRatingService, RatingSummary } from '../services/rating-service';
import RatingDisplay from './RatingDisplay';
import RatingList from './RatingList';
import AddRatingForm from './AddRatingForm';

interface RatingSectionProps {
  carId: string;
  currentUserId?: string;
  currentUserName?: string;
  currentUserAvatar?: string;
  className?: string;
}

const SectionContainer = styled.div`
  margin-top: 48px;
  padding-top: 32px;
  border-top: 2px solid ${({ theme }) => theme.colors.grey[200]};
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 24px;
  }
`;

const RatingOverview = styled.div`
  flex: 1;
  max-width: 400px;
`;

const ActionsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 200px;
`;

const AddReviewButton = styled.button`
  background: ${({ theme }) => theme.colors.primary.main};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primary.dark};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ReviewStats = styled.div`
  background: ${({ theme }) => theme.colors.grey[50]};
  padding: 16px;
  border-radius: 8px;
  text-align: center;
`;

const StatsNumber = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary.main};
`;

const StatsLabel = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 4px;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: 4px;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${({ theme }) => theme.colors.grey[100]};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const RatingSection: React.FC<RatingSectionProps> = ({
  carId,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  className
}) => {
  const { t } = useTranslation();
  const [summary, setSummary] = useState<RatingSummary | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);

  useEffect(() => {
    // Load rating summary
    const loadSummary = async () => {
      try {
        const ratingSummary = await bulgarianRatingService.getRatingSummary(carId);
        setSummary(ratingSummary);
      } catch (error) {
        console.error('Error loading rating summary:', error);
      }
    };

    loadSummary();
  }, [carId]);

  useEffect(() => {
    // Check if user has already reviewed this car
    const checkUserReview = async () => {
      if (!currentUserId) return;

      try {
        const userRatings = await bulgarianRatingService.getUserRatings(currentUserId);
        const hasReviewed = userRatings.some((rating: any) => rating.carId === carId);
        setUserHasReviewed(hasReviewed);
      } catch (error) {
        console.error('Error checking user review:', error);
      }
    };

    checkUserReview();
  }, [currentUserId, carId]);

  const handleAddReview = () => {
    setShowAddForm(true);
  };

  const handleReviewAdded = async () => {
    setShowAddForm(false);
    setUserHasReviewed(true);
    
    // Reload rating summary after adding new review
    try {
      const ratingSummary = await bulgarianRatingService.getRatingSummary(carId);
      setSummary(ratingSummary);
    } catch (error) {
      console.error('Error reloading rating summary:', error);
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
  };

  return (
    <SectionContainer className={className}>
      <SectionHeader>
        <RatingOverview>
          <RatingDisplay
            summary={summary}
            size="large"
            showDetails={true}
          />
        </RatingOverview>

        <ActionsSection>
          {currentUserId && !userHasReviewed && (
            <AddReviewButton onClick={handleAddReview}>
              {t('ratings.writeReview')}
            </AddReviewButton>
          )}

          {userHasReviewed && (
            <ReviewStats>
              <StatsNumber>✓</StatsNumber>
              <StatsLabel>{t('ratings.youReviewed')}</StatsLabel>
            </ReviewStats>
          )}

          {summary && (
            <ReviewStats>
              <StatsNumber>{summary.totalRatings}</StatsNumber>
              <StatsLabel>{t('ratings.totalReviews')}</StatsLabel>
            </ReviewStats>
          )}
        </ActionsSection>
      </SectionHeader>

      <RatingList carId={carId} />

      {showAddForm && (
        <Modal>
          <ModalContent>
            <CloseButton onClick={handleCancel}>×</CloseButton>
            <AddRatingForm
              carId={carId}
              userId={currentUserId || ''}
              userName={currentUserName || t('ratings.anonymous')}
              userAvatar={currentUserAvatar}
              onRatingAdded={handleReviewAdded}
              onCancel={handleCancel}
            />
          </ModalContent>
        </Modal>
      )}
    </SectionContainer>
  );
};

export default RatingSection;