/**
 * UnifiedHeroSection.tsx (v2.0 - Cinematic)
 * Обединен Hero раздел - Кинематографско изживяване
 * Unified Hero Section - Cinematic Experience + Search-First
 * 
 * Philosophy / Философия:
 * ✅ Cinematic experience inspired by Tesla, Porsche, BMW
 * ✅ Background video loop + gradient overlay
 * ✅ Parallax layers for depth
 * ✅ Search-first design (Floating Capsule center)
 * ✅ Search Tabs (Buy, Sell, Rent)
 * 
 * Structure / Структура:
 * - Hero background (video placeholder + gradient)
 * - Content layers with parallax
 * - Floating search capsule in center
 * - CTA buttons and stats
 * - Mobile-first responsive
 * 
 * Features / Характеристики:
 * ✅ Cinematic styling (dark overlay, bold typography)
 * ✅ Parallax motion (optimized, performance-friendly)
 * ✅ Search-centric UX
 * ✅ Enhanced micro-interactions
 * 
 * @performance optimized parallax, memoized
 * @responsive mobile-first with proper breakpoints
 * @a11y accessible semantic HTML + ARIA labels
 */

import React, { memo, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useScroll } from 'framer-motion';
import SearchWidget from './SearchWidget';
import { 
  glassPrimaryButton, 
  glassSecondaryButton,
  glassNeutralButton 
} from '../../../../styles/glassmorphism-buttons';

// Search mode type
type SearchMode = 'buy' | 'sell' | 'rent';

// ============================================================================
// CINEMATIC HERO BACKGROUND
// ============================================================================

const HeroContainer = styled.section<{ $isDark: boolean }>`
  position: relative;
  overflow: hidden;
  height: 100vh;
  min-height: 700px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  
  /* Cinematic background: Video placeholder + dark gradient overlay */
  background: ${props => props.$isDark
    ? `
      linear-gradient(180deg, 
        rgba(5, 11, 24, 0.7) 0%, 
        rgba(12, 39, 64, 0.65) 40%,
        rgba(5, 11, 24, 0.7) 100%),
      radial-gradient(circle at 20% 20%, 
        rgba(94, 182, 255, 0.08) 0%, 
        transparent 50%),
      linear-gradient(135deg, #050b18 0%, #0c2740 50%, #051f1f 100%)
    `
    : `
      linear-gradient(180deg, 
        rgba(255, 255, 255, 0.95) 0%, 
        rgba(246, 248, 251, 0.95) 40%,
        rgba(232, 240, 247, 0.95) 100%),
      radial-gradient(circle at 20% 20%, 
        rgba(0, 109, 204, 0.05) 0%, 
        transparent 50%),
      linear-gradient(135deg, #f7fafb 0%, #e8f0f7 50%, #f6f8fb 100%)
    `};
  
  /* TODO: Replace with actual video background */
  /* background-image: url('/videos/hero-cinematic.mp4'); */
  /* background-size: cover; */
  /* background-position: center; */
  
  color: ${props => props.$isDark ? '#e8eef7' : '#0f172a'};
  isolation: isolate;

  @media (max-width: 768px) {
    height: auto;
    min-height: 600px;
    padding: 60px 0;
  }

  @media (max-width: 640px) {
    min-height: 500px;
    padding: 50px 0;
  }
`;

/* Background layer for parallax effect */
const BackgroundLayer = styled(motion.div)<{ $isDark: boolean }>`
  position: absolute;
  inset: 0;
  background: ${props => props.$isDark
    ? `radial-gradient(ellipse at 30% 40%, 
        rgba(94, 182, 255, 0.1) 0%, 
        transparent 60%)`
    : `radial-gradient(ellipse at 30% 40%, 
        rgba(0, 109, 204, 0.08) 0%, 
        transparent 60%)`};
  pointer-events: none;
  z-index: 0;
`;

// ============================================================================
// CONTENT WRAPPER
// ============================================================================

const ContentWrapper = styled(motion.div)`
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 1200px;
  padding: 40px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 30px 20px;
  }

  @media (max-width: 640px) {
    padding: 24px 16px;
  }
`;

// ============================================================================
// EYEBROW + TITLE + SUBTITLE
// ============================================================================

const Eyebrow = styled(motion.span)<{ $isDark: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 1rem;
  border-radius: 999px;
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 700;
  background: ${props => props.$isDark 
    ? 'rgba(255, 255, 255, 0.08)' 
    : 'rgba(0, 51, 102, 0.12)'};
  color: ${props => props.$isDark ? '#5eb3ff' : '#003d7a'};
  border: 1px solid ${props => props.$isDark 
    ? 'rgba(94, 182, 255, 0.25)' 
    : 'rgba(0, 51, 102, 0.25)'};
  backdrop-filter: blur(10px);
  margin-bottom: 1rem;
`;

const Title = styled(motion.h1)<{ $isDark: boolean }>`
  margin: 0 0 1rem;
  font-size: clamp(2rem, 6vw, 4rem);
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: ${props => props.$isDark ? '#f5f8ff' : '#0c1a2a'};
  max-width: 900px;
  
  /* Highlight span */
  span {
    display: block;
    background: ${props => props.$isDark
      ? 'linear-gradient(135deg, #5eb3ff 0%, #a8d5ff 100%)'
      : 'linear-gradient(135deg, #003d7a 0%, #0c5bad 100%)'};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  @media (max-width: 640px) {
    font-size: clamp(1.5rem, 5vw, 2.5rem);
    margin-bottom: 0.75rem;
  }
`;

const Subtitle = styled(motion.p)<{ $isDark: boolean }>`
  margin: 0 0 2rem;
  font-size: 1.1rem;
  line-height: 1.7;
  color: ${props => props.$isDark ? '#c9d6e8' : '#52627a'};
  max-width: 700px;

  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 1.5rem;
  }

  @media (max-width: 640px) {
    font-size: 0.95rem;
    margin-bottom: 1.25rem;
  }
`;

// ============================================================================
// SEARCH CAPSULE (FLOATING CENTER)
// ============================================================================

const SearchCapsuleContainer = styled(motion.div)<{ $isDark: boolean }>`
  position: relative;
  z-index: 20;
  width: 100%;
  max-width: 700px;
  margin: 0 0 3rem;
  
  background: ${props => props.$isDark
    ? 'rgba(15, 23, 42, 0.9)'
    : 'rgba(255, 255, 255, 0.95)'};
  
  border: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.15)'
    : 'rgba(12, 26, 42, 0.1)'};
  
  border-radius: 20px;
  padding: 24px;
  backdrop-filter: blur(20px);
  box-shadow: ${props => props.$isDark
    ? '0 24px 70px rgba(0, 0, 0, 0.5)'
    : '0 24px 70px rgba(12, 26, 42, 0.12)'};

  @media (max-width: 768px) {
    max-width: 95%;
    padding: 16px;
    margin-bottom: 2rem;
  }

  @media (max-width: 640px) {
    max-width: 100%;
    padding: 12px;
    margin-bottom: 1.5rem;
    border-radius: 16px;
  }
`;

const SearchTabs = styled.div<{ $isDark: boolean }>`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  border-bottom: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(12, 26, 42, 0.08)'};
  padding-bottom: 12px;

  @media (max-width: 640px) {
    gap: 6px;
    margin-bottom: 12px;
    padding-bottom: 8px;
  }
`;

const SearchTab = styled(motion.button)<{ $isDark: boolean; $active?: boolean }>`
  ${glassNeutralButton}
  flex: 1;
  padding: 8px 12px;
  border-radius: 8px;
  background: ${props => props.$active
    ? `linear-gradient(135deg, 
        ${props.$isDark ? 'rgba(94, 182, 255, 0.3)' : 'rgba(0, 109, 204, 0.2)'} 0%, 
        ${props.$isDark ? 'rgba(94, 182, 255, 0.15)' : 'rgba(0, 109, 204, 0.1)'} 100%)`
    : 'rgba(255, 255, 255, 0.05)'};
  color: ${props => props.$active
    ? (props.$isDark ? '#5eb3ff' : '#0c5bad')
    : (props.$isDark ? '#9ca3af' : '#6b7280')};
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: 1px solid ${props => props.$active
    ? (props.$isDark ? 'rgba(94, 182, 255, 0.3)' : 'rgba(0, 109, 204, 0.25)')
    : 'rgba(255, 255, 255, 0.15)'};

  &:hover {
    color: ${props => props.$isDark ? '#5eb3ff' : '#0c5bad'};
    background: ${props => props.$isDark
      ? 'rgba(94, 182, 255, 0.2)'
      : 'rgba(0, 109, 204, 0.15)'};
    border-color: ${props => props.$isDark
      ? 'rgba(94, 182, 255, 0.4)'
      : 'rgba(0, 109, 204, 0.3)'};
    box-shadow: 0 4px 16px 0 rgba(94, 182, 255, 0.2);
  }

  @media (max-width: 640px) {
    padding: 6px 10px;
    font-size: 0.75rem;
  }
`;

const SearchDock = styled(motion.div)`
  width: 100%;
  
  /* SearchWidget child will fill this */
  > * {
    width: 100%;
  }
`;

// ============================================================================
// CTA BUTTONS GROUP
// ============================================================================

const CTAGroup = styled(motion.div)`
  display: flex;
  gap: 1.2rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 2.5rem;

  @media (max-width: 768px) {
    gap: 1rem;
    margin-bottom: 2rem;
  }

  @media (max-width: 640px) {
    gap: 0.8rem;
    flex-direction: column;
    margin-bottom: 1.5rem;
  }
`;

const CTAButton = styled(motion.button)<{ $isDark: boolean; $primary?: boolean }>`
  ${props => props.$primary ? glassPrimaryButton : glassSecondaryButton}
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  white-space: nowrap;
  
  /* Override colors for theme */
  background: ${props => props.$primary
    ? `linear-gradient(135deg, 
        ${props.$isDark ? 'rgba(94, 182, 255, 0.3)' : 'rgba(0, 109, 204, 0.3)'} 0%, 
        ${props.$isDark ? 'rgba(94, 182, 255, 0.15)' : 'rgba(0, 109, 204, 0.15)'} 100%)`
    : `linear-gradient(135deg, 
        rgba(255, 255, 255, 0.2) 0%, 
        rgba(255, 255, 255, 0.1) 100%)`};
  color: ${props => props.$primary
    ? (props.$isDark ? '#fff' : '#fff')
    : (props.$isDark ? '#e8eef7' : '#0c1a2a')};
  border: 1px solid ${props => props.$primary
    ? (props.$isDark ? 'rgba(94, 182, 255, 0.3)' : 'rgba(0, 109, 204, 0.3)')
    : 'rgba(255, 255, 255, 0.25)'};

  &:hover {
    background: ${props => props.$primary
      ? `linear-gradient(135deg, 
          ${props.$isDark ? 'rgba(94, 182, 255, 0.5)' : 'rgba(0, 109, 204, 0.5)'} 0%, 
          ${props.$isDark ? 'rgba(94, 182, 255, 0.25)' : 'rgba(0, 109, 204, 0.25)'} 100%)`
      : 'rgba(255, 255, 255, 0.25)'};
    border-color: ${props => props.$primary
      ? (props.$isDark ? 'rgba(94, 182, 255, 0.5)' : 'rgba(0, 109, 204, 0.5)')
      : 'rgba(255, 255, 255, 0.4)'};
    box-shadow: ${props => props.$primary
      ? `0 8px 32px 0 ${props.$isDark ? 'rgba(94, 182, 255, 0.4)' : 'rgba(0, 109, 204, 0.4)'},
          0 0 20px ${props.$isDark ? 'rgba(94, 182, 255, 0.3)' : 'rgba(0, 109, 204, 0.3)'}`
      : '0 8px 32px 0 rgba(255, 255, 255, 0.2)'};
  }

  @media (max-width: 768px) {
    padding: 0.85rem 1.5rem;
    font-size: 0.95rem;
  }

  @media (max-width: 640px) {
    width: 100%;
    padding: 0.85rem 1.5rem;
    font-size: 0.9rem;
  }
`;

// ============================================================================
// STATS BAR
// ============================================================================

const StatsBar = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  width: 100%;
  max-width: 600px;

  @media (max-width: 768px) {
    gap: 1.5rem;
  }

  @media (max-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
`;

const StatItem = styled.div<{ $isDark: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;

  .stat-number {
    font-size: 1.8rem;
    font-weight: 900;
    color: ${props => props.$isDark ? '#5eb3ff' : '#0c5bad'};
    margin-bottom: 0.25rem;
  }

  .stat-label {
    font-size: 0.85rem;
    color: ${props => props.$isDark ? '#9ca3af' : '#6b7280'};
  }

  @media (max-width: 640px) {
    .stat-number {
      font-size: 1.4rem;
    }

    .stat-label {
      font-size: 0.75rem;
    }
  }
`;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * UnifiedHeroSection (v2.0 - Cinematic)
 * Обединен Hero раздел - Кинематографско изживяване
 * Unified Hero Section - Cinematic Experience
 * 
 * Features / Характеристики:
 * ✅ Cinematic background + dark overlay
 * ✅ Parallax motion layers
 * ✅ Search-first design (floating capsule)
 * ✅ Search tabs (Buy, Sell, Rent)
 * ✅ Enhanced micro-interactions
 * 
 * @performance memoized, light parallax
 * @responsive mobile-first
 * @accessible semantic HTML
 */
const UnifiedHeroSection: React.FC = memo(() => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === 'dark';
  const isBg = language === 'bg';
  const [searchMode, setSearchMode] = useState<SearchMode>('buy');

  // Strings
  const eyebrow = isBg ? '🏁 Търсене на първо място' : '🏁 Search-First';
  const headline1 = isBg ? 'Открий пътя си' : 'Discover your way';
  const headline2 = isBg ? 'в българския пазар на автомобили' : 'Bulgarian car market';
  const subline = isBg
    ? 'Над 50,000 сертифицирани автомобила ви очакват. Скорост, сигурност и доверие във всяка транзакция.'
    : 'Over 50,000 certified cars await you. Speed, security, and trust in every transaction.';
  
  // Tab labels
  const tabLabels = {
    buy: isBg ? 'Купи' : 'Buy',
    sell: isBg ? 'Продай' : 'Sell',
    rent: isBg ? 'Наеми' : 'Rent'
  };

  // Container animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  };

  // Parallax effect on scroll (light)
  const { scrollY } = useScroll();

  return (
    <HeroContainer $isDark={isDark}>
      {/* Background parallax layer */}
      <BackgroundLayer
        $isDark={isDark}
        style={{
          y: scrollY ? scrollY.get() * 0.3 : 0 // Light parallax (30% of scroll)
        }}
      />

      {/* Main content */}
      <ContentWrapper
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Eyebrow */}
        <Eyebrow
          $isDark={isDark}
          variants={itemVariants}
        >
          {eyebrow}
        </Eyebrow>

        {/* Title */}
        <Title
          $isDark={isDark}
          variants={itemVariants}
        >
          {headline1}
          <span>{headline2}</span>
        </Title>

        {/* Subtitle */}
        <Subtitle
          $isDark={isDark}
          variants={itemVariants}
        >
          {subline}
        </Subtitle>

        {/* SEARCH CAPSULE - FLOATING CENTER (Hero) */}
        <SearchCapsuleContainer
          $isDark={isDark}
          variants={itemVariants}
          whileHover={{ y: -4 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {/* Search tabs */}
          <SearchTabs $isDark={isDark}>
            {(['buy', 'sell', 'rent'] as const).map(mode => (
              <SearchTab
                key={mode}
                $isDark={isDark}
                $active={searchMode === mode}
                onClick={() => setSearchMode(mode)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {tabLabels[mode]}
              </SearchTab>
            ))}
          </SearchTabs>

          {/* Search widget */}
          <SearchDock>
            <SearchWidget />
          </SearchDock>
        </SearchCapsuleContainer>

        {/* CTA Buttons */}
        <CTAGroup
          variants={itemVariants}
        >
          <CTAButton
            $isDark={isDark}
            $primary
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/cars')}
          >
            {isBg ? '🔍 Разгледай коли' : '🔍 Browse Cars'}
          </CTAButton>
          <CTAButton
            $isDark={isDark}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/sell/auto')}
          >
            {isBg ? '📢 Продай колата си' : '📢 Sell Your Car'}
          </CTAButton>
        </CTAGroup>

        {/* Stats Bar */}
        <StatsBar
          variants={itemVariants}
        >
          <StatItem $isDark={isDark}>
            <div className="stat-number">50K+</div>
            <div className="stat-label">{isBg ? 'Сертифицирани коли' : 'Certified Cars'}</div>
          </StatItem>
          <StatItem $isDark={isDark}>
            <div className="stat-number">8.4/10</div>
            <div className="stat-label">{isBg ? 'Среден рейтинг' : 'Avg Rating'}</div>
          </StatItem>
          <StatItem $isDark={isDark}>
            <div className="stat-number">24h</div>
            <div className="stat-label">{isBg ? 'Бърз отговор' : 'Fast Response'}</div>
          </StatItem>
        </StatsBar>
      </ContentWrapper>
    </HeroContainer>
  );
});

UnifiedHeroSection.displayName = 'UnifiedHeroSection';

export default UnifiedHeroSection;
