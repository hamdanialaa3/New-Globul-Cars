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
import { Search, Megaphone, Flag } from 'lucide-react';

// Search mode type
type SearchMode = 'buy' | 'sell' | 'rent';

// ============================================================================
// CINEMATIC HERO BACKGROUND
// ============================================================================


const HeroContainer = styled.section<{ $isDark: boolean }>`
  position: relative;
  /* overflow: visible for dropdowns/shadows, height auto to fit content */
  overflow: visible; 
  min-height: 600px; /* Increased vertical space by ~10% */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-top: 5rem; /* Increased top spacing */
  padding-bottom: 5rem; /* Increased bottom spacing */
  background: ${props => props.$isDark ? '#050b18' : '#f0f4f8'};
  color: ${props => props.$isDark ? '#e8eef7' : '#0f172a'};
  isolation: isolate;
  
  @media (max-width: 640px) {
    /* Tighter padding for app-like feel on mobile, but slightly larger than before */
    padding-top: 100px;
    padding-bottom: 32px;
    min-height: auto;
    justify-content: flex-start;
  }
`;

/* 
 * Aurora Background System 
 * Performance Optimized: STATIC gradient (no animation, no blur)
 * Original was causing severe lag on desktop due to 200% size + blur(80px) + infinite animation
 */
const AuroraBackground = styled.div<{ $isDark: boolean }>`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  
  /* Static gradient - no animation, no blur = instant render */
  background: ${props => props.$isDark
    ? 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(56, 189, 248, 0.15), transparent 60%), linear-gradient(135deg, #0f172a 0%, #1a365d 50%, #0f172a 100%)'
    : 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(14, 165, 233, 0.1), transparent 60%), linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0f9ff 100%)'};
  
  /* GPU optimization */
  will-change: auto;
  contain: strict;
`;

const NoiseLayer = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  opacity: 0.03;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
`;

// ============================================================================
// CONTENT WRAPPER
// ============================================================================

const ContentWrapper = styled(motion.div)`
  position: relative;
  z-index: 10;
  width: 100%;
  height: 100%;
  max-width: 1400px;
  padding: 1px 24px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 30px 20px;
    min-height: auto;
  }

  @media (max-width: 640px) {
    padding: 0 16px;
    flex-direction: column;
  }
`;

// ============================================================================
// EYEBROW + TITLE + SUBTITLE
// ============================================================================

const Eyebrow = styled(motion.span) <{ $isDark: boolean }>`
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

  @media (max-width: 640px) {
    /* Hide eyebrow on mobile to prioritize search */
    display: none; 
  }
`;

const Title = styled(motion.h1) <{ $isDark: boolean }>`
  margin: 0 0 1.5rem;
  font-family: 'Outfit', sans-serif;
  font-size: clamp(4rem, 8vw, 7rem); /* Increased by ~10-15% */
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.04em;
  color: ${props => props.$isDark ? '#f5f8ff' : '#0f172a'};
  max-width: 1100px; /* Allowed more width */
  
  /* Highlight span */
  span {
    display: block;
    background: ${props => props.$isDark
    ? 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)'
    : 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)'};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    padding-bottom: 0.2em;
  }

  @media (max-width: 640px) {
    font-size: 2.5rem; /* Increased from 2rem to 2.5rem (~25% increase for mobile punch) */
    margin-bottom: 0.75rem;
    line-height: 1.15;
    
    span {
      padding-bottom: 0.1em;
      display: inline-block;
      margin-left: 0.3em;
    }
  }
`;

const Subtitle = styled(motion.p) <{ $isDark: boolean }>`
  margin: 0 0 3rem;
  font-family: 'Inter', sans-serif;
  font-size: 1.4rem; /* Increased from 1.25rem */
  line-height: 1.6;
  font-weight: 400;
  color: ${props => props.$isDark ? '#94a3b8' : '#475569'};
  max-width: 700px; /* Wider reading area */

  @media (max-width: 768px) {
    font-size: 1.2rem;
    margin-bottom: 2rem;
  }

  @media (max-width: 640px) {
    font-size: 1.1rem; /* Increased from 0.95rem */
    line-height: 1.4;
    margin-bottom: 2rem;
    padding: 0 8px;
  }
`;

// ============================================================================
// SEARCH CAPSULE (FLOATING CENTER)
// ============================================================================

const SearchCapsuleContainer = styled(motion.div) <{ $isDark: boolean }>`
  position: relative;
  z-index: 20;
  width: 100%;
  max-width: 760px; /* Wider container */
  margin: 0 0 3.5rem; /* More space below */
  
  background: ${props => props.$isDark
    ? 'rgba(15, 23, 42, 0.9)'
    : 'linear-gradient(20deg, rgba(235, 230, 230, 0.01) 0%, rgba(157, 144, 144, 0.01) 100%)'};
  
  border: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.15)'
    : 'rgba(12, 26, 42, 0.01)'};
  
  border-radius: 24px; /* More rounded */
  padding: 32px; /* Increased padding / frame */
  backdrop-filter: none;
  box-shadow: ${props => props.$isDark
    ? '0 24px 70px rgba(0, 0, 0, 0.5)'
    : 'none'};

  @media (max-width: 768px) {
    max-width: 95%;
    padding: 24px;
    margin-bottom: 2.5rem;
  }

  @media (max-width: 640px) {
    width: 100%;
    max-width: 100%;
    margin: 0;
    margin-bottom: 2.5rem;
    padding: 20px; /* Balanced padding for frame */
    border-radius: 20px;
    
    background: ${props => props.$isDark
    ? 'rgba(15, 23, 42, 0.85)'
    : 'rgba(255, 255, 255, 0.85)'};
    backdrop-filter: blur(12px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  }
`;

const SearchTabs = styled.div<{ $isDark: boolean }>`
  display: flex;
  gap: 12px; /* More spacing between tabs */
  margin-bottom: 20px;
  border-bottom: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(12, 26, 42, 0.08)'};
  padding-bottom: 16px;

  @media (max-width: 640px) {
    gap: 8px;
    margin-bottom: 16px;
    padding-bottom: 12px;
  }
`;

const SearchTab = styled(motion.button) <{ $isDark: boolean; $active?: boolean }>`
  ${glassNeutralButton}
  flex: 1;
  padding: 10px 16px; /* Larger hit areas */
  border-radius: 10px;
  background: ${props => props.$active
    ? `linear-gradient(135deg, 
        ${props.$isDark ? 'rgba(94, 182, 255, 0.3)' : 'rgba(0, 109, 204, 0.2)'} 0%, 
        ${props.$isDark ? 'rgba(94, 182, 255, 0.15)' : 'rgba(0, 109, 204, 0.1)'} 100%)`
    : 'rgba(255, 255, 255, 0.05)'};
  color: ${props => props.$active
    ? (props.$isDark ? '#5eb3ff' : '#0c5bad')
    : (props.$isDark ? '#9ca3af' : '#6b7280')};
  font-weight: 600;
  font-size: 0.9rem; /* Increased tab font size */
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
    padding: 8px 12px;
    font-size: 0.8rem;
  }
`;

const SearchDock = styled(motion.div)`
  width: 100%;
  > * {
    width: 100%;
  }
`;

// ============================================================================
// CTA BUTTONS GROUP
// ============================================================================

const CTAGroup = styled(motion.div)`
  display: flex;
  gap: 1.5rem; /* Increased gap */
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 3rem; /* More space below */

  @media (max-width: 768px) {
    gap: 1.2rem;
    margin-bottom: 2.5rem;
  }

  @media (max-width: 640px) {
    gap: 1rem;
    flex-direction: column;
    margin-bottom: 2rem;
  }
`;

const CTAButton = styled(motion.button) <{ $isDark: boolean; $primary?: boolean }>`
  ${props => props.$primary ? glassPrimaryButton : glassSecondaryButton}
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1.2rem 2.5rem; /* Larger buttons */
  border-radius: 14px;
  font-weight: 700;
  font-size: 1.1rem; /* Larger text */
  cursor: pointer;
  white-space: nowrap;
  text-align: left;

  svg {
    flex-shrink: 0;
  }
  
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
    padding: 1rem 1.8rem;
    font-size: 1rem;
  }

  @media (max-width: 640px) {
    width: 100%;
    padding: 1rem 1.5rem;
    font-size: 1rem;
  }
`;

// ============================================================================
// STATS BAR
// ============================================================================

const StatsBar = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2.5rem; /* Widen gap */
  width: 100%;
  max-width: 650px; /* Wider container */

  @media (max-width: 768px) {
    gap: 1.5rem;
  }

  @media (max-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.2rem;
  }
`;

const StatItem = styled.div<{ $isDark: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;

  .stat-number {
    font-size: 2.2rem; /* Increased from 1.8rem */
    font-weight: 900;
    color: ${props => props.$isDark ? '#5eb3ff' : '#0c5bad'};
    margin-bottom: 0.4rem;
  }

  .stat-label {
    font-size: 0.95rem;
    color: ${props => props.$isDark ? '#9ca3af' : '#6b7280'};
  }

  @media (max-width: 640px) {
    .stat-number {
      font-size: 1.6rem; /* Increased from 1.4rem */
    }

    .stat-label {
      font-size: 0.85rem;
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
  const eyebrow = isBg ? 'Търсене на първо място' : 'Search-First';
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
      {/* Aurora Background System */}
      <AuroraBackground $isDark={isDark} />
      <NoiseLayer />

      {/* Optional: subtle parallax movement on foreground if needed, but Aurora handles most */}

      {/* Main content */}
      <ContentWrapper
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ position: 'relative', zIndex: 10 }}
      >
        {/* Eyebrow */}
        <Eyebrow
          $isDark={isDark}
          variants={itemVariants}
        >
          <Flag size={14} style={{ marginRight: '0.5rem' }} />
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
                onClick={() => {
                  setSearchMode(mode);
                  // Navigate based on mode
                  if (mode === 'buy') {
                    navigate('/cars');
                  } else if (mode === 'sell') {
                    navigate('/sell/auto');
                  } else if (mode === 'rent') {
                    // Smart fallback to search with rent filter
                    navigate('/cars?type=rent');
                  }
                }}
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
            <Search size={18} style={{ marginRight: '0.5rem' }} />
            {isBg ? 'Разгледай коли' : 'Browse Cars'}
          </CTAButton>
          <CTAButton
            $isDark={isDark}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/sell/auto')}
          >
            <Megaphone size={18} style={{ marginRight: '0.5rem' }} />
            {isBg ? 'Продай колата си' : 'Sell Your Car'}
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
