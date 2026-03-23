// TrustStrip.tsx
// Lightweight trust & marketplace pulse strip displayed near top of homepage
// Shows key marketplace statistics to build confidence and conversion.

import React, { memo, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { analyticsService } from '@/services/analytics/UnifiedAnalyticsService';
import { glassPrimaryButton } from '../../../../styles/glassmorphism-buttons';
import { collection, getCountFromServer, query, where } from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';
import { SellWorkflowCollections } from '@/services/sell-workflow-collections';

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
  ${glassPrimaryButton}
  padding: 10px 16px;
  font-size: 0.875rem;
  font-family: 'Martica', 'Arial', sans-serif;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: var(--btn-primary-bg);
  }
`;

interface TrustStripProps {
  activeListings?: number;
  verifiedSellers?: number;
  successfulDeals?: number;
  lastUpdatedMinutesAgo?: number;
}

const TrustStrip: React.FC<TrustStripProps> = memo(({
  activeListings: propActiveListings,
  verifiedSellers: propVerifiedSellers,
  successfulDeals: propSuccessfulDeals,
  lastUpdatedMinutesAgo = 5
}) => {
  const { t } = useLanguage();
  const trustStripRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const [liveStats, setLiveStats] = useState({
    activeListings: propActiveListings || 0,
    verifiedSellers: propVerifiedSellers || 0,
    successfulDeals: propSuccessfulDeals || 0,
  });

  useEffect(() => {
    // Skip fetching if all props were passed from parent
    if (propActiveListings && propVerifiedSellers && propSuccessfulDeals) return;

    let isActive = true;
    const loadLiveStats = async () => {
      try {
        const vehicleCollections = SellWorkflowCollections.getAllCollections();
        let totalListings = 0;
        await Promise.all(vehicleCollections.map(async (col) => {
          try {
            const q = query(collection(db, col), where('status', '==', 'active'));
            const snap = await getCountFromServer(q);
            totalListings += snap.data().count;
          } catch { /* skip */ }
        }));

        let sellers = 0;
        try {
          const snap = await getCountFromServer(collection(db, 'users'));
          sellers = snap.data().count;
        } catch { /* skip */ }

        if (isActive) {
          setLiveStats({
            activeListings: totalListings || 0,
            verifiedSellers: sellers || 0,
            successfulDeals: propSuccessfulDeals || 0,
          });
        }
      } catch { /* silent */ }
    };
    loadLiveStats();
    return () => { isActive = false; };
  }, [propActiveListings, propVerifiedSellers, propSuccessfulDeals]);

useEffect(() => {
  // fire 'home_truststrip_view' when component becomes visible (IntersectionObserver)
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        analyticsService.trackEvent('home_truststrip_view', {});
        observer.unobserve(entries[0].target);
      }
    },
    { threshold: 0.3 }
  );

  if (trustStripRef.current) {
    observer.observe(trustStripRef.current);
  }

  return () => observer.disconnect();
}, []);

// When CTA buttons are clicked:
const handleBrowseClick = () => {
  // track 'home_truststrip_cta_browse'
  analyticsService.trackEvent('home_truststrip_cta_browse', {});
  navigate('/cars');
};

const handleSellClick = () => {
  // track 'home_truststrip_cta_sell'
  analyticsService.trackEvent('home_truststrip_cta_sell', {});
  navigate('/sell');
};

  return (
    <StripContainer aria-label={t('home.trustStrip.marketplacePulse')}>
      <StatItem>
        <StatValue>{liveStats.activeListings.toLocaleString()}</StatValue>
        <StatLabel>{t('home.trustStrip.activeListings')}</StatLabel>
      </StatItem>
      <StatItem>
        <StatValue>{liveStats.verifiedSellers.toLocaleString()}</StatValue>
        <StatLabel>{t('home.trustStrip.verifiedSellers')}</StatLabel>
      </StatItem>
      <StatItem>
        <StatValue>{liveStats.successfulDeals.toLocaleString()}</StatValue>
        <StatLabel>{t('home.trustStrip.successfulDeals')}</StatLabel>
      </StatItem>
      <StatItem>
        <StatValue>~{lastUpdatedMinutesAgo}m</StatValue>
        <StatLabel>{t('home.trustStrip.updated')}</StatLabel>
      </StatItem>

      <Actions>
        <ActionButton type="button" data-cta="browse" onClick={handleBrowseClick}>
          {t('home.trustStrip.ctaBrowse')}
        </ActionButton>
        <ActionButton type="button" data-cta="sell" onClick={handleSellClick}>
          {t('home.trustStrip.ctaSell')}
        </ActionButton>
      </Actions>
    </StripContainer>
  );
});

export default TrustStrip;
