// ProfilePage/tabs/SettingsTab.tsx
// Settings tab - privacy and dealership settings
// Phase 0 Day 2: Extracted from index.tsx

import React from 'react';
import styled from 'styled-components';
import PrivacySettingsManager from '../../../components/Profile/Privacy/PrivacySettingsManager';
import DealershipInfoForm from '../../../components/Profile/Dealership/DealershipInfoForm';
import type { BulgarianUser } from '../../../types/user/bulgarian-user.types';
import type { ProfileTheme } from '../../../../../contexts/ProfileTypeContext';
import { isDealerProfile, isCompanyProfile } from '../../../types/user/bulgarian-user.types';

interface SettingsTabProps {
  user: BulgarianUser | null;
  theme: ProfileTheme;
}

const SettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 16px 0;
`;

export const SettingsTab: React.FC<SettingsTabProps> = ({ user, theme }) => {
  if (!user) {
    return (
      <SettingsContainer>
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
          جاري التحميل...
        </div>
      </SettingsContainer>
    );
  }

  const isBusinessAccount = isDealerProfile(user) || isCompanyProfile(user);

  return (
    <SettingsContainer>
      {/* Privacy Settings - for all users */}
      <div>
        <SectionTitle>إعدادات الخصوصية</SectionTitle>
        <PrivacySettingsManager userId={user.uid} />
      </div>

      {/* Dealership Info - only for dealers/companies */}
      {isBusinessAccount && (
        <div>
          <SectionTitle>معلومات {isDealerProfile(user) ? 'المعرض' : 'الشركة'}</SectionTitle>
          <DealershipInfoForm userId={user.uid} />
        </div>
      )}
    </SettingsContainer>
  );
};

export default SettingsTab;

