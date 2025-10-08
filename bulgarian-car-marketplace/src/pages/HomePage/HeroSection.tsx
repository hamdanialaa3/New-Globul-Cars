// src/pages/HomePage/HeroSection.tsx
// Hero section component for HomePage

import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageToggle from '../../components/LanguageToggle/LanguageToggle';

const HeroSection = styled.section`
  background-image: url('/assets/backgrounds/metal-bg-1.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  background-repeat: no-repeat;
  color: #212529;
  padding: 3rem 0;
  text-align: center;
  position: relative;
  min-height: 40vh;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    z-index: 0;
  }
  
  @media (max-width: 600px) {
    padding: 2rem 0;
    min-height: 35vh;
  }
`;

const HeroContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.md};
  position: relative;
  z-index: 2;
  text-align: center;
`;

const HeroTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.2;
  color: #212529;

  @media (max-width: 960px) {
    font-size: 2rem;
  }
  
  @media (max-width: 600px) {
    font-size: 1.75rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.125rem;
  margin-bottom: 2rem;
  line-height: 1.6;
  color: #6c757d;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  
  @media (max-width: 600px) {
    font-size: 1rem;
  }
`;

const HeroButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  justify-content: center;
  flex-wrap: wrap;
`;

const HeroButton = styled(Link)`
  display: inline-block;
  padding: 0.875rem 2rem;
  background: #FF8F10;
  color: #000000;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(255, 143, 16, 0.3);

  &:hover {
    background: #FFDF00;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(255, 223, 0, 0.4);
  }

  &.secondary {
    background: transparent;
    border: 2px solid #FF8F10;
    color: #FF8F10;

    &:hover {
      background: #FF8F10;
      color: #000000;
    }
  }
`;

const LanguageDemoSection = styled.div`
  margin-top: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;

  span {
    font-size: 0.9rem;
    font-weight: 600;
    color: #495057;
  }
`;

const HeroSectionComponent: React.FC = () => {
  const { t } = useLanguage();

  return (
    <HeroSection style={{ position: 'relative', zIndex: 1 }}>
      <HeroContent>
        <HeroTitle>
          {t('home.hero.title')}
        </HeroTitle>
        <HeroSubtitle>
          {t('home.hero.subtitle')}
        </HeroSubtitle>
        <HeroButtons>
          <HeroButton to="/cars">
            {t('home.hero.browseCars')}
          </HeroButton>
          <HeroButton to="/sell" className="secondary">
            {t('home.hero.sellCar')}
          </HeroButton>
        </HeroButtons>

        <LanguageDemoSection>
          <span>Language:</span>
          <LanguageToggle size="medium" />
        </LanguageDemoSection>
      </HeroContent>
    </HeroSection>
  );
};

export default HeroSectionComponent;