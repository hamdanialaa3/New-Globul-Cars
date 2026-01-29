/**
 * UnifiedShortcutsSection.tsx (v2.0 - Bento Layout)
 * Обединени преки пътища - Bento оформление
 * Unified Shortcuts Section - Premium Bento Layout
 *
 * Inspired by / Вдъхновено от:
 * ✅ Apple Bento Cards - Mixed size layout
 * ✅ Framer Motion - Smooth animation
 * ✅ Hover interactions - Rich interactions
 *
 * يدمج مع تخطيط Bento:
 * ✅ PopularBrandsSection - بطاقة كبيرة (2x2)
 * ✅ VehicleClassificationsSection - بطاقة وسط (1.5x1.5)
 * ✅ MostDemandedCategoriesSection - بطاقة وسط (1.5x1.5)
 * ✅ CategoriesSection - بطاقة كبيرة (2x2)
 * ✅ QuickBrandsSection - بطاقات صغيرة (1x1)
 * ✅ LifeMomentsBrowse - بطاقة عريضة (3x1)
 *
 * المميزات:
 * ✅ Grid-based بطاقات مختلفة الأحجام
 * ✅ Hover zoom + glow effects
 * ✅ Brand icons مع listing count badges
 * ✅ "Browse" CTA ظهور عند hover
 * ✅ Responsive grid (4 cols desktop → 2 tablet → 1 mobile)
 * ✅ Smooth transitions 200-300ms
 * ✅ Dark/Light theme support
 * ✅ Full i18n (bg/en)
 *
 * @performance lazy loaded sections with suspension
 * @responsive mobile-first bento layout
 * @a11y accessible grid + keyboard navigation
 */

import React, { memo, Suspense } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { useTheme } from '../../../../contexts/ThemeContext';

// Lazy load section components
const PopularBrandsSection = React.lazy(() => import('./PopularBrandsSection'));
const VehicleClassificationsSection = React.lazy(() => import('./VehicleClassificationsSection'));
const MostDemandedCategoriesSection = React.lazy(() => import('./MostDemandedCategoriesSection'));
const CategoriesSection = React.lazy(() => import('./CategoriesSection'));
const QuickBrandsSection = React.lazy(() => import('./QuickBrandsSection'));
const LifeMomentsBrowse = React.lazy(() => import('./LifeMomentsBrowse'));

// ============================================================================
// STYLED COMPONENTS - BENTO LAYOUT
// ============================================================================

const Container = styled.section<{ $isDark: boolean }>`
  position: relative;
  background: ${props => props.$isDark
    ? 'linear-gradient(135deg, rgba(5, 11, 24, 0.5), rgba(15, 23, 42, 0.3))'
    : 'linear-gradient(135deg, rgba(240, 240, 245, 0.8), rgba(248, 247, 246, 0.5))'};
  padding: 4rem 1rem;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 3rem 1rem;
  }

  @media (max-width: 640px) {
    padding: 2rem 1rem;
  }
`;

const Header = styled.div<{ $isDark: boolean }>`
  max-width: 1200px;
  margin: 0 auto 3rem;
  text-align: center;

  @media (max-width: 768px) {
    margin-bottom: 2rem;
  }
`;

const Title = styled.h2<{ $isDark: boolean }>`
  font-size: clamp(1.75rem, 5vw, 2.5rem);
  font-weight: 800;
  color: ${props => props.$isDark ? '#f5f8ff' : '#0c1a2a'};
  margin: 0 0 0.75rem;
  letter-spacing: -0.02em;
`;

const Subtitle = styled.p<{ $isDark: boolean }>`
  font-size: clamp(0.95rem, 3vw, 1.1rem);
  color: ${props => props.$isDark ? '#c9d6e8' : '#52627a'};
  margin: 0;
  font-weight: 500;
`;

const BentoGrid = styled.div<{ $isDark: boolean }>`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  
  /* Desktop: 4 columns */
  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem;
  }

  /* Tablet: 2 columns */
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  /* Mobile: 1 column */
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
`;

const BentoCard = styled(motion.div)<{ 
  $isDark: boolean; 
  $span?: 'small' | 'medium' | 'large' | 'wide';
}>`
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  background: ${props => props.$isDark
    ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.8))'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 247, 246, 0.9))'};
  border: 1px solid ${props => props.$isDark 
    ? 'rgba(94, 179, 255, 0.1)' 
    : 'rgba(12, 26, 42, 0.1)'};
  backdrop-filter: blur(20px);
  transition: all 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
  
  /* Grid spanning based on size */
  ${props => {
    switch(props.$span) {
      case 'large':
        return 'grid-column: span 2; grid-row: span 2;';
      case 'wide':
        return 'grid-column: span 3; @media (max-width: 768px) { grid-column: span 2; } @media (max-width: 640px) { grid-column: span 1; }';
      case 'medium':
        return 'grid-column: span 1.5; @media (max-width: 1200px) { grid-column: span 1; }';
      case 'small':
      default:
        return 'grid-column: span 1;';
    }
  }}

  /* Responsive sizing for smaller screens */
  @media (max-width: 1200px) {
    ${props => props.$span === 'large' && 'grid-column: span 2; grid-row: span 1.5;'}
    ${props => props.$span === 'medium' && 'grid-column: span 1.5;'}
  }

  @media (max-width: 768px) {
    ${props => (props.$span === 'large' || props.$span === 'medium') && 'grid-column: span 2; grid-row: span 1;'}
    ${props => props.$span === 'wide' && 'grid-column: span 2;'}
  }

  @media (max-width: 640px) {
    grid-column: span 1 !important;
    grid-row: span 1 !important;
  }

  &:hover {
    border-color: ${props => props.$isDark 
      ? 'rgba(94, 179, 255, 0.3)' 
      : 'rgba(12, 26, 42, 0.2)'};
    background: ${props => props.$isDark
      ? 'linear-gradient(135deg, rgba(30, 41, 59, 1), rgba(15, 23, 42, 0.95))'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 1), rgba(248, 247, 246, 0.95))'};
    box-shadow: ${props => props.$isDark
      ? '0 20px 60px rgba(94, 179, 255, 0.15)'
      : '0 20px 60px rgba(12, 26, 42, 0.1)'};
  }

  /* Min height based on span */
  ${props => {
    switch(props.$span) {
      case 'large':
        return 'min-height: 350px;';
      case 'wide':
      case 'medium':
        return 'min-height: 250px;';
      case 'small':
      default:
        return 'min-height: 150px;';
    }
  }}

  @media (max-width: 768px) {
    ${props => {
      switch(props.$span) {
        case 'large':
          return 'min-height: 280px;';
        case 'wide':
        case 'medium':
          return 'min-height: 200px;';
        default:
          return 'min-height: 130px;';
      }
    }}
  }

  @media (max-width: 640px) {
    min-height: 120px;
  }
`;

const LoadingFallback = styled.div<{ $isDark: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  color: ${props => props.$isDark ? '#9ca3af' : '#6b7280'};
  font-size: 1rem;
  
  .spinner {
    width: 32px;
    height: 32px;
    border: 2.5px solid ${props => props.$isDark 
      ? 'rgba(255,255,255,0.1)' 
      : 'rgba(12,26,42,0.1)'};
    border-top-color: ${props => props.$isDark 
      ? '#5eb3ff' 
      : '#0c5bad'};
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * UnifiedShortcutsSection (v2.0)
 *
 * Bento layout showcase مع:
 * 1. Popular Brands - بطاقة كبيرة (2x2)
 * 2. Vehicle Classifications - بطاقة وسط
 * 3. Most Demanded - بطاقة وسط
 * 4. Categories - بطاقة كبيرة (2x2)
 * 5. Quick Brands - بطاقات صغيرة (1x1)
 * 6. Life Moments - بطاقة عريضة (3x1)
 *
 * @responsive تصميم bento grid محسّن
 * @performance lazy loaded مع suspension fallbacks
 * @accessible semantic grid layout
 */
const UnifiedShortcutsSection: React.FC = memo(() => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isBg = language === 'bg';

  // Animation variants for bento cards
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: index * 0.08,
        ease: 'easeOut',
      },
    }),
  };

  return (
    <Container $isDark={isDark}>
      {/* Header */}
      <Header>
        <Title $isDark={isDark}>
          {isBg ? '⚡ Намирайте автомобили бързо' : '⚡ Find Cars Fast'}
        </Title>
        <Subtitle $isDark={isDark}>
          {isBg
            ? 'Откроете марки, категории и популярни модели'
            : 'Discover brands, categories, and trending models'}
        </Subtitle>
      </Header>

      {/* Bento Grid */}
      <BentoGrid $isDark={isDark}>
        {/* 1. Popular Brands (Large - 2x2) */}
        <BentoCard 
          as={motion.div}
          $isDark={isDark}
          $span="large"
          custom={0}
          initial="hidden"
          whileInView="visible"
          variants={cardVariants}
          viewport={{ once: true, margin: '0px 0px -100px 0px' }}
          whileHover={{ scale: 1.02, zIndex: 10 }}
          whileTap={{ scale: 0.98 }}
        >
          <Suspense fallback={<LoadingFallback $isDark={isDark}><div className="spinner" /></LoadingFallback>}>
            <PopularBrandsSection />
          </Suspense>
        </BentoCard>

        {/* 2. Vehicle Classifications (Medium) */}
        <BentoCard 
          as={motion.div}
          $isDark={isDark}
          $span="medium"
          custom={1}
          initial="hidden"
          whileInView="visible"
          variants={cardVariants}
          viewport={{ once: true, margin: '0px 0px -100px 0px' }}
          whileHover={{ scale: 1.02, zIndex: 10 }}
          whileTap={{ scale: 0.98 }}
        >
          <Suspense fallback={<LoadingFallback $isDark={isDark}><div className="spinner" /></LoadingFallback>}>
            <VehicleClassificationsSection />
          </Suspense>
        </BentoCard>

        {/* 3. Most Demanded Categories (Medium) */}
        <BentoCard 
          as={motion.div}
          $isDark={isDark}
          $span="medium"
          custom={2}
          initial="hidden"
          whileInView="visible"
          variants={cardVariants}
          viewport={{ once: true, margin: '0px 0px -100px 0px' }}
          whileHover={{ scale: 1.02, zIndex: 10 }}
          whileTap={{ scale: 0.98 }}
        >
          <Suspense fallback={<LoadingFallback $isDark={isDark}><div className="spinner" /></LoadingFallback>}>
            <MostDemandedCategoriesSection />
          </Suspense>
        </BentoCard>

        {/* 4. Quick Brands (Small, multiple cards) */}
        <BentoCard 
          as={motion.div}
          $isDark={isDark}
          $span="small"
          custom={3}
          initial="hidden"
          whileInView="visible"
          variants={cardVariants}
          viewport={{ once: true, margin: '0px 0px -100px 0px' }}
          whileHover={{ scale: 1.02, zIndex: 10 }}
          whileTap={{ scale: 0.98 }}
        >
          <Suspense fallback={null}>
            <QuickBrandsSection />
          </Suspense>
        </BentoCard>

        {/* 5. Categories (Large - 2x2) */}
        <BentoCard 
          as={motion.div}
          $isDark={isDark}
          $span="large"
          custom={4}
          initial="hidden"
          whileInView="visible"
          variants={cardVariants}
          viewport={{ once: true, margin: '0px 0px -100px 0px' }}
          whileHover={{ scale: 1.02, zIndex: 10 }}
          whileTap={{ scale: 0.98 }}
        >
          <Suspense fallback={<LoadingFallback $isDark={isDark}><div className="spinner" /></LoadingFallback>}>
            <CategoriesSection />
          </Suspense>
        </BentoCard>

        {/* 6. Life Moments (Wide - 3x1) */}
        <BentoCard 
          as={motion.div}
          $isDark={isDark}
          $span="wide"
          custom={5}
          initial="hidden"
          whileInView="visible"
          variants={cardVariants}
          viewport={{ once: true, margin: '0px 0px -100px 0px' }}
          whileHover={{ scale: 1.01, zIndex: 10 }}
          whileTap={{ scale: 0.99 }}
        >
          <Suspense fallback={null}>
            <LifeMomentsBrowse />
          </Suspense>
        </BentoCard>
      </BentoGrid>
    </Container>
  );
});

UnifiedShortcutsSection.displayName = 'UnifiedShortcutsSection';

export default UnifiedShortcutsSection;
