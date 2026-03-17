// src/pages/HomePage/LogoCollectionSection.tsx
// Logo collection section component for HomePage

import React, { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useLanguage } from '@/contexts/LanguageContext';

const LogoCollectionSection = styled.section`
  background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%);
  padding: 4rem 0;
  position: relative;
  z-index: 1;
`;

const SectionContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;

  h2 {
    font-size: 2.5rem;
    font-weight: bold;
    color: #005ca9;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 1.1rem;
    color: #6c757d;
    margin-bottom: 2rem;
    max-width: 600px;
    margin: 0 auto 2rem;
  }
`;

const ViewCollectionButton = styled(Link)`
  display: inline-block;
  background: #005ca9;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: bold;
  transition: all 0.3s ease;
  border: 2px solid #005ca9;

  &:hover {
    background: white;
    color: #005ca9;
  }
`;

const LoadingFallback = styled.div`
  text-align: center;
  padding: 2rem;
`;

const LogoCollectionSectionComponent: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <LogoCollectionSection>
      <SectionContainer>
        <SectionHeader>
          <h2>Complete Logo Collection</h2>
          <p>
            Our logos are designed to be versatile, professional, and instantly recognizable across all platforms and media types.
          </p>
          <ViewCollectionButton to="/brand-gallery">
            View All Collections →
          </ViewCollectionButton>
        </SectionHeader>

        <Suspense fallback={<LoadingFallback>{t('common.loading')}</LoadingFallback>}>
          {React.createElement(
            lazy(() => import('../../components/CompleteLogoCollection')),
            {
              imageSize: 140,
              rotationSpeed: 3000,
              showCount: 8
            }
          )}
        </Suspense>
      </SectionContainer>
    </LogoCollectionSection>
  );
};

export default LogoCollectionSectionComponent;