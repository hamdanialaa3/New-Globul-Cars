// ProfilePage/tabs/AnalyticsTab.tsx
// Analytics tab - shows profile analytics
// Phase 0 Day 2: Extracted from index.tsx

import React from 'react';
import styled from 'styled-components';
import ProfileAnalyticsDashboard from '../../../components/Profile/Analytics/ProfileAnalyticsDashboard';
import type { BulgarianUser } from '../../../types/user/bulgarian-user.types';
import type { ProfileTheme } from '../../../../../contexts/ProfileTypeContext';

interface AnalyticsTabProps {
  user: BulgarianUser | null;
  theme: ProfileTheme;
}

const AnalyticsContainer = styled.div`
  width: 100%;
`;

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ user, theme }) => {
  if (!user) {
    return (
      <AnalyticsContainer>
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
          جاري التحميل...
        </div>
      </AnalyticsContainer>
    );
  }

  return (
    <AnalyticsContainer>
      <ProfileAnalyticsDashboard userId={user.uid} themeColor={theme.primary} />
    </AnalyticsContainer>
  );
};

export default AnalyticsTab;

