import { logger } from '../../services/logger-service';
// src/components/Profile/BusinessBackground.tsx
// Business Profile Background with LED Strip
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Building2 } from 'lucide-react';

type ProfileVisualType = 'private' | 'dealer' | 'company';

const VISUAL_THEME: Record<ProfileVisualType, {
  rgb: string;
  start: string;
  mid: string;
  end: string;
  badge: string;
  label: string;
}> = {
  private: {
    rgb: '255, 122, 45',
    start: '#ff9f2a',
    mid: '#ff7a2d',
    end: '#e5631a',
    badge: 'linear-gradient(135deg, #ff9f2a 0%, #ff7a2d 55%, #e5631a 100%)',
    label: 'PERSONAL SELLER',
  },
  dealer: {
    rgb: '34, 197, 94',
    start: '#4ade80',
    mid: '#22c55e',
    end: '#15803d',
    badge: 'linear-gradient(135deg, #22c55e 0%, #16a34a 55%, #15803d 100%)',
    label: 'DEALER SELLER',
  },
  company: {
    rgb: '59, 130, 246',
    start: '#60a5fa',
    mid: '#3b82f6',
    end: '#1d4ed8',
    badge: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 55%, #1d4ed8 100%)',
    label: 'COMPANY SELLER',
  },
};

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

const BackgroundImage = styled.div<{ $imageUrl: string; $profileType: ProfileVisualType }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("${props => props.$imageUrl}");
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  filter: ${props => props.$profileType === 'private'
    ? 'blur(3px) brightness(0.6) saturate(0.95)'
    : 'blur(4px) brightness(0.5) saturate(0.9)'};
  opacity: 0;
  animation: fadeIn 1s ease-in forwards;
  
  @keyframes fadeIn {
    to { opacity: 0.5; }
  }
`;

const LEDStrip = styled.div<{ $profileType: ProfileVisualType }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  background: linear-gradient(
    90deg,
    ${props => `${VISUAL_THEME[props.$profileType].start}33`} 0%,
    ${props => `${VISUAL_THEME[props.$profileType].start}80`} 15%,
    ${props => `${VISUAL_THEME[props.$profileType].mid}cc`} 30%,
    ${props => VISUAL_THEME[props.$profileType].mid} 50%,
    ${props => VISUAL_THEME[props.$profileType].end} 60%,
    ${props => VISUAL_THEME[props.$profileType].mid} 70%,
    ${props => `${VISUAL_THEME[props.$profileType].start}cc`} 85%,
    ${props => `${VISUAL_THEME[props.$profileType].start}33`} 100%
  );
  background-size: 200% 100%;
  animation: ledFlow 4s linear  /* ⚡ OPTIMIZED: Removed infinite */;
  box-shadow: ${props => `0 4px 20px rgba(${VISUAL_THEME[props.$profileType].rgb}, 0.55)`};
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

const BusinessBadge = styled.div<{ $profileType: ProfileVisualType }>`
  position: fixed;
  top: 80px;
  right: 20px;
  background: ${props => VISUAL_THEME[props.$profileType].badge};
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  box-shadow: ${props => `0 4px 12px rgba(${VISUAL_THEME[props.$profileType].rgb}, 0.45)`};
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
  profileType?: ProfileVisualType;
}

const BusinessBackground: React.FC<BusinessBackgroundProps> = ({
  isBusinessAccount,
  profileType = 'private',
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const themedImages: Record<ProfileVisualType, string[]> = {
    private: [
      '/assets/images/profile-backgrounds/private-bg.png',
      '/assets/images/1920x1080.webp',
    ],
    dealer: [
      '/assets/images/profile-backgrounds/dealer-bg.png',
      '/assets/images/1920x1080.webp',
    ],
    company: [
      '/assets/images/profile-backgrounds/company-bg.png',
      '/assets/images/1920x1080.webp',
    ],
  };
  const activeImages = themedImages[profileType];

  // Debug log
  useEffect(() => {
    logger.info('Profile background rendering state', { isBusinessAccount, profileType });
  }, [isBusinessAccount, profileType]);

  // Rotate background images every 10 seconds
  useEffect(() => {
    if (!isBusinessAccount) return;

    const interval = setInterval(() => {
      setCurrentImageIndex(prev =>
        (prev + 1) % activeImages.length
      );
    }, 10000);

    return () => clearInterval(interval);
  }, [isBusinessAccount, activeImages.length]);

  if (!isBusinessAccount) {
    logger.info('🏢 BusinessBackground not shown - not a business account');
    return null;
  }

  logger.info('Profile background image selected', { image: activeImages[currentImageIndex], profileType });

  return (
    <>
      <BackgroundContainer>
        <BackgroundImage
          $imageUrl={activeImages[currentImageIndex]}
          $profileType={profileType}
          key={currentImageIndex}
        />
      </BackgroundContainer>

      <LEDStrip $profileType={profileType} />
      <LEDStripBottom $profileType={profileType} />

      <BusinessBadge $profileType={profileType}>
        <Building2 size={14} />
        {VISUAL_THEME[profileType].label}
      </BusinessBadge>
    </>
  );
};

export default BusinessBackground;

