/**
 * HomeLoyaltyAndSignup.tsx
 * 
 * Unified Banners Component / Обединен компонент за банери
 * Combines / Комбинира:
 * - SubscriptionBanner
 * - LoyaltyBanner
 * 
 * @benefit Unifies 2 separate banners / Обединява 2 отделни банера
 * @placement Right before Footer / Точно преди Footer
 */

import React, { Suspense, memo } from 'react';
// eslint-disable-next-line import/no-named-as-default
import styled from 'styled-components';

import { useLanguage } from '@/contexts/LanguageContext';

// Lazy imports
const SubscriptionBanner = React.lazy(() => import('./SubscriptionBanner'));
const LoyaltyBanner = React.lazy(() => import('./LoyaltyBanner'));

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const BannersContainer = styled.section`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem 1rem;

  @media (max-width: 768px) {
    gap: 1rem;
    padding: 1.5rem 0.75rem;
  }
`;

const LoadingFallback = styled.div`
  height: 180px;
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
 * HomeLoyaltyAndSignup
 * Лоялност и регистрация - Loyalty and Signup
 * 
 * Displays CTA (Call To Action) banners / Показва банери за призив към действие:
 * 1. Subscription - Paid plan / Абонамент - Платен план
 * 2. Loyalty - Rewards program / Лоялност - Програма за награди
 * 
 * Benefits / Ползи:
 * - Unified interface for invitations / Обединен интерфейс за покани
 * - Appears at page end (best performance) / Показва се в края на страницата (най-добра производителност)
 * - Lazy loading for performance / Мързеливо зареждане за производителност
 * - إجمالي ارتفاع قليل جداً
 */
const HomeLoyaltyAndSignup: React.FC = memo(() => {
  const { t } = useLanguage();
  return (
    <BannersContainer>
      {/* 1. Subscription Banner - Premium Plans */}
      <Suspense fallback={<LoadingFallback>{t('common.loading')}</LoadingFallback>}>
        <SubscriptionBanner />
      </Suspense>

      {/* 2. Loyalty Banner - Rewards Program */}
      <Suspense fallback={<LoadingFallback>{t('common.loading')}</LoadingFallback>}>
        <LoyaltyBanner />
      </Suspense>
    </BannersContainer>
  );
});

HomeLoyaltyAndSignup.displayName = 'HomeLoyaltyAndSignup';

export default HomeLoyaltyAndSignup;
