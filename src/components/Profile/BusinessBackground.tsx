import { logger } from '../../services/logger-service';
// src/components/Profile/BusinessBackground.tsx
// Business Profile Background with LED Strip
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Building2 } from 'lucide-react';

// ==================== STYLED COMPONENTS ====================

const BackgroundContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  pointer-events: none;
`;

const BackgroundImage = styled.div<{ $imageUrl: string }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("${props => props.$imageUrl}");
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  filter: blur(4px) brightness(0.5) saturate(0.85);
  opacity: 0;
  animation: fadeIn 1s ease-in forwards;
  
  @keyframes fadeIn {
    to { opacity: 0.5; }
  }
`;

const LEDStrip = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  background: linear-gradient(
    90deg,
    rgba(147, 197, 253, 0.2) 0%,
    rgba(96, 165, 250, 0.5) 15%,
    rgba(59, 130, 246, 0.8) 30%,
    rgba(37, 99, 235, 1) 50%,
    rgba(29, 78, 216, 1) 60%,
    rgba(37, 99, 235, 1) 70%,
    rgba(59, 130, 246, 0.8) 85%,
    rgba(147, 197, 253, 0.2) 100%
  );
  background-size: 200% 100%;
  animation: ledFlow 4s linear  /* ⚡ OPTIMIZED: Removed infinite */;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.6);
  z-index: 9998;
  
  @keyframes ledFlow {
    0% { background-position: 0% 0%; }
    100% { background-position: 200% 0%; }
  }
`;

const LEDStripBottom = styled(LEDStrip)`
  top: auto;
  bottom: 0;
  animation: ledFlowReverse 4s linear  /* ⚡ OPTIMIZED: Removed infinite */;
  
  @keyframes ledFlowReverse {
    0% { background-position: 200% 0%; }
    100% { background-position: 0% 0%; }
  }
`;

const BusinessBadge = styled.div`
  position: fixed;
  top: 80px;
  right: 20px;
  background: linear-gradient(135deg, #1e3a8a, #3b82f6);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(30, 58, 138, 0.4);
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 6px;
  backdrop-filter: blur(10px);
  
  @media (max-width: 768px) {
    display: none;
  }
`;

// ==================== COMPONENT ====================

interface BusinessBackgroundProps {
  isBusinessAccount: boolean;
}

const BusinessBackground: React.FC<BusinessBackgroundProps> = ({
  isBusinessAccount
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Business background images
  const businessImages = [
    '/assets/images/Pic/pexels-boris-dahm-2150922402-31729752.jpg',
    '/assets/images/Pic/pexels-bylukemiller-29566897.jpg',
    '/assets/images/Pic/pexels-bylukemiller-29566898.jpg',
    '/assets/images/Pic/pexels-bylukemiller-29566908 (1).jpg'
  ];

  // Debug log
  useEffect(() => {
    logger.info('🏢 BusinessBackground - isBusinessAccount:', isBusinessAccount);
  }, [isBusinessAccount]);

  // Rotate background images every 10 seconds
  useEffect(() => {
    if (!isBusinessAccount) return;

    const interval = setInterval(() => {
      setCurrentImageIndex(prev =>
        (prev + 1) % businessImages.length
      );
    }, 10000);

    return () => clearInterval(interval);
  }, [isBusinessAccount]);

  if (!isBusinessAccount) {
    logger.info('🏢 BusinessBackground not shown - not a business account');
    return null;
  }

  logger.info('🏢 BusinessBackground rendering with image:', businessImages[currentImageIndex]);

  return (
    <>
      <BackgroundContainer>
        <BackgroundImage
          $imageUrl={businessImages[currentImageIndex]}
          key={currentImageIndex}
        />
      </BackgroundContainer>

      <LEDStrip />
      <LEDStripBottom />

      <BusinessBadge>
        <Building2 size={14} />
        BUSINESS ACCOUNT
      </BusinessBadge>
    </>
  );
};

export default BusinessBackground;

