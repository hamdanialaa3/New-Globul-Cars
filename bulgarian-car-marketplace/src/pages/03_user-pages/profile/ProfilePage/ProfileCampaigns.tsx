import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { CampaignsList } from '../../../../components/Profile/Campaigns';
import type { BulgarianUser } from '../../../../types/user/bulgarian-user.types';
import type { ProfileTheme } from '../../../../contexts/ProfileTypeContext';
import * as S from './styles';

interface OutletContext {
  user: BulgarianUser | null;
  viewer: BulgarianUser | null;
  isOwnProfile: boolean;
  theme: ProfileTheme;
  refresh: () => void;
}

/**
 * Campaigns Tab - Advertising campaigns management
 */
const ProfileCampaigns: React.FC = () => {
  const { language } = useLanguage();
  const { user, theme, isOwnProfile } = useOutletContext<OutletContext>();

  if (!user) {
    return (
      <S.ContentSection>
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
          {language === 'bg' ? 'Зареждане...' : 'Loading...'}
        </div>
      </S.ContentSection>
    );
  }

  // ✅ Restrict to own profile or dealer/company profiles
  if (!isOwnProfile && user.profileType !== 'dealer' && user.profileType !== 'company') {
    return (
      <S.ContentSection>
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', padding: '2rem' }}>
          {language === 'bg' ? 'Тази секция не е налична' : 'This section is not available'}
        </div>
      </S.ContentSection>
    );
  }

  return (
    <S.ContentSection $themeColor={theme.primary}>
      <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', color: '#fff', fontWeight: '700' }}>
        {language === 'bg' ? '📢 Рекламни кампании' : '📢 Advertising Campaigns'}
      </h2>
      
      <CampaignsList userId={user.uid} themeColor={theme.primary} />
    </S.ContentSection>
  );
};

export default ProfileCampaigns;

