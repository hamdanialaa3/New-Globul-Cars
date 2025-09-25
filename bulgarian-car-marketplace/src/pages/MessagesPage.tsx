import React from 'react';
import styled from 'styled-components';
import { useTranslation } from '../hooks/useTranslation';

const MessagesContainer = styled.div`
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

const MessagesCard = styled.div`
  background: white;
  padding: ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.base};
`;

const MessagesPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <MessagesContainer>
      <PageContainer>
        <PageTitle>{t('messages.title', 'Messages')}</PageTitle>
        <MessagesCard>
          <p>Messages page content will be implemented here.</p>
        </MessagesCard>
      </PageContainer>
    </MessagesContainer>
  );
};

export default MessagesPage;