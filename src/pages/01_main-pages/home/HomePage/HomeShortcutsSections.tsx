/**
 * HomeShortcutsSections.tsx
 * Секции за преки пътища на началната страница
 * HomePage Shortcuts Sections - Unified Component
 * 
 * Unified component for shortcuts, brands, and categories / Обединен компонент за преки пътища, марки и категории
 * Combines / Комбинира:
 * - PopularBrandsSection
 * - QuickBrandsSection  
 * - VehicleClassificationsSection
 * - MostDemandedCategoriesSection
 * - CategoriesSection
 * 
 * @benefit Unifies 5 separate components / Обединява 5 отделни компонента
 * @visual Single design family / Единно семейство дизайн
 */

import React, { Suspense, memo } from 'react';
// eslint-disable-next-line import/no-named-as-default
import styled from 'styled-components';

import { useLanguage } from '../../../../contexts/LanguageContext';

import { GridSectionWrapper } from './GridSectionWrapper';

// Lazy imports
const PopularBrandsSection = React.lazy(() => import('./PopularBrandsSection'));
const VehicleClassificationsSection = React.lazy(() => import('./VehicleClassificationsSection'));
const MostDemandedCategoriesSection = React.lazy(() => import('./MostDemandedCategoriesSection'));

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const ShortcutsContainer = styled.section`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem;

  @media (max-width: 768px) {
    gap: 1.5rem;
  }
`;

const LoadingFallback = styled.div`
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  background: var(--bg-card);
  border-radius: 8px;
  border: 1px solid var(--border-primary);
`;

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * HomeShortcutsSections
 * Секции за преки пътища - HomePage Shortcuts Sections
 * 
 * Displays 3 sections harmoniously / Показва 3 секции хармонично:
 * 1. Popular Brands / Популярни марки
 * 2. Vehicle Classifications / Класификации на превозни средства
 * 3. Most Demanded Categories / Най-търсени категории
 * 
 * Benefits / Ползи:
 * - Unified interface / Обединен интерфейс
 * - Reduced number of components / Намален брой компоненти
 * - Centralized spacing management / Централизирано управление на разстоянията
 * - Optimized lazy loading / Оптимизирано мързеливо зареждане
 */
const HomeShortcutsSections: React.FC = memo(() => {
  const { t } = useLanguage();
  return (
    <ShortcutsContainer>
      {/* 1. Popular Brands - Heritage & Future */}
      <GridSectionWrapper intensity="strong" variant="vintage">
        <Suspense fallback={<LoadingFallback>{t('common.loading')}</LoadingFallback>}>
          <PopularBrandsSection />
        </Suspense>
      </GridSectionWrapper>

      {/* 2. Vehicle Classifications - Modern & Organized */}
      <GridSectionWrapper intensity="light" variant="modern">
        <Suspense fallback={<LoadingFallback>{t('common.loading')}</LoadingFallback>}>
          <VehicleClassificationsSection />
        </Suspense>
      </GridSectionWrapper>

      {/* 3. Most Demanded Categories - Popular Choice */}
      <GridSectionWrapper intensity="medium" variant="modern">
        <Suspense fallback={<LoadingFallback>{t('common.loading')}</LoadingFallback>}>
          <MostDemandedCategoriesSection />
        </Suspense>
      </GridSectionWrapper>
    </ShortcutsContainer>
  );
});

HomeShortcutsSections.displayName = 'HomeShortcutsSections';

export default HomeShortcutsSections;
