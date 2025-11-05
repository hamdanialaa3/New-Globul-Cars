import React from 'react';
import { useLanguage } from '../../../../../contexts/LanguageContext';
import { CampaignsList } from '../../components/Profile/Campaigns';
import * as S from './styles';

/**
 * Campaigns Tab - Advertising campaigns management
 */
const ProfileCampaigns: React.FC = () => {
  const { language } = useLanguage();

  return (
    <S.ContentSection>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#333' }}>
        {language === 'bg' ? 'Рекламни кампании' : 'Advertising Campaigns'}
      </h2>
      
      <CampaignsList />
    </S.ContentSection>
  );
};

export default ProfileCampaigns;

