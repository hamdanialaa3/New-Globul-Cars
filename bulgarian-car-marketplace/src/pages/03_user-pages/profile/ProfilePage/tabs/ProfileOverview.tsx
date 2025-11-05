// ProfilePage/tabs/ProfileOverview.tsx
// Main profile overview tab
// Phase 0 Day 2: Extracted from index.tsx

import React from 'react';
import styled from 'styled-components';
import type { BulgarianUser } from '../../../../../types/user/bulgarian-user.types';
import type { ProfileTheme } from '../../../../../contexts/ProfileTypeContext';
import ProfileDashboard from '../../../../../components/Profile/ProfileDashboard';
import PrivateProfile from '../../../../../components/PrivateProfile';
import DealerProfile from '../../../../../components/DealerProfile';
import CompanyProfile from '../../../../../components/CompanyProfile';
import type { ProfileCar } from '../types';

interface ProfileOverviewProps {
  user: BulgarianUser | null;
  userCars: ProfileCar[];
  theme: ProfileTheme;
  isOwnProfile: boolean;
  onEditClick?: () => void;
}

const OverviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const ProfileOverview: React.FC<ProfileOverviewProps> = ({
  user,
  userCars,
  theme,
  isOwnProfile,
  onEditClick
}) => {
  if (!user) {
    return (
      <OverviewContainer>
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
          جاري التحميل...
        </div>
      </OverviewContainer>
    );
  }

  // Show ProfileDashboard only for own profile
  const showDashboard = isOwnProfile;

  // Render profile based on type
  const renderProfile = () => {
    switch (user.profileType) {
      case 'dealer':
        return (
          <DealerProfile 
            user={user} 
            userCars={userCars} 
            isOwner={isOwnProfile}
          />
        );
      case 'company':
        return (
          <CompanyProfile 
            user={user} 
            userCars={userCars} 
            isOwner={isOwnProfile}
          />
        );
      case 'private':
      default:
        return (
          <PrivateProfile 
            user={user} 
            userCars={userCars} 
            isOwner={isOwnProfile}
          />
        );
    }
  };

  return (
    <OverviewContainer>
      {showDashboard && <ProfileDashboard user={user} />}
      {renderProfile()}
    </OverviewContainer>
  );
};

export default ProfileOverview;

