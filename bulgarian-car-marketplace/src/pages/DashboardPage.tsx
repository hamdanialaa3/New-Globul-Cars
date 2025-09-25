import React from 'react';
import styled from 'styled-components';
import { useTranslation } from '../hooks/useTranslation';

const DashboardContainer = styled.div`
  min-height: 100vh;
  padding: ${({ theme }) => theme.spacing.xl} 0;
`;

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.md};
`;

const PageTitle = styled.h1`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const DashboardCard = styled.div`
  background: white;
  padding: ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.base};
`;

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <DashboardContainer>
      <PageContainer>
        <PageTitle>{t('dashboard.title', 'Dashboard')}</PageTitle>
        <DashboardCard>
          <p>Dashboard page content will be implemented here.</p>
        </DashboardCard>
      </PageContainer>
    </DashboardContainer>
  );
};

export default DashboardPage;