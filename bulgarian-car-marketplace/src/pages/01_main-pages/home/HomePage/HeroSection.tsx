// src/pages/HomePage/HeroSection.tsx
// Hero section component for HomePage

import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useLanguage } from '../../../../contexts/LanguageContext';
import LanguageToggle from '../../../../components/LanguageToggle/LanguageToggle';
import AdvancedSearchWidget from './AdvancedSearchWidget';
import QuickBrandsSection from './QuickBrandsSection';

const HeroSection = styled.section`
  background-image: url('/assets/backgrounds/metal-bg-1.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  color: var(--text-primary);
  padding: 3rem 0;
  text-align: center;
  position: relative;
  min-height: 40vh;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateZ(0);
  will-change: transform;
  transition: background-color 0.3s ease, color 0.3s ease;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--bg-primary);
    opacity: 0.7;
    z-index: 0;
    transition: background-color 0.3s ease, opacity 0.3s ease;
  }
  
  /* Dark mode overlay adjustment */
  html[data-theme="dark"] &::before {
    opacity: 0.85;
  }
  
  /* MOBILE OPTIMIZATION - Airbnb/Booking.com inspired */
  @media (max-width: 768px) {
    padding: 2rem 1rem;
    min-height: 50vh;  /* More prominent on mobile */
    background-position: center center;
    
    &::before {
      opacity: 0.75;  /* Lighter for better text contrast */
    }
    
    html[data-theme="dark"] &::before {
      opacity: 0.9;
    }
  }
  
  @media (max-width: 480px) {
    padding: 1.5rem 1rem;
    min-height: 45vh;
  }
  
  @media (max-width: 380px) {
    padding: 1.25rem 0.75rem;
    min-height: 40vh;
  }
`;

const HeroContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.md};
  position: relative;
  z-index: 2;
  text-align: center;
  width: 100%;
`;

const HeroTitleWrapper = styled.div`
  width: 100%;
  margin-bottom: 1.25rem;
  overflow: hidden;
  position: relative;

  @media (max-width: 768px) {
    margin-bottom: 1rem;
    overflow: visible;
  }

  @media (max-width: 480px) {
    overflow: hidden;
    mask-image: linear-gradient(
      to right,
      transparent 0%,
      black 10%,
      black 90%,
      transparent 100%
    );
    -webkit-mask-image: linear-gradient(
      to right,
      transparent 0%,
      black 10%,
      black 90%,
      transparent 100%
    );
  }
`;

const HeroTitle = styled.h1`
  font-size: clamp(1.5rem, 4vw + 1rem, 3.5rem);
  font-weight: 900;
  line-height: 1.2;
  letter-spacing: -0.03em;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeInUp 0.8s ease-out;
  width: 100%;
  margin: 0;
  display: inline-block;

  /* Light mode: Orange gradient */
  html[data-theme="light"] & {
    background: linear-gradient(135deg, #FF8F10 0%, #FFA500 50%, #FFD700 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    filter: drop-shadow(0 2px 4px rgba(255, 143, 16, 0.3));
  }

  /* Dark mode: Black with yellow accent */
  html[data-theme="dark"] & {
    color: #000000;
    text-shadow: 0 0 20px rgba(255, 215, 0, 0.5), 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes scrollTitle {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(calc(-100% + 100%));
    }
  }

  @keyframes scrollTitleMobile {
    0%, 12% {
      transform: translateX(0);
    }
    38% {
      transform: translateX(calc(-100% + 100vw - 6rem));
    }
    62% {
      transform: translateX(calc(-100% + 100vw - 6rem));
    }
    88%, 100% {
      transform: translateX(0);
    }
  }

  /* Tablet */
  @media (max-width: 1024px) {
    font-size: clamp(1.5rem, 4vw + 0.5rem, 2.75rem);
    padding: 0 20px;
  }

  /* Mobile */
  @media (max-width: 768px) {
    font-size: clamp(1.25rem, 5vw + 0.25rem, 2rem);
    padding: 0 16px;
    line-height: 1.3;
  }
  
  /* Small Mobile - Scrolling Title */
  @media (max-width: 480px) {
    font-size: clamp(1.125rem, 6vw, 1.75rem);
    padding: 0 3rem;
    white-space: nowrap;
    display: inline-block;
    width: auto;
    animation: fadeInUp 0.8s ease-out, scrollTitleMobile 22s infinite ease-in-out 1.5s;
    
    /* Pause on hover/touch for better UX */
    &:hover,
    &:active {
      animation-play-state: paused;
    }
    
    /* Ensure text doesn't break */
    word-break: keep-all;
    overflow-wrap: normal;
  }

  /* Extra Small Mobile */
  @media (max-width: 360px) {
    font-size: clamp(1rem, 7vw, 1.5rem);
    padding: 0 1.5rem;
    animation-duration: 18s, 18s;
  }

  /* Responsive scaling for any viewport */
  @media (min-width: 1400px) {
    font-size: clamp(2.5rem, 3vw, 3.5rem);
  }

  @media (min-width: 1920px) {
    font-size: clamp(3rem, 2.5vw, 4rem);
  }

  /* Smooth scaling on resize */
  @media (orientation: landscape) and (max-height: 500px) {
    font-size: clamp(1rem, 3vw, 2rem);
  }
`;

const HeroSubtitle = styled.p`
  font-size: clamp(1rem, 2vw, 1.25rem);
  margin-bottom: 2.5rem;
  line-height: 1.7;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeInUp 0.8s ease-out 0.2s both;
  font-weight: 400;

  /* Light mode: Black text */
  html[data-theme="light"] & {
    color: #1a1a1a;
    text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
  }

  /* Dark mode: Yellow text */
  html[data-theme="dark"] & {
    color: #FFD700;
    text-shadow: 0 2px 8px rgba(255, 215, 0, 0.4);
  }
  
  @media (max-width: 768px) {
    font-size: clamp(0.9375rem, 1.8vw, 1.125rem);
    margin-bottom: 2rem;
    padding: 0 20px;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  @media (max-width: 480px) {
    font-size: clamp(0.875rem, 1.6vw, 1rem);
    -webkit-line-clamp: 2;
    padding: 0 16px;
  }
`;

const HeroButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  justify-content: center;
  flex-wrap: wrap;
  
  /* MOBILE - Full-width stacked buttons (Facebook/Instagram) */
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    padding: 0 20px;
    max-width: 400px;
    margin: 0 auto;
  }
  
  @media (max-width: 480px) {
    padding: 0 16px;
    gap: 10px;
  }
`;

const HeroButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 28px;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.9375rem;
  border-radius: 10px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1.5px solid transparent;
  position: relative;
  overflow: hidden;
  letter-spacing: 0.02em;
  animation: fadeInUp 0.8s ease-out 0.4s both;
  min-height: 44px;
  
  /* Light mode: Orange/Yellow gradient */
  html[data-theme="light"] & {
    background: linear-gradient(135deg, #FF8F10 0%, #FFD700 100%);
    color: #000000;
    box-shadow: 0 4px 16px rgba(255, 143, 16, 0.3);
  }

  /* Dark mode: Black background, Yellow text */
  html[data-theme="dark"] & {
    background: #000000;
    color: #FFD700;
    border-color: #FFD700;
    box-shadow: 0 4px 16px rgba(255, 215, 0, 0.25);
  }

  /* Shine effect */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s ease;
  }

  &:hover {
    transform: translateY(-2px);
    
    html[data-theme="light"] & {
      background: linear-gradient(135deg, #FFA500 0%, #FFD700 100%);
      box-shadow: 0 6px 20px rgba(255, 143, 16, 0.4);
    }
    
    html[data-theme="dark"] & {
      background: #1a1a1a;
      box-shadow: 0 6px 20px rgba(255, 215, 0, 0.35);
    }
    
    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(0);
  }

  &.secondary {
    html[data-theme="light"] & {
      background: transparent;
      color: #FF8F10;
      border-color: #FF8F10;
      box-shadow: 0 2px 8px rgba(255, 143, 16, 0.15);
    }

    html[data-theme="dark"] & {
      background: transparent;
      color: #FFD700;
      border-color: #FFD700;
      box-shadow: 0 2px 8px rgba(255, 215, 0, 0.15);
    }

    &:hover {
      html[data-theme="light"] & {
        background: #FF8F10;
        color: #000000;
        box-shadow: 0 4px 16px rgba(255, 143, 16, 0.3);
      }
      
      html[data-theme="dark"] & {
        background: #FFD700;
        color: #000000;
        box-shadow: 0 4px 16px rgba(255, 215, 0, 0.3);
      }
    }
  }
  
  @media (max-width: 768px) {
    width: 100%;
    padding: 10px 24px;
    font-size: 0.875rem;
    min-height: 42px;
    border-radius: 10px;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
  }
  
  @media (max-width: 480px) {
    padding: 9px 20px;
    font-size: 0.8125rem;
    min-height: 40px;
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
    color: #000000; /* Black for dark mode */
    transition: color 0.3s ease;

    /* Light mode: White */
    html[data-theme="light"] & {
      color: #ffffff; /* White for light mode */
    }

    /* Dark mode: Yellow */
    html[data-theme="dark"] & {
      color: #FFD700; /* Yellow/Gold for dark mode */
    }
  }
`;

const HeroSectionComponent: React.FC = () => {
  const { t } = useLanguage();

  return (
      <HeroSection style={{ position: 'relative', zIndex: 1 }}>
      <HeroContent>
        <HeroTitleWrapper>
          <HeroTitle>
            {t('home.hero.title')}
          </HeroTitle>
        </HeroTitleWrapper>
        <HeroSubtitle>
          {t('home.hero.subtitle')}
        </HeroSubtitle>
        
        {/* Advanced Search Widget */}
        <AdvancedSearchWidget />
        
        {/* Quick Brand Filters */}
        <QuickBrandsSection />
        
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

export default memo(HeroSectionComponent);