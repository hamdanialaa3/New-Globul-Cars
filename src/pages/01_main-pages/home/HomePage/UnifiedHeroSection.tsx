/**
 * UnifiedHeroSection.tsx (v4.0 — World-Class Hero)
 * 
 * Inspired by:
 * - Carvana: emotional hero with strong headline
 * - AutoScout24: clean search-first approach
 * - CarGurus: data-driven trust strip
 * 
 * Features:
 * ✅ <h1> Bulgarian tagline (SEO + a11y critical)
 * ✅ English subtitle for international visitors
 * ✅ Trust strip: 4-icon horizontal (AI, Valuation, TrustShield, One Platform)
 * ✅ Clean professional background — no purple LED
 * ✅ Entrance animations (fade-up text, slide-in search)
 * ✅ No background-attachment: fixed (iOS Safari bug)
 * 
 * @performance memoized
 * @responsive mobile-first
 * @accessible semantic HTML with h1
 */

import React, { memo } from 'react';
import styled, { keyframes } from 'styled-components';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Search, Brain, Shield, Smartphone } from 'lucide-react';
import SearchWidget from './SearchWidget';

// ═══ Animations ═══
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

// ═══ Styled Components ═══
const HeroContainer = styled.section<{ $isDark: boolean }>`
  position: relative;
  overflow: hidden;
  min-height: 520px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 64px 24px 48px;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  border-radius: 16px;

  /* Professional gradient background — no AI image */
  background: ${props => props.$isDark
    ? 'linear-gradient(160deg, #0B0E14 0%, #121822 50%, #192033 100%)'
    : 'linear-gradient(160deg, #1A237E 0%, #283593 50%, #3949AB 100%)'};

  /* Subtle geometric pattern overlay */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: 
      radial-gradient(circle at 20% 80%, rgba(230, 81, 0, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(26, 35, 126, 0.2) 0%, transparent 50%);
    z-index: 1;
  }

  color: #FFFFFF;

  @media (max-width: 768px) {
    min-height: 480px;
    padding: 48px 16px 40px;
  }

  @media (max-width: 480px) {
    min-height: 440px;
    padding: 40px 16px 32px;
  }
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 24px;
`;

const HeroTitle = styled.h1`
  font-family: 'Exo 2', 'Inter', system-ui, sans-serif;
  font-size: clamp(1.75rem, 4vw, 2.75rem);
  font-weight: 800;
  line-height: 1.2;
  color: #FFFFFF;
  margin: 0;
  letter-spacing: -0.02em;

  @media (prefers-reduced-motion: no-preference) {
    animation: ${fadeUp} 0.6s ease-out;
  }
`;

const HeroSubtitle = styled.p`
  font-size: clamp(0.9rem, 2vw, 1.125rem);
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  max-width: 600px;
  line-height: 1.6;

  @media (prefers-reduced-motion: no-preference) {
    animation: ${fadeUp} 0.6s ease-out 0.15s both;
  }
`;

const SearchWrapper = styled.div`
  width: 100%;
  
  @media (prefers-reduced-motion: no-preference) {
    animation: ${slideIn} 0.5s ease-out 0.3s both;
  }
`;

const TrustStrip = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 24px;
  margin-top: 8px;

  @media (prefers-reduced-motion: no-preference) {
    animation: ${fadeUp} 0.5s ease-out 0.5s both;
  }

  @media (max-width: 640px) {
    gap: 16px;
  }
`;

const TrustItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.8125rem;
  font-weight: 500;
  white-space: nowrap;

  svg {
    width: 18px;
    height: 18px;
    color: #FF7B33;
    flex-shrink: 0;
  }

  @media (max-width: 640px) {
    font-size: 0.75rem;
    svg { width: 16px; height: 16px; }
  }
`;

// ═══ Component ═══
const UnifiedHeroSection: React.FC = memo(() => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const isDark = theme === 'dark';
  const isBg = language === 'bg';

  return (
    <HeroContainer $isDark={isDark} aria-label={isBg ? 'Главен раздел' : 'Hero section'}>
      <ContentWrapper>
        <HeroTitle>
          {isBg
            ? 'Най-умният начин да купиш или продадеш кола в България'
            : 'The Smartest Way to Buy or Sell a Car in Bulgaria'}
        </HeroTitle>
        <HeroSubtitle>
          {isBg
            ? 'AI анализ, реални цени, верифицирани продавачи — всичко на едно място.'
            : 'AI analysis, real prices, verified sellers — all in one place.'}
        </HeroSubtitle>

        <SearchWrapper>
          <SearchWidget />
        </SearchWrapper>

        <TrustStrip>
          <TrustItem>
            <Brain aria-hidden="true" />
            <span>{isBg ? 'AI анализ' : 'AI Analysis'}</span>
          </TrustItem>
          <TrustItem>
            <Search aria-hidden="true" />
            <span>{isBg ? 'Безплатна оценка' : 'Free Valuation'}</span>
          </TrustItem>
          <TrustItem>
            <Shield aria-hidden="true" />
            <span>TrustShield</span>
          </TrustItem>
          <TrustItem>
            <Smartphone aria-hidden="true" />
            <span>{isBg ? 'Една платформа' : 'One Platform'}</span>
          </TrustItem>
        </TrustStrip>
      </ContentWrapper>
    </HeroContainer>
  );
});

UnifiedHeroSection.displayName = 'UnifiedHeroSection';

export default UnifiedHeroSection;
