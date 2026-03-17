import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import ProfileAnalyticsDashboard from '@/components/Profile/Analytics/ProfileAnalyticsDashboard';
import type { BulgarianUser } from '@/types/user/bulgarian-user.types';
import type { ProfileTheme } from '@/contexts/ProfileTypeContext';
import * as S from './styles';

interface OutletContext {
  user: BulgarianUser | null;
  viewer: BulgarianUser | null;
  isOwnProfile: boolean;
  theme: ProfileTheme;
  refresh: () => void;
}

/**
 * Analytics Tab - Profile and listings analytics
 */
const ProfileAnalytics: React.FC = () => {
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

  // ✅ Restrict to own profile only
  if (!isOwnProfile) {
    return (
      <S.ContentSection>
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', padding: '2rem' }}>
          {language === 'bg' ? 'Тази секция не е налична' : 'This section is not available'}
        </div>
      </S.ContentSection>
    );
  }

  return (
    <S.ContentSection>
      <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', color: 'var(--text-primary)', fontWeight: '700' }}>
        {language === 'bg' ? '📊 Статистика и аналитика' : '📊 Analytics & Statistics'}
      </h2>
      
      <ProfileAnalyticsDashboard userId={user.uid} themeColor={theme.primary} />
    </S.ContentSection>
  );
};

export default ProfileAnalytics;

