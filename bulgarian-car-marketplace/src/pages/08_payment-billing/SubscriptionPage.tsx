// src/pages/SubscriptionPage.tsx
// Subscription Management Page for Bulgarian Car Marketplace

import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useTranslation } from '../../hooks/useTranslation';
import SubscriptionManager from '../../components/subscription/SubscriptionManager';
import { useAuth } from '../../hooks/useAuth';
import { Settings } from 'lucide-react';

const PageContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  padding: 2rem 0;
`;

const Header = styled.header`
  background: ${({ theme }) => theme.colors.primary.main};
  color: ${({ theme }) => theme.colors.primary.contrastText};
  padding: 2rem 0;
  box-shadow: ${({ theme }) => theme.shadows.md};
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const HeaderTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  margin: 0;
`;

const HeaderSubtitle = styled.p`
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0.5rem 0 0 0;
`;

const Content = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 2rem;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const SubscriptionPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null; // Will redirect
  }

  return (
    <PageContainer>
      <Header>
        <HeaderContent>
          <Settings />
          <div>
            <HeaderTitle>{t('settings.subscription')}</HeaderTitle>
            <HeaderSubtitle>
              Manage your subscription and access advanced car market analytics
            </HeaderSubtitle>
          </div>
        </HeaderContent>
      </Header>

      <Content>
        <BackButton onClick={() => navigate('/')}>
          ← Back to Marketplace
        </BackButton>

        <SubscriptionManager />
      </Content>
    </PageContainer>
  );
};

export default SubscriptionPage;