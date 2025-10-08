// src/pages/HomePage/FeaturesSection.tsx
// Features section component for HomePage

import React from 'react';
import styled from 'styled-components';
import { useTranslation } from '../../hooks/useTranslation';

const FeaturesSection = styled.section`
  background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%);
  padding: 3rem 0;
  position: relative;
  z-index: 1;
  
  @media (max-width: 600px) {
    padding: 2rem 0;
  }
`;

const SectionContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;

  h2 {
    font-size: 2rem;
    font-weight: 700;
    color: #212529;
    margin-bottom: 0.75rem;
    line-height: 1.3;
  }

  p {
    font-size: 1rem;
    color: #6c757d;
    line-height: 1.6;
    max-width: 600px;
    margin: 0 auto;
  }
  
  @media (max-width: 600px) {
    margin-bottom: 2rem;
    
    h2 {
      font-size: 1.75rem;
    }
    
    p {
      font-size: 0.9rem;
    }
  }
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
  
  @media (max-width: 960px) {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
`;

const FeatureCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid #e0e0e0;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(255, 143, 16, 0.15);
    border-color: #FF8F10;
  }

  .icon {
    font-size: 2.5rem;
    color: #FF8F10;
    margin-bottom: 1rem;
    font-weight: 600;
  }

  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #212529;
    margin-bottom: 0.75rem;
    line-height: 1.4;
  }

  p {
    color: #6c757d;
    line-height: 1.6;
    font-size: 0.95rem;
  }
  
  @media (max-width: 600px) {
    padding: 1.25rem;
    
    h3 {
      font-size: 1.125rem;
    }
    
    p {
      font-size: 0.875rem;
    }
  }
`;

const FeaturesSectionComponent: React.FC = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: '✓',
      title: t('home.features.verified.title', 'Verified Cars'),
      description: t('home.features.verified.description', 'All cars are thoroughly inspected and verified for authenticity and condition.')
    },
    {
      icon: '€',
      title: t('home.features.pricing.title', 'Best Pricing'),
      description: t('home.features.pricing.description', 'Competitive pricing with transparent deals and no hidden fees.')
    },
    {
      icon: '+',
      title: t('home.features.secure.title', 'Secure Transactions'),
      description: t('home.features.secure.description', 'Safe and secure payment processing with buyer and seller protection.')
    },
    {
      icon: '24/7',
      title: t('home.features.mobile.title', 'Mobile Friendly'),
      description: t('home.features.mobile.description', 'Access the marketplace anywhere with our responsive mobile app.')
    },
    {
      icon: 'BG',
      title: t('home.features.local.title', 'Local Expertise'),
      description: t('home.features.local.description', 'Deep knowledge of the Bulgarian car market and local regulations.')
    },
    {
      icon: '>',
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