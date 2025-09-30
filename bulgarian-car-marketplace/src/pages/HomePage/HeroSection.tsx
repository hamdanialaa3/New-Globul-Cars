// src/pages/HomePage/HeroSection.tsx
// Hero section component for HomePage

import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageToggle from '../../components/LanguageToggle/LanguageToggle';

const HeroSection = styled.section`
  background: ${({ theme }) => theme.colors.background.paper};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: ${({ theme }) => theme.spacing['4xl']} 0;
  text-align: center;
  position: relative;
  min-height: 50vh;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 2px solid ${({ theme }) => theme.colors.primary.main};
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
  font-size: ${({ theme }) => theme.typography.fontSize['5xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.extrabold};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};
  color: ${({ theme }) => theme.colors.text.primary};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
  }
`;

const HeroSubtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  margin-bottom: ${({ theme }) => theme.spacing['2xl']};
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
  opacity: 0.9;
`;

const HeroButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  justify-content: center;
  flex-wrap: wrap;
`;

const HeroButton = styled(Link)`
  display: inline-block;
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing['2xl']};
  background: ${({ theme }) => theme.colors.secondary.main};
  color: white;
  text-decoration: none;
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  transition: all 0.3s ease-in-out;
  box-shadow: ${({ theme }) => theme.shadows.lg};

  &:hover {
    background: ${({ theme }) => theme.colors.secondary.dark};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.xl};
  }

  &.secondary {
    background: transparent;
    border: 2px solid white;
    color: white;

    &:hover {
      background: white;
      color: ${({ theme }) => theme.colors.primary.main};
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
    font-size: 1.1rem;
    font-weight: 600;
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
          <span>🌐 Language:</span>
          <LanguageToggle size="medium" />
        </LanguageDemoSection>
      </HeroContent>
    </HeroSection>
  );
};

export default HeroSectionComponent;