// src/features/analytics/AnalyticsDashboard.tsx
// Analytics Dashboard Router - Routes to type-specific dashboard

import React from 'react';
import { useProfileType } from '@globul-cars/core/contexts/ProfileTypeContext';
import PrivateDashboard from './PrivateDashboard';
import DealerDashboard from './DealerDashboard';
import CompanyDashboard from './CompanyDashboard';

export const AnalyticsDashboard: React.FC = () => {
  const { profileType } = useProfileType();

  switch (profileType) {
    case 'dealer':
      return <DealerDashboard />;
    case 'company':
      return <CompanyDashboard />;
    case 'private':
    default:
      return <PrivateDashboard />;
  }
};

export default AnalyticsDashboard;

