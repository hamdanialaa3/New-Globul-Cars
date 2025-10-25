import React from 'react';
import { useProfile } from './hooks/useProfile';
import { useLanguage } from '../../contexts/LanguageContext';
import ProfileDashboard from '../../components/Profile/ProfileDashboard';
import { GarageSection } from '../../components/Profile';
import type { GarageCar } from '../../components/Profile';
import * as S from './styles';

/**
 * Profile Overview Tab - Main profile information
 */
const ProfileOverview: React.FC = () => {
  const { language } = useLanguage();
  const { profileData, isOwnProfile } = useProfile();

  return (
    <S.ContentSection>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#333' }}>
        {language === 'bg' ? 'Преглед на профила' : 'Profile Overview'}
      </h2>
      
      {/* Profile Dashboard with Stats */}
      <ProfileDashboard />
      
      {/* User's Cars Preview (if any) */}
      {isOwnProfile && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#666' }}>
            {language === 'bg' ? 'Моите последни обяви' : 'My Recent Listings'}
          </h3>
          {/* Show only first 3 cars */}
          <GarageSection limit={3} />
        </div>
      )}
    </S.ContentSection>
  );
};

export default ProfileOverview;

