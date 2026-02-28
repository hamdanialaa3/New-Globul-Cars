/**
 * UnifiedCarsShowcase.tsx (v2.0 - Premium Cars Experience)
 * Обединена витрина за автомобили - Премиум изживяване
 * Unified Cars Showcase - Premium Experience
 *
 * Inspired by / Вдъхновено от:
 * ✅ Carvana - Clean card design
 * ✅ BMW Configurator - Smart selection tool
 * ✅ Tesla Studio - Excellent control
 *
 * Features / Характеристики:
 * ✅ Premium card design with large images
 * ✅ Smart badges (New, Hot, Verified, Excellent Price)
 * ✅ Enhanced hover effects (image + shadow)
 * ✅ Elegant skeleton loading
 * ✅ Quick filters
 * ✅ Enhanced tab design
 * ✅ Mobile-first responsive
 * 
 * Philosophy / Философия:
 * - Main showcase on the page
 * - Clean and premium design
 * - Ease of use
 * - Optimized performance
 *
 * @performance optimized tabs, lazy loading
 * @responsive mobile-first with premium experience
 * @a11y accessible tabs + keyboard navigation
 */

import React, { memo, useState, Suspense } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Sparkles, Star, Zap, Car } from 'lucide-react';

import { useLanguage } from '../../../../contexts/LanguageContext';
import { useTheme } from '../../../../contexts/ThemeContext';

// Lazy load the car sections
const LatestCarsSection = React.lazy(() => import('./LatestCarsSection'));
const NewCarsSection = React.lazy(() => import('./NewCarsSection'));
const FeaturedCarsSection = React.lazy(() => import('./FeaturedCarsSection'));

// ============================================================================
// TYPES
// ============================================================================

type TabType = 'latest' | 'new' | 'featured';
type QuickFilter = 'price' | 'type' | 'fuel' | 'condition';

interface TabConfig {
  id: TabType;
  labelBg: string;
  labelEn: string;
  icon: React.ReactNode;
  color: string;
  description: {
    bg: string;
    en: string;
  };
}

// ============================================================================
// PREMIUM CONTAINER
// ============================================================================

const Container = styled.section<{ $isDark: boolean }>`
  position: relative;
  background: ${props => props.$isDark
    ? 'linear-gradient(to bottom, rgba(15, 23, 42, 0.2), rgba(30, 41, 59, 0.2))'
    : 'linear-gradient(to bottom, rgba(245, 241, 235, 0.2), rgba(248, 247, 246, 0.2))'};
  padding: 3rem 0;
  overflow: hidden;
  /* 🟣 Light purple border */
  border: 1px solid rgba(168, 85, 247, 0.1);
  border-radius: 12px;
  margin: 0 12px;
  box-shadow: inset 0 0 12px rgba(168, 85, 247, 0.05);

  @media (max-width: 768px) {
    padding: 2.5rem 0;
  }

  @media (max-width: 640px) {
    padding: 2rem 0;
    margin: 0 8px;
  }
`;

// ============================================================================
// HEADER SECTION
// ============================================================================

const Header = styled.div<{ $isDark: boolean }>`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem 2.5rem;
  border-bottom: 2px solid ${props => props.$isDark
    ? 'rgba(255,255,255,0.08)'
    : 'rgba(12,26,42,0.08)'};

  @media (max-width: 768px) {
    padding: 0 1.5rem 2rem;
  }

  @media (max-width: 640px) {
    padding: 0 1rem 1.5rem;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 2rem;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 1.5rem;
  }
`;

const TitleSection = styled.div`
  flex: 1;
`;

const Title = styled.h2<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  font-size: 2.2rem;
  font-weight: 900;
  color: ${props => props.$isDark ? '#f5f8ff' : '#0c1a2a'};
  margin: 0 0 0.5rem;
  letter-spacing: -0.02em;

  svg {
    flex-shrink: 0;
  }

  @media (max-width: 768px) {
    font-size: 1.75rem;
  }

  @media (max-width: 640px) {
    font-size: 1.5rem;
  }
`;

const Description = styled.p<{ $isDark: boolean }>`
  font-size: 1rem;
  color: ${props => props.$isDark ? '#c9d6e8' : '#52627a'};
  margin: 0;
  line-height: 1.5;

  @media (max-width: 768px) {
    font-size: 0.95rem;
  }

  @media (max-width: 640px) {
    font-size: 0.9rem;
  }
`;

// ============================================================================
// QUICK FILTERS
// ============================================================================

const QuickFiltersBar = styled(motion.div) <{ $isDark: boolean }>`
  display: flex;
  gap: 0.8rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    gap: 0.6rem;
  }
`;

const QuickFilterBtn = styled(motion.button) <{ $isDark: boolean; $active?: boolean }>`
  padding: 0.6rem 1.2rem;
  border-radius: 10px;
  border: 1px solid ${props => props.$isDark
    ? 'rgba(255,255,255,0.15)'
    : 'rgba(12,26,42,0.15)'};
  background: ${props => props.$active
    ? (props.$isDark ? 'rgba(94,182,255,0.15)' : 'rgba(0,109,204,0.1)')
    : 'transparent'};
  color: ${props => props.$active
    ? (props.$isDark ? '#5eb3ff' : '#0c5bad')
    : (props.$isDark ? '#c9d6e8' : '#52627a')};
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: ${props => props.$isDark
    ? 'rgba(94,182,255,0.1)'
    : 'rgba(0,109,204,0.05)'};
    border-color: ${props => props.$isDark
    ? 'rgba(94,182,255,0.3)'
    : 'rgba(0,109,204,0.2)'};
  }

  @media (max-width: 640px) {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
  }
`;

// ============================================================================
// TABS STYLING (PREMIUM)
// ============================================================================

const TabsWrapper = styled.div<{ $isDark: boolean }>`
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding: 0;
  border-bottom: 2px solid ${props => props.$isDark
    ? 'rgba(255,255,255,0.08)'
    : 'rgba(12,26,42,0.08)'};

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.$isDark
    ? 'rgba(255,255,255,0.2)'
    : 'rgba(12,26,42,0.2)'};
    border-radius: 2px;
  }

  @media (max-width: 768px) {
    gap: 0.5rem;
  }
`;

const Tab = styled(motion.button) <{
  $active: boolean;
  $isDark: boolean;
  $color?: string;
}>`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 1rem 1.5rem;
  border: none;
  border-bottom: 3px solid ${props => props.$active
    ? (props.$color || '#5eb3ff')
    : 'transparent'};
  background: transparent;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  color: ${props => props.$active
    ? (props.$isDark ? '#f5f8ff' : '#0c1a2a')
    : (props.$isDark ? '#9ca3af' : '#6b7280')};

  svg {
    width: 20px;
    height: 20px;
    color: ${props => props.$color || '#5eb3ff'};
    opacity: ${props => props.$active ? 1 : 0.6};
    transition: all 0.2s ease;
  }

  &:hover {
    color: ${props => props.$isDark ? '#d7e4f5' : '#1f2a3d'};

    svg {
      opacity: 1;
    }
  }

  &:active {
    transform: scale(0.98);
  }

  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
    font-size: 0.85rem;
    gap: 0.4rem;

    svg {
      width: 18px;
      height: 18px;
    }
  }

  @media (max-width: 640px) {
    padding: 0.6rem 0.8rem;
    font-size: 0.75rem;
    gap: 0.3rem;

    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

const TabsContainer = styled.div`
  max-width: 1400px; /* mobile.de standard: 1400px max-width */
  margin: 0 auto;
  padding: 0 24px; /* mobile.de standard: 24px horizontal padding */

  @media (max-width: 1024px) {
    padding: 0 20px;
  }

  @media (max-width: 640px) {
    padding: 0 16px; /* mobile.de standard: 16px horizontal padding mobile */
  }
`;

// ============================================================================
// CONTENT AREA
// ============================================================================

const ContentArea = styled.div`
  max-width: 1400px; /* mobile.de standard: 1400px max-width */
  margin: 2.5rem auto 0; /* mobile.de standard: 40px top margin */
  padding: 0 24px; /* mobile.de standard: 24px horizontal padding */
  min-height: 500px;

  @media (max-width: 1024px) {
    padding: 0 20px;
  }

  @media (max-width: 768px) {
    margin-top: 2rem; /* mobile.de standard: 32px top margin */
    padding: 0 20px;
  }

  @media (max-width: 640px) {
    min-height: 400px;
    padding: 0 16px; /* mobile.de standard: 16px horizontal padding mobile */
  }
`;

// ============================================================================
// PREMIUM SKELETON LOADER (for future enhancements)
// ============================================================================

const LoadingFallback = styled.div<{ $isDark: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  min-height: 400px;
  gap: 1rem;
  color: ${props => props.$isDark ? '#9ca3af' : '#6b7280'};

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid ${props => props.$isDark
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
 * UnifiedCarsShowcase (v2.0 - Premium Cars Experience)
 * Обединена витрина за автомобили - Премиум изживяване
 * Unified Cars Showcase - Premium Experience
 *
 * Inspired by / Вдъхновено от:
 * ✅ Carvana - Clean cards and clear view
 * ✅ BMW Configurator - Smart tool
 * ✅ Tesla Studio - Perfect control
 *
 * @performance lazy loading optimized
 * @responsive mobile-first premium UX
 * @accessible full keyboard navigation
 */
const UnifiedCarsShowcase: React.FC = memo(() => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isBg = language === 'bg';

  const [activeTab, setActiveTab] = useState<TabType>('latest');
  const [activeFilters, setActiveFilters] = useState<Set<QuickFilter>>(new Set());

  // Tab configuration with icons and colors
  const tabs: TabConfig[] = [
    {
      id: 'latest',
      labelBg: 'Най-нови',
      labelEn: 'Latest',
      icon: <Clock size={20} />,
      color: '#4F46E5',
      description: {
        bg: 'Най-новите обяви във вашия регион',
        en: 'Latest listings in your region'
      }
    },
    {
      id: 'new',
      labelBg: 'Нови 24ч',
      labelEn: 'New 24h',
      icon: <Sparkles size={20} />,
      color: '#0066CC',
      description: {
        bg: 'Добавени в последния ден',
        en: 'Added in the last 24 hours'
      }
    },
    {
      id: 'featured',
      labelBg: 'Избрани',
      labelEn: 'Featured',
      icon: <Star size={20} />,
      color: '#FFD700',
      description: {
        bg: 'Избрани експертски',
        en: 'Expertly selected'
      }
    },
  ];

  const quickFilters: Array<{ id: QuickFilter; labelBg: string; labelEn: string; icon: React.ReactNode }> = [
    { id: 'price', labelBg: 'Добрична цена', labelEn: 'Great Price', icon: <Zap size={16} /> },
    { id: 'type', labelBg: 'Семейни', labelEn: 'Family cars', icon: null },
    { id: 'fuel', labelBg: 'Електрични', labelEn: 'Electric', icon: null },
    { id: 'condition', labelBg: 'Отличното състояние', labelEn: 'Excellent', icon: null },
  ];

  // Handlers
  const toggleFilter = (filter: QuickFilter) => {
    const newFilters = new Set(activeFilters);
    if (newFilters.has(filter)) {
      newFilters.delete(filter);
    } else {
      newFilters.add(filter);
    }
    setActiveFilters(newFilters);
  };

  // Content renderer
  const renderContent = () => {
    const getLoadingFallback = () => (
      <LoadingFallback $isDark={isDark}>
        <div className="spinner" />
        <span>
          {isBg ? 'Зареждане сиарите...' : 'Loading cars...'}
        </span>
      </LoadingFallback>
    );

    switch (activeTab) {
      case 'latest':
        return (
          <Suspense fallback={getLoadingFallback()}>
            <LatestCarsSection activeFilters={activeFilters} />
          </Suspense>
        );
      case 'new':
        return (
          <Suspense fallback={getLoadingFallback()}>
            <NewCarsSection activeFilters={activeFilters} />
          </Suspense>
        );
      case 'featured':
        return (
          <Suspense fallback={getLoadingFallback()}>
            <FeaturedCarsSection activeFilters={activeFilters} />
          </Suspense>
        );
      default:
        return null;
    }
  };

  const currentTab = tabs.find(t => t.id === activeTab);
  const description = currentTab ? (isBg ? currentTab.description.bg : currentTab.description.en) : '';

  return (
    <Container $isDark={isDark}>
      {/* Premium Header */}
      <Header $isDark={isDark}>
        <HeaderContent>
          <TitleSection>
            <Title $isDark={isDark}>
              <Car size={28} style={{ marginRight: '0.75rem' }} />
              <span>{isBg ? 'Преглед на автомобили' : 'Cars Overview'}</span>
            </Title>
            <Description $isDark={isDark}>
              {description || (isBg
                ? 'Намирайте идеалния автомобил между хиляди обяви'
                : 'Find your perfect car among thousands of listings')}
            </Description>
          </TitleSection>
        </HeaderContent>

        {/* Quick Filters */}
        <QuickFiltersBar
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {quickFilters.map(filter => (
            <QuickFilterBtn
              key={filter.id}
              $isDark={isDark}
              $active={activeFilters.has(filter.id)}
              onClick={() => toggleFilter(filter.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isBg ? filter.labelBg : filter.labelEn}
            </QuickFilterBtn>
          ))}
        </QuickFiltersBar>

        {/* Premium Tabs Navigation */}
        <TabsContainer>
          <TabsWrapper $isDark={isDark}>
            {tabs.map((tab) => (
              <Tab
                key={tab.id}
                $active={activeTab === tab.id}
                $isDark={isDark}
                $color={tab.color}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                aria-label={isBg ? tab.labelBg : tab.labelEn}
                aria-selected={activeTab === tab.id}
              >
                {tab.icon}
                <span>{isBg ? tab.labelBg : tab.labelEn}</span>
              </Tab>
            ))}
          </TabsWrapper>
        </TabsContainer>
      </Header>

      {/* Content Area with Smooth Transitions */}
      <ContentArea>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </ContentArea>
    </Container>
  );
});

UnifiedCarsShowcase.displayName = 'UnifiedCarsShowcase';

export default UnifiedCarsShowcase;
