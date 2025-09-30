// src/pages/CarsPage.tsx
// Cars Page for Bulgarian Car Marketplace

import * as React from 'react';
import styled from 'styled-components';
import { useLanguage } from '../contexts/LanguageContext';
import AISearchEngine from '../components/AISearchEngine';

// Styled Components
const CarsContainer = styled.div`
  min-height: 100vh;
  padding: ${({ theme }) => theme.spacing['2xl']} 0;
`;

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.md};

  @media (max-width: 768px) {
    padding: 0 ${({ theme }) => theme.spacing.sm};
  }

  @media (max-width: 480px) {
    padding: 0 ${({ theme }) => theme.spacing.xs};
  }
`;

const PageHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing['3xl']};

  @media (max-width: 768px) {
    margin-bottom: ${({ theme }) => theme.spacing['2xl']};
  }

  h1 {
    font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.text.primary};

    @media (max-width: 768px) {
      font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
    }

    @media (max-width: 480px) {
      font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
    }
  }
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  p {
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

// Removed old sidebar filter styled components after layout simplification

// Cars Page Component
const CarsPage: React.FC = () => {
  const { t } = useLanguage();

  // Load cars function for AI search
  const loadCars = (searchFilters?: any) => {
    console.log('AI Search filters:', searchFilters);
    // TODO: Implement AI-powered search logic
    // This will be developed further in the future
  };

  return (
    <CarsContainer>
      <PageContainer>
        {/* Page Header */}
        <PageHeader>
          <h1>{t('cars.title')}</h1>
          <p>{t('cars.subtitle')}</p>
        </PageHeader>

        {/* AI-Powered Smart Search */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <AISearchEngine
            onSearch={(query) => {
              console.log('AI Search query:', query);
              // TODO: Implement AI-powered search logic
              // This will be developed further in the future
              loadCars({ searchQuery: query });
            }}
          />
        </div>

      </PageContainer>
    </CarsContainer>
  );
};

export default CarsPage;