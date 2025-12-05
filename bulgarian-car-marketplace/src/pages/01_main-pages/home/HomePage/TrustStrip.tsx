// TrustStrip.tsx
// Lightweight trust & marketplace pulse strip displayed near top of homepage
// Shows key marketplace statistics to build confidence and conversion.

import React, { memo } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../../../contexts/LanguageContext';

// Styled components kept minimal (<300 lines total file) as per governance
const StripContainer = styled.section`
  width: 100%;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  box-shadow: var(--shadow-sm);

  @media (max-width: 768px) {
    gap: 16px;
    padding: 12px 16px;
  }
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 120px;
`;

const StatValue = styled.span`
  font-size: 1.25rem;
  font-weight: 600;
  font-family: 'Martica', 'Arial', sans-serif;
  color: var(--text-primary);
`;

const StatLabel = styled.span`
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
`;

const Actions = styled.div`
  margin-left: auto;
  display: flex;
  gap: 12px;
  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }
`;

const ActionButton = styled.button`
  background: var(--accent-primary);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 0.875rem;
  cursor: pointer;
  font-family: 'Martica', 'Arial', sans-serif;
  transition: background 0.15s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: var(--accent-primary-hover);
  }

  &:active {
    background: var(--accent-primary-active);
  }
`;

interface TrustStripProps {
  activeListings?: number;
  verifiedSellers?: number;
  successfulDeals?: number;
  lastUpdatedMinutesAgo?: number;
}

const TrustStrip: React.FC<TrustStripProps> = memo(({ 
  activeListings = 15234,
  verifiedSellers = 874,
  successfulDeals = 312,
  lastUpdatedMinutesAgo = 5
}) => {
  const { t } = useLanguage();

  // TODO(analytics): fire 'home_truststrip_view' when component becomes visible (IntersectionObserver)
  // TODO(analytics): track clicks on browse and sell buttons ('home_truststrip_cta_browse', 'home_truststrip_cta_sell')

  return (
    <StripContainer aria-label={t('home.trustStrip.marketplacePulse')}>
      <StatItem>
        <StatValue>{activeListings.toLocaleString()}</StatValue>
        <StatLabel>{t('home.trustStrip.activeListings')}</StatLabel>
      </StatItem>
      <StatItem>
        <StatValue>{verifiedSellers.toLocaleString()}</StatValue>
        <StatLabel>{t('home.trustStrip.verifiedSellers')}</StatLabel>
      </StatItem>
      <StatItem>
        <StatValue>{successfulDeals.toLocaleString()}</StatValue>
        <StatLabel>{t('home.trustStrip.successfulDeals')}</StatLabel>
      </StatItem>
      <StatItem>
        <StatValue>~{lastUpdatedMinutesAgo}m</StatValue>
        <StatLabel>{t('home.trustStrip.updated')}</StatLabel>
      </StatItem>

      <Actions>
        <ActionButton type="button" data-cta="browse">
          {t('home.trustStrip.ctaBrowse')}
        </ActionButton>
        <ActionButton type="button" data-cta="sell">
          {t('home.trustStrip.ctaSell')}
        </ActionButton>
      </Actions>
    </StripContainer>
  );
});

export default TrustStrip;
