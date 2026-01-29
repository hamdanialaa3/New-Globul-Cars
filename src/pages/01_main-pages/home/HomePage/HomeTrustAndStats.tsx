/**
 * HomeTrustAndStats.tsx
 * Компонент за доверие и статистика - Trust and Statistics Component
 * 
 * Unified component for trust and statistics / Обединен компонент за доверие и статистика
 * Combines / Комбинира:
 * - DemandStats
 * - StatsSection
 * - TrustSection
 * - TrustStrip
 * - TrustIndicators
 * 
 * @benefit توحيد 5 مكونات في واحد
 * @visual أرقام موثوقة وعناصر ثقة
 */

import React, { Suspense, memo } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../../../contexts/LanguageContext';
import GridSectionWrapper from './GridSectionWrapper';

// Lazy imports
const DemandStats = React.lazy(() => import('./DemandStats'));
const TrustSection = React.lazy(() => import('./TrustSection'));

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const TrustContainer = styled.section`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;

  @media (max-width: 768px) {
    gap: 2rem;
  }
`;

const StatsWrapper = styled.div`
  width: 100%;
`;

const TrustWrapper = styled.div`
  width: 100%;
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
 * HomeTrustAndStats
 * 
 * يعرض اثنين من أهم الأقسام:
 * 1. الإحصائيات (Stats) - أرقام موثوقة
 * 2. الثقة (Trust) - عناصر الأمان والموثوقية
 * 
 * الفوائد:
 * - تقوية الثقة عند الزوار الجدد
 * - إحصائيات واقعية
 * - واجهة موحدة
 * - lazy loading للأداء
 */
const HomeTrustAndStats: React.FC = memo(() => {
  const { t } = useLanguage();
  
  return (
    <TrustContainer>
      {/* 1. Demand Statistics - Trust Building Numbers */}
      <StatsWrapper>
        <GridSectionWrapper intensity="light" variant="modern">
          <Suspense fallback={<LoadingFallback>{t('common.loading')}</LoadingFallback>}>
            <DemandStats />
          </Suspense>
        </GridSectionWrapper>
      </StatsWrapper>

      {/* 2. Trust Elements - Safety & Security */}
      <TrustWrapper>
        <GridSectionWrapper intensity="light" variant="modern">
          <Suspense fallback={<LoadingFallback>{t('common.loading')}</LoadingFallback>}>
            <TrustSection />
          </Suspense>
        </GridSectionWrapper>
      </TrustWrapper>
    </TrustContainer>
  );
});

HomeTrustAndStats.displayName = 'HomeTrustAndStats';

export default HomeTrustAndStats;
