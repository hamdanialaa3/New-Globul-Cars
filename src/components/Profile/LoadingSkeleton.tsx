// src/components/Profile/LoadingSkeleton.tsx
// Loading Skeleton Component - مكون الهيكل التحميلي
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import React from 'react';
import styled, { keyframes } from 'styled-components';

// ==================== STYLED COMPONENTS ====================

const skeletonPulse = keyframes`
  0%, 100% {
    background-color: rgba(139, 92, 246, 0.03);
    opacity: 0.6;
  }
  50% {
    background-color: rgba(139, 92, 246, 0.08);
    opacity: 1;
  }
`;

const SkeletonContainer = styled.div`
  width: 100%;
  padding: 20px;
`;

const SkeletonCover = styled.div`
  width: 100%;
  height: 300px;
  border-radius: 16px;
  background-color: rgba(139, 92, 246, 0.03);
  animation: ${skeletonPulse} 1.5s ease-in-out infinite;
  margin-bottom: 60px;
  
  @media (prefers-reduced-motion: reduce) {
    animation: none;
    background-color: rgba(139, 92, 246, 0.05);
  }
`;

const SkeletonProfile = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background-color: rgba(139, 92, 246, 0.03);
  animation: ${skeletonPulse} 1.5s ease-in-out infinite;
  margin: -80px auto 20px;
  
  @media (prefers-reduced-motion: reduce) {
    animation: none;
    background-color: rgba(139, 92, 246, 0.05);
  }
`;

const SkeletonText = styled.div<{ $width?: string; $height?: string }>`
  width: ${props => props.$width || '100%'};
  height: ${props => props.$height || '20px'};
  border-radius: 8px;
  background-color: rgba(139, 92, 246, 0.03);
  animation: ${skeletonPulse} 1.5s ease-in-out infinite;
  margin: 8px 0;
  
  @media (prefers-reduced-motion: reduce) {
    animation: none;
    background-color: rgba(139, 92, 246, 0.05);
  }
`;

const SkeletonCard = styled.div`
  width: 100%;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const SkeletonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-top: 16px;
`;

const SkeletonGridItem = styled.div`
  aspect-ratio: 1;
  border-radius: 12px;
  background-color: rgba(139, 92, 246, 0.03);
  animation: ${skeletonPulse} 1.5s ease-in-out infinite;
  
  @media (prefers-reduced-motion: reduce) {
    animation: none;
    background-color: rgba(139, 92, 246, 0.05);
  }
`;

// ==================== COMPONENT ====================

interface LoadingSkeletonProps {
  type?: 'profile' | 'gallery' | 'stats' | 'full';
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  type = 'full' 
}) => {
  if (type === 'profile') {
    return (
      <SkeletonContainer>
        <SkeletonProfile />
        <SkeletonText $width="60%" $height="24px" style={{ margin: '0 auto' }} />
        <SkeletonText $width="40%" $height="16px" style={{ margin: '8px auto' }} />
      </SkeletonContainer>
    );
  }

  if (type === 'gallery') {
    return (
      <SkeletonCard>
        <SkeletonText $width="30%" $height="24px" />
        <SkeletonGrid>
          {[...Array(6)].map((_, i) => (
            <SkeletonGridItem key={i} />
          ))}
        </SkeletonGrid>
      </SkeletonCard>
    );
  }

  if (type === 'stats') {
    return (
      <SkeletonCard>
        <SkeletonGrid>
          {[...Array(6)].map((_, i) => (
            <div key={i}>
              <SkeletonText $width="80%" $height="40px" />
              <SkeletonText $width="60%" $height="16px" />
            </div>
          ))}
        </SkeletonGrid>
      </SkeletonCard>
    );
  }

  // Full profile skeleton
  return (
    <SkeletonContainer>
      <SkeletonCover />
      <SkeletonProfile />
      <SkeletonText $width="60%" $height="24px" style={{ margin: '0 auto 20px' }} />
      
      <SkeletonCard>
        <SkeletonText $width="40%" $height="20px" />
        <SkeletonText $width="100%" />
        <SkeletonText $width="80%" />
        <SkeletonText $width="90%" />
      </SkeletonCard>
      
      <SkeletonCard>
        <SkeletonGrid>
          {[...Array(6)].map((_, i) => (
            <SkeletonGridItem key={i} />
          ))}
        </SkeletonGrid>
      </SkeletonCard>
    </SkeletonContainer>
  );
};

export default LoadingSkeleton;

