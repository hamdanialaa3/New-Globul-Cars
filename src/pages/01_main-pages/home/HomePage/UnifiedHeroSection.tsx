/**
 * UnifiedHeroSection.tsx (v3.0 - Mobile.de Style)
 * Обединен Hero раздел - Стил mobile.de
 * Unified Hero Section - Mobile.de Style
 * 
 * Philosophy / Философия:
 * ✅ Clean, minimal design inspired by mobile.de
 * ✅ Search Widget centered and prominent
 * ✅ Simple background (light gray/white)
 * ✅ No extra elements - focus on search
 * 
 * Structure / Структура:
 * - Simple background
 * - Search Widget in center
 * - Mobile-first responsive
 * 
 * Features / Характеристики:
 * ✅ Clean styling matching mobile.de
 * ✅ Search-centric UX
 * ✅ Simple and focused
 * 
 * @performance optimized, memoized
 * @responsive mobile-first with proper breakpoints
 * @a11y accessible semantic HTML + ARIA labels
 */

import React, { memo } from 'react';
import styled from 'styled-components';
import { useTheme } from '../../../../contexts/ThemeContext';
import SearchWidget from './SearchWidget';

// ============================================================================
// CINEMATIC HERO BACKGROUND
// ============================================================================


const HeroContainer = styled.section<{ $isDark: boolean }>`
  position: relative;
  overflow: hidden; 
  min-height: 500px; /* Increased for better image display */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 60px 24px; /* Increased padding */
  width: 100%;
  max-width: 1400px; /* Same width as other sections */
  margin: 0 auto; /* Center the container */
  /* 🟣 Purple LED strip */
  border: 1px solid rgba(168, 85, 247, 0.15);
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(168, 85, 247, 0.1), inset 0 0 20px rgba(168, 85, 247, 0.05);
  
  /* Fallback background color */
  background-color: ${props => props.$isDark ? '#0f172a' : '#1a1a2e'};
  
  /* Dark overlay - 30% opacity to achieve 70% image transparency */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.$isDark 
      ? 'rgba(15, 23, 42, 0.3)' 
      : 'rgba(255, 255, 255, 0.3)'};
    z-index: 1;
  }
  
  color: ${props => props.$isDark ? '#e8eef7' : '#ffffff'};
  
  @media (max-width: 1024px) {
    padding: 50px 20px;
  }
  
  @media (max-width: 768px) {
    min-height: 450px;
    padding: 40px 16px;
  }
  
  @media (max-width: 640px) {
    min-height: 400px;
    padding: 32px 16px;
  }
`;

const HeroBgImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  z-index: 0;
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  @media (max-width: 640px) {
    width: 100%;
  }
`;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * UnifiedHeroSection (v3.0 - Mobile.de Style)
 * Обединен Hero раздел - Стил mobile.de
 * Unified Hero Section - Mobile.de Style
 * 
 * Features / Характеристики:
 * ✅ Clean, minimal design matching mobile.de
 * ✅ Search Widget centered and prominent
 * ✅ Simple background
 * ✅ Focus on search functionality
 * 
 * @performance memoized
 * @responsive mobile-first
 * @accessible semantic HTML
 */
const UnifiedHeroSection: React.FC = memo(() => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <HeroContainer $isDark={isDark}>
      <picture>
        <source
          media="(max-width: 768px)"
          srcSet="/hero-bg-mobile.webp"
          type="image/webp"
        />
        <HeroBgImage
          src="/hero-bg.webp"
          alt=""
          width={1920}
          height={1080}
          // @ts-ignore - fetchpriority is a valid HTML attribute
          fetchpriority="high"
          decoding="sync"
        />
      </picture>
      <ContentWrapper>
        <SearchWidget />
      </ContentWrapper>
    </HeroContainer>
  );
});

UnifiedHeroSection.displayName = 'UnifiedHeroSection';

export default UnifiedHeroSection;
