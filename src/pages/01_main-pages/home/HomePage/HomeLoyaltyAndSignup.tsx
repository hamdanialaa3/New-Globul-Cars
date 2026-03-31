/**
 * HomeLoyaltyAndSignup.tsx
 * 
 * Loyalty Banner Component / Компонент за банер за лоялност
 * Renders:
 * - LoyaltyBanner (rewards program)
 * 
 * NOTE: SubscriptionBanner was removed — subscription pricing is handled
 * exclusively by PricingSlotWrapper in the pricing_plans slot of HomePageComposer.
 * 
 * @placement Right before Footer / Точно преди Footer
 */

import React, { Suspense, memo } from 'react';
// eslint-disable-next-line import/no-named-as-default
import styled from 'styled-components';

import { useLanguage } from '@/contexts/LanguageContext';

// Lazy imports
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
 * Лоялност - Loyalty
 * 
 * Displays Loyalty rewards banner.
 * Subscription pricing is handled by PricingSlotWrapper in HomePageComposer.
 */
const HomeLoyaltyAndSignup: React.FC = memo(() => {
  const { t } = useLanguage();
  return (
    <BannersContainer>
      {/* Loyalty Banner - Rewards Program */}
      <Suspense fallback={<LoadingFallback>{t('common.loading')}</LoadingFallback>}>
        <LoyaltyBanner />
      </Suspense>
    </BannersContainer>
  );
});

HomeLoyaltyAndSignup.displayName = 'HomeLoyaltyAndSignup';

export default HomeLoyaltyAndSignup;
