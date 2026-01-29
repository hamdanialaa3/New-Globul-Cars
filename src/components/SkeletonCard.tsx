/**
 * SkeletonCard Component
 * Loading placeholder that mimics the car card layout
 * 
 * Features:
 * - Matches CarCard dimensions
 * - Smooth shimmer animation
 * - Accessible (aria-label)
 * - Lightweight (no dependencies)
 * 
 * ✅ UX ENHANCEMENT: Better loading experience than spinners
 * 
 * @architecture UI Components / Loading States
 */

import React from 'react';
import styled, { keyframes } from 'styled-components';

// ============================================================================
// ANIMATIONS
// ============================================================================

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const SkeletonCardContainer = styled.div`
  width: 100%;
  max-width: 360px;
  border-radius: 12px;
  overflow: hidden;
  background-color: var(--bg-card, #ffffff);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease;

  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const SkeletonImage = styled.div`
  width: 100%;
  height: 200px;
  background: linear-gradient(
    90deg,
    #f0f0f0 0%,
    #f8f8f8 50%,
    #f0f0f0 100%
  );
  background-size: 1000px 100%;
  animation: ${shimmer} 2s infinite linear;
`;

const SkeletonContent = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SkeletonTitle = styled.div`
  width: 80%;
  height: 20px;
  border-radius: 4px;
  background: linear-gradient(
    90deg,
    #e0e0e0 0%,
    #f0f0f0 50%,
    #e0e0e0 100%
  );
  background-size: 1000px 100%;
  animation: ${shimmer} 2s infinite linear;
`;

const SkeletonPrice = styled.div`
  width: 40%;
  height: 24px;
  border-radius: 4px;
  background: linear-gradient(
    90deg,
    #d0d0d0 0%,
    #e0e0e0 50%,
    #d0d0d0 100%
  );
  background-size: 1000px 100%;
  animation: ${shimmer} 2s infinite linear;
`;

const SkeletonDetails = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 8px;
`;

const SkeletonBadge = styled.div`
  width: 60px;
  height: 18px;
  border-radius: 12px;
  background: linear-gradient(
    90deg,
    #e8e8e8 0%,
    #f4f4f4 50%,
    #e8e8e8 100%
  );
  background-size: 1000px 100%;
  animation: ${shimmer} 2s infinite linear;
`;

const SkeletonFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
`;

const SkeletonLocation = styled.div`
  width: 50px;
  height: 14px;
  border-radius: 4px;
  background: linear-gradient(
    90deg,
    #e8e8e8 0%,
    #f4f4f4 50%,
    #e8e8e8 100%
  );
  background-size: 1000px 100%;
  animation: ${shimmer} 2s infinite linear;
`;

const SkeletonDate = styled.div`
  width: 70px;
  height: 14px;
  border-radius: 4px;
  background: linear-gradient(
    90deg,
    #e8e8e8 0%,
    #f4f4f4 50%,
    #e8e8e8 100%
  );
  background-size: 1000px 100%;
  animation: ${shimmer} 2s infinite linear;
`;

// ============================================================================
// COMPONENT
// ============================================================================

interface SkeletonCardProps {
  className?: string;
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({ className }) => {
  return (
    <SkeletonCardContainer
      className={className}
      role="status"
      aria-label="Loading car details..."
    >
      <SkeletonImage />
      <SkeletonContent>
        <SkeletonTitle />
        <SkeletonPrice />
        <SkeletonDetails>
          <SkeletonBadge />
          <SkeletonBadge />
          <SkeletonBadge />
        </SkeletonDetails>
        <SkeletonFooter>
          <SkeletonLocation />
          <SkeletonDate />
        </SkeletonFooter>
      </SkeletonContent>
    </SkeletonCardContainer>
  );
};

export default React.memo(SkeletonCard);

// ============================================================================
// SKELETON GRID (for multiple cards)
// ============================================================================

const SkeletonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  padding: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 16px;
  }
`;

interface SkeletonCardsGridProps {
  count?: number;
  className?: string;
}

export const SkeletonCardsGrid: React.FC<SkeletonCardsGridProps> = ({
  count = 6,
  className
}) => {
  return (
    <SkeletonGrid className={className}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={`skeleton-${index}`} />
      ))}
    </SkeletonGrid>
  );
};
