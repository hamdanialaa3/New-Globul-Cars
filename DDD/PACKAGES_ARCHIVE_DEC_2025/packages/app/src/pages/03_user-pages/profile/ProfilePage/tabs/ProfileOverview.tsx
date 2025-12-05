// ProfilePage/tabs/ProfileOverview.tsx
// Main profile overview tab
// Phase 0 Day 2: Extracted from index.tsx

import React from 'react';
import { useOutletContext } from 'react-router-dom';
import styled from 'styled-components';
import type { BulgarianUser } from '@globul-cars/coreuser/bulgarian-user.types';
import type { ProfileTheme } from '@globul-cars/coreProfileTypeContext';
import ProfileDashboard from '@globul-cars/uiProfile/ProfileDashboard';
import PrivateProfile from '@globul-cars/uiPrivateProfile';
import DealerProfile from '@globul-cars/uiDealerProfile';
import CompanyProfile from '@globul-cars/uiCompanyProfile';
import { PublicProfileView } from './PublicProfileView';
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

export const ProfileOverview: React.FC<ProfileOverviewProps> = (props) => {
  const outletContext = useOutletContext<any>();
  const { user, userCars, theme, isOwnProfile } = props.user ? props : outletContext;
  const { onEditClick } = props;
  if (!user) {
    return (
      <OverviewContainer>
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
          جاري التحميل...
        </div>
      </OverviewContainer>
    );
  }

  // If viewing another user's profile, show PublicProfileView
  if (!isOwnProfile) {
    return (
      <OverviewContainer>
        <PublicProfileView user={user} />
      </OverviewContainer>
    );
  }

  // Show ProfileDashboard only for own profile
  const showDashboard = isOwnProfile;

  // Render profile based on type (for own profile)
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

