import React from 'react';
import { useProfile } from './hooks/useProfile';
import { useLanguage } from '../../contexts/LanguageContext';
import ProfileDashboard from '../../components/Profile/ProfileDashboard';
import UserPostsFeed from '../../components/Profile/UserPostsFeed';
import * as S from './styles';

/**
 * Profile Overview Tab - Main profile information
 * ⚡ NOW SHOWS: User's posts (like Facebook/Instagram)
 */
const ProfileOverview: React.FC = () => {
  const { language } = useLanguage();
  const { user, isOwnProfile } = useProfile();

  return (
    <S.ContentSection>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#333' }}>
        {language === 'bg' ? 'Преглед на профила' : 'Profile Overview'}
      </h2>
      
      {/* Profile Dashboard with Stats */}
      <ProfileDashboard />
      
      {/* ⚡ NEW: User's Posts Feed (replaced cars!) */}
      <div style={{ marginTop: '2rem' }}>
        <UserPostsFeed 
          userId={user?.uid}
          limit={10}
          showTitle={true}
        />
      </div>
    </S.ContentSection>
  );
};

export default ProfileOverview;

