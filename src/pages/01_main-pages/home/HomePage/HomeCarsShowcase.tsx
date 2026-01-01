/**
 * HomeCarsShowcase.tsx
 * Витрина за автомобили - HomePage Cars Showcase
 * 
 * Unified component displaying cars in different forms / Обединен компонент показващ автомобили в различни форми
 * - Tabs to switch between (Latest - Featured - New) / Раздели за превключване между (Последни - Препоръчани - Нови)
 * - Uses ModernCarCard and GridSectionWrapper / Използва ModernCarCard и GridSectionWrapper
 * 
 * @benefit Unifies 3 separate components: LatestCarsSection, FeaturedCarsSection, NewCarsSection
 * @visual Unified experience with tabs for switching / Единно изживяване с раздели за превключване
 */

import React, { useState, memo } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../../../contexts/LanguageContext';
import GridSectionWrapper from './GridSectionWrapper';

// Lazy imports for better performance
const LatestCarsSection = React.lazy(() => import('./LatestCarsSection'));
const FeaturedCarsSection = React.lazy(() => import('./FeaturedCarsSection'));
const NewCarsSection = React.lazy(() => import('./NewCarsSection'));

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const ShowcaseContainer = styled.section`
  width: 100%;
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  overflow-x: auto;
  padding: 0 1rem;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;

  /* Scrollbar styling */
  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: var(--bg-card);
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--border-primary);
    border-radius: 10px;

    &:hover {
      background: var(--border-secondary);
    }
  }

  @media (max-width: 768px) {
    padding: 0 0.75rem;
    gap: 0.75rem;
  }
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 0.75rem 1.5rem;
  border: 2px solid transparent;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  background: ${props => props.$active 
    ? 'var(--accent-orange)'
    : 'var(--bg-card)'};
  color: ${props => props.$active
    ? 'white'
    : 'var(--text-secondary)'};
  border-color: ${props => props.$active
    ? 'var(--accent-orange)'
    : 'var(--border-primary)'};

  &:hover {
    border-color: var(--accent-orange);
    background: ${props => props.$active
      ? 'var(--accent-orange)'
      : 'var(--bg-secondary)'};
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    padding: 0.65rem 1.25rem;
    font-size: 0.95rem;
  }
`;

const ContentWrapper = styled.div`
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const LoadingFallback = styled.div`
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  background: var(--bg-card);
  border-radius: 8px;
  margin: 20px;
  border: 1px solid var(--border-primary);
`;

// ============================================================================
// TYPES
// ============================================================================

type TabType = 'latest' | 'featured' | 'new';

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * HomeCarsShowcase
 * Витрина за автомобили - Cars Showcase
 * 
 * Displays cars in 3 forms / Показва автомобили в 3 форми:
 * 1. Latest / Последни - Very recent additions
 * 2. Featured / Препоръчани - Special selection from dealer
 * 3. New / Нови - New cars from dealerships
 * 
 * Benefits / Ползи:
 * - Unified interface with tabs / Обединен интерфейс с раздели
 * - Better performance with lazy loading / По-добра производителност с мързеливо зареждане
 * - Simple local state management / Просто локално управление на състоянието
 * - Reduced number of components in main file / Намален брой компоненти в главния файл
 */
const HomeCarsShowcase: React.FC = memo(() => {
  const [activeTab, setActiveTab] = useState<TabType>('latest');
  const { t } = useLanguage();

  const tabs: { id: TabType; label: string }[] = [
    { id: 'latest', label: t('cars.latest', 'Latest Cars') },
    { id: 'featured', label: t('cars.featured', 'Featured Cars') },
    { id: 'new', label: t('cars.new', 'New Cars') },
  ];

  const renderContent = () => {
    const contentProps = {
      fallback: <LoadingFallback>{t('common.loading')}</LoadingFallback>,
    };

    switch (activeTab) {
      case 'latest':
        return (
          <React.Suspense fallback={contentProps.fallback}>
            <GridSectionWrapper intensity="medium" variant="modern">
              <LatestCarsSection />
            </GridSectionWrapper>
          </React.Suspense>
        );
      case 'featured':
        return (
          <React.Suspense fallback={contentProps.fallback}>
            <GridSectionWrapper intensity="strong" variant="future">
              <FeaturedCarsSection />
            </GridSectionWrapper>
          </React.Suspense>
        );
      case 'new':
        return (
          <React.Suspense fallback={contentProps.fallback}>
            <GridSectionWrapper intensity="medium" variant="modern">
              <NewCarsSection />
            </GridSectionWrapper>
          </React.Suspense>
        );
      default:
        return null;
    }
  };

  return (
    <ShowcaseContainer>
      {/* Tabs Navigation */}
      <TabsContainer>
        {tabs.map(tab => (
          <Tab
            key={tab.id}
            $active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </Tab>
        ))}
      </TabsContainer>

      {/* Content with Fade Animation */}
      <ContentWrapper>
        {renderContent()}
      </ContentWrapper>
    </ShowcaseContainer>
  );
});

HomeCarsShowcase.displayName = 'HomeCarsShowcase';

export default HomeCarsShowcase;
