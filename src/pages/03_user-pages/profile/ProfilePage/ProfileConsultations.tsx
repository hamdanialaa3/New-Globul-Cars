import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { useLanguage } from '../../../../contexts/LanguageContext';
import ConsultationsTab from './ConsultationsTab';
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
 * Consultations Tab - Expert advice system
 */
const ProfileConsultations: React.FC = () => {
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

  return (
    <S.ContentSection $themeColor={theme.primary}>
      <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', color: '#fff', fontWeight: '700' }}>
        {language === 'bg' ? '💬 Консултации с експерти' : '💬 Expert Consultations'}
      </h2>
      
      <ConsultationsTab 
        userId={user.uid}
        isOwnProfile={isOwnProfile}
      />
    </S.ContentSection>
  );
};

export default ProfileConsultations;

