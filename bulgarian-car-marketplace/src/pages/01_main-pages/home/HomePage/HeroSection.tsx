// src/pages/HomePage/HeroSection.tsx
// Hero section component for HomePage

import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from '@/components/LanguageToggle/LanguageToggle';

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
`;

const HeroTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.3;
  color: #000000; /* Black for dark mode */
  transition: color 0.3s ease;

  /* Light mode: Orange */
  html[data-theme="light"] & {
    color: #ffffff; /* White for light mode */
  }

  /* Dark mode: Yellow */
  html[data-theme="dark"] & {
    color: #FFD700; /* Yellow/Gold for dark mode */
  }

  /* MOBILE - Professional typography (Airbnb/Booking.com) */
  @media (max-width: 768px) {
    font-size: 1.75rem;  /* 28px */
    font-weight: 800;  /* Bolder for impact */
    line-height: 1.2;
    margin-bottom: 12px;
    padding: 0 16px;
  }
  
  @media (max-width: 480px) {
    font-size: 1.5rem;  /* 24px */
    line-height: 1.25;
    padding: 0 12px;
  }
  
  @media (max-width: 380px) {
    font-size: 1.375rem;  /* 22px */
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1rem;
  margin-bottom: 2rem;
  line-height: 1.6;
  color: #000000; /* Black for dark mode */
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  transition: color 0.3s ease;

  /* Light mode: White */
  html[data-theme="light"] & {
    color: #ffffff; /* White for light mode */
  }

  /* Dark mode: Yellow */
  html[data-theme="dark"] & {
    color: #FFD700; /* Yellow/Gold for dark mode */
  }
  
  /* MOBILE - Compact subtitle (LinkedIn pattern) */
  @media (max-width: 768px) {
    font-size: 0.9375rem;  /* 15px */
    line-height: 1.5;
    margin-bottom: 20px;
    padding: 0 20px;
    
    /* Limit to 3 lines */
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  @media (max-width: 480px) {
    font-size: 0.875rem;  /* 14px */
    -webkit-line-clamp: 2;  /* 2 lines on small screens */
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
  display: inline-block;
  padding: 0.875rem 2rem;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  position: relative;
  overflow: hidden;
  
  /* Light mode: Orange gradient background, White text */
  html[data-theme="light"] & {
    background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 50%, #FFA500 100%) !important;
    color: #ffffff !important; /* White text */
    box-shadow: 0 4px 15px rgba(255, 107, 53, 0.35) !important;
  }

  /* Dark mode: Yellow gradient background, Black text */
  html[data-theme="dark"] & {
    background: linear-gradient(135deg, #FFD700 0%, #FFC107 50%, #FFA000 100%) !important;
    color: #000000 !important; /* Black text */
    box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4) !important;
  }

  /* Shine effect on hover */
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
    transform: translateY(-3px);
    html[data-theme="light"] & {
      background: linear-gradient(135deg, #FF5722 0%, #FF6B35 50%, #FF8C42 100%) !important;
      color: #ffffff !important; /* White text - keep white on orange */
      box-shadow: 0 6px 20px rgba(255, 107, 53, 0.5) !important;
    }
    html[data-theme="dark"] & {
      background: linear-gradient(135deg, #FFC107 0%, #FFD700 50%, #FFC107 100%) !important;
      color: #000000 !important; /* Black text - keep black on yellow */
      box-shadow: 0 6px 20px rgba(255, 215, 0, 0.6) !important;
    }
    
    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(-1px);
    html[data-theme="light"] & {
      background: linear-gradient(135deg, #E64A19 0%, #FF5722 50%, #FF6B35 100%) !important;
      color: #ffffff !important; /* White text - keep white on orange */
      box-shadow: 0 3px 10px rgba(255, 107, 53, 0.4) !important;
    }
    html[data-theme="dark"] & {
      background: linear-gradient(135deg, #FFA000 0%, #FFC107 50%, #FFD700 100%) !important;
      color: #000000 !important; /* Black text - keep black on yellow */
      box-shadow: 0 3px 10px rgba(255, 215, 0, 0.5) !important;
    }
  }

  &.secondary {
    /* Light mode: Orange gradient background, White text */
    html[data-theme="light"] & {
      background: linear-gradient(135deg, #FF8C42 0%, #FF6B35 50%, #FF5722 100%) !important;
      color: #ffffff !important; /* White text */
      box-shadow: 0 4px 15px rgba(255, 107, 53, 0.35) !important;
    }

    /* Dark mode: Yellow gradient background, Black text */
    html[data-theme="dark"] & {
      background: linear-gradient(135deg, #FFC107 0%, #FFD700 50%, #FFA000 100%) !important;
      color: #000000 !important; /* Black text */
      box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4) !important;
    }

    &:hover {
      html[data-theme="light"] & {
        background: linear-gradient(135deg, #FF6B35 0%, #FF5722 50%, #E64A19 100%) !important;
        color: #ffffff !important; /* White text - keep white on orange */
        box-shadow: 0 6px 20px rgba(255, 107, 53, 0.5) !important;
      }
      html[data-theme="dark"] & {
        background: linear-gradient(135deg, #FFD700 0%, #FFC107 50%, #FFA000 100%) !important;
        color: #000000 !important; /* Black text - keep black on yellow */
        box-shadow: 0 6px 20px rgba(255, 215, 0, 0.6) !important;
      }
    }

    &:active {
      html[data-theme="light"] & {
        background: linear-gradient(135deg, #E64A19 0%, #FF5722 50%, #FF6B35 100%) !important;
        color: #ffffff !important; /* White text - keep white on orange */
      }
      html[data-theme="dark"] & {
        background: linear-gradient(135deg, #FFA000 0%, #FFC107 50%, #FFD700 100%) !important;
        color: #000000 !important; /* Black text - keep black on yellow */
      }
    }
  }
  
  /* MOBILE - Full-width touch-optimized (Facebook/Instagram CTA) */
  @media (max-width: 768px) {
    display: block;
    width: 100%;
    padding: 14px 24px;
    font-size: 1rem;  /* 16px - clear */
    font-weight: 700;
    min-height: 52px;  /* Larger for hero CTAs */
    border-radius: 12px;  /* More rounded */
    text-align: center;
    
    /* Better touch feedback */
    -webkit-tap-highlight-color: transparent;
    user-select: none;
    
    &:active {
      transform: scale(0.98);
    }
  }
  
  @media (max-width: 480px) {
    padding: 12px 20px;
    font-size: 0.9375rem;  /* 15px */
    min-height: 50px;
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

export default memo(HeroSectionComponent);