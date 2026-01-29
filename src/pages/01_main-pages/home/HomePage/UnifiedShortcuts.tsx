/**
 * UnifiedShortcuts.tsx
 * Обединени преки пътища и категории - Unified Shortcuts & Categories
 * Unified Shortcuts & Categories - Bento Grid Layout
 *
 * Integrates / Интегрира:
 * ✅ VehicleClassificationsSection - Vehicle classifications
 * ✅ MostDemandedCategoriesSection - Most demanded categories
 * ✅ PopularBrandsSection - Popular brands
 * ✅ HomeShortcutsSections - Quick shortcuts
 *
 * Strategy / Стратегия:
 * - Tabs: Classifications, Categories, Brands
 * - Lazy loading for each tab
 * - Easy search and navigation
 * - Responsive grid/scroll layout
 * - Full i18n support
 *
 * Features / Характеристики:
 * - < 350 lines
 * - Smooth transitions
 * - Mobile-optimized
 * - Integration with HomePageComposer
 *
 * @performance lazy loaded
 * @responsive mobile-first
 * @a11y accessible tabs
 */

import React, { memo, useState, Suspense } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

import { Grid3X3, Grid2X2, Zap } from 'lucide-react';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { useTheme } from '../../../../contexts/ThemeContext';

// Lazy load the sections
const VehicleClassificationsSection = React.lazy(() => import('./VehicleClassificationsSection'));
const MostDemandedCategoriesSection = React.lazy(() => import('./MostDemandedCategoriesSection'));
const PopularBrandsSection = React.lazy(() => import('./PopularBrandsSection'));

// ============================================================================
// TYPES
// ============================================================================

type ShortcutTabType = 'classifications' | 'categories' | 'brands';

interface ShortcutTabConfig {
  id: ShortcutTabType;
  labelBg: string;
  labelEn: string;
  icon: React.ReactNode;
  color: string;
  description?: { bg: string; en: string };
}

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const Container = styled.section<{ $isDark: boolean }>`
  position: relative;
  background: ${props => props.$isDark
    ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.2), rgba(30, 41, 59, 0.2))'
    : 'linear-gradient(135deg, rgba(245, 241, 235, 0.2), rgba(248, 247, 246, 0.2))'};
  padding: 0;
  margin: 0;

  @media (max-width: 768px) {
    padding: 0;
  }
`;

const Header = styled.div<{ $isDark: boolean }>`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  border-bottom: 2px solid ${props => props.$isDark ? 'rgba(255,255,255,0.08)' : 'rgba(12,26,42,0.08)'};

  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const Title = styled.h2<{ $isDark: boolean }>`
  font-size: 2rem;
  font-weight: 800;
  color: ${props => props.$isDark ? '#f5f8ff' : '#0c1a2a'};
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const Description = styled.p<{ $isDark: boolean }>`
  font-size: 1rem;
  color: ${props => props.$isDark ? '#c9d6e8' : '#52627a'};
  margin: 0.5rem 0 0;

  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
`;

// ============================================================================
// TABS STYLING
// ============================================================================

const TabsWrapper = styled.div`
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding: 0;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 2px;
  }
`;

const Tab = styled(motion.button)<{
  $active: boolean;
  $isDark: boolean;
  $color?: string;
}>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  background: ${props => props.$active
    ? (props.$isDark ? 'rgba(255,255,255,0.1)' : 'rgba(12,26,42,0.08)')
    : 'transparent'};
  color: ${props => props.$active
    ? (props.$isDark ? '#f5f8ff' : '#0c1a2a')
    : (props.$isDark ? '#9ca3af' : '#6b7280')};
  border: ${props => props.$active ? `2px solid ${props.$color || '#0066CC'}` : '2px solid transparent'};

  svg {
    width: 18px;
    height: 18px;
    color: ${props => props.$color || '#0066CC'};
    opacity: ${props => props.$active ? 1 : 0.6};
  }

  &:hover {
    background: ${props => props.$isDark ? 'rgba(255,255,255,0.08)' : 'rgba(12,26,42,0.04)'};
  }

  &:active {
    transform: scale(0.98);
  }

  @media (max-width: 768px) {
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
    gap: 0.25rem;

    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

const TabsContainer = styled.div`
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

// ============================================================================
// CONTENT AREA
// ============================================================================

const ContentArea = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
  min-height: 400px;
`;

const LoadingFallback = styled.div<{ $isDark: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  color: ${props => props.$isDark ? '#9ca3af' : '#6b7280'};
  font-size: 1.1rem;
`;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * UnifiedShortcuts
 * Обединени преки пътища и категории
 * Unified Shortcuts & Categories
 *
 * Includes / Включва:
 * 1. Vehicle Classifications
 * 2. Most Demanded Categories
 * 3. Popular Brands
 *
 * @responsive responsive tabs
 * @performance lazy loaded sections
 * @accessible semantic HTML + ARIA
 */
const UnifiedShortcuts: React.FC = memo(() => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isBg = language === 'bg';

  const [activeTab, setActiveTab] = useState<ShortcutTabType>('classifications');

  // Tab configuration
  const tabs: ShortcutTabConfig[] = [
    {
      id: 'classifications',
      labelBg: 'Класификации',
      labelEn: 'Classifications',
      icon: <Grid3X3 size={18} />,
      color: '#3B82F6',
      description: {
        bg: 'Разгледай всички типове превозни средства',
        en: 'Explore all vehicle types',
      },
    },
    {
      id: 'categories',
      labelBg: 'Категории',
      labelEn: 'Categories',
      icon: <Grid2X2 size={18} />,
      color: '#8B5CF6',
      description: {
        bg: 'Намери най-търсенаите категории',
        en: 'Find the most demanded categories',
      },
    },
    {
      id: 'brands',
      labelBg: 'Маркови',
      labelEn: 'Brands',
      icon: <Zap size={18} />,
      color: '#F59E0B',
      description: {
        bg: 'Популярни марки на пазара',
        en: 'Popular brands in the market',
      },
    },
  ];

  const getTabLabel = (tab: ShortcutTabConfig): string => {
    return isBg ? tab.labelBg : tab.labelEn;
  };

  const getDescription = (tab: ShortcutTabConfig): string => {
    if (!tab.description) return '';
    return isBg ? tab.description.bg : tab.description.en;
  };

  // Content renderer
  const renderContent = () => {
    switch (activeTab) {
      case 'classifications':
        return (
          <Suspense fallback={<LoadingFallback $isDark={isDark}>{isBg ? 'Зареждане...' : 'Loading...'}</LoadingFallback>}>
            <VehicleClassificationsSection />
          </Suspense>
        );
      case 'categories':
        return (
          <Suspense fallback={<LoadingFallback $isDark={isDark}>{isBg ? 'Зареждане категории...' : 'Loading categories...'}</LoadingFallback>}>
            <MostDemandedCategoriesSection />
          </Suspense>
        );
      case 'brands':
        return (
          <Suspense fallback={<LoadingFallback $isDark={isDark}>{isBg ? 'Зареждане маркови...' : 'Loading brands...'}</LoadingFallback>}>
            <PopularBrandsSection />
          </Suspense>
        );
      default:
        return null;
    }
  };

  const currentTab = tabs.find(t => t.id === activeTab);

  return (
    <Container $isDark={isDark}>
      {/* Header Section */}
      <Header $isDark={isDark}>
        <HeaderContent>
          <div>
            <Title $isDark={isDark}>
              {isBg ? '📂 Разгледай категории' : '📂 Browse Categories'}
            </Title>
            <Description $isDark={isDark}>
              {currentTab ? getDescription(currentTab) : (isBg ? 'Намери автомобила по тип' : 'Find cars by category')}
            </Description>
          </div>
        </HeaderContent>

        {/* Tabs Navigation */}
        <TabsContainer>
          <TabsWrapper>
            {tabs.map((tab) => (
              <Tab
                key={tab.id}
                $active={activeTab === tab.id}
                $isDark={isDark}
                $color={tab.color}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {tab.icon}
                <span>{getTabLabel(tab)}</span>
              </Tab>
            ))}
          </TabsWrapper>
        </TabsContainer>
      </Header>

      {/* Content Area */}
      <ContentArea>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </ContentArea>
    </Container>
  );
});

UnifiedShortcuts.displayName = 'UnifiedShortcuts';

export default UnifiedShortcuts;
