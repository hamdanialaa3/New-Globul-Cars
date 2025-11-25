// ProfilePage/tabs/ProfileOverview.tsx
// Main profile overview tab
// Phase 0 Day 2: Extracted from index.tsx

import React from 'react';
import { useOutletContext } from 'react-router-dom';
import styled from 'styled-components';
import type { BulgarianUser } from '@/types/user/bulgarian-user.types';
import type { ProfileTheme } from '@/contexts/ProfileTypeContext';
import ProfileDashboard from '@/components/Profile/ProfileDashboard';
import PrivateProfile from '@/components/PrivateProfile';
import DealerProfile from '@/components/DealerProfile';
import CompanyProfile from '@/components/CompanyProfile';
import { PublicProfileView } from './PublicProfileView';
import type { ProfileCar } from '../types';
// Profile Enhancements
import {
  // Phase 1
  SuccessStoriesSection,
  TrustNetworkSection,
  CarStorySection,
  PointsLevelsSection,
  // Phase 2
  GroupsSection,
  ChallengesSection,
  TransactionsSection,
  AvailabilityCalendarSection,
  // Phase 3
  IntroVideoSection,
  LeaderboardSection,
  AchievementsGallerySection
} from '@/components/Profile/Enhancements';

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
        <PublicProfileView user={user} userCars={userCars} />
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
      
      {/* Profile Enhancements - Phase 1 */}
      <PointsLevelsSection userId={user.uid} isOwnProfile={isOwnProfile} />
      <CarStorySection userId={user.uid} isOwnProfile={isOwnProfile} />
      <SuccessStoriesSection userId={user.uid} isOwnProfile={isOwnProfile} />
      <TrustNetworkSection userId={user.uid} isOwnProfile={isOwnProfile} />
      
      {/* Profile Enhancements - Phase 2 */}
      <GroupsSection userId={user.uid} isOwnProfile={isOwnProfile} />
      <ChallengesSection userId={user.uid} isOwnProfile={isOwnProfile} />
      <TransactionsSection userId={user.uid} isOwnProfile={isOwnProfile} />
      <AvailabilityCalendarSection userId={user.uid} isOwnProfile={isOwnProfile} />
      
      {/* Profile Enhancements - Phase 3 */}
      <IntroVideoSection userId={user.uid} isOwnProfile={isOwnProfile} />
      <LeaderboardSection userId={user.uid} isOwnProfile={isOwnProfile} />
      <AchievementsGallerySection userId={user.uid} isOwnProfile={isOwnProfile} />
      
      {renderProfile()}
    </OverviewContainer>
  );
};

export default ProfileOverview;

