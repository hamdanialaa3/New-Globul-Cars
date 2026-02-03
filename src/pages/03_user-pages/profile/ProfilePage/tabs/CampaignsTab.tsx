// ProfilePage/tabs/CampaignsTab.tsx
// Campaigns tab - advertising campaigns
// Phase 0 Day 2: Extracted from index.tsx

import React from 'react';
import styled from 'styled-components';
import { CampaignsList } from '../../../../../components/Profile/Campaigns';
import type { BulgarianUser } from '../../../../../types/user/bulgarian-user.types';
import type { ProfileTheme } from '../../../../../contexts/ProfileTypeContext';

interface CampaignsTabProps {
  user: BulgarianUser | null;
  theme: ProfileTheme;
}

const CampaignsContainer = styled.div`
  width: 100%;
`;

export const CampaignsTab: React.FC<CampaignsTabProps> = ({ user, theme }) => {
  if (!user) {
    return (
      <CampaignsContainer>
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
          جاري التحميل...
        </div>
      </CampaignsContainer>
    );
  }

  return (
    <CampaignsContainer>
      <CampaignsList userId={user.uid} />
    </CampaignsContainer>
  );
};

export default CampaignsTab;

