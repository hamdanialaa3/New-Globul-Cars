// src/pages/HomePage/HeroSection.tsx
import React, { memo } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../../../contexts/LanguageContext';
import AdvancedSearchWidget from './AdvancedSearchWidget';

const HeroSection = styled.section`
  position: relative;
  min-height: 85vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 40px 20px;
  background-color: #050505;
  background-image: 
      linear-gradient(rgba(0, 204, 255, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 204, 255, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
  font-family: 'Manrope', sans-serif;
  color: #ffffff;
`;

const BgGearContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120vh;
  height: 120vh;
  opacity: 0.08;
  pointer-events: none;
  z-index: 0;
`;

const BgGear = styled('svg')`
  width: 100%;
  height: 100%;
  animation: rotateGear 60s linear infinite;
  fill: none;
  stroke: #00ccff;
  stroke-width: 0.5;

  @keyframes rotateGear {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const HeroTitle = styled.h1`
  font-family: 'Exo 2', sans-serif;
  font-size: 3.5rem;
  font-weight: 800;
  text-align: center;
  line-height: 1.2;
  margin-bottom: 15px;
  text-transform: uppercase;
  letter-spacing: 1px;
  background: linear-gradient(to right, #fff, #00ccff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 30px rgba(0, 204, 255, 0.2);

  @media (max-width: 576px) {
    font-size: 2.2rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.1rem;
  color: #8899aa;
  text-align: center;
  margin-bottom: 50px;
  max-width: 600px;
`;

const HeroSectionComponent: React.FC = () => {
  const { t } = useLanguage();

  return (
    <HeroSection>
      <BgGearContainer>
        <BgGear viewBox="0 0 100 100">
          <path d="M50 25 C36.2 25 25 36.2 25 50 C25 63.8 36.2 75 50 75 C63.8 75 75 63.8 75 50 C75 36.2 63.8 25 50 25 M50 30 C61 30 70 39 70 50 C70 61 61 70 50 70 C39 70 30 61 30 50 C30 39 39 30 50 30" opacity="0.5" />
          <path d="M50 10 L53 18 L60 18 L61 25 L68 28 L66 35 L72 40 L69 46 L74 50 L69 54 L72 60 L66 65 L68 72 L61 75 L60 82 L53 82 L50 90 L47 82 L40 82 L39 75 L32 72 L34 65 L28 60 L31 54 L26 50 L31 46 L28 40 L34 35 L32 28 L39 25 L40 18 L47 18 Z" strokeDasharray="2,2" />
        </BgGear>
      </BgGearContainer>

      <HeroContent>
        <HeroTitle dangerouslySetInnerHTML={{ __html: t('home.hero.title').replace(/\n/g, '<br/>') }} />
        <HeroSubtitle>{t('home.hero.subtitle')}</HeroSubtitle>

        {/* The new Search Dashboard Widget including Quick Brands inside */}
        <AdvancedSearchWidget />

      </HeroContent>
    </HeroSection>
  );
};

export default memo(HeroSectionComponent);