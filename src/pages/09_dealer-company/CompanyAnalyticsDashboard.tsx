/**
 * Company Analytics Dashboard
 * Route: /company/analytics
 * Access: Company accounts only
 * 
 * Professional analytics dashboard for company accounts
 * Displays comprehensive metrics and insights
 * 
 * Constitution Compliance: Max 300 lines per file
 */

import React from 'react';
import { useProfileType } from '@/contexts/ProfileTypeContext';
import B2BAnalyticsDashboard from '@/components/analytics/B2BAnalyticsDashboard';
import { RequireCompanyGuard } from '@/components/guards';
import styled from 'styled-components';

const CompanyAnalyticsDashboard: React.FC = () => {
  const { planTier } = useProfileType();

  return (
    <RequireCompanyGuard>
      <Container>
        <B2BAnalyticsDashboard subscriptionTier={planTier || 'company'} />
      </Container>
    </RequireCompanyGuard>
  );
};

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

export default CompanyAnalyticsDashboard;
