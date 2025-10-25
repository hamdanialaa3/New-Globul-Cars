import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import PrivacySettingsManager from '../../components/Profile/Privacy/PrivacySettingsManager';
import DealershipInfoForm from '../../components/Profile/Dealership/DealershipInfoForm';
import SocialMediaSettings from '../../components/Profile/SocialMedia/SocialMediaSettings';
import { useProfile } from './hooks/useProfile';
import * as S from './styles';

/**
 * Settings Tab - Privacy, Dealership info, Social media
 */
const ProfileSettings: React.FC = () => {
  const { language } = useLanguage();
  const { profileData } = useProfile();

  return (
    <S.ContentSection>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#333' }}>
        {language === 'bg' ? 'Настройки' : 'Settings'}
      </h2>
      
      {/* Privacy Settings */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#666' }}>
          {language === 'bg' ? 'Поверителност' : 'Privacy'}
        </h3>
        <PrivacySettingsManager />
      </div>
      
      {/* Dealership Info (if dealer/company) */}
      {(profileData?.accountType === 'dealer' || profileData?.accountType === 'company') && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#666' }}>
            {language === 'bg' ? 'Информация за бизнеса' : 'Business Information'}
          </h3>
          <DealershipInfoForm />
        </div>
      )}
      
      {/* Social Media Settings */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#666' }}>
          {language === 'bg' ? 'Социални мрежи' : 'Social Media'}
        </h3>
        <SocialMediaSettings />
      </div>
    </S.ContentSection>
  );
};

export default ProfileSettings;

