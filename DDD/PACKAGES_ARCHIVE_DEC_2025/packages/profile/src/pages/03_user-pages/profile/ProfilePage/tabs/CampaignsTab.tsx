// ProfilePage/tabs/CampaignsTab.tsx
// Campaigns tab - advertising campaigns
// Phase 0 Day 2: Extracted from index.tsx

import React from 'react';
import styled from 'styled-components';
import { CampaignsList } from '@globul-cars/ui/componentsProfile/Campaigns';
import type { BulgarianUser } from '@globul-cars/core/typesuser/bulgarian-user.types';
import type { ProfileTheme } from '@globul-cars/core/contextsProfileTypeContext';

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
      <CampaignsList userId={user.uid} themeColor={theme.primary} />
    </CampaignsContainer>
  );
};

export default CampaignsTab;

