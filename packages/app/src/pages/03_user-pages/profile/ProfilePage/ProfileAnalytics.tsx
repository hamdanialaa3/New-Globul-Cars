import React from 'react';
import { useLanguage } from '@globul-cars/coreLanguageContext';
import ProfileAnalyticsDashboard from '@globul-cars/uiProfile/Analytics/ProfileAnalyticsDashboard';
import * as S from './styles';

/**
 * Analytics Tab - Profile and listings analytics
 */
const ProfileAnalytics: React.FC = () => {
  const { language } = useLanguage();

  return (
    <S.ContentSection>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#333' }}>
        {language === 'bg' ? 'Статистика' : 'Analytics'}
      </h2>
      
      <ProfileAnalyticsDashboard />
    </S.ContentSection>
  );
};

export default ProfileAnalytics;

