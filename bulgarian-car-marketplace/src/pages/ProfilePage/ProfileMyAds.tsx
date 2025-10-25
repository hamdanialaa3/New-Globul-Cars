import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { GarageSection } from '../../components/Profile';
import * as S from './styles';

/**
 * My Ads Tab - Full garage with all user's cars
 */
const ProfileMyAds: React.FC = () => {
  const { language } = useLanguage();

  return (
    <S.ContentSection style={{ padding: 0 }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', padding: '0 1rem', color: '#333' }}>
        {language === 'bg' ? 'Моите обяви' : 'My Ads'}
      </h2>
      
      {/* Full-width Garage Section */}
      <GarageSection />
    </S.ContentSection>
  );
};

export default ProfileMyAds;

