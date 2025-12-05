// LifeMomentsBrowse.tsx
// Presents lifestyle-oriented entry points to car discovery

import React, { memo } from 'react';
import styled from 'styled-components';
import { useLanguage } from '@globul-cars/coreLanguageContext';

interface LifeMomentItem {
  key: string;
  icon?: string; // Placeholder for future icon integration
}

const MOMENTS: LifeMomentItem[] = [
  { key: 'family' },
  { key: 'work' },
  { key: 'adventure' },
  { key: 'eco' },
  { key: 'city' },
  { key: 'luxury' }
];

const Section = styled.section`
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px 24px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.125rem;
  font-family: 'Martica', 'Arial', sans-serif;
  color: var(--text-primary);
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
`;

const MomentsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 14px;
`;

const MomentCard = styled.button`
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  padding: 14px 12px;
  border-radius: 10px;
  text-align: left;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-family: 'Martica', 'Arial', sans-serif;
  transition: background 0.15s ease, border-color 0.15s ease;

  &:hover {
    background: var(--bg-tertiary);
    border-color: var(--accent-primary);
  }
`;

const MomentLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
`;

const MomentTitle = styled.span`
  font-size: 0.9rem;
  color: var(--text-primary);
  font-weight: 600;
`;

const LifeMomentsBrowse: React.FC = memo(() => {
  const { t } = useLanguage();

  // TODO(analytics): Fire 'home_lifemoments_view' once visible
  // TODO(analytics): Track 'home_lifemoments_click' with moment key

  return (
    <Section aria-label={t('home.lifeMomentsBrowse.title')}>
      <Header>
        <Title>{t('home.lifeMomentsBrowse.title')}</Title>
        <Subtitle>{t('home.lifeMomentsBrowse.subtitle')}</Subtitle>
      </Header>
      <MomentsGrid>
        {MOMENTS.map(m => (
          <MomentCard key={m.key} data-moment={m.key}>
            <MomentLabel>{t('home.lifeMomentsBrowse.title')}</MomentLabel>
            <MomentTitle>{t(`home.lifeMomentsBrowse.moments.${m.key}.title`)}</MomentTitle>
          </MomentCard>
        ))}
      </MomentsGrid>
    </Section>
  );
});

export default LifeMomentsBrowse;
