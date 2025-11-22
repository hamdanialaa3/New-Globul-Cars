// DealerSpotlight.tsx
// Highlights top verified dealers with mock data (placeholder for future dynamic fetch)

import React, { memo } from 'react';
import styled from 'styled-components';
import { useLanguage } from '@globul-cars/coreLanguageContext';

interface DealerInfo {
  id: string;
  name: string;
  rating: number;
  listings: number;
  verified: boolean;
}

// TODO(data): Replace with real fetch (Firebase / Functions) once API ready
const MOCK_DEALERS: DealerInfo[] = [
  { id: 'd1', name: 'AutoPrime Sofia', rating: 4.9, listings: 124, verified: true },
  { id: 'd2', name: 'Varna Premium Cars', rating: 4.8, listings: 87, verified: true },
  { id: 'd3', name: 'Plovdiv Auto Hub', rating: 4.7, listings: 65, verified: true }
];

const SectionContainer = styled.section`
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px 24px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Header = styled.div`
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
`;

const Title = styled.h2`
  font-size: 1.125rem;
  margin: 0;
  font-family: 'Martica', 'Arial', sans-serif;
  color: var(--text-primary);
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
`;

const DealerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
`;

const DealerCard = styled.div`
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
`;

const DealerName = styled.span`
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text-primary);
`;

const DealerMeta = styled.span`
  font-size: 0.75rem;
  color: var(--text-secondary);
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const VerifiedBadge = styled.span`
  background: var(--accent-success);
  color: #fff;
  font-size: 0.625rem;
  padding: 3px 6px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
`;

const ViewAllLink = styled.button`
  align-self: flex-start;
  background: none;
  border: none;
  color: var(--accent-primary);
  font-size: 0.75rem;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
`;

const DealerSpotlight: React.FC = memo(() => {
  const { t } = useLanguage();

  // TODO(analytics): Fire 'home_dealerspotlight_view' when visible
  // TODO(analytics): Track 'home_dealerspotlight_click_dealer' with dealer id
  // TODO(analytics): Track 'home_dealerspotlight_view_all'

  return (
    <SectionContainer aria-label={t('home.dealerSpotlight.title')}>
      <Header>
        <Title>{t('home.dealerSpotlight.title')}</Title>
        <Subtitle>{t('home.dealerSpotlight.subtitle')}</Subtitle>
      </Header>
      <DealerGrid>
        {MOCK_DEALERS.map(d => (
          <DealerCard key={d.id} data-dealer-id={d.id}>
            <DealerName>{d.name}</DealerName>
            <DealerMeta>
              <span>{t('home.dealerSpotlight.rating')}: {d.rating.toFixed(1)}</span>
              <span>{t('home.dealerSpotlight.listings')}: {d.listings}</span>
              {d.verified && <VerifiedBadge>{t('home.dealerSpotlight.verified')}</VerifiedBadge>}
            </DealerMeta>
          </DealerCard>
        ))}
      </DealerGrid>
      <ViewAllLink type="button">{t('home.dealerSpotlight.viewAll')}</ViewAllLink>
    </SectionContainer>
  );
});

export default DealerSpotlight;
