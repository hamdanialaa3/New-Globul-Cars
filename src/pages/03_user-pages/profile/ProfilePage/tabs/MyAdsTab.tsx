// ProfilePage/tabs/MyAdsTab.tsx
// My Ads tab - shows user's car listings
// Phase 0 Day 2: Extracted from index.tsx

import React from 'react';
import styled from 'styled-components';
import { GarageSection } from '../../../../../components/Profile';
import type { ProfileCar } from '../types';
import type { ProfileTheme } from '../../../../../contexts/ProfileTypeContext';

interface MyAdsTabProps {
  userCars: ProfileCar[];
  theme: ProfileTheme;
  isOwnProfile: boolean;
}

const FullWidthContent = styled.div`
  width: 100%;
  max-width: none;
  margin: 0 -20px;
  padding: 0;
  
  @media (max-width: 768px) {
    margin: 0 -12px;
  }
`;

export const MyAdsTab: React.FC<MyAdsTabProps> = ({ userCars, theme, isOwnProfile }) => {
  return (
    <FullWidthContent>
      <GarageSection 
        cars={userCars}
        isOwnGarage={isOwnProfile}
        themeColor={theme.colors.primary.main}
      />
    </FullWidthContent>
  );
};

export default MyAdsTab;

