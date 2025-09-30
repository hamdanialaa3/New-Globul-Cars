// src/pages/HomePage/FeaturesSection.tsx
// Features section component for HomePage

import React from 'react';
import styled from 'styled-components';
import { useTranslation } from '../../hooks/useTranslation';

const FeaturesSection = styled.section`
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

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
`;

const FeatureCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
  }

  .icon {
    font-size: 3rem;
    color: #005ca9;
    margin-bottom: 1rem;
  }

  h3 {
    font-size: 1.5rem;
    font-weight: bold;
    color: #005ca9;
    margin-bottom: 1rem;
  }

  p {
    color: #6c757d;
    line-height: 1.6;
  }
`;

const FeaturesSectionComponent: React.FC = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: '🚗',
      title: t('home.features.verified.title', 'Verified Cars'),
      description: t('home.features.verified.description', 'All cars are thoroughly inspected and verified for authenticity and condition.')
    },
    {
      icon: '💰',
      title: t('home.features.pricing.title', 'Best Pricing'),
      description: t('home.features.pricing.description', 'Competitive pricing with transparent deals and no hidden fees.')
    },
    {
      icon: '🔒',
      title: t('home.features.secure.title', 'Secure Transactions'),
      description: t('home.features.secure.description', 'Safe and secure payment processing with buyer and seller protection.')
    },
    {
      icon: '📱',
      title: t('home.features.mobile.title', 'Mobile Friendly'),
      description: t('home.features.mobile.description', 'Access the marketplace anywhere with our responsive mobile app.')
    },
    {
      icon: '🌍',
      title: t('home.features.local.title', 'Local Expertise'),
      description: t('home.features.local.description', 'Deep knowledge of the Bulgarian car market and local regulations.')
    },
    {
      icon: '⚡',
      title: t('home.features.fast.title', 'Fast Processing'),
      description: t('home.features.fast.description', 'Quick car listings and instant communication between buyers and sellers.')
    }
  ];

  return (
    <FeaturesSection>
      <SectionContainer>
        <SectionHeader>
          <h2>{t('home.features.title', 'Why Choose Us')}</h2>
          <p>
            {t('home.features.subtitle', 'Experience the best car marketplace in Bulgaria with our comprehensive features and services.')}
          </p>
        </SectionHeader>

        <FeaturesGrid>
          {features.map((feature, index) => (
            <FeatureCard key={index}>
              <div className="icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </FeatureCard>
          ))}
        </FeaturesGrid>
      </SectionContainer>
    </FeaturesSection>
  );
};

export default FeaturesSectionComponent;